/**
 * Prompts Loader
 *
 * Loads prompt templates from markdown files for content generation.
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cache for loaded prompts
const promptCache = new Map<string, string>();

/**
 * Load a prompt template from markdown file
 */
export function loadPrompt(name: string): string {
  if (promptCache.has(name)) {
    return promptCache.get(name)!;
  }

  const filePath = join(__dirname, `${name}.md`);

  if (!existsSync(filePath)) {
    throw new Error(`Prompt file not found: ${name}.md`);
  }

  const content = readFileSync(filePath, "utf-8");
  promptCache.set(name, content);

  return content;
}

/**
 * Extract system prompt from markdown template
 * (Content under ## Role section)
 */
export function extractSystemPrompt(promptContent: string): string {
  const roleMatch = promptContent.match(/## Role\n([\s\S]*?)(?=\n## |$)/);
  return roleMatch ? roleMatch[1].trim() : "";
}

/**
 * Extract requirements from markdown template
 */
export function extractRequirements(promptContent: string): string {
  const reqMatch = promptContent.match(/## Requirements\n([\s\S]*?)(?=\n## |$)/);
  return reqMatch ? reqMatch[1].trim() : "";
}

// Pre-defined prompt templates for common tasks
export const SYSTEM_PROMPTS = {
  tireDescription: `Ти - SEO-копірайтер для офіційного сайту Bridgestone Україна.

Правила:
- Пиши виключно українською мовою
- Використовуй професійний, але доступний стиль
- Підкреслюй технічні переваги та безпеку
- НІКОЛИ не згадуй ціни
- Уникай кліше, канцеляризмів та надмірних епітетів
- Фокусуйся на перевагах для водія
- Використовуй конкретні факти з вхідних даних`,

  tireSEO: `Ти - SEO-спеціаліст для автомобільного сайту Bridgestone Україна.

Правила:
- seoTitle: 50-60 символів, включає назву моделі
- seoDescription: 150-160 символів, включає основну перевагу
- Ключові слова природно інтегровані
- Українська мова`,

  tireFAQ: `Ти - експерт з автомобільних шин для сайту Bridgestone Україна.

Правила:
- Відповіді 2-3 речення
- Конкретні факти, без загальних фраз
- Не вигадуй дані
- Оптимізуй для featured snippets
- Українська мова`,

  article: `Ти - автомобільний журналіст для блогу Bridgestone Україна.

Правила:
- Інформативний, не рекламний стиль
- Практичні поради для водіїв
- Структура: вступ → основна частина → висновок
- НЕ вигадуй дані
- Уникай рекламного тону
- Українська мова`,

  imageGeneration: `Generate professional automotive photography.
Focus on quality, realism, and brand-appropriate imagery.
Avoid text, watermarks, or unrealistic elements.`,
};

// Season labels in Ukrainian
export const SEASON_LABELS = {
  summer: {
    name: "літня",
    opposite: "взимку",
    oppositeFull: "у зимовий період",
  },
  winter: {
    name: "зимова",
    opposite: "влітку",
    oppositeFull: "у літній період",
  },
  allseason: {
    name: "всесезонна",
    opposite: "в екстремальних умовах",
    oppositeFull: "в екстремальних погодних умовах",
  },
} as const;

// Vehicle type labels in Ukrainian
export const VEHICLE_LABELS: Record<string, string> = {
  passenger: "легкові автомобілі",
  suv: "SUV/кросовери",
  van: "мікроавтобуси",
  lcv: "легкі вантажівки",
  sport: "спортивні автомобілі",
};

/**
 * Format vehicle types for display
 */
export function formatVehicleTypes(types: string[]): string {
  return types.map((t) => VEHICLE_LABELS[t] || t).join(", ");
}
