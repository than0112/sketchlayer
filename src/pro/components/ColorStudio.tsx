import { ColorArea, ColorPicker, ColorThumb, ColorWheel, ColorWheelTrack, parseColor } from "react-aria-components";
import type { SemanticColor } from "../../lib/types";
import type { ColorStudioProps, ProBrushStyle } from "../types";

const QUICK_COLORS = ["#111827", "#64748b", "#2563eb", "#16a34a", "#f59e0b", "#f97316", "#ef4444", "#7c3aed"];

export function ColorStudio({ value, templates, brandPalette = [], onChange, onTemplatesChange }: ColorStudioProps) {
  const semanticColors = templates.flatMap((template) => template.colors.map((color) => ({ ...color, template: template.id })));
  const update = (next: Partial<ProBrushStyle>) => onChange({ ...value, ...next });
  const semanticValue = value.semanticColor ? `${value.semanticColor.template}:${value.semanticColor.intent}` : "";

  const bindSemantic = (encoded: string) => {
    const selected = semanticColors.find((color) => `${color.template}:${color.intent}` === encoded);
    update({
      semanticColor: selected
        ? { template: selected.template, label: selected.label, intent: selected.intent }
        : undefined,
    });
  };

  const applyPaletteColor = (color: SemanticColor, template = "brand") => update({
    color: color.value,
    semanticColor: { template, label: color.label, intent: color.intent },
  });

  const saveTemplate = () => {
    if (!onTemplatesChange) return;
    const customColor: SemanticColor = {
      id: `custom-${value.color.slice(1).toLowerCase()}`,
      label: value.semanticColor?.label ?? `Custom ${value.color.toUpperCase()}`,
      value: value.color,
      intent: value.semanticColor?.intent ?? "suggestion",
    };
    const existing = templates.find((template) => template.id === "custom");
    const next = existing
      ? templates.map((template) => template.id === "custom"
          ? { ...template, colors: [...template.colors.filter((color) => color.id !== customColor.id), customColor] }
          : template)
      : [...templates, { id: "custom", name: "Custom", colors: [customColor] }];
    onTemplatesChange(next);
  };

  return (
    <section id="sketchlayer-pro-color-panel" className="sketchlayer-pro-panel sketchlayer-pro-color" aria-label="Color Studio">
      <header><div><strong>Color Studio</strong><p>Color plus agent-readable meaning.</p></div></header>
      <div className="sketchlayer-pro-quick-colors" aria-label="Quick colors">
        {QUICK_COLORS.map((color) => (
          <button
            type="button"
            key={color}
            aria-label={`Use ${color}`}
            aria-pressed={value.color.toLowerCase() === color}
            style={{ backgroundColor: color }}
            onClick={() => update({ color })}
          />
        ))}
      </div>
      <ColorPicker value={parseColor(value.color)} onChange={(color) => update({ color: color.toString("hex") })}>
        <div className="sketchlayer-pro-color-controls">
          <ColorWheel aria-label="Hue" outerRadius={59} innerRadius={43}>
            <ColorWheelTrack />
            <ColorThumb />
          </ColorWheel>
          <ColorArea aria-label="Saturation and lightness" colorSpace="hsl" xChannel="saturation" yChannel="lightness">
            <ColorThumb />
          </ColorArea>
        </div>
      </ColorPicker>
      <div className="sketchlayer-pro-current-color">
        <span style={{ backgroundColor: value.color }} aria-hidden="true" />
        <code>{value.color.toUpperCase()}</code>
      </div>
      <label className="sketchlayer-pro-field">
        <span>Meaning</span>
        <select aria-label="Semantic meaning" value={semanticValue} onChange={(event) => bindSemantic(event.target.value)}>
          <option value="">No semantic meaning</option>
          {semanticColors.map((color) => <option key={`${color.template}:${color.id}`} value={`${color.template}:${color.intent}`}>{color.label}</option>)}
        </select>
      </label>
      {brandPalette.length > 0 && (
        <div className="sketchlayer-pro-brand">
          <span>Brand palette</span>
          <div>{brandPalette.map((color) => <button type="button" key={color.id} aria-label={color.label} style={{ backgroundColor: color.value }} onClick={() => applyPaletteColor(color)} />)}</div>
        </div>
      )}
      <label className="sketchlayer-pro-field">
        <span>Opacity <output>{Math.round(value.opacity * 100)}%</output></span>
        <input aria-label="Color opacity" type="range" min="0" max="1" step="0.05" value={value.opacity} onChange={(event) => update({ opacity: Number(event.target.value) })} />
      </label>
      <button type="button" className="sketchlayer-pro-secondary" disabled={!onTemplatesChange} onClick={saveTemplate}>Save to Template</button>
    </section>
  );
}
