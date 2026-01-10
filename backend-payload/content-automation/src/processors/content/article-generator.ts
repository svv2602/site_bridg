/**
 * Article Generator
 *
 * Generates blog articles using LLM with SEO optimization.
 */

import { llm } from "../../providers/index.js";
import { SYSTEM_PROMPTS } from "../../prompts/index.js";
import type { GeneratedArticle } from "../../types/content.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("ArticleGenerator");

/**
 * Article types
 */
export type ArticleType =
  | "seasonal-guide"
  | "model-review"
  | "test-summary"
  | "comparison"
  | "technology"
  | "tips";

/**
 * Input for article generation
 */
export interface ArticleInput {
  topic: string;
  type: ArticleType;
  tireModels?: string[];
  testData?: {
    source: string;
    year: number;
    results: string;
  };
  keywords?: string[];
  targetWordCount?: number;
}

/**
 * Output structure for generated article
 */
interface ArticleOutput {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  readingTime: number;
  relatedTyres?: string[];
}

/**
 * Word count ranges by article type
 */
const WORD_COUNT_RANGES: Record<ArticleType, { min: number; max: number }> = {
  "seasonal-guide": { min: 800, max: 1000 },
  "model-review": { min: 800, max: 1200 },
  "test-summary": { min: 600, max: 800 },
  comparison: { min: 1000, max: 1500 },
  technology: { min: 600, max: 800 },
  tips: { min: 500, max: 700 },
};

/**
 * Type descriptions for prompts
 */
const TYPE_DESCRIPTIONS: Record<ArticleType, string> = {
  "seasonal-guide": "Сезонний гайд з вибору та догляду за шинами",
  "model-review": "Детальний огляд конкретної моделі шин",
  "test-summary": "Підсумок результатів незалежного тесту шин",
  comparison: "Порівняння кількох моделей шин",
  technology: "Пояснення технології Bridgestone",
  tips: "Практичні поради для водіїв",
};

/**
 * Build prompt for article generation
 */
function buildPrompt(input: ArticleInput): string {
  const wordRange = WORD_COUNT_RANGES[input.type];
  const targetWords = input.targetWordCount || Math.round((wordRange.min + wordRange.max) / 2);

  return `Напиши статтю для блогу Bridgestone Україна.

ТИП СТАТТІ: ${TYPE_DESCRIPTIONS[input.type]}
ТЕМА: ${input.topic}
${input.tireModels?.length ? `МОДЕЛІ ШИН: ${input.tireModels.join(", ")}` : ""}
${input.testData ? `
ДАНІ ТЕСТУ:
- Джерело: ${input.testData.source}
- Рік: ${input.testData.year}
- Результати: ${input.testData.results}
` : ""}
${input.keywords?.length ? `КЛЮЧОВІ СЛОВА: ${input.keywords.join(", ")}` : ""}

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "title": "Заголовок статті (50-70 символів)",
  "excerpt": "Короткий опис для превʼю (150-200 символів)",
  "content": "Повний текст статті у форматі Markdown (${targetWords} слів)",
  "tags": ["тег1", "тег2", "тег3"],
  "readingTime": ${Math.ceil(targetWords / 200)},
  "relatedTyres": ["slug-моделі-1", "slug-моделі-2"]
}

СТРУКТУРА КОНТЕНТУ:
1. Вступ (1-2 абзаци) - зацікавити читача
2. Основна частина (3-5 секцій з ## H2)
3. Підсекції з ### H3 за потреби
4. Висновок з CTA

ВИМОГИ:
- ${wordRange.min}-${wordRange.max} слів
- Українська мова
- Інформативний стиль, не рекламний
- Практичні поради
- Ключові слова природно інтегровані
- CTA в кінці: "Знайдіть дилера" або "Дізнайтеся більше"
- НЕ вигадуй дані
- НЕ згадуй ціни`;
}

/**
 * Parse JSON response from LLM
 */
function parseResponse(response: string): ArticleOutput {
  const jsonMatch = response.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    title: parsed.title || "",
    excerpt: parsed.excerpt || "",
    content: parsed.content || "",
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    readingTime: parsed.readingTime || 5,
    relatedTyres: Array.isArray(parsed.relatedTyres) ? parsed.relatedTyres : undefined,
  };
}

/**
 * Validate article content
 */
