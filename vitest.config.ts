import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx", "src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts", "**/*.test.{ts,tsx}", "**/node_modules/**"],
    },
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "tests/gos3_full_coverage.test.ts", // Executed deterministically by direct tsx runner
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
