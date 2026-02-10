/**
 * Unit Tests for Scraper Parsers
 *
 * Tests for pure parsing/utility functions extracted from prokoleso.ts.
 */
import { describe, it, expect } from "vitest";
import {
  determineSeason,
  createSlug,
  extractSourceSlug,
  parseSizeFromText,
  parseSpeedIndex,
  parseLoadIndex,
  detectBrandFromUrl,
  normalizeRating,
} from "./parsers.js";

describe("determineSeason", () => {
  it("should detect summer for generic tire text", () => {
    expect(determineSeason("Turanza 6", "Turanza 6")).toBe("summer");
  });

  it("should detect winter for blizzak models", () => {
    expect(determineSeason("", "Blizzak LM005")).toBe("winter");
  });

  it("should detect winter from 'зимов' keyword", () => {
    expect(determineSeason("Зимова шина для легкових авто", "DM-V3")).toBe("winter");
  });

  it("should detect winter from 'winter' keyword", () => {
    expect(determineSeason("Winter tire", "SomeModel")).toBe("winter");
  });

  it("should detect winter from 'ice' keyword", () => {
    expect(determineSeason("Ice tire", "Ice Cruiser")).toBe("winter");
  });

  it("should detect allseason from 'всесезон' keyword", () => {
    expect(determineSeason("Всесезонна шина", "WeatherPeak")).toBe("allseason");
  });

  it("should detect allseason from 'all season' keyword", () => {
    expect(determineSeason("All Season performance", "X")).toBe("allseason");
  });

  it("should detect allseason from 'Weather Control' model", () => {
    expect(determineSeason("", "Weather Control A005 EVO")).toBe("allseason");
  });

  it("should detect allseason from 'A/T' (all terrain) in text", () => {
    expect(determineSeason("Dueler A/T 001", "Dueler")).toBe("allseason");
  });

  it("should prioritize allseason over winter keywords", () => {
    // allseason is checked before winter
    expect(determineSeason("all season winter capable", "Model")).toBe("allseason");
  });

  it("should return summer as default", () => {
    expect(determineSeason("", "")).toBe("summer");
  });
});

describe("createSlug", () => {
  it("should convert name to lowercase slug", () => {
    expect(createSlug("Turanza 6")).toBe("turanza-6");
  });

  it("should replace multiple spaces with single dash", () => {
    expect(createSlug("Blizzak  LM  005")).toBe("blizzak-lm-005");
  });

  it("should remove special characters", () => {
    expect(createSlug("Turanza T005 (225/45R17)")).toBe("turanza-t005-22545r17");
  });

  it("should collapse multiple dashes", () => {
    expect(createSlug("Turanza---T005")).toBe("turanza-t005");
  });

  it("should handle empty string", () => {
    expect(createSlug("")).toBe("");
  });
});

describe("extractSourceSlug", () => {
  it("should extract slug from bridgestone URL", () => {
    expect(extractSourceSlug("/shiny/bridgestone/blizzak-6/")).toBe("blizzak-6");
  });

  it("should extract slug from firestone URL", () => {
    expect(extractSourceSlug("/shiny/firestone/roadhawk/")).toBe("roadhawk");
  });

  it("should extract slug without trailing slash", () => {
    expect(extractSourceSlug("/shiny/bridgestone/turanza-6")).toBe("turanza-6");
  });

  it("should return empty string for invalid URL", () => {
    expect(extractSourceSlug("/other/path")).toBe("");
  });

  it("should return empty string for empty string", () => {
    expect(extractSourceSlug("")).toBe("");
  });
});

describe("detectBrandFromUrl", () => {
  it("should detect firestone brand", () => {
    expect(detectBrandFromUrl("/shiny/firestone/roadhawk/")).toBe("firestone");
  });

  it("should detect bridgestone brand by default", () => {
    expect(detectBrandFromUrl("/shiny/bridgestone/turanza-6/")).toBe("bridgestone");
  });

  it("should default to bridgestone for unknown URLs", () => {
    expect(detectBrandFromUrl("/other/path")).toBe("bridgestone");
  });
});

