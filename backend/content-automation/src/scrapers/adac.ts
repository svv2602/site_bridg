/**
 * ADAC Test Results Scraper
 *
 * Scrapes tyre test results from adac.de
 * Note: ADAC uses German ratings (sehr gut, gut, befriedigend, etc.)
 */

import type { Page } from "playwright";
import { type TestResult, type TestResultEntry, saveTestResult, testResultExists } from "../db/test-results.js";

// ADAC rating mapping (German → numeric)
const RATING_MAP: Record<string, number> = {
  "sehr gut": 1.0,
  "gut": 2.0,
  "befriedigend": 3.0,
  "ausreichend": 4.0,
  "mangelhaft": 5.0,
};

// Test type mapping
const TEST_TYPE_MAP: Record<string, TestResult["testType"]> = {
  sommerreifen: "summer",
  winterreifen: "winter",
  ganzjahresreifen: "allseason",
};

// Base URLs for ADAC tests
const ADAC_BASE_URL = "https://www.adac.de/rund-ums-fahrzeug/tests/reifen";

// Known test pages structure
const KNOWN_TEST_PATHS = [
  { type: "summer", path: "sommerreifen" },
  { type: "winter", path: "winterreifen" },
  { type: "allseason", path: "ganzjahresreifen" },
];

// Common tested sizes
const COMMON_SIZES = [
  "205-55-r16",
  "225-45-r17",
  "225-50-r17",
  "235-55-r17",
  "225-45-r18",
];

export interface ADACScraperResult {
  success: boolean;
  testsFound: number;
  testsNew: number;
  errors: string[];
}

/**
 * Parse ADAC rating to numeric value
 */
function parseRating(ratingText: string): { rating: string; ratingNumeric: number } {
  const normalized = ratingText.toLowerCase().trim();

  for (const [key, value] of Object.entries(RATING_MAP)) {
    if (normalized.includes(key)) {
      return { rating: key, ratingNumeric: value };
    }
  }

  // Try to extract numeric rating (e.g., "2.1")
  const numericMatch = ratingText.match(/(\d+[.,]\d+)/);
  if (numericMatch) {
    const numeric = parseFloat(numericMatch[1].replace(",", "."));
    return { rating: ratingText, ratingNumeric: numeric };
  }

  return { rating: ratingText, ratingNumeric: 0 };
}

/**
 * Parse test type from URL
 */
function parseTestType(url: string): TestResult["testType"] {
  for (const [key, value] of Object.entries(TEST_TYPE_MAP)) {
    if (url.includes(key)) {
      return value;
    }
  }
  return "summer";
}

/**
 * Parse size from URL
 */
function parseSizeFromUrl(url: string): string {
  // Match patterns like "205-55-r16" or "205-55-16"
  const sizeMatch = url.match(/(\d{3})-(\d{2,3})-r?(\d{2})/i);
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
 * Scrape single ADAC test page
 */
export async function scrapeADACTestPage(page: Page, url: string): Promise<TestResult | null> {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Extract year from page or URL
    const yearMatch = url.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

    // Extract test type
    const testType = parseTestType(url);

    // Extract size
    const testedSize = parseSizeFromUrl(url);

    // Generate UID
    const testUid = generateTestUid("adac", testType, year, testedSize);

    // Check if already exists
    if (testResultExists(testUid)) {
      console.log(`Test ${testUid} already exists, skipping`);
      return null;
    }

    // Try to find results table
    const results: TestResultEntry[] = [];

    // Look for common ADAC result patterns
    // Note: ADAC structure may vary, this is a best-effort approach
    const rows = await page.$$("table tr, .test-result, .reifen-ergebnis");

    let position = 0;
    for (const row of rows) {
      try {
        const text = await row.textContent();
        if (!text) continue;

        // Look for tyre brand names
        const tyreNameMatch = text.match(/(Bridgestone|Continental|Michelin|Goodyear|Pirelli|Dunlop|Hankook|Nokian|Vredestein|Falken|Kumho|Toyo|Yokohama|BFGoodrich)\s+[\w\s\-]+/i);

        if (tyreNameMatch) {
          position++;
          const tireName = tyreNameMatch[0].trim();
          const { rating, ratingNumeric } = parseRating(text);

          // Look for category wins
          const categoryWins: string[] = [];
          if (text.toLowerCase().includes("testsieger")) categoryWins.push("Testsieger");
          if (text.toLowerCase().includes("empfehlung")) categoryWins.push("Empfehlung");
          if (text.toLowerCase().includes("preis-leistung")) categoryWins.push("Preis-Leistung");

          results.push({
            tireName,
            position,
            rating,
            ratingNumeric,
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
      source: "adac",
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
 * Discover ADAC test URLs
 */
export async function discoverADACTests(page: Page): Promise<string[]> {
  const urls: string[] = [];

  try {
    // Go to main test page
    await page.goto(`${ADAC_BASE_URL}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Find test links
    const links = await page.$$eval(
      'a[href*="/tests/reifen/"]',
      (elements) => elements.map((e) => e.getAttribute("href")).filter(Boolean)
    );

    for (const link of links) {
      if (link && !urls.includes(link)) {
        const fullUrl = link.startsWith("http") ? link : `https://www.adac.de${link}`;
        urls.push(fullUrl);
      }
    }

    console.log(`Discovered ${urls.length} ADAC test URLs`);
  } catch (error) {
    console.error("Failed to discover ADAC tests:", error);
  }

  return urls;
}

/**
 * Main ADAC scraper function
 */
export async function scrapeADAC(page: Page): Promise<ADACScraperResult> {
  const result: ADACScraperResult = {
    success: false,
    testsFound: 0,
    testsNew: 0,
    errors: [],
  };

  try {
    console.log("Starting ADAC scraper...");

    // Discover test URLs
    const urls = await discoverADACTests(page);

    if (urls.length === 0) {
      // Use fallback URLs
      const currentYear = new Date().getFullYear();
      for (const testPath of KNOWN_TEST_PATHS) {
        for (const size of COMMON_SIZES) {
          urls.push(`${ADAC_BASE_URL}/${testPath.path}/${size}/`);
        }
      }
    }

    result.testsFound = urls.length;

    // Scrape each URL
    for (const url of urls) {
      try {
        const testResult = await scrapeADACTestPage(page, url);

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

  console.log(`ADAC scraper complete: ${result.testsNew} new tests`);
  return result;
}

// CLI test
async function main() {
  console.log("ADAC Scraper Module");
  console.log("==================");
  console.log("\nTo run the scraper, use:");
  console.log("  npx tsx src/scrapers/adac.ts");
  console.log("\nNote: Requires Playwright browser instance.");
  console.log("\nExample usage in code:");
  console.log(`
  import { chromium } from 'playwright';
  import { scrapeADAC } from './scrapers/adac.js';

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const result = await scrapeADAC(page);
  await browser.close();
  `);
}

main();
