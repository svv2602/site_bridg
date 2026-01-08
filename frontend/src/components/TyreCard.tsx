import Image from "next/image";
import Link from "next/link";
import { type TyreModel, type Season } from "@/lib/data";
import { Car, Truck, Sun, Snowflake, Cloud, ChevronRight } from "lucide-react";

interface TyreCardProps {
  tyre: TyreModel;
  variant?: "default" | "compact" | "featured";
}

const seasonLabels: Record<Season, string> = {
  summer: "Літня",
  winter: "Зимова",
  allseason: "Всесезонна",
};

const seasonIcons: Record<Season, React.ReactNode> = {
  summer: <Sun className="h-4 w-4" />,
  winter: <Snowflake className="h-4 w-4" />,
  allseason: <Cloud className="h-4 w-4" />,
};

const seasonColors: Record<Season, string> = {
  summer: "bg-amber-500",
  winter: "bg-sky-500",
  allseason: "bg-emerald-500",
};

function FallbackIcon({ vehicleTypes }: { vehicleTypes: string[] }) {
  const IconComponent = vehicleTypes.includes("lcv") ? Truck : Car;
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <IconComponent className="h-32 w-32 text-muted-foreground/20" />
    </div>
  );
}

export function TyreCard({ tyre, variant = "default" }: TyreCardProps) {
  const imageHeight = variant === "compact" ? "h-56" : variant === "featured" ? "h-80" : "h-72";

  return (
    <Link
      href={`/shyny/${tyre.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
    >
      {/* Image Section - Large and prominent */}
      <div className={`relative ${imageHeight} overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800`}>
        {tyre.imageUrl ? (
          <Image
            src={tyre.imageUrl}
            alt={`Шина ${tyre.name}`}
            fill
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <FallbackIcon vehicleTypes={tyre.vehicleTypes} />
        )}

        {/* Season Badge */}
        <div className={`absolute top-4 left-4 flex items-center gap-1.5 rounded-full ${seasonColors[tyre.season]} px-3 py-1.5 text-xs font-semibold text-white shadow-lg`}>
          {seasonIcons[tyre.season]}
          <span>{seasonLabels[tyre.season]}</span>
        </div>

        {/* New Badge */}
        {tyre.isNew && (
          <div className="absolute top-4 right-4 rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
            Новинка
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Quick View Button on Hover */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-xl">
            Детальніше
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title */}
        <h3 className="mb-2 text-lg font-bold leading-tight transition-colors group-hover:text-primary">
          Bridgestone {tyre.name}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {tyre.shortDescription}
        </p>

        {/* EU Label */}
        {tyre.euLabel && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <span className="text-[10px] uppercase opacity-70">Зчеплення</span>
              {tyre.euLabel.wetGrip}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              <span className="text-[10px] uppercase opacity-70">Паливо</span>
              {tyre.euLabel.fuelEfficiency}
            </span>
            {tyre.euLabel.noiseDb && (
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <span className="text-[10px] uppercase opacity-70">Шум</span>
                {tyre.euLabel.noiseDb} дБ
              </span>
            )}
          </div>
        )}

        {/* Sizes Preview */}
        {variant !== "compact" && tyre.sizes.length > 0 && (
          <div className="mt-auto">
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
      </div>
    </Link>
  );
}

export function TyreCardGrid({ tyres, variant }: { tyres: TyreModel[]; variant?: "default" | "compact" | "featured" }) {
  return (
    <div className={`grid gap-6 ${variant === "compact" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
      {tyres.map((tyre) => (
        <TyreCard key={tyre.slug} tyre={tyre} variant={variant} />
      ))}
    </div>
  );
}
