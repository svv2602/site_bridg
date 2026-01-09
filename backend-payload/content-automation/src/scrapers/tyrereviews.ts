/**
 * Tyre Reviews Aggregator Scraper
 *
 * Scrapes tyre test results from tyrereviews.com
 * This is an English-language aggregator that collects test results
 * from multiple sources (ADAC, Auto Bild, TCS, etc.)
 */

import type { Page } from "playwright";
import { type TestResult, type TestResultEntry, saveTestResult, testResultExists } from "../db/test-results.js";

// Base URL
const TYREREVIEWS_BASE_URL = "https://www.tyrereviews.com";

// Test categories
const TEST_CATEGORIES = [
  { type: "summer", path: "tyre-tests/summer" },
  { type: "winter", path: "tyre-tests/winter" },
  { type: "allseason", path: "tyre-tests/all-season" },
];

export interface TyreReviewsScraperResult {
  success: boolean;
  testsFound: number;
  testsNew: number;
  errors: string[];
}

/**
 * Parse position to numeric rating
 */
function positionToRating(position: number, totalTyres: number): number {
  // Approximate rating based on position (1st = 1.0, last = 4.0)
  if (totalTyres <= 1) return 2.0;
  return 1.0 + ((position - 1) / (totalTyres - 1)) * 3.0;
}

/**
 * Parse test type from URL
 */
function parseTestType(url: string): TestResult["testType"] {
  if (url.includes("summer")) return "summer";
  if (url.includes("winter")) return "winter";
  if (url.includes("all-season") || url.includes("allseason")) return "allseason";
  return "summer";
}

/**
 * Parse size from text
 */
function parseSizeFromText(text: string): string {
  // Match patterns like "205/55 R16", "225/45R17", "255/55 R 18"
  const sizeMatch = text.match(/(\d{3})\/(\d{2,3})\s*R\s*(\d{2})/i);
  if (sizeMatch) {
    return `${sizeMatch[1]}/${sizeMatch[2]} R${sizeMatch[3]}`;
  }
  return "Unknown";
}

/**
 * Generate test UID
 */
function generateTestUid(originalSource: string, testType: string, year: number, size: string): string {
  const sizeNormalized = size.toLowerCase().replace(/[\/\s]/g, "-").replace("r", "");
  return `tyrereviews-${originalSource.toLowerCase()}-${testType}-${year}-${sizeNormalized}`;
}

/**
 * Scrape single test page from TyreReviews
 */
export async function scrapeTyreReviewsTestPage(page: Page, url: string): Promise<TestResult | null> {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    // Extract test info from page
    const title = await page.title();

    // Try to extract year
    let year = new Date().getFullYear();
    const yearMatch = title.match(/(\d{4})/);
    if (yearMatch) {
      year = parseInt(yearMatch[1]);
    }

    // Extract test type
    const testType = parseTestType(url);

    // Try to find the original source (ADAC, Auto Bild, etc.)
    const pageContent = await page.content();
    let originalSource = "unknown";
    if (pageContent.toLowerCase().includes("adac")) originalSource = "adac";
    else if (pageContent.toLowerCase().includes("auto bild")) originalSource = "autobild";
    else if (pageContent.toLowerCase().includes("tcs")) originalSource = "tcs";
    else if (pageContent.toLowerCase().includes("ace")) originalSource = "ace";

    // Extract size
    const testedSize = parseSizeFromText(pageContent);

    // Generate UID
    const testUid = generateTestUid(originalSource, testType, year, testedSize);

    // Check if already exists
    if (testResultExists(testUid)) {
      console.log(`Test ${testUid} already exists, skipping`);
      return null;
    }

    // Find results in the page
    const results: TestResultEntry[] = [];

    // TyreReviews typically has a results table
    const rows = await page.$$("table tbody tr, .test-result, .ranking-row");

    let position = 0;
    for (const row of rows) {
      try {
        const text = await row.textContent();
        if (!text) continue;

        // Look for tyre brand names
        const tyreNameMatch = text.match(
          /(Bridgestone|Continental|Michelin|Goodyear|Pirelli|Dunlop|Hankook|Nokian|Vredestein|Falken|Kumho|Toyo|Yokohama|BFGoodrich|Firestone|Cooper|GT Radial|Nexen|Maxxis)\s+[\w\s\-]+/i
        );

        if (tyreNameMatch) {
          position++;
          const tireName = tyreNameMatch[0].trim();

          // Try to extract rating (could be percentage, grade, or number)
          let rating = "N/A";
          let ratingNumeric = 0;

          const percentMatch = text.match(/(\d+)\s*%/);
          const scoreMatch = text.match(/(\d+\.?\d*)\s*\/\s*(\d+)/);
          const gradeMatch = text.match(/\b([A-E][\+\-]?)\b/);

          if (percentMatch) {
            const percent = parseInt(percentMatch[1]);
            ratingNumeric = (100 - percent) / 20 + 1; // Convert 100% → 1.0, 0% → 6.0
            rating = `${percent}%`;
          } else if (scoreMatch) {
            const score = parseFloat(scoreMatch[1]);
            const max = parseFloat(scoreMatch[2]);
            ratingNumeric = ((max - score) / max) * 4 + 1;
            rating = `${score}/${max}`;
          } else if (gradeMatch) {
            const gradeMap: Record<string, number> = {
              "A+": 1.0, "A": 1.3, "A-": 1.7,
              "B+": 2.0, "B": 2.3, "B-": 2.7,
              "C+": 3.0, "C": 3.3, "C-": 3.7,
              "D+": 4.0, "D": 4.3, "D-": 4.7,
              "E": 5.0,
            };
            rating = gradeMatch[1];
            ratingNumeric = gradeMap[rating] || 3.0;
          }

          // Look for wins/recommendations
          const categoryWins: string[] = [];
          const textLower = text.toLowerCase();
          if (textLower.includes("recommended")) categoryWins.push("Recommended");
          if (textLower.includes("winner") || textLower.includes("1st")) categoryWins.push("Test Winner");
          if (textLower.includes("best buy")) categoryWins.push("Best Buy");
          if (textLower.includes("eco")) categoryWins.push("Eco Choice");

          results.push({
            tireName,
            position,
            rating,
            ratingNumeric: ratingNumeric || positionToRating(position, 10),
            categoryWins: categoryWins.length > 0 ? categoryWins : undefined,
          });
        }
      } catch (e) {
        // Skip row on error
      }
    }

    if (results.length === 0) {
      console.log(`No results found on ${url}`);
      return null;
    }

    const testResult: TestResult = {
      testUid,
      source: "tyrereviews",
      testType,
      year,
      testedSize,
      sourceUrl: url,
      results,
      scrapedAt: new Date().toISOString(),
    };

    return testResult;
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return null;
  }
}

