import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { vi } from "vitest";
import { SketchCanvas, type SketchCanvasHandle } from "./SketchCanvas";

describe("SketchCanvas", () => {
  it("captures a pointer gesture and commits a state-backed stroke", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <SketchCanvas
        value={{ annotations: [] }}
        onChange={onChange}
        tool="pen"
        brush={{ color: "#202124", size: 4, opacity: 1 }}
      />,
    );
    const canvas = getByRole("img");
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 960,
      bottom: 540,
      width: 960,
      height: 540,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(canvas, { pointerId: 7, button: 0, clientX: 10, clientY: 20, pressure: 0.5 });
    fireEvent.pointerMove(canvas, { pointerId: 7, clientX: 30, clientY: 40, pressure: 0.5 });
    fireEvent.pointerUp(canvas, { pointerId: 7, clientX: 30, clientY: 40 });

    expect(canvas.setPointerCapture).toHaveBeenCalledWith(7);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(7);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].annotations[0]).toMatchObject({
      type: "stroke",
      tool: "pen",
      color: "#202124",
      size: 4,
    });
  });

  it("cancels a pointer gesture without committing it", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <SketchCanvas
        value={{ annotations: [] }}
        onChange={onChange}
        tool="pen"
        brush={{ color: "#202124", size: 4, opacity: 1 }}
      />,
    );
    const canvas = getByRole("img");
    fireEvent.pointerDown(canvas, { pointerId: 2, button: 0, clientX: 1, clientY: 1 });
    fireEvent.pointerCancel(canvas, { pointerId: 2 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("drag-creates a rectangle with semantic style metadata", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <SketchCanvas
        value={{ annotations: [] }}
        onChange={onChange}
        tool="rectangle"
        brush={{
          color: "#e05252",
          size: 6,
          opacity: 0.65,
          semanticColor: { template: "Teaching", label: "Warning", intent: "problem" },
        }}
      />,
    );
    const canvas = getByRole("img");
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, right: 960, bottom: 540, width: 960, height: 540, toJSON: () => ({}),
    });

    fireEvent.pointerDown(canvas, { pointerId: 5, button: 0, clientX: 100, clientY: 120 });
    fireEvent.pointerMove(canvas, { pointerId: 5, clientX: 300, clientY: 260 });
    fireEvent.pointerUp(canvas, { pointerId: 5, clientX: 300, clientY: 260 });

    expect(onChange.mock.calls[0][0].annotations[0]).toMatchObject({
      type: "shape",
      shape: "rectangle",
      x: 100,
      y: 120,
      width: 200,
      height: 140,
      strokeColor: "#e05252",
      size: 6,
      opacity: 0.65,
      semanticColor: { template: "Teaching", label: "Warning", intent: "problem" },
    });
  });

  it("exports a composed PNG blob from a fixed-size output canvas", async () => {
    const ref = createRef<SketchCanvasHandle>();
    render(
      <SketchCanvas
        ref={ref}
        value={{ annotations: [] }}
        tool="pen"
        brush={{ color: "#202124", size: 4, opacity: 1 }}
      />,
    );

    const blob = await ref.current?.exportPng();
    expect(blob?.type).toBe("image/png");
  });
});
