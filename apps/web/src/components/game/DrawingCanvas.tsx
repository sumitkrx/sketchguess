import type { Stroke, Point } from "@sketchguess/shared-types";
import { Stage, Layer, Line } from "react-konva";
import type Konva from "konva";
import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  strokes: Stroke[];
  isDrawer: boolean;
  myId: string;
  color: string;
  brushSize: number;
  clearKey: number;
  onStroke: (s: Stroke) => void;
}

export default function DrawingCanvas({
  strokes,
  isDrawer,
  myId,
  color,
  brushSize,
  clearKey,
  onStroke,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ w: 600, h: 600 });
  const [commited, setCommited] = useState<Stroke[]>([]);
  const [live, setLive] = useState<Stroke | null>(null);
  const drawing = useRef(false);
  const liveRef = useRef<Stroke | null>(null);

  // responsive sizing - 4:3 canvas fills container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const w = entry.contentRect.width;
      setSize({ w, h: Math.round(w * 0.75) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // clear local strokes on round change or manual clear
  useEffect(() => {
    setCommited([]);
    setLive(null);
    liveRef.current = null;
  }, [clearKey]);

  const norm = (e: Konva.KonvaEventObject<PointerEvent>): Point => {
    const pos = e.target.getStage()?.getPointerPosition();
    return { x: (pos?.x ?? 0) / size.w, y: (pos?.y ?? 0) / size.h };
  };

  const onDown = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!isDrawer) return;
      drawing.current = true;

      const stroke: Stroke = {
        id: crypto.randomUUID(),
        playerId: myId,
        points: [norm(e)],
        color,
        width: brushSize,
      };

      liveRef.current = stroke;
      setLive(stroke);
    },
    [isDrawer, myId, color, brushSize, size],
  );

  const onUp = useCallback(() => {
    if (!isDrawer || !drawing.current || !liveRef.current) return;
    drawing.current = false;
    const s = liveRef.current;

    if (s.points.length > 1) {
      onStroke(s);
      setCommited((prev) => [...prev, s]);
    }
    liveRef.current = null;
    setLive(null);
  }, [isDrawer, onStroke]);

  const onMove = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!isDrawer || !drawing.current || !liveRef.current) return;
      const updated = {
        ...liveRef.current,
        points: [...liveRef.current.points, norm(e)],
      };
      liveRef.current = updated;
      setLive({ ...updated });
      // stream partial stroke every 5 points for real-time guesser feedback
      if (updated.points.length % 5 === 0) onStroke(updated);
    },
    [isDrawer, onStroke, size],
  );

  const all = [...strokes, ...commited, ...(live ? [live] : [])];

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden bg-white shadow-lg"
    >
      <Stage
        width={size.w}
        height={size.h}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        style={{ cursor: isDrawer ? "crosshair" : "default", display: "block" }}
      >
        <Layer>
          {all.map((s) => (
            <Line
              key={s.id}
              points={s.points.flatMap((p) => [p.x * size.w, p.y * size.h])}
              stroke={s.color}
              strokeWidth={s.width}
              tension={0.4}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
