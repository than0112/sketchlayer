# SketchLayer

An embeddable React layer for turning visual annotations into AI-readable data. SketchLayer provides a high-DPI Canvas 2D renderer, pointer input, semantic colors, immutable undo/redo history, and versioned JSON export without becoming a general-purpose whiteboard.

## Install

```bash
npm install sketchlayer react react-dom
```

Import the component styles once:

```ts
import "sketchlayer/styles.css";
```

## Minimal integration

The smallest uncontrolled canvas is three lines:

```tsx
<div style={{ width: 960, height: 540 }}>
  <SketchCanvas tool="pen" brush={{ color: "#111827", size: 4, opacity: 1 }} />
</div>
```

For a complete controlled experience:

```tsx
import { SketchCanvas, SketchToolbar, useSketchLayer } from "sketchlayer";
import "sketchlayer/styles.css";

export function FeedbackLayer() {
  const sketch = useSketchLayer();

  return (
    <div style={{ width: 960 }}>
      <div style={{ height: 540 }}>
        <SketchCanvas
          value={sketch.value}
          onChange={sketch.onCanvasChange}
          tool={sketch.tool}
          brush={sketch.brush}
        />
      </div>
      <SketchToolbar
        tool={sketch.tool}
        brush={sketch.brush}
        canUndo={sketch.canUndo}
        canRedo={sketch.canRedo}
        canClear={sketch.annotations.length > 0}
        onToolChange={sketch.setTool}
        onBrushChange={sketch.setBrush}
        onUndo={sketch.undo}
        onRedo={sketch.redo}
        onClear={sketch.clear}
      />
    </div>
  );
}
```

## Public API

- `SketchCanvas` — controlled or uncontrolled annotation canvas.
- `SketchToolbar` — accessible starter toolbar for pen, highlighter, eraser, history, color, and size.
- `ColorTemplatePicker` — Product Feedback and Teaching semantic color templates.
- `GradientCreator` — six canvas background presets.
- `useSketchLayer` — immutable annotation history, active tool, and brush state.
- Serialization helpers — versioned JSON creation, parsing, and serialization.
- TypeScript types — annotation, brush, background, semantic color, and document contracts.

See [API reference](./docs/api.md), [examples](./examples), [publishing guide](./docs/publishing.md), and the [validation protocol](./docs/gate-0-validation.md).

## Pro 0.2 (optional)

The Pro entry adds AI shapes, accessible color controls, natural freehand strokes, and structured instruction editing without increasing the core entry bundle.

```tsx
import { SketchCanvas } from "sketchlayer";
import { ProToolbar, useProSketchLayer } from "sketchlayer/pro";
import "sketchlayer/styles.css";
import "sketchlayer/pro.css";

const pro = useProSketchLayer({
  resolveTarget: ({ anchor }) => ({ kind: "region", id: `${anchor.x}:${anchor.y}` }),
});

<SketchCanvas
  value={pro.value}
  onChange={pro.onCanvasChange}
  tool={pro.tool}
  brush={pro.canvasBrush}
  selectedAnnotationId={pro.selectedAnnotationId}
  onAnnotationSelect={pro.selectAnnotation}
/>;
<ProToolbar
  tool={pro.tool}
  activePanel={pro.activePanel}
  canSend={pro.canSend}
  onToolChange={pro.setTool}
  onPanelChange={pro.setActivePanel}
/>;
```

Open the local demo at `/#pro`. `templates`, `brandPalette`, and `onTemplatesChange` are controlled by the host; SketchLayer never writes them to local storage.

## Development

```bash
npm install
npm run dev
npm test
npm run test:e2e
npm run typecheck
npm run build
npm run package:check
```

`npm run build` produces the demo application in `dist/` and the ESM package with declarations in `dist-lib/`.

## Browser support

SketchLayer targets modern browsers with Canvas 2D, Pointer Events, ResizeObserver, and ES2022 support. Mouse, touch, and pressure data are normalized through Pointer Events.

## License

MIT
