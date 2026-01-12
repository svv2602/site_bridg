/**
 * ProKoleso.ua Scraper for Bridgestone Tires
 *
 * Scrapes tire data from model pages like https://prokoleso.ua/shiny/bridgestone/blizzak-6/
 * Combined approach: collects model URLs from catalog, then scrapes each model page for full data
 */

import puppeteer, { type Browser, type Page } from "puppeteer";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { RawTyreContent } from "../types/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Types
export interface ScrapedTireSize {
  width: number;
  aspectRatio: number;
  diameter: number;
  loadIndex?: string;
  speedIndex?: string;
  country?: string;
}

export interface EuLabel {
  fuelEfficiency?: string;
  wetGrip?: string;
  noiseClass?: string;
  noiseDb?: number;
}

export interface ScrapedTire {
  name: string;              // Model name from page (e.g., "Blizzak 6 ENLITEN")
  sourceSlug: string;        // Slug from URL (e.g., "blizzak-6")
  canonicalSlug: string;     // Generated slug (e.g., "blizzak-6-enliten")
  season: "summer" | "winter" | "allseason";
  sizes: ScrapedTireSize[];
  euLabel?: EuLabel;         // EU label from first available size
  description: string;
  imageUrl: string;
  sourceUrl: string;
  scrapedAt: string;
}

// Config
const BASE_URL = "https://prokoleso.ua";
const MAX_CATALOG_PAGES = 5; // Pages per catalog

// All catalogs to scan for Bridgestone models
const BRIDGESTONE_CATALOGS = [
  `${BASE_URL}/shiny/bridgestone/`,             // Main Bridgestone catalog
  `${BASE_URL}/shiny/letnie/bridgestone/`,      // Summer
  `${BASE_URL}/shiny/zimnie/bridgestone/`,      // Winter
  `${BASE_URL}/shiny/vsesezonie/bridgestone/`,  // All-season
];

// Model pages that exist but aren't linked from catalogs
const ADDITIONAL_MODEL_URLS = [
  `${BASE_URL}/ua/shiny/bridgestone/turanza-all-season-6/`,
  `${BASE_URL}/ua/shiny/bridgestone/weather-control-a005-evo/`,
];

