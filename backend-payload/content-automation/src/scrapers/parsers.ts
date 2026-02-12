/**
 * Scraper Parsers
 *
 * Pure parsing/utility functions extracted from prokoleso.ts.
 * These have no side effects and are easily testable.
 */

import type { Brand } from "../types/content.js";
import type { ScrapedTire, ScrapedTireSize } from "./types.js";

/**
 * Determine tire season from descriptive text and model name.
 */
export function determineSeason(text: string, modelName: string): ScrapedTire["season"] {
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

/**
 * Create a URL-safe slug from a model name.
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Extract the model slug from a ProKoleso product URL.
 * e.g., "/shiny/bridgestone/blizzak-6/" => "blizzak-6"
 */
export function extractSourceSlug(url: string): string {
  const match = url.match(/\/shiny\/(?:bridgestone|firestone)\/([a-z0-9-]+)\/?$/i);
  return match?.[1] || "";
}

/**
 * Detect brand from a ProKoleso URL.
 */
export function detectBrandFromUrl(url: string): Brand {
  if (url.toLowerCase().includes("/firestone/")) {
    return "firestone";
  }
  return "bridgestone";
}

/**
 * Parse tire size from text like "205/55 R17".
 */
export function parseSizeFromText(text: string): ScrapedTireSize | null {
  const match = text.match(/(\d{3})\/(\d{2,3})\s*R(\d{2})/i);
  if (!match) return null;

  return {
    width: parseInt(match[1], 10),
    aspectRatio: parseInt(match[2], 10),
    diameter: parseInt(match[3], 10),
  };
}

/**
 * Parse speed index from text like "W (270 km/h)" or just "W".
 */
export function parseSpeedIndex(text: string): string | undefined {
  const match = text.match(/([A-Z])\s*(?:\(|$)/i);
  return match ? match[1].toUpperCase() : undefined;
}

/**
 * Parse load index from text like "96 (710 kg)" or just "96".
 */
export function parseLoadIndex(text: string): string | undefined {
  const match = text.match(/(\d{2,3})\s*(?:\(|$)/);
  return match ? match[1] : undefined;
}

/**
 * Map German recommendation tier text to a numeric rating (1.0-5.0 scale).
 * Used by TCS and GTÜ scrapers which use tier-based ratings instead of numeric.
 */
export function mapTierToRating(tierText: string): { rating: string; ratingNumeric: number } {
  const lower = tierText.toLowerCase().trim();

  if (lower.includes("sehr empfehlenswert") || lower.includes("sehr gut")) {
    return { rating: "sehr empfehlenswert", ratingNumeric: 1.0 };
  }
  if (lower.includes("empfehlenswert") || lower.includes("gut")) {
    return { rating: "empfehlenswert", ratingNumeric: 2.0 };
  }
  if (lower.includes("bedingt empfehlenswert") || lower.includes("befriedigend") || lower.includes("bedingt")) {
    return { rating: "bedingt empfehlenswert", ratingNumeric: 3.5 };
  }
  if (lower.includes("nicht empfohlen") || lower.includes("nicht empfehlenswert") || lower.includes("mangelhaft")) {
    return { rating: "nicht empfohlen", ratingNumeric: 5.0 };
  }

  // Fallback: try to extract numeric
  const numericMatch = tierText.match(/(\d+[.,]\d+)/);
  if (numericMatch) {
    const numeric = parseFloat(numericMatch[1].replace(",", "."));
    return { rating: tierText, ratingNumeric: numeric };
  }

  return { rating: tierText, ratingNumeric: 3.0 };
}

/**
 * Check if an extracted year value is plausible for a tyre test.
 * Returns true if the year is between 2021 and currentYear + 1 (tests can be published ahead).
 */
export function isPlausibleTestYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return Number.isInteger(year) && year >= 2021 && year <= currentYear + 1;
}

/**
 * Extract a plausible year from text, trying context-aware patterns first.
 * Returns null if no plausible year is found.
 */
export function extractPlausibleYear(text: string): number | null {
  // 1. Try context-aware patterns first (e.g. "Test 2025", "Reifentest 2024")
  const contextPatterns = [
    /(?:test|reifentest|sommerreifentest|winterreifentest|ganzjahresreifentest)\s*(\d{4})/i,
    /(\d{4})\s*(?:test|reifentest)/i,
    /(?:year|jahr|année|рік|год)\s*:?\s*(\d{4})/i,
  ];

  for (const pattern of contextPatterns) {
    const match = text.match(pattern);
    if (match) {
      const year = parseInt(match[1], 10);
      if (isPlausibleTestYear(year)) return year;
    }
  }

  // 2. Fallback: find all 4-digit sequences, pick the most plausible one
  const allFourDigit = [...text.matchAll(/\b(20[1-3]\d)\b/g)];
  for (const match of allFourDigit) {
    const year = parseInt(match[1], 10);
    if (isPlausibleTestYear(year)) return year;
  }

  return null;
}

/**
 * Normalize ratings from different test sources to a unified 1.0-5.0 scale.
 * Lower is better (consistent with ADAC where 1.0 = best).
 *
 * Scales:
 * - ADAC: 1.0 (sehr gut) to 5.0 (mangelhaft) — already normalized
 * - Auto Bild: 1.0 (vorbildlich) to 4.0 (nicht empfehlenswert) — scale to 1.0-5.0
 * - TyreReviews: percentage 0-100 — invert and scale to 1.0-5.0
 *
 * @param rating - The raw numeric rating
 * @param source - The test source identifier
 * @returns Normalized rating on 1.0-5.0 scale (lower = better)
 */
export function normalizeRating(rating: number, source: string): number {
  switch (source) {
    case "adac":
      // Already on 1.0-5.0 scale
      return Math.max(1.0, Math.min(5.0, rating));

    case "autobild":
      // Scale from 1.0-4.0 to 1.0-5.0
      // 1.0 -> 1.0, 4.0 -> 5.0
      return Math.max(1.0, Math.min(5.0, 1.0 + ((rating - 1.0) / 3.0) * 4.0));

    case "tyrereviews": {
      // Percentage (0-100) where higher is better
      // Invert: 100% -> 1.0, 0% -> 5.0
      const clampedPct = Math.max(0, Math.min(100, rating));
      return 5.0 - (clampedPct / 100) * 4.0;
    }

    case "oeamtc":
      // Scale 0.5-5.5, same direction as ADAC (lower = better)
      // Clamp to 1.0-5.0
      return Math.max(1.0, Math.min(5.0, rating));

    case "tcs":
    case "gtue":
      // Tier-based: already converted to numeric by scraper
      // "sehr empfehlenswert" → 1.0, "empfehlenswert" → 2.0,
      // "bedingt empfehlenswert" → 3.5, "nicht empfohlen" → 5.0
      return Math.max(1.0, Math.min(5.0, rating));

    default:
      // Unknown source: return as-is, clamped to valid range
      return Math.max(1.0, Math.min(5.0, rating));
  }
}
