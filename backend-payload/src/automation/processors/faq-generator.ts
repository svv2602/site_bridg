/**
 * FAQ Generator
 *
 * Generates FAQ content for tire product pages using LLM.
 * Creates standard questions with tire-specific answers.
 */

import { generateContent } from "./llm-generator.js";
import { SYSTEM_PROMPTS } from "../config/prompts.js";
import { ENV } from "../config/env.js";

// Types
export interface TireData {
  name: string;
  slug: string;
  season: "summer" | "winter" | "allseason";
  vehicleTypes: string[];
  technologies?: string[];
  predecessorName?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface GeneratedFAQ {
  tire: TireData;
  faqs: FAQ[];
  schemaOrg: object;
}

// Standard FAQ templates
const FAQ_TEMPLATES = [
  {
    id: "vehicle_types",
    question: "Для яких автомобілів підходить {tireName}?",
    context: "vehicleTypes",
  },
  {
    id: "season_usage",
    question: "Чи можна використовувати {tireName} {oppositeSeasonText}?",
    context: "season",
  },
  {
    id: "lifespan",
    question: "Який приблизний термін служби шин {tireName}?",
    context: "general",
  },
  {
    id: "storage",
    question: "Як правильно зберігати шини {tireName}?",
    context: "storage",
  },
  {
    id: "comparison",
    question: "Чим {tireName} відрізняється від {predecessorOrSimilar}?",
    context: "comparison",
  },
];

// Season labels
const seasonLabels = {
  summer: { name: "літня", opposite: "взимку", oppositeFull: "у зимовий період" },
  winter: { name: "зимова", opposite: "влітку", oppositeFull: "у літній період" },
  allseason: { name: "всесезонна", opposite: "в екстремальних умовах", oppositeFull: "в екстремальних погодних умовах" },
};

/**
 * Generate FAQ questions for tire
 */
function generateQuestions(tire: TireData): string[] {
  const season = seasonLabels[tire.season];
  const predecessor = tire.predecessorName || "попередньої моделі";

  return FAQ_TEMPLATES.map((template) => {
    return template.question
      .replace("{tireName}", `Bridgestone ${tire.name}`)
      .replace("{oppositeSeasonText}", season.oppositeFull)
      .replace("{predecessorOrSimilar}", predecessor);
  });
}

/**
 * Generate prompt for FAQ answers
 */
function generateFAQPrompt(tire: TireData, questions: string[]): string {
  const vehicleTypesText = tire.vehicleTypes
    .map((v) => {
      const labels: Record<string, string> = {
        passenger: "легкові автомобілі",
        suv: "SUV/кросовери",
        lcv: "легкі вантажівки",
        sport: "спортивні автомобілі",
      };
      return labels[v] || v;
    })
    .join(", ");

  return `Дай відповіді на FAQ для шини Bridgestone ${tire.name}.

ДАНІ ПРО ШИНУ:
- Модель: Bridgestone ${tire.name}
- Сезон: ${seasonLabels[tire.season].name}
- Типи авто: ${vehicleTypesText}
${tire.technologies?.length ? `- Технології: ${tire.technologies.join(", ")}` : ""}
${tire.predecessorName ? `- Попередник: ${tire.predecessorName}` : ""}

ПИТАННЯ:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

ФОРМАТ ВІДПОВІДІ (JSON масив):
[
  {
    "question": "Питання 1",
    "answer": "Відповідь 2-3 речення, конкретна і корисна"
  },
  ...
]

ВИМОГИ:
- Відповіді українською
- 2-3 речення на кожне питання
- Конкретні факти, без води
- НЕ вигадуй дані яких немає
- Для терміну служби: 40-80 тис км залежно від умов
- Для зберігання: темне прохолодне місце, вертикально або на боці`;
}

/**
 * Parse FAQ response from LLM
 */
function parseFAQResponse(response: string): FAQ[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Failed to parse FAQ response:", error);
  }

  return [];
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
 * Generate FAQ for tire
 */
export async function generateTireFAQ(tire: TireData): Promise<GeneratedFAQ> {
  const questions = generateQuestions(tire);

  if (!ENV.ANTHROPIC_API_KEY) {
    // Return mock data if no API key
    const mockFaqs = questions.map((q) => ({
      question: q,
      answer: `Це автоматично згенерована відповідь на питання про ${tire.name}. Реальний контент буде згенеровано через LLM.`,
    }));

    return {
      tire,
      faqs: mockFaqs,
      schemaOrg: generateFAQSchema(mockFaqs),
    };
  }

  const prompt = generateFAQPrompt(tire, questions);

  const response = await generateContent(prompt, {
    maxTokens: 1500,
    temperature: 0.7,
    systemPrompt: SYSTEM_PROMPTS.tireDescription,
  });

  const faqs = parseFAQResponse(response);

  return {
    tire,
    faqs,
    schemaOrg: generateFAQSchema(faqs),
  };
}

// Test
async function main() {
  console.log("Testing FAQ Generator...\n");

  const testTire: TireData = {
    name: "Turanza 6",
    slug: "turanza-6",
    season: "summer",
    vehicleTypes: ["passenger", "suv"],
    technologies: ["ENLITEN", "B-Silent"],
    predecessorName: "Turanza T005",
  };

  console.log(`Generating FAQ for: ${testTire.name}`);

  const result = await generateTireFAQ(testTire);

  console.log("\nGenerated FAQ:");
  for (const faq of result.faqs) {
    console.log(`\nQ: ${faq.question}`);
    console.log(`A: ${faq.answer}`);
  }

  console.log("\n\nSchema.org:");
  console.log(JSON.stringify(result.schemaOrg, null, 2));
}

main();