describe("parseSizeFromText", () => {
  it("should parse standard size format", () => {
    expect(parseSizeFromText("205/55 R17")).toEqual({
      width: 205,
      aspectRatio: 55,
      diameter: 17,
    });
  });

  it("should parse size without space before R", () => {
    expect(parseSizeFromText("225/45R18")).toEqual({
      width: 225,
      aspectRatio: 45,
      diameter: 18,
    });
  });

  it("should parse size embedded in longer text", () => {
    expect(parseSizeFromText("Tire size: 195/65 R15 91H")).toEqual({
      width: 195,
      aspectRatio: 65,
      diameter: 15,
    });
  });

  it("should return null for invalid text", () => {
    expect(parseSizeFromText("невалідний текст")).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(parseSizeFromText("")).toBeNull();
  });

  it("should parse 3-digit aspect ratio", () => {
    expect(parseSizeFromText("295/100 R20")).toEqual({
      width: 295,
      aspectRatio: 100,
      diameter: 20,
    });
  });
});

describe("parseSpeedIndex", () => {
  it("should parse speed index with description", () => {
    expect(parseSpeedIndex("W (270 km/h)")).toBe("W");
  });

  it("should parse single letter speed index", () => {
    expect(parseSpeedIndex("V")).toBe("V");
  });

  it("should handle lowercase input", () => {
    expect(parseSpeedIndex("h")).toBe("H");
  });

  it("should return undefined for empty string", () => {
    expect(parseSpeedIndex("")).toBeUndefined();
  });

  it("should return undefined for numeric-only input", () => {
    expect(parseSpeedIndex("123")).toBeUndefined();
  });
});

describe("parseLoadIndex", () => {
  it("should parse load index with description", () => {
    expect(parseLoadIndex("96 (710 kg)")).toBe("96");
  });

  it("should parse standalone load index", () => {
    expect(parseLoadIndex("91")).toBe("91");
  });

  it("should parse 3-digit load index", () => {
    expect(parseLoadIndex("109 (1030 kg)")).toBe("109");
  });

  it("should return undefined for empty string", () => {
    expect(parseLoadIndex("")).toBeUndefined();
  });

  it("should return undefined for non-numeric input", () => {
    expect(parseLoadIndex("abc")).toBeUndefined();
  });
});

describe("normalizeRating", () => {
  describe("ADAC ratings (already 1.0-5.0)", () => {
    it("should return 1.0 for best rating", () => {
      expect(normalizeRating(1.0, "adac")).toBe(1.0);
    });

    it("should return 5.0 for worst rating", () => {
      expect(normalizeRating(5.0, "adac")).toBe(5.0);
    });

    it("should pass through intermediate ratings", () => {
      expect(normalizeRating(2.5, "adac")).toBe(2.5);
    });

    it("should clamp below 1.0", () => {
      expect(normalizeRating(0.5, "adac")).toBe(1.0);
    });

    it("should clamp above 5.0", () => {
      expect(normalizeRating(6.0, "adac")).toBe(5.0);
    });
  });

  describe("Auto Bild ratings (1.0-4.0 -> 1.0-5.0)", () => {
    it("should map 1.0 (vorbildlich) to 1.0", () => {
      expect(normalizeRating(1.0, "autobild")).toBeCloseTo(1.0, 1);
    });

    it("should map 4.0 (nicht empfehlenswert) to 5.0", () => {
      expect(normalizeRating(4.0, "autobild")).toBeCloseTo(5.0, 1);
    });

    it("should map 2.0 (empfehlenswert) to approximately 2.33", () => {
      const result = normalizeRating(2.0, "autobild");
      expect(result).toBeGreaterThan(2.0);
      expect(result).toBeLessThan(3.0);
    });
  });

  describe("TyreReviews ratings (percentage 0-100 -> 1.0-5.0 inverted)", () => {
    it("should map 100% to 1.0 (best)", () => {
      expect(normalizeRating(100, "tyrereviews")).toBeCloseTo(1.0, 1);
    });

    it("should map 0% to 5.0 (worst)", () => {
      expect(normalizeRating(0, "tyrereviews")).toBeCloseTo(5.0, 1);
    });

    it("should map 50% to 3.0 (middle)", () => {
      expect(normalizeRating(50, "tyrereviews")).toBeCloseTo(3.0, 1);
    });

    it("should clamp above 100%", () => {
      expect(normalizeRating(150, "tyrereviews")).toBeCloseTo(1.0, 1);
    });
  });

  describe("unknown source", () => {
    it("should clamp to valid range", () => {
      expect(normalizeRating(3.0, "unknown")).toBe(3.0);
    });

    it("should clamp below 1.0", () => {
      expect(normalizeRating(-1, "unknown")).toBe(1.0);
    });
  });
});
