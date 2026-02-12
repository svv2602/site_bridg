/**
 * GTÜ Test Results Scraper
 *
 * Scrapes tyre test results from gtue.news/technik/
 * Tests are narrative-format articles — extracts tyre names + recommendation tiers.
 * Rating: Tier-based + points, converted via mapTierToRating
 */

import type { Page } from "playwright";
import { type TestResult, type TestResultEntry, saveTestResult, testResultExists } from "../db/test-results.js";
import { mapTierToRating } from "./parsers.js";

const BASE_URL = "https://www.gtue.news/technik/";

const TEST_TYPE_MAP: Record<string, TestResult["testType"]> = {
  sommerreifen: "summer",
  winterreifen: "winter",
  ganzjahresreifen: "allseason",
  sommer: "summer",
  winter: "winter",
};

// Known tyre brand names for pattern matching in narrative text
const KNOWN_BRANDS = [
  "Bridgestone", "Continental", "Michelin", "Goodyear", "Pirelli",
  "Dunlop", "Hankook", "Nokian", "Vredestein", "Falken",
  "Kumho", "Toyo", "Yokohama", "BFGoodrich", "Firestone",
  "Dayton", "Semperit", "Uniroyal", "Maxxis", "Nexen",
  "Cooper", "Sava", "Kleber", "Giti", "Nankang",
];

const BRANDS_PATTERN = new RegExp(
  `(${KNOWN_BRANDS.join("|")})\\s+[A-Z][\\w\\s\\-\\.]+?(?=\\s*(?:\\(|,|\\.|:|–|$))`,
  "gi"
);

export interface GTUEScraperResult {
  success: boolean;
  testsFound: number;
  testsNew: number;
  errors: string[];
}

/**
 * Parse test type from text
 */
function parseTestType(text: string): TestResult["testType"] {
  const lower = text.toLowerCase();
  for (const [key, value] of Object.entries(TEST_TYPE_MAP)) {
    if (lower.includes(key)) return value;
  }
  return "summer";
}

/**
 * Extract year from text
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
  return "Unknown";
}

/**
 * Generate unique test ID
 */
function generateTestUid(testType: string, year: number, size: string): string {
  const sizeNormalized = size.toLowerCase().replace(/[\/\s]/g, "-").replace("r", "");
  return `gtue-${testType}-${year}-${sizeNormalized}`;
}

/**
 * Discover GTÜ test article URLs
 */
async function discoverTestUrls(page: Page): Promise<string[]> {
  const urls: string[] = [];

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const links = await page.$$eval(
      "a[href]",
      (elements) => elements.map((e) => e.getAttribute("href")).filter(Boolean)
    );

    for (const link of links) {
      if (!link) continue;
      const lower = link.toLowerCase();
      // Match articles about tyre tests
      if (
        lower.includes("reifentest") ||
        lower.includes("winterreifen") ||
        lower.includes("sommerreifen") ||
        lower.includes("ganzjahresreifen")
      ) {
        const fullUrl = link.startsWith("http") ? link : `https://www.gtue.news${link}`;
        if (!urls.includes(fullUrl)) urls.push(fullUrl);
      }
    }

    console.log(`[GTÜ] Discovered ${urls.length} test article URLs`);
  } catch (error) {
    console.error("[GTÜ] Discovery failed:", error);
  }

  return urls;
}

/**
 * Extract tyre results from narrative article text
 */
function extractResultsFromText(bodyText: string): TestResultEntry[] {
  const results: TestResultEntry[] = [];
  const seen = new Set<string>();

  // Split into paragraphs/sentences for context
  const paragraphs = bodyText.split(/\n+/);
  let position = 0;

  for (const paragraph of paragraphs) {
    // Find brand+model names
    const matches = paragraph.matchAll(BRANDS_PATTERN);

    for (const match of matches) {
      const tireName = match[0].trim();
      const nameKey = tireName.toLowerCase();

      if (seen.has(nameKey)) continue;
      seen.add(nameKey);

      position++;

      // Look for rating context near the tyre mention
      const { rating, ratingNumeric } = mapTierToRating(paragraph);

      // Check for special mentions
      const categoryWins: string[] = [];
      const lowerPara = paragraph.toLowerCase();
      if (lowerPara.includes("testsieger")) categoryWins.push("Testsieger");
      if (lowerPara.includes("empfehlung")) categoryWins.push("Empfehlung");
      if (lowerPara.includes("preis-leistung") || lowerPara.includes("preistipp")) {
        categoryWins.push("Preis-Leistung");
      }

      results.push({
        tireName,
        position,
        rating,
        ratingNumeric,
        categoryWins: categoryWins.length > 0 ? categoryWins : undefined,
      });
    }
  }

  return results;
}

/**
 * Scrape a single GTÜ test article page
 */
async function scrapeTestPage(page: Page, url: string): Promise<TestResult | null> {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const title = await page.title();
    const bodyText = await page.textContent("article, .article-content, .entry-content, main") || "";
    const combinedMeta = `${url} ${title}`;

    const testType = parseTestType(combinedMeta);
    const year = extractYear(combinedMeta);
    const size = extractSize(bodyText || combinedMeta);
    const testUid = generateTestUid(testType, year, size);

    if (testResultExists(testUid)) {
      console.log(`[GTÜ] ${testUid} already exists, skipping`);
      return null;
    }

    // GTÜ articles are narrative: extract results from article body
    const results = extractResultsFromText(bodyText);

    if (results.length === 0) {
      console.log(`[GTÜ] No tyre results found in article: ${url}`);
      return null;
    }

    return {
      testUid,
      source: "gtue",
      testType,
      year,
      testedSize: size,
      sourceUrl: url,
      results,
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[GTÜ] Failed to scrape ${url}:`, error);
    return null;
  }
}

/**
 * Main GTÜ scraper function
 */
export async function scrapeGTUE(page: Page): Promise<GTUEScraperResult> {
  const result: GTUEScraperResult = {
    success: false,
    testsFound: 0,
    testsNew: 0,
    errors: [],
  };

  try {
    console.log("[GTÜ] Starting scraper...");

    const urls = await discoverTestUrls(page);
    result.testsFound = urls.length;

    for (const url of urls) {
      try {
        const testResult = await scrapeTestPage(page, url);

        if (testResult) {
          const saved = saveTestResult(testResult);
          if (saved) {
            result.testsNew++;
            console.log(`[GTÜ] Saved: ${testResult.testUid} (${testResult.results.length} tyres)`);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`${url}: ${errorMsg}`);
      }

      // Rate limiting (longer for GTÜ — less frequent updates)
      await page.waitForTimeout(1500);
    }

    result.success = true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMsg);
  }

  console.log(`[GTÜ] Scraper complete: ${result.testsNew} new tests`);
  return result;
}
