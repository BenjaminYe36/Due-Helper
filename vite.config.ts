import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/Due-Helper",
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
  }
});