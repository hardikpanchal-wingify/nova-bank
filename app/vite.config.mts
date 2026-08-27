import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: appRoot,
  publicDir: path.resolve(appRoot, "public"),
  build: {
    outDir: path.resolve(appRoot, "dist"),
    emptyOutDir: true,
  },
  server: {
    middlewareMode: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  css: {
    postcss: path.resolve(appRoot, "postcss.config.js"),
  },
  resolve: {
    alias: {
      "@": path.resolve(appRoot, "src"),
    },
  },
});
