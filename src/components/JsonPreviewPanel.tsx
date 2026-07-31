type JsonPreviewPanelProps = {
  value: string;
};

export function JsonPreviewPanel({ value }: JsonPreviewPanelProps) {
  return (
    <aside className="json-panel" aria-labelledby="json-title">
      <div className="json-heading">
        <div>
          <p className="eyebrow">Structured output</p>
          <h2 id="json-title">Annotation JSON</h2>
        </div>
        <span className="live-badge">Live</span>
      </div>
      <pre tabIndex={0}>{value}</pre>
    </aside>
  );
}
