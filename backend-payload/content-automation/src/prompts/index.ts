/**
 * LLM Prompts for Content Generation
 *
 * Centralized prompt templates for tire descriptions, articles, etc.
 * Supports multi-brand (Bridgestone & Firestone) content generation.
 */

import type { Brand } from "../types/content.js";
import { BRAND_NAMES } from "../types/content.js";

// ============ FORMATTING RULES ============

const SEO_FORMATTING_RULES = `
ФОРМАТУВАННЯ (HTML):
- Використовуй HTML теги: <h2>, <h3>, <p>, <ul>, <li>, <strong>
- Заголовки: <h2> для основних секцій, <h3> для підсекцій
- Списки: <ul><li>...</li></ul> для переваг та характеристик
- Виділення: <strong> для ключових термінів
- Абзаци: <p>...</p> для тексту

SEO-ОПТИМІЗАЦІЯ НАЗВ:
- При ПЕРШІЙ згадці бренду/моделі додавай транслітерацію в дужках
- Приклад: "Bridgestone Turanza 6 (Бріджстоун Туранза 6)"
- Приклад: "Firestone Roadhawk (Файрстоун Роадхок)"
- Далі по тексту використовуй тільки оригінальну назву
- Транслітеруй фонетично, не дослівно`;

const INTERLINKING_RULES = `
ПЕРЕЛІНКОВКА:
- ВАЖЛИВО: Використовуй ТІЛЬКИ посилання, які явно надані у секції "ПОСИЛАННЯ ДЛЯ ПЕРЕЛІНКОВКИ"
- Якщо посилання не надані - НЕ додавай жодних посилань на моделі шин чи статті
- Дозволені категорійні посилання (можна використовувати завжди):
  - /passenger-tyres - легкові шини
  - /passenger-tyres/summer - літні шини
  - /passenger-tyres/winter - зимові шини
  - /passenger-tyres/all-season - всесезонні шини
  - /suv-4x4-tyres - шини для SUV
  - /lcv-tyres - комерційні шини
  - /tyre-search - пошук шин
  - /dealers - де купити
- Формат посилань: <a href="/шлях">Текст посилання</a>
- Посилання мають бути органічно вплетені в текст
- НЕ вигадуй slug-и для конкретних моделей шин чи статей`;

// ============ LABELS & TRANSLATIONS ============

const BRAND_TRANSLITS: Record<Brand, string> = {
  bridgestone: "Бріджстоун",
  firestone: "Файрстоун",
};

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

export const VEHICLE_LABELS: Record<string, string> = {
  passenger: "легкові автомобілі",
  suv: "SUV/кросовери",
  van: "мікроавтобуси",
  lcv: "легкі вантажівки",
  sport: "спортивні автомобілі",
};

// ============ HELPER FUNCTIONS ============

/**
 * Get brand name transliteration
 */
export function getBrandTranslit(brand: Brand): string {
  return BRAND_TRANSLITS[brand];
}

/**
 * Format vehicle types for display
 */
export function formatVehicleTypes(types: string[]): string {
  return types.map((t) => VEHICLE_LABELS[t] || t).join(", ");
}

// ============ TYPES ============

export interface RelatedItem {
  slug: string;
  name: string;
  type: "tyre" | "article";
}

