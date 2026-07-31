import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
  build: {
    // OneDrive can hold generated files briefly and make directory cleanup fail.
    emptyOutDir: false,
  },
});
