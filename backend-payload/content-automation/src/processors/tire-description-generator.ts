/**
 * Tire Description Generator
 *
 * Generates complete tire content using Claude API:
 * - shortDescription (2-3 sentences)
 * - fullDescription (300-500 words, HTML)
 * - keyBenefits (4-5 items)
 * - seoTitle (50-60 chars)
 * - seoDescription (150-160 chars)
 */

import { llm } from "../providers/index.js";
import { getTireDescriptionPrompt, getSystemPromptsForBrand } from "../config/prompts.js";
import type { Brand } from "../types/content.js";

// Types
export interface TireInput {
  name: string;
  slug: string;
  season: "summer" | "winter" | "allseason";
  brand?: Brand;
  vehicleTypes?: string[];
  technologies?: string[];
  euLabel?: {
    wetGrip?: string;
    fuelEfficiency?: string;
    noiseDb?: number;
  };
  sourceDescription?: string;
  testResults?: string;
}

export interface GeneratedTireContent {
  shortDescription: string;
  fullDescription: string;
  keyBenefits: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface GenerationResult {
  success: boolean;
  tire: TireInput;
  content?: GeneratedTireContent;
  error?: string;
}

// Maximum retries for JSON parsing failures
const MAX_JSON_RETRIES = 2;

/**
 * Generate complete tire content with retry logic for JSON parsing
 */
export async function generateTireContent(
  tire: TireInput
): Promise<GenerationResult> {
  const brand = tire.brand || "bridgestone";
  const systemPrompts = getSystemPromptsForBrand(brand);

  // Get generator for content-generation task
  const generator = llm.forTask("content-generation");

  let lastError: string = "";

  for (let attempt = 0; attempt <= MAX_JSON_RETRIES; attempt++) {
    try {
      // Build prompt with stronger JSON enforcement on retries
      let prompt = getTireDescriptionPrompt(tire, brand);

      if (attempt > 0) {
        // Add stronger JSON enforcement on retry
        prompt += `\n\n⚠️ КРИТИЧНО: Відповідь ПОВИННА бути ТІЛЬКИ валідним JSON об'єктом. Без пояснень, без markdown, без тексту до або після JSON. Тільки JSON!`;
        console.log(`  Retry ${attempt}/${MAX_JSON_RETRIES} with stronger JSON enforcement...`);
      }

      // Use generateJSON for automatic JSON parsing
      const { data, response } = await generator.generateJSON<GeneratedTireContent>(prompt, {
        systemPrompt: systemPrompts.tireDescription,
        maxTokens: 2000,
        temperature: attempt > 0 ? 0.5 : 0.7, // Lower temperature on retries
      });

      // Validate content
      validateContent(data);

      console.log(`[LLM] Generated with ${response.provider}/${response.model} (${response.latencyMs}ms, $${response.cost.toFixed(4)})`);

      return {
        success: true,
        tire,
        content: data,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);

      // Only retry on JSON parsing errors
      const isJsonError = lastError.includes("JSON") || lastError.includes("parse");
      if (!isJsonError || attempt >= MAX_JSON_RETRIES) {
        break;
      }

      console.log(`  JSON parse failed: ${lastError}`);
    }
  }

  console.error(`Failed to generate content for ${tire.name}:`, lastError);

  return {
    success: false,
    tire,
    error: lastError,
  };
}

/**
 * Validate generated content
 */
function validateContent(content: GeneratedTireContent): void {
  const errors: string[] = [];

  if (!content.shortDescription || content.shortDescription.length < 50) {
    errors.push("shortDescription too short (min 50 chars)");
  }

  if (!content.fullDescription || content.fullDescription.length < 200) {
    errors.push("fullDescription too short (min 200 chars)");
  }

  if (!content.keyBenefits || content.keyBenefits.length < 3) {
    errors.push("keyBenefits needs at least 3 items");
  }

  if (!content.seoTitle || content.seoTitle.length < 20) {
    errors.push("seoTitle too short (min 20 chars)");
  }

  if (!content.seoDescription || content.seoDescription.length < 50) {
    errors.push("seoDescription too short (min 50 chars)");
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }
}

/**
 * Generate content for multiple tires with retry logic
 */
export async function generateBatchTireContent(
  tires: TireInput[],
  options: { maxRetries?: number; delayMs?: number } = {}
): Promise<GenerationResult[]> {
  const { maxRetries = 2, delayMs = 1000 } = options;
  const results: GenerationResult[] = [];

  for (const tire of tires) {
    let result: GenerationResult | null = null;
    let attempts = 0;

    while (attempts <= maxRetries) {
      result = await generateTireContent(tire);

      if (result.success) {
        break;
      }

      attempts++;
      if (attempts <= maxRetries) {
        console.log(`Retrying ${tire.name} (attempt ${attempts + 1}/${maxRetries + 1})...`);
        await sleep(delayMs * attempts); // Exponential backoff
      }
    }

    results.push(result!);

    // Delay between requests to avoid rate limiting
    await sleep(delayMs);
  }

  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test function
async function main() {
  console.log("Testing Tire Description Generator...\n");

  // No longer need ANTHROPIC_API_KEY check - using multi-provider fallback system

  // Test tire data
  const testTire: TireInput = {
    name: "Turanza 6",
    slug: "turanza-6",
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

  console.log(`Generating content for: ${testTire.name}`);
  console.log("---");

  const result = await generateTireContent(testTire);

  if (result.success && result.content) {
    console.log("\n✅ Generation successful!\n");
    console.log("SHORT DESCRIPTION:");
    console.log(result.content.shortDescription);
    console.log(`\n(${result.content.shortDescription.length} chars)`);

    console.log("\n---\nFULL DESCRIPTION:");
    console.log(result.content.fullDescription);
    console.log(`\n(${result.content.fullDescription.length} chars)`);

    console.log("\n---\nKEY BENEFITS:");
    result.content.keyBenefits.forEach((b, i) => console.log(`${i + 1}. ${b}`));

    console.log("\n---\nSEO:");
    console.log(`Title (${result.content.seoTitle.length} chars): ${result.content.seoTitle}`);
    console.log(`Desc (${result.content.seoDescription.length} chars): ${result.content.seoDescription}`);
  } else {
    console.error("\n❌ Generation failed:");
    console.error(result.error);
  }
}

// Run only if called directly (not when imported)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main();
}
