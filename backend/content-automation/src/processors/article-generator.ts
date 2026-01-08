/**
 * Article Generator
 *
 * Generates articles about tire tests, comparisons, and seasonal guides.
 */

import { generateContent } from "./llm-generator.js";
import { getArticlePrompt, SYSTEM_PROMPTS } from "../config/prompts.js";
import { ENV } from "../config/env.js";

// Types
export type ArticleType =
  | "model-review"
  | "test-summary"
  | "comparison"
  | "seasonal-guide"
  | "technology";

export interface TestData {
  source: string;
  year: number;
  testType: "summer" | "winter" | "allseason";
  results: string;
  bridgestoneModels: string[];
}

export interface GeneratedArticle {
  slug: string;
  title: string;
  subtitle?: string;
  body: string;
  previewText: string;
  readingTimeMinutes: number;
  tags: string[];
  relatedTyres: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface ArticleGenerationResult {
  success: boolean;
  article?: GeneratedArticle;
  error?: string;
}

/**
 * Calculate reading time from word count
 */
function calculateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200); // 200 words per minute
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Zа-яА-ЯіІїЇєЄ0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/**
 * Parse article response from LLM
 */
function parseArticleResponse(response: string, type: ArticleType): GeneratedArticle | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const body = parsed.content || parsed.body || "";

      return {
        slug: generateSlug(parsed.title),
        title: parsed.title || "Untitled",
        subtitle: parsed.subtitle,
        body,
        previewText: parsed.excerpt || parsed.previewText || body.slice(0, 200),
        readingTimeMinutes: parsed.readingTime || calculateReadingTime(body),
        tags: parsed.tags || [type],
        relatedTyres: parsed.relatedTyres || [],
        seoTitle: parsed.seoTitle || parsed.title,
        seoDescription: parsed.seoDescription || parsed.excerpt || "",
      };
    }
  } catch (error) {
    console.error("Failed to parse article response:", error);
  }

  return null;
}

/**
 * Generate article about test results
 */
export async function generateTestSummaryArticle(
  testData: TestData
): Promise<ArticleGenerationResult> {
  if (!ENV.ANTHROPIC_API_KEY) {
    return {
      success: false,
      error: "ANTHROPIC_API_KEY not set",
    };
  }

  const prompt = getArticlePrompt({
    topic: `Результати тесту ${testData.source} ${testData.year} ${testData.testType === "summer" ? "літніх" : testData.testType === "winter" ? "зимових" : "всесезонних"} шин`,
    type: "test-summary",
    models: testData.bridgestoneModels,
    testData: {
      source: testData.source,
      year: testData.year,
      results: testData.results,
    },
  });

  try {
    const response = await generateContent(prompt, {
      maxTokens: 2500,
      temperature: 0.7,
      systemPrompt: SYSTEM_PROMPTS.article,
    });

    const article = parseArticleResponse(response, "test-summary");

    if (article) {
      article.relatedTyres = testData.bridgestoneModels.map((m) =>
        m.toLowerCase().replace(/\s+/g, "-")
      );
      return { success: true, article };
    }

    return { success: false, error: "Failed to parse article" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Generate comparison article
 */
export async function generateComparisonArticle(
  tyres: Array<{ name: string; slug: string; season: string }>
): Promise<ArticleGenerationResult> {
  if (!ENV.ANTHROPIC_API_KEY) {
    return { success: false, error: "ANTHROPIC_API_KEY not set" };
  }

  const tyreNames = tyres.map((t) => `Bridgestone ${t.name}`);

  const prompt = getArticlePrompt({
    topic: `Порівняння: ${tyreNames.join(" vs ")}`,
    type: "comparison",
    models: tyreNames,
    keywords: ["порівняння шин", "вибір шин", tyres[0].season],
  });

  try {
    const response = await generateContent(prompt, {
      maxTokens: 3000,
      temperature: 0.7,
      systemPrompt: SYSTEM_PROMPTS.article,
    });

    const article = parseArticleResponse(response, "comparison");

    if (article) {
      article.slug = tyres.map((t) => t.slug).join("-vs-");
      article.relatedTyres = tyres.map((t) => t.slug);
      return { success: true, article };
    }

    return { success: false, error: "Failed to parse article" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Generate seasonal guide article
 */
export async function generateSeasonalGuide(
  season: "summer" | "winter"
): Promise<ArticleGenerationResult> {
  if (!ENV.ANTHROPIC_API_KEY) {
    return { success: false, error: "ANTHROPIC_API_KEY not set" };
  }

  const year = new Date().getFullYear();
  const seasonName = season === "summer" ? "літні" : "зимові";

  const prompt = getArticlePrompt({
    topic: `Гід з вибору ${seasonName}х шин ${year}`,
    type: "seasonal-guide",
    keywords: [`${seasonName} шини`, `вибір шин ${year}`, "Bridgestone"],
  });

  try {
    const response = await generateContent(prompt, {
      maxTokens: 2500,
      temperature: 0.7,
      systemPrompt: SYSTEM_PROMPTS.article,
    });

    const article = parseArticleResponse(response, "seasonal-guide");

    if (article) {
      article.slug = `${season}-tyres-guide-${year}`;
      return { success: true, article };
    }

    return { success: false, error: "Failed to parse article" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Test
async function main() {
  console.log("Testing Article Generator...\n");

  if (!ENV.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not set. Skipping test.");
    return;
  }

  // Test test summary article
  const testData: TestData = {
    source: "ADAC",
    year: 2024,
    testType: "summer",
    results: "Turanza 6 - 1 місце (1.8), Potenza Sport - 3 місце (2.1)",
    bridgestoneModels: ["Turanza 6", "Potenza Sport"],
  };

  console.log("Generating test summary article...");
  const result = await generateTestSummaryArticle(testData);

  if (result.success && result.article) {
    console.log("\n✅ Article generated:");
    console.log(`Title: ${result.article.title}`);
    console.log(`Slug: ${result.article.slug}`);
    console.log(`Reading time: ${result.article.readingTimeMinutes} min`);
    console.log(`Tags: ${result.article.tags.join(", ")}`);
    console.log(`\nPreview:\n${result.article.previewText}`);
  } else {
    console.error("❌ Failed:", result.error);
  }
}

main();
