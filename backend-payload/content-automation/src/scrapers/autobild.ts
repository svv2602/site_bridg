/**
 * Auto Bild Test Results Scraper
 *
 * Scrapes tyre test results from autobild.de
 * Note: Auto Bild uses German ratings and has a different structure than ADAC
 */

import type { Page } from "playwright";
import { type TestResult, type TestResultEntry, saveTestResult, testResultExists } from "../db/test-results.js";

// Auto Bild rating mapping
const RATING_MAP: Record<string, number> = {
  "vorbildlich": 1.0,
  "sehr empfehlenswert": 1.5,
  "empfehlenswert": 2.0,
  "bedingt empfehlenswert": 3.0,
  "nicht empfehlenswert": 4.0,
};

// Base URL
const AUTOBILD_BASE_URL = "https://www.autobild.de/tests/reifen";

// Test categories
const TEST_CATEGORIES = [
  { type: "summer", path: "sommerreifentest" },
  { type: "winter", path: "winterreifentest" },
  { type: "allseason", path: "ganzjahresreifentest" },
];

export interface AutoBildScraperResult {
  success: boolean;
  testsFound: number;
  testsNew: number;
  errors: string[];
}

/**
 * Parse Auto Bild rating to numeric value
 */
function parseRating(ratingText: string): { rating: string; ratingNumeric: number } {
  const normalized = ratingText.toLowerCase().trim();

  for (const [key, value] of Object.entries(RATING_MAP)) {
    if (normalized.includes(key)) {
      return { rating: key, ratingNumeric: value };
    }
  }

  // Try to extract position-based rating
  const positionMatch = ratingText.match(/platz\s*(\d+)/i);
  if (positionMatch) {
    const position = parseInt(positionMatch[1]);
    // Approximate rating based on position
    const rating = Math.min(1.0 + (position - 1) * 0.2, 5.0);
    return { rating: ratingText, ratingNumeric: rating };
  }

  return { rating: ratingText, ratingNumeric: 0 };
}

/**
 * Parse test type from URL
 */
function parseTestType(url: string): TestResult["testType"] {
  if (url.includes("sommer")) return "summer";
  if (url.includes("winter")) return "winter";
  if (url.includes("ganzjahres") || url.includes("allseason")) return "allseason";
  return "summer";
}

/**
 * Parse size from text or URL
 */
function parseSizeFromText(text: string): string {
  // Match patterns like "205/55 R 16" or "225/45R17"
  const sizeMatch = text.match(/(\d{3})\/(\d{2,3})\s*R\s*(\d{2})/i);
  if (sizeMatch) {
    return `${sizeMatch[1]}/${sizeMatch[2]} R${sizeMatch[3]}`;
  }
  return "Unknown";
}

/**
 * Generate test UID
 */
function generateTestUid(source: string, testType: string, year: number, size: string): string {
  const sizeNormalized = size.toLowerCase().replace(/[\/\s]/g, "-").replace("r", "");
  return `${source}-${testType}-${year}-${sizeNormalized}`;
}

/**
 * Scrape single Auto Bild test page
 */
export async function scrapeAutoBildTestPage(page: Page, url: string): Promise<TestResult | null> {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Extract year from URL or page content
    let year = new Date().getFullYear();
    const yearMatch = url.match(/(\d{4})/);
    if (yearMatch) {
      year = parseInt(yearMatch[1]);
    } else {
      // Try to find year in page title
      const title = await page.title();
      const titleYearMatch = title.match(/(\d{4})/);
      if (titleYearMatch) {
        year = parseInt(titleYearMatch[1]);
      }
    }

    // Extract test type
    const testType = parseTestType(url);

    // Try to find size in page
    const pageContent = await page.content();
    const testedSize = parseSizeFromText(pageContent);

    // Generate UID
    const testUid = generateTestUid("autobild", testType, year, testedSize);

    // Check if already exists
    if (testResultExists(testUid)) {
      console.log(`Test ${testUid} already exists, skipping`);
      return null;
    }

    // Try to find results
    const results: TestResultEntry[] = [];

    // Look for result elements (Auto Bild uses various structures)
    const resultElements = await page.$$(
      ".test-result, .ranking-item, [class*='ergebnis'], table tbody tr"
    );

    let position = 0;
    for (const element of resultElements) {
      try {
        const text = await element.textContent();
        if (!text) continue;

        // Look for tyre brand names
        const tyreNameMatch = text.match(
          /(Bridgestone|Continental|Michelin|Goodyear|Pirelli|Dunlop|Hankook|Nokian|Vredestein|Falken|Kumho|Toyo|Yokohama|BFGoodrich)\s+[\w\s\-]+/i
        );

        if (tyreNameMatch) {
          position++;
          const tireName = tyreNameMatch[0].trim();
          const { rating, ratingNumeric } = parseRating(text);

          // Look for category wins
          const categoryWins: string[] = [];
          if (text.toLowerCase().includes("testsieger")) categoryWins.push("Testsieger");
          if (text.toLowerCase().includes("preis-tipp")) categoryWins.push("Preis-Tipp");
          if (text.toLowerCase().includes("eco-meister")) categoryWins.push("Eco-Meister");

          results.push({
            tireName,
            position,
            rating,
            ratingNumeric,
            categoryWins: categoryWins.length > 0 ? categoryWins : undefined,
          });
        }
      } catch (e) {
        // Skip element on error
      }
    }

    if (results.length === 0) {
      console.log(`No results found on ${url}`);
      return null;
    }

    const testResult: TestResult = {
      testUid,
      source: "autobild",
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
 * Discover Auto Bild test URLs
 */
export async function discoverAutoBildTests(page: Page): Promise<string[]> {
  const urls: string[] = [];

  try {
    // Go to main test page
    await page.goto(AUTOBILD_BASE_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Find test links
    const links = await page.$$eval(
      'a[href*="reifentest"], a[href*="reifen-test"]',
      (elements) => elements.map((e) => e.getAttribute("href")).filter(Boolean)
    );

    for (const link of links) {
      if (link && !urls.includes(link)) {
        const fullUrl = link.startsWith("http") ? link : `https://www.autobild.de${link}`;
        urls.push(fullUrl);
      }
    }

    console.log(`Discovered ${urls.length} Auto Bild test URLs`);
  } catch (error) {
    console.error("Failed to discover Auto Bild tests:", error);
  }

  return urls;
}

/**
 * Main Auto Bild scraper function
 */
export async function scrapeAutoBild(page: Page): Promise<AutoBildScraperResult> {
  const result: AutoBildScraperResult = {
    success: false,
    testsFound: 0,
    testsNew: 0,
    errors: [],
  };

  try {
    console.log("Starting Auto Bild scraper...");

    // Discover test URLs
    const urls = await discoverAutoBildTests(page);
    result.testsFound = urls.length;

    // Scrape each URL
    for (const url of urls) {
      try {
        const testResult = await scrapeAutoBildTestPage(page, url);

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
      await page.waitForTimeout(1000);
    }

    result.success = true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMsg);
  }

  console.log(`Auto Bild scraper complete: ${result.testsNew} new tests`);
  return result;
}

// CLI test
async function main() {
  console.log("Auto Bild Scraper Module");
  console.log("========================");
  console.log("\nTo run the scraper, use:");
  console.log("  npx tsx src/scrapers/autobild.ts");
  console.log("\nNote: Requires Playwright browser instance.");
  console.log("\nExample usage in code:");
  console.log(`
  import { chromium } from 'playwright';
  import { scrapeAutoBild } from './scrapers/autobild.js';

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const result = await scrapeAutoBild(page);
  await browser.close();
  `);
}

main();
