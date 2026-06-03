import type { WebSocket } from "ws";
import { randomUUID } from "node:crypto";
import type {ClientMessage, Player, Stroke} from "@sketchguess/shared-types";
import { getRoom, saveRoom, createRoom, deleteRoom } from "../rooms/roomState";
import { addConnection, removeConnection, getConnectionMeta } from "../rooms/registry";
import { send, broadcast } from "./broadcast";
import {clearRoundTimers, endRound, ROUND_DURATION_MS, startDrawingPhase, startGameLoop} from "@/game/loop";
import {getCurrentWord, getGuessedPlayers, markGuessed} from "@/game/rooms/roomState";
import {isCloseGuess, isCorrectGuess} from "@/game/hints";

 // --- MESSAGE ROUTER -----------------
export async function handleMessage(ws: WebSocket, raw: string) {
  let msg: ClientMessage;
  try {
    msg = JSON.parse(raw) as ClientMessage;
  } catch {
    return send(ws, { type: "error", payload: { code: "BAD_JSON", message: "Invalid JSON" } });
  }

  switch (msg.type) {
    case "join_room":    return handleJoin(ws, msg.payload);
    case "leave_room":   return handleLeave(ws);
    case "start_game":   return handleStartGame(ws);
    case "pick_word":    return handlePickWord(ws, msg.payload);
    case "stroke":       return handleStroke(ws, msg.payload);
    case "clear_canvas": return handleClearCanvas(ws);
    case "chat":         return handleChat(ws, msg.payload);
    default:
      return send(ws, {
        type: "error",
        payload: { code: "UNKNOWN_TYPE", message: `Unhandled: ${(msg as { type: string }).type}` },
      });
  }
}

// --- JOIN / LEAVE ------------------

async function handleJoin(ws: WebSocket, payload: { code: string; name: string }) {
  const code = payload.code.trim().toUpperCase();
  const name = payload.name.trim().slice(0, 20) || "Anonymous";
  const playerId = randomUUID();

  let room = await getRoom(code);
  if (!room) {
    room = await createRoom(code, playerId); // first joiner is host
  }

  const player: Player = {
    id: playerId,
    name,
    score: 0,
    isDrawer: false,
    isConnected: true,
  };
  room.players.push(player);
  await saveRoom(room);

  addConnection(code, playerId, ws);

  send(ws, { type: "joined", payload: { you: playerId, room } });
  broadcast(code, { type: "player_joined", payload: { player } }, playerId);
}

export async function handleLeave(ws: WebSocket) {
  const m = getConnectionMeta(ws);
  if (!m) return;
  const { code, playerId } = m;
  removeConnection(ws);

  const room = await getRoom(code);
  if (!room) return;

  const wasDrawing = room.phase === "drawing" && room.currentDrawerId === playerId;
  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    clearRoundTimers(code);
    await deleteRoom(code);
    return;
  }
  if (room.hostId === playerId) {
    room.hostId = room.players[0]!.id; // promote next player to host
  }
  await saveRoom(room);

  broadcast(code, { type: "player_left", payload: { playerId } });
  broadcast(code, { type: "room_state", payload: room });

  if(wasDrawing) await endRound(code,"drawer_disconnected");
}

// --- GAME LIFECYCLE --------------

async function handleStartGame(ws: WebSocket) {
  const m = getConnectionMeta(ws);
  if (!m) return;

  try {
    await startGameLoop(m.code, m.playerId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Cannot start game";
    send(ws,{type:"error", payload:{code: "GAME_ERROR", message: msg } });
  }
}

async function handlePickWord(ws:WebSocket, payload:{word:string}) {
  const m = getConnectionMeta(ws);
  if (!m) return;

  const room = await getRoom(m.code);
  if(!room || room.phase !== "word_pick" || room.currentDrawerId !== m.playerId) return;
  await startDrawingPhase(m.code,payload.word.toLocaleLowerCase());
}

// --- DRAWING ----------------------

async function handleStroke(ws:WebSocket, stroke: Stroke) {
  const m = getConnectionMeta(ws);
  if (!m) return;

  const room = await getRoom(m.code);
  if(!room || room.phase !== "drawing" || room.currentDrawerId !== m.playerId) return;
  broadcast(m.code,{type: "stroke",payload: stroke },m.playerId);
}

async function handleClearCanvas(ws: WebSocket) {
  const m = getConnectionMeta(ws);
  if (!m) return;

  const room = await getRoom(m.code);
  if(!room || room.phase !== "drawing" || room.currentDrawerId !== m.playerId) return;
  broadcast(m.code,{type: "clear_canvas", payload: {}}, m.playerId);
}

// --- CHAT / GUESSING ---------------

async function handleChat(ws: WebSocket, payload: { text: string }) {
  const m = getConnectionMeta(ws);
  if (!m) return;
  const { code, playerId } = m;

  const room = await getRoom(code);
  if (!room) return;
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return;

  const text = payload.text.trim().slice(0, 200);
  if (!text) return;

  // during drawing phase, non-drawers's messages are guesses
  if(room.phase === "drawing" && room.currentDrawerId !== playerId){
    const word = await getCurrentWord(code);
    if(word){
      const alreadyGuessed = await getGuessedPlayers(code);
      if(alreadyGuessed.includes(playerId)) return;

      if(isCorrectGuess(text,word)){
        await markGuessed(code,playerId);

        const remainingMs = Math.max(0, (room.roundEndsAt ?? 0) - Date.now());
        const score = 100 + Math.round((remainingMs/ROUND_DURATION_MS) * 100);

        broadcast(code,{
          type:"chat",
          payload:{
            id: randomUUID(),
            playerId,
            playerName: player.name,
            text,
            ts: Date.now(),
            kind:"guess_correct",
          }
        });

        // award points immediately - ensure score update
        player.score += score;
        const drawerPlayer = room.players.find((p) => p.id === room.currentDrawerId);
        if(drawerPlayer) drawerPlayer.score += 50;
        await saveRoom(room);
        broadcast(code,{type: "room_state", payload: room});

        // end round early if non-drawers guessed
        const guessedNow = await getGuessedPlayers(code);
        const nonDrawers = room.players.filter((p) => p.id !== room.currentDrawerId);
        if(guessedNow.length >= nonDrawers.length) {
          await endRound(code,"all_guessed");
        }
        return;
      }

      if(isCloseGuess(text,word)){
        send(ws,{
          type: "chat",
          payload: {
            id: randomUUID(),
            playerId,
            playerName: player.name,
            text,
            ts: Date.now(),
            kind: "guess_close"
          },
        });
        return;
      }

      // wrong guess - visible to everyone except the drawer
      broadcast(code,{
        type: 'chat',
        payload:{
          id: randomUUID(),
          playerId,
          playerName: player.name,
          text,
          ts: Date.now(),
          kind: "guess_wrong"
        }
      }, room.currentDrawerId ?? undefined);
      return;
    }

    // regular chat
    broadcast(code, {
      type: "chat",
      payload: {
        id: randomUUID(),
        playerId,
        playerName: player.name,
        text,
        ts: Date.now(),
        kind: "chat",
      },
    });
  }
}
