import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("opens in a ready-to-draw accessible state", () => {
    render(<App />);
    expect(screen.getByRole("img", { name: "SketchLayer drawing canvas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pen (P)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Annotation JSON")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(5);
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
    expect(screen.getAllByText("9px").length).toBeGreaterThan(0);
    expect(screen.getAllByText("60%").length).toBeGreaterThan(0);

    fireEvent.keyDown(window, { key: "c" });
    expect(screen.getByText("Circle ready")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Semantic colors" }));
    fireEvent.click(screen.getByRole("button", { name: "Warning" }));

    fireEvent.click(screen.getByRole("button", { name: "More canvas tools" }));
    fireEvent.click(screen.getByRole("button", { name: "Gradient" }));
    fireEvent.click(screen.getByRole("button", { name: "Warm Paper" }));
    expect(screen.getByRole("button", { name: "Warm Paper" })).toHaveClass("is-selected");
  });

  it("creates a clean board and can restore the dashboard example", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /AI Dashboard Feedback/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: /New blank board/ }));

    expect(screen.getByRole("button", { name: /Untitled board/ })).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByText("0 annotations")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Untitled board/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: /AI Dashboard Feedback/ }));

    expect(screen.getAllByRole("article")).toHaveLength(5);
  });

  it("removes the example background separately from annotations", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "More canvas tools" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove background image" }));
    expect(screen.getByRole("status")).toHaveTextContent("Background image removed");
    expect(screen.getAllByRole("article")).toHaveLength(5);
  });
});
