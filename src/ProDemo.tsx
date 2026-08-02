import { useMemo, useState } from "react";
import { SketchCanvas, colorTemplates } from "./index";
import {
  AnnotationInspector,
  BrushStudio,
  ColorStudio,
  ProToolbar,
  ShapeStudio,
  useProSketchLayer,
} from "./pro";
import type { ColorTemplate } from "./lib/types";
import "./sketchlayer.css";
import "./pro.css";
import "./pro-demo.css";

export default function ProDemo() {
  const [templates, setTemplates] = useState<ColorTemplate[]>(colorTemplates);
  const [sentJson, setSentJson] = useState("");
  const pro = useProSketchLayer({
    resolveTarget: ({ anchor }) => ({ kind: "region", id: `canvas-${Math.round(anchor.x)}-${Math.round(anchor.y)}`, label: "Canvas region" }),
  });
  const json = useMemo(() => JSON.stringify({ version: "0.1.0", annotations: pro.annotations }, null, 2), [pro.annotations]);

  return (
    <main className="sketchlayer-pro-demo">
      <header className="sketchlayer-pro-demo__header">
        <div><span className="sketchlayer-pro-demo__logo">S</span><strong>SketchLayer</strong><span>Pro 0.2</span></div>
        <button type="button" disabled={!pro.canSend} onClick={() => setSentJson(json)}>Send to Agent</button>
      </header>
      <div className="sketchlayer-pro-demo__workspace">
        <section className="sketchlayer-pro-demo__canvas-wrap">
          <SketchCanvas
            value={pro.value}
            onChange={pro.onCanvasChange}
            tool={pro.tool}
            brush={pro.canvasBrush}
            selectedAnnotationId={pro.selectedAnnotationId}
            onAnnotationSelect={pro.selectAnnotation}
            label="Pro annotation canvas"
          />
          <div className="sketchlayer-pro-demo__toolbar-wrap">
            <ProToolbar tool={pro.tool} activePanel={pro.activePanel} canSend={pro.canSend} onToolChange={pro.setTool} onPanelChange={pro.setActivePanel} onExport={() => pro.canSend && setSentJson(json)} />
            {pro.activePanel === "draw" && (
              <div className="sketchlayer-pro-demo__popover">
                <div className="sketchlayer-pro-demo__draw-modes">
                  <button type="button" data-active={pro.tool === "pen" || undefined} onClick={() => pro.setTool("pen")}>Pen</button>
                  <button type="button" data-active={pro.tool === "highlighter" || undefined} onClick={() => pro.setTool("highlighter")}>Highlighter</button>
                </div>
                <BrushStudio value={pro.brush} onChange={pro.setBrush} />
              </div>
            )}
            {pro.activePanel === "shape" && <div className="sketchlayer-pro-demo__popover"><ShapeStudio value={pro.activeShapePresetId} onChange={pro.selectShapePreset} /></div>}
            {pro.activePanel === "color" && <div className="sketchlayer-pro-demo__popover"><ColorStudio value={pro.brush} templates={templates} onChange={pro.setBrush} onTemplatesChange={setTemplates} /></div>}
            {pro.activePanel === "export" && <div id="sketchlayer-pro-export-panel" className="sketchlayer-pro-panel sketchlayer-pro-demo__popover"><strong>Agent-ready JSON</strong><pre>{json}</pre></div>}
          </div>
        </section>
        <aside className="sketchlayer-pro-demo__side">
          {pro.inspectorDraft ? (
            <AnnotationInspector value={pro.inspectorDraft} resolverStatus={pro.resolverStatus} isNew={pro.isInspectorNew} onChange={pro.setInspectorDraft} onSave={pro.saveInspector} onCancel={pro.cancelInspector} />
          ) : (
            <div className="sketchlayer-pro-demo__empty"><strong>Annotation JSON</strong><p>Choose an AI shape, draw on the canvas, then complete its target and note.</p></div>
          )}
          {sentJson && <output className="sketchlayer-pro-demo__sent">Sent {JSON.parse(sentJson).annotations.length} annotation(s) to Agent.</output>}
        </aside>
      </div>
    </main>
  );
}
