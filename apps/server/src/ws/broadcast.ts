import { WebSocket } from "ws";
import type { ServerMessage, RoomCode, PlayerId } from "@sketchguess/shared-types";
import { getRoomSockets } from "../rooms/registry";

export function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

export function broadcast(code: RoomCode, msg: ServerMessage, exclude?: PlayerId) {
  const sockets = getRoomSockets(code);
  if (!sockets) return;
  const data = JSON.stringify(msg);
  for (const [playerId, ws] of sockets) {
    if (playerId === exclude) continue;
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  }
}

export function sendToPlayer(code: RoomCode, playerId: PlayerId, msg: ServerMessage) {
  const ws = getRoomSockets(code)?.get(playerId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}
