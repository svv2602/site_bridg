/**
 * Tyre Content Scraper
 *
 * Aggregates tyre content from multiple sources for AI content generation.
 * Supports multi-brand (Bridgestone & Firestone).
 */

import puppeteer, { type Browser } from "puppeteer";
import { scrapeModelDescription, findTireUrlsByBrand, findBridgestoneTireUrls } from "./prokoleso.js";
import type { RawTyreContent, RawTyreContentCollection, Brand } from "../types/content.js";
import { createLogger } from "../utils/logger.js";
import { saveRawContentCollection, loadRawContentCollection, hasRawContent } from "../utils/storage.js";

const logger = createLogger("TyreContentScraper");

// Configuration
const SCRAPE_DELAY_MS = 2000; // Delay between requests to avoid rate limiting

/**
 * Scrape content for a single model from all available sources
 */
export async function scrapeContentForModel(
  modelSlug: string,
  options: {
    sources?: Array<"prokoleso" | "bridgestone" | "firestone" | "tyrereviews">;
    brand?: Brand;
    browser?: Browser;
    save?: boolean;
    skipIfExists?: boolean;
  } = {}
): Promise<RawTyreContentCollection> {
  const { sources = ["prokoleso"], brand = "bridgestone", browser, save = true, skipIfExists = false } = options;

  // Skip if content already exists
  if (skipIfExists && hasRawContent(modelSlug)) {
    logger.info(`Skipping "${modelSlug}" - content already exists`);
    return loadRawContentCollection(modelSlug) || {
      modelSlug,
      modelName: "",
      brand,
      sources: [],
      collectedAt: new Date().toISOString(),
    };
  }
  const shouldCloseBrowser = !browser;
  let activeBrowser = browser;

  const collection: RawTyreContentCollection = {
    modelSlug,
    modelName: "",
    brand,
    sources: [],
    collectedAt: new Date().toISOString(),
  };

  try {
    if (!activeBrowser) {
      activeBrowser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    // Find URLs for this model
    const allUrls = await findTireUrlsByBrand(brand, activeBrowser);

    // Filter URLs that match the model slug
    const modelUrls = allUrls.filter((url) => {
      const urlLower = url.toLowerCase();
      const slugParts = modelSlug.toLowerCase().split("-");
      // Check if URL contains all parts of the slug
      return slugParts.every((part) => urlLower.includes(part));
    });

    logger.info(`Found ${modelUrls.length} URLs for model "${modelSlug}"`);

    if (modelUrls.length === 0) {
      logger.warn(`No URLs found for model "${modelSlug}"`);
      return collection;
    }

    // Scrape first matching URL (they should have similar content)
    if (sources.includes("prokoleso") && modelUrls.length > 0) {
      const content = await scrapeModelDescription(modelUrls[0], activeBrowser);
      if (content) {
        collection.sources.push(content);
        collection.modelName = content.modelName;
      }
    }

    // TODO: Add other sources (bridgestone.com, tyrereviews.com)
    // if (sources.includes("bridgestone")) { ... }
    // if (sources.includes("tyrereviews")) { ... }

    // Save collection if requested
    if (save && collection.sources.length > 0) {
      const filepath = saveRawContentCollection(collection);
      logger.info(`Saved raw content to ${filepath}`);
    }

  } catch (error) {
    logger.error(`Failed to scrape content for "${modelSlug}"`, {
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (shouldCloseBrowser && activeBrowser) {
      await activeBrowser.close();
    }
  }

  return collection;
}

/**
 * Scrape content for multiple models
 */
export async function scrapeContentForModels(
  modelSlugs: string[],
  options: {
    sources?: Array<"prokoleso" | "bridgestone" | "firestone" | "tyrereviews">;
    brand?: Brand;
    delayMs?: number;
  } = {}
): Promise<RawTyreContentCollection[]> {
  const { sources = ["prokoleso"], brand = "bridgestone", delayMs = SCRAPE_DELAY_MS } = options;
  const results: RawTyreContentCollection[] = [];

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    for (let i = 0; i < modelSlugs.length; i++) {
      const slug = modelSlugs[i];
      logger.info(`Scraping ${i + 1}/${modelSlugs.length}: ${slug}`);

      const collection = await scrapeContentForModel(slug, {
        sources,
        brand,
        browser,
      });

      results.push(collection);

      // Add delay between requests
      if (i < modelSlugs.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return results;
}

/**
 * Scrape all available tire content for a specific brand
 */
export async function scrapeAllContentByBrand(
  brand: Brand,
  options: {
    limit?: number;
    delayMs?: number;
  } = {}
): Promise<RawTyreContentCollection[]> {
  const { limit, delayMs = SCRAPE_DELAY_MS } = options;
  const results: RawTyreContentCollection[] = [];
  const brandName = brand === "bridgestone" ? "Bridgestone" : "Firestone";

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // Find all tire URLs for brand
    const allUrls = await findTireUrlsByBrand(brand, browser);
    const urlsToScrape = limit ? allUrls.slice(0, limit) : allUrls;

    logger.info(`Scraping ${urlsToScrape.length} tire pages...`);

    // Group URLs by model (remove size from URL to get unique models)
    const modelUrls = new Map<string, string>();
    for (const url of urlsToScrape) {
      // Extract model name from URL (remove size part) - works for both brands
      const modelMatch = url.match(/(?:bridgestone|firestone)-([a-z0-9-]+?)-\d{3}/i);
      if (modelMatch) {
        const modelKey = modelMatch[1].toLowerCase();
        if (!modelUrls.has(modelKey)) {
          modelUrls.set(modelKey, url);
        }
      }
    }

    logger.info(`Found ${modelUrls.size} unique ${brandName} models`);

    let i = 0;
    for (const [modelKey, url] of modelUrls) {
      i++;
      logger.info(`Scraping ${i}/${modelUrls.size}: ${modelKey}`);

      const content = await scrapeModelDescription(url, browser);
      if (content) {
        results.push({
          modelSlug: content.modelSlug,
          modelName: content.modelName,
          brand: content.brand,
          sources: [content],
          collectedAt: new Date().toISOString(),
        });
      }

      // Add delay between requests
      if (i < modelUrls.size) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  logger.info(`Scraped content for ${results.length} models`);
  return results;
}

/**
 * Merge content from multiple sources into a single collection
 */
export function mergeRawContent(
  sources: RawTyreContent[]
): RawTyreContent | null {
  if (sources.length === 0) return null;

  const primary = sources[0];
  const merged: RawTyreContent = {
    ...primary,
    features: [],
    advantages: [],
    specifications: {},
  };

  // Merge all sources
  for (const source of sources) {
    // Use longest description
    if (
      source.fullDescription &&
      (!merged.fullDescription ||
        source.fullDescription.length > merged.fullDescription.length)
    ) {
      merged.fullDescription = source.fullDescription;
    }

    // Merge features (deduplicate)
    if (source.features) {
      for (const feature of source.features) {
        if (!merged.features!.includes(feature)) {
          merged.features!.push(feature);
        }
      }
    }

    // Merge advantages (deduplicate)
    if (source.advantages) {
      for (const advantage of source.advantages) {
        if (!merged.advantages!.includes(advantage)) {
          merged.advantages!.push(advantage);
        }
      }
    }

    // Merge specifications
    if (source.specifications) {
      merged.specifications = { ...merged.specifications, ...source.specifications };
    }

    // Use first available season
    if (!merged.season && source.season) {
      merged.season = source.season;
    }

    // Merge EU label
    if (source.euLabel) {
      merged.euLabel = { ...merged.euLabel, ...source.euLabel };
    }

    // Merge technologies
    if (source.technologies) {
      merged.technologies = [
        ...new Set([...(merged.technologies || []), ...source.technologies]),
      ];
    }
  }

  return merged;
}

/**
 * Scrape all available Bridgestone tire content (legacy function for backward compatibility)
 */
export async function scrapeAllBridgestoneContent(
  options: {
    limit?: number;
    delayMs?: number;
  } = {}
): Promise<RawTyreContentCollection[]> {
  return scrapeAllContentByBrand("bridgestone", options);
}

/**
 * Scrape all available Firestone tire content
 */
export async function scrapeAllFirestoneContent(
  options: {
    limit?: number;
    delayMs?: number;
  } = {}
): Promise<RawTyreContentCollection[]> {
  return scrapeAllContentByBrand("firestone", options);
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
Tyre Content Scraper - Collect content for AI generation

Usage:
  npx tsx tyre-content.ts [options]

Options:
  --test              Test with single URL
  --model <slug>      Scrape specific model
  --brand <brand>     Brand to scrape (bridgestone or firestone, default: bridgestone)
  --all               Scrape all models for specified brand
  --limit <n>         Limit number of pages (with --all)
  --help              Show this help

Examples:
  npx tsx tyre-content.ts --test
  npx tsx tyre-content.ts --model blizzak-6
  npx tsx tyre-content.ts --all --brand bridgestone --limit 5
  npx tsx tyre-content.ts --all --brand firestone
`);
    return;
  }

  // Get brand option
  const brandIndex = args.indexOf("--brand");
  const brand: Brand = (brandIndex !== -1 && args[brandIndex + 1] === "firestone")
    ? "firestone"
    : "bridgestone";

  if (args.includes("--test")) {
    console.log("Testing with sample URL...\n");
    const testUrl = "https://prokoleso.ua/shiny/bridgestone-blizzak-6-205-55r17-95v.html";
    const content = await scrapeModelDescription(testUrl);
    console.log("\nResult:");
    console.log(JSON.stringify(content, null, 2));
    return;
  }

  const modelIndex = args.indexOf("--model");
  if (modelIndex !== -1 && args[modelIndex + 1]) {
    const modelSlug = args[modelIndex + 1];
    console.log(`Scraping content for model: ${modelSlug} (brand: ${brand})\n`);
    const collection = await scrapeContentForModel(modelSlug, { brand });
    console.log("\nResult:");
    console.log(JSON.stringify(collection, null, 2));
    return;
  }

  if (args.includes("--all")) {
    const limitIndex = args.indexOf("--limit");
    const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : undefined;
    const brandName = brand === "bridgestone" ? "Bridgestone" : "Firestone";
    console.log(`Scraping all ${brandName} content${limit ? ` (limit: ${limit})` : ""}...\n`);
    const results = await scrapeAllContentByBrand(brand, { limit });
    console.log(`\nScraped ${results.length} models`);
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Default: show help
  console.log("Use --help for usage information");
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(console.error);
}

export { scrapeModelDescription };