// Helpers
function determineSeason(text: string, modelName: string): ScrapedTire["season"] {
  const lower = (text + " " + modelName).toLowerCase();

  // All-season indicators (check first, as some may contain winter-related words)
  if (lower.includes("всесезон") || lower.includes("all season") || lower.includes("all-season") ||
      lower.includes("weather control") || lower.includes("a/t ") || lower.includes("a/t-") ||
      lower.includes("all terrain") || lower.includes("dueler a/t") || lower.includes("a/t 00")) {
    return "allseason";
  }

  // Winter indicators
  if (lower.includes("зимов") || lower.includes("зимні") || lower.includes("winter") ||
      lower.includes("blizzak") || lower.includes("ice")) {
    return "winter";
  }

  return "summer";
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function extractSourceSlug(url: string): string {
  // Extract slug from URL like /shiny/bridgestone/blizzak-6/
  const match = url.match(/\/shiny\/bridgestone\/([a-z0-9-]+)\/?$/i);
  return match?.[1] || "";
}

function parseSizeFromText(text: string): ScrapedTireSize | null {
  // Parse from text like "205/55 R17"
  const match = text.match(/(\d{3})\/(\d{2,3})\s*R(\d{2})/i);
  if (!match) return null;

  return {
    width: parseInt(match[1], 10),
    aspectRatio: parseInt(match[2], 10),
    diameter: parseInt(match[3], 10),
  };
}

function parseSpeedIndex(text: string): string | undefined {
  // Parse from text like "W (270 км/г)" or just "W"
  const match = text.match(/([A-Z])\s*(?:\(|$)/i);
  return match ? match[1].toUpperCase() : undefined;
}

function parseLoadIndex(text: string): string | undefined {
  // Parse from text like "96 (710 кг)" or just "96"
  const match = text.match(/(\d{2,3})\s*(?:\(|$)/);
  return match ? match[1] : undefined;
}

/**
 * Scrape EU label from a size page
 */
async function scrapeEuLabel(page: Page, sizeUrl: string): Promise<EuLabel | null> {
  try {
    await page.goto(sizeUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // Click on Євроетикетка tab
    await page.evaluate(() => {
      const els = document.querySelectorAll(".js-tab-trigger");
      for (const el of els) {
        const text = el.textContent?.trim() || "";
        if (text === "Євроетикетка" || text === "Евроэтикетка") {
          (el as HTMLElement).click();
          return;
        }
      }
    });

    // Wait for content to load
    await new Promise((r) => setTimeout(r, 1000));

    // Parse EU label from visible text
    const euLabel = await page.evaluate(() => {
      const text = document.body.innerText;

      const fuelMatch = text.match(/(?:Клас[а-яі\s]+)?енергоефективності[\s\n]+([A-G])/i);
      const wetMatch = text.match(/зчеплення[а-яі\s]+мокр[а-яі\s]+[\s\n]+([A-G])/i);
      const noiseClassMatch = text.match(/(?:зовнішнього\s+)?шуму качення[\s\n]+([A-G])/i);
      const noiseDbMatch = text.match(/(\d{2,3})\s*d[Bb]/i);

      return {
        fuelEfficiency: fuelMatch ? fuelMatch[1] : null,
        wetGrip: wetMatch ? wetMatch[1] : null,
        noiseClass: noiseClassMatch ? noiseClassMatch[1] : null,
        noiseDb: noiseDbMatch ? parseInt(noiseDbMatch[1], 10) : null,
      };
    });

    // Return only if we found at least some data
    if (euLabel.fuelEfficiency || euLabel.wetGrip || euLabel.noiseDb) {
      return {
        fuelEfficiency: euLabel.fuelEfficiency || undefined,
        wetGrip: euLabel.wetGrip || undefined,
        noiseClass: euLabel.noiseClass || undefined,
        noiseDb: euLabel.noiseDb || undefined,
      };
    }

    return null;
  } catch (error) {
    console.log(`    Warning: Could not scrape EU label from ${sizeUrl}`);
    return null;
  }
}

/**
 * Find all model page URLs from seasonal catalogs
 */
async function findModelUrls(page: Page): Promise<string[]> {
  const modelUrls = new Set<string>();

  for (const catalogBase of BRIDGESTONE_CATALOGS) {
    console.log(`\n  Scanning catalog: ${catalogBase}`);

    for (let pageNum = 1; pageNum <= MAX_CATALOG_PAGES; pageNum++) {
      const catalogUrl = pageNum === 1 ? catalogBase : `${catalogBase}?page=${pageNum}`;
      console.log(`    Page ${pageNum}: ${catalogUrl}`);

      try {
        await page.goto(catalogUrl, { waitUntil: "networkidle2", timeout: 30000 });

        const urls = await page.evaluate(() => {
          const links = document.querySelectorAll('a[href*="/shiny/bridgestone/"]');
          const found: string[] = [];

          links.forEach((link) => {
            const href = (link as HTMLAnchorElement).href;
            // Model pages: /shiny/bridgestone/model-name/ (ends with /, no .html)
            if (href.match(/\/shiny\/bridgestone\/[a-z0-9-]+\/?$/i) && !href.includes(".html")) {
              found.push(href.replace(/\/?$/, "/")); // Normalize trailing slash
            }
          });

          return found;
        });

        urls.forEach((url) => {
          // Normalize: prefer /ua/ version
          const normalized = url.includes("/ua/") ? url : url.replace("/shiny/", "/ua/shiny/");
          modelUrls.add(normalized);
        });

        console.log(`      Found ${urls.length} model links`);

        // Check for next page
        const hasNext = await page.evaluate((current: number) => {
          return !!document.querySelector(`a[href*="page=${current + 1}"]`);
        }, pageNum);

        if (!hasNext) break;

        await new Promise((r) => setTimeout(r, 300));
      } catch (error) {
        console.log(`      Error loading page: ${error}`);
        break;
      }
    }
  }

  // Add additional model URLs that aren't found in catalogs
  console.log(`\n  Adding ${ADDITIONAL_MODEL_URLS.length} additional model URLs...`);
  ADDITIONAL_MODEL_URLS.forEach((url) => modelUrls.add(url));

  return Array.from(modelUrls);
}

/**
 * Scrape a single model page
 */
async function scrapeModelPage(page: Page, modelUrl: string): Promise<ScrapedTire | null> {
  try {
    await page.goto(modelUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // Scroll to load lazy content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 500));

    const data = await page.evaluate(() => {
      // Model name from h1
      const modelSpan = document.querySelector("h1 .product-model, h1");
      let modelName = modelSpan?.textContent?.trim() || "";
      modelName = modelName.replace(/^Bridgestone\s+/i, "").trim();

      // Description from .text-formatted
      const descEl = document.querySelector(".text-formatted");
      const description = descEl?.textContent?.trim() || "";

      // Image - find product image, not logos/stickers
      let imageUrl = "";
      const imgs = document.querySelectorAll(".product-block img");
      for (const img of imgs) {
        const src = (img as HTMLImageElement).src || "";
        // Skip logos, stickers, icons
        if (src && !src.includes("logo") && !src.includes("sticker") &&
            !src.includes("icon") && !src.includes(".svg") &&
            (src.includes("bridgestone") || src.includes("catalog_models"))) {
          imageUrl = src;
          break;
        }
      }

      // Parse sizes from table rows
      const sizes: Array<{
        sizeText: string;
        speedIndex: string;
        loadIndex: string;
        url: string;
      }> = [];

      const tableRows = document.querySelectorAll("table tbody tr");
      tableRows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 4) return;

        // Cell 1: Типорозмір (with link)
        const sizeLink = cells[1]?.querySelector("a");
        const sizeText = sizeLink?.textContent?.trim() || "";
        const url = (sizeLink as HTMLAnchorElement)?.href || "";

        // Cell 2: Індекс швидкості - get text content excluding .key
        let speedText = "";
        cells[2]?.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            speedText += node.textContent || "";
          }
        });
        speedText = speedText.trim();

        // Cell 3: Індекс навантаження
        let loadText = "";
        cells[3]?.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            loadText += node.textContent || "";
          }
        });
        loadText = loadText.trim();

        if (sizeText.match(/\d{3}\/\d{2}/)) {
          sizes.push({
            sizeText,
            speedIndex: speedText,
            loadIndex: loadText,
            url,
          });
        }
      });

      return { modelName, description, imageUrl, sizes };
    });

    if (!data.modelName) {
      console.log(`  Warning: Could not extract model name from ${modelUrl}`);
      return null;
    }

    // Parse sizes from table data
    const parsedSizes: ScrapedTireSize[] = [];
    const seenSizes = new Set<string>();

    for (const { sizeText, speedIndex, loadIndex } of data.sizes) {
      const baseSize = parseSizeFromText(sizeText);
      if (!baseSize) continue;

      const size: ScrapedTireSize = {
        width: baseSize.width,
        aspectRatio: baseSize.aspectRatio,
        diameter: baseSize.diameter,
        loadIndex: parseLoadIndex(loadIndex),
        speedIndex: parseSpeedIndex(speedIndex),
      };

      // Include load/speed in key to distinguish different variants
      const key = `${size.width}-${size.aspectRatio}-${size.diameter}-${size.loadIndex || ""}-${size.speedIndex || ""}`;
      if (!seenSizes.has(key)) {
        seenSizes.add(key);
        parsedSizes.push(size);
      }
    }

    const sourceSlug = extractSourceSlug(modelUrl);
    const season = determineSeason(data.description, data.modelName);

    // Get EU label from first available size
    let euLabel: EuLabel | undefined;
    const firstSizeUrl = data.sizes.find((s) => s.url)?.url;
    if (firstSizeUrl) {
      const label = await scrapeEuLabel(page, firstSizeUrl);
      if (label) {
        euLabel = label;
        console.log(`    EU Label: ${label.fuelEfficiency}/${label.wetGrip}/${label.noiseDb}dB`);
      }
    }

    return {
      name: data.modelName,
      sourceSlug,
      canonicalSlug: createSlug(data.modelName),
      season,
      sizes: parsedSizes,
      euLabel,
      description: data.description,
      imageUrl: data.imageUrl,
      sourceUrl: modelUrl,
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`  Error scraping ${modelUrl}:`, error);
    return null;
  }
}

