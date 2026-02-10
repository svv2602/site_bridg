import Link from "next/link";
import Image from "next/image";
import { type Season, type VehicleType, type TyreModel } from "@/lib/data";
import { TyreCardGrid } from "@/components/TyreCard";
import { SeasonCategoryCard } from "@/components/SeasonCategoryCard";
import { Breadcrumb } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";
import { groupBySeason } from "@/lib/utils/tyres";
import { generateBreadcrumbSchema, jsonLdScript } from "@/lib/schema";
import { SITE_URL } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

// Feature item for the hero section
export interface CategoryFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: { bg: string; text: string };
}

// Season descriptions for each category
export interface SeasonDescriptions {
  summer: string;
  winter: string;
  allseason: string;
}

// Configuration for a catalog category page
export interface CategoryPageConfig {
  // URL and routing
  slug: string;
  vehicleType: VehicleType;

  // Hero section
  title: string;
  subtitle: string;
  heroDescription: string;
  features: CategoryFeature[];
  heroImageSrc: string;
  heroImageAlt: string;
  heroOverlayIcon: LucideIcon;
  heroOverlayIconBg: string;
  heroOverlayIconText: string;
  heroOverlayTitle: string;
  heroOverlayDescription: string;

  // Breadcrumb
  breadcrumbLabel: string;

  // Season section
  seasonSectionDescription: string;
  seasonDescriptions: SeasonDescriptions;
  seasonInitialCount?: number;

  // Featured models
  featuredTitle: string;
  featuredCount?: number;
  filterPopular?: boolean;

  // Reviews
  reviewsVehicleType: "passenger" | "suv" | "van";
  reviewsTitle: string;
  reviewsLimit?: number;
  reviewsShowAllLink?: boolean;

  // CTA
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
}

interface CategoryPageProps {
  config: CategoryPageConfig;
  tyres: TyreModel[];
}

/**
 * Shared template for category catalog pages (passenger-tyres, suv-4x4-tyres, lcv-tyres).
 * Reduces ~80% code duplication between three pages.
 */
export function CategoryPage({ config, tyres }: CategoryPageProps) {
  const bySeason = groupBySeason(tyres);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Головна", url: `${SITE_URL}/` },
    { name: config.breadcrumbLabel, url: `${SITE_URL}/${config.slug}` },
  ]);

  const OverlayIcon = config.heroOverlayIcon;
  const featuredTyres = config.filterPopular
    ? tyres.filter((m) => m.isPopular).slice(0, config.featuredCount ?? 6)
    : tyres.slice(0, config.featuredCount ?? 6);

  return (
    <div className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <Breadcrumb
                className="hero-breadcrumb-adaptive mb-2"
                items={[
                  { label: "Головна", href: "/" },
                  { label: config.breadcrumbLabel },
                ]}
              />
              <h1 className="hero-title-adaptive mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
                {config.title}
                <span className="hero-subtitle-adaptive mt-1 block text-base font-normal md:text-lg">
                  {config.subtitle}
                </span>
              </h1>
              <p className="hero-text-adaptive mb-6 max-w-xl text-sm md:text-base">
                {config.heroDescription}
              </p>
              <ul className="mb-8 space-y-3 text-sm">
                {config.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`mt-1 rounded-full ${feat.color.bg} p-1.5`}>
                      <feat.icon className={`h-4 w-4 ${feat.color.text}`} />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 dark:text-white">{feat.title}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 md:text-sm">{feat.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/tyre-search" className="hero-btn-primary-adaptive">
                  Підібрати шини
                </Link>
                <Link href="#catalog" className="hero-btn-secondary-adaptive">
                  Переглянути каталог
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="hero-card-adaptive relative h-80 overflow-hidden lg:h-full">
                <Image
                  src={config.heroImageSrc}
                  alt={config.heroImageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`rounded-full ${config.heroOverlayIconBg} p-2`}>
                      <OverlayIcon className={`h-5 w-5 ${config.heroOverlayIconText}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{config.heroOverlayTitle}</h3>
                  </div>
                  <p className="text-sm text-white/80">
                    {config.heroOverlayDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Season Tabs */}
      <section id="catalog" className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">Оберіть сезонність</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {config.seasonSectionDescription}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {(["summer", "winter", "allseason"] as Season[]).map((season) => {
              const items = bySeason[season];
              if (!items.length) return null;

              return (
                <SeasonCategoryCard
                  key={season}
                  season={season}
                  items={items}
                  initialCount={config.seasonInitialCount ?? 3}
                  description={config.seasonDescriptions[season]}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Models */}
      {featuredTyres.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-card to-background">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <h2 className="mb-8 text-3xl font-bold text-center">{config.featuredTitle}</h2>
            <TyreCardGrid
              tyres={featuredTyres}
              variant="featured"
            />
          </div>
        </section>
      )}

      {/* Reviews */}
      <div className="border-t border-border">
        <ReviewsSection
          vehicleType={config.reviewsVehicleType}
          limit={config.reviewsLimit ?? 3}
          title={config.reviewsTitle}
          showTyreName
          showAllLink={config.reviewsShowAllLink}
        />
      </div>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div className="rounded-3xl bg-graphite p-10 text-white shadow-2xl dark:ring-1 dark:ring-stone-700">
            <h3 className="mb-4 text-3xl font-bold">{config.ctaTitle}</h3>
            <p className="mb-8 text-lg opacity-90">
              {config.ctaDescription}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={config.ctaPrimaryHref}
                className="rounded-full bg-white px-8 py-3 font-semibold text-graphite transition-colors hover:bg-stone-100"
              >
                {config.ctaPrimaryLabel}
              </Link>
              <Link
                href={config.ctaSecondaryHref}
                className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                {config.ctaSecondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
