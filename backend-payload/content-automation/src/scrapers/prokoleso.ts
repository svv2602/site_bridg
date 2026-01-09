/**
 * ProKoleso.ua Scraper for Bridgestone Tires
 *
 * Scrapes tire data from https://prokoleso.ua/shiny/bridgestone/
 */

import puppeteer, { type Browser, type Page } from "puppeteer";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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
