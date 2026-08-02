import { act, render, renderHook, screen } from "@testing-library/react";
import {
  ColorTemplatePicker,
  GradientCreator,
  SketchCanvas,
  SketchToolbar,
  createSketchDocument,
  useSketchLayer,
} from "./index";

describe("public package API", () => {
  it("renders the exported components", () => {
    const brush = { color: "#111827", size: 4, opacity: 1 };
    render(<><div style={{ width: 960, height: 540 }}><SketchCanvas tool="pen" brush={brush} /></div><SketchToolbar tool="pen" brush={brush} onToolChange={() => undefined} onBrushChange={() => undefined} /><ColorTemplatePicker selectedColor="#111827" onSelect={() => undefined} /><GradientCreator onSelect={() => undefined} onCopy={() => undefined} /></>);
    expect(screen.getByRole("img", { name: "SketchLayer drawing canvas" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "Sketch tools" })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Semantic color template" })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Gradient presets" })).toBeInTheDocument();
  });

  it("provides immutable history through useSketchLayer", () => {
    const { result } = renderHook(() => useSketchLayer());
    const annotation = { id: "one", type: "stroke" as const, tool: "pen" as const, points: [{ x: 1, y: 1, pressure: 0.5 }], color: "#111827", size: 4, opacity: 1 };
    act(() => result.current.setAnnotations([annotation]));
    expect(result.current.canUndo).toBe(true);
    act(() => result.current.undo());
    expect(result.current.annotations).toHaveLength(0);
    act(() => result.current.redo());
    expect(result.current.annotations).toHaveLength(1);
    expect(createSketchDocument(result.current.annotations).annotations).toEqual([annotation]);
  });
});
