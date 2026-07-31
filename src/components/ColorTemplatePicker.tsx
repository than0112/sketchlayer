import { colorTemplates } from "../lib/templates";
import type { SemanticColor } from "../lib/types";

type ColorTemplatePickerProps = {
  selectedColor: string;
  onSelect: (templateName: string, color: SemanticColor) => void;
};

export function ColorTemplatePicker({ selectedColor, onSelect }: ColorTemplatePickerProps) {
  return (
    <div className="color-popover" role="dialog" aria-label="Semantic color template">
      <div className="popover-heading"><span>Semantic colors</span><small>AI-readable intent</small></div>
      {colorTemplates.map((template) => (
        <section className="template-group" key={template.id} aria-label={template.name}>
          <h3>{template.name}</h3>
          <div className="semantic-colors">
            {template.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                className={selectedColor === color.value ? "semantic-color is-selected" : "semantic-color"}
                onClick={() => onSelect(template.name, color)}
                aria-pressed={selectedColor === color.value}
              >
                <span className="color-dot" style={{ background: color.value }} aria-hidden="true" />
                <span>{color.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
