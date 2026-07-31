import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("opens in a ready-to-draw accessible state", () => {
    render(<App />);
    expect(screen.getByRole("img", { name: "SketchLayer drawing canvas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pen (P)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Annotation JSON")).toBeInTheDocument();
  });

  it("supports keyboard tools and semantic color selection", () => {
    render(<App />);
    fireEvent.keyDown(window, { key: "h" });
    expect(screen.getByRole("button", { name: "Highlighter (H)" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Semantic colors" }));
    fireEvent.click(screen.getByRole("button", { name: "Problem" }));
    expect(screen.queryByRole("dialog", { name: "Semantic color template" })).not.toBeInTheDocument();
  });

  it("applies brush controls, Teaching colors, and gradient metadata", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Brush settings" }));
    fireEvent.change(screen.getByRole("slider", { name: /Size/ }), { target: { value: "9" } });
    fireEvent.change(screen.getByRole("slider", { name: /Opacity/ }), { target: { value: "0.6" } });
    expect(screen.getByText("9px · 60%")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "c" });
    expect(screen.getByRole("button", { name: "Circle (C)" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Semantic colors" }));
    fireEvent.click(screen.getByRole("button", { name: "Warning" }));

    fireEvent.click(screen.getByRole("button", { name: "Canvas gradient" }));
    fireEvent.click(screen.getByRole("button", { name: "Warm Paper" }));
    expect(screen.getByText(/"preset": "warm-paper"/)).toBeInTheDocument();
  });
});
