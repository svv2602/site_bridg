/**
 * ProKoleso.ua Scraper for Bridgestone & Firestone Tires
 *
 * Scrapes tire data from model pages like https://prokoleso.ua/shiny/bridgestone/blizzak-6/
 * or https://prokoleso.ua/shiny/firestone/destination-hp/
 * Combined approach: collects model URLs from catalog, then scrapes each model page for full data
 */

import { chromium, type Browser, type Page } from "playwright";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { RawTyreContent, Brand } from "../types/content.js";
import type { ScrapedTireSize, EuLabel, ScrapedTire, ExistingTireRecord, ScrapeOptions, ScrapeResult } from "./types.js";
import { MAX_CATALOG_PAGES, BRAND_CATALOGS, ADDITIONAL_MODEL_URLS, getRandomUserAgent, AdaptiveDelay } from "./config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  // Extract slug from URL like /shiny/bridgestone/blizzak-6/ or /shiny/firestone/destination-hp/
  const match = url.match(/\/shiny\/(?:bridgestone|firestone)\/([a-z0-9-]+)\/?$/i);
  return match?.[1] || "";
}

/**
 * Detect brand from URL
 */
function detectBrandFromUrl(url: string): Brand {
  if (url.toLowerCase().includes("/firestone/")) {
    return "firestone";
  }
  return "bridgestone";
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
    await page.goto(sizeUrl, { waitUntil: "networkidle", timeout: 30000 });

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
    await page.waitForTimeout(1000);

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
 * Find all model page URLs from seasonal catalogs for a specific brand
 */
async function findModelUrlsForBrand(page: Page, brand: Brand): Promise<string[]> {
  const modelUrls = new Set<string>();
  const catalogs = BRAND_CATALOGS[brand];

  for (const catalogBase of catalogs) {
    console.log(`\n  Scanning catalog: ${catalogBase}`);

    for (let pageNum = 1; pageNum <= MAX_CATALOG_PAGES; pageNum++) {
      const catalogUrl = pageNum === 1 ? catalogBase : `${catalogBase}?page=${pageNum}`;
      console.log(`    Page ${pageNum}: ${catalogUrl}`);

      try {
        await page.goto(catalogUrl, { waitUntil: "networkidle", timeout: 30000 });

        const brandPattern = brand; // Pass brand to evaluate context
        const urls = await page.evaluate((b: string) => {
          const links = document.querySelectorAll(`a[href*="/shiny/${b}/"]`);
          const found: string[] = [];

          links.forEach((link) => {
            const href = (link as HTMLAnchorElement).href;
            // Model pages: /shiny/{brand}/model-name/ (ends with /, no .html)
            const regex = new RegExp(`/shiny/${b}/[a-z0-9-]+/?$`, "i");
            if (regex.test(href) && !href.includes(".html")) {
              found.push(href.replace(/\/?$/, "/")); // Normalize trailing slash
            }
          });

          return found;
        }, brandPattern);

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

        await page.waitForTimeout(300);
      } catch (error) {
        console.log(`      Error loading page: ${error}`);
        break;
      }
    }
  }

  // Add additional model URLs that aren't found in catalogs
  const additionalUrls = ADDITIONAL_MODEL_URLS[brand];
  console.log(`\n  Adding ${additionalUrls.length} additional model URLs...`);
  additionalUrls.forEach((url) => modelUrls.add(url));

  return Array.from(modelUrls);
}

/**
 * Find all model page URLs from seasonal catalogs (legacy, defaults to Bridgestone)
 */
async function findModelUrls(page: Page): Promise<string[]> {
  return findModelUrlsForBrand(page, "bridgestone");
}

/**
 * Scrape a single model page
 */
async function scrapeModelPage(page: Page, modelUrl: string): Promise<ScrapedTire | null> {
  try {
    await page.goto(modelUrl, { waitUntil: "networkidle", timeout: 30000 });

    // Scroll to load lazy content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const data = await page.evaluate(() => {
      // Model name from h1
      const modelSpan = document.querySelector("h1 .product-model, h1");
      let modelName = modelSpan?.textContent?.trim() || "";
      modelName = modelName.replace(/^Bridgestone\s+/i, "").trim();

      // Description from .text-formatted
      const descEl = document.querySelector(".text-formatted");
      const description = descEl?.textContent?.trim() || "";

      // Image - find best quality product image
      let imageUrl = "";

      // Priority 1: Gallery image (highest quality ~463x463)
      const galleryImg = document.querySelector("[js-product-gallery-slides] img") as HTMLImageElement;
      if (galleryImg?.src && galleryImg.src.includes("gallery_image")) {
        imageUrl = galleryImg.src;
      }

      // Priority 2: Any image with gallery_image in URL
      if (!imageUrl) {
        const allImgs = document.querySelectorAll("img");
        for (const img of allImgs) {
          const src = (img as HTMLImageElement).src || "";
          if (src.includes("gallery_image") && src.includes("catalog_models")) {
            imageUrl = src;
            break;
          }
        }
      }

      // Priority 3: Fallback to card image or any product image
      if (!imageUrl) {
        const imgs = document.querySelectorAll(".product-block img, .product-card img");
        for (const img of imgs) {
          const src = (img as HTMLImageElement).src || "";
          if (src && !src.includes("logo") && !src.includes("sticker") &&
              !src.includes("icon") && !src.includes(".svg") &&
              (src.includes("bridgestone") || src.includes("catalog_models"))) {
            imageUrl = src;
            break;
          }
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

    // Detect brand from URL
    const brand = detectBrandFromUrl(modelUrl);

    return {
      name: data.modelName,
      brand,
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
 * Scrape tires for a specific brand
 */
async function scrapeProkolesoBrand(brand: Brand): Promise<ScrapedTire[]> {
  const brandName = brand === "bridgestone" ? "Bridgestone" : "Firestone";
  console.log(`Starting ProKoleso Model Page Scraper for ${brandName}...`);
  console.log(`Catalogs: ${BRAND_CATALOGS[brand].join(", ")}`);

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ "User-Agent": getRandomUserAgent() });

    const delay = new AdaptiveDelay();

    // Step 1: Find all model URLs for brand
    console.log(`\n[Step 1] Finding ${brandName} model URLs from catalog...`);
    const modelUrls = await findModelUrlsForBrand(page, brand);
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
        delay.onSuccess();
        console.log(`  ✓ ${tire.name} (${tire.brand}, ${tire.season}, ${tire.sizes.length} sizes)`);
        console.log(`    sourceSlug: ${tire.sourceSlug}`);
        console.log(`    canonicalSlug: ${tire.canonicalSlug}`);
      } else {
        delay.onError();
      }

      await delay.wait();
    }

    console.log(`\n[Done] Scraped ${scrapedTires.length} ${brandName} tire models`);

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

/**
 * Main scraper - scrapes model pages for all brands (Bridgestone + Firestone)
 *
 * Options:
 *   force - re-scrape all pages even if already processed (still preserves flags on merge)
 */
async function scrapeProkoleso(brands?: Brand[], options?: ScrapeOptions): Promise<ScrapeResult> {
  const force = options?.force ?? false;
  const brandsToScrape = brands || ["bridgestone", "firestone"] as Brand[];
  console.log(`Starting ProKoleso Model Page Scraper for brands: ${brandsToScrape.join(", ")}`);
  if (force) {
    console.log(`⚡ Force mode: re-scraping all pages`);
  }

  // Load existing data for incremental scraping
  const existingData = loadExistingData();
  const skippedSlugs = new Set<string>();

  let browser: Browser | null = null;
  const allTires: ScrapedTire[] = [];

  try {
    browser = await chromium.launch({ headless: true });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ "User-Agent": getRandomUserAgent() });

    const delay = new AdaptiveDelay();

    for (const brand of brandsToScrape) {
      const brandName = brand === "bridgestone" ? "Bridgestone" : "Firestone";
      console.log(`\n${"=".repeat(50)}`);
      console.log(`Scraping ${brandName}...`);
      console.log(`${"=".repeat(50)}`);

      // Step 1: Find all model URLs for brand
      console.log(`\n[Step 1] Finding ${brandName} model URLs from catalog...`);
      const modelUrls = await findModelUrlsForBrand(page, brand);
      console.log(`Found ${modelUrls.length} model pages`);
      modelUrls.forEach((url) => console.log(`  - ${url}`));

      // Step 2: Scrape each model page
      console.log("\n[Step 2] Scraping model pages...");

      for (const modelUrl of modelUrls) {
        // Check if this model was already fully processed
        const sourceSlug = extractSourceSlug(modelUrl);
        if (!force && sourceSlug) {
          // Find existing entry by sourceSlug (since we don't have canonicalSlug yet before scraping)
          const existingEntry = Array.from(existingData.values()).find(
            (t) => t.sourceSlug === sourceSlug && t.brand === brand,
          );
          if (existingEntry && isFullyProcessed(existingEntry)) {
            console.log(`\n⏭️ Skipped (already processed): ${existingEntry.name}`);
            skippedSlugs.add(existingEntry.canonicalSlug);
            continue;
          }
        }

        console.log(`\nScraping: ${modelUrl}`);
        const tire = await scrapeModelPage(page, modelUrl);

        if (tire) {
          allTires.push(tire);
          delay.onSuccess();
          console.log(`  ✓ ${tire.name} (${tire.brand}, ${tire.season}, ${tire.sizes.length} sizes)`);
          console.log(`    sourceSlug: ${tire.sourceSlug}`);
          console.log(`    canonicalSlug: ${tire.canonicalSlug}`);
        } else {
          delay.onError();
        }

        await delay.wait();
      }
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log(`[Done] Scraped ${allTires.length} tire models | Skipped ${skippedSlugs.size} (already processed)`);
    console.log(`${"=".repeat(50)}`);

    return { tires: allTires, skippedSlugs, existingData };
  } catch (error) {
    console.error("Scraping error:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

const DATA_FILE_PATH = join(__dirname, "../../data/prokoleso-tires.json");

/**
 * Load existing scraped data from JSON file
 * Returns a Map keyed by canonicalSlug for fast lookup
 */
function loadExistingData(): Map<string, ExistingTireRecord> {
  const map = new Map<string, ExistingTireRecord>();

  if (!existsSync(DATA_FILE_PATH)) {
    return map;
  }

  try {
    const raw = readFileSync(DATA_FILE_PATH, "utf-8");
    const tires: ExistingTireRecord[] = JSON.parse(raw);
    for (const tire of tires) {
      if (tire.canonicalSlug) {
        map.set(tire.canonicalSlug, tire);
      }
    }
    console.log(`Loaded ${map.size} existing tire records from JSON`);
  } catch (error) {
    console.warn(`Warning: Could not load existing data: ${error}`);
  }

  return map;
}

/**
 * Check if a tire has been fully processed (generated + published)
 */
function isFullyProcessed(tire: ExistingTireRecord): boolean {
  return tire.aiGenerated === true && tire.publishedToPayload === true;
}

// Save results to JSON (legacy, kept for export compatibility)
function saveResults(tires: ScrapedTire[]): void {
  writeFileSync(DATA_FILE_PATH, JSON.stringify(tires, null, 2), "utf-8");
  console.log(`Results saved to ${DATA_FILE_PATH}`);
}

/**
 * Merge newly scraped tires with existing data, preserving processing flags.
 *
 * Strategy:
 * - For re-scraped tires: update scrape fields, preserve processing flags
 * - For skipped tires (already processed): keep existing record as-is
 * - For tires in old JSON not found in new scrape: keep them (may reappear later)
 */
function mergeAndSaveResults(
  newlyScraped: ScrapedTire[],
  skippedSlugs: Set<string>,
  existingData: Map<string, ExistingTireRecord>,
): void {
  const merged = new Map<string, ExistingTireRecord>();

  // 1. Start with all existing records (preserves tires missing from current scrape)
  for (const [slug, existing] of existingData) {
    merged.set(slug, existing);
  }

  // 2. Overlay newly scraped tires — update scrape fields, preserve flags
  for (const tire of newlyScraped) {
    const existing = existingData.get(tire.canonicalSlug);
    if (existing) {
      // Merge: fresh scrape data + existing processing flags
      merged.set(tire.canonicalSlug, {
        ...tire,
        aiGenerated: existing.aiGenerated,
        generatedContent: existing.generatedContent,
        publishedToPayload: existing.publishedToPayload,
        publishedAt: existing.publishedAt,
      });
    } else {
      // Brand new tire
      merged.set(tire.canonicalSlug, tire);
    }
  }

  // 3. Skipped slugs are already in merged via step 1 (no action needed)

  const result = Array.from(merged.values());
  writeFileSync(DATA_FILE_PATH, JSON.stringify(result, null, 2), "utf-8");

  const newCount = newlyScraped.filter((t) => !existingData.has(t.canonicalSlug)).length;
  const updatedCount = newlyScraped.filter((t) => existingData.has(t.canonicalSlug)).length;
  console.log(
    `\nMerge results: ${result.length} total | ${newCount} new | ${updatedCount} updated | ${skippedSlugs.size} skipped (already processed)`,
  );
  console.log(`Results saved to ${DATA_FILE_PATH}`);
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
      browser = await chromium.launch({ headless: true });
    }

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ "User-Agent": getRandomUserAgent() });

    console.log(`Scraping content from: ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 30000 });

    // Scroll to load content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const content = await page.evaluate(() => {
      // Model name
      const modelSpan = document.querySelector("h1 .product-model, h1");
      let modelName = modelSpan?.textContent?.trim() || "";
      // Remove brand prefix from model name
      modelName = modelName.replace(/^(Bridgestone|Firestone)\s+/i, "").trim();

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
    const brand = detectBrandFromUrl(pageUrl);

    const result: RawTyreContent = {
      source: "prokoleso",
      brand,
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
 * Find all tire model URLs from catalog for a specific brand
 */
export async function findTireUrlsByBrand(brand: Brand, browser?: Browser): Promise<string[]> {
  const shouldCloseBrowser = !browser;

  try {
    if (!browser) {
      browser = await chromium.launch({ headless: true });
    }

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ "User-Agent": getRandomUserAgent() });

    const urls = await findModelUrlsForBrand(page, brand);

    await page.close();

    if (shouldCloseBrowser && browser) {
      await browser.close();
    }

    return urls;
  } catch (error) {
    console.error(`Failed to find ${brand} tire URLs:`, error);
    if (shouldCloseBrowser && browser) {
      await browser.close();
    }
    return [];
  }
}


// Main execution
async function main() {
  try {
    const force = process.argv.includes("--force");
    const { tires, skippedSlugs, existingData } = await scrapeProkoleso(undefined, { force });

    console.log(`\n${"=".repeat(50)}`);
    console.log(`SUMMARY: Scraped ${tires.length} tire models | Skipped ${skippedSlugs.size}`);
    console.log(`${"=".repeat(50)}`);

    tires.forEach((tire) => {
      console.log(`\n${tire.name}`);
      console.log(`  Season: ${tire.season}`);
      console.log(`  Sizes: ${tire.sizes.length}`);
      console.log(`  Source slug: ${tire.sourceSlug}`);
      console.log(`  Canonical slug: ${tire.canonicalSlug}`);
      console.log(`  Description: ${tire.description.substring(0, 100)}...`);
    });

    if (tires.length > 0 || skippedSlugs.size > 0) {
      mergeAndSaveResults(tires, skippedSlugs, existingData);
    } else {
      console.log("\nNo tires found. The website structure may have changed.");
    }
  } catch (error) {
    console.error("Failed to scrape:", error);
    process.exit(1);
  }
}

// Run only if called directly (not when imported)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main();
}

export { scrapeProkoleso, scrapeProkolesoBrand, mergeAndSaveResults, loadExistingData };
