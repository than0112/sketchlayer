import type { ProBrushStyle } from "../types";

export type BrushStudioProps = {
  value: ProBrushStyle;
  onChange: (value: ProBrushStyle) => void;
};

export function BrushStudio({ value, onChange }: BrushStudioProps) {
  const update = <Key extends keyof ProBrushStyle>(key: Key, next: ProBrushStyle[Key]) =>
    onChange({ ...value, [key]: next });

  return (
    <section id="sketchlayer-pro-draw-panel" className="sketchlayer-pro-panel" aria-label="Brush Studio">
      <header><div><strong>Brush Studio</strong><p>Natural strokes with agent-safe data.</p></div></header>
      <label className="sketchlayer-pro-field">
        <span>Size <output>{value.size}px</output></span>
        <input aria-label="Brush size" type="range" min="1" max="20" value={value.size} onChange={(event) => update("size", Number(event.target.value))} />
      </label>
      <label className="sketchlayer-pro-field">
        <span>Opacity <output>{Math.round(value.opacity * 100)}%</output></span>
        <input aria-label="Brush opacity" type="range" min="0.05" max="1" step="0.05" value={value.opacity} onChange={(event) => update("opacity", Number(event.target.value))} />
      </label>
      <label className="sketchlayer-pro-field">
        <span>Smoothing <output>{Math.round(value.smoothing * 100)}%</output></span>
        <input aria-label="Brush smoothing" type="range" min="0" max="1" step="0.05" value={value.smoothing} onChange={(event) => update("smoothing", Number(event.target.value))} />
      </label>
      <label className="sketchlayer-pro-check">
        <input type="checkbox" checked={value.pressure} onChange={(event) => update("pressure", event.target.checked)} />
        Pressure sensitivity
      </label>
    </section>
  );
}
