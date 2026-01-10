import { Sun, Snowflake, Cloud } from "lucide-react";
import type { Season, TyreModel } from "@/lib/data";

/**
 * Shared utilities for tyre-related components
 * Consolidated from multiple files to eliminate duplication
 */

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
export const seasonColors: Record<Season, string> = {
  summer: "bg-amber-500",
  winter: "bg-sky-500",
  allseason: "bg-emerald-500",
};

// Season text colors
export const seasonTextColors: Record<Season, string> = {
  summer: "text-amber-500",
  winter: "text-sky-400",
  allseason: "text-emerald-500",
};

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
