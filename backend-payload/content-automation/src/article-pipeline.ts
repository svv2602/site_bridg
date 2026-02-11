/**
 * Smart Article Pipeline
 *
 * Orchestrator that runs: scan sources → plan articles → generate → publish/review.
 * Designed to run as a scheduled task or manually from admin dashboard.
 */

import { chromium } from "playwright";
import { scrapeADAC } from "./scrapers/adac.js";
import { scrapeAutoBild } from "./scrapers/autobild.js";
import { scrapeTyreReviews } from "./scrapers/tyrereviews.js";
import {
  getDueSources,
  updateSource,
  getPendingQueue,
  getQueueItem,
  updateQueueItem,
  getSettingBool,
  getSettingNumber,
  type ContentSource,
  type ArticleQueueItem,
  type ScraperKey,
} from "./db/article-queue.js";
import { planArticles } from "./article-planner.js";
import { generateArticle, type ArticleInput } from "./processors/content/article-generator.js";
import { generateHeroImage } from "./processors/content/article-images.js";
import { getPayloadClient } from "./publishers/payload-client.js";
import { getArticlePrompt, type RelatedItem } from "./prompts/index.js";
import { getTestResult } from "./db/test-results.js";
import type { GeneratedArticle } from "./types/content.js";
import { notify } from "./publishers/telegram-bot.js";

interface PipelineResult {
  phase: string;
  sourcesScanned: number;
  newTestResults: number;
  articlesPlanned: number;
  articlesGenerated: number;
  articlesPublished: number;
  articlesForReview: number;
  errors: string[];
}

/**
 * Run the full smart article pipeline
 */
export async function runSmartArticlePipeline(): Promise<PipelineResult> {
  const result: PipelineResult = {
    phase: "complete",
    sourcesScanned: 0,
    newTestResults: 0,
    articlesPlanned: 0,
    articlesGenerated: 0,
    articlesPublished: 0,
    articlesForReview: 0,
    errors: [],
  };

  try {
    // Phase 1: Scan sources
    console.log("\n=== Phase 1: Scanning content sources ===");
    result.phase = "scanning";
    const scanResult = await scanSources();
    result.sourcesScanned = scanResult.scanned;
    result.newTestResults = scanResult.newResults;

    // Phase 2: Plan articles
    console.log("\n=== Phase 2: Planning articles ===");
    result.phase = "planning";
    const planResult = await planArticles();
    result.articlesPlanned = planResult.planned;

    // Phase 3: Generate and publish
    console.log("\n=== Phase 3: Generating articles ===");
    result.phase = "generating";
    const genResult = await processQueue();
    result.articlesGenerated = genResult.generated;
    result.articlesPublished = genResult.published;
    result.articlesForReview = genResult.forReview;
    result.errors.push(...genResult.errors);

    result.phase = "complete";
    console.log("\n=== Pipeline complete ===");
    console.log(
      `Sources: ${result.sourcesScanned}, New tests: ${result.newTestResults}, ` +
      `Planned: ${result.articlesPlanned}, Generated: ${result.articlesGenerated}, ` +
      `Published: ${result.articlesPublished}, For review: ${result.articlesForReview}`
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    result.errors.push(`Pipeline error: ${msg}`);
    console.error(`[Pipeline] Fatal error:`, error);
  }

  // Send Telegram summary notification
  const hasErrors = result.errors.length > 0;
  let notifyBody = `📰 Джерел переглянуто: ${result.sourcesScanned}\n`;
  notifyBody += `🆕 Нових тестів: ${result.newTestResults}\n`;
  notifyBody += `📝 Статей заплановано: ${result.articlesPlanned}\n`;
  notifyBody += `✅ Згенеровано: ${result.articlesGenerated}\n`;
  notifyBody += `📤 Опубліковано: ${result.articlesPublished}\n`;
  notifyBody += `👀 На перевірку: ${result.articlesForReview}\n`;
  if (hasErrors) {
    notifyBody += `\n⚠️ Помилок: ${result.errors.length}`;
  }

  await notify({
    type: hasErrors ? "error" : "info",
    title: "Smart Article Pipeline",
    body: notifyBody,
  });

  return result;
}

// ============ PHASE 1: SCAN SOURCES ============

async function scanSources(): Promise<{ scanned: number; newResults: number }> {
  const dueSources = getDueSources();

  if (dueSources.length === 0) {
    console.log("[Scan] No sources due for checking");
    return { scanned: 0, newResults: 0 };
  }

  console.log(`[Scan] ${dueSources.length} source(s) due for checking`);

  let totalNew = 0;
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    for (const source of dueSources) {
      try {
        console.log(`[Scan] Checking ${source.name}...`);
        const result = await runScraper(page, source);

        updateSource(source.id, {
          lastCheckedAt: new Date().toISOString(),
          lastFoundNew: result.newResults,
        });

        totalNew += result.newResults;
        console.log(`[Scan] ${source.name}: ${result.newResults} new test results`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`[Scan] Error scanning ${source.name}: ${msg}`);

        // Still update last_checked_at so we don't retry immediately
        updateSource(source.id, {
          lastCheckedAt: new Date().toISOString(),
          lastFoundNew: 0,
        });
      }
    }
  } finally {
    if (browser) await browser.close();
  }

  return { scanned: dueSources.length, newResults: totalNew };
}

