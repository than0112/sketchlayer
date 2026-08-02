import { SketchCanvas, SketchToolbar, useSketchLayer } from "sketchlayer";
import "sketchlayer/styles.css";

export function BasicExample() {
  const sketch = useSketchLayer();
  return <section><div style={{ width: 720, height: 405 }}><SketchCanvas value={sketch.value} onChange={sketch.onCanvasChange} tool={sketch.tool} brush={sketch.brush} /></div><SketchToolbar tool={sketch.tool} brush={sketch.brush} canUndo={sketch.canUndo} canRedo={sketch.canRedo} canClear={sketch.annotations.length > 0} onToolChange={sketch.setTool} onBrushChange={sketch.setBrush} onUndo={sketch.undo} onRedo={sketch.redo} onClear={sketch.clear} /></section>;
}
