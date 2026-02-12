/**
 * Scrapers Index
 *
 * Unified interface for all scraping functionality.
 * Supports multi-brand (Bridgestone & Firestone).
 */

import type { Brand } from "../types/content.js";

// ProKoleso scraper
export {
  scrapeProkoleso,
  scrapeProkolesoBrand,
  mergeAndSaveResults,
  loadExistingData,
  findTireUrlsByBrand,
} from "./prokoleso.js";

// Scraper types (canonical source)
export { type ScrapedTire, type ScrapedTireSize } from "./types.js";

// Test results scrapers
export { scrapeADAC, type ADACScraperResult } from "./adac.js";
export { scrapeAutoBild, type AutoBildScraperResult } from "./autobild.js";
export { scrapeTyreReviews, type TyreReviewsScraperResult, searchTyreTests } from "./tyrereviews.js";
export { scrapeOEAMTC, type OEAMTCScraperResult } from "./oeamtc.js";
export { scrapeTCS, type TCSScraperResult } from "./tcs.js";
export { scrapeGTUE, type GTUEScraperResult } from "./gtue.js";
export { scrapeBridgestoneNews, type BridgestoneNewsScraperResult } from "./bridgestone-news.js";

// Test results database
export {
  getDatabase,
  saveTestResult,
  getTestResult,
  getTestResultsBySource,
  getTestResultsByYear,
  findTestResultsForTyre,
  getRecentTestResults,
  closeDatabase,
  type TestResult,
  type TestResultEntry,
} from "../db/test-results.js";

import type { Page } from "playwright";
import { scrapeADAC, type ADACScraperResult } from "./adac.js";
import { scrapeAutoBild, type AutoBildScraperResult } from "./autobild.js";
import { scrapeTyreReviews, type TyreReviewsScraperResult } from "./tyrereviews.js";
import { scrapeOEAMTC, type OEAMTCScraperResult } from "./oeamtc.js";
import { scrapeTCS, type TCSScraperResult } from "./tcs.js";
import { scrapeGTUE, type GTUEScraperResult } from "./gtue.js";
import type { TestResult } from "../db/test-results.js";

export interface AllScrapersResult {
  adac: ADACScraperResult | null;
  autobild: AutoBildScraperResult | null;
  tyrereviews: TyreReviewsScraperResult | null;
  oeamtc: OEAMTCScraperResult | null;
  tcs: TCSScraperResult | null;
  gtue: GTUEScraperResult | null;
  totalTestsFound: number;
  totalTestsNew: number;
  totalErrors: number;
  duration: number;
}

export type ScraperSource = "adac" | "autobild" | "tyrereviews" | "oeamtc" | "tcs" | "gtue";

/**
 * Run all test scrapers
 */
export async function scrapeAllTestSources(
  page: Page,
  sources?: ScraperSource[]
): Promise<AllScrapersResult> {
  const startTime = Date.now();
  const result: AllScrapersResult = {
    adac: null,
    autobild: null,
    tyrereviews: null,
    oeamtc: null,
    tcs: null,
    gtue: null,
    totalTestsFound: 0,
    totalTestsNew: 0,
    totalErrors: 0,
    duration: 0,
  };

  const sourcesToScrape = sources || ["adac", "autobild", "tyrereviews", "oeamtc", "tcs", "gtue"];
  const total = sourcesToScrape.length;

  console.log("=".repeat(50));
  console.log("Starting test results scrapers...");
  console.log(`Sources: ${sourcesToScrape.join(", ")}`);
  console.log("=".repeat(50));

  // Helper to run a single scraper
  async function runSource(
    key: ScraperSource,
    index: number,
    fn: () => Promise<{ success: boolean; testsFound: number; testsNew: number; errors: string[] }>
  ) {
    console.log(`\n[${index + 1}/${total}] Scraping ${key}...`);
    try {
      const r = await fn();
      (result as Record<string, unknown>)[key] = r;
      result.totalTestsFound += r.testsFound;
      result.totalTestsNew += r.testsNew;
      result.totalErrors += r.errors.length;
    } catch (error) {
      console.error(`${key} scraper failed:`, error);
      (result as Record<string, unknown>)[key] = {
        success: false,
        testsFound: 0,
        testsNew: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
      result.totalErrors++;
    }
  }

  const scraperFns: Record<ScraperSource, () => Promise<{ success: boolean; testsFound: number; testsNew: number; errors: string[] }>> = {
    adac: () => scrapeADAC(page),
    autobild: () => scrapeAutoBild(page),
    tyrereviews: () => scrapeTyreReviews(page),
    oeamtc: () => scrapeOEAMTC(page),
    tcs: () => scrapeTCS(page),
    gtue: () => scrapeGTUE(page),
  };

  let idx = 0;
  for (const source of sourcesToScrape) {
    if (scraperFns[source]) {
      await runSource(source, idx, scraperFns[source]);
    }
    idx++;
  }

  result.duration = Math.round((Date.now() - startTime) / 1000);

  console.log("\n" + "=".repeat(50));
  console.log("Scraping complete!");
  console.log(`Duration: ${result.duration}s`);
  console.log(`Tests found: ${result.totalTestsFound}`);
  console.log(`New tests: ${result.totalTestsNew}`);
  console.log(`Errors: ${result.totalErrors}`);
  console.log("=".repeat(50));

  return result;
}

/**
 * Get results for a specific brand from test results
 */
export function filterResultsByBrand(
  testResults: TestResult[],
  brand: Brand
): TestResult[] {
  return testResults.filter((result) =>
    result.results.some((r) =>
      r.tireName.toLowerCase().includes(brand)
    )
  );
}

/**
 * Get Bridgestone results from test results (legacy function)
 */
export function filterBridgestoneResults(
  testResults: TestResult[]
): TestResult[] {
  return filterResultsByBrand(testResults, "bridgestone");
}

/**
 * Get Firestone results from test results
 */
export function filterFirestoneResults(
  testResults: TestResult[]
): TestResult[] {
  return filterResultsByBrand(testResults, "firestone");
}

/**
 * Get winning results for a specific brand (top 3 positions)
 */
export function getWinsByBrand(
  testResults: TestResult[],
  brand: Brand
): Array<{ test: TestResult; entry: TestResult["results"][0] }> {
  const wins: Array<{ test: TestResult; entry: TestResult["results"][0] }> = [];

  for (const result of testResults) {
    for (const entry of result.results) {
      if (
        entry.tireName.toLowerCase().includes(brand) &&
        entry.position <= 3
      ) {
        wins.push({ test: result, entry });
      }
    }
  }

  return wins.sort((a, b) => a.entry.position - b.entry.position);
}

/**
 * Get winning Bridgestone results (top 3 positions) - legacy function
 */
export function getBridgestoneWins(
  testResults: TestResult[]
): Array<{ test: TestResult; entry: TestResult["results"][0] }> {
  return getWinsByBrand(testResults, "bridgestone");
}

/**
 * Get winning Firestone results (top 3 positions)
 */
export function getFirestoneWins(
  testResults: TestResult[]
): Array<{ test: TestResult; entry: TestResult["results"][0] }> {
  return getWinsByBrand(testResults, "firestone");
}
