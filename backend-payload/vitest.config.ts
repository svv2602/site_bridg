import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["content-automation/src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules", "**/*.d.ts", "**/index.ts"],
      include: ["content-automation/src/processors/**/*.ts"],
    },
    testTimeout: 10000,
  },
});
