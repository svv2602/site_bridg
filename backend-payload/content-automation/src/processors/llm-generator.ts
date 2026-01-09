/**
 * LLM Content Generator using Claude API
 *
 * Generates tire descriptions, article content, and other text in Ukrainian.
 */

import Anthropic from "@anthropic-ai/sdk";
import { ENV } from "../config/env.js";

// Initialize Claude client
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    if (!ENV.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set. Please add it to .env file.");
    }
    client = new Anthropic({
      apiKey: ENV.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

// Types
export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface TireDescriptionInput {
  name: string;
  season: "summer" | "winter" | "allseason";
  euLabel?: {
    wetGrip?: string;
    fuelEfficiency?: string;
    noiseDb?: number;
  };
  technologies?: string[];
  vehicleTypes?: string[];
}

// Default system prompts
const SYSTEM_PROMPTS = {
  tireDescription: `Ти - експерт з автомобільних шин, який пише контент для офіційного сайту Bridgestone в Україні.

Правила:
- Пиши виключно українською мовою
- Використовуй професійний, але доступний стиль
- Підкреслюй технічні переваги та безпеку
- НЕ згадуй ціни
- Довжина: 2-3 речення для короткого опису, 1-2 абзаци для повного
- Уникай кліше та надмірних епітетів`,

  article: `Ти - автомобільний журналіст, який пише статті для блогу Bridgestone Україна.

Правила:
- Пиши виключно українською мовою
- Стиль: інформативний, корисний для водіїв
- Структура: вступ, основні пункти, висновок
- Включай практичні поради
- Уникай рекламного тону`,
};

/**
 * Generate content using Claude API
 */
export async function generateContent(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const {
    maxTokens = 1024,
    temperature = 0.7,
    systemPrompt = "Ти - помічник, який пише контент українською мовою.",
  } = options;

  try {
    const anthropic = getClient();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    return textBlock.text;
  } catch (error) {
    console.error("LLM generation error:", error);
    throw error;
  }
}

/**
 * Generate tire description
 */
export async function generateTireDescription(
  tire: TireDescriptionInput,
  variant: "short" | "full" = "short"
): Promise<string> {
  const seasonLabels = {
    summer: "літня",
    winter: "зимова",
    allseason: "всесезонна",
  };

  const prompt = variant === "short"
    ? `Напиши короткий опис (2-3 речення) для шини Bridgestone ${tire.name}.
Сезон: ${seasonLabels[tire.season]}
${tire.euLabel ? `EU Label: ${tire.euLabel.wetGrip || "-"}/${tire.euLabel.fuelEfficiency || "-"}/${tire.euLabel.noiseDb || "-"}дБ` : ""}
${tire.technologies?.length ? `Технології: ${tire.technologies.join(", ")}` : ""}
${tire.vehicleTypes?.length ? `Для: ${tire.vehicleTypes.join(", ")}` : ""}`
    : `Напиши повний опис (2-3 абзаци) для шини Bridgestone ${tire.name}.
Сезон: ${seasonLabels[tire.season]}
${tire.euLabel ? `EU Label: зчеплення ${tire.euLabel.wetGrip || "-"}, паливо ${tire.euLabel.fuelEfficiency || "-"}, шум ${tire.euLabel.noiseDb || "-"}дБ` : ""}
${tire.technologies?.length ? `Технології: ${tire.technologies.join(", ")}` : ""}
${tire.vehicleTypes?.length ? `Типи авто: ${tire.vehicleTypes.join(", ")}` : ""}

Включи інформацію про:
1. Основні переваги моделі
2. Для кого підійде
3. Умови використання`;

  return generateContent(prompt, {
    maxTokens: variant === "short" ? 200 : 600,
    temperature: 0.7,
    systemPrompt: SYSTEM_PROMPTS.tireDescription,
  });
}

/**
 * Generate article content
 */
export async function generateArticle(
  topic: string,
  keywords: string[] = []
): Promise<{ title: string; content: string; excerpt: string }> {
  const prompt = `Напиши статтю на тему: "${topic}"
${keywords.length ? `Ключові слова для включення: ${keywords.join(", ")}` : ""}

Формат відповіді (JSON):
{
  "title": "Заголовок статті",
  "excerpt": "Короткий опис для превʼю (1-2 речення)",
  "content": "Повний текст статті з підзаголовками (використовуй ## для заголовків)"
}`;

  const response = await generateContent(prompt, {
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: SYSTEM_PROMPTS.article,
  });

  try {
    // Try to parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // If JSON parsing fails, return raw content
  }

  return {
    title: topic,
    excerpt: "",
    content: response,
  };
}

// Test function
async function main() {
  console.log("Testing LLM Generator...\n");

  if (!ENV.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set. Skipping test.");
    console.log("\nTo test, create .env file with:");
    console.log("ANTHROPIC_API_KEY=your-key-here");
    return;
  }

  try {
    // Test tire description
    console.log("Generating tire description...");
    const description = await generateTireDescription({
      name: "Turanza 6",
      season: "summer",
      euLabel: { wetGrip: "A", fuelEfficiency: "A", noiseDb: 69 },
      technologies: ["ENLITEN", "B-Silent"],
    });
    console.log("\nTire description:");
    console.log(description);

    // Test simple content
    console.log("\n\nGenerating simple content...");
    const content = await generateContent(
      "Напиши 3 поради щодо вибору зимових шин",
      { maxTokens: 300 }
    );
    console.log("\nContent:");
    console.log(content);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run if called directly
main();

export { SYSTEM_PROMPTS };
