/**
 * Unit Tests for Badge Assigner
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  assignBadges,
  isBadgeValid,
  getTopBadge,
  prioritizeBadges,
  TestResult,
  TireBadge,
} from "./badge-assigner.js";

describe("assignBadges", () => {
  beforeEach(() => {
    // Mock current date to 2026-01-09 for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 9));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should assign winner badge for position 1", () => {
    const result: TestResult = {
      source: "adac",
      year: 2026,
      testType: "summer",
      tireSlug: "turanza-6",
      tireName: "Turanza 6",
      position: 1,
    };

    const badges = assignBadges(result);

    expect(badges.length).toBeGreaterThan(0);
    expect(badges.some((b) => b.type === "winner")).toBe(true);

    const winnerBadge = badges.find((b) => b.type === "winner");
    expect(winnerBadge?.label).toContain("Переможець");
    expect(winnerBadge?.label).toContain("ADAC");
    expect(winnerBadge?.priority).toBe(1);
  });

  it("should assign recommended badge for ADAC rating <= 2.0", () => {
    const result: TestResult = {
      source: "adac",
      year: 2026,
      testType: "summer",
      tireSlug: "turanza-6",
      tireName: "Turanza 6",
      rating: 1.8,
    };

    const badges = assignBadges(result);

    expect(badges.some((b) => b.type === "recommended")).toBe(true);

    const recommendedBadge = badges.find((b) => b.type === "recommended");
    expect(recommendedBadge?.label).toContain("Рекомендовано");
  });

  it("should not assign recommended badge for ADAC rating > 2.0", () => {
    const result: TestResult = {
      source: "adac",
      year: 2026,
      testType: "summer",
      tireSlug: "turanza-6",
      tireName: "Turanza 6",
      rating: 2.5,
    };

    const badges = assignBadges(result);

    expect(badges.some((b) => b.type === "recommended")).toBe(false);
  });

  it("should assign top3 badge for positions 2-3", () => {
    const result: TestResult = {
      source: "autobild",
      year: 2026,
      testType: "winter",
      tireSlug: "blizzak-lm005",
      tireName: "Blizzak LM005",
      position: 2,
    };

    const badges = assignBadges(result);

    expect(badges.some((b) => b.type === "top3")).toBe(true);

    const top3Badge = badges.find((b) => b.type === "top3");
    expect(top3Badge?.label).toContain("Топ-3");
  });

  it("should assign eco badge for EU Label A", () => {
    const result: TestResult = {
      source: "eu_label",
      year: 2026,
      testType: "summer",
      tireSlug: "ecopia-ep150",
      tireName: "Ecopia EP150",
      euLabelGrade: "A",
    };

    const badges = assignBadges(result);

    expect(badges.some((b) => b.type === "eco")).toBe(true);

    const ecoBadge = badges.find((b) => b.type === "eco");
    expect(ecoBadge?.label).toBe("Екологічний вибір");
  });

  it("should assign best_category badges for category wins", () => {
    const result: TestResult = {
      source: "adac",
      year: 2026,
      testType: "summer",
      tireSlug: "turanza-6",
      tireName: "Turanza 6",
      categoryWins: ["wet_braking", "aquaplaning"],
    };

    const badges = assignBadges(result);

    const categoryBadges = badges.filter((b) => b.type === "best_category");
    expect(categoryBadges.length).toBe(2);
    expect(categoryBadges.some((b) => b.label.includes("Гальмування"))).toBe(true);
    expect(categoryBadges.some((b) => b.label.includes("Аквапланування"))).toBe(true);
  });

  it("should not assign badges for results older than 3 years", () => {
    const result: TestResult = {
      source: "adac",
      year: 2022, // 4 years old
      testType: "summer",
      tireSlug: "old-tire",
      tireName: "Old Tire",
      position: 1,
    };

    const badges = assignBadges(result);

    expect(badges).toHaveLength(0);
  });

  it("should assign recommended badge for AutoBild sehr gut verdict", () => {
    const result: TestResult = {
      source: "autobild",
      year: 2026,
      testType: "summer",
      tireSlug: "premium-tire",
      tireName: "Premium Tire",
      verdict: "sehr gut",
    };

    const badges = assignBadges(result);

    expect(badges.some((b) => b.type === "recommended")).toBe(true);
  });
});

describe("isBadgeValid", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 9));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return true for valid (not expired) badge", () => {
    const badge: TireBadge = {
      type: "winner",
      source: "adac",
      year: 2025,
      testType: "summer",
      label: "Переможець ADAC 2025",
      priority: 1,
      expiresAt: new Date(2028, 11, 31), // Dec 31, 2028
    };

    expect(isBadgeValid(badge)).toBe(true);
  });

  it("should return false for expired badge", () => {
    const badge: TireBadge = {
      type: "winner",
      source: "adac",
      year: 2022,
      testType: "summer",
      label: "Переможець ADAC 2022",
      priority: 1,
      expiresAt: new Date(2025, 11, 31), // Dec 31, 2025 - expired
    };

    expect(isBadgeValid(badge)).toBe(false);
  });
});

describe("getTopBadge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 9));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return winner badge as top priority", () => {
    const badges: TireBadge[] = [
      {
        type: "recommended",
        source: "adac",
        year: 2026,
        testType: "summer",
        label: "Рекомендовано ADAC",
        priority: 2,
        expiresAt: new Date(2029, 11, 31),
      },
      {
        type: "winner",
        source: "adac",
        year: 2026,
        testType: "summer",
        label: "Переможець ADAC 2026",
        priority: 1,
        expiresAt: new Date(2029, 11, 31),
      },
      {
        type: "top3",
        source: "autobild",
        year: 2026,
        testType: "summer",
        label: "Топ-3 Auto Bild 2026",
        priority: 3,
        expiresAt: new Date(2029, 11, 31),
      },
    ];

    const topBadge = getTopBadge(badges);

    expect(topBadge).not.toBeNull();
    expect(topBadge?.type).toBe("winner");
  });

  it("should return null for empty badges", () => {
    const topBadge = getTopBadge([]);
    expect(topBadge).toBeNull();
  });

  it("should filter out expired badges", () => {
    const badges: TireBadge[] = [
      {
        type: "winner",
        source: "adac",
        year: 2022,
        testType: "summer",
        label: "Переможець ADAC 2022",
        priority: 1,
        expiresAt: new Date(2025, 11, 31), // expired
      },
      {
        type: "recommended",
        source: "adac",
        year: 2026,
        testType: "summer",
        label: "Рекомендовано ADAC",
        priority: 2,
        expiresAt: new Date(2029, 11, 31),
      },
    ];

    const topBadge = getTopBadge(badges);

    expect(topBadge?.type).toBe("recommended");
  });
});

describe("prioritizeBadges", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 9));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return max N badges sorted by priority", () => {
    const badges: TireBadge[] = [
      {
        type: "eco",
        source: "eu_label",
        year: 2026,
        testType: "summer",
        label: "Екологічний вибір",
        priority: 5,
        expiresAt: new Date(2029, 11, 31),
      },
      {
        type: "winner",
        source: "adac",
        year: 2026,
        testType: "summer",
        label: "Переможець ADAC 2026",
        priority: 1,
        expiresAt: new Date(2029, 11, 31),
      },
      {
        type: "top3",
        source: "autobild",
        year: 2026,
        testType: "summer",
        label: "Топ-3 Auto Bild 2026",
        priority: 3,
        expiresAt: new Date(2029, 11, 31),
      },
      {
        type: "recommended",
        source: "tcs",
        year: 2026,
        testType: "summer",
        label: "Рекомендовано TCS",
        priority: 2,
        expiresAt: new Date(2029, 11, 31),
      },
    ];

    const prioritized = prioritizeBadges(badges, 3);

    expect(prioritized).toHaveLength(3);
    expect(prioritized[0].type).toBe("winner");
    expect(prioritized[1].type).toBe("recommended");
    expect(prioritized[2].type).toBe("top3");
  });

  it("should filter out expired badges", () => {
    const badges: TireBadge[] = [
      {
        type: "winner",
        source: "adac",
        year: 2022,
        testType: "summer",
        label: "Переможець ADAC 2022",
        priority: 1,
        expiresAt: new Date(2025, 11, 31), // expired
      },
      {
        type: "recommended",
        source: "adac",
        year: 2026,
        testType: "summer",
        label: "Рекомендовано ADAC",
        priority: 2,
        expiresAt: new Date(2029, 11, 31),
      },
    ];

    const prioritized = prioritizeBadges(badges);

    expect(prioritized).toHaveLength(1);
    expect(prioritized[0].type).toBe("recommended");
  });

  it("should deduplicate badges keeping newer ones", () => {
    const badges: TireBadge[] = [
      {
        type: "winner",
        source: "adac",
        year: 2025,
        testType: "summer",
        label: "Переможець ADAC 2025",
        priority: 1,
        expiresAt: new Date(2028, 11, 31),
      },
      {
        type: "winner",
        source: "adac",
        year: 2026,
        testType: "summer",
        label: "Переможець ADAC 2026",
        priority: 1,
        expiresAt: new Date(2029, 11, 31),
      },
    ];

    const prioritized = prioritizeBadges(badges);

    expect(prioritized).toHaveLength(1);
    expect(prioritized[0].year).toBe(2026);
  });
});
