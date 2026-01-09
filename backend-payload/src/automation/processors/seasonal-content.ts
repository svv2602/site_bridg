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

// Default featured tyres by season
const DEFAULT_FEATURED_TYRES: Record<string, FeaturedTyre[]> = {
  summer: [
    {
      name: "Bridgestone Turanza 6",
      slug: "turanza-6",
      tag: "Літня • Легковий авто",
      description: "Преміальний комфорт і безпека на мокрій дорозі з технологією ENLITEN.",
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
      name: "Bridgestone Ecopia EP150",
      slug: "ecopia-ep150",
      tag: "Літня • Економний",
      description: "Економія палива без компромісів у безпеці.",
      rating: 4.6,
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
      name: "Bridgestone Noranza 001",
      slug: "noranza-001",
      tag: "Зимова • Шипована",
      description: "Надійне зчеплення на льоду для північних умов.",
      rating: 4.7,
      season: "winter",
    },
  ],
  allseason: [
    {
      name: "Bridgestone Weather Control A005",
      slug: "weather-control-a005",
      tag: "Всесезонна • Легковий",
      description: "Цілорічне рішення з акцентом на дощову та змінну погоду.",
      rating: 4.7,
      season: "allseason",
    },
    {
      name: "Bridgestone Turanza All Season 6",
      slug: "turanza-all-season-6",
      tag: "Всесезонна • Преміум",
      description: "Преміальний комфорт протягом усього року.",
      rating: 4.6,
      season: "allseason",
    },
    {
      name: "Bridgestone Dueler A/T 001",
      slug: "dueler-at-001",
      tag: "Всесезонна • SUV",
      description: "Універсальні шини для SUV на будь-якій дорозі.",
      rating: 4.5,
      season: "allseason",
    },
  ],
};

/**
 * Get featured tyres for current season
 */
export function getFeaturedTyres(season: "summer" | "winter" | "allseason"): FeaturedTyre[] {
  return DEFAULT_FEATURED_TYRES[season] || DEFAULT_FEATURED_TYRES.summer;
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
 */
export function generateSeasonalContent(date?: Date): SeasonalContent {
  const config = getSeasonalConfig(date);
  const period = getCurrentPeriod(date);
  const isTireChange = isTireChangeSeason(date);
  const featuredTyres = getFeaturedTyres(config.featuredSeason);
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
export function getSeasonalContentJSON(date?: Date): string {
  return JSON.stringify(generateSeasonalContent(date), null, 2);
}

// Test
function main() {
  console.log("Testing Seasonal Content...\n");

  // Test different dates
  const testDates = [
    new Date(2026, 2, 15),  // March 15 - spring
    new Date(2026, 6, 1),   // July 1 - summer
    new Date(2026, 9, 20),  // October 20 - autumn
    new Date(2026, 0, 15),  // January 15 - winter
  ];

  for (const date of testDates) {
    const content = generateSeasonalContent(date);
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
