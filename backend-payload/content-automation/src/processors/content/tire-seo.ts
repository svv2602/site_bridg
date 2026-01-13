/**
 * Tire SEO Generator
 *
 * Generates SEO metadata (title, description, keywords) for tire pages.
 */

import { llm } from "../../providers/index.js";
import { SYSTEM_PROMPTS, SEASON_LABELS, formatVehicleTypes } from "../../prompts/index.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("TireSEOGenerator");

/**
 * Input for SEO generation
 */
export interface TireSEOInput {
  modelSlug: string;
  modelName: string;
  season: "summer" | "winter" | "allseason";
  vehicleTypes?: string[];
  shortDescription?: string;
  keyBenefits?: string[];
}

/**
 * Output structure for generated SEO
 */
export interface SEOOutput {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

/**
 * Build prompt for SEO generation
 */
function buildPrompt(input: TireSEOInput): string {
  const season = SEASON_LABELS[input.season];
  const vehicles = input.vehicleTypes ? formatVehicleTypes(input.vehicleTypes) : "";

  return `Створи SEO мета-теги для сторінки шини Bridgestone ${input.modelName}.

ВХІДНІ ДАНІ:
- Модель: Bridgestone ${input.modelName}
- Сезон: ${season.name}
${vehicles ? `- Типи авто: ${vehicles}` : ""}
${input.shortDescription ? `- Короткий опис: ${input.shortDescription}` : ""}
${input.keyBenefits?.length ? `- Ключові переваги: ${input.keyBenefits.join(", ")}` : ""}

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "seoTitle": "SEO заголовок 50-60 символів. Починається з 'Bridgestone ${input.modelName}'",
  "seoDescription": "SEO опис 150-160 символів. Головна перевага + для кого підійде.",
  "seoKeywords": ["5-10 ключових слів для SEO"]
}

ВИМОГИ:
- seoTitle: 50-60 символів, включає назву моделі та сезон
- seoDescription: 150-160 символів, привабливий для кліку
- seoKeywords: включає "Bridgestone ${input.modelName}", "${season.name} шини", типи авто
- НЕ згадуй ціни
- Українська мова`;
}

/**
 * Parse JSON response from LLM
 */
function parseResponse(response: string): SEOOutput {
  const jsonMatch = response.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    seoTitle: parsed.seoTitle || "",
    seoDescription: parsed.seoDescription || "",
    seoKeywords: Array.isArray(parsed.seoKeywords) ? parsed.seoKeywords : [],
  };
}

/**
 * Validate SEO content
 */
function validateSEO(seo: SEOOutput): void {
  const errors: string[] = [];

  if (!seo.seoTitle || seo.seoTitle.length < 30) {
    errors.push(`seoTitle too short: ${seo.seoTitle?.length || 0} chars (min 30)`);
  }

  if (seo.seoTitle && seo.seoTitle.length > 70) {
    errors.push(`seoTitle too long: ${seo.seoTitle.length} chars (max 70)`);
  }

  if (!seo.seoDescription || seo.seoDescription.length < 100) {
    errors.push(`seoDescription too short: ${seo.seoDescription?.length || 0} chars (min 100)`);
  }

  if (seo.seoDescription && seo.seoDescription.length > 170) {
    errors.push(`seoDescription too long: ${seo.seoDescription.length} chars (max 170)`);
  }

  if (!seo.seoKeywords || seo.seoKeywords.length < 3) {
    errors.push(`seoKeywords needs at least 3 items, got ${seo.seoKeywords?.length || 0}`);
  }

  if (errors.length > 0) {
    throw new Error(`SEO validation failed: ${errors.join("; ")}`);
  }
}

/**
 * Generate SEO metadata using LLM
 */
export async function generateTireSEO(
  input: TireSEOInput,
  options?: {
    provider?: string;
    model?: string;
    skipValidation?: boolean;
  }
): Promise<{
  seo: SEOOutput;
  metadata: {
    provider: string;
    model: string;
    cost: number;
    latencyMs: number;
  };
}> {
  const prompt = buildPrompt(input);

  logger.info(`Generating SEO for ${input.modelName}`);

  // Use content-generation routing (DeepSeek available, Groq requires separate key)
  const generator = llm.forTask("content-generation");

  const { data, response } = await generator.generateJSON<SEOOutput>(prompt, {
    systemPrompt: SYSTEM_PROMPTS.tireSEO,
    maxTokens: 500,
    temperature: 0.5,
    ...(options?.provider && { provider: options.provider }),
    ...(options?.model && { model: options.model }),
  });

  // Validate SEO
  if (!options?.skipValidation) {
    validateSEO(data);
  }

  logger.info(`SEO generated for ${input.modelName}`, {
    titleLength: data.seoTitle.length,
    descLength: data.seoDescription.length,
    keywords: data.seoKeywords.length,
    cost: response.cost.toFixed(4),
  });

  return {
    seo: data,
    metadata: {
      provider: response.provider,
      model: response.model,
      cost: response.cost,
      latencyMs: response.latencyMs,
    },
  };
}

/**
 * Generate SEO from existing description content
 */
export async function generateTireSEOFromContent(
  modelSlug: string,
  modelName: string,
  season: "summer" | "winter" | "allseason",
  content: {
    shortDescription: string;
    highlights: string[];
  },
  options?: {
    provider?: string;
    model?: string;
  }
): Promise<SEOOutput> {
  const input: TireSEOInput = {
    modelSlug,
    modelName,
    season,
    shortDescription: content.shortDescription,
    keyBenefits: content.highlights,
  };

  const result = await generateTireSEO(input, options);
  return result.seo;
}

// CLI test
async function main() {
  console.log("Testing Tire SEO Generator...\n");

  const testInput: TireSEOInput = {
    modelSlug: "turanza-6",
    modelName: "Turanza 6",
    season: "summer",
    vehicleTypes: ["passenger", "suv"],
    shortDescription:
      "Преміум літні шини з відмінним зчепленням на мокрій дорозі та низьким рівнем шуму.",
    keyBenefits: [
      "Клас A мокрого зчеплення",
      "Технологія B-Silent для тишини",
      "Переможець тесту ADAC 2024",
    ],
  };

  try {
    const result = await generateTireSEO(testInput);

    console.log("\n=== SEO TITLE ===");
    console.log(result.seo.seoTitle);
    console.log(`(${result.seo.seoTitle.length} chars)`);

    console.log("\n=== SEO DESCRIPTION ===");
    console.log(result.seo.seoDescription);
    console.log(`(${result.seo.seoDescription.length} chars)`);

    console.log("\n=== SEO KEYWORDS ===");
    console.log(result.seo.seoKeywords.join(", "));

    console.log("\n=== METADATA ===");
    console.log(`Provider: ${result.metadata.provider}`);
    console.log(`Cost: $${result.metadata.cost.toFixed(4)}`);
    console.log(`Latency: ${result.metadata.latencyMs}ms`);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

if (process.argv[1]?.includes("tire-seo.ts")) {
  main();
}
