"use client";
import type { RoomState } from "@sketchguess/shared-types";
import { useTimer } from "@/hooks/useTimer";

interface Props {
  room: RoomState;
  myId: string | null;
  wordToDraw: string | null;
  wordHint: string | null;
  lastWord: string | null;
}

export default function GameHeader({
  room,
  myId,
  wordToDraw,
  wordHint,
  lastWord,
}: Props) {
  const secs = useTimer(room.roundEndsAt);
  const isDrawer = room.currentDrawerId === myId;
  const drawerName =
    room.players.find((p) => p.id === room.currentDrawerId)?.name ?? "?";

  const timerColor =
    secs > 30
      ? "text-emerald-400"
      : secs > 10
        ? "text-yellow-400"
        : "text-red-400 animate-pulse";

  function wordSection() {
    if (room.phase === "word_pick") {
      return isDrawer ? (
        <span className="text-indigo-300 animate-pulse">Choose a word…</span>
      ) : (
        <span className="text-slate-400">{drawerName} is choosing a word…</span>
      );
    }
    if (room.phase === "drawing") {
      if (isDrawer && wordToDraw)
        return (
          <span className="text-emerald-300 font-bold tracking-wide">
            Draw: {wordToDraw.toUpperCase()}
          </span>
        );
      if (wordHint)
        return (
          <span className="font-mono tracking-[0.3em] text-white text-lg">
            {wordHint}
          </span>
        );
    }
    if (room.phase === "reveal" && lastWord)
      return (
        <span className="text-yellow-300">
          The word was: <strong>{lastWord}</strong>
        </span>
      );
    if (room.phase === "ended")
      return <span className="text-indigo-300 font-bold">Game Over!</span>;
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
      <span className="text-sm text-slate-400">
        Round{" "}
        <span className="text-white font-semibold">{room.roundNumber}</span>
        <span className="text-slate-600"> / {room.totalRounds}</span>
      </span>

      <div className="text-center">{wordSection()}</div>

      <div
        className={`text-xl font-mono font-bold w-16 text-right ${room.phase === "drawing" ? timerColor : "text-slate-600"}`}
      >
        {room.phase === "drawing" ? `${secs}s` : "—"}
      </div>
    </div>
  );
}
