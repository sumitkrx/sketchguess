"use client";

import type { Player } from "@sketchguess/shared-types";

interface Props {
  players: Player[];
  currentDrawerId: string | null | undefined;
  myId: string | null;
}

export default function PlayerList({ players, currentDrawerId, myId }: Props) {
  const sorted = [...players].sort((a, b) => a.score - b.score);
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 border-b border-slate-700">
        Players
      </div>
      <ul className="divide-y divide-slate-700/50">
        {sorted.map((p) => (
          <li key={p.id} className="flex items-center gap-2 px-3 py-2">
            <span className="text-base">
              {p.id === currentDrawerId ? "🎨" : "🎮"}
            </span>
            <span
              className={`flex-1 text-sm font-medium truncate ${
                p.id === myId ? "text-indigo-300" : "text-white"
              }`}
            >
              {p.name}
              {p.id === myId && (
                <span className="ml-1 text-xs text-slate-500">(you)</span>
              )}
            </span>
            <span className="text-sm font-mono text-slate-300">{p.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
