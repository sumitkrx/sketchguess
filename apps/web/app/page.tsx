"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [mode, setMode] = useState<"join" | "create">("create");

    function handleSubmit() {
        const n = name.trim();
        if (!n) return;
        const c = mode === "create"
            ? Math.random().toString(36).slice(2, 6).toUpperCase()
            : code.trim().toUpperCase();
        if (!c) return;
        router.push(`/room/${c}?name=${encodeURIComponent(n)}`);
    }

    return (
        <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-700">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-3">🎨</div>
                    <h1 className="text-4xl font-bold text-white">SketchGuess</h1>
                    <p className="text-slate-400 mt-2">Draw it. Guess it. Win it.</p>
                </div>

                <div className="flex rounded-lg overflow-hidden mb-6 border border-slate-700">
                    {(["create", "join"] as const).map((m) => (
                        <button key={m} onClick={() => setMode(m)}
                                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                                    mode === m ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                                }`}>
                            {m === "create" ? "Create room" : "Join room"}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    <input placeholder="Your nickname" value={name}
                           onChange={(e) => setName(e.target.value)}
                           onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                           maxLength={20}
                           className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                    {mode === "join" && (
                        <input placeholder="Room code" value={code}
                               onChange={(e) => setCode(e.target.value.toUpperCase())}
                               onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                               maxLength={6}
                               className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:outline-none focus:border-indigo-500 font-mono tracking-widest text-center text-lg transition-colors" />
                    )}
                    <button onClick={handleSubmit}
                            disabled={!name.trim() || (mode === "join" && !code.trim())}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors">
                        {mode === "create" ? "Create & Join →" : "Join Room →"}
                    </button>
                </div>
            </div>
        </main>
    );
}