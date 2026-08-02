# SketchLayer API

## `SketchCanvas`

Required props are `tool` and `brush`. Supply `value` with `onChange` for controlled state, or `defaultValue` for internal state. `backgroundImageFit` accepts `contain` or `cover`. The forwarded `SketchCanvasHandle` exposes `exportPng(): Promise<Blob>`.

The logical canvas coordinate system is always 960 × 540. Rendering scales to the element size and device pixel ratio.

## `SketchToolbar`

An accessible, responsive starter toolbar. Pass the active `tool`, `brush`, history capabilities, and callbacks. It intentionally exposes a small stable surface; applications can compose custom toolbars from the exported types and templates.

## `useSketchLayer(options?)`

Owns immutable annotation history and UI state. It returns:

- `value`, `annotations`, `tool`, and `brush`
- `setTool`, `setBrush`, `setAnnotations`, and `onCanvasChange`
- `canUndo`, `canRedo`, `undo`, `redo`, `clear`, and `reset`

`onChange` is called after canvas commits and history commands.

## Semantic UI

`ColorTemplatePicker` returns a template name and `SemanticColor`. `GradientCreator` returns a `GradientPreset` and supports a separate copy callback. The raw `colorTemplates`, `gradientPresets`, and `gradientCss` helpers are also exported.

## Serialization

`createSketchDocument`, `serializeSketchDocument`, and `parseSketchDocument` use the exported `SKETCH_VERSION`. Consumers should persist the full `SketchDocument`, not only its annotations.

## Styling

Import `sketchlayer/styles.css`. Override these tokens on any ancestor or `:root`:

```css
:root {
  --sketchlayer-accent: #2563eb;
  --sketchlayer-surface: #ffffff;
  --sketchlayer-text: #17191d;
  --sketchlayer-muted: #717782;
  --sketchlayer-border: #e2e5e9;
  --sketchlayer-radius: 12px;
  --sketchlayer-shadow: 0 12px 32px rgba(24, 30, 40, 0.12);
}
```

## Compatibility policy

New optional fields may be added in minor releases. Existing fields, semantic meanings, and exported names change only in a major release. Serialized document versions are validated independently from package versions.

## Pro 0.2 entry

Import `ProToolbar`, `ColorStudio`, `BrushStudio`, `ShapeStudio`, `AnnotationInspector`, and `useProSketchLayer` from `sketchlayer/pro`, plus `sketchlayer/pro.css` once.

`useProSketchLayer` extends immutable core history with selection, one active panel, AI shape presets, `perfect-freehand` outlines, Inspector drafts, and optional target resolution. A `TargetResolver` receives the new annotation and its anchor and may return a selector or region synchronously or asynchronously. Returning `null` or throwing leaves the annotation visible and enables manual target entry.

New annotations may carry optional `instruction`, `proBrush`, and `outline` fields while the document schema remains `0.1.0`. `feedbackToInstruction` converts legacy `FeedbackMeta` at read time; stored legacy documents do not require migration.

`canSend` is true only when at least one annotation exists and every annotation has a non-empty target and note, either through `InstructionMeta` or compatible legacy feedback.

## Accessibility

The canvas exposes a configurable `label`, keyboard focus, and `aria-readonly`. The starter toolbar uses named buttons, pressed states, and native color/range inputs. Host applications should preserve visible focus styles and provide equivalent non-canvas access to exported annotation data.
