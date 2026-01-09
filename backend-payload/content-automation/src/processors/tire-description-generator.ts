/**
 * Tire Description Generator
 *
 * Generates complete tire content using Claude API:
 * - shortDescription (2-3 sentences)
 * - fullDescription (300-500 words, markdown)
 * - keyBenefits (4-5 items)
 * - seoTitle (50-60 chars)
 * - seoDescription (150-160 chars)
 */

import { generateContent } from "./llm-generator.js";
import { getTireDescriptionPrompt, SYSTEM_PROMPTS } from "../config/prompts.js";
import { ENV } from "../config/env.js";

// Types
export interface TireInput {
  name: string;
  slug: string;
  season: "summer" | "winter" | "allseason";
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

/**
 * Generate complete tire content
 */
export async function generateTireContent(
  tire: TireInput
): Promise<GenerationResult> {
  try {
    const prompt = getTireDescriptionPrompt(tire);

    const response = await generateContent(prompt, {
      maxTokens: 1500,
      temperature: 0.7,
      systemPrompt: SYSTEM_PROMPTS.tireDescription,
    });

    // Parse JSON response
    const content = parseJsonResponse(response);

    // Validate content
    validateContent(content);

    return {
      success: true,
      tire,
      content,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to generate content for ${tire.name}:`, errorMessage);

    return {
      success: false,
      tire,
      error: errorMessage,
    };
  }
}

/**
 * Parse JSON response from LLM
 */
function parseJsonResponse(response: string): GeneratedTireContent {
  // Try to find JSON in response
  const jsonMatch = response.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      shortDescription: parsed.shortDescription || "",
      fullDescription: parsed.fullDescription || "",
      keyBenefits: Array.isArray(parsed.keyBenefits) ? parsed.keyBenefits : [],
      seoTitle: parsed.seoTitle || "",
      seoDescription: parsed.seoDescription || "",
    };
  } catch (parseError) {
    throw new Error(`Failed to parse JSON: ${parseError}`);
  }
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

  if (!ENV.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set. Skipping test.");
    console.log("\nTo test, create .env file with:");
    console.log("ANTHROPIC_API_KEY=your-key-here");
    return;
  }

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

// Run if called directly
main();
