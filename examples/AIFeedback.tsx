import { SketchCanvas, serializeSketchDocument, useSketchLayer } from "sketchlayer";
import "sketchlayer/styles.css";

export function AIFeedbackExample() {
  const sketch = useSketchLayer();
  const json = serializeSketchDocument(sketch.annotations);
  return <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px" }}><div style={{ height: 540 }}><SketchCanvas value={sketch.value} onChange={sketch.onCanvasChange} tool={sketch.tool} brush={sketch.brush} backgroundImage="/dashboard.png" backgroundImageFit="cover" /></div><pre>{json}</pre></div>;
}