function validateArticle(article: ArticleOutput, type: ArticleType): void {
  const errors: string[] = [];
  const wordRange = WORD_COUNT_RANGES[type];

  if (!article.title || article.title.length < 20) {
    errors.push(`title too short: ${article.title?.length || 0} chars`);
  }

  if (article.title && article.title.length > 100) {
    errors.push(`title too long: ${article.title.length} chars (max 100)`);
  }

  if (!article.excerpt || article.excerpt.length < 50) {
    errors.push(`excerpt too short: ${article.excerpt?.length || 0} chars`);
  }

  const wordCount = article.content?.split(/\s+/).length || 0;
  if (wordCount < wordRange.min * 0.7) {
    errors.push(`content too short: ${wordCount} words (min ${wordRange.min})`);
  }

  if (!article.tags || article.tags.length < 2) {
    errors.push(`need at least 2 tags, got ${article.tags?.length || 0}`);
  }

  if (errors.length > 0) {
    throw new Error(`Article validation failed: ${errors.join("; ")}`);
  }
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^а-яїієґa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

/**
 * Generate article using LLM
 */
export async function generateArticle(
  input: ArticleInput,
  options?: {
    provider?: string;
    model?: string;
    skipValidation?: boolean;
  }
): Promise<{
  article: GeneratedArticle;
  metadata: {
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    cost: number;
    latencyMs: number;
  };
}> {
  const prompt = buildPrompt(input);

  logger.info(`Generating article: ${input.topic}`, {
    type: input.type,
    provider: options?.provider || "default",
  });

  // Use content-generation routing
  const generator = llm.forTask("content-generation");

  const { data, response } = await generator.generateJSON<ArticleOutput>(prompt, {
    systemPrompt: SYSTEM_PROMPTS.article,
    maxTokens: 4000,
    temperature: 0.7,
    ...(options?.provider && { provider: options.provider }),
    ...(options?.model && { model: options.model }),
  });

  // Validate article
  if (!options?.skipValidation) {
    validateArticle(data, input.type);
  }

  const wordCount = data.content.split(/\s+/).length;

  logger.info(`Article generated: ${data.title}`, {
    words: wordCount,
    tags: data.tags.length,
    cost: response.cost.toFixed(4),
  });

  const article: GeneratedArticle = {
    slug: generateSlug(data.title),
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    seoTitle: data.title,
    seoDescription: data.excerpt,
    seoKeywords: data.tags,
    tags: data.tags,
    relatedTyres: data.relatedTyres,
    metadata: {
      generatedAt: new Date().toISOString(),
      provider: response.provider,
      model: response.model,
      totalCost: response.cost,
    },
  };

  return {
    article,
    metadata: {
      provider: response.provider,
      model: response.model,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      cost: response.cost,
      latencyMs: response.latencyMs,
    },
  };
}

/**
 * Generate seasonal article (helper)
 */
export async function generateSeasonalArticle(
  season: "summer" | "winter" | "allseason",
  options?: {
    provider?: string;
    model?: string;
  }
): Promise<GeneratedArticle> {
  const topics: Record<string, { topic: string; keywords: string[] }> = {
    summer: {
      topic: "Як вибрати літні шини: повний гайд для українських водіїв",
      keywords: ["літні шини", "вибір шин", "безпека на дорозі", "Bridgestone"],
    },
    winter: {
      topic: "Як вибрати зимові шини: все що потрібно знати",
      keywords: ["зимові шини", "шипи", "фрикційні шини", "Bridgestone", "безпека взимку"],
    },
    allseason: {
      topic: "Всесезонні шини: переваги та недоліки",
      keywords: ["всесезонні шини", "4 сезони", "універсальні шини", "Bridgestone"],
    },
  };

  const input = topics[season];
  const result = await generateArticle(
    {
      topic: input.topic,
      type: "seasonal-guide",
      keywords: input.keywords,
    },
    options
  );

  return result.article;
}

// CLI test
async function main() {
  console.log("Testing Article Generator...\n");

  const testInput: ArticleInput = {
    topic: "Bridgestone Turanza 6: повний огляд нової моделі",
    type: "model-review",
    tireModels: ["Turanza 6"],
    keywords: ["Turanza 6", "огляд", "літні шини", "преміум"],
  };

  try {
    const result = await generateArticle(testInput);

    console.log("\n=== TITLE ===");
    console.log(result.article.title);

    console.log("\n=== EXCERPT ===");
    console.log(result.article.excerpt);

    console.log("\n=== CONTENT (first 500 chars) ===");
    console.log(result.article.content.slice(0, 500) + "...");

    console.log("\n=== TAGS ===");
    console.log(result.article.tags.join(", "));

    console.log("\n=== METADATA ===");
    console.log(`Slug: ${result.article.slug}`);
    console.log(`Provider: ${result.metadata.provider}`);
    console.log(`Model: ${result.metadata.model}`);
    console.log(`Cost: $${result.metadata.cost.toFixed(4)}`);
    console.log(`Latency: ${result.metadata.latencyMs}ms`);
    console.log(`Words: ${result.article.content.split(/\s+/).length}`);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

if (process.argv[1]?.includes("article-generator.ts")) {
  main();
}
