/**
 * LLM Prompts for Content Generation
 *
 * Centralized prompt templates for tire descriptions, articles, etc.
 * Supports multi-brand (Bridgestone & Firestone) content generation.
 */

import type { Brand } from "../types/content.js";

// Brand display names
const BRAND_NAMES: Record<Brand, string> = {
  bridgestone: "Bridgestone",
  firestone: "Firestone",
};

// SEO formatting rules (shared across all content types)
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
- Додавай 2-3 внутрішні посилання на релевантні сторінки
- Формат: <a href="/shyny/model-slug">Назва моделі</a>
- Формат: <a href="/advice/article-slug">Назва статті</a>
- Посилання мають бути органічно вплетені в текст
- НЕ роби окремий блок "Схожі товари" - тільки природні посилання в тексті`;

// System prompts for different content types (brand-neutral for backward compatibility)
export const SYSTEM_PROMPTS = {
  tireDescription: `Ти - експерт з автомобільних шин та професійний копірайтер для офіційного сайту Bridgestone & Firestone в Україні.

Правила:
- Пиши виключно українською мовою
- Використовуй професійний, але доступний стиль
- Підкреслюй технічні переваги та безпеку
- НІКОЛИ не згадуй ціни
- Уникай кліше, канцеляризмів та надмірних епітетів
- Фокусуйся на перевагах для водія, а не на характеристиках
- Використовуй конкретні факти з вхідних даних
${SEO_FORMATTING_RULES}
${INTERLINKING_RULES}`,

  article: `Ти - автомобільний журналіст, який пише статті для блогу Bridgestone & Firestone Україна.

Правила:
- Пиши виключно українською мовою
- Стиль: інформативний, корисний для водіїв
- Структура: вступ, основні пункти, висновок
- Включай практичні поради
- Уникай рекламного тону
- НЕ вигадуй дані, яких немає у вхідних
${SEO_FORMATTING_RULES}
${INTERLINKING_RULES}`,

  seo: `Ти - SEO-спеціаліст для автомобільного сайту.

Правила:
- Пиши українською
- seoTitle: 50-60 символів, включає назву моделі
- seoDescription: 150-160 символів, включає основну перевагу
- Використовуй ключові слова природно`,
};

/**
 * Get brand-specific system prompts
 */
export function getSystemPromptsForBrand(brand: Brand) {
  const brandName = BRAND_NAMES[brand];

  return {
    tireDescription: `Ти - експерт з автомобільних шин та професійний копірайтер для офіційного сайту ${brandName} в Україні.

Правила:
- Пиши виключно українською мовою
- Використовуй професійний, але доступний стиль
- Підкреслюй технічні переваги та безпеку
- НІКОЛИ не згадуй ціни
- Уникай кліше, канцеляризмів та надмірних епітетів
- Фокусуйся на перевагах для водія, а не на характеристиках
- Використовуй конкретні факти з вхідних даних
${SEO_FORMATTING_RULES}
${INTERLINKING_RULES}`,

    article: `Ти - автомобільний журналіст, який пише статті для блогу ${brandName} Україна.

Правила:
- Пиши виключно українською мовою
- Стиль: інформативний, корисний для водіїв
- Структура: вступ, основні пункти, висновок
- Включай практичні поради
- Уникай рекламного тону
- НЕ вигадуй дані, яких немає у вхідних
${SEO_FORMATTING_RULES}
${INTERLINKING_RULES}`,

    seo: `Ти - SEO-спеціаліст для автомобільного сайту ${brandName}.

Правила:
- Пиши українською
- seoTitle: 50-60 символів, включає назву моделі ${brandName}
- seoDescription: 150-160 символів, включає основну перевагу
- Використовуй ключові слова природно`,
  };
}

// Related item for interlinking
export interface RelatedItem {
  slug: string;
  name: string;
  type: "tyre" | "article";
}

// Tire description generation prompt
export function getTireDescriptionPrompt(
  tire: {
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
  },
  brand: Brand = "bridgestone",
  relatedItems?: RelatedItem[]
): string {
  const brandName = BRAND_NAMES[brand];

  const seasonLabels = {
    summer: "літня",
    winter: "зимова",
    allseason: "всесезонна",
  };

  const vehicleLabels: Record<string, string> = {
    passenger: "легкові автомобілі",
    suv: "SUV/кросовери",
    lcv: "легкі вантажівки",
    sport: "спортивні автомобілі",
  };

  const vehicles = tire.vehicleTypes
    ?.map((v) => vehicleLabels[v] || v)
    .join(", ");

  // Format related items for interlinking
  const relatedItemsSection = relatedItems?.length
    ? `\nПОСИЛАННЯ ДЛЯ ПЕРЕЛІНКОВКИ (використай 2-3 з них органічно в тексті):
${relatedItems.map((item) => {
  const url = item.type === "tyre" ? `/shyny/${item.slug}` : `/advice/${item.slug}`;
  return `- ${item.name}: ${url}`;
}).join("\n")}`
    : "";

  return `Створи унікальний контент для шини ${brandName} ${tire.name}.

ВХІДНІ ДАНІ:
- Модель: ${brandName} ${tire.name}
- Сезон: ${seasonLabels[tire.season]}
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

// Brand transliteration map
const BRAND_TRANSLITS: Record<Brand, string> = {
  bridgestone: "Бріджстоун",
  firestone: "Файрстоун",
};

/**
 * Get brand name transliteration
 */
export function getBrandTranslit(brand: Brand): string {
  return BRAND_TRANSLITS[brand];
}

// Article generation prompt
export function getArticlePrompt(
  params: {
    topic: string;
    type: "model-review" | "test-summary" | "comparison" | "seasonal-guide" | "technology";
    models?: string[];
    testData?: {
      source: string;
      year: number;
      results: string;
    };
    keywords?: string[];
  },
  relatedItems?: RelatedItem[]
): string {
  const typeInstructions = {
    "model-review": "Напиши детальний огляд моделі шини (800-1200 слів)",
    "test-summary": "Напиши підсумок результатів тесту (600-800 слів)",
    comparison: "Напиши порівняння моделей (1000-1500 слів)",
    "seasonal-guide": "Напиши сезонний гайд з вибору шин (800-1000 слів)",
    technology: "Напиши статтю про технологію (600-800 слів)",
  };

  // Format related items for interlinking
  const relatedItemsSection = relatedItems?.length
    ? `\nПОСИЛАННЯ ДЛЯ ПЕРЕЛІНКОВКИ (використай 2-3 з них органічно в тексті):
${relatedItems.map((item) => {
  const url = item.type === "tyre" ? `/shyny/${item.slug}` : `/advice/${item.slug}`;
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

// Badge text generation prompt
export function getBadgeTextPrompt(badge: {
  type: "winner" | "recommended" | "top3" | "best_category" | "eco";
  source: string;
  year: number;
  testType?: string;
  category?: string;
}): string {
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
