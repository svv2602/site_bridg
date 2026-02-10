/**
 * Unit Tests for Test Scraper Rating Parsers
 *
 * Tests the rating parsing and helper functions in ADAC, Auto Bild, and TyreReviews scrapers.
 * These functions are not exported, so we test through the shared generateTestUid() and normalizeRating().
 * We also test the ADAC/AutoBild RATING_MAP constants indirectly via expected behavior.
 *
 * Note: parseRating() functions in adac.ts and autobild.ts are module-private (not exported).
 * We test normalizeRating() from parsers.ts which covers the cross-source normalization,
 * and generateTestUid() from types.ts which covers test UID generation.
 */
import { describe, it, expect } from "vitest";
import { generateTestUid } from "./types.js";
import { normalizeRating } from "./parsers.js";

describe("generateTestUid", () => {
  it("should generate UID for ADAC test", () => {
    expect(generateTestUid("adac", "summer", 2025, "205/55 R16")).toBe(
      "adac-summer-2025-205-55-16"
    );
  });

  it("should generate UID for Auto Bild test", () => {
    expect(generateTestUid("autobild", "winter", 2024, "225/45 R17")).toBe(
      "autobild-winter-2024-225-45-17"
    );
  });

  it("should generate UID for TyreReviews with source prefix", () => {
    // TyreReviews uses "tyrereviews-${originalSource}" as source
    expect(
      generateTestUid("tyrereviews-adac", "summer", 2025, "205/55 R16")
    ).toBe("tyrereviews-adac-summer-2025-205-55-16");
  });

  it("should normalize size with slashes and spaces", () => {
    expect(generateTestUid("adac", "summer", 2025, "225/50 R17")).toBe(
      "adac-summer-2025-225-50-17"
    );
  });

  it("should handle lowercase R in size", () => {
    expect(generateTestUid("adac", "summer", 2025, "205/55 r16")).toBe(
      "adac-summer-2025-205-55-16"
    );
  });

  it("should handle allseason test type", () => {
    expect(
      generateTestUid("adac", "allseason", 2025, "195/65 R15")
    ).toBe("adac-allseason-2025-195-65-15");
  });
});

describe("normalizeRating - ADAC scale (1.0 to 5.0)", () => {
  // ADAC ratings map:
  // sehr gut = 1.0
  // gut = 2.0
  // befriedigend = 3.0
  // ausreichend = 4.0
  // mangelhaft = 5.0

  it("should normalize 'sehr gut' rating (1.0)", () => {
    expect(normalizeRating(1.0, "adac")).toBe(1.0);
  });

  it("should normalize 'gut' rating (2.0)", () => {
    expect(normalizeRating(2.0, "adac")).toBe(2.0);
  });

  it("should normalize 'befriedigend' rating (3.0)", () => {
    expect(normalizeRating(3.0, "adac")).toBe(3.0);
  });

  it("should normalize 'ausreichend' rating (4.0)", () => {
    expect(normalizeRating(4.0, "adac")).toBe(4.0);
  });

  it("should normalize 'mangelhaft' rating (5.0)", () => {
    expect(normalizeRating(5.0, "adac")).toBe(5.0);
  });

  it("should handle intermediate values (1.8)", () => {
    expect(normalizeRating(1.8, "adac")).toBe(1.8);
  });
});

describe("normalizeRating - Auto Bild scale (1.0 to 4.0 -> 1.0 to 5.0)", () => {
  // Auto Bild rating map:
  // vorbildlich = 1.0 -> normalized 1.0
  // sehr empfehlenswert = 1.5 -> between 1.0 and 5.0
  // empfehlenswert = 2.0 -> somewhere in middle
  // bedingt empfehlenswert = 3.0 -> higher
  // nicht empfehlenswert = 4.0 -> normalized 5.0

  it("should map 'vorbildlich' (1.0) to 1.0", () => {
    expect(normalizeRating(1.0, "autobild")).toBeCloseTo(1.0, 1);
  });

  it("should map 'nicht empfehlenswert' (4.0) to 5.0", () => {
    expect(normalizeRating(4.0, "autobild")).toBeCloseTo(5.0, 1);
  });

  it("should map 'empfehlenswert' (2.0) to mid-range", () => {
    const result = normalizeRating(2.0, "autobild");
    expect(result).toBeGreaterThan(1.5);
    expect(result).toBeLessThan(3.5);
  });

  it("should map 'bedingt empfehlenswert' (3.0) to higher range", () => {
    const result = normalizeRating(3.0, "autobild");
    expect(result).toBeGreaterThan(3.0);
    expect(result).toBeLessThanOrEqual(5.0);
  });

  it("should produce monotonically increasing results", () => {
    const r1 = normalizeRating(1.0, "autobild");
    const r2 = normalizeRating(2.0, "autobild");
    const r3 = normalizeRating(3.0, "autobild");
    const r4 = normalizeRating(4.0, "autobild");
    expect(r1).toBeLessThan(r2);
    expect(r2).toBeLessThan(r3);
    expect(r3).toBeLessThan(r4);
  });
});

