import type { AIShapePreset } from "./types";

export const AI_SHAPE_PRESETS: AIShapePreset[] = [
  {
    id: "problem-circle",
    label: "Problem Circle",
    description: "Circle a problem that needs attention.",
    shape: "circle",
    color: "#ef4444",
    semanticColor: { template: "product-feedback", label: "Problem", intent: "problem" },
    operation: "comment",
    severity: "high",
  },
  {
    id: "suggestion-arrow",
    label: "Suggestion Arrow",
    description: "Point to where an element should move.",
    shape: "arrow",
    color: "#2563eb",
    semanticColor: { template: "product-feedback", label: "Suggestion", intent: "suggestion" },
    operation: "move",
    severity: "medium",
  },
  {
    id: "preserve-marker",
    label: "Preserve Marker",
    description: "Mark an area that should remain unchanged.",
    shape: "rectangle",
    color: "#16a34a",
    semanticColor: { template: "product-feedback", label: "Approved", intent: "approved" },
    operation: "preserve",
    severity: "low",
    dashed: true,
  },
];

export const getAIShapePreset = (id: AIShapePreset["id"] | null) =>
  AI_SHAPE_PRESETS.find((preset) => preset.id === id) ?? null;
