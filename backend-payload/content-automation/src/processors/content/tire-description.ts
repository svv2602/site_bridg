/**
 * Tire Description Generator
 *
 * Generates SEO-optimized tire descriptions using multi-provider LLM system.
 * Supports multi-brand (Bridgestone & Firestone).
 */

import { fallbackLlm } from "../../providers/fallback-llm.js";
import { SYSTEM_PROMPTS, SEASON_LABELS, formatVehicleTypes, getSystemPromptsForBrand, type RelatedItem } from "../../prompts/index.js";
import type { RawTyreContent, GeneratedTyreContent, Brand } from "../../types/content.js";
import { BRAND_NAMES } from "../../types/content.js";
import { loadFromStorage } from "../../utils/storage.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("TireDescriptionGenerator");

/**
 * Input for description generation
 */
export interface TireDescriptionInput {
  modelSlug: string;
  modelName: string;
  brand?: Brand;
  season: "summer" | "winter" | "allseason";
  vehicleTypes?: string[];
  technologies?: string[];
  euLabel?: {
    wetGrip?: string;
    fuelEfficiency?: string;
    noiseDb?: number;
  };
  rawContent?: RawTyreContent[];
  testResults?: string;
  relatedItems?: RelatedItem[];
}

/**
 * Output structure for generated description
 */
interface DescriptionOutput {
  shortDescription: string;
  fullDescription: string;
  keyBenefits: string[];
}

/**
 * Build prompt for tire description generation
 */
function buildPrompt(input: TireDescriptionInput): string {
  const season = SEASON_LABELS[input.season];
  const vehicles = input.vehicleTypes ? formatVehicleTypes(input.vehicleTypes) : "";
  const brand = input.brand || "bridgestone";
  const brandName = BRAND_NAMES[brand];

  // Merge raw content from multiple sources
  let rawDescription = "";
  let advantages: string[] = [];
  let specifications: Record<string, string> = {};

  if (input.rawContent && input.rawContent.length > 0) {
    for (const raw of input.rawContent) {
      if (raw.fullDescription) {
        rawDescription += `\n[${raw.source}]: ${raw.fullDescription}\n`;
      }
      if (raw.advantages) {
        advantages.push(...raw.advantages);
      }
      if (raw.specifications) {
        specifications = { ...specifications, ...raw.specifications };
      }
    }
    // Deduplicate advantages
    advantages = [...new Set(advantages)];
  }

  return `Створи унікальний контент для шини ${brandName} ${input.modelName}.

ВХІДНІ ДАНІ:
- Модель: ${brandName} ${input.modelName}
- Сезон: ${season.name}
${vehicles ? `- Типи авто: ${vehicles}` : ""}
${input.technologies?.length ? `- Технології: ${input.technologies.join(", ")}` : ""}
${input.euLabel ? `- EU Label: Мокре зчеплення ${input.euLabel.wetGrip || "-"}, Паливна ефективність ${input.euLabel.fuelEfficiency || "-"}, Шум ${input.euLabel.noiseDb || "-"}дБ` : ""}
${input.testResults ? `- Результати тестів: ${input.testResults}` : ""}
${advantages.length ? `\nПЕРЕВАГИ:\n${advantages.map((a) => `- ${a}`).join("\n")}` : ""}
${Object.keys(specifications).length ? `\nСПЕЦИФІКАЦІЇ:\n${Object.entries(specifications).map(([k, v]) => `- ${k}: ${v}`).join("\n")}` : ""}
${rawDescription ? `\nОПИС-РЕФЕРЕНС (НЕ копіювати, лише для розуміння):${rawDescription}` : ""}
${input.relatedItems?.length ? `\nПОСИЛАННЯ ДЛЯ ПЕРЕЛІНКОВКИ (використай 2-3 з них органічно в тексті):\n${input.relatedItems.map((item) => {
  const url = item.type === "tyre" ? `/shyny/${item.slug}` : `/blog/${item.slug}`;
  return `- ${item.name}: ${url}`;
}).join("\n")}` : ""}

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "shortDescription": "Короткий опис 150-200 символів для картки товару. Головна перевага + для кого підійде.",
  "fullDescription": "Повний HTML опис 300-500 слів. Структура: <h2>Вступ</h2><p>...</p><h2>Переваги</h2><ul><li>...</li></ul><h2>Для кого підійде</h2><p>...</p>. Використовуй теги: h2, h3, p, ul, li, strong, a.",
  "keyBenefits": ["Перевага 1", "Перевага 2", "Перевага 3", "Перевага 4", "Перевага 5"]
}

ВАЖЛИВО:
- Відповідь ТІЛЬКИ у форматі JSON
- Контент має бути 100% унікальним
- НЕ згадуй ціни
- fullDescription у форматі HTML (h2, h3, p, ul, li, strong, a)
- keyBenefits: 4-5 конкретних коротких пунктів`;
}

/**
 * Parse JSON response from LLM
 */
function parseResponse(response: string): DescriptionOutput {
  // Try to find JSON in response
  const jsonMatch = response.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    shortDescription: parsed.shortDescription || "",
    fullDescription: parsed.fullDescription || "",
    keyBenefits: Array.isArray(parsed.keyBenefits) ? parsed.keyBenefits : [],
  };
}

/**
 * Validate generated content
 */
