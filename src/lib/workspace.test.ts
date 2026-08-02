import { describe, expect, it, vi } from "vitest";
import {
  createBlankDocument,
  createInitialWorkspace,
  loadWorkspace,
  saveWorkspace,
  WORKSPACE_STORAGE_KEY,
} from "./workspace";

describe("workspace persistence", () => {
  it("starts with the annotated dashboard example", () => {
    const workspace = createInitialWorkspace();
    expect(workspace.documents).toHaveLength(1);
    expect(workspace.documents[0].kind).toBe("example");
    expect(workspace.documents[0].annotations).toHaveLength(5);
  });

  it("creates independently named blank documents", () => {
    expect(createBlankDocument(1, "2026-08-02T00:00:00.000Z").title).toBe("Untitled board");
    expect(createBlankDocument(2, "2026-08-02T00:00:00.000Z").title).toBe("Untitled board 2");
  });

  it("round-trips a saved workspace and rejects invalid data", () => {
    const workspace = createInitialWorkspace();
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    expect(saveWorkspace(storage, workspace)).toBe(true);
    expect(values.has(WORKSPACE_STORAGE_KEY)).toBe(true);
    expect(loadWorkspace(storage)).toEqual(workspace);

    values.set(WORKSPACE_STORAGE_KEY, "not-json");
    expect(loadWorkspace(storage).documents[0].kind).toBe("example");
  });

  it("handles storage quota failures", () => {
    const storage = { setItem: vi.fn(() => { throw new Error("quota"); }) };
    expect(saveWorkspace(storage, createInitialWorkspace())).toBe(false);
  });
});
