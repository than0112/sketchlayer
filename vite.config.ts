import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const runtimeEnvironment = (globalThis as {
  process?: { env?: Record<string, string | undefined> };
}).process?.env;
const viteCacheRoot = runtimeEnvironment?.TEMP ?? runtimeEnvironment?.TMPDIR ?? ".vite-cache";

export default defineConfig({
  plugins: [react()],
  // The repository lives in OneDrive. Keep Vite's disposable dependency cache
  // outside the sync folder to avoid slow optimization and stale deps_temp files.
  cacheDir: `${viteCacheRoot}/sketchlayer-vite-cache`,
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    css: true,
    exclude: ["e2e/**", "node_modules/**", "dist/**", "dist-lib/**"],
  },
  build: {
    // OneDrive can hold generated files briefly and make directory cleanup fail.
    emptyOutDir: false,
  },
});