describe("normalizeRating - TyreReviews scale (0-100% -> 5.0 to 1.0)", () => {
  // TyreReviews: percentage where 100% = best
  // Normalized: 100% -> 1.0, 0% -> 5.0

  it("should map 100% to 1.0 (best)", () => {
    expect(normalizeRating(100, "tyrereviews")).toBeCloseTo(1.0, 1);
  });

  it("should map 0% to 5.0 (worst)", () => {
    expect(normalizeRating(0, "tyrereviews")).toBeCloseTo(5.0, 1);
  });

  it("should map 50% to 3.0 (middle)", () => {
    expect(normalizeRating(50, "tyrereviews")).toBeCloseTo(3.0, 1);
  });

  it("should map 75% to 2.0", () => {
    expect(normalizeRating(75, "tyrereviews")).toBeCloseTo(2.0, 1);
  });

  it("should map 25% to 4.0", () => {
    expect(normalizeRating(25, "tyrereviews")).toBeCloseTo(4.0, 1);
  });

  it("should clamp values above 100%", () => {
    expect(normalizeRating(150, "tyrereviews")).toBeCloseTo(1.0, 1);
  });

  it("should clamp negative values", () => {
    expect(normalizeRating(-10, "tyrereviews")).toBeCloseTo(5.0, 1);
  });

  it("should produce monotonically decreasing results for increasing percentages", () => {
    const r0 = normalizeRating(0, "tyrereviews");
    const r25 = normalizeRating(25, "tyrereviews");
    const r50 = normalizeRating(50, "tyrereviews");
    const r75 = normalizeRating(75, "tyrereviews");
    const r100 = normalizeRating(100, "tyrereviews");
    expect(r0).toBeGreaterThan(r25);
    expect(r25).toBeGreaterThan(r50);
    expect(r50).toBeGreaterThan(r75);
    expect(r75).toBeGreaterThan(r100);
  });
});

describe("normalizeRating - cross-source comparison", () => {
  it("should produce comparable ratings: ADAC gut (2.0) ~ TyreReviews 75% ~ AutoBild empfehlenswert (2.0)", () => {
    const adac = normalizeRating(2.0, "adac");       // 2.0
    const tyrereviews = normalizeRating(75, "tyrereviews");  // ~2.0
    const autobild = normalizeRating(2.0, "autobild"); // ~2.33

    // All should be in "good" range (1.5-3.0)
    expect(adac).toBeGreaterThanOrEqual(1.5);
    expect(adac).toBeLessThanOrEqual(3.0);
    expect(tyrereviews).toBeGreaterThanOrEqual(1.5);
    expect(tyrereviews).toBeLessThanOrEqual(3.0);
    expect(autobild).toBeGreaterThanOrEqual(1.5);
    expect(autobild).toBeLessThanOrEqual(3.0);
  });

  it("should produce comparable worst ratings: ADAC 5.0 ~ TyreReviews 0% ~ AutoBild 4.0", () => {
    const adac = normalizeRating(5.0, "adac");
    const tyrereviews = normalizeRating(0, "tyrereviews");
    const autobild = normalizeRating(4.0, "autobild");

    // All should be at worst (5.0)
    expect(adac).toBeCloseTo(5.0, 1);
    expect(tyrereviews).toBeCloseTo(5.0, 1);
    expect(autobild).toBeCloseTo(5.0, 1);
  });
});
