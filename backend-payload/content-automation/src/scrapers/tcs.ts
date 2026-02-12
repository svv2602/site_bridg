/**
 * TCS Test Results Scraper
 *
 * Scrapes tyre test results from tcs.ch (Touring Club Schweiz)
 * Rating: Tier-based (4 levels) — converted to numeric via mapTierToRating
 */

import type { Page } from "playwright";
import { type TestResult, type TestResultEntry, saveTestResult, testResultExists } from "../db/test-results.js";
import { mapTierToRating } from "./parsers.js";

const BASE_URL = "https://www.tcs.ch/de/testberichte-ratgeber/tests/reifentests/";

const TEST_TYPE_MAP: Record<string, TestResult["testType"]> = {
  sommerreifen: "summer",
  winterreifen: "winter",
  ganzjahresreifen: "allseason",
  sommer: "summer",
  winter: "winter",
};

export interface TCSScraperResult {
  success: boolean;
  testsFound: number;
  testsNew: number;
  errors: string[];
}

/**
 * Parse test type from URL or title text
 */
function parseTestType(text: string): TestResult["testType"] {
  const lower = text.toLowerCase();
  for (const [key, value] of Object.entries(TEST_TYPE_MAP)) {
    if (lower.includes(key)) return value;
  }
  return "summer";
}

/**
 * Extract year from text/URL
 */
function extractYear(text: string): number {
  const match = text.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : new Date().getFullYear();
}

/**
 * Extract size from text
 */
function extractSize(text: string): string {
  const match = text.match(/(\d{3})\/(\d{2,3})\s*R\s*(\d{2})/);
  if (match) return `${match[1]}/${match[2]} R${match[3]}`;

  // Try URL-style: 205-55-r16
  const urlMatch = text.match(/(\d{3})-(\d{2,3})-r(\d{2})/i);
  if (urlMatch) return `${urlMatch[1]}/${urlMatch[2]} R${urlMatch[3]}`;

  return "Unknown";
}

/**
 * Generate unique test ID
 */
function generateTestUid(testType: string, year: number, size: string): string {
  const sizeNormalized = size.toLowerCase().replace(/[\/\s]/g, "-").replace("r", "");
  return `tcs-${testType}-${year}-${sizeNormalized}`;
}

/**
 * Discover test page URLs from TCS
 */
async function discoverTestUrls(page: Page): Promise<string[]> {
  const urls: string[] = [];

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const links = await page.$$eval(
      'a[href*="reifentest"]',
      (elements) => elements.map((e) => e.getAttribute("href")).filter(Boolean)
    );

    for (const link of links) {
      if (!link) continue;
      // Match test pages with year
      if (/reifentest.*\d{4}/i.test(link) || /\d{4}.*reifen/i.test(link)) {
        const fullUrl = link.startsWith("http") ? link : `https://www.tcs.ch${link}`;
        if (!urls.includes(fullUrl)) urls.push(fullUrl);
      }
    }

    console.log(`[TCS] Discovered ${urls.length} test URLs`);
  } catch (error) {
    console.error("[TCS] Discovery failed:", error);
  }

  return urls;
}

/**
 * Scrape a single TCS test page
 */
async function scrapeTestPage(page: Page, url: string): Promise<TestResult | null> {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const pageText = await page.textContent("body") || "";
    const title = await page.title();
    const combinedText = `${url} ${title} ${pageText.slice(0, 500)}`;

    const testType = parseTestType(combinedText);
    const year = extractYear(combinedText);
    const size = extractSize(combinedText);
    const testUid = generateTestUid(testType, year, size);

    if (testResultExists(testUid)) {
      console.log(`[TCS] ${testUid} already exists, skipping`);
      return null;
    }

    const results: TestResultEntry[] = [];

    // TCS uses result tables with recommendation tiers
    const rows = await page.$$("table tbody tr, .result-row, .test-result");

    let position = 0;
    for (const row of rows) {
      try {
        const text = await row.textContent();
        if (!text) continue;

        // Look for tyre brand names
        const tyreNameMatch = text.match(
          /(Bridgestone|Continental|Michelin|Goodyear|Pirelli|Dunlop|Hankook|Nokian|Vredestein|Falken|Kumho|Toyo|Yokohama|BFGoodrich|Firestone|Dayton|Semperit|Uniroyal|Maxxis|Nexen)\s+[\w\s\-\.]+/i
        );

        if (!tyreNameMatch) continue;

        position++;
        const tireName = tyreNameMatch[0].trim();

        // Extract tier rating
        const { rating, ratingNumeric } = mapTierToRating(text);

        results.push({
          tireName,
          position,
          rating,
          ratingNumeric,
        });
      } catch {
        // Skip row on error
      }
    }

    if (results.length === 0) {
      console.log(`[TCS] No results found on ${url}`);
      return null;
    }

    return {
      testUid,
      source: "tcs",
      testType,
      year,
      testedSize: size,
      sourceUrl: url,
      results,
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[TCS] Failed to scrape ${url}:`, error);
    return null;
  }
}

/**
 * Main TCS scraper function
 */
export async function scrapeTCS(page: Page): Promise<TCSScraperResult> {
  const result: TCSScraperResult = {
    success: false,
    testsFound: 0,
    testsNew: 0,
    errors: [],
  };

  try {
    console.log("[TCS] Starting scraper...");

    const urls = await discoverTestUrls(page);
    result.testsFound = urls.length;

    for (const url of urls) {
      try {
        const testResult = await scrapeTestPage(page, url);

        if (testResult) {
          const saved = saveTestResult(testResult);
          if (saved) {
            result.testsNew++;
            console.log(`[TCS] Saved: ${testResult.testUid} (${testResult.results.length} tyres)`);
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

  console.log(`[TCS] Scraper complete: ${result.testsNew} new tests`);
  return result;
}
