/**
 * Badge Assignment Logic
 *
 * Assigns badges to tires based on test results from ADAC, Auto Bild, TCS, etc.
 * Badges expire after 3 years.
 */

// Types
export type BadgeType = "winner" | "recommended" | "top3" | "best_category" | "eco";
export type BadgeSource = "adac" | "autobild" | "tyrereviews" | "tcs" | "eu_label";
export type TestType = "summer" | "winter" | "allseason";

export interface TestResult {
  source: BadgeSource;
  year: number;
  testType: TestType;
  tireSlug: string;
  tireName: string;
  position?: number;        // 1 = winner
  rating?: number;          // ADAC: 1.0-5.0 (lower is better), AutoBild: 1-5
  verdict?: string;         // "sehr gut", "gut", "befriedigend", etc.
  categoryWins?: string[];  // e.g., ["wet_braking", "aquaplaning"]
  euLabelGrade?: string;    // "A", "B", etc. for eco badge
}

export interface TireBadge {
  type: BadgeType;
  source: BadgeSource;
  year: number;
  testType: TestType;
  label: string;            // Display text (Ukrainian)
  priority: number;         // For sorting/display (lower = more important)
  expiresAt: Date;
}

// Badge priority (lower = more important)
const BADGE_PRIORITIES: Record<BadgeType, number> = {
  winner: 1,
  recommended: 2,
  top3: 3,
  best_category: 4,
  eco: 5,
};

// Badge expiration (years)
const BADGE_EXPIRATION_YEARS = 3;

// Rating thresholds
const ADAC_RECOMMENDED_THRESHOLD = 2.0;  // 1.0-2.0 = recommended
const AUTOBILD_RECOMMENDED_VERDICT = ["sehr gut", "gut", "empfehlenswert"];

/**
 * Generate badge label in Ukrainian
 */
function generateBadgeLabel(
  type: BadgeType,
  source: BadgeSource,
  year: number,
  testType?: TestType,
  category?: string
): string {
  const sourceLabels: Record<BadgeSource, string> = {
    adac: "ADAC",
    autobild: "Auto Bild",
    tyrereviews: "TyreReviews",
    tcs: "TCS",
    eu_label: "EU Label",
  };

  const testTypeLabels: Record<TestType, string> = {
    summer: "літніх",
    winter: "зимових",
    allseason: "всесезонних",
  };

  const sourceLabel = sourceLabels[source];

  switch (type) {
    case "winner":
      return `Переможець ${sourceLabel} ${year}`;
    case "recommended":
      return `Рекомендовано ${sourceLabel}`;
    case "top3":
      return testType
        ? `Топ-3 ${testTypeLabels[testType]} ${sourceLabel} ${year}`
        : `Топ-3 ${sourceLabel} ${year}`;
    case "best_category":
      if (category) {
        const categoryLabels: Record<string, string> = {
          wet_braking: "Гальмування на мокрому",
          aquaplaning: "Аквапланування",
          dry_handling: "Керованість на сухому",
          noise: "Найтихіша",
          fuel_efficiency: "Економія палива",
          snow_traction: "Зчеплення на снігу",
          ice_braking: "Гальмування на льоду",
        };
        return categoryLabels[category] || `Найкраща ${sourceLabel}`;
      }
      return `Найкраща у категорії`;
    case "eco":
      return "Екологічний вибір";
    default:
      return `${sourceLabel} ${year}`;
  }
}

/**
 * Calculate expiration date
 */
function calculateExpiration(year: number): Date {
  const expDate = new Date(year + BADGE_EXPIRATION_YEARS, 11, 31); // Dec 31
  return expDate;
}

/**
 * Check if badge is still valid
 */
export function isBadgeValid(badge: TireBadge): boolean {
  return badge.expiresAt > new Date();
}

/**
 * Assign badges based on test result
 */
