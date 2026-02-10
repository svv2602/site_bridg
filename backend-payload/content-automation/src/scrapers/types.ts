/**
 * Scraper Types
 *
 * Shared types used by scrapers, scheduler, and pipeline components.
 * Extracted from prokoleso.ts for reuse and testability.
 */

import type { Brand } from "../types/content.js";

// === Scraped Tire Types ===

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
  brand: Brand;              // Brand: bridgestone or firestone
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

// === Pipeline Processing Types ===

/**
 * Processing flags that downstream pipeline adds to scraped records.
 * These are runtime-only properties managed by scheduler.ts, not part of the scraper output.
 */
export interface ProcessingFlags {
  aiGenerated?: boolean;
  generatedContent?: unknown;
  publishedToPayload?: boolean;
  publishedAt?: string;
  skippedReason?: string;
  missingFields?: string[];
}

/**
 * A scraped tire record with optional processing flags from the pipeline.
 */
export type ExistingTireRecord = ScrapedTire & ProcessingFlags;

// === Test Scraper Interface ===

/**
 * Abstract interface for test-result scrapers (ADAC, Auto Bild, TyreReviews).
 * Defines the common discover-scrape pattern used by all test scrapers.
 */
export interface TestScraper {
  source: string;
  discover(page: import("playwright").Page): Promise<string[]>;
  scrape(page: import("playwright").Page, url: string): Promise<TestScraperResult | null>;
}

export interface TestScraperResult {
  testsNew: number;
  testsUpdated: number;
}

/**
 * Generate a unique identifier for a test result.
 * Extracted from duplicated implementations in adac.ts, autobild.ts, tyrereviews.ts.
 *
 * Note: tyrereviews.ts uses a slightly different format with originalSource prefix.
 * For tyrereviews, pass `tyrereviews-${originalSource}` as the source parameter.
 */
export function generateTestUid(source: string, testType: string, year: number, size: string): string {
  const sizeNormalized = size.toLowerCase().replace(/[\/\s]/g, "-").replace("r", "");
  return `${source}-${testType}-${year}-${sizeNormalized}`;
}

// === Scrape Result Types ===

export interface ScrapeOptions {
  force?: boolean;
}

export interface ScrapeResult {
  tires: ScrapedTire[];
  skippedSlugs: Set<string>;
  existingData: Map<string, ExistingTireRecord>;
  sanityWarnings?: string[];
}
