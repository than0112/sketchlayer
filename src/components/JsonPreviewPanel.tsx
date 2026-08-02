import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { Copy } from "@phosphor-icons/react/dist/csr/Copy";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { useState } from "react";
import type { Annotation, FeedbackMeta } from "../lib/types";

type JsonPreviewPanelProps = {
  annotations: Annotation[];
  value: string;
  onSend: () => void;
};

const fallbackFeedback = (annotation: Annotation): FeedbackMeta => ({
  action: annotation.type === "shape" && annotation.shape === "circle" ? "circle" : "comment",
  selector: `[data-annotation-id='${annotation.id}']`,
  note: annotation.semanticColor?.label ?? "Visual feedback",
  severity: annotation.semanticColor?.intent === "problem" ? "high" : "medium",
});

const annotationColor = (annotation: Annotation) =>
  annotation.type === "stroke" ? annotation.color : annotation.strokeColor;

export function JsonPreviewPanel({ annotations, value, onSend }: JsonPreviewPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyJson = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <aside className="annotation-panel" aria-labelledby="json-title">
      <div className="annotation-panel__header">
        <div>
          <h2 id="json-title">Annotation JSON</h2>
          <p>Structured feedback ready to send to your agent.</p>
        </div>
        <button type="button" className="icon-button" aria-label="Copy annotation JSON" onClick={copyJson}>
          {copied ? <Check size={17} weight="bold" /> : <Copy size={17} />}
        </button>
      </div>

      <div className="annotation-list" aria-label="Structured annotations">
        {annotations.map((annotation) => {
          const feedback = annotation.feedback ?? fallbackFeedback(annotation);
          return (
            <article className="annotation-card" key={annotation.id}>
              <div className="annotation-card__title">
                <span className="annotation-dot" style={{ background: annotationColor(annotation) }} aria-hidden="true" />
                <strong>{feedback.action}</strong>
              </div>
              <dl>
                <div><dt>{feedback.action === "move" ? "target" : "selector"}</dt><dd>{feedback.selector}</dd></div>
                <div><dt>note</dt><dd>{feedback.note}</dd></div>
                <div><dt>severity</dt><dd>{feedback.severity}</dd></div>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="annotation-panel__footer">
        <button type="button" className="send-agent-button" onClick={onSend}>
          <PaperPlaneTilt size={17} weight="fill" />
          Send to Agent
        </button>
        <span>{annotations.length} annotations</span>
      </div>
    </aside>
  );
}
