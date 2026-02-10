/**
 * Unit Tests for Tire Description Generator
 *
 * Tests prompt building and content validation.
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
    tireDescription: "You are a tire description generator.",
  },
  SEASON_LABELS: {
    summer: { name: "Літній" },
    winter: { name: "Зимовий" },
    allseason: { name: "Всесезонний" },
  },
  formatVehicleTypes: (types: string[]) => types.join(", "),
  getSystemPromptsForBrand: () => ({
    tireDescription: "Brand-specific system prompt.",
  }),
}));

vi.mock("../../types/content.js", () => ({
  BRAND_NAMES: {
    bridgestone: "Bridgestone",
    firestone: "Firestone",
  },
}));

vi.mock("../../utils/storage.js", () => ({
  loadFromStorage: vi.fn(),
}));

vi.mock("../../utils/logger.js", () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

import {
  generateTireDescription,
  type TireDescriptionInput,
} from "./tire-description.js";

describe("generateTireDescription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validDescriptionResponse = {
    shortDescription:
      "Bridgestone Turanza 6 — преміальна літня шина з технологією ENLITEN для максимальної ефективності палива та відмінного зчеплення на мокрій дорозі.",
    fullDescription:
      "## Огляд Bridgestone Turanza 6\n\n" +
      "Turanza 6 — новітня літня шина преміум-класу від Bridgestone. " +
      Array(100).fill("Тестовий контент для перевірки.").join(" ") +
      "\n\n## Для кого підходить\n\nЦя шина ідеально підходить для щоденних поїздок.",
    keyBenefits: [
      "Технологія ENLITEN для зниження ваги",
      "Відмінне зчеплення на мокрій дорозі",
      "Низький рівень шуму",
      "Висока паливна ефективність",
    ],
  };

  function setupMockResponse(overrides: Record<string, unknown> = {}) {
    mockGenerateJSON.mockResolvedValue({
      data: { ...validDescriptionResponse, ...overrides },
      response: {
        provider: "anthropic",
        model: "claude-3-haiku",
        usage: { promptTokens: 400, completionTokens: 600 },
        cost: 0.0015,
        latencyMs: 1200,
      },
    });
  }

  const baseInput: TireDescriptionInput = {
    modelSlug: "turanza-6",
    modelName: "Turanza 6",
    season: "summer",
  };

  it("should generate description with valid input", async () => {
    setupMockResponse();

    const result = await generateTireDescription(baseInput, {
      skipValidation: true,
    });

    expect(result.content.shortDescription).toBe(
      validDescriptionResponse.shortDescription
    );
    expect(result.content.fullDescription).toBeTruthy();
    expect(result.content.keyBenefits).toHaveLength(4);
    expect(result.metadata.provider).toBe("anthropic");
    expect(result.metadata.cost).toBe(0.0015);
  });

  it("should include brand name in prompt", async () => {
    setupMockResponse();

    await generateTireDescription(baseInput, { skipValidation: true });

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain("Bridgestone");
    expect(prompt).toContain("Turanza 6");
  });

  it("should include Firestone brand when specified", async () => {
    setupMockResponse();

    await generateTireDescription(
      { ...baseInput, brand: "firestone", modelName: "Roadhawk 2" },
      { skipValidation: true }
    );

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain("Firestone");
    expect(prompt).toContain("Roadhawk 2");
  });

  it("should include season in prompt", async () => {
    setupMockResponse();

    await generateTireDescription(
      { ...baseInput, season: "winter" },
      { skipValidation: true }
    );

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain("Зимовий");
  });

  it("should include vehicle types in prompt when provided", async () => {
    setupMockResponse();

    await generateTireDescription(
      { ...baseInput, vehicleTypes: ["passenger", "suv"] },
      { skipValidation: true }
    );

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain("passenger, suv");
  });

  it("should include technologies in prompt when provided", async () => {
    setupMockResponse();

    await generateTireDescription(
      { ...baseInput, technologies: ["ENLITEN", "B-Silent"] },
      { skipValidation: true }
    );

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain("ENLITEN");
    expect(prompt).toContain("B-Silent");
  });

  it("should include EU label in prompt when provided", async () => {
    setupMockResponse();

    await generateTireDescription(
      {
        ...baseInput,
        euLabel: { wetGrip: "A", fuelEfficiency: "B", noiseDb: 69 },
      },
      { skipValidation: true }
    );

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain("Мокре зчеплення A");
    expect(prompt).toContain("Паливна ефективність B");
    expect(prompt).toContain("69");
  });

  it("should include test results in prompt when provided", async () => {
    setupMockResponse();

    await generateTireDescription(
      {
        ...baseInput,
        testResults: "Переможець тесту ADAC 2024 у категорії літніх шин",
      },
      { skipValidation: true }
    );

    const prompt = mockGenerateJSON.mock.calls[0][0];
    expect(prompt).toContain("ADAC 2024");
  });

  describe("validation", () => {
    it("should throw for too short shortDescription", async () => {
      setupMockResponse({ shortDescription: "Too short" });

      await expect(generateTireDescription(baseInput)).rejects.toThrow(
        "Validation failed"
      );
    });

    it("should throw for too long shortDescription (>350 chars)", async () => {
      setupMockResponse({ shortDescription: "A".repeat(400) });

      await expect(generateTireDescription(baseInput)).rejects.toThrow(
        "Validation failed"
      );
    });

    it("should throw for too short fullDescription (<500 chars)", async () => {
      setupMockResponse({ fullDescription: "Short full description" });

      await expect(generateTireDescription(baseInput)).rejects.toThrow(
        "Validation failed"
      );
    });

    it("should throw for fewer than 3 keyBenefits", async () => {
      setupMockResponse({ keyBenefits: ["One", "Two"] });

      await expect(generateTireDescription(baseInput)).rejects.toThrow(
        "Validation failed"
      );
    });

    it("should skip validation when skipValidation is true", async () => {
      setupMockResponse({
        shortDescription: "Short",
        fullDescription: "Short",
        keyBenefits: [],
      });

      // Should NOT throw
      const result = await generateTireDescription(baseInput, {
        skipValidation: true,
      });
      expect(result.content.shortDescription).toBe("Short");
    });
  });

  it("should use brand-specific system prompt", async () => {
    setupMockResponse();

    await generateTireDescription(baseInput, { skipValidation: true });

    const callArgs = mockGenerateJSON.mock.calls[0];
    const options = callArgs[1];
    expect(options.systemPrompt).toBe("Brand-specific system prompt.");
  });
});
