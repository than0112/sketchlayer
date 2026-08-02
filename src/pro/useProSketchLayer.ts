import { useCallback, useMemo, useRef, useState } from "react";
import { useSketchLayer } from "../hooks/useSketchLayer";
import type { Annotation, BrushStyle, CanvasTool, Point, SketchValue, Stroke } from "../lib/types";
import { getAnnotationInstruction, isAgentReady } from "./compatibility";
import { createProOutline } from "./freehand";
import { getAIShapePreset } from "./presets";
import type {
  AIShapePresetId,
  InstructionDraft,
  ProBrushStyle,
  ProPanel,
  ResolverStatus,
  UseProSketchLayerOptions,
  UseProSketchLayerResult,
} from "./types";

const DEFAULT_PRO_BRUSH: ProBrushStyle = {
  color: "#111827",
  size: 4,
  opacity: 1,
  smoothing: 0.55,
  pressure: true,
  engine: "perfect-freehand",
};

const anchorFor = (annotation: Annotation): Point => {
  if (annotation.type === "stroke") return annotation.points.at(-1) ?? { x: 0, y: 0 };
  if (annotation.shape === "arrow") return { x: annotation.x + annotation.width, y: annotation.y + annotation.height };
  return { x: annotation.x + annotation.width / 2, y: annotation.y + annotation.height / 2 };
};

const validDraft = (draft: InstructionDraft | null) => {
  if (!draft?.note.trim() || !draft.target) return false;
  return draft.target.kind === "selector" ? Boolean(draft.target.value.trim()) : Boolean(draft.target.id.trim());
};

