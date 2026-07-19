import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true,
    minify: false,
  },
  server: {
    // Keep HMR snappy; Lighthouse should use preview/build for scores
    warmup: {
      clientFiles: ["./src/main.jsx", "./src/App.jsx"],
    },
  },
});
