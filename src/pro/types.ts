import type {
  Annotation,
  BrushStyle,
  CanvasTool,
  ColorTemplate,
  InstructionMeta,
  Point,
  SemanticColor,
  SemanticColorMeta,
  ShapeTool,
  SketchValue,
  TargetRef,
} from "../lib/types";

export type ProPanel = "draw" | "shape" | "color" | "export" | null;

export type ProBrushStyle = BrushStyle & {
  smoothing: number;
  pressure: boolean;
  engine: "perfect-freehand";
};

export type AIShapePresetId = "problem-circle" | "suggestion-arrow" | "preserve-marker";

export type AIShapePreset = {
  id: AIShapePresetId;
  label: string;
  description: string;
  shape: ShapeTool;
  color: string;
  semanticColor: SemanticColorMeta;
  operation: InstructionMeta["operation"];
  severity: InstructionMeta["severity"];
  dashed?: boolean;
};

export type InstructionDraft = Omit<InstructionMeta, "target"> & {
  target?: TargetRef;
};

export type TargetResolver = (input: {
  annotation: Annotation;
  anchor: Point;
}) => TargetRef | null | Promise<TargetRef | null>;

export type ResolverStatus = "idle" | "resolving" | "resolved" | "manual";

export type UseProSketchLayerOptions = {
  initialValue?: SketchValue;
  initialTool?: CanvasTool;
  initialBrush?: Partial<ProBrushStyle>;
  resolveTarget?: TargetResolver;
  onChange?: (value: SketchValue) => void;
};

export type UseProSketchLayerResult = {
  value: SketchValue;
  annotations: Annotation[];
  tool: CanvasTool;
  brush: ProBrushStyle;
  canvasBrush: BrushStyle;
  activePanel: ProPanel;
  activeShapePresetId: AIShapePresetId | null;
  selectedAnnotationId: string | null;
  selectedAnnotation: Annotation | null;
  inspectorDraft: InstructionDraft | null;
  resolverStatus: ResolverStatus;
  isInspectorNew: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canSend: boolean;
  setActivePanel: (panel: ProPanel) => void;
  setTool: (tool: CanvasTool) => void;
  setBrush: (brush: ProBrushStyle) => void;
  selectShapePreset: (id: AIShapePresetId) => void;
  selectAnnotation: (id: string | null) => void;
  setInspectorDraft: (draft: InstructionDraft) => void;
  saveInspector: () => boolean;
  cancelInspector: () => void;
  onCanvasChange: (value: SketchValue) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  reset: (value?: SketchValue) => void;
};

export type ColorStudioProps = {
  value: ProBrushStyle;
  templates: ColorTemplate[];
  brandPalette?: SemanticColor[];
  onChange: (value: ProBrushStyle) => void;
  onTemplatesChange?: (templates: ColorTemplate[]) => void;
};
