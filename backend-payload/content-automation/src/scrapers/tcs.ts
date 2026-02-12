/**
 * TCS Test Results Scraper
 *
 * Scrapes tyre test results from tcs.ch (Touring Club Schweiz)
 * Rating: Tier-based (4 levels) — converted to numeric via mapTierToRating
 */

import type { Page } from "playwright";
import { type TestResult, type TestResultEntry, saveTestResult, testResultExists } from "../db/test-results.js";
import { extractPlausibleYear, isPlausibleTestYear } from "./parsers.js";

export interface TCSScraperResult {
  success: boolean;
  testsFound: number;
  testsNew: number;
  errors: string[];
}

/**
 * Extract year from text/URL
 */
function extractYear(text: string): number {
  return extractPlausibleYear(text) || new Date().getFullYear();
}

/**
 * Generate unique test ID
 */
function generateTestUid(testType: string, year: number, size: string): string {
  // Normalize: "225/40 R 18" or "225/40 R18" → "225-40-18"
  const sizeNormalized = size.toLowerCase().replace(/\s*r\s*/g, "-").replace(/[\/\s]/g, "-").replace(/-+/g, "-");
  return `tcs-${testType}-${year}-${sizeNormalized}`;
}

/**
 * Known TCS test sub-pages.
 * TCS test data is behind an external Dimaster iframe — standard link discovery
 * doesn't find year-based URLs. These known pages embed the Dimaster widget
 * with type and year parameters.
 */
const TCS_TEST_PAGES = [
  { url: "https://www.tcs.ch/de/testberichte-ratgeber/tests/reifentests/sommerreifentest.php", type: "summer" as const },
  { url: "https://www.tcs.ch/de/testberichte-ratgeber/tests/reifentests/winterreifen-getestet.php", type: "winter" as const },
  { url: "https://www.tcs.ch/de/testberichte-ratgeber/tests/reifentests/ganzjahresreifen.php", type: "allseason" as const },
];

/**
 * Dimaster iframe base URL. TCS embeds Dimaster with query params:
 *   lang=de, tests=1, year=YYYY, what=S|W|A
 */
const DIMASTER_BASE = "https://tcstire.live.dimaster.ch/";

const DIMASTER_TYPE_MAP: Record<string, string> = {
  summer: "S",
  winter: "W",
  allseason: "A",
};

/**
 * Discover test configurations from TCS.
 * Returns iframe URLs for each type+year combination.
 */
async function discoverTestUrls(page: Page): Promise<string[]> {
  const urls: string[] = [];
  const currentYear = new Date().getFullYear();

  // Generate Dimaster iframe URLs for recent years
  for (const { type } of TCS_TEST_PAGES) {
    const what = DIMASTER_TYPE_MAP[type] || "S";
    for (let year = currentYear; year >= currentYear - 2; year--) {
      urls.push(`${DIMASTER_BASE}?lang=de&tests=1&year=${year}&what=${what}`);
    }
  }

  console.log(`[TCS] Generated ${urls.length} Dimaster URLs to check`);
  return urls;
}

// Type keywords used to split brand+model from the concatenated article text
const TYPE_KEYWORDS: Array<{ keyword: string; type: TestResult["testType"] }> = [
  { keyword: "Winterreifen", type: "winter" },
  { keyword: "Sommerreifen", type: "summer" },
  { keyword: "Ganzjahresreifen", type: "allseason" },
];

interface ParsedArticle {
  tireName: string;
  size: string;
  year: number;
  pct: number;
  /** Test type detected from article content keyword (Winterreifen/Sommerreifen/etc.) */
  contentType: TestResult["testType"];
}

/**
 * Parse a single article.popup text into structured data.
 * Text format: "{BRAND} {Model}{TypeKeyword}{Year}{Dimension}{LoadIdx}{SpeedIdx}{Pct}%"
 * Example: "GOODYEAR UltraGrip Performance 3Winterreifen2025225/40 R1892V70%"
 *
 * Returns contentType derived from the keyword found in the article text,
 * which is more reliable than the URL `what=` parameter (Dimaster may return
 * mixed-type results on a single URL).
 */
function parseArticleText(text: string): ParsedArticle | null {
  // Split on type keyword to get brand+model
  for (const { keyword: kw, type: contentType } of TYPE_KEYWORDS) {
    const idx = text.indexOf(kw);
    if (idx < 0) continue;
    const tireName = text.slice(0, idx).trim();
    if (!tireName) continue;

    const rest = text.slice(idx + kw.length);
    const yearMatch = rest.match(/^(\d{4})/);
    const rawYear = yearMatch ? parseInt(yearMatch[1], 10) : 0;
    const year = isPlausibleTestYear(rawYear) ? rawYear : 0;

    const sizeMatch = rest.match(/(\d{3}\/\d{2,3}\s*R\s*\d{2})/);
    const size = sizeMatch ? sizeMatch[1].replace(/\s+/g, " ") : "Unknown";

    const pctMatch = rest.match(/(\d{1,3})%/);
    const pct = pctMatch ? parseInt(pctMatch[1], 10) : 0;

    return { tireName, size, year, pct, contentType };
  }
  return null;
}

/**
 * Scrape TCS test results from Dimaster iframe page.
 *
 * The Dimaster SPA renders article.popup elements with concatenated test data.
 * Each URL loads results for one type+year (default size).
 */
async function scrapeTestPage(page: Page, url: string): Promise<TestResult | null> {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(5000);

    // Extract article.popup text content
    const articleTexts = await page.$$eval("article.popup", (els: Element[]) =>
      els.map((e) => (e.textContent || "").replace(/\s+/g, " ").trim())
    );

    if (articleTexts.length === 0) {
      console.log(`[TCS] No article elements on ${url}`);
      return null;
    }

    // Parse first article to get test metadata (type, year, size)
    const firstParsed = parseArticleText(articleTexts[0]);
    if (!firstParsed) {
      console.log(`[TCS] Could not parse article text on ${url}`);
      return null;
    }

    // Use content-derived type (from keyword in article text) — more reliable than URL param.
    // Dimaster may return e.g. winter tyres on a ?what=S (summer) URL.
    const testType = firstParsed.contentType;
    const year = firstParsed.year || extractYear(url);
    const size = firstParsed.size;
    const testUid = generateTestUid(testType, year, size);

    if (testResultExists(testUid)) {
      console.log(`[TCS] ${testUid} already exists, skipping`);
      return null;
    }

    const results: TestResultEntry[] = [];

    for (let i = 0; i < articleTexts.length; i++) {
      const parsed = parseArticleText(articleTexts[i]);
      if (!parsed) continue;

      // TCS percentage: higher is better (0-100%), convert to 1-5 scale (lower is better)
      const ratingNumeric = parsed.pct > 0 ? Math.round((100 - parsed.pct) * 4 / 100 + 1) : 0;

      results.push({
        tireName: parsed.tireName,
        position: i + 1,
        rating: parsed.pct > 0 ? `${parsed.pct}%` : "N/A",
        ratingNumeric,
      });
    }

    if (results.length === 0) {
      console.log(`[TCS] No results parsed from ${url}`);
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
