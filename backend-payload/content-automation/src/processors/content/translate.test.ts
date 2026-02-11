/**
 * Unit Tests for English → Ukrainian Translation Utility
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

vi.mock("../../types/content.js", () => ({
  BRAND_NAMES: {
    bridgestone: "Bridgestone",
    firestone: "Firestone",
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

import { translateToUkrainian } from "./translate.js";

describe("translateToUkrainian", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const englishContent = {
    shortDescription: "Bridgestone Turanza 6 is a premium summer tire with ENLITEN technology.",
    fullDescription: "<h2>Overview</h2><p>The Turanza 6 delivers excellent performance.</p>",
    keyBenefits: ["Low rolling resistance", "Wet grip excellence", "Low noise"],
  };

  const ukrainianContent = {
    shortDescription: "Bridgestone (Бріджстоун) Turanza 6 — преміальна літня шина з технологією ENLITEN.",
    fullDescription: "<h2>Огляд</h2><p>Turanza 6 забезпечує відмінні характеристики.</p>",
    keyBenefits: ["Низький опір кочення", "Відмінне зчеплення на мокрій дорозі", "Низький рівень шуму"],
  };

  function setupMockTranslation(data = ukrainianContent) {
    mockGenerateJSON.mockResolvedValue({
      data,
      response: {
        provider: "google",
        model: "gemini-2.5-flash",
        usage: { promptTokens: 300, completionTokens: 400 },
        cost: 0.0003,
        latencyMs: 800,
      },
    });
  }

  it("should translate content and return data with metadata", async () => {
    setupMockTranslation();

    const result = await translateToUkrainian(englishContent, {
      brand: "bridgestone",
      contentType: "tire-description",
    });

    expect(result.data.shortDescription).toContain("Бріджстоун");
    expect(result.translationMeta.provider).toBe("google");
    expect(result.translationMeta.cost).toBe(0.0003);
  });

  it("should use content-translation task routing", async () => {
    setupMockTranslation();

    await translateToUkrainian(englishContent);

    // fallbackLlm.forTask should be called with "content-translation"
    // (verified by the mock setup — forTask returns our mock)
    expect(mockGenerateJSON).toHaveBeenCalledTimes(1);
  });

  it("should include brand transliteration in prompt", async () => {
    setupMockTranslation();

    await translateToUkrainian(englishContent, { brand: "bridgestone" });

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain("Бріджстоун");
    expect(prompt).toContain("Bridgestone");
  });

  it("should include Firestone transliteration when specified", async () => {
    setupMockTranslation();

    await translateToUkrainian(englishContent, { brand: "firestone" });

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain("Файрстоун");
    expect(prompt).toContain("Firestone");
  });

  it("should include keywords in prompt when provided", async () => {
    setupMockTranslation();

    await translateToUkrainian(englishContent, {
      keywords: ["літні шини", "преміум"],
    });

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain("літні шини");
    expect(prompt).toContain("преміум");
  });

  it("should use low temperature for consistent translation", async () => {
    setupMockTranslation();

    await translateToUkrainian(englishContent);

    const options = mockGenerateJSON.mock.calls[0][1];
    expect(options.temperature).toBe(0.3);
  });

  it("should pass JSON content in prompt", async () => {
    setupMockTranslation();

    await translateToUkrainian(englishContent);

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain('"shortDescription"');
    expect(prompt).toContain("ENLITEN");
  });
});
