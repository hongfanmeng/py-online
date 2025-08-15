import type { IncomingMessage, ServerResponse } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { Plugin, ViteDevServer } from "vite";
import { defineConfig } from "vite";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

const PYODIDE_EXCLUDE = [
  "!**/*.{md,html}",
  "!**/*.d.ts",
  "!**/*.whl",
  "!**/node_modules",
];

const viteStaticCopyPyodide = () => {
  const pyodideDir = dirname(fileURLToPath(import.meta.resolve("pyodide")));
  return viteStaticCopy({
    targets: [
      {
        src: [join(pyodideDir, "*")].concat(PYODIDE_EXCLUDE),
        dest: "assets",
      },
    ],
  });
};

const crossOriginIsolation = (): Plugin => ({
  name: "cross-origin-isolation",
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      (_req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        next();
      }
    );
  },
});

export default defineConfig({
  optimizeDeps: { exclude: ["pyodide"] },
  plugins: [
    react(),
    tailwindcss(),
    crossOriginIsolation(),
    viteStaticCopyPyodide(),
  ],
  worker: { format: "es" },
  resolve: {
    alias: { "~": "/src" },
  },
  logLevel: "error",
});
