import { CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { CloudCheck } from "@phosphor-icons/react/dist/csr/CloudCheck";
import { Export } from "@phosphor-icons/react/dist/csr/Export";
import { PencilSimple } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { ShareNetwork } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import { ScribbleLoop } from "@phosphor-icons/react/dist/csr/ScribbleLoop";
import { Trash } from "@phosphor-icons/react/dist/csr/Trash";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { FloatingToolbar, type ToolbarPopover } from "./components/FloatingToolbar";
import { JsonPreviewPanel } from "./components/JsonPreviewPanel";
import { LeftToolRail } from "./components/LeftToolRail";
import { SketchCanvas, type SketchCanvasHandle } from "./components/SketchCanvas";
import { createHistory, historyReducer } from "./lib/history";
import { downloadJson, serializeSketchDocument } from "./lib/serialization";
import { gradientCss } from "./lib/templates";
import {
  createBlankDocument,
  loadWorkspace,
  saveWorkspace,
  type WorkspaceDocument,
} from "./lib/workspace";
import type {
  BrushStyle,
  CanvasBackground,
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
  const [savedWorkspace, setSavedWorkspace] = useState(() => loadWorkspace(window.localStorage));
  const initialDocumentRef = useRef(
    savedWorkspace.documents.find(({ id }) => id === savedWorkspace.activeDocumentId) ?? savedWorkspace.documents[0],
  );
  const [history, dispatch] = useReducer(historyReducer, initialDocumentRef.current.annotations, createHistory);
  const [tool, setTool] = useState<DrawingTool>("pen");
  const [brush, setBrush] = useState(defaultBrush);
  const [background, setBackground] = useState<CanvasBackground>(initialDocumentRef.current.background);
  const [backgroundImage, setBackgroundImage] = useState(initialDocumentRef.current.backgroundImage
    ? { url: initialDocumentRef.current.backgroundImage.url, meta: initialDocumentRef.current.backgroundImage.meta }
    : null);
  const [backgroundImageFit, setBackgroundImageFit] = useState<"contain" | "cover">(
    initialDocumentRef.current.backgroundImage?.fit ?? "contain",
  );
  const [imageError, setImageError] = useState(false);
  const [openPopover, setOpenPopover] = useState<ToolbarPopover>(null);
  const [documentMenuOpen, setDocumentMenuOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState<string | null>(null);
  const [isLocallySaved, setIsLocallySaved] = useState(true);
  const [status, setStatus] = useState("Pen ready");
  const [toast, setToast] = useState<string | null>(null);
  const canvasRef = useRef<SketchCanvasHandle>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const activeDocument = savedWorkspace.documents.find(({ id }) => id === savedWorkspace.activeDocumentId)
    ?? savedWorkspace.documents[0];

  const exportOptions = useMemo(
    () => ({ background, ...(backgroundImage ? { backgroundImage: backgroundImage.meta } : {}) }),
    [background, backgroundImage],
  );
  const json = useMemo(
    () => serializeSketchDocument(history.present, exportOptions),
    [exportOptions, history.present],
  );

  useEffect(() => {
    setSavedWorkspace((current) => ({
      ...current,
      documents: current.documents.map((document) => document.id === current.activeDocumentId
        ? {
            ...document,
            annotations: history.present,
            background,
            backgroundImage: backgroundImage
              ? { ...backgroundImage, fit: backgroundImageFit }
              : null,
            updatedAt: new Date().toISOString(),
          }
        : document),
    }));
    setIsLocallySaved(false);
  }, [background, backgroundImage, backgroundImageFit, history.present]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLocallySaved(saveWorkspace(window.localStorage, savedWorkspace));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [savedWorkspace]);

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
    if (file.size > 3_000_000) {
      setToast("Choose an image smaller than 3 MB for local saving");
      setStatus("Background image is too large to save locally");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") return;
      setImageError(false);
      setBackgroundImage({ url: reader.result, meta: { name: file.name, includedInPng: true } });
      setBackgroundImageFit("contain");
      setStatus("Background image loaded and saved locally");
    });
    reader.addEventListener("error", () => {
      setImageError(true);
      setStatus("This image could not be loaded.");
    });
    reader.readAsDataURL(file);
  };

  const removeBackgroundImage = () => {
    setBackgroundImage(null);
    setImageError(false);
    setOpenPopover(null);
    setStatus("Background image removed");
    setToast("Background image removed");
  };

  const loadDocumentIntoCanvas = useCallback((document: WorkspaceDocument) => {
    dispatch({ type: "reset", annotations: document.annotations });
    setBackground(document.background);
    setBackgroundImage(document.backgroundImage
      ? { url: document.backgroundImage.url, meta: document.backgroundImage.meta }
      : null);
    setBackgroundImageFit(document.backgroundImage?.fit ?? "contain");
    setImageError(false);
    setTool("pen");
    setBrush(defaultBrush);
    setOpenPopover(null);
    setDocumentMenuOpen(false);
    setRenameDraft(null);
  }, []);

  const switchDocument = (document: WorkspaceDocument) => {
    setSavedWorkspace((current) => ({ ...current, activeDocumentId: document.id }));
    loadDocumentIntoCanvas(document);
    setStatus(`${document.title} ready`);
  };

  const openBlankBoard = () => {
    const blankCount = savedWorkspace.documents.filter(({ kind }) => kind === "blank").length;
    const document = createBlankDocument(blankCount + 1);
    setSavedWorkspace((current) => ({
      ...current,
      activeDocumentId: document.id,
      documents: [...current.documents, document],
    }));
    loadDocumentIntoCanvas(document);
    setStatus("New blank board ready");
    setToast("New blank board created");
  };

  const openExample = () => {
    const example = savedWorkspace.documents.find(({ kind }) => kind === "example");
    if (example) switchDocument(example);
  };

  const saveDocumentTitle = () => {
    const title = renameDraft?.trim();
    if (!title) return;
    setSavedWorkspace((current) => ({
      ...current,
      documents: current.documents.map((document) => document.id === current.activeDocumentId
        ? { ...document, title, updatedAt: new Date().toISOString() }
        : document),
    }));
    setRenameDraft(null);
    setToast("Board renamed");
  };

  const deleteDocument = (documentId: string) => {
    const document = savedWorkspace.documents.find(({ id }) => id === documentId);
    if (!document || document.kind === "example") return;
    const remaining = savedWorkspace.documents.filter(({ id }) => id !== documentId);
    const nextActive = documentId === savedWorkspace.activeDocumentId
      ? remaining.find(({ kind }) => kind === "example") ?? remaining[0]
      : activeDocument;
    setSavedWorkspace((current) => ({
      ...current,
      activeDocumentId: nextActive.id,
      documents: current.documents.filter(({ id }) => id !== documentId),
    }));
    if (documentId === savedWorkspace.activeDocumentId) loadDocumentIntoCanvas(nextActive);
    setToast(`${document.title} deleted`);
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
            <strong>{activeDocument.title}</strong>
            <span>{activeDocument.kind === "example" ? "Example" : "Saved"}</span>
            <CaretDown size={13} aria-hidden="true" />
          </button>
          {documentMenuOpen && (
            <div className="document-menu" role="menu" aria-label="Boards">
              <div className="document-menu__heading"><strong>Your boards</strong><small>Saved in this browser</small></div>
              <div className="document-menu__list">
                {savedWorkspace.documents.map((document) => (
                  <div className={document.id === activeDocument.id ? "document-row is-active" : "document-row"} key={document.id}>
                    <button
                      type="button"
                      role="menuitem"
                      aria-current={document.id === activeDocument.id ? "page" : undefined}
                      onClick={() => document.kind === "example" ? openExample() : switchDocument(document)}
                    >
                      <span className={document.kind === "example" ? "document-menu__preview" : "document-menu__board"} aria-hidden="true" />
                      <span><strong>{document.title}</strong><small>{document.annotations.length} annotations · {document.kind === "example" ? "Example" : "Local board"}</small></span>
                    </button>
                    {document.kind !== "example" && (
                      <button type="button" className="document-row__delete" aria-label={`Delete ${document.title}`} onClick={() => deleteDocument(document.id)}>
                        <Trash size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" role="menuitem" onClick={openBlankBoard}>
                <span className="document-menu__new" aria-hidden="true"><Plus size={16} /></span>
                <span><strong>New blank board</strong><small>Start without an image or annotations</small></span>
              </button>
              {renameDraft === null ? (
                <button type="button" role="menuitem" onClick={() => setRenameDraft(activeDocument.title)}>
                  <span className="document-menu__new" aria-hidden="true"><PencilSimple size={16} /></span>
                  <span><strong>Rename current board</strong><small>Give this board a recognizable name</small></span>
                </button>
              ) : (
                <div className="document-rename">
                  <label htmlFor="board-title">Board name</label>
                  <div>
                    <input
                      id="board-title"
                      value={renameDraft}
                      autoFocus
                      onChange={(event) => setRenameDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveDocumentTitle();
                        if (event.key === "Escape") setRenameDraft(null);
                      }}
                    />
                    <button type="button" aria-label="Save board name" onClick={saveDocumentTitle}><Check size={16} /></button>
                    <button type="button" aria-label="Cancel rename" onClick={() => setRenameDraft(null)}><X size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="top-actions">
          <button type="button" className="header-button mobile-new-board" aria-label="New blank board" onClick={openBlankBoard}><Plus size={16} /></button>
          <span className={isLocallySaved ? "saved-state" : "saved-state is-saving"}><CloudCheck size={16} />{isLocallySaved ? "Saved locally" : "Saving…"}</span>
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
            onChange={(event) => {
              chooseBackgroundImage(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
        </section>

        <JsonPreviewPanel annotations={history.present} value={json} onSend={sendToAgent} />
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}
      <p className="sr-only" aria-live="polite">{status}</p>
    </main>
  );
}
