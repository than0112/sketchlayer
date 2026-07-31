export type Point = {
  x: number;
  y: number;
  pressure?: number;
};

export type StrokeTool = "pen" | "highlighter";
export type ShapeTool = "arrow" | "rectangle" | "circle";
export type DrawingTool = StrokeTool | ShapeTool | "eraser";

export type SemanticIntent =
  | "problem"
  | "suggestion"
  | "approved"
  | "highlight"
  | "idea"
  | "risk";

export type SemanticColorMeta = {
  template: string;
  label: string;
  intent: SemanticIntent;
};

export type SemanticColor = {
  id: string;
  label: string;
  value: string;
  intent: SemanticIntent;
};

export type ColorTemplate = {
  id: string;
  name: string;
  colors: SemanticColor[];
};

export type GradientPreset = {
  id: string;
  name: string;
  type: "linear";
  from: string;
  to: string;
  angle: number;
};

export type Stroke = {
  id: string;
  type: "stroke";
  tool: StrokeTool;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  semanticColor?: SemanticColorMeta;
};

export type ShapeAnnotation = {
  id: string;
  type: "shape";
  shape: "arrow" | "rectangle" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor?: string;
  size: number;
  opacity: number;
  dashed?: boolean;
  semanticColor?: SemanticColorMeta;
};

export type Annotation = Stroke | ShapeAnnotation;

export type CanvasBackground =
  | {
      type: "color";
      value: string;
      grid: boolean;
    }
  | {
      type: "gradient";
      preset: string;
      from: string;
      to: string;
      angle: number;
      css: string;
      grid: boolean;
    };

export type CanvasImageMeta = {
  name: string;
  includedInPng: true;
};

export type SketchDocument = {
  version: "0.1.0";
  canvas: {
    width: number;
    height: number;
    background: CanvasBackground;
    backgroundImage?: CanvasImageMeta;
  };
  annotations: Annotation[];
};

export type SketchValue = {
  annotations: Annotation[];
};

export type BrushStyle = {
  color: string;
  size: number;
  opacity: number;
  semanticColor?: SemanticColorMeta;
};

export type ExportCanvasOptions = {
  background: CanvasBackground;
  backgroundImage?: CanvasImageMeta;
};
