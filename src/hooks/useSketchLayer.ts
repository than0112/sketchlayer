import { useCallback, useMemo, useReducer, useState } from "react";
import { createHistory, historyReducer } from "../lib/history";
import type { Annotation, BrushStyle, DrawingTool, SketchValue } from "../lib/types";

const DEFAULT_BRUSH: BrushStyle = { color: "#111827", size: 4, opacity: 1 };

export type UseSketchLayerOptions = {
  initialValue?: SketchValue;
  initialTool?: DrawingTool;
  initialBrush?: BrushStyle;
  onChange?: (value: SketchValue) => void;
};

export type UseSketchLayerResult = {
  value: SketchValue;
  annotations: Annotation[];
  tool: DrawingTool;
  brush: BrushStyle;
  canUndo: boolean;
  canRedo: boolean;
  setTool: (tool: DrawingTool) => void;
  setBrush: (brush: BrushStyle) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  onCanvasChange: (value: SketchValue) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  reset: (value?: SketchValue) => void;
};

export function useSketchLayer(options: UseSketchLayerOptions = {}): UseSketchLayerResult {
  const { initialValue = { annotations: [] }, initialTool = "pen", initialBrush = DEFAULT_BRUSH, onChange } = options;
  const [history, dispatch] = useReducer(historyReducer, initialValue.annotations, createHistory);
  const [tool, setTool] = useState<DrawingTool>(initialTool);
  const [brush, setBrush] = useState<BrushStyle>(initialBrush);

  const publish = useCallback((annotations: Annotation[]) => {
    dispatch({ type: "commit", annotations });
    onChange?.({ annotations });
  }, [onChange]);

  const onCanvasChange = useCallback((value: SketchValue) => publish(value.annotations), [publish]);
  const undo = useCallback(() => {
    const previous = history.past.at(-1);
    if (!previous) return;
    dispatch({ type: "undo" });
    onChange?.({ annotations: previous });
  }, [history.past, onChange]);
  const redo = useCallback(() => {
    const next = history.future[0];
    if (!next) return;
    dispatch({ type: "redo" });
    onChange?.({ annotations: next });
  }, [history.future, onChange]);
  const clear = useCallback(() => {
    if (history.present.length === 0) return;
    dispatch({ type: "clear" });
    onChange?.({ annotations: [] });
  }, [history.present.length, onChange]);
  const reset = useCallback((value: SketchValue = { annotations: [] }) => {
    dispatch({ type: "reset", annotations: value.annotations });
    onChange?.(value);
  }, [onChange]);

  return useMemo(() => ({
    value: { annotations: history.present },
    annotations: history.present,
    tool,
    brush,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    setTool,
    setBrush,
    setAnnotations: publish,
    onCanvasChange,
    undo,
    redo,
    clear,
    reset,
  }), [brush, clear, history, onCanvasChange, publish, redo, reset, tool, undo]);
}