export function useProSketchLayer(options: UseProSketchLayerOptions = {}): UseProSketchLayerResult {
  const initialBrush = { ...DEFAULT_PRO_BRUSH, ...options.initialBrush };
  const core = useSketchLayer({
    initialValue: options.initialValue,
    initialBrush,
    onChange: options.onChange,
  });
  const [tool, setToolState] = useState<CanvasTool>(options.initialTool ?? "pen");
  const [brush, setBrush] = useState<ProBrushStyle>(initialBrush);
  const [activePanel, setActivePanelState] = useState<ProPanel>(null);
  const [activeShapePresetId, setActiveShapePresetId] = useState<AIShapePresetId | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [inspectorDraft, setInspectorDraftState] = useState<InstructionDraft | null>(null);
  const [resolverStatus, setResolverStatus] = useState<ResolverStatus>("idle");
  const [isInspectorNew, setIsInspectorNew] = useState(false);
  const resolverRequestRef = useRef(0);
  const annotationsRef = useRef(core.annotations);
  annotationsRef.current = core.annotations;

  const closeInspector = useCallback(() => {
    resolverRequestRef.current += 1;
    setInspectorDraftState(null);
    setResolverStatus("idle");
    setIsInspectorNew(false);
  }, []);

  const setActivePanel = useCallback((panel: ProPanel) => {
    setActivePanelState((current) => current === panel ? null : panel);
  }, []);

  const setTool = useCallback((nextTool: CanvasTool) => {
    setToolState(nextTool);
    setActiveShapePresetId(null);
    if (nextTool === "select") setActivePanelState(null);
  }, []);

  const selectShapePreset = useCallback((id: AIShapePresetId) => {
    const preset = getAIShapePreset(id);
    if (!preset) return;
    setActiveShapePresetId(id);
    setToolState(preset.shape);
    setBrush((current) => ({ ...current, color: preset.color, semanticColor: preset.semanticColor }));
    setActivePanelState(null);
  }, []);

  const beginInspector = useCallback((annotation: Annotation, isNew: boolean, draft?: InstructionDraft) => {
    const existing = getAnnotationInstruction(annotation);
    setSelectedAnnotationId(annotation.id);
    setInspectorDraftState(draft ?? existing ?? { operation: "comment", note: "", severity: "medium" });
    setResolverStatus(existing?.target ? "resolved" : "idle");
    setIsInspectorNew(isNew);
  }, []);

  const resolveAnnotationTarget = useCallback(async (annotation: Annotation) => {
    if (!options.resolveTarget) {
      setResolverStatus("manual");
      return;
    }
    const request = ++resolverRequestRef.current;
    setResolverStatus("resolving");
    try {
      const target = await options.resolveTarget({ annotation, anchor: anchorFor(annotation) });
      if (request !== resolverRequestRef.current) return;
      if (!target) {
        setResolverStatus("manual");
        return;
      }
      setInspectorDraftState((current) => current ? { ...current, target } : current);
      setResolverStatus("resolved");
    } catch {
      if (request === resolverRequestRef.current) setResolverStatus("manual");
    }
  }, [options.resolveTarget]);

  const onCanvasChange = useCallback((value: SketchValue) => {
    const previousIds = new Set(annotationsRef.current.map((annotation) => annotation.id));
    const newAnnotation = value.annotations.find((annotation) => !previousIds.has(annotation.id));
    let annotations = value.annotations;
    let enhanced: Annotation | undefined;

    if (newAnnotation?.type === "stroke") {
      const stroke: Stroke = {
        ...newAnnotation,
        proBrush: { smoothing: brush.smoothing, pressure: brush.pressure, engine: "perfect-freehand" },
      };
      enhanced = { ...stroke, outline: createProOutline(stroke, brush) };
    } else if (newAnnotation?.type === "shape") {
      const preset = getAIShapePreset(activeShapePresetId);
      enhanced = preset
        ? {
            ...newAnnotation,
            shape: preset.shape,
            strokeColor: preset.color,
            semanticColor: preset.semanticColor,
            dashed: preset.dashed,
          }
        : newAnnotation;
    }

    if (newAnnotation && enhanced) {
      annotations = value.annotations.map((annotation) => annotation.id === newAnnotation.id ? enhanced! : annotation);
    }
    core.setAnnotations(annotations);

    const preset = newAnnotation?.type === "shape" ? getAIShapePreset(activeShapePresetId) : null;
    if (enhanced && preset) {
      beginInspector(enhanced, true, {
        operation: preset.operation,
        note: "",
        severity: preset.severity,
      });
      void resolveAnnotationTarget(enhanced);
    }
  }, [activeShapePresetId, beginInspector, brush, core, resolveAnnotationTarget]);

  const selectAnnotation = useCallback((id: string | null) => {
    closeInspector();
    setSelectedAnnotationId(id);
    if (!id) return;
    const annotation = annotationsRef.current.find((item) => item.id === id);
    if (annotation) beginInspector(annotation, false);
  }, [beginInspector, closeInspector]);

  const saveInspector = useCallback(() => {
    if (!selectedAnnotationId || !validDraft(inspectorDraft)) return false;
    core.setAnnotations(core.annotations.map((annotation) =>
      annotation.id === selectedAnnotationId
        ? { ...annotation, instruction: inspectorDraft as NonNullable<typeof annotation.instruction> }
        : annotation,
    ));
    closeInspector();
    return true;
  }, [closeInspector, core, inspectorDraft, selectedAnnotationId]);

  const cancelInspector = useCallback(() => {
    if (isInspectorNew && selectedAnnotationId) {
      core.setAnnotations(core.annotations.filter((annotation) => annotation.id !== selectedAnnotationId));
      setSelectedAnnotationId(null);
    }
    closeInspector();
  }, [closeInspector, core, isInspectorNew, selectedAnnotationId]);

  const wrapHistoryAction = useCallback((action: () => void) => () => {
    action();
    setSelectedAnnotationId(null);
    closeInspector();
  }, [closeInspector]);

  const selectedAnnotation = core.annotations.find((annotation) => annotation.id === selectedAnnotationId) ?? null;
  const canvasBrush: BrushStyle = useMemo(() => ({
    color: brush.color,
    size: brush.size,
    opacity: brush.opacity,
    semanticColor: brush.semanticColor,
  }), [brush]);

  return {
    value: core.value,
    annotations: core.annotations,
    tool,
    brush,
    canvasBrush,
    activePanel,
    activeShapePresetId,
    selectedAnnotationId,
    selectedAnnotation,
    inspectorDraft,
    resolverStatus,
    isInspectorNew,
    canUndo: core.canUndo,
    canRedo: core.canRedo,
    canSend: core.annotations.length > 0 && core.annotations.every(isAgentReady),
    setActivePanel,
    setTool,
    setBrush,
    selectShapePreset,
    selectAnnotation,
    setInspectorDraft: setInspectorDraftState,
    saveInspector,
    cancelInspector,
    onCanvasChange,
    undo: wrapHistoryAction(core.undo),
    redo: wrapHistoryAction(core.redo),
    clear: wrapHistoryAction(core.clear),
    reset: (value) => {
      core.reset(value);
      setSelectedAnnotationId(null);
      closeInspector();
    },
  };
}
