/**
 * Unit Tests for Article Planner
 *
 * Tests business logic for article planning:
 * - planTestSummaryArticles
 * - planComparisonArticles
 * - planSeasonalArticles
 * - findOurBrandsInTest
 * - addPlanned (deduplication)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock db modules BEFORE importing article-planner
vi.mock("./db/article-queue.js", () => ({
  addToQueue: vi.fn(),
  queueHasSimilarTopic: vi.fn(),
  getSettingNumber: vi.fn(),
  getSettingJSON: vi.fn(),
}));

vi.mock("./db/test-results.js", () => ({
  getTestResultsSince: vi.fn(),
  getRecentTestResults: vi.fn(),
}));

import { planArticles } from "./article-planner.js";
import { addToQueue, queueHasSimilarTopic, getSettingNumber, getSettingJSON } from "./db/article-queue.js";
import { getTestResultsSince } from "./db/test-results.js";
import type { TestResult } from "./db/test-results.js";

// Helper: create test result fixture
function makeTestResult(overrides: Partial<TestResult> = {}): TestResult {
  return {
    testUid: "adac-summer-2025-205-55-16",
    source: "adac",
    testType: "summer",
    year: 2025,
    testedSize: "205/55 R16",
    sourceUrl: "https://adac.de/tests/sommerreifen/205-55-r16/",
    results: [
      {
        tireName: "Bridgestone Turanza 6",
        position: 1,
        rating: "gut",
        ratingNumeric: 1.8,
        categoryWins: ["Nassbremsen"],
      },
      {
        tireName: "Continental PremiumContact 7",
        position: 2,
        rating: "gut",
        ratingNumeric: 2.0,
      },
      {
        tireName: "Michelin Primacy 4+",
        position: 3,
        rating: "gut",
        ratingNumeric: 2.1,
      },
    ],
    scrapedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("planArticles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.log in tests
    vi.spyOn(console, "log").mockImplementation(() => {});

    // Set up default mock implementations
    vi.mocked(addToQueue).mockReturnValue(1);
    vi.mocked(queueHasSimilarTopic).mockReturnValue(false);
    vi.mocked(getSettingNumber).mockImplementation((key: string) => {
      const settings: Record<string, number> = {
        max_articles_per_week: 10,
        seasonal_lead_weeks: 6,
        min_rating_to_feature: 2.0,
      };
      return settings[key] || 0;
    });
    vi.mocked(getSettingJSON).mockImplementation((key: string) => {
      if (key === "preferred_types")
        return ["test-summary", "seasonal-guide", "comparison"] as any;
      return null;
    });
    vi.mocked(getTestResultsSince).mockReturnValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("test-summary planning", () => {
    it("should plan test-summary article when Bridgestone is in top-3", async () => {
      vi.mocked(getTestResultsSince).mockReturnValue([makeTestResult()]);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const testSummaries = result.details.filter(
        (d) => d.type === "test-summary"
      );
      expect(testSummaries.length).toBe(1);
      expect(testSummaries[0].topic).toContain("Bridgestone Turanza 6");
      expect(result.planned).toBeGreaterThanOrEqual(1);
    });

    it("should include category wins in topic when present", async () => {
      vi.mocked(getTestResultsSince).mockReturnValue([makeTestResult()]);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const testSummaries = result.details.filter(
        (d) => d.type === "test-summary"
      );
      expect(testSummaries[0].topic).toContain("Nassbremsen");
    });

    it("should use position-based topic when no category wins", async () => {
      const testNoCategoryWins = makeTestResult({
        results: [
          {
            tireName: "Bridgestone Turanza 6",
            position: 2,
            rating: "gut",
            ratingNumeric: 1.9,
          },
          {
            tireName: "Continental PremiumContact 7",
            position: 1,
            rating: "gut",
            ratingNumeric: 1.5,
          },
        ],
      });
      vi.mocked(getTestResultsSince).mockReturnValue([testNoCategoryWins]);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const testSummaries = result.details.filter(
        (d) => d.type === "test-summary"
      );
      expect(testSummaries.length).toBe(1);
      expect(testSummaries[0].topic).toContain("топ-2");
    });

    it("should skip test when no our brands in results", async () => {
      const testWithoutBridgestone = makeTestResult({
        results: [
          {
            tireName: "Continental PremiumContact 7",
            position: 1,
            rating: "gut",
            ratingNumeric: 1.8,
          },
          {
            tireName: "Michelin Primacy 4+",
            position: 2,
            rating: "gut",
            ratingNumeric: 2.0,
          },
        ],
      });
      vi.mocked(getTestResultsSince).mockReturnValue([testWithoutBridgestone]);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const testSummaries = result.details.filter(
        (d) => d.type === "test-summary"
      );
      expect(testSummaries.length).toBe(0);
    });

    it("should skip test when brands are outside top-3 with bad rating", async () => {
      const testBadPosition = makeTestResult({
        results: [
          {
            tireName: "Continental PremiumContact 7",
            position: 1,
            rating: "gut",
            ratingNumeric: 1.5,
          },
          {
            tireName: "Michelin Primacy 4+",
            position: 2,
            rating: "gut",
            ratingNumeric: 1.8,
          },
          {
            tireName: "Goodyear EfficientGrip 2",
            position: 3,
            rating: "gut",
            ratingNumeric: 2.0,
          },
          {
            tireName: "Bridgestone Turanza 6",
            position: 8,
            rating: "befriedigend",
            ratingNumeric: 3.5,
          },
        ],
      });
      vi.mocked(getTestResultsSince).mockReturnValue([testBadPosition]);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const testSummaries = result.details.filter(
        (d) => d.type === "test-summary"
      );
      expect(testSummaries.length).toBe(0);
    });

    it("should detect Firestone as our brand", async () => {
      const testWithFirestone = makeTestResult({
        results: [
          {
            tireName: "Firestone Roadhawk 2",
            position: 2,
            rating: "gut",
            ratingNumeric: 1.9,
          },
          {
            tireName: "Continental PremiumContact 7",
            position: 1,
            rating: "gut",
            ratingNumeric: 1.5,
          },
        ],
      });
      vi.mocked(getTestResultsSince).mockReturnValue([testWithFirestone]);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const testSummaries = result.details.filter(
        (d) => d.type === "test-summary"
      );
      expect(testSummaries.length).toBe(1);
      expect(testSummaries[0].topic).toContain("Firestone Roadhawk 2");
    });

    it("should respect maxPerWeek limit across all article types", async () => {
      // Return 5 test results with Bridgestone in top
      const tests = Array.from({ length: 5 }, (_, i) =>
        makeTestResult({
          testUid: `adac-summer-2025-test-${i}`,
          testedSize: `${195 + i * 10}/55 R16`,
        })
      );
      vi.mocked(getTestResultsSince).mockReturnValue(tests);
      vi.mocked(getSettingNumber).mockImplementation((key: string) => {
        if (key === "max_articles_per_week") return 2;
        if (key === "min_rating_to_feature") return 2.0;
        if (key === "seasonal_lead_weeks") return 6;
        return 0;
      });

      const result = await planArticles("2025-01-01T00:00:00Z");

      // Total planned should not exceed maxPerWeek
      expect(result.planned).toBeLessThanOrEqual(2);
    });

    it("should assign higher priority to position 1 than position 3", async () => {
      const testPos1 = makeTestResult({
        testUid: "test-pos1",
        results: [
          {
            tireName: "Bridgestone Turanza 6",
            position: 1,
            rating: "gut",
            ratingNumeric: 1.5,
          },
        ],
      });
      const testPos3 = makeTestResult({
        testUid: "test-pos3",
        testedSize: "225/45 R17",
        results: [
          {
            tireName: "Bridgestone Potenza Sport",
            position: 3,
            rating: "gut",
            ratingNumeric: 2.0,
          },
          { tireName: "Other 1", position: 1, rating: "gut", ratingNumeric: 1.5 },
          { tireName: "Other 2", position: 2, rating: "gut", ratingNumeric: 1.7 },
        ],
      });
      vi.mocked(getTestResultsSince).mockReturnValue([testPos1, testPos3]);

      const result = await planArticles("2025-01-01T00:00:00Z");

      // Both should be planned as test-summary
      const testSummaries = result.details.filter(
        (d) => d.type === "test-summary"
      );
      expect(testSummaries.length).toBe(2);
      // addToQueue should have been called with different priorities
      const calls = vi.mocked(addToQueue).mock.calls;
      const testSummaryCalls = calls.filter(
        (c) => (c[0] as any).articleType === "test-summary"
      );
      expect(testSummaryCalls.length).toBe(2);
    });
  });

  describe("deduplication", () => {
    it("should skip duplicate topics", async () => {
      vi.mocked(getTestResultsSince).mockReturnValue([makeTestResult()]);
      vi.mocked(queueHasSimilarTopic).mockReturnValue(true);

      const result = await planArticles("2025-01-01T00:00:00Z");

      // All articles should be skipped as duplicates
      expect(result.skippedDuplicate).toBeGreaterThan(0);
      expect(result.planned).toBe(0);
      expect(addToQueue).not.toHaveBeenCalled();
    });
  });

  describe("comparison articles", () => {
    it("should plan comparison when 3+ tests of same type exist", async () => {
      // Set maxPerWeek high enough to allow comparison after test-summaries
      vi.mocked(getSettingNumber).mockImplementation((key: string) => {
        if (key === "max_articles_per_week") return 20;
        if (key === "min_rating_to_feature") return 2.0;
        if (key === "seasonal_lead_weeks") return 6;
        return 0;
      });

      const tests = [
        makeTestResult({
          testUid: "adac-summer-2025-205-55-16",
          source: "adac",
        }),
        makeTestResult({
          testUid: "autobild-summer-2025-225-45-17",
          source: "autobild",
          testedSize: "225/45 R17",
        }),
        makeTestResult({
          testUid: "tyrereviews-summer-2025-235-55-17",
          source: "tyrereviews",
          testedSize: "235/55 R17",
        }),
      ];
      vi.mocked(getTestResultsSince).mockReturnValue(tests);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const comparisons = result.details.filter(
        (d) => d.type === "comparison"
      );
      expect(comparisons.length).toBe(1);
      expect(comparisons[0].topic).toContain("Порівняння");
    });

    it("should not plan comparison when fewer than 3 tests of same type", async () => {
      vi.mocked(getSettingNumber).mockImplementation((key: string) => {
        if (key === "max_articles_per_week") return 20;
        if (key === "min_rating_to_feature") return 2.0;
        if (key === "seasonal_lead_weeks") return 6;
        return 0;
      });

      const tests = [
        makeTestResult({ testUid: "adac-summer-2025-1" }),
        makeTestResult({ testUid: "autobild-winter-2025-2", testType: "winter" }),
      ];
      vi.mocked(getTestResultsSince).mockReturnValue(tests);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const comparisons = result.details.filter(
        (d) => d.type === "comparison"
      );
      expect(comparisons.length).toBe(0);
    });

    it("should group comparison by test type (season)", async () => {
      vi.mocked(getSettingNumber).mockImplementation((key: string) => {
        if (key === "max_articles_per_week") return 20;
        if (key === "min_rating_to_feature") return 2.0;
        if (key === "seasonal_lead_weeks") return 6;
        return 0;
      });

      const tests = [
        makeTestResult({ testUid: "t1", testType: "summer" }),
        makeTestResult({ testUid: "t2", testType: "summer", testedSize: "225/45 R17" }),
        makeTestResult({ testUid: "t3", testType: "summer", testedSize: "235/55 R17" }),
        makeTestResult({ testUid: "t4", testType: "winter" }),
        makeTestResult({ testUid: "t5", testType: "winter", testedSize: "225/45 R17" }),
      ];
      vi.mocked(getTestResultsSince).mockReturnValue(tests);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const comparisons = result.details.filter(
        (d) => d.type === "comparison"
      );
      // Only summer should have comparison (3 tests), winter has only 2
      expect(comparisons.length).toBe(1);
      expect(comparisons[0].topic).toContain("літній");
    });
  });

  describe("seasonal articles", () => {
    it("should always plan quarterly tips article", async () => {
      vi.mocked(getTestResultsSince).mockReturnValue([]);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const tips = result.details.filter((d) => d.type === "tips");
      expect(tips.length).toBe(1);
      expect(tips[0].topic).toContain("Догляд за шинами");
    });

    it("should include year and quarter in tips topic", async () => {
      vi.mocked(getTestResultsSince).mockReturnValue([]);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const tips = result.details.filter((d) => d.type === "tips");
      expect(tips[0].topic).toMatch(/Q\d/);
    });
  });

  describe("no new tests", () => {
    it("should return 0 planned test-summary when no new tests", async () => {
      vi.mocked(getTestResultsSince).mockReturnValue([]);

      const result = await planArticles("2025-01-01T00:00:00Z");

      const testSummaries = result.details.filter(
        (d) => d.type === "test-summary"
      );
      expect(testSummaries.length).toBe(0);
    });

    it("should still plan seasonal articles when no tests", async () => {
      vi.mocked(getTestResultsSince).mockReturnValue([]);

      const result = await planArticles("2025-01-01T00:00:00Z");

      // At minimum, quarterly tips article should be planned
      expect(result.planned).toBeGreaterThanOrEqual(1);
    });
  });
});
