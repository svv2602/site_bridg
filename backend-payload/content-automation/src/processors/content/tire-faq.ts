/**
 * Tire FAQ Generator
 *
 * Generates FAQ content for tire product pages using LLM.
 * Creates standard questions with tire-specific answers optimized for featured snippets.
 */

import { llm } from "../../providers/index.js";
import { SYSTEM_PROMPTS, SEASON_LABELS, formatVehicleTypes } from "../../prompts/index.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("TireFAQGenerator");

/**
 * Input for FAQ generation
 */
export interface TireFAQInput {
  modelSlug: string;
  modelName: string;
  season: "summer" | "winter" | "allseason";
  vehicleTypes?: string[];
  technologies?: string[];
  euLabel?: {
    wetGrip?: string;
    fuelEfficiency?: string;
    noiseDb?: number;
  };
  predecessorName?: string;
}

/**
 * Single FAQ item
 */
export interface FAQ {
  question: string;
  answer: string;
}

/**
 * Output structure for generated FAQs
 */
export interface FAQOutput {
  faqs: FAQ[];
}

/**
 * Build prompt for FAQ generation
 */
function buildPrompt(input: TireFAQInput): string {
  const season = SEASON_LABELS[input.season];
  const vehicles = input.vehicleTypes ? formatVehicleTypes(input.vehicleTypes) : "";

  // Standard question templates
  const questions = [
    `Для яких автомобілів підходить Bridgestone ${input.modelName}?`,
    input.season === "summer"
      ? `Чи можна використовувати Bridgestone ${input.modelName} взимку?`
      : input.season === "winter"
        ? `Чи підходить Bridgestone ${input.modelName} для льоду?`
        : `В яких умовах найкраще працює Bridgestone ${input.modelName}?`,
    `Який термін служби шин Bridgestone ${input.modelName}?`,
    `Як правильно зберігати шини Bridgestone ${input.modelName}?`,
    input.predecessorName
      ? `Чим Bridgestone ${input.modelName} відрізняється від ${input.predecessorName}?`
      : `Які технології використовуються в Bridgestone ${input.modelName}?`,
  ];

  return `Створи FAQ (5 питань з відповідями) для шини Bridgestone ${input.modelName}.

ДАНІ ПРО ШИНУ:
- Модель: Bridgestone ${input.modelName}
- Сезон: ${season.name}
${vehicles ? `- Типи авто: ${vehicles}` : ""}
${input.technologies?.length ? `- Технології: ${input.technologies.join(", ")}` : ""}
${input.euLabel ? `- EU Label: Мокре зчеплення ${input.euLabel.wetGrip || "-"}, Паливна ефективність ${input.euLabel.fuelEfficiency || "-"}` : ""}
${input.predecessorName ? `- Попередник: ${input.predecessorName}` : ""}

ПИТАННЯ (використай ці або подібні):
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "faqs": [
    {
      "question": "Питання 1?",
      "answer": "Відповідь 2-3 речення (50-100 слів)"
    },
    {
      "question": "Питання 2?",
      "answer": "Відповідь 2-3 речення (50-100 слів)"
    }
  ]
}

ВИМОГИ:
- Відповіді українською
- 2-3 речення на кожну відповідь
- Конкретні факти, без води
- НЕ вигадуй дані яких немає
- Термін служби: 40-80 тис км залежно від умов
- Зберігання: темне прохолодне місце, вертикально або підвішені
- Оптимізуй для featured snippets (прямі відповіді)`;
}

/**
 * Parse JSON response from LLM
 */
function parseResponse(response: string): FAQOutput {
  const jsonMatch = response.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
  };
}

/**
 * Validate FAQ content
 */
function validateFAQs(output: FAQOutput): void {
  const errors: string[] = [];

  if (!output.faqs || output.faqs.length < 3) {
    errors.push(`Need at least 3 FAQs, got ${output.faqs?.length || 0}`);
  }

  for (let i = 0; i < (output.faqs?.length || 0); i++) {
    const faq = output.faqs[i];

    if (!faq.question || faq.question.length < 10) {
      errors.push(`FAQ ${i + 1}: question too short`);
    }

    if (!faq.answer || faq.answer.length < 30) {
      errors.push(`FAQ ${i + 1}: answer too short (${faq.answer?.length || 0} chars)`);
    }

    if (faq.answer && faq.answer.length > 500) {
      errors.push(`FAQ ${i + 1}: answer too long (${faq.answer.length} chars, max 500)`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`FAQ validation failed: ${errors.join("; ")}`);
  }
}

/**
 * Generate Schema.org FAQPage structured data
 */
export function generateFAQSchema(faqs: FAQ[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate FAQs using LLM
 */
export async function generateTireFAQ(
  input: TireFAQInput,
  options?: {
    provider?: string;
    model?: string;
    skipValidation?: boolean;
  }
): Promise<{
  faqs: FAQ[];
  schemaOrg: object;
  metadata: {
    provider: string;
    model: string;
    cost: number;
    latencyMs: number;
  };
}> {
  const prompt = buildPrompt(input);

  logger.info(`Generating FAQ for ${input.modelName}`);

  // Use content-generation routing for FAQ
  const generator = llm.forTask("content-generation");

  const { data, response } = await generator.generateJSON<FAQOutput>(prompt, {
    systemPrompt: SYSTEM_PROMPTS.tireFAQ,
    maxTokens: 1500,
    temperature: 0.7,
    ...(options?.provider && { provider: options.provider }),
    ...(options?.model && { model: options.model }),
  });

  // Validate FAQs
  if (!options?.skipValidation) {
    validateFAQs(data);
  }

  const schemaOrg = generateFAQSchema(data.faqs);

  logger.info(`FAQ generated for ${input.modelName}`, {
    count: data.faqs.length,
    cost: response.cost.toFixed(4),
  });

  return {
    faqs: data.faqs,
    schemaOrg,
    metadata: {
      provider: response.provider,
      model: response.model,
      cost: response.cost,
      latencyMs: response.latencyMs,
    },
  };
}

// CLI test
async function main() {
  console.log("Testing Tire FAQ Generator...\n");

  const testInput: TireFAQInput = {
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
    predecessorName: "Turanza T005",
  };

  try {
    const result = await generateTireFAQ(testInput);

    console.log("\n=== FAQs ===");
    for (const faq of result.faqs) {
      console.log(`\nQ: ${faq.question}`);
      console.log(`A: ${faq.answer}`);
    }

    console.log("\n=== Schema.org ===");
    console.log(JSON.stringify(result.schemaOrg, null, 2));

    console.log("\n=== METADATA ===");
    console.log(`Provider: ${result.metadata.provider}`);
    console.log(`Cost: $${result.metadata.cost.toFixed(4)}`);
    console.log(`Latency: ${result.metadata.latencyMs}ms`);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

if (process.argv[1]?.includes("tire-faq.ts")) {
  main();
}
