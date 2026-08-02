import { demoAnnotations, demoBackground, demoBackgroundImage } from "./demo";
import { DEFAULT_BACKGROUND } from "./serialization";
import type { Annotation, CanvasBackground, CanvasImageMeta } from "./types";

export const WORKSPACE_STORAGE_KEY = "sketchlayer.workspace.v1";
export const DEMO_DOCUMENT_ID = "ai-dashboard-feedback";

export type WorkspaceBackgroundImage = {
  url: string;
  meta: CanvasImageMeta;
  fit: "contain" | "cover";
};

export type WorkspaceDocument = {
  id: string;
  title: string;
  kind: "example" | "blank";
  annotations: Annotation[];
  background: CanvasBackground;
  backgroundImage: WorkspaceBackgroundImage | null;
  createdAt: string;
  updatedAt: string;
};

export type SavedWorkspace = {
  version: 1;
  activeDocumentId: string;
  documents: WorkspaceDocument[];
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function createExampleDocument(now = new Date().toISOString()): WorkspaceDocument {
  return {
    id: DEMO_DOCUMENT_ID,
    title: "AI Dashboard Feedback",
    kind: "example",
    annotations: clone(demoAnnotations),
    background: clone(demoBackground),
    backgroundImage: { ...clone(demoBackgroundImage), fit: "cover" },
    createdAt: now,
    updatedAt: now,
  };
}

const createDocumentId = () =>
  globalThis.crypto?.randomUUID?.() ?? `board-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function createBlankDocument(
  number: number,
  now = new Date().toISOString(),
): WorkspaceDocument {
  return {
    id: createDocumentId(),
    title: number === 1 ? "Untitled board" : `Untitled board ${number}`,
    kind: "blank",
    annotations: [],
    background: clone(DEFAULT_BACKGROUND),
    backgroundImage: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function createInitialWorkspace(): SavedWorkspace {
  const example = createExampleDocument();
  return { version: 1, activeDocumentId: example.id, documents: [example] };
}

const isWorkspaceDocument = (value: unknown): value is WorkspaceDocument => {
  if (!value || typeof value !== "object") return false;
  const document = value as Partial<WorkspaceDocument>;
  return (
    typeof document.id === "string" &&
    typeof document.title === "string" &&
    (document.kind === "example" || document.kind === "blank") &&
    Array.isArray(document.annotations) &&
    Boolean(document.background && typeof document.background === "object") &&
    typeof document.createdAt === "string" &&
    typeof document.updatedAt === "string"
  );
};

export function loadWorkspace(storage?: Pick<Storage, "getItem">): SavedWorkspace {
  if (!storage) return createInitialWorkspace();
  try {
    const raw = storage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return createInitialWorkspace();
    const parsed = JSON.parse(raw) as Partial<SavedWorkspace>;
    if (parsed.version !== 1 || !Array.isArray(parsed.documents) || !parsed.documents.every(isWorkspaceDocument)) {
      return createInitialWorkspace();
    }
    if (parsed.documents.length === 0) return createInitialWorkspace();
    const activeDocumentId = parsed.documents.some(({ id }) => id === parsed.activeDocumentId)
      ? parsed.activeDocumentId as string
      : parsed.documents[0].id;
    return { version: 1, activeDocumentId, documents: parsed.documents };
  } catch {
    return createInitialWorkspace();
  }
}

export function saveWorkspace(
  storage: Pick<Storage, "setItem">,
  workspace: SavedWorkspace,
): boolean {
  try {
    storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
    return true;
  } catch {
    return false;
  }
}

