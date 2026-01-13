import Image from "next/image";
import Link from "next/link";
import { type TyreModel, type Season, type TyreBadge, type BadgeType } from "@/lib/data";
import { Car, Truck, Sun, Snowflake, Cloud, ChevronRight } from "lucide-react";
import { EuLabelGroup } from "@/components/ui/EuLabelBadge";
import { TechnologyGroup } from "@/components/ui/TechnologyIcon";
import { Badge } from "@/components/ui/Badge";

interface TyreCardProps {
  tyre: TyreModel;
  variant?: "default" | "compact" | "featured";
  /** For vehicle search: show matching sizes instead of all sizes */
  matchingSizes?: string[];
}

const seasonLabels: Record<Season, string> = {
  summer: "Літня",
  winter: "Зимова",
  allseason: "Всесезонна",
};

const seasonIcons: Record<Season, React.ReactNode> = {
  summer: <Sun className="h-4 w-4" aria-hidden="true" />,
  winter: <Snowflake className="h-4 w-4" aria-hidden="true" />,
  allseason: <Cloud className="h-4 w-4" aria-hidden="true" />,
};

const seasonColors: Record<Season, string> = {
  summer: "badge-summer",
  winter: "badge-winter",
  allseason: "badge-allseason",
};

// Badge priority for displaying top badge
const badgePriority: Record<BadgeType, number> = {
  winner: 1,
  recommended: 2,
  top3: 3,
  best_category: 4,
  eco: 5,
};

// Map badge type to variant
const badgeVariantMap: Record<BadgeType, "winner" | "recommended" | "top3" | "category" | "eco"> = {
  winner: "winner",
  recommended: "recommended",
  top3: "top3",
  best_category: "category",
  eco: "eco",
};

// Get top badge from array
function getTopBadge(badges?: TyreBadge[]): TyreBadge | null {
  if (!badges || badges.length === 0) return null;

  // Filter out badges older than 3 years
  const currentYear = new Date().getFullYear();
  const validBadges = badges.filter((b) => currentYear - b.year <= 3);

  if (validBadges.length === 0) return null;

  // Sort by priority and return first
  validBadges.sort((a, b) => badgePriority[a.type] - badgePriority[b.type]);
  return validBadges[0];
}

function FallbackIcon({ vehicleTypes }: { vehicleTypes: string[] }) {
  const IconComponent = vehicleTypes.includes("lcv") ? Truck : Car;
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <IconComponent className="h-32 w-32 text-muted-foreground/20" />
    </div>
  );
}

export function TyreCard({ tyre, variant = "default", matchingSizes }: TyreCardProps) {
  const imageHeight = variant === "compact" ? "h-48" : variant === "featured" ? "h-80" : "h-72";
  const topBadge = getTopBadge(tyre.badges);

  return (
    <Link
      href={`/shyny/${tyre.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700 bg-card shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Image Section - Large and prominent */}
      <div className={`relative ${imageHeight} overflow-hidden bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800`}>
        {tyre.imageUrl ? (
          <Image
            src={tyre.imageUrl}
            alt={`Шина ${tyre.name}`}
            fill
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <FallbackIcon vehicleTypes={tyre.vehicleTypes} />
        )}

        {/* Season Badge */}
        <div className={`absolute top-4 left-4 flex items-center gap-1.5 rounded-lg ${seasonColors[tyre.season]} px-3 py-1.5 text-sm font-semibold text-white shadow-lg`}>
          {seasonIcons[tyre.season]}
          <span>{seasonLabels[tyre.season]}</span>
        </div>

        {/* Test Badge or New Badge */}
        {topBadge ? (
          <div className="absolute top-4 right-4">
            <Badge variant={badgeVariantMap[topBadge.type]} size="sm">
              {topBadge.label}
            </Badge>
          </div>
        ) : tyre.isNew && (
          <div className="absolute top-4 right-4 rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
            Новинка
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Quick View Button on Hover */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-stone-900 shadow-xl">
            Детальніше
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="mb-3 text-base font-medium leading-tight transition-all group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
          Bridgestone {tyre.name}
        </h3>

        {/* Description - fixed height with line clamp */}
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground min-h-[2.5rem]">
          {tyre.shortDescription}
        </p>

        {/* EU Label - always show section for consistent height */}
        <div className="mb-3 min-h-[1.75rem]">
          {tyre.euLabel && (
            <EuLabelGroup
              wetGrip={tyre.euLabel.wetGrip as "A" | "B" | "C" | "D" | "E"}
              fuelEfficiency={tyre.euLabel.fuelEfficiency as "A" | "B" | "C" | "D" | "E"}
              noiseDb={tyre.euLabel.noiseDb}
              size="sm"
            />
          )}
        </div>

        {/* Technologies - always show section for consistent height */}
        {variant !== "compact" && (
          <div className="mb-3 min-h-[1.5rem]">
            {tyre.technologies && tyre.technologies.length > 0 && (
              <TechnologyGroup
                technologies={tyre.technologies}
                size="sm"
                showLabels={false}
                maxVisible={4}
              />
            )}
          </div>
        )}

        {/* Sizes Preview - push to bottom */}
        {variant !== "compact" && tyre.sizes.length > 0 && (
          <div className="mt-auto pt-2">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {tyre.sizes.length} розмірів доступно
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tyre.sizes.slice(0, 3).map((size, i) => (
                <span
                  key={i}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium"
                >
                  {size.width}/{size.aspectRatio}R{size.diameter}
                </span>
              ))}
              {tyre.sizes.length > 3 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  +{tyre.sizes.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Compact variant: show matching sizes as badges or sizes count */}
        {variant === "compact" && (matchingSizes ? (
          <div className="mt-auto pt-2">
            <div className="flex flex-wrap gap-1.5">
              {matchingSizes.slice(0, 2).map((size) => (
                <span
                  key={size}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium"
                >
                  {size}
                </span>
              ))}
              {matchingSizes.length > 2 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  +{matchingSizes.length - 2}
                </span>
              )}
            </div>
          </div>
        ) : tyre.sizes.length > 0 && (
          <div className="mt-auto pt-2 text-xs text-muted-foreground">
            {tyre.sizes.length} розмірів
          </div>
        ))}
      </div>
    </Link>
  );
}

export function TyreCardGrid({ tyres, variant }: { tyres: TyreModel[]; variant?: "default" | "compact" | "featured" }) {
  return (
    <div className={`grid gap-6 pt-2 ${variant === "compact" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
      {tyres.map((tyre) => (
        <TyreCard key={tyre.slug} tyre={tyre} variant={variant} />
      ))}
    </div>
  );
}