async function runScraper(
  page: import("playwright").Page,
  source: ContentSource
): Promise<{ newResults: number }> {
  const scraperMap: Record<ScraperKey, (p: import("playwright").Page) => Promise<{ testsNew: number }>> = {
    adac: scrapeADAC,
    autobild: scrapeAutoBild,
    tyrereviews: (p) => scrapeTyreReviews(p),
  };

  const scraperFn = scraperMap[source.scraper];
  if (!scraperFn) {
    throw new Error(`Unknown scraper: ${source.scraper}`);
  }

  const result = await scraperFn(page);
  return { newResults: result.testsNew };
}

// ============ PHASE 3: PROCESS QUEUE ============

export interface SingleItemResult {
  success: boolean;
  payloadId?: string;
  articleTitle?: string;
  articleSlug?: string;
  error?: string;
}

/**
 * Process a single queue item: generate article, optionally image, publish to CMS.
 * Used by both the batch processQueue() and the manual generation CLI.
 */
export async function processSingleQueueItem(
  itemId: number,
  options?: {
    autoPublish?: boolean;
    generateImages?: boolean;
    interlink?: boolean;
  }
): Promise<SingleItemResult> {
  const item = getQueueItem(itemId);
  if (!item) {
    return { success: false, error: `Queue item #${itemId} not found` };
  }
  if (item.status !== "pending") {
    return { success: false, error: `Queue item #${itemId} status is "${item.status}", expected "pending"` };
  }

  // Read settings from DB, overridden by options
  const autoPublish = options?.autoPublish ?? getSettingBool("auto_publish");
  const interlink = options?.interlink ?? getSettingBool("interlinking_enabled");
  const generateImagesEnabled = options?.generateImages ?? getSettingBool("image_generation_enabled");

  // For manual items, always save as draft for review
  const isManual = item.triggerType === "manual";
  const shouldPublish = isManual ? false : autoPublish;

  try {
    updateQueueItem(item.id, { status: "generating" });

    const context = await buildGenerationContext(item, interlink);

    // Merge user-provided keywords for manual items
    if (isManual && item.triggerData?.keywords) {
      const userKeywords = item.triggerData.keywords as string[];
      const existing = new Set(context.input.keywords || []);
      for (const kw of userKeywords) {
        if (!existing.has(kw)) {
          context.input.keywords = [...(context.input.keywords || []), kw];
        }
      }
    }

    console.log(`[Generate] Generating: "${item.topic}" (${item.articleType})`);
    const result = await generateArticle({
      ...context.input,
      relatedItems: context.relatedItems.length > 0 ? context.relatedItems : undefined,
    }, { twoStage: true });

    // Generate hero image if enabled
    let imageMediaId: number | undefined;
    if (generateImagesEnabled) {
      try {
        console.log(`[Generate] Generating hero image for: "${result.article.title}"`);
        const season = (item.triggerData?.season as "summer" | "winter" | "allseason") || undefined;
        const heroImage = await generateHeroImage(item.topic, season);
        if (heroImage.url) {
          const client = getPayloadClient();
          const media = await client.uploadImageFromUrl(heroImage.url, {
            alt: heroImage.alt,
            filename: `article-${result.article.slug}.png`,
          });
          if (media) {
            imageMediaId = media.id;
            console.log(`[Generate] Hero image uploaded: media ID ${media.id}`);
          }
        }
      } catch (imgError) {
        const msg = imgError instanceof Error ? imgError.message : String(imgError);
        console.warn(`[Generate] Image generation failed (non-blocking): ${msg}`);
      }
    }

    // Publish or hold for review
    const payloadId = await publishArticleToCMS(result.article, context.relatedTyreIds, imageMediaId);

    if (shouldPublish) {
      updateQueueItem(item.id, {
        status: "published",
        generatedPayloadId: payloadId,
        processedAt: new Date().toISOString(),
      });
      console.log(`[Generate] Published: "${result.article.title}" (ID: ${payloadId})`);
    } else {
      updateQueueItem(item.id, {
        status: "review",
        generatedPayloadId: payloadId,
        processedAt: new Date().toISOString(),
      });
      console.log(`[Generate] For review: "${result.article.title}" (ID: ${payloadId})`);
    }

    return {
      success: true,
      payloadId,
      articleTitle: result.article.title,
      articleSlug: result.article.slug,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    updateQueueItem(item.id, {
      status: "failed",
      error: msg,
      processedAt: new Date().toISOString(),
    });
    console.error(`[Generate] Failed: "${item.topic}": ${msg}`);
    return { success: false, error: msg };
  }
}

async function processQueue(): Promise<{
  generated: number;
  published: number;
  forReview: number;
  errors: string[];
}> {
  const maxPerWeek = getSettingNumber("max_articles_per_week") || 3;
  const autoPublish = getSettingBool("auto_publish");
  const interlink = getSettingBool("interlinking_enabled");
  const generateImages = getSettingBool("image_generation_enabled");
  const errors: string[] = [];

  const pending = getPendingQueue(maxPerWeek);

  if (pending.length === 0) {
    console.log("[Generate] No pending articles in queue");
    return { generated: 0, published: 0, forReview: 0, errors };
  }

  console.log(`[Generate] Processing ${pending.length} article(s) from queue`);

  let generated = 0;
  let published = 0;
  let forReview = 0;

  for (const item of pending) {
    const result = await processSingleQueueItem(item.id, {
      autoPublish,
      generateImages,
      interlink,
    });

    if (result.success) {
      generated++;
      // Check if it was published or sent for review
      const updatedItem = getQueueItem(item.id);
      if (updatedItem?.status === "published") {
        published++;
      } else {
        forReview++;
      }
    } else {
      errors.push(`Article #${item.id} "${item.topic}": ${result.error}`);
    }
  }

  return { generated, published, forReview, errors };
}

// ============ CONTEXT BUILDING ============

interface GenerationContext {
  input: ArticleInput;
  relatedItems: RelatedItem[];
  relatedTyreIds: string[];
}

async function buildGenerationContext(
  item: ArticleQueueItem,
  interlink: boolean
): Promise<GenerationContext> {
  const relatedItems: RelatedItem[] = [];
  const relatedTyreIds: string[] = [];

  // Build test data if available
  let testData: ArticleInput["testData"] | undefined;
  if (item.triggerType === "test-result" && item.triggerData?.testUid) {
    const test = getTestResult(item.triggerData.testUid as string);
    if (test) {
      // Format results as readable string
      const resultsStr = test.results
        .slice(0, 10)
        .map((r) => `${r.position}. ${r.tireName} (${r.rating})`)
        .join("; ");

      testData = {
        source: getSourceLabel(test.source),
        year: test.year,
        results: resultsStr,
      };
    }
  }

  // Build related items for interlinking
  if (interlink) {
    const client = getPayloadClient();

    // Find related tyres in CMS
    if (item.relatedTyres?.length) {
      for (const slug of item.relatedTyres) {
        try {
          const tyre = await client.findTyreBySlug(slug);
          if (tyre) {
            relatedItems.push({
              slug: tyre.slug,
              name: tyre.name,
              type: "tyre",
            });
            relatedTyreIds.push(tyre.id);
          }
        } catch {
          // Tyre not in CMS, skip
        }
      }
    }

    // Find related articles for cross-linking
    try {
      const articles = await client.getAllArticles(10);
      for (const article of articles.slice(0, 3)) {
        relatedItems.push({
          slug: article.slug,
          name: article.title,
          type: "article",
        });
      }
    } catch {
      // Articles fetch failed, continue without
    }
  }

  // Build tireModels list from related tyres or trigger data
  const tireModels: string[] = [];
  if (item.triggerData?.ourResults) {
    const results = item.triggerData.ourResults as Array<{ name: string }>;
    tireModels.push(...results.map((r) => r.name));
  }

  // Determine brand from trigger data or related tyres
  let brand: "bridgestone" | "firestone" | undefined;
  if (item.triggerData?.brand) {
    brand = item.triggerData.brand as "bridgestone" | "firestone";
  } else if (relatedItems.length > 0) {
    // If all related tyres belong to one brand, use it
    const tyreNames = relatedItems
      .filter((r) => r.type === "tyre")
      .map((r) => r.name.toLowerCase());
    const allFirestone = tyreNames.length > 0 && tyreNames.every((n) => n.includes("firestone"));
    if (allFirestone) brand = "firestone";
  }

  // Build keywords based on article type
  const keywords: string[] = ["Bridgestone", "шини"];
  if (item.articleType === "test-summary" && item.triggerData?.source) {
    keywords.push(item.triggerData.source as string, "тест шин");
  }
  if (item.articleType === "seasonal-guide") {
    const season = item.triggerData?.season as string;
    if (season === "winter") keywords.push("зимові шини", "безпека взимку");
    if (season === "summer") keywords.push("літні шини", "безпека на дорозі");
  }

  return {
    input: {
      topic: item.topic,
      type: item.articleType,
      brand,
      tireModels: tireModels.length > 0 ? tireModels : undefined,
      testData,
      keywords,
    },
    relatedItems,
    relatedTyreIds,
  };
}

// ============ PUBLISHING ============

async function publishArticleToCMS(
  article: GeneratedArticle,
  relatedTyreIds: string[],
  imageMediaId?: number
): Promise<string> {
  const client = getPayloadClient();

  // Build article data for Payload
  const articleData = {
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    previewText: article.excerpt.slice(0, 300),
    body: article.content,
    tags: article.tags.map((tag) => ({ tag })),
    seoTitle: article.seoTitle?.slice(0, 70),
    seoDescription: article.seoDescription?.slice(0, 170),
    readingTimeMinutes: Math.ceil(
      (article.content?.split(/\s+/).length || 0) / 200
    ),
    // Featured image
    ...(imageMediaId && { image: imageMediaId }),
    // relatedTyres populated automatically from CMS IDs
    ...(relatedTyreIds.length > 0 && { relatedTyres: relatedTyreIds }),
  };

  const result = await client.publishArticle(articleData);
  return result.id;
}

function getSourceLabel(source: string): string {
  switch (source) {
    case "adac":
      return "ADAC";
    case "autobild":
      return "Auto Bild";
    case "tyrereviews":
      return "TyreReviews";
    default:
      return source;
  }
}

// ============ CLI ============

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--scan-only")) {
    console.log("Running source scan only...");
    const result = await scanSources();
    console.log(`Scanned ${result.scanned} sources, found ${result.newResults} new results`);
    return;
  }

  if (args.includes("--plan-only")) {
    console.log("Running planner only...");
    const result = await planArticles();
    console.log(`Planned ${result.planned} articles`);
    for (const d of result.details) {
      console.log(`  - [${d.type}] ${d.topic} (${d.reason})`);
    }
    return;
  }

  if (args.includes("--generate-only")) {
    console.log("Processing queue only (no scan/plan)...");
    const result = await processQueue();
    console.log(
      `Generated: ${result.generated}, Published: ${result.published}, For review: ${result.forReview}`
    );
    return;
  }

  // Process a single queue item by ID (used by manual generation CLI)
  const processItemArg = args.find((a) => a.startsWith("--process-item="));
  if (processItemArg) {
    const itemId = parseInt(processItemArg.split("=")[1], 10);
    if (isNaN(itemId)) {
      console.error("Invalid item ID");
      process.exit(1);
    }
    const result = await processSingleQueueItem(itemId);
    // Output JSON result to stdout for subprocess consumption
    console.log(JSON.stringify(result));
    return;
  }

  // Full pipeline
  const result = await runSmartArticlePipeline();
  console.log("\nPipeline result:", JSON.stringify(result, null, 2));
}

if (process.argv[1]?.includes("article-pipeline")) {
  main().catch(console.error);
}
