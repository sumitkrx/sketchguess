"use client";

const COLORS = [
  "#000000",
  "#ffffff",
  "#6b7280",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#854d0e",
  "#166534",
];

const SIZES = [3, 6, 12, 24];

interface Props {
  color: string;
  brushSize: number;
  onColor: (color: string) => void;
  onSize: (size: number) => void;
  onClear: () => void;
}

export default function DrawingTools({
  color,
  brushSize,
  onSize,
  onColor,
  onClear,
}: Props) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-xl flex-wrap">
      {/* colour swatches */}
      <div className="flex gap-1 flex-wrap">
        {COLORS.map((c: string) => (
          <button
            key={c}
            onClick={() => onColor(c)}
            style={{ background: c }}
            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
              color === c ? "border-indigo-400 scale-110" : "border-slate-600"
            }`}
          />
        ))}
      </div>
      <div className="w-px h-6 bg-slate-600" />
      {/* brush sizes */}
      <div className="flex items-center gap-2">
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => onSize(s)}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
              brushSize === s
                ? "bg-indigo-600"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            <div
              className="rounded-full bg-current"
              style={{
                width: Math.min(s, 20),
                height: Math.min(s, 20),
                color: color === "#ffffff" ? "#999" : color,
              }}
            />
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-slate-600" />

      <button
        onClick={onClear}
        className="px-3 py-1.5 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
      >
        Clear 🗑
      </button>
    </div>
  );
}
