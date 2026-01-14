import { Sun, Snowflake, Cloud } from "lucide-react";
import type { Season, Brand, TyreModel } from "@/lib/data";

/**
 * Shared utilities for tyre-related components
 * Consolidated from multiple files to eliminate duplication
 */

// Brand labels for display
export const brandLabels: Record<Brand, string> = {
  bridgestone: "Bridgestone",
  firestone: "Firestone",
};

// Brand colors (Tailwind classes)
export const brandColors: Record<Brand, { bg: string; text: string; border: string }> = {
  bridgestone: {
    bg: "bg-[#E4002B]",
    text: "text-[#E4002B]",
    border: "border-[#E4002B]",
  },
  firestone: {
    bg: "bg-[#FF6600]",
    text: "text-[#FF6600]",
    border: "border-[#FF6600]",
  },
};

// Season labels for display
export const seasonLabels: Record<Season, string> = {
  summer: "Літні шини",
  winter: "Зимові шини",
  allseason: "Всесезонні шини",
};

// Short season labels for badges
export const seasonLabelsShort: Record<Season, string> = {
  summer: "Літня",
  winter: "Зимова",
  allseason: "Всесезонна",
};

// Season icons (Lucide components)
export const SeasonIcons = {
  summer: Sun,
  winter: Snowflake,
  allseason: Cloud,
} as const;

// Season colors for badges and accents
// Літо = зелений, Зима = синій, Всесезон = оранжевий
export const seasonColors: Record<Season, string> = {
  summer: "bg-emerald-500",
  winter: "bg-sky-500",
  allseason: "bg-amber-500",
};

// Season text colors
export const seasonTextColors: Record<Season, string> = {
  summer: "text-emerald-500",
  winter: "text-sky-400",
  allseason: "text-amber-500",
};

// Season background colors with transparency (for icon containers)
export const seasonBgLight: Record<Season, string> = {
  summer: "bg-emerald-500/15",
  winter: "bg-sky-500/15",
  allseason: "bg-amber-500/15",
};

// Feature icon colors (for benefits/features lists)
export const featureIconColors = {
  // By icon name
  car: { bg: "bg-blue-500/15", text: "text-blue-500" },
  shield: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
  zap: { bg: "bg-amber-500/15", text: "text-amber-500" },
  star: { bg: "bg-purple-500/15", text: "text-purple-500" },
  mountain: { bg: "bg-orange-500/15", text: "text-orange-500" },
  thermometer: { bg: "bg-red-500/15", text: "text-red-500" },
  weight: { bg: "bg-slate-500/15", text: "text-slate-500" },
  gauge: { bg: "bg-cyan-500/15", text: "text-cyan-500" },
  truck: { bg: "bg-indigo-500/15", text: "text-indigo-500" },
  globe: { bg: "bg-teal-500/15", text: "text-teal-500" },
  users: { bg: "bg-pink-500/15", text: "text-pink-500" },
  phone: { bg: "bg-green-500/15", text: "text-green-500" },
  mapPin: { bg: "bg-rose-500/15", text: "text-rose-500" },
  award: { bg: "bg-yellow-500/15", text: "text-yellow-500" },
} as const;

export type FeatureIconKey = keyof typeof featureIconColors;

// Vehicle type labels
export const vehicleTypeLabels: Record<string, string> = {
  passenger: "Легкові",
  suv: "SUV / 4x4",
  lcv: "Легкі вантажні",
};

/**
 * Format tyre size as string (e.g., "205/55 R16")
 */
export function formatSize(
  size: { width: number; aspectRatio: number; diameter: number } | null | undefined
): string {
  if (!size) return "—";
  return `${size.width}/${size.aspectRatio} R${size.diameter}`;
}

/**
 * Format multiple sizes as array of strings
 */
export function formatSizes(sizes: Array<{ width: number; aspectRatio: number; diameter: number }>): string[] {
  return sizes.map(formatSize);
}

/**
 * Group tyres by season
 */
export function groupBySeason(models: TyreModel[]): Record<Season, TyreModel[]> {
  return models.reduce(
    (acc, model) => {
      acc[model.season].push(model);
      return acc;
    },
    {
      summer: [] as TyreModel[],
      winter: [] as TyreModel[],
      allseason: [] as TyreModel[],
    }
  );
}

/**
 * Format vehicle types as human-readable string
 */
export function formatVehicleTypes(model: TyreModel): string {
  const labels: string[] = [];
  if (model.vehicleTypes.includes("passenger")) {
    labels.push("Легкові авто");
  }
  if (model.vehicleTypes.includes("suv")) {
    labels.push("SUV");
  }
  if (model.vehicleTypes.includes("lcv")) {
    labels.push("Легкі вантажні");
  }
  return labels.join(", ") || "Універсальні";
}

/**
 * Get site URL from env or fallback
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://bridgestone.ua";
}
