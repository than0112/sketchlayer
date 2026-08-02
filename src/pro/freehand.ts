import { getStroke } from "perfect-freehand";
import type { Point, Stroke } from "../lib/types";
import type { ProBrushStyle } from "./types";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function createProOutline(stroke: Stroke, brush: ProBrushStyle): Point[] {
  const smoothing = clamp01(brush.smoothing);
  const outline = getStroke(
    stroke.points.map((point) => [point.x, point.y, brush.pressure ? point.pressure ?? 0.5 : 0.5]),
    {
      size: stroke.size,
      smoothing,
      streamline: smoothing * 0.65,
      thinning: brush.pressure ? 0.55 : 0,
      simulatePressure: brush.pressure,
      start: { cap: true, taper: 0 },
      end: { cap: true, taper: 0 },
    },
  );
  return outline.map(([x, y]) => ({ x, y }));
}
