/**
 * Smart Article Planner
 *
 * Analyzes available data (test results, seasonal timing, new products)
 * and decides which articles to generate. Creates entries in article_queue.
 */

import {
  addToQueue,
  queueHasSimilarTopic,
  getSettingNumber,
  getSettingJSON,
  type ArticleType,
} from "./db/article-queue.js";
import {
  getTestResultsSince,
  getRecentTestResults,
  type TestResult,
  type TestResultEntry,
} from "./db/test-results.js";
import { normalizeRating } from "./scrapers/parsers.js";

// Bridgestone & Firestone brand names to detect in test results
const OUR_BRANDS = ["bridgestone", "firestone"];

interface PlanResult {
  planned: number;
  skippedDuplicate: number;
  details: Array<{ topic: string; type: ArticleType; reason: string }>;
}

/**
 * Main planning function — analyze data and populate article queue
 */
export async function planArticles(sinceDate?: string): Promise<PlanResult> {
  const result: PlanResult = { planned: 0, skippedDuplicate: 0, details: [] };

  const maxPerWeek = getSettingNumber("max_articles_per_week") || 3;
  const preferredTypes = getSettingJSON<string[]>("preferred_types") || [
    "test-summary",
    "seasonal-guide",
    "comparison",
  ];
  const minRating = getSettingNumber("min_rating_to_feature") || 2.0;

  // Default: look at tests from last 14 days
  const since =
    sinceDate || new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  console.log(`[Planner] Analyzing data since ${since}...`);

  // 1. Plan test-summary articles from new test results
  if (preferredTypes.includes("test-summary")) {
    const testArticles = planTestSummaryArticles(since, minRating);
    for (const item of testArticles) {
      if (result.planned >= maxPerWeek) break;
      if (addPlanned(item, result)) result.planned++;
      else result.skippedDuplicate++;
    }
  }

  // 2. Plan comparison articles when multiple tests in same category
  if (preferredTypes.includes("comparison") && result.planned < maxPerWeek) {
    const comparisonArticles = planComparisonArticles(since);
    for (const item of comparisonArticles) {
      if (result.planned >= maxPerWeek) break;
      if (addPlanned(item, result)) result.planned++;
      else result.skippedDuplicate++;
    }
  }

  // 3. Plan seasonal guide refreshes
  if (preferredTypes.includes("seasonal-guide") && result.planned < maxPerWeek) {
    const seasonalArticles = planSeasonalArticles();
    for (const item of seasonalArticles) {
      if (result.planned >= maxPerWeek) break;
      if (addPlanned(item, result)) result.planned++;
      else result.skippedDuplicate++;
    }
  }

  console.log(
    `[Planner] Done: ${result.planned} planned, ${result.skippedDuplicate} skipped (duplicate)`
  );
  return result;
}

// ============ TEST SUMMARY ARTICLES ============

interface PlannedArticle {
  topic: string;
  articleType: ArticleType;
  triggerType: "test-result" | "seasonal" | "new-product" | "manual";
  triggerData: Record<string, unknown>;
  priority: number;
  relatedTyres?: string[];
  reason: string;
  dedupeKey: string;
}

function planTestSummaryArticles(since: string, minRating: number): PlannedArticle[] {
  const planned: PlannedArticle[] = [];
  const newTests = getTestResultsSince(since);

  if (newTests.length === 0) {
    console.log("[Planner] No new test results found");
    return planned;
  }

  console.log(`[Planner] Found ${newTests.length} new test results`);

  for (const test of newTests) {
    // Find our brands in results
    const ourResults = findOurBrandsInTest(test);
    if (ourResults.length === 0) continue;

    // Check if any are in top-3 or have good ratings
    // Normalize ratings to unified 1.0-5.0 scale for cross-source comparison
    const topResults = ourResults.filter(
      (r) => r.position <= 3 || normalizeRating(r.ratingNumeric, test.source) <= minRating
    );

    if (topResults.length === 0) continue;

    const bestResult = topResults[0];
    const seasonLabel = getSeasonLabelUk(test.testType);
    const sourceLabel = getSourceLabel(test.source);

    // Build topic
    const topic = bestResult.categoryWins?.length
      ? `${sourceLabel} ${seasonLabel} тест ${test.year}: ${bestResult.tireName} — ${bestResult.categoryWins[0]}`
      : `${sourceLabel} ${seasonLabel} тест ${test.year}: ${bestResult.tireName} у топ-${bestResult.position}`;

    const tyreSlugs = ourResults.map((r) => nameToSlug(r.tireName));

    planned.push({
      topic,
      articleType: "test-summary",
      triggerType: "test-result",
      triggerData: {
        testUid: test.testUid,
        source: test.source,
        year: test.year,
        testType: test.testType,
        testedSize: test.testedSize,
        ourResults: ourResults.map((r) => ({
          name: r.tireName,
          position: r.position,
          rating: r.rating,
          categoryWins: r.categoryWins,
        })),
        totalTyres: test.results.length,
      },
      priority: bestResult.position <= 1 ? 1 : bestResult.position <= 3 ? 3 : 5,
      relatedTyres: tyreSlugs,
      reason: `${bestResult.tireName} at position ${bestResult.position} in ${test.source} ${test.testType} ${test.year}`,
      dedupeKey: test.testUid,
    });
  }

  return planned;
}

