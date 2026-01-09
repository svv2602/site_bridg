/**
 * Seasonal Configuration
 *
 * Configuration for seasonal auto-content on homepage.
 * Determines hero text, featured tyres, and colors based on current date.
 */

export type SeasonalPeriod = "spring" | "summer" | "autumn" | "winter";

export interface SeasonalConfig {
  period: SeasonalPeriod;
  heroTitle: string;
  heroSubtitle: string;
  featuredSeason: "summer" | "winter" | "allseason";
  accentColor: string;
  bgGradient: string;
  featuredSlugs?: string[];
  promoText?: string;
}

// Seasonal configurations
export const SEASONAL_CONFIGS: Record<SeasonalPeriod, SeasonalConfig> = {
  spring: {
    period: "spring",
    heroTitle: "Час переходити на літні шини",
    heroSubtitle: "Температура стабільно вище +7°C — оптимальний момент для заміни",
    featuredSeason: "summer",
    accentColor: "from-orange-500 to-yellow-500",
    bgGradient: "from-orange-950 via-zinc-900 to-zinc-800",
    promoText: "Оберіть літні шини до сезону",
    featuredSlugs: ["turanza-6", "potenza-sport", "turanza-t005"],
  },
  summer: {
    period: "summer",
    heroTitle: "Впевненість на сухому та мокрому асфальті",
    heroSubtitle: "Літні шини Bridgestone для комфортних поїздок",
    featuredSeason: "summer",
    accentColor: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-950 via-zinc-900 to-zinc-800",
    promoText: "Каталог літніх шин",
    featuredSlugs: ["potenza-sport", "turanza-6", "ecopia-ep150"],
  },
  autumn: {
    period: "autumn",
    heroTitle: "Готуйтесь до зими завчасно",
    heroSubtitle: "Перші заморозки вже близько — час подбати про безпеку",
    featuredSeason: "winter",
    accentColor: "from-blue-500 to-cyan-400",
    bgGradient: "from-blue-950 via-zinc-900 to-zinc-800",
    promoText: "Оберіть зимові шини до сезону",
    featuredSlugs: ["blizzak-lm005", "blizzak-dm-v3", "ice-cruiser-7000"],
  },
  winter: {
    period: "winter",
    heroTitle: "Безпека на засніжених дорогах",
    heroSubtitle: "Зимові шини Bridgestone для впевненого зчеплення",
    featuredSeason: "winter",
    accentColor: "from-cyan-400 to-blue-500",
    bgGradient: "from-slate-950 via-blue-950 to-zinc-900",
    promoText: "Каталог зимових шин",
    featuredSlugs: ["blizzak-lm005", "blizzak-dm-v3", "noranza-001"],
  },
};

/**
 * Get current seasonal period based on date
 */
export function getCurrentPeriod(date: Date = new Date()): SeasonalPeriod {
  const month = date.getMonth() + 1; // 1-12

  // Spring: March - April (tire change season)
  if (month >= 3 && month <= 4) return "spring";

  // Summer: May - September
  if (month >= 5 && month <= 9) return "summer";

  // Autumn: October - November (tire change season)
  if (month >= 10 && month <= 11) return "autumn";

  // Winter: December - February
  return "winter";
}

/**
 * Get seasonal config for current date
 */
export function getSeasonalConfig(date?: Date): SeasonalConfig {
  const period = getCurrentPeriod(date);
  return SEASONAL_CONFIGS[period];
}

/**
 * Check if it's tire change season
 */
export function isTireChangeSeason(date: Date = new Date()): boolean {
  const period = getCurrentPeriod(date);
  return period === "spring" || period === "autumn";
}

/**
 * Get recommended season for new tire purchase
 */
export function getRecommendedSeason(date: Date = new Date()): "summer" | "winter" {
  const period = getCurrentPeriod(date);
  return period === "spring" || period === "summer" ? "summer" : "winter";
}
