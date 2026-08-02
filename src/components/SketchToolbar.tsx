import {
  ArrowBendUpLeft,
  ArrowBendUpRight,
  Eraser,
  Highlighter,
  PenNib,
  Trash,
} from "@phosphor-icons/react";
import type { BrushStyle, DrawingTool } from "../lib/types";

export type SketchToolbarProps = {
  tool: DrawingTool;
  brush: BrushStyle;
  canUndo?: boolean;
  canRedo?: boolean;
  canClear?: boolean;
  className?: string;
  onToolChange: (tool: DrawingTool) => void;
  onBrushChange: (brush: BrushStyle) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
};

const tools = [
  { tool: "pen", label: "Pen", icon: PenNib },
  { tool: "highlighter", label: "Highlighter", icon: Highlighter },
  { tool: "eraser", label: "Eraser", icon: Eraser },
] as const;

export function SketchToolbar({
  tool,
  brush,
  canUndo = false,
  canRedo = false,
  canClear = false,
  className,
  onToolChange,
  onBrushChange,
  onUndo,
  onRedo,
  onClear,
}: SketchToolbarProps) {
  return (
    <div className={["sketchlayer-toolbar", className].filter(Boolean).join(" ")} role="toolbar" aria-label="Sketch tools">
      <button type="button" aria-label="Undo" disabled={!canUndo} onClick={onUndo}>
        <ArrowBendUpLeft size={19} /><span>Undo</span>
      </button>
      <button type="button" aria-label="Redo" disabled={!canRedo} onClick={onRedo}>
        <ArrowBendUpRight size={19} /><span>Redo</span>
      </button>
      <span className="sketchlayer-toolbar__separator" aria-hidden="true" />
      {tools.map(({ tool: nextTool, label, icon: Icon }) => (
        <button
          key={nextTool}
          type="button"
          className={tool === nextTool ? "is-active" : ""}
          aria-label={label}
          aria-pressed={tool === nextTool}
          onClick={() => onToolChange(nextTool)}
        >
          <Icon size={20} weight={tool === nextTool ? "fill" : "regular"} /><span>{label}</span>
        </button>
      ))}
      <label className="sketchlayer-toolbar__color">
        <span>Color</span>
        <input
          type="color"
          aria-label="Brush color"
          value={brush.color}
          onChange={(event) => onBrushChange({ ...brush, color: event.target.value, semanticColor: undefined })}
        />
      </label>
      <label className="sketchlayer-toolbar__size">
        <span>Size</span>
        <input
          type="range"
          aria-label="Brush size"
          min="1"
          max="20"
          value={brush.size}
          onChange={(event) => onBrushChange({ ...brush, size: Number(event.target.value) })}
        />
      </label>
      <button type="button" aria-label="Clear canvas" disabled={!canClear} onClick={onClear}>
        <Trash size={19} /><span>Clear</span>
      </button>
    </div>
  );
}
