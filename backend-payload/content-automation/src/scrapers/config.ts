/**
 * Scraper Configuration
 *
 * Configuration constants for ProKoleso and other scrapers.
 * Extracted from prokoleso.ts for separation of concerns.
 */

import type { Brand } from "../types/content.js";

// === ProKoleso Configuration ===

export const BASE_URL = "https://prokoleso.ua";
export const MAX_CATALOG_PAGES = 5;

// === User-Agent Pool ===

/**
 * Pool of modern User-Agent strings for rotation.
 * Updated to reflect current browser versions.
 */
export const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
];

/**
 * Get a random User-Agent string from the pool.
 */
export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// === Brand Catalog Configuration ===

/**
 * Catalog page URLs for each brand on ProKoleso.
 */
export const BRAND_CATALOGS: Record<Brand, string[]> = {
  bridgestone: [
    `${BASE_URL}/shiny/bridgestone/`,             // Main Bridgestone catalog
    `${BASE_URL}/shiny/letnie/bridgestone/`,      // Summer
    `${BASE_URL}/shiny/zimnie/bridgestone/`,      // Winter
    `${BASE_URL}/shiny/vsesezonie/bridgestone/`,  // All-season
  ],
  firestone: [
    `${BASE_URL}/shiny/firestone/`,               // Main Firestone catalog
    `${BASE_URL}/shiny/letnie/firestone/`,        // Summer
    `${BASE_URL}/shiny/zimnie/firestone/`,        // Winter
    `${BASE_URL}/shiny/vsesezonie/firestone/`,    // All-season
  ],
};

/** @deprecated Use BRAND_CATALOGS.bridgestone instead */
export const BRIDGESTONE_CATALOGS = BRAND_CATALOGS.bridgestone;

/**
 * Model pages that exist but are not linked from catalog navigation.
 */
export const ADDITIONAL_MODEL_URLS: Record<Brand, string[]> = {
  bridgestone: [
    `${BASE_URL}/ua/shiny/bridgestone/turanza-all-season-6/`,
    `${BASE_URL}/ua/shiny/bridgestone/weather-control-a005-evo/`,
  ],
  firestone: [],
};

// === Sanity Check Configuration ===

/**
 * Minimum number of models expected per brand.
 * Triggers a warning if scrape returns fewer results.
 */
export const MINIMUM_MODELS_PER_BRAND: Record<Brand, number> = {
  bridgestone: 5,
  firestone: 3,
};

/**
 * Percentage threshold for model count drop between runs.
 * Triggers a warning if new count drops by this much compared to previous run.
 */
export const DROP_THRESHOLD_PERCENT = 50;

// === Adaptive Rate Limiting ===

export interface AdaptiveDelayConfig {
  /** Base delay in ms between requests */
  baseDelayMs: number;
  /** Minimum delay in ms (floor) */
  minDelayMs: number;
  /** Maximum delay in ms (ceiling) */
  maxDelayMs: number;
  /** Factor to increase delay on error (e.g. 2.0 = double) */
  backoffFactor: number;
  /** Factor to decrease delay on success (e.g. 0.9 = 10% reduction) */
  cooldownFactor: number;
}

const DEFAULT_ADAPTIVE_DELAY: AdaptiveDelayConfig = {
  baseDelayMs: 500,
  minDelayMs: 300,
  maxDelayMs: 10000,
  backoffFactor: 2.0,
  cooldownFactor: 0.9,
};

/**
 * Adaptive rate limiter that increases delay on errors (429/503)
 * and gradually decreases it on successful responses.
 */
export class AdaptiveDelay {
  private currentDelayMs: number;
  private config: AdaptiveDelayConfig;

  constructor(config: Partial<AdaptiveDelayConfig> = {}) {
    this.config = { ...DEFAULT_ADAPTIVE_DELAY, ...config };
    this.currentDelayMs = this.config.baseDelayMs;
  }

  /**
   * Wait for the current delay period.
   */
  async wait(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.currentDelayMs));
  }

  /**
   * Report a successful request. Gradually decreases delay.
   */
  onSuccess(): void {
    this.currentDelayMs = Math.max(
      this.config.minDelayMs,
      this.currentDelayMs * this.config.cooldownFactor,
    );
  }

  /**
   * Report a rate-limited or server error response.
   * Increases delay by the backoff factor.
   */
  onError(): void {
    this.currentDelayMs = Math.min(
      this.config.maxDelayMs,
      this.currentDelayMs * this.config.backoffFactor,
    );
  }

  /**
   * Get the current delay in ms (for logging).
   */
  getCurrentDelay(): number {
    return Math.round(this.currentDelayMs);
  }
}
