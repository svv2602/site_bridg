/**
 * Unit Tests for Article Generator
 *
 * Tests prompt building, response validation, and slug generation.
 * LLM calls are mocked via vi.mock().
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fallbackLlm
const mockGenerateJSON = vi.fn();
vi.mock("../../providers/fallback-llm.js", () => ({
  fallbackLlm: {
    forTask: () => ({
      generateJSON: mockGenerateJSON,
    }),
  },
}));

vi.mock("../../prompts/index.js", () => ({
  SYSTEM_PROMPTS: {
    article: "You are an article generator for Bridgestone Ukraine.",
  },
}));

vi.mock("../../utils/logger.js", () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { generateArticle, type ArticleInput } from "./article-generator.js";

describe("generateArticle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validArticleResponse = {
    title: "Bridgestone Turanza 6: повний огляд нової преміум моделі",
    excerpt:
      "Детальний огляд нових літніх шин Bridgestone Turanza 6 з технологією ENLITEN для максимальної ефективності та комфорту.",
    content:
      "## Вступ\n\n" +
      "Bridgestone Turanza 6 — це нове покоління літніх шин преміум-класу. " +
      Array(150).fill("Тестовий текст для перевірки довжини.").join(" ") +
      "\n\n## Висновок\n\nОберіть Turanza 6 для безпечної та комфортної їзди.",
    tags: ["Turanza 6", "огляд", "літні шини"],
    readingTime: 5,
    relatedTyres: ["turanza-6"],
  };

  function setupMockResponse(overrides: Record<string, unknown> = {}) {
    mockGenerateJSON.mockResolvedValue({
      data: { ...validArticleResponse, ...overrides },
      response: {
        provider: "anthropic",
        model: "claude-3-haiku",
        usage: { promptTokens: 500, completionTokens: 800 },
        cost: 0.002,
        latencyMs: 1500,
      },
    });
  }

  it("should generate article with valid input", async () => {
    setupMockResponse();

    const input: ArticleInput = {
      topic: "Bridgestone Turanza 6: повний огляд",
      type: "model-review",
      tireModels: ["Turanza 6"],
      keywords: ["Turanza 6", "огляд"],
    };

    const result = await generateArticle(input, { skipValidation: true });

    expect(result.article.title).toBe(validArticleResponse.title);
    expect(result.article.slug).toBeTruthy();
    expect(result.article.tags).toEqual(["Turanza 6", "огляд", "літні шини"]);
    expect(result.metadata.provider).toBe("anthropic");
    expect(result.metadata.cost).toBe(0.002);
  });

  it("should include tireModels in prompt", async () => {
    setupMockResponse();

    const input: ArticleInput = {
      topic: "Test topic",
      type: "comparison",
      tireModels: ["Turanza 6", "Potenza Sport"],
    };

    await generateArticle(input, { skipValidation: true });

    // Verify generateJSON was called with a prompt containing tire models
    const callArgs = mockGenerateJSON.mock.calls[0];
    const prompt = callArgs[0];
    expect(prompt).toContain("Turanza 6, Potenza Sport");
  });

  it("should include testData in prompt when provided", async () => {
    setupMockResponse();

    const input: ArticleInput = {
      topic: "ADAC Test Summary",
      type: "test-summary",
      testData: {
        source: "ADAC",
        year: 2025,
        results: "1. Bridgestone Turanza 6 (gut); 2. Continental PC7 (gut)",
      },
    };

    await generateArticle(input, { skipValidation: true });

    const callArgs = mockGenerateJSON.mock.calls[0];
    const prompt = callArgs[0];
    expect(prompt).toContain("ADAC");
    expect(prompt).toContain("2025");
    expect(prompt).toContain("Bridgestone Turanza 6");
  });

  it("should include keywords in prompt when provided", async () => {
    setupMockResponse();

    const input: ArticleInput = {
      topic: "Test",
      type: "tips",
      keywords: ["зимові шини", "безпека"],
    };

    await generateArticle(input, { skipValidation: true });

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain("зимові шини, безпека");
  });

  it("should generate slug from title", async () => {
    setupMockResponse({
      title: "Як обрати зимові шини 2025",
    });

    const input: ArticleInput = {
      topic: "Winter tyre guide",
      type: "seasonal-guide",
    };

    const result = await generateArticle(input, { skipValidation: true });

    expect(result.article.slug).toMatch(/^[а-яїієґa-z0-9-]+$/);
    expect(result.article.slug.length).toBeLessThanOrEqual(60);
  });

  it("should throw validation error for too short title when validation enabled", async () => {
    setupMockResponse({ title: "Short" });

    const input: ArticleInput = {
      topic: "Test",
      type: "tips",
    };

    await expect(generateArticle(input)).rejects.toThrow(
      "Article validation failed"
    );
  });

  it("should throw validation error for too long title", async () => {
    setupMockResponse({ title: "A".repeat(120) });

    const input: ArticleInput = {
      topic: "Test",
      type: "tips",
    };

    await expect(generateArticle(input)).rejects.toThrow(
      "Article validation failed"
    );
  });

  it("should throw validation error for too short excerpt", async () => {
    setupMockResponse({ excerpt: "Too short" });

    const input: ArticleInput = {
      topic: "Test",
      type: "tips",
    };

    await expect(generateArticle(input)).rejects.toThrow(
      "Article validation failed"
    );
  });

  it("should throw validation error when fewer than 2 tags", async () => {
    setupMockResponse({ tags: ["only-one"] });

    const input: ArticleInput = {
      topic: "Test",
      type: "tips",
    };

    await expect(generateArticle(input)).rejects.toThrow(
      "Article validation failed"
    );
  });

  it("should skip validation when skipValidation is true", async () => {
    setupMockResponse({ title: "Short", excerpt: "X", tags: [] });

    const input: ArticleInput = {
      topic: "Test",
      type: "tips",
    };

    // Should NOT throw
    const result = await generateArticle(input, { skipValidation: true });
    expect(result.article.title).toBe("Short");
  });

  it("should use content-generation task routing", async () => {
    setupMockResponse();

    const input: ArticleInput = {
      topic: "Test",
      type: "tips",
    };

    await generateArticle(input, { skipValidation: true });

    // Verify generateJSON was called with correct options
    const callArgs = mockGenerateJSON.mock.calls[0];
    const options = callArgs[1];
    expect(options.systemPrompt).toBe(
      "You are an article generator for Bridgestone Ukraine."
    );
    expect(options.maxTokens).toBe(4000);
    expect(options.temperature).toBe(0.7);
  });

  it("should set correct word count range for each article type", async () => {
    const types: ArticleInput["type"][] = [
      "seasonal-guide",
      "model-review",
      "test-summary",
      "comparison",
      "technology",
      "tips",
    ];

    for (const type of types) {
      setupMockResponse();

      await generateArticle(
        { topic: "Test", type },
        { skipValidation: true }
      );

      const prompt = mockGenerateJSON.mock.calls.at(-1)![0];
      // Prompt should contain word count range
      expect(prompt).toMatch(/\d+-\d+ слів/);
    }
  });
});
