import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "content-automation/src/**/*.test.ts",
      "src/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules", "**/*.d.ts", "**/index.ts"],
      include: [
        "content-automation/src/processors/**/*.ts",
        "content-automation/src/scrapers/parsers.ts",
        "content-automation/src/scrapers/types.ts",
        "content-automation/src/article-planner.ts",
        "content-automation/src/providers/**/*.ts",
        "content-automation/src/utils/**/*.ts",
        "content-automation/src/config/pricing.ts",
        "src/endpoints/jobStore.ts",
        "src/lib/**/*.ts",
        "src/collections/**/*.ts",
      ],
    },
    testTimeout: 10000,
  },
});
