"use client";
import dynamic from "next/dynamic";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGame } from "@/hooks/useGame";
import DrawingTools from "@/components/game/DrawingTools";
import ChatPanel from "@/components/game/ChatPanel";
import PlayerList from "@/components/game/PlayerList";
import GameHeader from "@/components/game/GameHeader";
import WordPicker from "@/components/game/WordPicker";
import type { ClientMessage } from "@sketchguess/shared-types";

const DrawingCanvas = dynamic(() => import("@/components/game/DrawingCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] bg-white rounded-xl animate-pulse" />
  ),
});

export default function RoomClient() {
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();

  const code = (params.code as string).toUpperCase();
  const name = search.get("name") ?? "";

  useEffect(() => {
    if (!name) router.replace("/");
  }, [name, router]);

  const { state, send } = useGame(code, name);
  const { room, myId, connected } = state;

  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(6);
  const [clearKey, setClearKey] = useState(0);

  // reset canvas when a new round starts
  useEffect(() => {
    setClearKey((k) => k + 1);
  }, [room?.roundNumber]);

  function handleClear() {
    setClearKey((k) => k + 1);
    send({ type: "clear_canvas", payload: {} } satisfies ClientMessage);
  }

  // ── loading ──────────────────────────────────────────────────────────────
  if (!connected || !room) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">
          {connected ? "Joining room…" : "Connecting to server…"}
        </p>
      </div>
    );
  }

  // ── lobby ─────────────────────────────────────────────────────────────────
  if (room.phase === "lobby") {
    const isHost = room.hostId === myId;
    return (
      <main className="min-h-screen bg-[#fff6ef] flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm border border-slate-700 shadow-2xl">
          <div className="text-center mb-6">
            <p className="text-slate-400 text-sm mb-1">Room code</p>
            <div className="text-4xl font-mono font-bold text-indigo-400 tracking-widest">
              {code}
            </div>
            <p className="text-slate-500 text-xs mt-1">Share with friends</p>
          </div>
          <ul className="space-y-2 mb-6">
            {room.players.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-700"
              >
                <span className="text-xl">
                  {p.id === room.hostId ? "👑" : "🎮"}
                </span>
                <span className="text-white font-medium flex-1">{p.name}</span>
                {p.id === myId && (
                  <span className="text-xs text-indigo-400">you</span>
                )}
              </li>
            ))}
          </ul>
          {isHost ? (
            <button
              onClick={() =>
                send({
                  type: "start_game",
                  payload: {},
                } satisfies ClientMessage)
              }
              disabled={room.players.length < 2}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              {room.players.length < 2
                ? "Waiting for players…"
                : "Start Game 🚀"}
            </button>
          ) : (
            <p className="text-center text-slate-400 text-sm">
              Waiting for{" "}
              <span className="text-white font-medium">
                {room.players.find((p) => p.id === room.hostId)?.name ?? "host"}
              </span>{" "}
              to start…
            </p>
          )}
        </div>
      </main>
    );
  }

  // ── game ended ────────────────────────────────────────────────────────────
  if (room.phase === "ended") {
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm border border-slate-700 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-6">Game Over!</h2>
          <ul className="space-y-2 mb-6">
            {sorted.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-700"
              >
                <span className="text-xl">{["🥇", "🥈", "🥉"][i] ?? "🎮"}</span>
                <span className="text-white font-medium flex-1">{p.name}</span>
                <span className="font-mono text-slate-300">{p.score} pts</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => router.replace("/")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors"
          >
            Play again
          </button>
        </div>
      </main>
    );
  }

  // ── main game view ────────────────────────────────────────────────────────
  const isDrawer = room.currentDrawerId === myId;

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* word picker overlay */}
      {room.phase === "word_pick" && isDrawer && state.wordOptions && (
        <WordPicker
          words={state.wordOptions}
          onPick={(w) =>
            send({
              type: "pick_word",
              payload: { word: w },
            } satisfies ClientMessage)
          }
        />
      )}

      {/* header */}
      <GameHeader
        room={room}
        myId={myId}
        wordToDraw={state.wordToDraw}
        wordHint={state.wordHint}
        lastWord={state.lastWord}
      />

      {/* main */}
      <div className="flex flex-1 min-h-0 gap-2 p-2">
        {/* canvas column */}
        <div className="flex flex-col flex-1 min-w-0 gap-2">
          <DrawingCanvas
            strokes={state.strokes}
            isDrawer={isDrawer}
            myId={myId ?? ""}
            color={color}
            brushSize={brushSize}
            clearKey={clearKey}
            onStroke={(s) =>
              send({ type: "stroke", payload: s } satisfies ClientMessage)
            }
          />
          {isDrawer && (
            <DrawingTools
              color={color}
              brushSize={brushSize}
              onColor={setColor}
              onSize={setBrushSize}
              onClear={handleClear}
            />
          )}
        </div>

        {/* sidebar */}
        <div className="flex flex-col w-64 shrink-0 gap-2 min-h-0">
          <PlayerList
            players={room.players}
            currentDrawerId={room.currentDrawerId}
            myId={myId}
          />
          <ChatPanel
            messages={state.messages}
            onSend={(t) =>
              send({
                type: "chat",
                payload: { text: t },
              } satisfies ClientMessage)
            }
          />
        </div>
      </div>
    </div>
  );
}
