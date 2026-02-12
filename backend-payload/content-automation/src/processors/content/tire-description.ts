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
import { translateToUkrainian } from "./translate.js";

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
  "shortDescription": "Короткий опис 150-250 символів для картки товару. Формат: одне речення про шину, потім 2-3 ключові особливості через •. Приклад: 'Преміальна літня шина для седанів та кросоверів. Зчеплення на мокрій дорозі класу A • технологія ENLITEN • низький опір коченню.' Використовуй конкретні дані з вхідних даних.",
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
 * Build English prompt for two-stage generation
 */
function buildPromptEN(input: TireDescriptionInput): string {
  const season = { summer: "summer", winter: "winter", allseason: "all-season" }[input.season];
  const brand = input.brand || "bridgestone";
  const brandName = BRAND_NAMES[brand];

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
    advantages = [...new Set(advantages)];
  }

  return `Create unique content for the ${brandName} ${input.modelName} tire.

INPUT DATA:
- Model: ${brandName} ${input.modelName}
- Season: ${season}
${input.vehicleTypes?.length ? `- Vehicle types: ${input.vehicleTypes.join(", ")}` : ""}
${input.technologies?.length ? `- Technologies: ${input.technologies.join(", ")}` : ""}
${input.euLabel ? `- EU Label: Wet grip ${input.euLabel.wetGrip || "-"}, Fuel efficiency ${input.euLabel.fuelEfficiency || "-"}, Noise ${input.euLabel.noiseDb || "-"}dB` : ""}
${input.testResults ? `- Test results: ${input.testResults}` : ""}
${advantages.length ? `\nADVANTAGES:\n${advantages.map((a) => `- ${a}`).join("\n")}` : ""}
${Object.keys(specifications).length ? `\nSPECIFICATIONS:\n${Object.entries(specifications).map(([k, v]) => `- ${k}: ${v}`).join("\n")}` : ""}
${rawDescription ? `\nREFERENCE DESCRIPTION (do NOT copy, just for context):${rawDescription}` : ""}
${input.relatedItems?.length ? `\nINTERLINKING URLs (use 2-3 organically in the text):\n${input.relatedItems.map((item) => {
  const url = item.type === "tyre" ? `/shyny/${item.slug}` : `/blog/${item.slug}`;
  return `- ${item.name}: ${url}`;
}).join("\n")}` : ""}

RESPONSE FORMAT (JSON):
{
  "shortDescription": "Short description 150-250 characters for product card. Format: one sentence about the tire, then list 2-3 key features separated by •. Example: 'Premium summer tire for sedans and SUVs. Wet grip class A • ENLITEN lightweight technology • low rolling resistance.' Use specific features from the input data.",
  "fullDescription": "Full HTML description 300-500 words. Structure: <h2>Introduction</h2><p>...</p><h2>Advantages</h2><ul><li>...</li></ul><h2>Who it's for</h2><p>...</p>. Use tags: h2, h3, p, ul, li, strong, a.",
  "keyBenefits": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4", "Benefit 5"]
}

IMPORTANT:
- Response ONLY in JSON format
- Content must be 100% unique
- Do NOT mention prices
- fullDescription in HTML format (h2, h3, p, ul, li, strong, a)
- keyBenefits: 4-5 specific short items
- Write in ENGLISH (will be translated to Ukrainian later)`;
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
    /** Generate in English first, then translate to Ukrainian */
    twoStage?: boolean;
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
    twoStage?: boolean;
    translationProvider?: string;
    translationCost?: number;
  };
}> {
  const brand = input.brand || "bridgestone";

  // Two-stage mode: generate in English → translate to Ukrainian
  if (options?.twoStage) {
    const promptEN = buildPromptEN(input);

    logger.info(`Generating description (EN→UA) for ${input.modelName} (${brand})`, {
      provider: options?.provider || "default",
      twoStage: true,
    });

    const generator = fallbackLlm.forTask("content-generation");

    const systemPromptEN = `You are a professional SEO copywriter for the official ${BRAND_NAMES[brand]} website.

Rules:
- Write in professional but accessible English
- Highlight technical advantages and safety
- NEVER mention prices
- Avoid clichés and excessive adjectives
- Focus on driver benefits
- Use specific facts from the input data
- Use HTML tags: h2, h3, p, ul, li, strong, a
- Write detailed, comprehensive content (300-500 words for fullDescription)`;

    const { data: englishData, response: genResponse } = await generator.generateJSON<DescriptionOutput>(promptEN, {
      systemPrompt: systemPromptEN,
      maxTokens: 4000,
      temperature: 0.7,
      ...(options?.provider && { provider: options.provider }),
      ...(options?.model && { model: options.model }),
    });

    logger.info(`English content generated for ${input.modelName}`, {
      shortDescLength: englishData.shortDescription.length,
      fullDescLength: englishData.fullDescription.length,
      keyBenefits: englishData.keyBenefits.length,
      cost: genResponse.cost.toFixed(4),
    });

    // Translate to Ukrainian
    const { data: ukrainianData, translationMeta } = await translateToUkrainian<DescriptionOutput>(
      englishData,
      {
        brand,
        keywords: input.technologies,
        contentType: "tire-description",
      }
    );

    // Validate translated content
    if (!options?.skipValidation) {
      validateContent(ukrainianData);
    }

    const totalCost = genResponse.cost + translationMeta.cost;

    logger.info(`Description generated (EN→UA) for ${input.modelName}`, {
      shortDescLength: ukrainianData.shortDescription.length,
      fullDescLength: ukrainianData.fullDescription.length,
      keyBenefits: ukrainianData.keyBenefits.length,
      totalCost: totalCost.toFixed(4),
      translationProvider: translationMeta.provider,
    });

    return {
      content: ukrainianData,
      metadata: {
        provider: genResponse.provider,
        model: genResponse.model,
        promptTokens: genResponse.usage.promptTokens,
        completionTokens: genResponse.usage.completionTokens,
        cost: totalCost,
        latencyMs: genResponse.latencyMs + translationMeta.latencyMs,
        twoStage: true,
        translationProvider: translationMeta.provider,
        translationCost: translationMeta.cost,
      },
    };
  }

  // Standard single-stage mode (Ukrainian directly)
  const prompt = buildPrompt(input);

  logger.info(`Generating description for ${input.modelName} (${brand})`, {
    provider: options?.provider || "default",
  });

  const generator = fallbackLlm.forTask("content-generation");
  const systemPrompts = getSystemPromptsForBrand(brand);

  const { data: rawData, response } = await generator.generateJSON<DescriptionOutput>(prompt, {
    systemPrompt: systemPrompts.tireDescription,
    maxTokens: 4000,
    temperature: 0.7,
    ...(options?.provider && { provider: options.provider }),
    ...(options?.model && { model: options.model }),
  });

  // Normalize field names (DeepSeek may return snake_case, wrapped objects, or arrays)
  let raw = rawData as Record<string, unknown>;

  // If response is an array, take the first object
  if (Array.isArray(rawData)) {
    raw = (rawData[0] || {}) as Record<string, unknown>;
  }
  // If response is wrapped in a key like "data" or "result", unwrap it
  if (!raw.shortDescription && !raw.short_description && !raw.fullDescription && !raw.full_description) {
    const firstValue = Object.values(raw)[0];
    if (firstValue && typeof firstValue === "object" && !Array.isArray(firstValue)) {
      raw = firstValue as Record<string, unknown>;
    }
  }

  const data: DescriptionOutput = {
    shortDescription: (raw.shortDescription || raw.short_description || "") as string,
    fullDescription: (raw.fullDescription || raw.full_description || "") as string,
    keyBenefits: Array.isArray(raw.keyBenefits) ? raw.keyBenefits
      : Array.isArray(raw.key_benefits) ? raw.key_benefits
      : Array.isArray(raw.highlights) ? raw.highlights
      : [],
  };

  // Warn if normalization produced empty results
  if (!data.shortDescription && !data.fullDescription) {
    logger.warn(`Empty content after normalization for ${input.modelName}`, {
      rawKeys: Object.keys(rawData as Record<string, unknown>),
      rawSample: JSON.stringify(rawData).substring(0, 300),
    });
  }

  // Validate content
  if (!options?.skipValidation) {
    validateContent(data);
  }

  logger.info(`Description generated for ${input.modelName}`, {
    shortDescLength: data.shortDescription?.length ?? 0,
    fullDescLength: data.fullDescription?.length ?? 0,
    keyBenefits: data.keyBenefits?.length ?? 0,
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

/**
 * Generate only shortDescription + keyBenefits (lightweight, no fullDescription)
 * Used for regenerating shortDescriptions for existing tyres
 */
export async function generateShortDescriptionOnly(
  input: TireDescriptionInput,
): Promise<{
  shortDescription: string;
  keyBenefits: string[];
  metadata: {
    provider: string;
    model: string;
    cost: number;
    latencyMs: number;
  };
}> {
  const brand = input.brand || "bridgestone";
  const brandName = BRAND_NAMES[brand];
  const season = { summer: "summer", winter: "winter", allseason: "all-season" }[input.season];

  const prompt = `Generate a short product card description and key benefits for the ${brandName} ${input.modelName} tire.

INPUT DATA:
- Model: ${brandName} ${input.modelName}
- Season: ${season}
${input.vehicleTypes?.length ? `- Vehicle types: ${input.vehicleTypes.join(", ")}` : ""}
${input.technologies?.length ? `- Technologies: ${input.technologies.join(", ")}` : ""}
${input.euLabel ? `- EU Label: Wet grip ${input.euLabel.wetGrip || "-"}, Fuel efficiency ${input.euLabel.fuelEfficiency || "-"}, Noise ${input.euLabel.noiseDb || "-"}dB` : ""}
${input.testResults ? `- Test results: ${input.testResults}` : ""}

RESPONSE FORMAT (JSON):
{
  "shortDescription": "150-250 characters for product card. Format: one sentence about the tire, then list 2-3 key features separated by •. Example: 'Premium summer tire for sedans and SUVs. Wet grip class A • ENLITEN lightweight technology • low rolling resistance.' Use specific features from the input data.",
  "keyBenefits": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4", "Benefit 5"]
}

IMPORTANT:
- Response ONLY in JSON format
- Use specific facts from input data (EU label classes, technologies, etc.)
- Do NOT mention prices or number of sizes
- keyBenefits: 4-5 specific short items highlighting unique advantages
- Write in ENGLISH (will be translated to Ukrainian later)`;

  const generator = fallbackLlm.forTask("content-generation");

  const { data: englishData, response: genResponse } = await generator.generateJSON<{
    shortDescription: string;
    keyBenefits: string[];
  }>(prompt, {
    systemPrompt: `You are a professional tire copywriter for the ${brandName} website. Write concise, factual product descriptions.`,
    maxTokens: 1000,
    temperature: 0.7,
  });

  // Translate to Ukrainian
  const { data: ukrainianData, translationMeta } = await translateToUkrainian(
    englishData,
    { brand, contentType: "tire-description" }
  );

  const totalCost = genResponse.cost + translationMeta.cost;

  logger.info(`Short description generated (EN→UA) for ${input.modelName}`, {
    shortDescLength: ukrainianData.shortDescription.length,
    keyBenefits: ukrainianData.keyBenefits.length,
    totalCost: totalCost.toFixed(4),
  });

  return {
    shortDescription: ukrainianData.shortDescription,
    keyBenefits: ukrainianData.keyBenefits,
    metadata: {
      provider: genResponse.provider,
      model: genResponse.model,
      cost: totalCost,
      latencyMs: genResponse.latencyMs + translationMeta.latencyMs,
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
