import type { Annotation } from "./types";

export type HistoryState = {
  past: Annotation[][];
  present: Annotation[];
  future: Annotation[][];
};

export type HistoryAction =
  | { type: "commit"; annotations: Annotation[] }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "clear" }
  | { type: "reset"; annotations: Annotation[] };

export const createHistory = (annotations: Annotation[] = []): HistoryState => ({
  past: [],
  present: annotations,
  future: [],
});

const unchanged = (left: Annotation[], right: Annotation[]) =>
  left.length === right.length && left.every((annotation, index) => annotation === right[index]);

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "commit":
      if (unchanged(state.present, action.annotations)) return state;
      return {
        past: [...state.past, state.present],
        present: action.annotations,
        future: [],
      };
    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
    case "clear":
      if (state.present.length === 0) return state;
      return { past: [...state.past, state.present], present: [], future: [] };
    case "reset":
      return createHistory(action.annotations);
  }
}
