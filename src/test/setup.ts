import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  value: ResizeObserverMock,
});

const context = {
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  arc: vi.fn(),
  ellipse: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  stroke: vi.fn(),
  strokeRect: vi.fn(),
  drawImage: vi.fn(),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  setLineDash: vi.fn(),
  setTransform: vi.fn(),
  clearRect: vi.fn(),
};

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: vi.fn(() => context),
});

Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
  configurable: true,
  value: vi.fn((callback: BlobCallback) => callback(new Blob(["png"], { type: "image/png" }))),
});

Object.defineProperty(HTMLCanvasElement.prototype, "setPointerCapture", {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLCanvasElement.prototype, "releasePointerCapture", {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLCanvasElement.prototype, "hasPointerCapture", {
  configurable: true,
  value: vi.fn(() => true),
});
