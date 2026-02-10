/**
 * Seasonal Content Processor
 *
 * Generates seasonal content for homepage hero section.
 * Selects featured tyres based on current season.
 */

import {
  getSeasonalConfig,
  getCurrentPeriod,
  isTireChangeSeason,
  type SeasonalConfig,
  type SeasonalPeriod,
} from "../config/seasonal.js";
import { getPayloadClient } from "../publishers/payload-client.js";

// Types
export interface FeaturedTyre {
  name: string;
  slug: string;
  tag: string;
  description: string;
  rating: number;
  season: "summer" | "winter" | "allseason";
}

export interface SeasonalContent {
  period: SeasonalPeriod;
  config: SeasonalConfig;
  isTireChangeSeason: boolean;
  featuredTyres: FeaturedTyre[];
  heroContent: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
  timestamp: string;
}

// Default featured tyres by season (slugs synced with mock data and seed.ts)
const DEFAULT_FEATURED_TYRES: Record<string, FeaturedTyre[]> = {
  summer: [
    {
      name: "Bridgestone Turanza T005",
      slug: "turanza-t005",
      tag: "Літня • Легковий авто",
      description: "Відмінне зчеплення на мокрій дорозі та низький рівень шуму.",
      rating: 4.9,
      season: "summer",
    },
    {
      name: "Bridgestone Potenza Sport",
      slug: "potenza-sport",
      tag: "Літня • Спортивний",
      description: "Максимальна керованість для спортивних автомобілів.",
      rating: 4.8,
      season: "summer",
    },
    {
      name: "Bridgestone Dueler H/P Sport",
      slug: "dueler-hp-sport",
      tag: "Літня • SUV",
      description: "Спортивні шини для преміум SUV та кросоверів.",
      rating: 4.7,
      season: "summer",
    },
  ],
  winter: [
    {
      name: "Bridgestone Blizzak LM005",
      slug: "blizzak-lm005",
      tag: "Зимова • Легковий / SUV",
      description: "Відмінне зчеплення на снігу та мокрому асфальті для безпечної зими.",
      rating: 4.9,
      season: "winter",
    },
    {
      name: "Bridgestone Blizzak DM-V3",
      slug: "blizzak-dm-v3",
      tag: "Зимова • SUV / 4x4",
      description: "Технологія Nano Pro-Tech для максимального зчеплення на льоду.",
      rating: 4.8,
      season: "winter",
    },
    {
      name: "Bridgestone Turanza T005",
      slug: "turanza-t005",
      tag: "Літня • Легковий авто",
      description: "Комфортні шини для щоденних поїздок (готуйтесь до літа!).",
      rating: 4.7,
      season: "summer",
    },
  ],
  allseason: [
    {
      name: "Bridgestone Weather Control A005 EVO",
      slug: "weather-control-a005-evo",
      tag: "Всесезонна • Легковий",
      description: "Цілорічне рішення з сертифікацією 3PMSF.",
      rating: 4.8,
      season: "allseason",
    },
    {
      name: "Bridgestone Blizzak LM005",
      slug: "blizzak-lm005",
      tag: "Зимова • Легковий / SUV",
      description: "Відмінне зчеплення на снігу та мокрому асфальті.",
      rating: 4.9,
      season: "winter",
    },
    {
      name: "Bridgestone Dueler H/P Sport",
      slug: "dueler-hp-sport",
      tag: "Літня • SUV",
      description: "Спортивні шини для преміум SUV та кросоверів.",
      rating: 4.7,
      season: "summer",
    },
  ],
};

/**
 * Get featured tyres for current season.
 * Tries to fetch from Payload CMS first; falls back to hardcoded defaults if CMS is unavailable.
 */
