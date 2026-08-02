import type { InstructionMeta, TargetRef } from "../../lib/types";
import type { InstructionDraft, ResolverStatus } from "../types";

export type AnnotationInspectorProps = {
  value: InstructionDraft;
  resolverStatus?: ResolverStatus;
  isNew?: boolean;
  onChange: (value: InstructionDraft) => void;
  onSave: () => void;
  onCancel: () => void;
};

const targetValue = (target?: TargetRef) => target?.kind === "selector" ? target.value : target?.id ?? "";

export function AnnotationInspector({ value, resolverStatus = "idle", isNew = false, onChange, onSave, onCancel }: AnnotationInspectorProps) {
  const targetKind = value.target?.kind ?? "selector";
  const isValid = Boolean(value.note.trim() && targetValue(value.target).trim());
  const setTargetKind = (kind: TargetRef["kind"]) => onChange({
    ...value,
    target: kind === "selector" ? { kind, value: "" } : { kind, id: "" },
  });
  const setTargetValue = (next: string) => onChange({
    ...value,
    target: targetKind === "selector" ? { kind: "selector", value: next } : { kind: "region", id: next },
  });

  return (
    <aside className="sketchlayer-pro-inspector" aria-label="Annotation Inspector">
      <header><div><strong>Annotation Inspector</strong><p>{isNew ? "Complete this instruction before sending." : "Edit the selected instruction."}</p></div></header>
      {resolverStatus === "resolving" && <p className="sketchlayer-pro-resolver" role="status">Resolving target…</p>}
      {resolverStatus === "manual" && <p className="sketchlayer-pro-resolver sketchlayer-pro-resolver--manual" role="status">Target not found. Enter it manually.</p>}
      <label className="sketchlayer-pro-field">
        <span>Operation</span>
        <select value={value.operation} onChange={(event) => onChange({ ...value, operation: event.target.value as InstructionMeta["operation"] })}>
          <option value="comment">Comment</option><option value="move">Move</option><option value="preserve">Preserve</option><option value="approve">Approve</option><option value="emphasize">Emphasize</option>
        </select>
      </label>
      <fieldset className="sketchlayer-pro-target-kind">
        <legend>Target type</legend>
        <label><input type="radio" name="target-kind" checked={targetKind === "selector"} onChange={() => setTargetKind("selector")} /> Selector</label>
        <label><input type="radio" name="target-kind" checked={targetKind === "region"} onChange={() => setTargetKind("region")} /> Region ID</label>
      </fieldset>
      <label className="sketchlayer-pro-field">
        <span>{targetKind === "selector" ? "CSS selector" : "Region ID"}</span>
        <input value={targetValue(value.target)} placeholder={targetKind === "selector" ? "[data-testid='pricing']" : "pricing-card"} onChange={(event) => setTargetValue(event.target.value)} />
      </label>
      <label className="sketchlayer-pro-field">
        <span>Note</span>
        <textarea rows={4} value={value.note} placeholder="Describe the intended change" onChange={(event) => onChange({ ...value, note: event.target.value })} />
      </label>
      <label className="sketchlayer-pro-field">
        <span>Severity</span>
        <select value={value.severity} onChange={(event) => onChange({ ...value, severity: event.target.value as InstructionMeta["severity"] })}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
      </label>
      <div className="sketchlayer-pro-actions">
        <button type="button" className="sketchlayer-pro-secondary" onClick={onCancel}>Cancel</button>
        <button type="button" className="sketchlayer-pro-primary" disabled={!isValid || resolverStatus === "resolving"} onClick={onSave}>Save instruction</button>
      </div>
    </aside>
  );
}
