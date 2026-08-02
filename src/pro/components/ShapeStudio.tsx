import { AI_SHAPE_PRESETS } from "../presets";
import type { AIShapePresetId } from "../types";

export type ShapeStudioProps = {
  value: AIShapePresetId | null;
  onChange: (id: AIShapePresetId) => void;
};

export function ShapeStudio({ value, onChange }: ShapeStudioProps) {
  return (
    <section id="sketchlayer-pro-shape-panel" className="sketchlayer-pro-panel" aria-label="AI Shape Studio">
      <header><div><strong>AI Shape Studio</strong><p>Every shape begins with an operation.</p></div></header>
      <div className="sketchlayer-pro-preset-list">
        {AI_SHAPE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="sketchlayer-pro-preset"
            data-active={value === preset.id || undefined}
            onClick={() => onChange(preset.id)}
          >
            <span className={`sketchlayer-pro-preset__mark sketchlayer-pro-preset__mark--${preset.shape}`} style={{ color: preset.color }} aria-hidden="true" />
            <span><strong>{preset.label}</strong><small>{preset.description}</small></span>
            <span className={`sketchlayer-pro-severity sketchlayer-pro-severity--${preset.severity}`}>{preset.severity}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
