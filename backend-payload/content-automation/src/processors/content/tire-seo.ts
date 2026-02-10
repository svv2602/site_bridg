/**
 * Tire SEO Generator
 *
 * Generates SEO metadata (title, description, keywords) for tire pages.
 */

import { fallbackLlm } from "../../providers/fallback-llm.js";
import { SYSTEM_PROMPTS, SEASON_LABELS, formatVehicleTypes, getSystemPromptsForBrand } from "../../prompts/index.js";
import type { Brand } from "../../types/content.js";
import { BRAND_NAMES } from "../../types/content.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("TireSEOGenerator");

/**
 * Input for SEO generation
 */
export interface TireSEOInput {
  modelSlug: string;
  modelName: string;
  brand?: Brand;
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
}

/**
 * Build prompt for SEO generation
 */
function buildPrompt(input: TireSEOInput): string {
  const season = SEASON_LABELS[input.season];
  const vehicles = input.vehicleTypes ? formatVehicleTypes(input.vehicleTypes) : "";
  const brand = input.brand || "bridgestone";
  const brandName = BRAND_NAMES[brand];

  return `Створи SEO мета-теги для сторінки шини ${brandName} ${input.modelName}.

ВХІДНІ ДАНІ:
- Модель: ${brandName} ${input.modelName}
- Сезон: ${season.name}
${vehicles ? `- Типи авто: ${vehicles}` : ""}
${input.shortDescription ? `- Короткий опис: ${input.shortDescription}` : ""}
${input.keyBenefits?.length ? `- Ключові переваги: ${input.keyBenefits.join(", ")}` : ""}

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "seoTitle": "SEO заголовок 40-55 символів. Починається з '${brandName} ${input.modelName}'",
  "seoDescription": "SEO опис 150-160 символів. Головна перевага + для кого підійде."
}

ВИМОГИ:
- seoTitle: 40-55 символів, включає назву моделі та сезон. НЕ включай назву сайту — суфікс "| Bridgestone Україна" додається автоматично.
- seoDescription: 150-160 символів, привабливий для кліку
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
  const brand = input.brand || "bridgestone";

  logger.info(`Generating SEO for ${input.modelName} (${brand})`);

  // Use content-generation routing with brand-specific system prompt
  const generator = fallbackLlm.forTask("content-generation");
  const systemPrompts = getSystemPromptsForBrand(brand);

  const { data, response } = await generator.generateJSON<SEOOutput>(prompt, {
    systemPrompt: systemPrompts.tireSEO,
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
    keyBenefits: string[];
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
    keyBenefits: content.keyBenefits,
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
