import { redis } from "../redis/client";
import type { RoomState, RoomCode, PlayerId} from '@sketchguess/shared-types';

const TTL = 60 * 60 * 4;

const k = {
    room: (c:string) => `room:${c}`,
    word: (c: string) => `room:${c}:word`,
    mask: (c: string) => `room:${c}:mask`,
    guessed: (c:string) => `room:${c}:guessed`,
    order: (c:string) => `room:${c}:order`,
    drawerIdx: (c:string) => `room:${c}:drawer-idx`,
};

// --- ROOM ---------------

export async function getRoom(code: RoomCode):Promise<RoomCode | null> {
    const raw = await redis.get(k.room(code));
    return raw ? (JSON.parse(raw) as RoomCode) : null;
}

export async function saveRoom(room: RoomState): Promise<void> {
    await redis.set(k.room(room.code),JSON.stringify(room),"EX",TTL);
}

export async function deleteRoom(code: RoomCode): Promise<void>{
    await redis.del(
        k.room(code),k.word(code),k.mask(code),
        k.guessed(code),k.order(code), k.drawerIdx(code),
    );
}

export async function createRoom(code: RoomCode, hostId: PlayerId): Promise<RoomState> {
    const room: RoomState = {
        code, phase: "lobby", players: [], hostId,
        currentDrawerId: null, roundNumber: 1,
        totalRounds: 3, roundEndsAt: null,
    };

    await saveRoom(room);
    return room;
}

// --- CURRENT WORD & MASK --------

export async function setCurrentWord(code: string, word:string){
    await redis.set(k.word(code), word, "EX",TTL);
}

export async function getCurrentWord(code: string){
    return redis.get(k.word(code));
}

export async function setCurrentMask(code: string, mask:string){
    await redis.set(k.mask(code), mask, "EX",TTL);
}

export async function getCurrentMask(code:string){
    return redis.get(k.mask(code));
}

// --- GUESSED SET -------------

export async function markGuessed(code:string, playerId: string){
    await redis.sadd(k.guessed(code),playerId);
    await redis.expire(k.guessed(code),TTL);
}

export async function getGuessedPlayers(code: string): Promise<string[]>{
    return redis.smembers(k.guessed(code));
}

export async function clearGuessed(code: string){
    await redis.del(k.guessed(code));
}

// --- DRAWER ORDER --------------

export async function setDrawerOrder(code:string, order: PlayerId[]){
    await redis.set(k.order(code),JSON.stringify(order), "EX", TTL);
}

export async function getDrawerOrder(code: string): Promise<PlayerId[]> {
    const raw = await redis.get(k.order(code));
    return raw ? (JSON.parse(raw) as PlayerId[]) : [];
}

export async function setDrawerIndex(code: string, idx: number) {
    await redis.set(k.drawerIdx(code), String(idx), "EX", TTL);
}

export async function getDrawerIndex(code: string): Promise<number> {
    const v = await redis.get(k.drawerIdx(code));
    return v !== null ? parseInt(v, 10) : 0;
}



