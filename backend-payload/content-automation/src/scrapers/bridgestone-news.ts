/**
 * Bridgestone EMEA News Scraper
 *
 * Fetches press releases from press.bridgestone-emea.com
 * Uses HTTP API — no Playwright needed.
 * Saves to news_items table (not test_results).
 */

import { saveNewsItem, newsItemExists } from "../db/news-items.js";

const API_URL = "https://press.bridgestone-emea.com/services/getheadlines.php";

interface HeadlineItem {
  id?: string;
  title?: string;
  summary?: string;
  url?: string;
  link?: string;
  date?: string;
  published?: string;
  category?: string;
  type?: string;
}

export interface BridgestoneNewsScraperResult {
  success: boolean;
  newsFound: number;
  newsNew: number;
  errors: string[];
}

/**
 * Fetch headlines from Bridgestone EMEA press API
 */
async function fetchHeadlines(): Promise<HeadlineItem[]> {
  const response = await fetch(API_URL, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; BridgestoneUA/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json() as Record<string, unknown>;

  // API may return array directly or nested in a property
  if (Array.isArray(data)) return data as HeadlineItem[];
  if (data.headlines && Array.isArray(data.headlines)) return data.headlines as HeadlineItem[];
  if (data.items && Array.isArray(data.items)) return data.items as HeadlineItem[];
  if (data.data && Array.isArray(data.data)) return data.data as HeadlineItem[];

  // Try to extract array from first object property
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) return data[key] as HeadlineItem[];
  }

  console.warn("[BridgestoneNews] Unexpected API response format");
  return [];
}

/**
 * Normalize a headline item to a consistent shape
 */
function normalizeItem(item: HeadlineItem): {
  title: string;
  summary: string;
  url: string;
  publishedDate: string | null;
  category: string | null;
} | null {
  const title = item.title?.trim();
  const url = (item.url || item.link)?.trim();

  if (!title || !url) return null;

  const fullUrl = url.startsWith("http") ? url : `https://press.bridgestone-emea.com${url}`;

  return {
    title,
    summary: (item.summary || "").trim(),
    url: fullUrl,
    publishedDate: item.date || item.published || null,
    category: item.category || item.type || null,
  };
}

/**
 * Main Bridgestone News scraper function.
 * Does NOT require a Playwright page — uses plain HTTP fetch.
 */
export async function scrapeBridgestoneNews(): Promise<BridgestoneNewsScraperResult> {
  const result: BridgestoneNewsScraperResult = {
    success: false,
    newsFound: 0,
    newsNew: 0,
    errors: [],
  };

  try {
    console.log("[BridgestoneNews] Fetching headlines...");

    const headlines = await fetchHeadlines();
    result.newsFound = headlines.length;

    console.log(`[BridgestoneNews] Found ${headlines.length} headlines`);

    for (const item of headlines) {
      try {
        const normalized = normalizeItem(item);
        if (!normalized) continue;

        // Skip if already scraped
        if (newsItemExists(normalized.url)) continue;

        const saved = saveNewsItem({
          source: "bridgestone-emea",
          title: normalized.title,
          summary: normalized.summary,
          url: normalized.url,
          publishedDate: normalized.publishedDate,
          category: normalized.category,
          scrapedAt: new Date().toISOString(),
        });

        if (saved) {
          result.newsNew++;
          console.log(`[BridgestoneNews] New: ${normalized.title}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(errorMsg);
      }
    }

    result.success = true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMsg);
    console.error("[BridgestoneNews] Scraper failed:", error);
  }

  console.log(`[BridgestoneNews] Complete: ${result.newsNew} new items`);
  return result;
}
