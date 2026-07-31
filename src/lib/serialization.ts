import type { Annotation, CanvasBackground, ExportCanvasOptions, SketchDocument } from "./types";

export const SKETCH_VERSION = "0.1.0" as const;
export const CANVAS_SIZE = { width: 960, height: 540 } as const;

export const DEFAULT_BACKGROUND: CanvasBackground = {
  type: "color",
  value: "#f8f7f3",
  grid: true,
};

export function createSketchDocument(
  annotations: Annotation[],
  options: ExportCanvasOptions = { background: DEFAULT_BACKGROUND },
): SketchDocument {
  return {
    version: SKETCH_VERSION,
    canvas: {
      ...CANVAS_SIZE,
      background: options.background,
      ...(options.backgroundImage ? { backgroundImage: options.backgroundImage } : {}),
    },
    annotations,
  };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function isAnnotation(value: unknown): value is Annotation {
  if (!isObject(value) || typeof value.id !== "string") return false;
  if (value.type === "stroke") {
    return (
      (value.tool === "pen" || value.tool === "highlighter") &&
      Array.isArray(value.points) &&
      typeof value.color === "string" &&
      typeof value.size === "number" &&
      typeof value.opacity === "number"
    );
  }
  return (
    value.type === "shape" &&
    (value.shape === "arrow" || value.shape === "rectangle" || value.shape === "circle") &&
    typeof value.x === "number" &&
    typeof value.y === "number"
  );
}

export function parseSketchDocument(value: unknown): SketchDocument {
  if (!isObject(value) || value.version !== SKETCH_VERSION) {
    throw new Error("Unsupported SketchLayer document version.");
  }
  if (!isObject(value.canvas) || !Array.isArray(value.annotations)) {
    throw new Error("Invalid SketchLayer document.");
  }
  if (!value.annotations.every(isAnnotation)) {
    throw new Error("Invalid SketchLayer annotations.");
  }
  return value as unknown as SketchDocument;
}

export function serializeSketchDocument(annotations: Annotation[], options?: ExportCanvasOptions): string {
  return JSON.stringify(createSketchDocument(annotations, options), null, 2);
}

export function downloadJson(annotations: Annotation[], options?: ExportCanvasOptions) {
  const blob = new Blob([serializeSketchDocument(annotations, options)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "sketchlayer-annotations.json";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
