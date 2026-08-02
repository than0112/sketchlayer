import { useState } from "react";
import { SketchCanvas, colorTemplates } from "sketchlayer";
import {
  AnnotationInspector,
  BrushStudio,
  ColorStudio,
  ProToolbar,
  ShapeStudio,
  useProSketchLayer,
} from "sketchlayer/pro";
import type { ColorTemplate } from "sketchlayer";
import "sketchlayer/styles.css";
import "sketchlayer/pro.css";

export function ProAnnotation() {
  const [templates, setTemplates] = useState<ColorTemplate[]>(colorTemplates);
  const pro = useProSketchLayer({ resolveTarget: () => ({ kind: "selector", value: "[data-feedback-target]" }) });
  return <div>
    <SketchCanvas value={pro.value} onChange={pro.onCanvasChange} tool={pro.tool} brush={pro.canvasBrush} selectedAnnotationId={pro.selectedAnnotationId} onAnnotationSelect={pro.selectAnnotation} />
    <ProToolbar tool={pro.tool} activePanel={pro.activePanel} canSend={pro.canSend} onToolChange={pro.setTool} onPanelChange={pro.setActivePanel} />
    {pro.activePanel === "draw" && <BrushStudio value={pro.brush} onChange={pro.setBrush} />}
    {pro.activePanel === "shape" && <ShapeStudio value={pro.activeShapePresetId} onChange={pro.selectShapePreset} />}
    {pro.activePanel === "color" && <ColorStudio value={pro.brush} templates={templates} onChange={pro.setBrush} onTemplatesChange={setTemplates} />}
    {pro.inspectorDraft && <AnnotationInspector value={pro.inspectorDraft} resolverStatus={pro.resolverStatus} isNew={pro.isInspectorNew} onChange={pro.setInspectorDraft} onSave={pro.saveInspector} onCancel={pro.cancelInspector} />}
  </div>;
}
