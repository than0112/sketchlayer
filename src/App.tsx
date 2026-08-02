import {
  CaretDown,
  CloudCheck,
  Export,
  Plus,
  ShareNetwork,
  ScribbleLoop,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { FloatingToolbar, type ToolbarPopover } from "./components/FloatingToolbar";
import { JsonPreviewPanel } from "./components/JsonPreviewPanel";
import { LeftToolRail } from "./components/LeftToolRail";
import { SketchCanvas, type SketchCanvasHandle } from "./components/SketchCanvas";
import { demoAnnotations, demoBackground, demoBackgroundImage } from "./lib/demo";
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

const defaultBrush: BrushStyle = { color: "#2563eb", size: 3, opacity: 1 };

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
  const [history, dispatch] = useReducer(historyReducer, demoAnnotations, createHistory);
  const [tool, setTool] = useState<DrawingTool>("pen");
  const [brush, setBrush] = useState(defaultBrush);
  const [background, setBackground] = useState<CanvasBackground>(demoBackground);
  const [backgroundImage, setBackgroundImage] = useState<{ url: string; meta: CanvasImageMeta } | null>(demoBackgroundImage);
  const [backgroundImageFit, setBackgroundImageFit] = useState<"contain" | "cover">("cover");
  const [imageError, setImageError] = useState(false);
  const [openPopover, setOpenPopover] = useState<ToolbarPopover>(null);
  const [documentMenuOpen, setDocumentMenuOpen] = useState(false);
  const [documentKind, setDocumentKind] = useState<"example" | "blank">("example");
  const [status, setStatus] = useState("Pen ready");
  const [toast, setToast] = useState<string | null>(null);
  const canvasRef = useRef<SketchCanvasHandle>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const releaseUploadedBackground = useCallback(() => {
    if (!objectUrlRef.current) return;
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }, []);

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

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const chooseTool = useCallback((nextTool: DrawingTool) => {
    setTool(nextTool);
    setDocumentMenuOpen(false);
    setOpenPopover(null);
    setStatus(`${toolLabels[nextTool]} ready`);
  }, []);

  const exportJson = useCallback(() => {
    downloadJson(history.present, exportOptions);
    setStatus("Annotation JSON exported");
    setToast("Annotation JSON exported");
  }, [exportOptions, history.present]);

  const exportPng = useCallback(async () => {
    try {
      const blob = await canvasRef.current?.exportPng();
      if (!blob) throw new Error("Canvas is unavailable.");
      triggerBlobDownload(blob, "sketchlayer-canvas.png");
      setStatus("Canvas PNG exported");
      setToast("Canvas PNG exported");
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
        setDocumentMenuOpen(false);
        return;
      }
      const shortcuts: Partial<Record<string, DrawingTool>> = {
        p: "pen", h: "highlighter", e: "eraser", a: "arrow", r: "rectangle", c: "circle",
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
      type: "gradient", preset: preset.id, from: preset.from, to: preset.to,
      angle: preset.angle, css: gradientCss(preset), grid: true,
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
    releaseUploadedBackground();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setImageError(false);
    setBackgroundImage({ url, meta: { name: file.name, includedInPng: true } });
    setBackgroundImageFit("contain");
    setStatus("Loading background image");
  };

  const removeBackgroundImage = () => {
    releaseUploadedBackground();
    setBackgroundImage(null);
    setImageError(false);
    setOpenPopover(null);
    setStatus("Background image removed");
    setToast("Background image removed");
  };

  const openBlankBoard = () => {
    releaseUploadedBackground();
    dispatch({ type: "reset", annotations: [] });
    setBackground(DEFAULT_BACKGROUND);
    setBackgroundImage(null);
    setBackgroundImageFit("contain");
    setImageError(false);
    setTool("pen");
    setBrush(defaultBrush);
    setOpenPopover(null);
    setDocumentMenuOpen(false);
    setDocumentKind("blank");
    setStatus("New blank board ready");
    setToast("New blank board created");
  };

  const openExample = () => {
    releaseUploadedBackground();
    dispatch({ type: "reset", annotations: demoAnnotations });
    setBackground(demoBackground);
    setBackgroundImage(demoBackgroundImage);
    setBackgroundImageFit("cover");
    setImageError(false);
    setTool("pen");
    setBrush(defaultBrush);
    setOpenPopover(null);
    setDocumentMenuOpen(false);
    setDocumentKind("example");
    setStatus("Example board loaded");
    setToast("AI Dashboard Feedback example loaded");
  };

  const handleBackgroundImageStatus = useCallback((nextStatus: "loaded" | "error") => {
    setImageError(nextStatus === "error");
    setStatus(nextStatus === "loaded" ? "Background image loaded" : "This image could not be loaded.");
  }, []);

  const shareWorkspace = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast("Workspace link copied");
    } catch {
      setToast("Workspace is ready to share");
    }
  };

  const sendToAgent = () => {
    setToast(`${history.present.length} annotations sent to agent`);
    setStatus("Structured feedback sent to agent");
  };

  const selectedGradientId = background.type === "gradient" ? background.preset : undefined;

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true"><ScribbleLoop size={23} weight="bold" /></span>
          <h1>SketchLayer</h1>
        </div>
        <div className="document-switcher">
          <button
            type="button"
            className="document-title"
            aria-haspopup="menu"
            aria-expanded={documentMenuOpen}
            onClick={() => {
              setOpenPopover(null);
              setDocumentMenuOpen((current) => !current);
            }}
          >
            <strong>{documentKind === "example" ? "AI Dashboard Feedback" : "Untitled board"}</strong>
            <span>{documentKind === "example" ? "Example" : "Blank"}</span>
            <CaretDown size={13} aria-hidden="true" />
          </button>
          {documentMenuOpen && (
            <div className="document-menu" role="menu" aria-label="Boards">
              <button type="button" role="menuitem" onClick={openExample}>
                <span className="document-menu__preview" aria-hidden="true" />
                <span><strong>AI Dashboard Feedback</strong><small>Reload the annotated example</small></span>
              </button>
              <button type="button" role="menuitem" onClick={openBlankBoard}>
                <span className="document-menu__new" aria-hidden="true"><Plus size={16} /></span>
                <span><strong>New blank board</strong><small>Start without an image or annotations</small></span>
              </button>
            </div>
          )}
        </div>
        <div className="top-actions">
          <button type="button" className="header-button mobile-new-board" aria-label="New blank board" onClick={openBlankBoard}><Plus size={16} /></button>
          <span className="saved-state"><CloudCheck size={16} />Saved 2m ago</span>
          <button type="button" className="header-button" onClick={shareWorkspace}><ShareNetwork size={16} />Share</button>
          <button type="button" className="header-button header-button--primary" onClick={exportJson}><Export size={16} />Export JSON</button>
        </div>
      </header>

      <div className="workspace">
        <LeftToolRail />

        <section className="canvas-column" aria-label="Drawing workspace">
          <div className="canvas-frame">
            {imageError && <p className="canvas-error" role="alert">This image could not be loaded.</p>}
            <SketchCanvas
              ref={canvasRef}
              value={{ annotations: history.present }}
              onChange={({ annotations }) => dispatch({ type: "commit", annotations })}
              tool={tool}
              brush={brush}
              background={background}
              backgroundImage={backgroundImage?.url}
              backgroundImageFit={backgroundImageFit}
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
            hasBackgroundImage={Boolean(backgroundImage)}
            openPopover={openPopover}
            onToolChange={chooseTool}
            onBrushChange={setBrush}
            onUndo={() => dispatch({ type: "undo" })}
            onRedo={() => dispatch({ type: "redo" })}
            onClear={() => dispatch({ type: "clear" })}
            onTogglePopover={(popover) => {
              setDocumentMenuOpen(false);
              setOpenPopover((current) => (current === popover ? null : popover));
            }}
            onColorSelect={selectColor}
            onGradientSelect={selectGradient}
            onGradientCopy={copyGradient}
            onChooseBackgroundImage={() => imageInputRef.current?.click()}
            onRemoveBackgroundImage={removeBackgroundImage}
            onExportPng={exportPng}
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

        <JsonPreviewPanel annotations={history.present} value={json} onSend={sendToAgent} />
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}
      <p className="sr-only" aria-live="polite">{status}</p>
    </main>
  );
}
