import { SketchCanvas, useSketchLayer } from "sketchlayer";
import "sketchlayer/styles.css";

export function ImageAnnotationExample() {
  const sketch = useSketchLayer({ initialBrush: { color: "#ef4444", size: 4, opacity: 1 } });
  return <div style={{ width: 720, height: 405 }}><SketchCanvas value={sketch.value} onChange={sketch.onCanvasChange} tool={sketch.tool} brush={sketch.brush} backgroundImage="/product-screenshot.png" backgroundImageFit="contain" /></div>;
}
