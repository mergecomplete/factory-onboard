import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Both ports come from the environment, never a fixed number, so the factory
// can run a second copy beside the first (a red check on the default branch
// while a branch is up): PORT=6100 API_PORT=6101 pnpm dev.
const PORT = Number(process.env.PORT ?? 5173);
const API_TARGET = `http://localhost:${process.env.API_PORT ?? 8787}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: PORT,
    // Fail rather than walk to the next free port, which would leave the
    // caller testing against whatever else holds this one.
    strictPort: true,
    // One origin in development, as deployed, so there's no CORS to set up.
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
      "/version": { target: API_TARGET, changeOrigin: true },
    },
  },
  build: {
    // What wrangler.jsonc's assets.directory serves.
    outDir: "dist",
    emptyOutDir: true,
  },
});
