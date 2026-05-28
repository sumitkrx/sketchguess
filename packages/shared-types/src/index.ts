// ============================================================
// SketchGuess — shared types between web client and server
// ============================================================
export type PlayerId = string;
export type RoomCode = string;

export interface Player {
  id: PlayerId;
  name: string;
  score: number;
  isDrawer: boolean;
  isConnected: boolean;
}

export type RoomPhase = 'lobby' | 'word_pick' | 'drawing' | 'reveal' | 'ended';

export interface RoomState {
  code: RoomCode;
  phase: RoomPhase;
  players: Player[];
  hostId: PlayerId;
  currentDrawerId: PlayerId | null;
  roundNumber: number;
  totalRounds: number;
  roundEndsAt: number | null;
}

export interface Point {
  x: number;  // normalized 0..1
  y: number;
}

export interface Stroke {
  id: string;
  playerId: PlayerId;
  points: Point[];
  color: string;
  width: number;
}

export interface ChatMessage {
  id: string;
  playerId: PlayerId;
  playerName: string;
  text: string;
  ts: number;
  kind: 'chat' | 'guess_wrong' | 'guess_close' | 'guess_correct' | 'system';
}

// ---------- WebSocket protocol ----------

export type ClientMessage =
  | { type: 'join_room';    payload: { code: RoomCode; name: string } }
  | { type: 'leave_room';   payload: {} }
  | { type: 'start_game';   payload: {} }
  | { type: 'pick_word';    payload: { word: string } }
  | { type: 'stroke';       payload: Stroke }
  | { type: 'clear_canvas'; payload: {} }
  | { type: 'chat';         payload: { text: string } };

export type ServerMessage =
  | { type: 'room_state';    payload: RoomState }
  | { type: 'player_joined'; payload: { player: Player } }
  | { type: 'player_left';   payload: { playerId: PlayerId } }
  | { type: 'word_options';  payload: { words: [string, string, string] } }
  | { type: 'word_to_draw';  payload: { word: string } }
  | { type: 'word_hint';     payload: { mask: string } }
  | { type: 'round_started'; payload: { drawerId: PlayerId; endsAt: number } }
  | { type: 'round_ended';   payload: { word: string; deltas: Record<PlayerId, number> } }
  | { type: 'game_ended';    payload: { finalScores: Record<PlayerId, number> } }
  | { type: 'stroke';        payload: Stroke }
  | { type: 'clear_canvas';  payload: {} }
  | { type: 'chat';          payload: ChatMessage }
  | { type: 'error';         payload: { code: string; message: string } }
  | { type: 'joined';        payload: { you: PlayerId; room: RoomState } };

export type WsMessage = ClientMessage | ServerMessage;
