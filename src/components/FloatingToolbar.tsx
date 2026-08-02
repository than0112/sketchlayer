import {
  ArrowBendUpLeft,
  ArrowBendUpRight,
  ArrowUpRight,
  Circle,
  DotsThree,
  Eraser,
  FilePng,
  Gradient,
  Highlighter,
  Image,
  ImageBroken,
  Palette,
  PenNib,
  Rectangle,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import { BrushSettings } from "./BrushSettings";
import { ColorTemplatePicker } from "./ColorTemplatePicker";
import { GradientCreator } from "./GradientCreator";
import type { BrushStyle, DrawingTool, GradientPreset, SemanticColor } from "../lib/types";

export type ToolbarPopover = "color" | "settings" | "gradient" | "more" | null;

type FloatingToolbarProps = {
  tool: DrawingTool;
  brush: BrushStyle;
  gradientId?: string;
  canUndo: boolean;
  canRedo: boolean;
  hasAnnotations: boolean;
  hasBackgroundImage: boolean;
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
  onRemoveBackgroundImage: () => void;
  onExportPng: () => void;
};

const swatches = ["#111827", "#2563eb", "#ef4444", "#16a34a", "#facc15"];

export function FloatingToolbar(props: FloatingToolbarProps) {
  const setPlainColor = (color: string) => props.onBrushChange({ ...props.brush, color, semanticColor: undefined });

  return (
    <div className="toolbar-wrap">
      {props.openPopover === "color" && (
        <ColorTemplatePicker selectedColor={props.brush.color} onSelect={props.onColorSelect} />
      )}
      {props.openPopover === "settings" && <BrushSettings brush={props.brush} onChange={props.onBrushChange} />}
      {props.openPopover === "gradient" && (
        <GradientCreator selectedId={props.gradientId} onSelect={props.onGradientSelect} onCopy={props.onGradientCopy} />
      )}
      {props.openPopover === "more" && (
        <div className="more-popover" role="dialog" aria-label="More canvas tools">
          <button type="button" onClick={() => props.onToolChange("rectangle")}><Rectangle size={18} />Rectangle</button>
          <button type="button" onClick={() => props.onToolChange("circle")}><Circle size={18} />Circle</button>
          <button type="button" onClick={() => props.onTogglePopover("gradient")}><Gradient size={18} />Gradient</button>
          <button type="button" onClick={props.onChooseBackgroundImage}><Image size={18} />Background</button>
          {props.hasBackgroundImage && (
            <button type="button" onClick={props.onRemoveBackgroundImage}><ImageBroken size={18} />Remove background image</button>
          )}
          <button type="button" onClick={props.onExportPng}><FilePng size={18} />Export PNG</button>
        </div>
      )}

      <div className="floating-toolbar" role="toolbar" aria-label="Sketch tools">
        <div className="toolbar-history" aria-label="History">
          <button type="button" aria-label="Undo (Ctrl+Z)" onClick={props.onUndo} disabled={!props.canUndo}>
            <ArrowBendUpLeft size={20} /><span>Undo</span>
          </button>
          <button type="button" aria-label="Redo (Ctrl+Shift+Z)" onClick={props.onRedo} disabled={!props.canRedo}>
            <ArrowBendUpRight size={20} /><span>Redo</span>
          </button>
        </div>

        <span className="toolbar-separator" aria-hidden="true" />

        <div className="toolbar-tools" aria-label="Draw">
          <button type="button" className={props.tool === "pen" ? "tool-choice is-active" : "tool-choice"} aria-label="Pen (P)" aria-pressed={props.tool === "pen"} onClick={() => props.onToolChange("pen")}>
            <PenNib size={22} weight={props.tool === "pen" ? "fill" : "regular"} /><span>Pen</span>
          </button>
          <button type="button" className={props.tool === "arrow" ? "tool-choice is-active" : "tool-choice"} aria-label="Arrow (A)" aria-pressed={props.tool === "arrow"} onClick={() => props.onToolChange("arrow")}>
            <ArrowUpRight size={22} /><span>Arrow</span>
          </button>
          <button type="button" className={props.tool === "highlighter" ? "tool-choice is-active" : "tool-choice"} aria-label="Highlighter (H)" aria-pressed={props.tool === "highlighter"} onClick={() => props.onToolChange("highlighter")}>
            <Highlighter size={22} weight={props.tool === "highlighter" ? "fill" : "regular"} /><span>Highlighter</span>
          </button>
          <button type="button" className={props.tool === "eraser" ? "tool-choice is-active" : "tool-choice"} aria-label="Eraser (E)" aria-pressed={props.tool === "eraser"} onClick={() => props.onToolChange("eraser")}>
            <Eraser size={22} /><span>Eraser</span>
          </button>
        </div>

        <span className="toolbar-separator" aria-hidden="true" />

        <div className="toolbar-swatches" aria-label="Colors">
          {swatches.map((color) => (
            <button
              type="button"
              key={color}
              aria-label={`Color ${color}`}
              aria-pressed={props.brush.color === color}
              className={props.brush.color === color ? "color-swatch is-active" : "color-swatch"}
              style={{ background: color }}
              onClick={() => setPlainColor(color)}
            />
          ))}
          <button type="button" className="palette-button" aria-label="Semantic colors" aria-expanded={props.openPopover === "color"} onClick={() => props.onTogglePopover("color")}>
            <Palette size={18} />
          </button>
        </div>

        <span className="toolbar-separator" aria-hidden="true" />

        <div className="toolbar-style-controls" aria-label="Style">
          <button type="button" aria-label="Brush settings" aria-expanded={props.openPopover === "settings"} onClick={() => props.onTogglePopover("settings")}>
            <SlidersHorizontal size={19} /><span><small>Size</small>{props.brush.size}px</span>
          </button>
          <button type="button" aria-label="Opacity settings" aria-expanded={props.openPopover === "settings"} onClick={() => props.onTogglePopover("settings")}>
            <span className="opacity-icon" style={{ opacity: props.brush.opacity }} />
            <span><small>Opacity</small>{Math.round(props.brush.opacity * 100)}%</span>
          </button>
          <button type="button" className="more-button" aria-label="More canvas tools" aria-expanded={props.openPopover === "more"} onClick={() => props.onTogglePopover("more")}>
            <DotsThree size={21} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
