import type { CanvasTool } from "../../lib/types";
import type { ProPanel } from "../types";

export type ProToolbarProps = {
  tool: CanvasTool;
  activePanel: ProPanel;
  canSend?: boolean;
  onToolChange: (tool: CanvasTool) => void;
  onPanelChange: (panel: ProPanel) => void;
  onExport?: () => void;
};

const panelButton = (panel: Exclude<ProPanel, null>, label: string, activePanel: ProPanel, onChange: (panel: ProPanel) => void) => (
  <button
    type="button"
    className="sketchlayer-pro-toolbar__button"
    aria-expanded={activePanel === panel}
    aria-controls={`sketchlayer-pro-${panel}-panel`}
    data-active={activePanel === panel || undefined}
    onClick={() => onChange(panel)}
  >
    <span aria-hidden="true" className={`sketchlayer-pro-icon sketchlayer-pro-icon--${panel}`} />
    {label}
  </button>
);

export function ProToolbar({ tool, activePanel, canSend = true, onToolChange, onPanelChange, onExport }: ProToolbarProps) {
  return (
    <div className="sketchlayer-pro-toolbar" role="toolbar" aria-label="SketchLayer Pro tools">
      <button
        type="button"
        className="sketchlayer-pro-toolbar__button"
        aria-pressed={tool === "select"}
        data-active={tool === "select" || undefined}
        onClick={() => onToolChange("select")}
      >
        <span aria-hidden="true" className="sketchlayer-pro-icon sketchlayer-pro-icon--select" />
        Select
      </button>
      {panelButton("draw", "Draw", activePanel, onPanelChange)}
      {panelButton("shape", "Shape", activePanel, onPanelChange)}
      {panelButton("color", "Color", activePanel, onPanelChange)}
      <button
        type="button"
        className="sketchlayer-pro-toolbar__button"
        aria-expanded={activePanel === "export"}
        aria-controls="sketchlayer-pro-export-panel"
        data-active={activePanel === "export" || undefined}
        onClick={() => {
          onPanelChange("export");
          onExport?.();
        }}
        disabled={!canSend}
        title={!canSend ? "Complete every annotation target and note first" : undefined}
      >
        <span aria-hidden="true" className="sketchlayer-pro-icon sketchlayer-pro-icon--export" />
        Export
      </button>
    </div>
  );
}
