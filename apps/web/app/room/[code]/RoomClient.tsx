"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGame } from "@/hooks/useGame";
import type { ClientMessage } from "@sketchguess/shared-types";

export default function RoomClient() {
    const router = useRouter();
    const params = useParams();
    const search = useSearchParams();

    const code = (params.code as string).toUpperCase();
    const name = search.get("name") ?? "";

    useEffect(() => { if (!name) router.replace("/"); }, [name, router]);

    const { state, send } = useGame(code, name);
    const { room, myId, connected } = state;

    if (!connected || !room) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <p className="text-slate-400 animate-pulse">
                    {connected ? "Joining room…" : "Connecting to server…"}
                </p>
            </div>
        );
    }

    if (room.phase === "lobby") {
        const isHost = room.hostId === myId;
        return (
            <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm border border-slate-700 shadow-2xl">
                    <div className="text-center mb-6">
                        <p className="text-slate-400 text-sm mb-1">Room code</p>
                        <div className="text-4xl font-mono font-bold text-indigo-400 tracking-widest">{code}</div>
                        <p className="text-slate-500 text-xs mt-1">Share this with friends</p>
                    </div>

                    <ul className="space-y-2 mb-6">
                        {room.players.map((p) => (
                            <li key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-700">
                                <span className="text-xl">{p.id === room.hostId ? "👑" : "🎮"}</span>
                                <span className="text-white font-medium flex-1">{p.name}</span>
                                {p.id === myId && <span className="text-xs text-indigo-400 font-medium">you</span>}
                            </li>
                        ))}
                    </ul>

                    {isHost ? (
                        <button
                            onClick={() => send({ type: "start_game", payload: {} } satisfies ClientMessage)}
                            disabled={room.players.length < 2}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors">
                            {room.players.length < 2 ? "Waiting for players…" : "Start Game 🚀"}
                        </button>
                    ) : (
                        <p className="text-center text-slate-400 text-sm">
                            Waiting for <span className="text-white font-medium">
                {room.players.find((p) => p.id === room.hostId)?.name ?? "host"}
              </span> to start…
                        </p>
                    )}
                </div>
            </main>
        );
    }

    // game view placeholder — canvas + chat in the next step
    return (
        <main className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <p className="text-lg font-medium text-white mb-1">
                    Phase: <span className="text-indigo-400">{room.phase}</span>
                </p>
                <p className="text-sm text-slate-400">Round {room.roundNumber} / {room.totalRounds}</p>
            </div>
        </main>
    );
}