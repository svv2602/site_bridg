/**
 * ProKoleso.ua Scraper for Bridgestone Tires
 *
 * Scrapes tire data from https://prokoleso.ua/shiny/bridgestone/
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

export interface ScrapedTire {
  name: string;
  slug: string;
  season: "summer" | "winter" | "allseason";
  sizes: ScrapedTireSize[];
  description: string;
  imageUrl: string;
  sourceUrl: string;
  scrapedAt: string;
}

// Config
const BASE_URL = "https://prokoleso.ua";
const BRIDGESTONE_URL = `${BASE_URL}/shiny/bridgestone/`;

// Helpers
function determineSeason(text: string): ScrapedTire["season"] {
  const lower = text.toLowerCase();
  if (lower.includes("зимов") || lower.includes("winter") || lower.includes("blizzak")) {
    return "winter";
  }
  if (lower.includes("всесезон") || lower.includes("all season") || lower.includes("weather control")) {
    return "allseason";
  }
  return "summer";
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function parseSizeString(sizeStr: string): ScrapedTireSize | null {
  // Common patterns: "205/55 R16", "225/45R17 94W", "255/50 R19 XL"
  const match = sizeStr.match(/(\d{3})\/(\d{2,3})\s*R(\d{2})/i);
  if (!match) return null;

  const [, width, aspectRatio, diameter] = match;

  // Try to extract load/speed index
  const indexMatch = sizeStr.match(/R\d{2}\s+(\d{2,3})([A-Z])/i);

  return {
    width: parseInt(width, 10),
    aspectRatio: parseInt(aspectRatio, 10),
    diameter: parseInt(diameter, 10),
    loadIndex: indexMatch?.[1],
    speedIndex: indexMatch?.[2],
  };
}

// Main scraper
async function scrapeProkoleso(): Promise<ScrapedTire[]> {
  console.log("Starting ProKoleso scraper...");
  console.log(`Target URL: ${BRIDGESTONE_URL}`);

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

    console.log("Navigating to Bridgestone catalog...");
    await page.goto(BRIDGESTONE_URL, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for product cards to load
    await page.waitForSelector(".product-card, .catalog-item, [data-product]", { timeout: 10000 }).catch(() => {
      console.log("Warning: Could not find product cards with expected selectors");
    });

    // Extract tire data from the page
    const tires = await page.evaluate(() => {
      const results: Array<{
        name: string;
        imageUrl: string;
        sourceUrl: string;
        description: string;
        sizes: string[];
      }> = [];

      // Try multiple selectors for product cards
      const selectors = [
        ".product-card",
        ".catalog-item",
        "[data-product]",
        ".product-list-item",
        ".product",
      ];

      let productElements: Element[] = [];
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          productElements = Array.from(elements);
          console.log(`Found ${elements.length} products with selector: ${selector}`);
          break;
        }
      }

      for (const product of productElements) {
        // Extract name
        const nameEl = product.querySelector("h2, h3, .product-name, .product-title, [itemprop='name']");
        const name = nameEl?.textContent?.trim() || "";

        if (!name || !name.toLowerCase().includes("bridgestone")) {
          continue;
        }

        // Extract image
        const imgEl = product.querySelector("img");
        const imageUrl = imgEl?.src || imgEl?.getAttribute("data-src") || "";

        // Extract link
        const linkEl = product.querySelector("a");
        const sourceUrl = linkEl?.href || "";

        // Extract description
        const descEl = product.querySelector(".description, .product-description, p");
        const description = descEl?.textContent?.trim() || "";

        // Extract sizes if available on listing page
        const sizeEls = product.querySelectorAll(".size, .product-size, [data-size]");
        const sizes = Array.from(sizeEls).map((el) => el.textContent?.trim() || "");

        results.push({
          name,
          imageUrl,
          sourceUrl,
          description,
          sizes: sizes.filter(Boolean),
        });
      }

      return results;
    });

    console.log(`Found ${tires.length} Bridgestone tire models`);

    // Process and enrich tire data
    const scrapedTires: ScrapedTire[] = tires.map((tire) => ({
      name: tire.name.replace(/^Bridgestone\s+/i, "").trim(),
      slug: createSlug(tire.name.replace(/^Bridgestone\s+/i, "")),
      season: determineSeason(tire.name + " " + tire.description),
      sizes: tire.sizes.map(parseSizeString).filter((s): s is ScrapedTireSize => s !== null),
      description: tire.description,
      imageUrl: tire.imageUrl,
      sourceUrl: tire.sourceUrl,
      scrapedAt: new Date().toISOString(),
    }));

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
 * Scrape detailed content for a single tire model page
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

    // Wait for content to load
    await page.waitForSelector("body", { timeout: 10000 });

    // Extract content from page
    const content = await page.evaluate(() => {
      // Extract model name from title or h1
      const titleEl = document.querySelector("h1, .product-title, [itemprop='name']");
      const rawTitle = titleEl?.textContent?.trim().replace(/\s+/g, " ") || "";
      const modelName = rawTitle
        .replace(/^Bridgestone\s+/i, "")
        .replace(/\s+\d{3}\/\d{2,3}\s*R\d{2}.*$/i, "") // Remove size from name
        .trim();

      // Extract full description
      // Look for description in various places
      const descriptionSelectors = [
        ".product-description",
        ".description",
        "[itemprop='description']",
        ".js-tab-content",
        ".product-info",
        ".about-product",
      ];

      let fullDescription = "";
      for (const selector of descriptionSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          const text = el.textContent?.trim().replace(/\s+/g, " ") || "";
          if (text.length > fullDescription.length) {
            fullDescription = text;
          }
        }
      }

      // Extract advantages/features from lists
      const advantages: string[] = [];
      // Navigation/menu patterns to exclude
      const excludePatterns = [
        "Головна", "Каталог", "Кошик", "Шини Шини", "Диски Диски",
        "Вантажні шини", "За сезоном", "За типорозміром", "За діаметром",
        "За брендом", "Підібрати", "Детальніше", "Оплата", "Доставка",
        "Купити", "В кошик", "Порівняти", "Контакти", "Про нас"
      ];
      const featureLists = document.querySelectorAll("ul li");
      featureLists.forEach((li) => {
        const text = li.textContent?.trim().replace(/\s+/g, " ") || "";
        // Filter out navigation items, keep product-related content
        const isNavigationItem = excludePatterns.some(pattern => text.includes(pattern));
        if (
          text.length > 15 &&
          text.length < 300 &&
          !isNavigationItem
        ) {
          advantages.push(text);
        }
      });

      // Extract specifications from table
      const specifications: Record<string, string> = {};
      const specRows = document.querySelectorAll("table tr, .specs-row, .characteristic");
      specRows.forEach((row) => {
        const cells = row.querySelectorAll("td, th, .spec-name, .spec-value");
        if (cells.length >= 2) {
          const key = cells[0].textContent?.trim().replace(/\s+/g, " ") || "";
          const value = cells[1].textContent?.trim().replace(/\s+/g, " ") || "";
          if (key && value) {
            specifications[key] = value;
          }
        }
      });

      // Try to extract from JSON-LD
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      let jsonLdData: any = null;
      if (jsonLdScript) {
        try {
          jsonLdData = JSON.parse(jsonLdScript.textContent || "{}");
        } catch {
          // Ignore parse errors
        }
      }

      // Extract season from content
      const pageText = document.body.textContent?.toLowerCase() || "";
      let season: "summer" | "winter" | "allseason" | undefined;
      if (pageText.includes("зимов") || pageText.includes("winter") || pageText.includes("blizzak")) {
        season = "winter";
      } else if (pageText.includes("всесезон") || pageText.includes("all season")) {
        season = "allseason";
      } else if (pageText.includes("літн") || pageText.includes("summer") || pageText.includes("turanza")) {
        season = "summer";
      }

      return {
        modelName,
        fullDescription,
        advantages: advantages.slice(0, 10), // Limit to 10 items
        specifications,
        season,
        jsonLdDescription: jsonLdData?.description,
      };
    });

    // Create slug from model name
    const modelSlug = content.modelName
      .toLowerCase()
      .replace(/[^a-z0-9а-яіїєґ\s-]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Combine descriptions
    const fullDescription = content.fullDescription || content.jsonLdDescription || "";

    const result: RawTyreContent = {
      source: "prokoleso",
      modelSlug,
      modelName: content.modelName,
      fullDescription,
      features: [],
      advantages: content.advantages,
      specifications: content.specifications,
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
 * Find all Bridgestone tire URLs from catalog page
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

    console.log(`Finding tire URLs from: ${BRIDGESTONE_URL}`);
    await page.goto(BRIDGESTONE_URL, { waitUntil: "networkidle2", timeout: 30000 });

    const urls = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="bridgestone"]');
      const uniqueUrls = new Set<string>();

      links.forEach((link) => {
        const href = (link as HTMLAnchorElement).href;
        // Filter for product pages (contain .html and bridgestone)
        if (href.includes(".html") && href.includes("bridgestone")) {
          uniqueUrls.add(href);
        }
      });

      return Array.from(uniqueUrls);
    });

    await page.close();

    if (shouldCloseBrowser && browser) {
      await browser.close();
    }

    console.log(`Found ${urls.length} tire URLs`);
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
    console.log(`\nScraped ${tires.length} tire models:`);
    tires.forEach((tire) => {
      console.log(`  - ${tire.name} (${tire.season}, ${tire.sizes.length} sizes)`);
    });

    if (tires.length > 0) {
      saveResults(tires);
    } else {
      console.log("\nNo tires found. The website structure may have changed.");
      console.log("Please check the selectors in the scraper.");
    }
  } catch (error) {
    console.error("Failed to scrape:", error);
    process.exit(1);
  }
}

// Run if called directly
main();

export { scrapeProkoleso, saveResults };
