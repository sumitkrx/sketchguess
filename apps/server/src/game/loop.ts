import {clearTimeout} from "node:timers";
import {pickRandomWords} from "@/game/words";
import {broadcast, sendToPlayer} from "@/ws/broadcast";
import {
    getRoom,
    saveRoom,
    getDrawerOrder,
    setDrawerOrder,
    setDrawerIndex,
    setCurrentWord, clearGuessed, setCurrentMask, getCurrentMask, getCurrentWord, getGuessedPlayers, getDrawerIndex
} from "@/game/rooms/roomState";
import {PlayerId, RoomState} from "@sketchguess/shared-types";
import {buildMask, revealOneChar} from "@/game/hints";
import {prisma} from "@/db/client";

export const ROUND_DURATION_MS = 60_000;

// --- IN-MEMORY TIMER HANDLES (single-instance) -----

const roundTimers = new Map<string, ReturnType<typeof setTimeout>>();
const hintTimers = new Map<string, ReturnType<typeof setTimeout>[]>();

export function clearRoundTimers(code: string){
    const t = roundTimers.get(code);
    if (t) { clearTimeout(t); roundTimers.delete(code); }
    const hs = hintTimers.get(code);
    if (hs) { hs.forEach(clearTimeout); hintTimers.delete(code); }
}

// --- GAME START -------------------

export async function startGameLoop(code: string, requesterId: string): Promise<void>{
    const room: RoomState | null = await getRoom(code);
    if(!room)                       throw new Error("Room not found");
    if(room.hostId !== requesterId) throw new Error("Only the host can start");
    if(room.phase !== "lobby")      throw new Error("Game already started");
    if(room.players.length < 2)     throw new Error("Need at-least 2 players");


    // Fisher-Yates shuffle for drawer order
    const order = room.players.map((p: { id: any; })=> p.id);
    for(let i = order.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i+1));
        [order[i],order[j]] = [order[j]!, order[i]!];
    }

    await setDrawerOrder(code,order);

    room.roundNumber = 1;
    await saveRoom(room);
    await advanceToWordPick(code,0);
}

// --- WORD-PICK PHASE ----------------

export async function advanceToWordPick(code: string, drawerIndex: number): Promise<void>{
    const room: RoomState | null = await getRoom(code);
    if(!room) return;
    const order: PlayerId[] = await getDrawerOrder(code);

    // drawerIndex past the end -> all players drew this round
    if (drawerIndex >= order.length){
        if(room.roundNumber >= room.totalRounds){
            await endGame(code);
        } else {
            room.roundNumber += 1;
            await saveRoom(room);
            await advanceToWordPick(code, 0);
        }
        return;
    }

    await setDrawerIndex(code,drawerIndex);

    const drawerId = order[drawerIndex]!;
    room.phase = "word_pick";
    room.currentDrawerId = drawerId;

    for(const p of room.players) p.isDrawer = p.id === drawerId;
    await saveRoom(room);

    const words = await pickRandomWords(3);
    sendToPlayer(code, drawerId,{
        type: "word_options",
        payload: {words: words as [string,string,string]},
    });
    broadcast(code,{type: "room_state", payload: room});
}

// --- DRAWER-PHASE ------------------

export async function startDrawingPhase(code: string, word: string): Promise<void>{
    const room = await getRoom(code);
    if(!room) return;

    const endsAt = Date.now() + ROUND_DURATION_MS;
    room.phase = "drawing";
    room.roundEndsAt = endsAt;

    await saveRoom(room);
    await setCurrentWord(code,word);
    await clearGuessed(code);

    const drawerId = room.currentDrawerId!;
    const mask = buildMask(word);

    await setCurrentMask(code,mask);

    broadcast(code, {type: "round_started", payload: {drawerId, endsAt}});
    sendToPlayer(code,drawerId, {type: "word_to_draw", payload: {word}});
    broadcast(code, {type: "word_hint", payload: {mask}},drawerId);

    // hint reveal at 1/3 and 2/3 of round time
    const hints =  [ROUND_DURATION_MS * 0.33, ROUND_DURATION_MS * 0.66].map((time)=> setTimeout(async ()=>{
            const currentState = (await getCurrentMask(code)) ?? mask;
            const nextState = revealOneChar(word,currentState);
            await setCurrentMask(code,nextState);
            broadcast(code,{ type:"word_hint", payload: {mask: nextState } }, drawerId);
        }, time));

    hintTimers.set(code,hints);

    const t = setTimeout(async ()=>{
        await endRound(code,"timer");
    },ROUND_DURATION_MS);

    roundTimers.set(code,t);
}


// --- ROUND END ---------------------

export async function endRound(code: string, reason: string) : Promise<void>{
    clearRoundTimers(code);

    const room = await getRoom(code);
    if(!room || room.phase !== "drawing") return;

    const word        = (await getCurrentWord(code)) ?? "???";
    const guessedIds = (await getGuessedPlayers(code));
    const drawerIdx  = (await getDrawerIndex(code));

    const deltas: Record<string,number> = {};
    for(const pid of guessedIds) {
        deltas[pid] = (deltas[pid] ?? 0) + 100;
    }
    if (room.currentDrawerId){
        deltas[room.currentDrawerId] = (deltas[room.currentDrawerId] ?? 0) + guessedIds.length * 50;
    }

    for(const p of room.players){
        if (deltas[p.id]) p.score += deltas[p.id]!;
    }

    room.phase = "reveal";
    room.roundEndsAt = null;
    await saveRoom(room);

    broadcast(code,{type: "round_ended", payload: { word, deltas}});

    setTimeout(async ()=>{
        await advanceToWordPick(code,drawerIdx + 1);
    }, 5_000);
}


// --- GAME END ----------------------

export async function endGame(code: string): Promise<void>{
    const room = await getRoom(code);
    if (!room) return;

    room.phase = "ended";
    await saveRoom(room);

    const finalScores: Record<string, number> = {};
    for(const p of room.players) finalScores[p.id] = p.score;

    broadcast(code, {type: "game_ended", payload: {finalScores}});

    // persist to DB
    saveGameRecord(room).catch((e: any)=> console.error("[game] DB save failed",e));
}

async function saveGameRecord(room: RoomState): Promise<void>{
    const maxScore = Math.max(...room.players.map((p)=> p.score));
    await prisma.game.create({
        data:{
            roomCode: room.code,
            totalRounds: room.totalRounds,
            endedAt: new Date(),
            players:{
                create: room.players.map((p)=> ({
                    name: p.name,
                    finalScore: p.score,
                    isWinner: p.score === maxScore
                }))
            },
        },
    });
    console.log(`[game] saved to DB, room=${room.code}`);
}


