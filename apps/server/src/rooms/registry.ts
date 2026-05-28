import type { WebSocket } from "ws";
import type { RoomCode, PlayerId } from "@sketchguess/shared-types";

// roomCode -> (playerId -> live socket)
const rooms = new Map<RoomCode, Map<PlayerId, WebSocket>>();
// reverse lookup so a closing socket can find its room/player
const meta = new WeakMap<WebSocket, { code: RoomCode; playerId: PlayerId }>();

export function addConnection(code: RoomCode, playerId: PlayerId, ws: WebSocket) {
  let room = rooms.get(code);
  if (!room) {
    room = new Map();
    rooms.set(code, room);
  }
  room.set(playerId, ws);
  meta.set(ws, { code, playerId });
}

export function removeConnection(ws: WebSocket) {
  const m = meta.get(ws);
  if (!m) return null;
  const room = rooms.get(m.code);
  room?.delete(m.playerId);
  if (room && room.size === 0) rooms.delete(m.code);
  meta.delete(ws);
  return m;
}

export function getConnectionMeta(ws: WebSocket) {
  return meta.get(ws) ?? null;
}

export function getRoomSockets(code: RoomCode) {
  return rooms.get(code);
}