export function assignBadges(result: TestResult): TireBadge[] {
  const badges: TireBadge[] = [];
  const currentYear = new Date().getFullYear();

  // Don't process results older than 3 years
  if (currentYear - result.year > BADGE_EXPIRATION_YEARS) {
    return badges;
  }

  const expiresAt = calculateExpiration(result.year);

  // Winner badge
  if (result.position === 1) {
    badges.push({
      type: "winner",
      source: result.source,
      year: result.year,
      testType: result.testType,
      label: generateBadgeLabel("winner", result.source, result.year),
      priority: BADGE_PRIORITIES.winner,
      expiresAt,
    });
  }

  // Top 3 badge (positions 2-3)
  if (result.position && result.position >= 2 && result.position <= 3) {
    badges.push({
      type: "top3",
      source: result.source,
      year: result.year,
      testType: result.testType,
      label: generateBadgeLabel("top3", result.source, result.year, result.testType),
      priority: BADGE_PRIORITIES.top3,
      expiresAt,
    });
  }

  // Recommended badge (ADAC rating)
  if (result.source === "adac" && result.rating && result.rating <= ADAC_RECOMMENDED_THRESHOLD) {
    badges.push({
      type: "recommended",
      source: result.source,
      year: result.year,
      testType: result.testType,
      label: generateBadgeLabel("recommended", result.source, result.year),
      priority: BADGE_PRIORITIES.recommended,
      expiresAt,
    });
  }

  // Recommended badge (AutoBild verdict)
  if (
    result.source === "autobild" &&
    result.verdict &&
    AUTOBILD_RECOMMENDED_VERDICT.includes(result.verdict.toLowerCase())
  ) {
    badges.push({
      type: "recommended",
      source: result.source,
      year: result.year,
      testType: result.testType,
      label: generateBadgeLabel("recommended", result.source, result.year),
      priority: BADGE_PRIORITIES.recommended,
      expiresAt,
    });
  }

  // Best category badges
  if (result.categoryWins && result.categoryWins.length > 0) {
    for (const category of result.categoryWins) {
      badges.push({
        type: "best_category",
        source: result.source,
        year: result.year,
        testType: result.testType,
        label: generateBadgeLabel("best_category", result.source, result.year, result.testType, category),
        priority: BADGE_PRIORITIES.best_category,
        expiresAt,
      });
    }
  }

  // Eco badge (EU Label A)
  if (result.source === "eu_label" && result.euLabelGrade === "A") {
    badges.push({
      type: "eco",
      source: result.source,
      year: result.year,
      testType: result.testType,
      label: generateBadgeLabel("eco", result.source, result.year),
      priority: BADGE_PRIORITIES.eco,
      expiresAt,
    });
  }

  return badges;
}

/**
 * Get top badge for display on card
 */
export function getTopBadge(badges: TireBadge[]): TireBadge | null {
  const validBadges = badges.filter(isBadgeValid);
  if (validBadges.length === 0) return null;

  // Sort by priority (lower = more important)
  validBadges.sort((a, b) => a.priority - b.priority);
  return validBadges[0];
}

/**
 * Prioritize and deduplicate badges
 * Returns sorted list with max N badges
 */
export function prioritizeBadges(badges: TireBadge[], maxBadges = 3): TireBadge[] {
  const validBadges = badges.filter(isBadgeValid);

  // Remove duplicates (same type from same source)
  const uniqueMap = new Map<string, TireBadge>();
  for (const badge of validBadges) {
    const key = `${badge.type}-${badge.source}`;
    const existing = uniqueMap.get(key);

    // Keep newer badge if duplicate
    if (!existing || badge.year > existing.year) {
      uniqueMap.set(key, badge);
    }
  }

  const uniqueBadges = Array.from(uniqueMap.values());

  // Sort by priority
  uniqueBadges.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.year - a.year; // More recent first
  });

  return uniqueBadges.slice(0, maxBadges);
}

// Test
async function main() {
  console.log("Testing Badge Assigner...\n");

  const testResults: TestResult[] = [
    {
      source: "adac",
      year: 2024,
      testType: "summer",
      tireSlug: "turanza-6",
      tireName: "Turanza 6",
      position: 1,
      rating: 1.8,
      categoryWins: ["wet_braking"],
    },
    {
      source: "autobild",
      year: 2024,
      testType: "winter",
      tireSlug: "blizzak-lm005",
      tireName: "Blizzak LM005",
      position: 2,
      verdict: "sehr gut",
    },
    {
      source: "adac",
      year: 2021, // Old test - should be filtered
      testType: "summer",
      tireSlug: "potenza-sport",
      tireName: "Potenza Sport",
      position: 1,
    },
    {
      source: "eu_label",
      year: 2024,
      testType: "summer",
      tireSlug: "ecopia-ep150",
      tireName: "Ecopia EP150",
      euLabelGrade: "A",
    },
  ];

  for (const result of testResults) {
    console.log(`\nProcessing: ${result.tireName} (${result.source} ${result.year})`);
    const badges = assignBadges(result);

    if (badges.length === 0) {
      console.log("  No badges (expired or not qualifying)");
    } else {
      for (const badge of badges) {
        const valid = isBadgeValid(badge) ? "✓" : "✗";
        console.log(`  ${valid} [${badge.type}] ${badge.label}`);
      }
    }
  }

  // Test prioritization
  console.log("\n\nTesting badge prioritization:");
  const allBadges: TireBadge[] = [];
  for (const result of testResults) {
    allBadges.push(...assignBadges(result));
  }

  const prioritized = prioritizeBadges(allBadges, 3);
  console.log("Top 3 badges:");
  for (const badge of prioritized) {
    console.log(`  [${badge.priority}] ${badge.label}`);
  }
}

main();