// ============ COMPARISON ARTICLES ============

function planComparisonArticles(since: string): PlannedArticle[] {
  const planned: PlannedArticle[] = [];
  const newTests = getTestResultsSince(since);

  // Group by testType (season)
  const byType: Record<string, TestResult[]> = {};
  for (const test of newTests) {
    const key = test.testType;
    if (!byType[key]) byType[key] = [];
    byType[key].push(test);
  }

  for (const [testType, tests] of Object.entries(byType)) {
    // Need 3+ tests of same type for a comparison article
    if (tests.length < 3) continue;

    const seasonLabel = getSeasonLabelUk(testType as TestResult["testType"]);
    const year = tests[0].year;
    const topic = `Порівняння ${seasonLabel} шин ${year}: результати незалежних тестів`;

    // Collect all our brand tyres mentioned across tests
    const allOurTyres: string[] = [];
    for (const test of tests) {
      const ours = findOurBrandsInTest(test);
      for (const r of ours) {
        const slug = nameToSlug(r.tireName);
        if (!allOurTyres.includes(slug)) allOurTyres.push(slug);
      }
    }

    planned.push({
      topic,
      articleType: "comparison",
      triggerType: "test-result",
      triggerData: {
        testType,
        year,
        testUids: tests.map((t) => t.testUid),
        sourceCount: tests.length,
      },
      priority: 4,
      relatedTyres: allOurTyres,
      reason: `${tests.length} ${testType} tests found for comparison`,
      dedupeKey: `comparison-${testType}-${year}`,
    });
  }

  return planned;
}

// ============ SEASONAL ARTICLES ============

function planSeasonalArticles(): PlannedArticle[] {
  const planned: PlannedArticle[] = [];
  const leadWeeks = getSettingNumber("seasonal_lead_weeks") || 6;
  const now = new Date();
  const futureDate = new Date(now.getTime() + leadWeeks * 7 * 24 * 60 * 60 * 1000);
  const futureMonth = futureDate.getMonth() + 1; // 1-12

  // Winter prep: October-November (months 10-11)
  if (futureMonth >= 10 && futureMonth <= 11) {
    planned.push({
      topic: `Як обрати зимові шини ${futureDate.getFullYear()}: повний гід`,
      articleType: "seasonal-guide",
      triggerType: "seasonal",
      triggerData: { season: "winter", year: futureDate.getFullYear() },
      priority: 2,
      reason: `Winter season approaching (lead ${leadWeeks} weeks)`,
      dedupeKey: `seasonal-winter-${futureDate.getFullYear()}`,
    });
  }

  // Summer prep: March-April (months 3-4)
  if (futureMonth >= 3 && futureMonth <= 4) {
    planned.push({
      topic: `Літні шини ${futureDate.getFullYear()}: як обрати найкращі`,
      articleType: "seasonal-guide",
      triggerType: "seasonal",
      triggerData: { season: "summer", year: futureDate.getFullYear() },
      priority: 2,
      reason: `Summer season approaching (lead ${leadWeeks} weeks)`,
      dedupeKey: `seasonal-summer-${futureDate.getFullYear()}`,
    });
  }

  // Care article: generate every 3 months (quarters)
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  planned.push({
    topic: `Догляд за шинами: практичні поради ${now.getFullYear()} Q${quarter}`,
    articleType: "tips",
    triggerType: "seasonal",
    triggerData: { season: "care", year: now.getFullYear(), quarter },
    priority: 7,
    reason: `Quarterly care article Q${quarter}`,
    dedupeKey: `seasonal-care-${now.getFullYear()}-Q${quarter}`,
  });

  return planned;
}

// ============ HELPERS ============

function addPlanned(item: PlannedArticle, result: PlanResult): boolean {
  // Check for duplicates
  if (
    queueHasSimilarTopic(item.articleType, item.triggerType, item.dedupeKey)
  ) {
    console.log(`[Planner] Skipping duplicate: ${item.topic}`);
    return false;
  }

  addToQueue({
    triggerType: item.triggerType,
    triggerData: item.triggerData,
    articleType: item.articleType,
    topic: item.topic,
    priority: item.priority,
    relatedTyres: item.relatedTyres,
  });

  result.details.push({
    topic: item.topic,
    type: item.articleType,
    reason: item.reason,
  });

  console.log(`[Planner] Queued: "${item.topic}" (${item.articleType}, priority=${item.priority})`);
  return true;
}

function findOurBrandsInTest(test: TestResult): TestResultEntry[] {
  return test.results.filter((r) =>
    OUR_BRANDS.some((brand) => r.tireName.toLowerCase().includes(brand))
  );
}

function nameToSlug(tireName: string): string {
  // "Bridgestone Turanza 6" → "turanza-6"
  // Remove brand prefix
  let name = tireName;
  for (const brand of OUR_BRANDS) {
    const re = new RegExp(`^${brand}\\s+`, "i");
    name = name.replace(re, "");
  }
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function getSeasonLabelUk(testType: string): string {
  switch (testType) {
    case "summer":
      return "літній";
    case "winter":
      return "зимовий";
    case "allseason":
      return "всесезонний";
    default:
      return testType;
  }
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
