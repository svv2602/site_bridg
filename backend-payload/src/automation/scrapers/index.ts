/**
 * Scrapers Index
 *
 * Unified interface for all scraping functionality.
 */

// ProKoleso scraper
export { scrapeProkoleso, saveResults, type ScrapedTire, type ScrapedTireSize } from "./prokoleso.js";

// Test results scrapers
export { scrapeADAC, type ADACScraperResult } from "./adac.js";
export { scrapeAutoBild, type AutoBildScraperResult } from "./autobild.js";
export { scrapeTyreReviews, type TyreReviewsScraperResult, searchTyreTests } from "./tyrereviews.js";

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
import type { TestResult } from "../db/test-results.js";

export interface AllScrapersResult {
  adac: ADACScraperResult | null;
  autobild: AutoBildScraperResult | null;
  tyrereviews: TyreReviewsScraperResult | null;
  totalTestsFound: number;
  totalTestsNew: number;
  totalErrors: number;
  duration: number;
}

export type ScraperSource = "adac" | "autobild" | "tyrereviews";

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
    totalTestsFound: 0,
    totalTestsNew: 0,
    totalErrors: 0,
    duration: 0,
  };

  const sourcesToScrape = sources || ["adac", "autobild", "tyrereviews"];

  console.log("=".repeat(50));
  console.log("Starting test results scrapers...");
  console.log(`Sources: ${sourcesToScrape.join(", ")}`);
  console.log("=".repeat(50));

  // ADAC
  if (sourcesToScrape.includes("adac")) {
    console.log("\n[1/3] Scraping ADAC...");
    try {
      result.adac = await scrapeADAC(page);
      result.totalTestsFound += result.adac.testsFound;
      result.totalTestsNew += result.adac.testsNew;
      result.totalErrors += result.adac.errors.length;
    } catch (error) {
      console.error("ADAC scraper failed:", error);
      result.adac = {
        success: false,
        testsFound: 0,
        testsNew: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
      result.totalErrors++;
    }
  }

  // Auto Bild
  if (sourcesToScrape.includes("autobild")) {
    console.log("\n[2/3] Scraping Auto Bild...");
    try {
      result.autobild = await scrapeAutoBild(page);
      result.totalTestsFound += result.autobild.testsFound;
      result.totalTestsNew += result.autobild.testsNew;
      result.totalErrors += result.autobild.errors.length;
    } catch (error) {
      console.error("Auto Bild scraper failed:", error);
      result.autobild = {
        success: false,
        testsFound: 0,
        testsNew: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
      result.totalErrors++;
    }
  }

  // TyreReviews
  if (sourcesToScrape.includes("tyrereviews")) {
    console.log("\n[3/3] Scraping TyreReviews...");
    try {
      result.tyrereviews = await scrapeTyreReviews(page);
      result.totalTestsFound += result.tyrereviews.testsFound;
      result.totalTestsNew += result.tyrereviews.testsNew;
      result.totalErrors += result.tyrereviews.errors.length;
    } catch (error) {
      console.error("TyreReviews scraper failed:", error);
      result.tyrereviews = {
        success: false,
        testsFound: 0,
        testsNew: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
      result.totalErrors++;
    }
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
 * Get Bridgestone results from test results
 */
export function filterBridgestoneResults(
  testResults: TestResult[]
): TestResult[] {
  return testResults.filter((result) =>
    result.results.some((r) =>
      r.tireName.toLowerCase().includes("bridgestone")
    )
  );
}

/**
 * Get winning Bridgestone results (top 3 positions)
 */
export function getBridgestoneWins(
  testResults: TestResult[]
): Array<{ test: TestResult; entry: TestResult["results"][0] }> {
  const wins: Array<{ test: TestResult; entry: TestResult["results"][0] }> = [];

  for (const result of testResults) {
    for (const entry of result.results) {
      if (
        entry.tireName.toLowerCase().includes("bridgestone") &&
        entry.position <= 3
      ) {
        wins.push({ test: result, entry });
      }
    }
  }

  return wins.sort((a, b) => a.entry.position - b.entry.position);
}
