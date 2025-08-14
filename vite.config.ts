import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";
import { viteStaticCopy } from "vite-plugin-static-copy";

const PYODIDE_EXCLUDE = [
  "!**/*.{md,html}",
  "!**/*.d.ts",
  "!**/*.whl",
  "!**/node_modules",
];

export function viteStaticCopyPyodide() {
  const pyodideDir = dirname(fileURLToPath(import.meta.resolve("pyodide")));
  return viteStaticCopy({
    targets: [
      {
        src: [join(pyodideDir, "*")].concat(PYODIDE_EXCLUDE),
        dest: "assets",
      },
    ],
  });
}

export default defineConfig({
  optimizeDeps: { exclude: ["pyodide"] },
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopyPyodide(),
    crossOriginIsolation(),
  ],
  worker: { format: "es" },
  resolve: {
    alias: { "~": "/src" },
  },
});
