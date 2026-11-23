import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => {
  const target = mode === "gp" ? "gp" : mode === "un" ? "un" : "combined";
  const entry = target === "gp" ? "gp.html" : target === "un" ? "un.html" : "index.html";
  const outDir = target === "gp" ? "dist-gp" : target === "un" ? "dist-un" : "dist";
  return {
    base: "./",
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
    build: {
      chunkSizeWarningLimit: 1000,
      outDir,
      emptyOutDir: true,
      rollupOptions: { input: path.resolve(import.meta.dirname, entry) },
    },
  };
});
