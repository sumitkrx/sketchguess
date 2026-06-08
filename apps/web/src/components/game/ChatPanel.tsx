"use client";

import { useRef, useEffect, useState } from "react";
import { ChatMessage } from "@sketchguess/shared-types";

const KIND_STYLES: Record<string, string> = {
  chat: "text-slate-300",
  guess_wrong: "text-slate-400 italic",
  guess_close: "text-yellow-400 font-medium",
  guess_correct: "text-emerald-400 font-bold",
  system: "text-slate-500 italic text-xs",
};

interface Props {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

export default function ChatPanel({ messages, onSend }: Props) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend() {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-800 rounded-xl overflow-hidden">
      <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 border-b border-slate-700">
        Chat & Guesses
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-sm">
        {messages.map((m) => (
          <div key={m.id} className={KIND_STYLES[m.kind] ?? "text-slate-300"}>
            {m.kind !== "system" && (
              <span className="font-semibold text-slate-200 mr-1">
                {m.playerName}:
              </span>
            )}
            {m.kind === "guess_correct"
              ? `✅ ${m.text}`
              : m.kind === "guess_close"
                ? `🔥 ${m.text}`
                : m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-1.5 p-2 border-t border-slate-700">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a guess…"
          maxLength={200}
          className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
