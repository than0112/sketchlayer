import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: "dist-lib",
    emptyOutDir: false,
    lib: {
      entry: {
        sketchlayer: "src/index.ts",
        pro: "src/pro/index.ts",
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "@phosphor-icons/react"],
    },
    sourcemap: true,
  },
});
