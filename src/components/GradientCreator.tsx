import { gradientCss, gradientPresets } from "../lib/templates";
import type { GradientPreset } from "../lib/types";

export type GradientCreatorProps = {
  selectedId?: string;
  onSelect: (preset: GradientPreset) => void;
  onCopy: (preset: GradientPreset) => void;
};

export function GradientCreator({ selectedId, onSelect, onCopy }: GradientCreatorProps) {
  return (
    <div className="gradient-popover" role="dialog" aria-label="Gradient presets">
      <div className="popover-heading"><span>Canvas gradient</span><small>6 presets</small></div>
      <div className="gradient-grid">
        {gradientPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={selectedId === preset.id ? "gradient-card is-selected" : "gradient-card"}
            onClick={() => onSelect(preset)}
            aria-pressed={selectedId === preset.id}
          >
            <span className="gradient-swatch" style={{ background: gradientCss(preset) }} aria-hidden="true" />
            <span>{preset.name}</span>
          </button>
        ))}
      </div>
      {selectedId && (
        <button
          type="button"
          className="copy-gradient"
          onClick={() => {
            const selected = gradientPresets.find((preset) => preset.id === selectedId);
            if (selected) onCopy(selected);
          }}
        >
          Copy gradient CSS
        </button>
      )}
    </div>
  );
}
