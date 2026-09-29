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
      // 100% is mandatory inside an explicit architectural boundary.
      // Do not use the entire legacy src tree as an accidental denominator.
      // Product/UI modules enter this gate when their own test contract is declared.
      include: [
        "src/lib/deliverableTruthGate.ts",
        "src/components/agents/GOS3SystemInstructionInjector.tsx",
      ],
      exclude: ["**/*.d.ts", "**/*.test.{ts,tsx}", "**/node_modules/**"],
    },
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "tests/gos3_full_coverage.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
