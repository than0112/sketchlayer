import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { FloatingToolbar, type ToolbarPopover } from "./components/FloatingToolbar";
import { JsonPreviewPanel } from "./components/JsonPreviewPanel";
import { SketchCanvas, type SketchCanvasHandle } from "./components/SketchCanvas";
import { createHistory, historyReducer } from "./lib/history";
import { DEFAULT_BACKGROUND, downloadJson, serializeSketchDocument } from "./lib/serialization";
import { gradientCss } from "./lib/templates";
import type {
  BrushStyle,
  CanvasBackground,
  CanvasImageMeta,
  DrawingTool,
  GradientPreset,
  SemanticColor,
} from "./lib/types";

const defaultBrush: BrushStyle = { color: "#202124", size: 4, opacity: 1 };

const toolLabels: Record<DrawingTool, string> = {
  pen: "Pen",
  highlighter: "Highlighter",
  eraser: "Object eraser",
  arrow: "Arrow",
  rectangle: "Rectangle",
  circle: "Circle",
};

const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export default function App() {
  const [history, dispatch] = useReducer(historyReducer, [], createHistory);
  const [tool, setTool] = useState<DrawingTool>("pen");
  const [brush, setBrush] = useState(defaultBrush);
  const [background, setBackground] = useState<CanvasBackground>(DEFAULT_BACKGROUND);
  const [backgroundImage, setBackgroundImage] = useState<{ url: string; meta: CanvasImageMeta } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [openPopover, setOpenPopover] = useState<ToolbarPopover>(null);
  const [status, setStatus] = useState("Pen ready");
  const canvasRef = useRef<SketchCanvasHandle>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const exportOptions = useMemo(
    () => ({ background, ...(backgroundImage ? { backgroundImage: backgroundImage.meta } : {}) }),
    [background, backgroundImage],
  );
  const json = useMemo(
    () => serializeSketchDocument(history.present, exportOptions),
    [exportOptions, history.present],
  );

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const chooseTool = useCallback((nextTool: DrawingTool) => {
    setTool(nextTool);
    setOpenPopover(null);
    setStatus(`${toolLabels[nextTool]} ready`);
  }, []);

  const exportJson = useCallback(() => {
    downloadJson(history.present, exportOptions);
    setStatus("Annotation JSON exported");
  }, [exportOptions, history.present]);

  const exportPng = useCallback(async () => {
    try {
      const blob = await canvasRef.current?.exportPng();
      if (!blob) throw new Error("Canvas is unavailable.");
      triggerBlobDownload(blob, "sketchlayer-canvas.png");
      setStatus("Canvas PNG exported");
    } catch {
      setStatus("Export failed. Try again.");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches("input, textarea, select")) return;
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "z") {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? "redo" : "undo" });
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === "s") {
        event.preventDefault();
        exportJson();
        return;
      }
      if (event.key === "Escape") {
        setOpenPopover(null);
        return;
      }
      const shortcuts: Partial<Record<string, DrawingTool>> = {
        p: "pen",
        h: "highlighter",
        e: "eraser",
        a: "arrow",
        r: "rectangle",
        c: "circle",
      };
      const nextTool = shortcuts[key];
      if (nextTool) chooseTool(nextTool);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chooseTool, exportJson]);

  const selectColor = (templateName: string, color: SemanticColor) => {
    setBrush((current) => ({
      ...current,
      color: color.value,
      semanticColor: { template: templateName, label: color.label, intent: color.intent },
    }));
    setOpenPopover(null);
    setStatus(`${color.label} semantic color selected`);
  };

  const selectGradient = (preset: GradientPreset) => {
    setBackground({
      type: "gradient",
      preset: preset.id,
      from: preset.from,
      to: preset.to,
      angle: preset.angle,
      css: gradientCss(preset),
      grid: true,
    });
    setStatus(`${preset.name} background applied`);
  };

  const copyGradient = async (preset: GradientPreset) => {
    try {
      await navigator.clipboard.writeText(gradientCss(preset));
      setStatus("Gradient CSS copied");
    } catch {
      setStatus("Copy failed. Try again.");
    }
  };

  const chooseBackgroundImage = (file: File | undefined) => {
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setImageError(false);
    setBackgroundImage({ url, meta: { name: file.name, includedInPng: true } });
    setStatus("Loading background image");
  };

  const handleBackgroundImageStatus = useCallback((nextStatus: "loaded" | "error") => {
    setImageError(nextStatus === "error");
    setStatus(nextStatus === "loaded" ? "Background image loaded" : "This image could not be loaded.");
  }, []);

  const selectedGradientId = background.type === "gradient" ? background.preset : undefined;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">S</span>
          <div><h1>SketchLayer</h1><p>AI-readable visual annotation</p></div>
        </div>
        <code className="install-command">npm install sketchlayer</code>
      </header>

      <div className="workspace">
        <section className="canvas-column" aria-label="Drawing workspace">
          <div className="canvas-meta">
            <div>
              <span className="tool-indicator" style={{ background: brush.color }} aria-hidden="true" />
              <strong>{toolLabels[tool]}</strong>
              <span>{tool === "eraser" ? "drag across annotations" : `${brush.size}px · ${Math.round(brush.opacity * 100)}%`}</span>
            </div>
            <span>{history.present.length} annotations</span>
          </div>
          <div className="canvas-frame">
            {history.present.length === 0 && <p className="canvas-hint">Start drawing</p>}
            {imageError && <p className="canvas-error" role="alert">This image could not be loaded.</p>}
            <SketchCanvas
              ref={canvasRef}
              value={{ annotations: history.present }}
              onChange={({ annotations }) => dispatch({ type: "commit", annotations })}
              tool={tool}
              brush={brush}
              background={background}
              backgroundImage={backgroundImage?.url}
              onBackgroundImageStatus={handleBackgroundImageStatus}
            />
          </div>
          <FloatingToolbar
            tool={tool}
            brush={brush}
            gradientId={selectedGradientId}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
            hasAnnotations={history.present.length > 0}
            openPopover={openPopover}
            onToolChange={chooseTool}
            onBrushChange={setBrush}
            onUndo={() => dispatch({ type: "undo" })}
            onRedo={() => dispatch({ type: "redo" })}
            onClear={() => dispatch({ type: "clear" })}
            onTogglePopover={(popover) => setOpenPopover((current) => (current === popover ? null : popover))}
            onColorSelect={selectColor}
            onGradientSelect={selectGradient}
            onGradientCopy={copyGradient}
            onChooseBackgroundImage={() => imageInputRef.current?.click()}
            onExportPng={exportPng}
            onExportJson={exportJson}
          />
          <input
            ref={imageInputRef}
            className="sr-only"
            type="file"
            accept="image/*"
            aria-label="Choose background image"
            onChange={(event) => chooseBackgroundImage(event.target.files?.[0])}
          />
        </section>
        <JsonPreviewPanel value={json} />
      </div>
      <p className="sr-only" aria-live="polite">{status}</p>
    </main>
  );
}
