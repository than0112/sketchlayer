import type { Annotation, FeedbackMeta, InstructionMeta } from "../lib/types";

const operationByLegacyAction: Record<FeedbackMeta["action"], InstructionMeta["operation"]> = {
  circle: "comment",
  move: "move",
  comment: "comment",
  highlight: "emphasize",
};

export function feedbackToInstruction(feedback: FeedbackMeta): InstructionMeta {
  return {
    operation: operationByLegacyAction[feedback.action],
    target: { kind: "selector", value: feedback.selector },
    note: feedback.note,
    severity: feedback.severity,
  };
}

export function getAnnotationInstruction(annotation: Annotation): InstructionMeta | undefined {
  return annotation.instruction ?? (annotation.feedback ? feedbackToInstruction(annotation.feedback) : undefined);
}

export function isAgentReady(annotation: Annotation): boolean {
  const instruction = getAnnotationInstruction(annotation);
  if (!instruction || !instruction.note.trim()) return false;
  return instruction.target.kind === "selector"
    ? Boolean(instruction.target.value.trim())
    : Boolean(instruction.target.id.trim());
}
