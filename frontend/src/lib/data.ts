// Структура даних для сайту Bridgestone Україна
// Типи для всіх сутностей, що використовуються в додатку

export type Season = "summer" | "winter" | "allseason";

export type Brand = "bridgestone" | "firestone";

export type VehicleType = "passenger" | "suv" | "lcv";

export interface TyreSize {
  width: number;
  aspectRatio: number;
  diameter: number;
  loadIndex?: number;
  speedIndex?: string;
}

export type BadgeType = "winner" | "recommended" | "top3" | "best_category" | "eco";
export type BadgeSource = "adac" | "autobild" | "tyrereviews" | "tcs" | "eu_label";

export interface TyreBadge {
  type: BadgeType;
  source: BadgeSource;
  year: number;
  testType: Season;
  label: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface TestResult {
  source: 'adac' | 'autobild' | 'tyrereviews' | 'tcs';
  testType: 'summer' | 'winter' | 'allseason';
  year: number;
  testedSize: string;
  position: number;
  totalTested: number;
  rating: string;
  ratingNumeric: number;
  articleSlug?: string;
}

export interface TyreModel {
  id?: number;
  slug: string;
  name: string;
  brand: Brand;
  season: Season;
  vehicleTypes: VehicleType[];
  isNew?: boolean;
  isPopular?: boolean;
  shortDescription: string;
  fullDescription?: unknown; // Lexical rich text JSON
  imageUrl?: string; // URL to tire product image
  euLabel?: {
    wetGrip?: "A" | "B" | "C" | "D" | "E";
    fuelEfficiency?: "A" | "B" | "C" | "D" | "E";
    noiseDb?: number;
  };
  sizes: TyreSize[];
  usage: {
    city?: boolean;
    highway?: boolean;
    offroad?: boolean;
    winter?: boolean;
  };
  technologies?: string[]; // technology slugs
  badges?: TyreBadge[]; // test result badges
  keyBenefits?: string[];
  faqs?: FAQ[];
  testResults?: TestResult[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface VehicleFitment {
  make: string;
  model: string;
  bodyType?: string;
  yearFrom: number;
  yearTo?: number;
  recommendedSizes: TyreSize[];
}

export type DealerType = "official" | "partner" | "service";

export interface Dealer {
  id: string;
  name: string;
  type: DealerType;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  workingHours?: string;
}

export interface Article {
  slug: string;
  title: string;
  subtitle?: string;
  previewText: string;
  content?: unknown; // Lexical rich text content from CMS
  readingTimeMinutes?: number;
  publishedAt?: string; // ISO date
  tags?: string[];
}

export interface Technology {
  slug: string;
  name: string;
  description: string;
  tyreSlugs?: string[];
  icon?: string;
}
