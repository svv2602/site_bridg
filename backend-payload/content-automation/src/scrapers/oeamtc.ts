/**
 * ÖAMTC Test Results Scraper
 *
 * Scrapes tyre test results from oeamtc.at
 * Rating scale: 0.5-5.5 numeric (similar to ADAC, lower is better)
 */

import type { Page } from "playwright";
import { type TestResult, type TestResultEntry, saveTestResult, testResultExists } from "../db/test-results.js";

const BASE_URL = "https://www.oeamtc.at/tests/reifentest/";

const TEST_TYPE_MAP: Record<string, TestResult["testType"]> = {
  sommerreifen: "summer",
  winterreifen: "winter",
  ganzjahresreifen: "allseason",
};

export interface OEAMTCScraperResult {
  success: boolean;
  testsFound: number;
  testsNew: number;
  errors: string[];
}

/**
 * Parse test type from URL path
 */
function parseTestType(url: string): TestResult["testType"] {
  for (const [key, value] of Object.entries(TEST_TYPE_MAP)) {
    if (url.toLowerCase().includes(key)) {
      return value;
    }
  }
  return "summer";
}

/**
 * Extract year from URL or text
 */
function extractYear(url: string, pageText?: string): number {
  // Try URL first
  const urlMatch = url.match(/test-?(\d{4})/i) || url.match(/(\d{4})/);
  if (urlMatch) return parseInt(urlMatch[1], 10);

  // Try page text
  if (pageText) {
    const textMatch = pageText.match(/Reifentest\s+(\d{4})/i);
    if (textMatch) return parseInt(textMatch[1], 10);
  }

  return new Date().getFullYear();
}

/**
 * Extract size from URL or page
 */
function extractSize(url: string, pageText?: string): string {
  // Try URL: patterns like "205-55-r16" or "195-65-r15"
  const urlMatch = url.match(/(\d{3})-(\d{2,3})-r(\d{2})/i);
  if (urlMatch) return `${urlMatch[1]}/${urlMatch[2]} R${urlMatch[3]}`;

  // Try page text
  if (pageText) {
    const textMatch = pageText.match(/(\d{3})\/(\d{2,3})\s*R\s*(\d{2})/);
    if (textMatch) return `${textMatch[1]}/${textMatch[2]} R${textMatch[3]}`;
  }

  return "Unknown";
}

/**
 * Generate unique test ID
 */
function generateTestUid(testType: string, year: number, size: string): string {
  const sizeNormalized = size.toLowerCase().replace(/[\/\s]/g, "-").replace("r", "");
  return `oeamtc-${testType}-${year}-${sizeNormalized}`;
}

/**
 * Discover test page URLs from ÖAMTC main test page
 */
async function discoverTestUrls(page: Page): Promise<string[]> {
  const urls: string[] = [];

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    // Find links matching test page patterns
    const links = await page.$$eval(
      'a[href*="/tests/reifentest/"]',
      (elements) => elements.map((e) => e.getAttribute("href")).filter(Boolean)
    );

    for (const link of links) {
      if (!link) continue;
      // Match patterns: sommerreifentest-2024, winterreifentest-2025, etc.
      if (/reifentest.*\d{4}/i.test(link)) {
        let fullUrl: string;
        if (link.startsWith("http")) {
          fullUrl = link;
        } else if (link.startsWith("//")) {
          // Protocol-relative URL: //www.oeamtc.at/tests/...
          fullUrl = `https:${link}`;
        } else {
          // Relative path: /tests/reifentest/...
          fullUrl = `https://www.oeamtc.at${link.startsWith("/") ? link : "/" + link}`;
        }
        if (!urls.includes(fullUrl)) urls.push(fullUrl);
      }
    }

    console.log(`[ÖAMTC] Discovered ${urls.length} test URLs`);
  } catch (error) {
    console.error("[ÖAMTC] Discovery failed:", error);
  }

  return urls;
}

/**
 * Scrape a single ÖAMTC test page
 *
 * ÖAMTC tables use `data-sort` attributes on <td> elements:
 *   col 0 (Produkt): data-sort = tyre name
 *   col 1-3 (category scores): data-sort = numeric
 *   col 4 (Gesamturteil): data-sort = overall numeric rating
 *   col 5 (Empfehlung): data-sort = star rating, text = "gut" / "befriedigend" / etc.
 */
async function scrapeTestPage(page: Page, url: string): Promise<TestResult | null> {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const pageText = await page.textContent("body") || "";
    const testType = parseTestType(url);
    const year = extractYear(url, pageText);
    const size = extractSize(url, pageText);
    const testUid = generateTestUid(testType, year, size);

    if (testResultExists(testUid)) {
      console.log(`[ÖAMTC] ${testUid} already exists, skipping`);
      return null;
    }

    // Extract structured data via data-sort attributes
    const rowData = await page.$$eval("table.table tbody tr", (rows) =>
      rows.map((row) => {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length < 5) return null;
        const name = cells[0]?.getAttribute("data-sort")?.trim();
        if (!name) return null;
        // Overall rating is the last numeric column before recommendation
        const overallCell = cells[cells.length - 2]; // Gesamturteil
        const recoCell = cells[cells.length - 1]; // Empfehlung
        const overall = overallCell?.getAttribute("data-sort");
        const recoText = recoCell?.textContent?.replace(/\s+/g, " ").trim().split(" ")[0] || "";
        return { name, overall, recoText };
      }).filter(Boolean)
    );

    const results: TestResultEntry[] = [];
    let position = 0;

    for (const data of rowData) {
      if (!data) continue;
      position++;

      const ratingNumeric = data.overall ? parseFloat(data.overall) : 0;
      const rating = ratingNumeric ? String(ratingNumeric) : "N/A";

      const categoryWins: string[] = [];
      if (data.recoText.toLowerCase().includes("sehr")) categoryWins.push("sehr gut");
      if (data.recoText.toLowerCase() === "gut") categoryWins.push("gut");

      results.push({
        tireName: data.name,
        position,
        rating,
        ratingNumeric,
        categoryWins: categoryWins.length > 0 ? categoryWins : undefined,
      });
    }

    if (results.length === 0) {
      console.log(`[ÖAMTC] No results found on ${url}`);
      return null;
    }

    return {
      testUid,
      source: "oeamtc",
      testType,
      year,
      testedSize: size,
      sourceUrl: url,
      results,
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[ÖAMTC] Failed to scrape ${url}:`, error);
    return null;
  }
}

/**
 * Main ÖAMTC scraper function
 */
export async function scrapeOEAMTC(page: Page): Promise<OEAMTCScraperResult> {
  const result: OEAMTCScraperResult = {
    success: false,
    testsFound: 0,
    testsNew: 0,
    errors: [],
  };

  try {
    console.log("[ÖAMTC] Starting scraper...");

    const urls = await discoverTestUrls(page);
    result.testsFound = urls.length;

    for (const url of urls) {
      try {
        const testResult = await scrapeTestPage(page, url);

        if (testResult) {
          const saved = saveTestResult(testResult);
          if (saved) {
            result.testsNew++;
            console.log(`[ÖAMTC] Saved: ${testResult.testUid} (${testResult.results.length} tyres)`);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`${url}: ${errorMsg}`);
      }

      // Rate limiting
      await page.waitForTimeout(1200);
    }

    result.success = true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMsg);
  }

  console.log(`[ÖAMTC] Scraper complete: ${result.testsNew} new tests`);
  return result;
}
