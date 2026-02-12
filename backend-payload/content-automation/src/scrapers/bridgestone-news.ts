/**
 * Bridgestone EMEA News Scraper
 *
 * Fetches press releases from press.bridgestone-emea.com
 * Strategy: parse sitemap.xml for URLs + dates, then fetch meta tags from new pages.
 * Uses plain HTTP — no Playwright needed.
 * Saves to news_items table (not test_results).
 */

import { saveNewsItem, newsItemExists } from "../db/news-items.js";

const SITEMAP_URL = "https://press.bridgestone-emea.com/sitemap.xml";
const BASE_URL = "https://press.bridgestone-emea.com";
const USER_AGENT = "Mozilla/5.0 (compatible; BridgestoneUA/1.0)";

// Language prefixes to exclude (we only want English articles)
const LANG_PREFIXES = [
  "/de/", "/fr/", "/it/", "/es/", "/pl-pl/", "/pt-pt/",
  "/cs-cz/", "/hu-hu/", "/da-dk/", "/fi-fi/", "/el-gr/",
  "/en-in/", "/en-za/", "/en-ie/",
  "/en/", // UK English variant — root URLs already have the same content
];

interface SitemapEntry {
  url: string;
  lastmod: string | null;
}

export interface BridgestoneNewsScraperResult {
  success: boolean;
  newsFound: number;
  newsNew: number;
  errors: string[];
}

/**
 * Fetch and parse sitemap.xml for English press release URLs
 */
async function fetchSitemapEntries(): Promise<SitemapEntry[]> {
  const response = await fetch(SITEMAP_URL, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Sitemap HTTP ${response.status}: ${response.statusText}`);
  }

  const xml = await response.text();
  const entries: SitemapEntry[] = [];

  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];

  for (const block of urlBlocks) {
    const locMatch = block.match(/<loc>(.*?)<\/loc>/);
    if (!locMatch) continue;

    const url = locMatch[1];

    // Skip non-English pages
    const path = url.replace(BASE_URL, "");
    if (LANG_PREFIXES.some((prefix) => path.startsWith(prefix))) continue;

    // Skip homepage, about, contact, media-library pages
    if (path === "/" || path === "/en/" ||
        path.includes("/about-") || path.includes("/contact") ||
        path.includes("/media-library")) continue;

    const modMatch = block.match(/<lastmod>(.*?)<\/lastmod>/);
    entries.push({
      url,
      lastmod: modMatch ? modMatch[1] : null,
    });
  }

  return entries;
}

/**
 * Extract title, description and keywords from a page's meta tags (static HTML)
 */
async function fetchPageMeta(url: string): Promise<{
  title: string;
  summary: string;
  category: string | null;
} | null> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) return null;

  const html = await response.text();

  // Try OG title first, then <title>
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/);
  const titleTag = html.match(/<title>(.*?)<\/title>/);
  const title = (ogTitle?.[1] || titleTag?.[1] || "").trim();

  if (!title) return null;

  // Description from meta or OG
  const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/);
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/);
  const summary = (metaDesc?.[1] || ogDesc?.[1] || "").trim();

  // Keywords as category
  const keywords = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["'](.*?)["']/);
  const category = keywords?.[1]?.trim() || null;

  return { title, summary, category };
}

/**
 * Rate-limit helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    console.log("[BridgestoneNews] Fetching sitemap...");

    const entries = await fetchSitemapEntries();
    result.newsFound = entries.length;

    console.log(`[BridgestoneNews] Found ${entries.length} English press releases in sitemap`);

    // Only process entries from the last 90 days to avoid fetching the entire archive
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const recentEntries = entries.filter(
      (e) => e.lastmod && e.lastmod >= cutoffDate
    );

    console.log(`[BridgestoneNews] ${recentEntries.length} entries in last 90 days`);

    for (const entry of recentEntries) {
      try {
        // Skip if already scraped
        if (newsItemExists(entry.url)) continue;

        // Fetch page meta tags
        const meta = await fetchPageMeta(entry.url);
        if (!meta) continue;

        const saved = saveNewsItem({
          source: "bridgestone-emea",
          title: meta.title,
          summary: meta.summary,
          url: entry.url,
          publishedDate: entry.lastmod,
          category: meta.category,
          scrapedAt: new Date().toISOString(),
        });

        if (saved) {
          result.newsNew++;
          console.log(`[BridgestoneNews] New: ${meta.title}`);
        }

        // Rate limit: 500ms between page fetches
        await delay(500);
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
