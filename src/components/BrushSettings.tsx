import type { BrushStyle } from "../lib/types";

type BrushSettingsProps = {
  brush: BrushStyle;
  onChange: (brush: BrushStyle) => void;
};

export function BrushSettings({ brush, onChange }: BrushSettingsProps) {
  return (
    <div className="settings-popover" role="dialog" aria-label="Brush settings">
      <div className="popover-heading"><span>Brush settings</span><small>New annotations</small></div>
      <label className="range-field">
        <span>Size <strong>{brush.size}px</strong></span>
        <input
          type="range"
          min="1"
          max="24"
          step="1"
          value={brush.size}
          onChange={(event) => onChange({ ...brush, size: Number(event.target.value) })}
        />
      </label>
      <label className="range-field">
        <span>Opacity <strong>{Math.round(brush.opacity * 100)}%</strong></span>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={brush.opacity}
          onChange={(event) => onChange({ ...brush, opacity: Number(event.target.value) })}
        />
      </label>
    </div>
  );
}
