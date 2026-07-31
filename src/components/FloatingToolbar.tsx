import { BrushSettings } from "./BrushSettings";
import { ColorTemplatePicker } from "./ColorTemplatePicker";
import { GradientCreator } from "./GradientCreator";
import { ToolbarButton } from "./ToolbarButton";
import type { BrushStyle, DrawingTool, GradientPreset, SemanticColor } from "../lib/types";

export type ToolbarPopover = "color" | "settings" | "gradient" | null;

type FloatingToolbarProps = {
  tool: DrawingTool;
  brush: BrushStyle;
  gradientId?: string;
  canUndo: boolean;
  canRedo: boolean;
  hasAnnotations: boolean;
  openPopover: ToolbarPopover;
  onToolChange: (tool: DrawingTool) => void;
  onBrushChange: (brush: BrushStyle) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onTogglePopover: (popover: Exclude<ToolbarPopover, null>) => void;
  onColorSelect: (templateName: string, color: SemanticColor) => void;
  onGradientSelect: (preset: GradientPreset) => void;
  onGradientCopy: (preset: GradientPreset) => void;
  onChooseBackgroundImage: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
};

export function FloatingToolbar(props: FloatingToolbarProps) {
  return (
    <div className="toolbar-wrap">
      {props.openPopover === "color" && (
        <ColorTemplatePicker selectedColor={props.brush.color} onSelect={props.onColorSelect} />
      )}
      {props.openPopover === "settings" && <BrushSettings brush={props.brush} onChange={props.onBrushChange} />}
      {props.openPopover === "gradient" && (
        <GradientCreator selectedId={props.gradientId} onSelect={props.onGradientSelect} onCopy={props.onGradientCopy} />
      )}
      <div className="floating-toolbar" role="toolbar" aria-label="Sketch tools">
        <div className="toolbar-group" aria-label="History">
          <ToolbarButton label="Undo (Ctrl+Z)" icon="↶" onClick={props.onUndo} disabled={!props.canUndo} />
          <ToolbarButton label="Redo (Ctrl+Shift+Z)" icon="↷" onClick={props.onRedo} disabled={!props.canRedo} />
          <ToolbarButton label="Clear canvas" icon="×" onClick={props.onClear} disabled={!props.hasAnnotations} />
        </div>
        <span className="toolbar-separator" aria-hidden="true" />
        <div className="toolbar-group" aria-label="Draw">
          <ToolbarButton label="Pen (P)" icon="✎" active={props.tool === "pen"} onClick={() => props.onToolChange("pen")} />
          <ToolbarButton label="Highlighter (H)" icon="▰" active={props.tool === "highlighter"} onClick={() => props.onToolChange("highlighter")} />
          <ToolbarButton label="Eraser (E)" icon="⌫" active={props.tool === "eraser"} onClick={() => props.onToolChange("eraser")} />
        </div>
        <span className="toolbar-separator" aria-hidden="true" />
        <div className="toolbar-group" aria-label="Create">
          <ToolbarButton label="Arrow (A)" icon="→" active={props.tool === "arrow"} onClick={() => props.onToolChange("arrow")} />
          <ToolbarButton label="Rectangle (R)" icon="□" active={props.tool === "rectangle"} onClick={() => props.onToolChange("rectangle")} />
          <ToolbarButton label="Circle (C)" icon="○" active={props.tool === "circle"} onClick={() => props.onToolChange("circle")} />
        </div>
        <span className="toolbar-separator" aria-hidden="true" />
        <div className="toolbar-group" aria-label="Style">
          <ToolbarButton
            label="Semantic colors"
            icon={<span className="active-color" style={{ background: props.brush.color }} />}
            active={props.openPopover === "color"}
            aria-haspopup="dialog"
            aria-expanded={props.openPopover === "color"}
            onClick={() => props.onTogglePopover("color")}
          />
          <ToolbarButton label="Brush settings" icon="≡" active={props.openPopover === "settings"} aria-haspopup="dialog" aria-expanded={props.openPopover === "settings"} onClick={() => props.onTogglePopover("settings")} />
          <ToolbarButton label="Canvas gradient" icon="◒" active={props.openPopover === "gradient"} aria-haspopup="dialog" aria-expanded={props.openPopover === "gradient"} onClick={() => props.onTogglePopover("gradient")} />
          <ToolbarButton label="Background image" icon="▧" onClick={props.onChooseBackgroundImage} />
        </div>
        <span className="toolbar-separator" aria-hidden="true" />
        <div className="toolbar-group" aria-label="Output">
          <ToolbarButton label="Export PNG" icon={<span className="text-icon">PNG</span>} onClick={props.onExportPng} />
          <ToolbarButton label="Export JSON (Ctrl+S)" icon="{}" onClick={props.onExportJson} />
        </div>
      </div>
    </div>
  );
}