function validateContent(content: DescriptionOutput): void {
  const errors: string[] = [];

  if (!content.shortDescription || content.shortDescription.length < 50) {
    errors.push(`shortDescription too short: ${content.shortDescription?.length || 0} chars (min 50)`);
  }

  if (content.shortDescription && content.shortDescription.length > 350) {
    errors.push(`shortDescription too long: ${content.shortDescription.length} chars (max 350)`);
  }

  if (!content.fullDescription || content.fullDescription.length < 500) {
    errors.push(`fullDescription too short: ${content.fullDescription?.length || 0} chars (min 500)`);
  }

  if (!content.keyBenefits || content.keyBenefits.length < 3) {
    errors.push(`keyBenefits needs at least 3 items, got ${content.keyBenefits?.length || 0}`);
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join("; ")}`);
  }
}

/**
 * Generate tire description using LLM
 */
export async function generateTireDescription(
  input: TireDescriptionInput,
  options?: {
    provider?: string;
    model?: string;
    skipValidation?: boolean;
  }
): Promise<{
  content: DescriptionOutput;
  metadata: {
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    cost: number;
    latencyMs: number;
  };
}> {
  const prompt = buildPrompt(input);
  const brand = input.brand || "bridgestone";

  logger.info(`Generating description for ${input.modelName} (${brand})`, {
    provider: options?.provider || "default",
  });

  // Use task-specific routing with brand-specific system prompt
  const generator = fallbackLlm.forTask("content-generation");
  const systemPrompts = getSystemPromptsForBrand(brand);

  const { data, response } = await generator.generateJSON<DescriptionOutput>(prompt, {
    systemPrompt: systemPrompts.tireDescription,
    maxTokens: 4000,
    temperature: 0.7,
    ...(options?.provider && { provider: options.provider }),
    ...(options?.model && { model: options.model }),
  });

  // Validate content
  if (!options?.skipValidation) {
    validateContent(data);
  }

  logger.info(`Description generated for ${input.modelName}`, {
    shortDescLength: data.shortDescription.length,
    fullDescLength: data.fullDescription.length,
    keyBenefits: data.keyBenefits.length,
    cost: response.cost.toFixed(4),
  });

  return {
    content: data,
    metadata: {
      provider: response.provider,
      model: response.model,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      cost: response.cost,
      latencyMs: response.latencyMs,
    },
  };
}

/**
 * Generate description using raw content from storage
 */
export async function generateTireDescriptionFromStorage(
  modelSlug: string,
  options?: {
    provider?: string;
    model?: string;
  }
): Promise<{
  content: DescriptionOutput;
  metadata: {
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    cost: number;
    latencyMs: number;
    sources: string[];
  };
}> {
  // Load raw content from storage
  const rawContent = await loadFromStorage<RawTyreContent[]>(`raw/${modelSlug}`);

  if (!rawContent || rawContent.length === 0) {
    throw new Error(`No raw content found for model: ${modelSlug}`);
  }

  // Build input from raw content
  const firstSource = rawContent[0];
  const input: TireDescriptionInput = {
    modelSlug,
    modelName: firstSource.modelName,
    season: firstSource.season || "summer",
    technologies: firstSource.technologies,
    euLabel: firstSource.euLabel
      ? {
          wetGrip: firstSource.euLabel.wetGrip,
          fuelEfficiency: firstSource.euLabel.fuelEfficiency,
          noiseDb: firstSource.euLabel.noiseLevel,
        }
      : undefined,
    rawContent,
  };

  const result = await generateTireDescription(input, options);

  return {
    content: result.content,
    metadata: {
      ...result.metadata,
      sources: rawContent.map((r) => r.sourceUrl),
    },
  };
}

// CLI test
async function main() {
  console.log("Testing Tire Description Generator with new provider system...\n");

  const testInput: TireDescriptionInput = {
    modelSlug: "turanza-6",
    modelName: "Turanza 6",
    season: "summer",
    vehicleTypes: ["passenger", "suv"],
    technologies: ["ENLITEN", "B-Silent"],
    euLabel: {
      wetGrip: "A",
      fuelEfficiency: "A",
      noiseDb: 69,
    },
    testResults: "Переможець тесту ADAC 2024 у категорії літніх шин 225/45 R17",
  };

  try {
    const result = await generateTireDescription(testInput);

    console.log("\n=== SHORT DESCRIPTION ===");
    console.log(result.content.shortDescription);
    console.log(`\n(${result.content.shortDescription.length} chars)`);

    console.log("\n=== FULL DESCRIPTION ===");
    console.log(result.content.fullDescription);
    console.log(`\n(${result.content.fullDescription.length} chars)`);

    console.log("\n=== KEY BENEFITS ===");
    result.content.keyBenefits.forEach((h, i) => console.log(`${i + 1}. ${h}`));

    console.log("\n=== METADATA ===");
    console.log(`Provider: ${result.metadata.provider}`);
    console.log(`Model: ${result.metadata.model}`);
    console.log(`Tokens: ${result.metadata.promptTokens} + ${result.metadata.completionTokens}`);
    console.log(`Cost: $${result.metadata.cost.toFixed(4)}`);
    console.log(`Latency: ${result.metadata.latencyMs}ms`);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run if called directly
if (process.argv[1]?.includes("tire-description.ts")) {
  main();
}
