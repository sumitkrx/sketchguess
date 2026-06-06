import type {
  RoomState, ChatMessage, Stroke, PlayerId,
  ServerMessage,
} from "@sketchguess/shared-types";

export interface GameState {
  connected: boolean;
  myId: PlayerId | null;
  room: RoomState | null;
  strokes: Stroke[];
  messages: ChatMessage[];
  wordToDraw: string | null;   // only set for the drawer
  wordHint: string | null;     // mask sent to guessers ("c__")
  wordOptions: string[] | null;
  error: string | null;
}

export type GameAction =
  | { type: "CONNECTED" }
  | { type: "DISCONNECTED" }
  | { type: "SERVER_MSG"; msg: ServerMessage };

export const initialState: GameState = {
  connected: false,
  myId: null,
  room: null,
  strokes: [],
  messages: [],
  wordToDraw: null,
  wordHint: null,
  wordOptions: null,
  error: null,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "CONNECTED":    return { ...state, connected: true };
    case "DISCONNECTED": return { ...state, connected: false };
    case "SERVER_MSG":   return applyServerMsg(state, action.msg);
    default:             return state;
  }
}

function applyServerMsg(state: GameState, msg: ServerMessage): GameState {
  switch (msg.type) {
    case "joined":
      return { ...state,
        myId: msg.payload.you,
        room: msg.payload.room
      };

    case "room_state":
      return { ...state,
        room: msg.payload
      };

    case "player_joined":
      if (!state.room) return state;
      return { ...state,
        room: { ...state.room,
          players: [...state.room.players, msg.payload.player]
        }
      };

    case "player_left":
      if (!state.room) return state;
      return { ...state,
        room: { ...state.room,
          players: state.room.players.filter((p) => p.id !== msg.payload.playerId)
        }
      };

    case "word_options":
      return { ...state,
        wordOptions: msg.payload.words
      };

    case "word_to_draw":
      return { ...state,
        wordToDraw: msg.payload.word,
        wordHint: null
      };

    case "word_hint":
      return { ...state,
        wordHint: msg.payload.mask
      };

    case "round_started":
      return {
        ...state,
        strokes: [],
        wordOptions: null,
        room: state.room
          ? { ...state.room,
              currentDrawerId: msg.payload.drawerId,
              roundEndsAt: msg.payload.endsAt,
              phase: "drawing"
          } : null,
      };

    case "round_ended":
      return { ...state,
        wordToDraw: null,
        wordHint: null
      };

    case "game_ended":
      return { ...state };

    case "stroke": {
      const idx = state.strokes.findIndex((s) => s.id === msg.payload.id);
      if(idx >= 0) {
        const next = [...state.strokes];
        next[idx] = msg.payload;
        return {...state, strokes: next};
      }
      return { ...state, strokes: [...state.strokes,msg.payload] };
    }

    case "clear_canvas":
      return { ...state,
        strokes: []
      };

    case "chat":
      return { ...state,
        messages: [...state.messages.slice(-100), msg.payload]
      };

    case "error":
      return { ...state, error: msg.payload.message };

    default:
      return state;
  }
}
