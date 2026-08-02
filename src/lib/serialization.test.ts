import { createSketchDocument, parseSketchDocument, serializeSketchDocument } from "./serialization";
import type { Stroke } from "./types";

const semanticStroke: Stroke = {
  id: "semantic-stroke",
  type: "stroke",
  tool: "pen",
  points: [{ x: 12, y: 18, pressure: 0.5 }],
  color: "#e05252",
  size: 4,
  opacity: 1,
  semanticColor: {
    template: "Product Feedback",
    label: "Problem",
    intent: "problem",
  },
};

describe("SketchLayer serialization", () => {
  it("round-trips annotations and semantic metadata", () => {
    const json = serializeSketchDocument([semanticStroke]);
    const restored = parseSketchDocument(JSON.parse(json));

    expect(restored).toEqual(createSketchDocument([semanticStroke]));
    expect(restored.annotations[0]?.semanticColor?.intent).toBe("problem");
  });

  it("rejects unsupported versions to protect forward compatibility", () => {
    const future = { ...createSketchDocument([]), version: "9.0.0" };
    expect(() => parseSketchDocument(future)).toThrow("Unsupported SketchLayer document version");
  });

  it("exports active gradient and background image metadata", () => {
    const document = createSketchDocument([], {
      background: {
        type: "gradient",
        preset: "warm-paper",
        from: "#f8f7f3",
        to: "#eef4ff",
        angle: 135,
        css: "linear-gradient(135deg, #f8f7f3, #eef4ff)",
        grid: true,
      },
      backgroundImage: { name: "lesson.png", includedInPng: true },
    });

    expect(document.canvas.background.type).toBe("gradient");
    expect(document.canvas.backgroundImage).toEqual({ name: "lesson.png", includedInPng: true });
    expect(document).toMatchInlineSnapshot(`
      {
        "annotations": [],
        "canvas": {
          "background": {
            "angle": 135,
            "css": "linear-gradient(135deg, #f8f7f3, #eef4ff)",
            "from": "#f8f7f3",
            "grid": true,
            "preset": "warm-paper",
            "to": "#eef4ff",
            "type": "gradient",
          },
          "backgroundImage": {
            "includedInPng": true,
            "name": "lesson.png",
          },
          "height": 540,
          "width": 960,
        },
        "version": "0.1.0",
      }
    `);
  });
});
