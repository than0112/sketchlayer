import { ColorTemplatePicker, SketchCanvas, useSketchLayer } from "sketchlayer";
import "sketchlayer/styles.css";

export function TeachingExample() {
  const sketch = useSketchLayer();
  return <section><ColorTemplatePicker selectedColor={sketch.brush.color} onSelect={(template, color) => sketch.setBrush({ ...sketch.brush, color: color.value, semanticColor: { template, label: color.label, intent: color.intent } })} /><div style={{ width: 720, height: 405 }}><SketchCanvas value={sketch.value} onChange={sketch.onCanvasChange} tool={sketch.tool} brush={sketch.brush} /></div></section>;
}
