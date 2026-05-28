import { redis } from "../redis/client";
import type { RoomState, RoomCode, PlayerId } from "@sketchguess/shared-types";

const TTL_SECONDS = 60 * 60 * 4; // rooms expire after 4h idle

const key = (code: RoomCode) => `room:${code}`;

export async function getRoom(code: RoomCode): Promise<RoomState | null> {
  const raw = await redis.get(key(code));
  return raw ? (JSON.parse(raw) as RoomState) : null;
}

export async function saveRoom(room: RoomState): Promise<void> {
  await redis.set(key(room.code), JSON.stringify(room), "EX", TTL_SECONDS);
}

export async function deleteRoom(code: RoomCode): Promise<void> {
  await redis.del(key(code));
}

export async function createRoom(code: RoomCode, hostId: PlayerId): Promise<RoomState> {
  const room: RoomState = {
    code,
    phase: "lobby",
    players: [],
    hostId,
    currentDrawerId: null,
    roundNumber: 0,
    totalRounds: 3,
    roundEndsAt: null,
  };
  await saveRoom(room);
  return room;
}
