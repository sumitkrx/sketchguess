"use client";

interface Props {
  words: string[];
  onPick: (word: string) => void;
}

export default function WordPicker({ words, onPick }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm border border-slate-700 shadow-2xl text-center">
        <p className="text-slate-400 text-sm mb-2">Your turn to draw!</p>
        <h2 className="text-2xl font-bold text-white mb-6">Choose a word</h2>
        <div className="space-y-3">
          {words.map((w) => (
            <button
              key={w}
              onClick={() => onPick(w)}
              className="w-full py-3 px-4 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 hover:border-indigo-500 text-white font-semibold rounded-xl transition-all text-lg"
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