export interface TirePromptInput {
  name: string;
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

export interface ArticlePromptInput {
  topic: string;
  type: "model-review" | "test-summary" | "comparison" | "seasonal-guide" | "technology";
  models?: string[];
  testData?: {
    source: string;
    year: number;
    results: string;
  };
  keywords?: string[];
}

export interface BadgePromptInput {
  type: "winner" | "recommended" | "top3" | "best_category" | "eco";
  source: string;
  year: number;
  testType?: string;
  category?: string;
}

// ============ SYSTEM PROMPTS ============

/**
 * Brand-neutral system prompts (for backward compatibility)
 */
export const SYSTEM_PROMPTS = {
  tireDescription: `Ти - SEO-копірайтер для офіційного сайту Bridgestone & Firestone Україна.

Правила:
- Пиши виключно українською мовою
- Використовуй професійний, але доступний стиль
- Підкреслюй технічні переваги та безпеку
- НІКОЛИ не згадуй ціни
- Уникай кліше, канцеляризмів та надмірних епітетів
- Фокусуйся на перевагах для водія
- Використовуй конкретні факти з вхідних даних
${SEO_FORMATTING_RULES}
${INTERLINKING_RULES}`,

  tireSEO: `Ти - SEO-спеціаліст для автомобільного сайту Bridgestone & Firestone Україна.

Правила:
- seoTitle: 50-60 символів, включає назву моделі
- seoDescription: 150-160 символів, включає основну перевагу
- Ключові слова природно інтегровані
- Українська мова`,

  tireFAQ: `Ти - експерт з автомобільних шин для сайту Bridgestone & Firestone Україна.

Правила:
- Відповіді 2-3 речення
- Конкретні факти, без загальних фраз
- Не вигадуй дані
- Оптимізуй для featured snippets
- Українська мова
${SEO_FORMATTING_RULES}`,

  article: `Ти - автомобільний журналіст для блогу Bridgestone & Firestone Україна.

Правила:
- Інформативний, не рекламний стиль
- Практичні поради для водіїв
- Структура: вступ → основна частина → висновок
- НЕ вигадуй дані
- Уникай рекламного тону
- Українська мова
${SEO_FORMATTING_RULES}
${INTERLINKING_RULES}`,

  imageGeneration: `Generate professional automotive photography.
Focus on quality, realism, and brand-appropriate imagery.
Avoid text, watermarks, or unrealistic elements.`,
};

/**
 * Get brand-specific system prompts
 */
export function getSystemPromptsForBrand(brand: Brand) {
  const brandName = BRAND_NAMES[brand];
  const brandTranslit = BRAND_TRANSLITS[brand];

  return {
    tireDescription: `Ти - SEO-копірайтер для офіційного сайту ${brandName} Україна.

Правила:
- Пиши виключно українською мовою
- Використовуй професійний, але доступний стиль
- Підкреслюй технічні переваги та безпеку
- НІКОЛИ не згадуй ціни
- Уникай кліше, канцеляризмів та надмірних епітетів
- Фокусуйся на перевагах для водія
- Використовуй конкретні факти з вхідних даних
${SEO_FORMATTING_RULES}
${INTERLINKING_RULES}

Транслітерація бренду: ${brandName} (${brandTranslit})`,

    tireSEO: `Ти - SEO-спеціаліст для автомобільного сайту ${brandName} Україна.

Правила:
- seoTitle: 50-60 символів, включає назву моделі ${brandName}
- seoDescription: 150-160 символів, включає основну перевагу
- Ключові слова природно інтегровані
- Українська мова`,

    tireFAQ: `Ти - експерт з автомобільних шин для сайту ${brandName} Україна.

Правила:
- Відповіді 2-3 речення
- Конкретні факти, без загальних фраз
- Не вигадуй дані
- Оптимізуй для featured snippets
- Українська мова
${SEO_FORMATTING_RULES}

Транслітерація бренду: ${brandName} (${brandTranslit})`,

    article: `Ти - автомобільний журналіст для блогу ${brandName} Україна.

Правила:
- Інформативний, не рекламний стиль
- Практичні поради для водіїв
- Структура: вступ → основна частина → висновок
- НЕ вигадуй дані
- Уникай рекламного тону
- Українська мова
${SEO_FORMATTING_RULES}
${INTERLINKING_RULES}

Транслітерація бренду: ${brandName} (${brandTranslit})`,
  };
}

// ============ PROMPT BUILDERS ============

/**
 * Build tire description generation prompt
 */
export function getTireDescriptionPrompt(
  tire: TirePromptInput,
  brand: Brand = "bridgestone",
  relatedItems?: RelatedItem[]
): string {
  const brandName = BRAND_NAMES[brand];
  const vehicles = tire.vehicleTypes
    ?.map((v) => VEHICLE_LABELS[v] || v)
    .join(", ");

  const relatedItemsSection = relatedItems?.length
    ? `\nПОСИЛАННЯ ДЛЯ ПЕРЕЛІНКОВКИ (використай 2-3 з них органічно в тексті):
${relatedItems.map((item) => {
  const url = item.type === "tyre" ? `/shyny/${item.slug}` : `/blog/${item.slug}`;
  return `- ${item.name}: ${url}`;
}).join("\n")}`
    : "";

  return `Створи унікальний контент для шини ${brandName} ${tire.name}.

ВХІДНІ ДАНІ:
- Модель: ${brandName} ${tire.name}
- Сезон: ${SEASON_LABELS[tire.season].name}
${vehicles ? `- Типи авто: ${vehicles}` : ""}
${tire.technologies?.length ? `- Технології: ${tire.technologies.join(", ")}` : ""}
${tire.euLabel ? `- EU Label: Мокре зчеплення ${tire.euLabel.wetGrip || "-"}, Паливна ефективність ${tire.euLabel.fuelEfficiency || "-"}, Шум ${tire.euLabel.noiseDb || "-"}дБ` : ""}
${tire.testResults ? `- Результати тестів: ${tire.testResults}` : ""}
${tire.sourceDescription ? `\nОПИС-РЕФЕРЕНС (НЕ копіювати, лише для розуміння):\n${tire.sourceDescription}` : ""}
${relatedItemsSection}

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "shortDescription": "Короткий опис 2-3 речення, 150-200 символів. Головна перевага + для кого підійде. БЕЗ HTML тегів.",
  "fullDescription": "Повний HTML опис 300-500 слів. Структура: <h2>Вступ</h2><p>...</p><h2>Переваги</h2><ul><li>...</li></ul> і т.д.",
  "keyBenefits": ["Перевага 1", "Перевага 2", "Перевага 3", "Перевага 4"],
  "seoTitle": "SEO заголовок 50-60 символів",
  "seoDescription": "SEO опис 150-160 символів"
}

ВАЖЛИВО:
- Відповідь ТІЛЬКИ у форматі JSON
- fullDescription у форматі HTML (h2, h3, p, ul, li, strong, a)
- При ПЕРШІЙ згадці моделі додай транслітерацію: "${brandName} ${tire.name} (${getBrandTranslit(brand)} ${tire.name})"
- Контент має бути 100% унікальним
- НЕ згадуй ціни
- keyBenefits: 4-5 конкретних пунктів`;
}

/**
 * Build article generation prompt
 */
export function getArticlePrompt(
  params: ArticlePromptInput,
  relatedItems?: RelatedItem[]
): string {
  const typeInstructions = {
    "model-review": "Напиши детальний огляд моделі шини (800-1200 слів)",
    "test-summary": "Напиши підсумок результатів тесту (600-800 слів)",
    comparison: "Напиши порівняння моделей (1000-1500 слів)",
    "seasonal-guide": "Напиши сезонний гайд з вибору шин (800-1000 слів)",
    technology: "Напиши статтю про технологію (600-800 слів)",
  };

  const relatedItemsSection = relatedItems?.length
    ? `\nПОСИЛАННЯ ДЛЯ ПЕРЕЛІНКОВКИ (використай 2-3 з них органічно в тексті):
${relatedItems.map((item) => {
  const url = item.type === "tyre" ? `/shyny/${item.slug}` : `/blog/${item.slug}`;
  return `- ${item.name}: ${url}`;
}).join("\n")}`
    : "";

  return `${typeInstructions[params.type]}

ТЕМА: ${params.topic}
${params.models?.length ? `МОДЕЛІ: ${params.models.join(", ")}` : ""}
${params.testData ? `
ДАНІ ТЕСТУ:
- Джерело: ${params.testData.source}
- Рік: ${params.testData.year}
- Результати: ${params.testData.results}
` : ""}
${params.keywords?.length ? `КЛЮЧОВІ СЛОВА: ${params.keywords.join(", ")}` : ""}
${relatedItemsSection}

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "title": "Заголовок статті",
  "excerpt": "Короткий опис для превʼю (1-2 речення). БЕЗ HTML.",
  "content": "Повний HTML текст статті: <h2>Секція</h2><p>Текст...</p><ul><li>Пункт</li></ul>",
  "tags": ["тег1", "тег2"],
  "readingTime": 5
}

ВАЖЛИВО:
- Відповідь ТІЛЬКИ у форматі JSON
- content у форматі HTML (h2, h3, p, ul, li, strong, a)
- При ПЕРШІЙ згадці бренду/моделі додай транслітерацію в дужках
  Приклад: "Bridgestone Turanza 6 (Бріджстоун Туранза 6)"
- НЕ вигадуй дані, яких немає у вхідних
- Включай CTA "Знайти дилера" наприкінці
- НЕ згадуй ціни`;
}

/**
 * Build badge text generation prompt
 */
export function getBadgeTextPrompt(badge: BadgePromptInput): string {
  return `Створи короткий текст для бейджа на картці шини.

ТИП: ${badge.type}
ДЖЕРЕЛО: ${badge.source}
РІК: ${badge.year}
${badge.testType ? `ТИП ТЕСТУ: ${badge.testType}` : ""}
${badge.category ? `КАТЕГОРІЯ: ${badge.category}` : ""}

Приклади:
- winner + ADAC + 2024 = "Переможець ADAC 2024"
- recommended + Auto Bild + 2024 = "Рекомендовано Auto Bild"
- top3 + TCS + 2024 + winter = "Топ-3 зимових TCS 2024"
- best_category + ADAC + 2024 + wet = "Найкраще мокре зчеплення"
- eco + EU Label + 2024 = "Екологічний вибір"

Дай відповідь одним рядком українською (максимум 30 символів).`;
}
