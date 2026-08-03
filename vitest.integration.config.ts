import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Backend end-to-end tests: plain node environment, no DOM setup.
 * Run with `npm run test:roles`.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/integration/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 180_000,
    hookTimeout: 180_000,
    fileParallelism: false,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