export async function getFeaturedTyres(season: "summer" | "winter" | "allseason"): Promise<FeaturedTyre[]> {
  try {
    const client = getPayloadClient();
    const tyres = await client.getAllTyres(10);

    // Filter by season and map to FeaturedTyre format
    const seasonTyres = tyres.filter((t) => t.season === season);

    if (seasonTyres.length >= 2) {
      return seasonTyres.slice(0, 3).map((t) => ({
        name: t.name,
        slug: t.slug,
        tag: formatTyreTag(t.season, t.vehicleTypes),
        description: t.shortDescription || "",
        rating: 4.5,
        season: t.season,
      }));
    }
  } catch {
    // CMS unavailable — use hardcoded fallback
  }

  return DEFAULT_FEATURED_TYRES[season] || DEFAULT_FEATURED_TYRES.summer;
}

/**
 * Get featured tyres synchronously (hardcoded fallback only, no CMS).
 * Use when async is not available.
 */
export function getFeaturedTyresSync(season: "summer" | "winter" | "allseason"): FeaturedTyre[] {
  return DEFAULT_FEATURED_TYRES[season] || DEFAULT_FEATURED_TYRES.summer;
}

/**
 * Format tyre tag from season and vehicle types
 */
function formatTyreTag(season: string, vehicleTypes?: string[]): string {
  const seasonLabel: Record<string, string> = {
    summer: "Літня",
    winter: "Зимова",
    allseason: "Всесезонна",
  };
  const vehicleLabel = vehicleTypes?.length
    ? vehicleTypes.map((v) => {
        const labels: Record<string, string> = {
          passenger: "Легковий авто",
          suv: "SUV",
          van: "Фургон",
          sport: "Спортивний",
        };
        return labels[v] || v;
      }).join(" / ")
    : "Легковий авто";

  return `${seasonLabel[season] || season} • ${vehicleLabel}`;
}

/**
 * Generate CTA text based on season
 */
function generateCtaText(config: SeasonalConfig, isTireChange: boolean): { text: string; link: string } {
  if (isTireChange) {
    const season = config.featuredSeason === "summer" ? "літні" : "зимові";
    return {
      text: `Підібрати ${season} шини`,
      link: config.featuredSeason === "summer" ? "/passenger-tyres" : "/passenger-tyres?season=winter",
    };
  }

  return {
    text: "Підібрати шини",
    link: "/tyre-search",
  };
}

/**
 * Generate full seasonal content
 * Async version that fetches featured tyres from CMS with hardcoded fallback.
 */
export async function generateSeasonalContent(date?: Date): Promise<SeasonalContent> {
  const config = getSeasonalConfig(date);
  const period = getCurrentPeriod(date);
  const isTireChange = isTireChangeSeason(date);
  const featuredTyres = await getFeaturedTyres(config.featuredSeason);
  const cta = generateCtaText(config, isTireChange);

  return {
    period,
    config,
    isTireChangeSeason: isTireChange,
    featuredTyres,
    heroContent: {
      title: config.heroTitle,
      subtitle: config.heroSubtitle,
      ctaText: cta.text,
      ctaLink: cta.link,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Export as JSON for API endpoint
 */
export async function getSeasonalContentJSON(date?: Date): Promise<string> {
  const content = await generateSeasonalContent(date);
  return JSON.stringify(content, null, 2);
}

// Test
async function main() {
  console.log("Testing Seasonal Content...\n");

  // Test different dates
  const testDates = [
    new Date(2026, 2, 15),  // March 15 - spring
    new Date(2026, 6, 1),   // July 1 - summer
    new Date(2026, 9, 20),  // October 20 - autumn
    new Date(2026, 0, 15),  // January 15 - winter
  ];

  for (const date of testDates) {
    const content = await generateSeasonalContent(date);
    console.log(`\n=== ${date.toLocaleDateString()} ===`);
    console.log(`Period: ${content.period}`);
    console.log(`Tire change season: ${content.isTireChangeSeason}`);
    console.log(`Hero: ${content.heroContent.title}`);
    console.log(`Featured season: ${content.config.featuredSeason}`);
    console.log(`Featured tyres: ${content.featuredTyres.map(t => t.name).join(", ")}`);
  }
}

main();

export { getSeasonalConfig, getCurrentPeriod, isTireChangeSeason };
