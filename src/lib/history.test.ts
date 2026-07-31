import { createHistory, historyReducer } from "./history";
import type { Stroke } from "./types";

const stroke: Stroke = {
  id: "stroke-1",
  type: "stroke",
  tool: "pen",
  points: [{ x: 10, y: 20 }],
  color: "#202124",
  size: 4,
  opacity: 1,
};

describe("historyReducer", () => {
  it("commits, clears, undoes, and redoes immutable snapshots", () => {
    const committed = historyReducer(createHistory(), { type: "commit", annotations: [stroke] });
    const cleared = historyReducer(committed, { type: "clear" });
    const undone = historyReducer(cleared, { type: "undo" });
    const redone = historyReducer(undone, { type: "redo" });

    expect(committed.present).toEqual([stroke]);
    expect(cleared.present).toEqual([]);
    expect(undone.present).toEqual([stroke]);
    expect(redone.present).toEqual([]);
    expect(committed.present).not.toBe(cleared.present);
  });

  it("invalidates redo after a new commit", () => {
    const committed = historyReducer(createHistory(), { type: "commit", annotations: [stroke] });
    const undone = historyReducer(committed, { type: "undo" });
    const replacement = { ...stroke, id: "stroke-2" };
    const replaced = historyReducer(undone, { type: "commit", annotations: [replacement] });

    expect(replaced.future).toEqual([]);
  });
});
