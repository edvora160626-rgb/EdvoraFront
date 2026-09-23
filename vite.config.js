import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
    minify: "esbuild",
    cssMinify: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("exceljs") || id.includes("xlsx-js-style")) {
            return "excel";
          }
          if (id.includes("@mui") || id.includes("@emotion")) return "mui";
          if (id.includes("lucide-react")) return "icons";
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react-country-flag", "xlsx-js-style"],
    exclude: ["exceljs"],
  },
  server: {
    warmup: {
      clientFiles: [
        "./src/main.jsx",
        "./src/App.jsx",
        "./src/components/Login.jsx",
        "./src/common/AuthShell.jsx",
        "./src/pages/admin/AdminLayout.jsx",
      ],
    },
  },
});
