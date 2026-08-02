import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ShapeAnnotation } from "../lib/types";
import { colorTemplates } from "../lib/templates";
import { AnnotationInspector } from "./components/AnnotationInspector";
import { ColorStudio } from "./components/ColorStudio";
import { ProToolbar } from "./components/ProToolbar";
import { hslToHex, hexToHsl } from "./color";
import { feedbackToInstruction } from "./compatibility";
import { createProOutline } from "./freehand";
import { getAIShapePreset } from "./presets";
import { useProSketchLayer } from "./useProSketchLayer";
import type { ProBrushStyle } from "./types";

const brush: ProBrushStyle = { color: "#4967f2", size: 4, opacity: 1, smoothing: 0.55, pressure: true, engine: "perfect-freehand" };
const shape: ShapeAnnotation = { id: "shape-1", type: "shape", shape: "circle", x: 20, y: 30, width: 100, height: 80, strokeColor: "#111827", size: 4, opacity: 1 };

describe("SketchLayer Pro data contracts", () => {
  it("round trips standard HSL and hex colors", () => {
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe("#ff0000");
    expect(hexToHsl("#00ff00")).toEqual({ h: 120, s: 100, l: 50 });
  });

  it("maps legacy feedback without mutating its schema", () => {
    expect(feedbackToInstruction({ action: "highlight", selector: ".cta", note: "Make primary", severity: "medium" })).toEqual({
      operation: "emphasize", target: { kind: "selector", value: ".cta" }, note: "Make primary", severity: "medium",
    });
  });

  it("keeps shape appearance separate from operation", () => {
    expect(getAIShapePreset("problem-circle")).toMatchObject({ shape: "circle", operation: "comment", severity: "high" });
    expect(getAIShapePreset("suggestion-arrow")).toMatchObject({ shape: "arrow", operation: "move" });
  });

  it("produces a serializable perfect-freehand outline", () => {
    const outline = createProOutline({ id: "stroke", type: "stroke", tool: "pen", points: [{ x: 0, y: 0 }, { x: 20, y: 20 }], color: "#000000", size: 4, opacity: 1 }, brush);
    expect(outline.length).toBeGreaterThan(2);
    expect(outline.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
  });
});

describe("useProSketchLayer", () => {
  it("resolves an AI shape target and saves an agent-ready instruction", async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useProSketchLayer({ resolveTarget: () => ({ kind: "selector", value: ".metric-card" }), onChange }));
    act(() => result.current.selectShapePreset("problem-circle"));
    act(() => result.current.onCanvasChange({ annotations: [shape] }));
    await waitFor(() => expect(result.current.inspectorDraft?.target).toEqual({ kind: "selector", value: ".metric-card" }));
    act(() => result.current.setInspectorDraft({ ...result.current.inspectorDraft!, note: "Increase emphasis" }));
    act(() => expect(result.current.saveInspector()).toBe(true));
    expect(result.current.annotations[0]).toMatchObject({ shape: "circle", semanticColor: { intent: "problem" }, instruction: { operation: "comment", note: "Increase emphasis" } });
    expect(result.current.canSend).toBe(true);
    expect(onChange).toHaveBeenCalled();
  });

  it("falls back to manual targeting when the resolver returns null", async () => {
    const { result } = renderHook(() => useProSketchLayer({ resolveTarget: async () => null }));
    act(() => result.current.selectShapePreset("preserve-marker"));
    act(() => result.current.onCanvasChange({ annotations: [{ ...shape, shape: "rectangle" }] }));
    await waitFor(() => expect(result.current.resolverStatus).toBe("manual"));
    expect(result.current.annotations).toHaveLength(1);
    expect(result.current.canSend).toBe(false);
  });

  it("supports async resolution and falls back when the resolver throws", async () => {
    const asyncHook = renderHook(() => useProSketchLayer({ resolveTarget: async () => ({ kind: "region", id: "hero" }) }));
    act(() => asyncHook.result.current.selectShapePreset("suggestion-arrow"));
    act(() => asyncHook.result.current.onCanvasChange({ annotations: [{ ...shape, shape: "arrow" }] }));
    await waitFor(() => expect(asyncHook.result.current.inspectorDraft?.target).toEqual({ kind: "region", id: "hero" }));

    const throwHook = renderHook(() => useProSketchLayer({ resolveTarget: () => { throw new Error("host unavailable"); } }));
    act(() => throwHook.result.current.selectShapePreset("problem-circle"));
    act(() => throwHook.result.current.onCanvasChange({ annotations: [shape] }));
    await waitFor(() => expect(throwHook.result.current.resolverStatus).toBe("manual"));
  });

  it("removes a newly created annotation when its inspector is cancelled", () => {
    const { result } = renderHook(() => useProSketchLayer());
    act(() => result.current.selectShapePreset("suggestion-arrow"));
    act(() => result.current.onCanvasChange({ annotations: [{ ...shape, shape: "arrow" }] }));
    act(() => result.current.cancelInspector());
    expect(result.current.annotations).toEqual([]);
  });
});

describe("Pro components", () => {
  it("keeps only the active toolbar panel expanded", () => {
    const onPanelChange = vi.fn();
    render(<ProToolbar tool="pen" activePanel="color" onToolChange={vi.fn()} onPanelChange={onPanelChange} />);
    expect(screen.getByRole("button", { name: "Color" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Shape" })).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Shape" }));
    expect(onPanelChange).toHaveBeenCalledWith("shape");
  });

  it("binds semantic color and saves a controlled template", () => {
    const onChange = vi.fn();
    const onTemplatesChange = vi.fn();
    render(<ColorStudio value={brush} templates={colorTemplates} onChange={onChange} onTemplatesChange={onTemplatesChange} />);
    fireEvent.change(screen.getByLabelText("Semantic meaning"), { target: { value: "product-feedback:problem" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ semanticColor: expect.objectContaining({ intent: "problem" }) }));
    fireEvent.click(screen.getByRole("button", { name: "Save to Template" }));
    expect(onTemplatesChange).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: "custom" })]));
  });

  it("exposes keyboard-operable React Aria color controls", () => {
    const onChange = vi.fn();
    render(<ColorStudio value={brush} templates={colorTemplates} onChange={onChange} />);
    const hue = screen.getByRole("slider", { name: "Hue" });
    hue.focus();
    fireEvent.keyDown(hue, { key: "ArrowRight" });
    fireEvent.keyUp(hue, { key: "ArrowRight" });
    expect(hue).toHaveFocus();
    expect(onChange).toHaveBeenCalled();
  });

  it("validates required inspector fields and supports cancel", () => {
    const onCancel = vi.fn();
    render(<AnnotationInspector value={{ operation: "move", note: "", severity: "medium" }} resolverStatus="manual" onChange={vi.fn()} onSave={vi.fn()} onCancel={onCancel} />);
    expect(screen.getByRole("button", { name: "Save instruction" })).toBeDisabled();
    expect(screen.getByText("Target not found. Enter it manually.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