/**
 * Main scraper - scrapes model pages for full data
 */
async function scrapeProkoleso(): Promise<ScrapedTire[]> {
  console.log("Starting ProKoleso Model Page Scraper...");
  console.log(`Catalogs: ${BRIDGESTONE_CATALOGS.join(", ")}`);

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Step 1: Find all model URLs
    console.log("\n[Step 1] Finding model URLs from catalog...");
    const modelUrls = await findModelUrls(page);
    console.log(`Found ${modelUrls.length} model pages`);
    modelUrls.forEach((url) => console.log(`  - ${url}`));

    // Step 2: Scrape each model page
    console.log("\n[Step 2] Scraping model pages...");
    const scrapedTires: ScrapedTire[] = [];

    for (const modelUrl of modelUrls) {
      console.log(`\nScraping: ${modelUrl}`);
      const tire = await scrapeModelPage(page, modelUrl);

      if (tire) {
        scrapedTires.push(tire);
        console.log(`  ✓ ${tire.name} (${tire.season}, ${tire.sizes.length} sizes)`);
        console.log(`    sourceSlug: ${tire.sourceSlug}`);
        console.log(`    canonicalSlug: ${tire.canonicalSlug}`);
      }

      // Delay between requests
      await new Promise((r) => setTimeout(r, 500));
    }

    console.log(`\n[Done] Scraped ${scrapedTires.length} tire models`);

    return scrapedTires;
  } catch (error) {
    console.error("Scraping error:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Save results to JSON
function saveResults(tires: ScrapedTire[]): void {
  const outputPath = join(__dirname, "../../data/prokoleso-tires.json");
  writeFileSync(outputPath, JSON.stringify(tires, null, 2), "utf-8");
  console.log(`Results saved to ${outputPath}`);
}

/**
 * Scrape detailed content for a single tire model page (for content generation)
 */
export async function scrapeModelDescription(
  pageUrl: string,
  browser?: Browser
): Promise<RawTyreContent | null> {
  const shouldCloseBrowser = !browser;

  try {
    if (!browser) {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log(`Scraping content from: ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // Scroll to load content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 500));

    const content = await page.evaluate(() => {
      // Model name
      const modelSpan = document.querySelector("h1 .product-model, h1");
      let modelName = modelSpan?.textContent?.trim() || "";
      modelName = modelName.replace(/^Bridgestone\s+/i, "").trim();

      // Full description
      const descEl = document.querySelector(".text-formatted");
      const fullDescription = descEl?.textContent?.trim() || "";

      // Extract advantages from description paragraphs
      const advantages: string[] = [];
      const paragraphs = descEl?.querySelectorAll("p, li") || [];
      paragraphs.forEach((p) => {
        const text = p.textContent?.trim();
        if (text && text.length > 20 && text.length < 300) {
          advantages.push(text);
        }
      });

      // Season detection
      const pageText = document.body.textContent?.toLowerCase() || "";
      let season: "summer" | "winter" | "allseason" | undefined;
      if (pageText.includes("зимов") || pageText.includes("зимні") || pageText.includes("blizzak")) {
        season = "winter";
      } else if (pageText.includes("всесезон") || pageText.includes("all season")) {
        season = "allseason";
      } else {
        season = "summer";
      }

      return { modelName, fullDescription, advantages, season };
    });

    const sourceSlug = extractSourceSlug(pageUrl);
    const modelSlug = createSlug(content.modelName);

    const result: RawTyreContent = {
      source: "prokoleso",
      modelSlug,
      modelName: content.modelName,
      fullDescription: content.fullDescription,
      features: [],
      advantages: content.advantages.slice(0, 10),
      specifications: {},
      season: content.season,
      scrapedAt: new Date().toISOString(),
      sourceUrl: pageUrl,
    };

    console.log(`Scraped: ${result.modelName} (${result.advantages.length} advantages)`);

    await page.close();

    if (shouldCloseBrowser && browser) {
      await browser.close();
    }

    return result;
  } catch (error) {
    console.error(`Failed to scrape ${pageUrl}:`, error);
    if (shouldCloseBrowser && browser) {
      await browser.close();
    }
    return null;
  }
}

/**
 * Find all Bridgestone tire model URLs from catalog
 */
export async function findBridgestoneTireUrls(browser?: Browser): Promise<string[]> {
  const shouldCloseBrowser = !browser;

  try {
    if (!browser) {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const urls = await findModelUrls(page);

    await page.close();

    if (shouldCloseBrowser && browser) {
      await browser.close();
    }

    return urls;
  } catch (error) {
    console.error("Failed to find tire URLs:", error);
    if (shouldCloseBrowser && browser) {
      await browser.close();
    }
    return [];
  }
}

// Main execution
async function main() {
  try {
    const tires = await scrapeProkoleso();

    console.log(`\n${"=".repeat(50)}`);
    console.log(`SUMMARY: Scraped ${tires.length} tire models`);
    console.log(`${"=".repeat(50)}`);

    tires.forEach((tire) => {
      console.log(`\n${tire.name}`);
      console.log(`  Season: ${tire.season}`);
      console.log(`  Sizes: ${tire.sizes.length}`);
      console.log(`  Source slug: ${tire.sourceSlug}`);
      console.log(`  Canonical slug: ${tire.canonicalSlug}`);
      console.log(`  Description: ${tire.description.substring(0, 100)}...`);
    });

    if (tires.length > 0) {
      saveResults(tires);
    } else {
      console.log("\nNo tires found. The website structure may have changed.");
    }
  } catch (error) {
    console.error("Failed to scrape:", error);
    process.exit(1);
  }
}

// Run if called directly
main();

export { scrapeProkoleso, saveResults };
