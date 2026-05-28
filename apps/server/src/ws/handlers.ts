import type { WebSocket } from "ws";
import { randomUUID } from "node:crypto";
import type { ClientMessage, Player } from "@sketchguess/shared-types";
import { getRoom, saveRoom, createRoom, deleteRoom } from "../rooms/roomState";
import { addConnection, removeConnection, getConnectionMeta } from "../rooms/registry";
import { send, broadcast } from "./broadcast";

export async function handleMessage(ws: WebSocket, raw: string) {
  let msg: ClientMessage;
  try {
    msg = JSON.parse(raw) as ClientMessage;
  } catch {
    return send(ws, { type: "error", payload: { code: "BAD_JSON", message: "Invalid JSON" } });
  }

  switch (msg.type) {
    case "join_room":
      return handleJoin(ws, msg.payload);
    case "leave_room":
      return handleLeave(ws);
    case "chat":
      return handleChat(ws, msg.payload);
    // stroke / start_game / pick_word / clear_canvas -> Step 8
    default:
      return send(ws, {
        type: "error",
        payload: { code: "UNKNOWN_TYPE", message: `Unhandled: ${(msg as { type: string }).type}` },
      });
  }
}

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

  // tell the joiner their own id + full state
  send(ws, { type: "joined", payload: { you: playerId, room } });
  // tell everyone else
  broadcast(code, { type: "player_joined", payload: { player } }, playerId);
}

export async function handleLeave(ws: WebSocket) {
  const m = getConnectionMeta(ws);
  if (!m) return;
  const { code, playerId } = m;
  removeConnection(ws);

  const room = await getRoom(code);
  if (!room) return;

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    await deleteRoom(code);
    return;
  }
  if (room.hostId === playerId) {
    room.hostId = room.players[0]!.id; // promote next player to host
  }
  await saveRoom(room);

  broadcast(code, { type: "player_left", payload: { playerId } });
  broadcast(code, { type: "room_state", payload: room });
}

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