/**
 * Discover test URLs from TyreReviews
 */
export async function discoverTyreReviewsTests(page: Page, testType?: TestResult["testType"]): Promise<string[]> {
  const urls: string[] = [];

  try {
    const categories = testType
      ? TEST_CATEGORIES.filter((c) => c.type === testType)
      : TEST_CATEGORIES;

    for (const category of categories) {
      const categoryUrl = `${TYREREVIEWS_BASE_URL}/${category.path}`;
      await page.goto(categoryUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      // Find test links
      const links = await page.$$eval(
        'a[href*="tyre-test"], a[href*="/test/"]',
        (elements) => elements.map((e) => e.getAttribute("href")).filter(Boolean)
      );

      for (const link of links) {
        if (link && !urls.includes(link)) {
          const fullUrl = link.startsWith("http") ? link : `${TYREREVIEWS_BASE_URL}${link}`;
          urls.push(fullUrl);
        }
      }
    }

    console.log(`Discovered ${urls.length} TyreReviews test URLs`);
  } catch (error) {
    console.error("Failed to discover TyreReviews tests:", error);
  }

  return urls;
}

/**
 * Main TyreReviews scraper function
 */
export async function scrapeTyreReviews(page: Page, testType?: TestResult["testType"]): Promise<TyreReviewsScraperResult> {
  const result: TyreReviewsScraperResult = {
    success: false,
    testsFound: 0,
    testsNew: 0,
    errors: [],
  };

  try {
    console.log("Starting TyreReviews scraper...");

    // Discover test URLs
    const urls = await discoverTyreReviewsTests(page, testType);
    result.testsFound = urls.length;

    // Scrape each URL
    for (const url of urls) {
      try {
        const testResult = await scrapeTyreReviewsTestPage(page, url);

        if (testResult) {
          const saved = saveTestResult(testResult);
          if (saved) {
            result.testsNew++;
            console.log(`Saved: ${testResult.testUid} (${testResult.results.length} tyres)`);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`${url}: ${errorMsg}`);
      }

      // Rate limiting
      await page.waitForTimeout(1500);
    }

    result.success = true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMsg);
  }

  console.log(`TyreReviews scraper complete: ${result.testsNew} new tests`);
  return result;
}

/**
 * Search for specific tyre tests on TyreReviews
 */
export async function searchTyreTests(page: Page, tyreName: string): Promise<string[]> {
  const urls: string[] = [];

  try {
    const searchUrl = `${TYREREVIEWS_BASE_URL}/search?q=${encodeURIComponent(tyreName)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Find test links in search results
    const links = await page.$$eval(
      'a[href*="test"]',
      (elements) => elements.map((e) => e.getAttribute("href")).filter(Boolean)
    );

    for (const link of links) {
      if (link && link.includes("test") && !urls.includes(link)) {
        const fullUrl = link.startsWith("http") ? link : `${TYREREVIEWS_BASE_URL}${link}`;
        urls.push(fullUrl);
      }
    }

    console.log(`Found ${urls.length} tests for "${tyreName}"`);
  } catch (error) {
    console.error(`Failed to search for ${tyreName}:`, error);
  }

  return urls;
}

// CLI test
async function main() {
  console.log("TyreReviews Aggregator Scraper");
  console.log("==============================");
  console.log("\nTo run the scraper, use:");
  console.log("  npx tsx src/scrapers/tyrereviews.ts");
  console.log("\nNote: Requires Playwright browser instance.");
  console.log("\nExample usage in code:");
  console.log(`
  import { chromium } from 'playwright';
  import { scrapeTyreReviews, searchTyreTests } from './scrapers/tyrereviews.js';

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Scrape all tests
  const result = await scrapeTyreReviews(page);

  // Or search for specific tyre
  const urls = await searchTyreTests(page, 'Bridgestone Turanza');

  await browser.close();
  `);
}

main();
