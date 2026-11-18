import { defineConfig } from "vitest/config";

/**
 * The API's tests call the Hono app directly (app.request), so they need no
 * wrangler and no network.
 *
 *   pnpm test
 */
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    // Vitest's 5 seconds is tight on a slow CI runner; 30 still catches a hang.
    testTimeout: 30_000,
  },
});
