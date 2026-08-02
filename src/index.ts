export { SketchCanvas } from "./components/SketchCanvas";
export type { SketchCanvasHandle, SketchCanvasProps } from "./components/SketchCanvas";
export { SketchToolbar } from "./components/SketchToolbar";
export type { SketchToolbarProps } from "./components/SketchToolbar";
export { ColorTemplatePicker } from "./components/ColorTemplatePicker";
export type { ColorTemplatePickerProps } from "./components/ColorTemplatePicker";
export { GradientCreator } from "./components/GradientCreator";
export type { GradientCreatorProps } from "./components/GradientCreator";
export { useSketchLayer } from "./hooks/useSketchLayer";
export type { UseSketchLayerOptions, UseSketchLayerResult } from "./hooks/useSketchLayer";

export { colorTemplates, gradientCss, gradientPresets } from "./lib/templates";
export {
  CANVAS_SIZE,
  DEFAULT_BACKGROUND,
  SKETCH_VERSION,
  createSketchDocument,
  parseSketchDocument,
  serializeSketchDocument,
} from "./lib/serialization";

export type * from "./lib/types";
