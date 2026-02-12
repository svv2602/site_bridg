/**
 * Smart Article Planner
 *
 * Analyzes available data (test results, seasonal timing, new products, news)
 * and decides which articles to generate. Creates entries in article_queue.
 */

import {
  addToQueue,
  queueHasSimilarTopic,
  getSettingNumber,
  getSettingJSON,
  type ArticleType,
  type ArticleTriggerType,
} from "./db/article-queue.js";
import {
  getTestResultsSince,
  getRecentTestResults,
  type TestResult,
  type TestResultEntry,
} from "./db/test-results.js";
import { getNewsItemsSince } from "./db/news-items.js";
import { normalizeRating } from "./scrapers/parsers.js";
import { getPayloadClient } from "./publishers/payload-client.js";

// Bridgestone, Firestone & Dayton brand names to detect in test results
const OUR_BRANDS = ["bridgestone", "firestone", "dayton"];

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
    "news-digest",
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

  // 4. Plan news digest articles from recent Bridgestone press releases
  if (preferredTypes.includes("news-digest") && result.planned < maxPerWeek) {
    const newsArticles = planNewsArticles(since);
    for (const item of newsArticles) {
      if (result.planned >= maxPerWeek) break;
      if (addPlanned(item, result)) result.planned++;
      else result.skippedDuplicate++;
    }
  }

  // 5. Plan model review articles from CMS tyre data
  if (preferredTypes.includes("model-review") && result.planned < maxPerWeek) {
    const modelArticles = await planModelReviewArticles();
    for (const item of modelArticles) {
      if (result.planned >= maxPerWeek) break;
      if (addPlanned(item, result)) result.planned++;
      else result.skippedDuplicate++;
    }
  }

  // 6. Plan technology explainer articles
  if (preferredTypes.includes("technology") && result.planned < maxPerWeek) {
    const techArticles = planTechnologyArticles();
    for (const item of techArticles) {
      if (result.planned >= maxPerWeek) break;
      if (addPlanned(item, result)) result.planned++;
      else result.skippedDuplicate++;
    }
  }

  // 7. Plan evergreen tips articles
  if (preferredTypes.includes("tips-evergreen") && result.planned < maxPerWeek) {
    const tipsArticles = planEvergreenTipsArticles();
    for (const item of tipsArticles) {
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
  triggerType: ArticleTriggerType;
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
    // Require tests from 3+ different sources (not just 3+ tests)
    const uniqueSources = new Set(tests.map((t) => t.source));
    if (uniqueSources.size < 3) continue;

    const seasonLabel = getSeasonLabelUk(testType as TestResult["testType"]);
    const year = tests[0].year;
    const sourcesList = Array.from(uniqueSources).map(getSourceLabel).join(", ");
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
        sourceCount: uniqueSources.size,
        sources: Array.from(uniqueSources),
        sourceLabels: sourcesList,
      },
      priority: 3, // More valuable with cross-source data
      relatedTyres: allOurTyres,
      reason: `${uniqueSources.size} sources (${sourcesList}) for ${testType} comparison`,
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

  // All-season guide: August-September (months 8-9)
  if (futureMonth >= 8 && futureMonth <= 9) {
    planned.push({
      topic: `Всесезонні шини ${futureDate.getFullYear()}: чи варто обирати?`,
      articleType: "seasonal-guide",
      triggerType: "seasonal",
      triggerData: { season: "allseason", year: futureDate.getFullYear() },
      priority: 3,
      reason: `All-season guide for fall transition (lead ${leadWeeks} weeks)`,
      dedupeKey: `seasonal-allseason-${futureDate.getFullYear()}`,
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

// ============ NEWS DIGEST ARTICLES ============

function planNewsArticles(since: string): PlannedArticle[] {
  const planned: PlannedArticle[] = [];

  const recentNews = getNewsItemsSince(since);

  if (recentNews.length < 2) {
    console.log(`[Planner] Only ${recentNews.length} news items — need 2+ for digest`);
    return planned;
  }

  console.log(`[Planner] Found ${recentNews.length} recent news items for digest`);

  const now = new Date();
  const weekNum = getISOWeekNumber(now);
  const year = now.getFullYear();

  // Create a news digest article
  const titles = recentNews.slice(0, 5).map((n) => n.title);
  const topic = `Новини Bridgestone: ${titles[0]}${recentNews.length > 1 ? ` та інше` : ""}`;

  planned.push({
    topic,
    articleType: "news-digest",
    triggerType: "news",
    triggerData: {
      newsCount: recentNews.length,
      newsItems: recentNews.slice(0, 5).map((n) => ({
        title: n.title,
        summary: n.summary,
        url: n.url,
        category: n.category,
      })),
      weekNum,
      year,
    },
    priority: 4,
    reason: `${recentNews.length} Bridgestone press releases this period`,
    dedupeKey: `news-digest-${year}-W${weekNum}`,
  });

  return planned;
}

// ============ MODEL REVIEW ARTICLES ============

async function planModelReviewArticles(): Promise<PlannedArticle[]> {
  const planned: PlannedArticle[] = [];
  const year = new Date().getFullYear();

  try {
    const client = getPayloadClient();
    const tyres = await client.getAllTyres(100);

    if (tyres.length === 0) {
      console.log("[Planner] No tyres in CMS for model reviews");
      return planned;
    }

    // Filter: only tyres with enough data for a quality article
    const candidates = tyres.filter(
      (t) => (t.badges && t.badges.length > 0) || t.keyBenefits?.length || t.faqs?.length
    );

    if (candidates.length === 0) {
      console.log("[Planner] No tyres with sufficient data for model reviews");
      return planned;
    }

    // Sort by priority: isNew > isPopular > has badges > others
    candidates.sort((a, b) => {
      const scoreA = (a.isNew ? 4 : 0) + (a.isPopular ? 2 : 0) + (a.badges?.length ? 1 : 0);
      const scoreB = (b.isNew ? 4 : 0) + (b.isPopular ? 2 : 0) + (b.badges?.length ? 1 : 0);
      return scoreB - scoreA;
    });

    // Pick top 2 candidates
    for (const tyre of candidates.slice(0, 2)) {
      const brandName = tyre.brand
        ? tyre.brand.charAt(0).toUpperCase() + tyre.brand.slice(1)
        : "Bridgestone";
      const dedupeKey = `model-review-${tyre.slug}-${year}`;
      const priority = tyre.isNew || tyre.isPopular ? 5 : 6;

      planned.push({
        topic: `Огляд ${brandName} ${tyre.name}: характеристики, тести та поради`,
        articleType: "model-review",
        triggerType: "seasonal",
        triggerData: {
          dedupeKey,
          tyreSlug: tyre.slug,
          brand: tyre.brand || "bridgestone",
          season: tyre.season,
          hasBadges: (tyre.badges?.length || 0) > 0,
          isNew: !!tyre.isNew,
          isPopular: !!tyre.isPopular,
        },
        priority,
        relatedTyres: [tyre.slug],
        reason: `Model review for ${tyre.name} (${tyre.isNew ? "new" : tyre.isPopular ? "popular" : "has data"})`,
        dedupeKey,
      });
    }

    console.log(`[Planner] ${planned.length} model review candidates from ${candidates.length} eligible tyres`);
  } catch (error) {
    console.warn("[Planner] Failed to fetch tyres for model reviews:", error);
  }

  return planned;
}

// ============ TECHNOLOGY ARTICLES ============

const TECHNOLOGY_TOPICS = [
  { slug: "run-flat", topic: "Технологія Run-Flat: як працюють шини, що їдуть без повітря" },
  { slug: "enliten", topic: "ENLITEN: легші шини — менше палива та викидів" },
  { slug: "nanopro-tech", topic: "NanoPro-Tech: як молекулярна технологія покращує зчеплення" },
  { slug: "potenza-sport", topic: "Bridgestone Potenza: технології для спортивного водіння" },
  { slug: "ecopia-fuel", topic: "Ecopia: як шини допомагають економити паливо" },
  { slug: "driveguard", topic: "DriveGuard: безпечна їзда навіть після проколу" },
  { slug: "weather-control", topic: "Weather Control: одні шини на всі сезони — чи це реально?" },
  { slug: "eu-label-explained", topic: "EU Label для шин: як читати етикетку та обирати найкращі" },
];

function planTechnologyArticles(): PlannedArticle[] {
  const planned: PlannedArticle[] = [];
  const year = new Date().getFullYear();

  // Shuffle pool for variety
  const shuffled = [...TECHNOLOGY_TOPICS].sort(() => Math.random() - 0.5);

  for (const item of shuffled) {
    const dedupeKey = `technology-${item.slug}-${year}`;

    if (queueHasSimilarTopic("technology", "seasonal", dedupeKey)) {
      continue;
    }

    planned.push({
      topic: item.topic,
      articleType: "technology",
      triggerType: "seasonal",
      triggerData: {
        dedupeKey,
        technologySlug: item.slug,
      },
      priority: 6,
      reason: `Technology explainer: ${item.slug}`,
      dedupeKey,
    });

    // Take only first available
    break;
  }

  return planned;
}

// ============ EVERGREEN TIPS ARTICLES ============

const EVERGREEN_TIPS_TOPICS = [
  { slug: "zberihannya-shyn", topic: "Як правильно зберігати шини: поради на літо та зиму" },
  { slug: "hlybyna-protektora", topic: "Глибина протектора: коли час міняти шини" },
  { slug: "tysk-u-shynakh", topic: "Тиск у шинах: чому це важливо та як перевіряти" },
  { slug: "vik-shyn", topic: "Вік шин: як визначити та коли замінити" },
  { slug: "zymove-vodinnya", topic: "Зимове водіння: 10 порад для безпеки на дорозі" },
  { slug: "shyny-i-palyvo", topic: "Як шини впливають на витрату палива" },
  { slug: "rotatsiya-shyn", topic: "Ротація шин: навіщо і як часто робити" },
  { slug: "akvaplanuvannya", topic: "Що таке аквапланування та як його уникнути" },
  { slug: "indeks-navantazhennya", topic: "Індекс навантаження та швидкості: що означають цифри на шинах" },
  { slug: "shyny-dlya-suv", topic: "Як обрати шини для SUV: відмінності від легкових" },
  { slug: "shyny-elektromobili", topic: "Шини для електромобілів: чим відрізняються та що обрати" },
  { slug: "perehid-na-zymovi", topic: "Коли переходити на зимові шини: температурне правило +7°C" },
  { slug: "shynomontazh", topic: "Шиномонтаж: як обрати сервіс та на що звернути увагу" },
  { slug: "vidnovleni-shyny", topic: "Відновлені шини: переваги, ризики та коли це варто" },
  { slug: "yizda-z-prychepom", topic: "Як їздити з причепом: вплив на шини та безпеку" },
  { slug: "podorozh-na-avto", topic: "Подорож на авто: підготовка шин до далекої поїздки" },
];

function planEvergreenTipsArticles(): PlannedArticle[] {
  const planned: PlannedArticle[] = [];
  const year = new Date().getFullYear();

  // Shuffle pool for variety
  const shuffled = [...EVERGREEN_TIPS_TOPICS].sort(() => Math.random() - 0.5);

  for (const item of shuffled) {
    const dedupeKey = `tips-${item.slug}-${year}`;

    if (queueHasSimilarTopic("tips", "seasonal", dedupeKey)) {
      continue;
    }

    planned.push({
      topic: item.topic,
      articleType: "tips",
      triggerType: "seasonal",
      triggerData: {
        dedupeKey,
        topicSlug: item.slug,
      },
      priority: 7,
      reason: `Evergreen tips: ${item.slug}`,
      dedupeKey,
    });

    // Take only first available
    break;
  }

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
    case "oeamtc":
      return "ÖAMTC";
    case "tcs":
      return "TCS";
    case "gtue":
      return "GTÜ";
    case "bridgestone-news":
      return "Bridgestone";
    default:
      return source;
  }
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
