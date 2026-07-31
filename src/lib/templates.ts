import type { ColorTemplate, GradientPreset } from "./types";

export const colorTemplates: ColorTemplate[] = [
  {
    id: "product-feedback",
    name: "Product Feedback",
    colors: [
      { id: "suggestion", label: "Suggestion", value: "#4967f2", intent: "suggestion" },
      { id: "problem", label: "Problem", value: "#e05252", intent: "problem" },
      { id: "approved", label: "Approved", value: "#2f9e44", intent: "approved" },
      { id: "highlight", label: "Highlight", value: "#f2c94c", intent: "highlight" },
    ],
  },
  {
    id: "teaching",
    name: "Teaching",
    colors: [
      { id: "explanation", label: "Explanation", value: "#4967f2", intent: "suggestion" },
      { id: "important", label: "Important", value: "#f2c94c", intent: "highlight" },
      { id: "warning", label: "Warning", value: "#e05252", intent: "problem" },
    ],
  },
];

export const gradientPresets: GradientPreset[] = [
  { id: "warm-paper", name: "Warm Paper", type: "linear", from: "#f8f7f3", to: "#eef4ff", angle: 135 },
  { id: "quiet-sky", name: "Quiet Sky", type: "linear", from: "#f5f9ff", to: "#dfeaff", angle: 145 },
  { id: "soft-mint", name: "Soft Mint", type: "linear", from: "#f6fbf8", to: "#dff3e8", angle: 120 },
  { id: "peach-note", name: "Peach Note", type: "linear", from: "#fff9f4", to: "#ffe7d8", angle: 135 },
  { id: "lilac-dusk", name: "Lilac Dusk", type: "linear", from: "#faf8ff", to: "#e8e2f7", angle: 150 },
  { id: "graphite", name: "Graphite", type: "linear", from: "#f5f6f7", to: "#dfe3e8", angle: 135 },
];

export const gradientCss = (preset: GradientPreset) =>
  `linear-gradient(${preset.angle}deg, ${preset.from}, ${preset.to})`;
