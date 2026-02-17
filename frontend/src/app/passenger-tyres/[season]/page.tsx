import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { type Season, type TyreModel } from "@/lib/data";
import { getPayloadTyres, transformPayloadTyre, getCategoryPageBySlug } from "@/lib/api/payload";
import { TyreCardGrid } from "@/components/TyreCard";
import { Breadcrumb } from "@/components/ui";
import { seasonLabels, SeasonIcons, seasonTextColors, seasonBgLight } from "@/lib/utils/tyres";
import { ReviewsSection } from "@/components/ReviewsSection";
import { generateBreadcrumbSchema, jsonLdScript } from "@/lib/schema";
import { SITE_URL } from "@/lib/constants";
import { pluralize } from "@/lib/utils/pluralize";
import { fallbackSeasonMeta, type SeasonMeta } from "@/lib/fallback/category-pages";
import { transformToSeasonMeta } from "@/lib/api/transforms/category-page";

// URL slug to internal season mapping
const slugToSeason: Record<string, Season> = {
  summer: "summer",
  winter: "winter",
  "all-season": "allseason",
};

// Reverse mapping for generateStaticParams
const seasonToSlug: Record<Season, string> = {
  summer: "summer",
  winter: "winter",
  allseason: "all-season",
};

// CMS slug for each season (may differ from URL slug)
const seasonToCmsSlug: Record<Season, string> = {
  summer: "summer",
  winter: "winter",
  allseason: "allseason",
};

interface PageProps {
  params: Promise<{ season: string }>;
}

export async function generateStaticParams() {
  return Object.keys(slugToSeason).map((season) => ({
    season,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { season: slug } = await params;
  const season = slugToSeason[slug];

  if (!season) {
    return { title: "Сторінку не знайдено" };
  }

  const page = await getCategoryPageBySlug(seasonToCmsSlug[season]);
  const meta: SeasonMeta = page ? transformToSeasonMeta(page) : fallbackSeasonMeta[season];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/passenger-tyres/${slug}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      locale: "uk_UA",
      siteName: "Bridgestone Україна",
    },
  };
}

export default async function SeasonTyresPage({ params }: PageProps) {
  const { season: slug } = await params;
  const season = slugToSeason[slug];

  if (!season) {
    notFound();
  }

  const [page, payloadTyres] = await Promise.all([
    getCategoryPageBySlug(seasonToCmsSlug[season]),
    getPayloadTyres({ season, vehicleType: "passenger" }),
  ]);

  const meta: SeasonMeta = page ? transformToSeasonMeta(page) : fallbackSeasonMeta[season];
  const Icon = SeasonIcons[season];

  const seasonTyres = payloadTyres.map((t) => transformPayloadTyre(t) as TyreModel);

  // Separate popular and regular tyres
  const popularTyres = seasonTyres.filter((m) => m.isPopular);
  const otherTyres = seasonTyres.filter((m) => !m.isPopular);

  const seasonTitle = seasonLabels[season];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(generateBreadcrumbSchema([
          { name: "Головна", url: `${SITE_URL}/` },
          { name: "Легкові шини", url: `${SITE_URL}/passenger-tyres` },
          { name: seasonTitle, url: `${SITE_URL}/passenger-tyres/${slug}` },
        ])) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${seasonTitle} Bridgestone`,
          description: meta.description,
          url: `${SITE_URL}/passenger-tyres/${slug}`,
          inLanguage: "uk",
        }) }}
      />
      <div className="bg-background text-foreground">
        {/* Hero */}
        <section className="hero-adaptive py-8 md:py-12">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <Breadcrumb
                  className="hero-breadcrumb-adaptive mb-2"
                  items={[
                    { label: "Головна", href: "/" },
                    { label: "Легкові шини", href: "/passenger-tyres" },
                    { label: seasonLabels[season] },
                  ]}
              />
              <h1 className="hero-title-adaptive mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
                {meta.h1}
                <span className="hero-subtitle-adaptive mt-1 block text-base font-normal md:text-lg">
                  {meta.subtitle}
                </span>
              </h1>
              <p className="hero-text-adaptive mb-6 max-w-xl text-sm md:text-base">{meta.heroText}</p>
              <ul className="mb-8 space-y-3 text-sm">
                {meta.features.map((feat, idx) => (
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
                  src={meta.heroImageSrc}
                  alt={meta.h1}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`rounded-full ${seasonBgLight[season]} p-2`}>
                      <Icon className={`h-5 w-5 ${seasonTextColors[season]}`} />
                    </div>
                    <div className="heading-2 text-xl font-semibold text-white">{meta.h1}</div>
                  </div>
                  <p className="text-sm text-white/80">
                    {pluralize(seasonTyres.length, "модель", "моделі", "моделей")} у каталозі
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" aria-label="Каталог шин" className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          {popularTyres.length > 0 && (
            <>
              <div className="mb-8">
                <div className="heading-2 mb-2 text-2xl font-bold">Популярні моделі</div>
                <p className="text-muted-foreground">
                  Найбільш затребувані {seasonLabels[season].toLowerCase()} серед наших клієнтів.
                </p>
              </div>
              <TyreCardGrid tyres={popularTyres} variant="featured" />
            </>
          )}

          {otherTyres.length > 0 && (
            <div className={popularTyres.length > 0 ? "mt-16" : ""}>
              <div className="mb-8">
                <div className="heading-2 mb-2 text-2xl font-bold">
                  {popularTyres.length > 0 ? "Інші моделі" : "Всі моделі"}
                </div>
                <p className="text-muted-foreground">
                  {popularTyres.length > 0
                    ? `Додаткові ${seasonLabels[season].toLowerCase()} для різних потреб.`
                    : `Всі доступні ${seasonLabels[season].toLowerCase()} у каталозі.`}
                </p>
              </div>
              <TyreCardGrid tyres={otherTyres} />
            </div>
          )}

          {seasonTyres.length === 0 && (
            <div className="py-16 text-center">
              <Icon className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
              <div className="heading-2 mb-2 text-xl font-semibold">Моделі не знайдено</div>
              <p className="mb-6 text-muted-foreground">
                На жаль, {seasonLabels[season].toLowerCase()} для легкових авто наразі відсутні в
                каталозі.
              </p>
              <Link href="/passenger-tyres" className="text-primary hover:underline">
                Переглянути всі легкові шини
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <div className="border-t border-border">
        <ReviewsSection
          season={season}
          limit={6}
          title={`Відгуки про ${seasonLabels[season].toLowerCase()}`}
          showTyreName
          showAllLink
        />
      </div>

      {/* Related Seasons */}
      <section aria-label="Інші сезони" className="border-t border-border bg-card py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="heading-2 mb-8 text-center text-2xl font-bold">Інші сезони</div>
          <div className="grid gap-4 md:grid-cols-2">
            {(["summer", "winter", "allseason"] as Season[])
              .filter((s) => s !== season)
              .map((s) => {
                const SIcon = SeasonIcons[s];
                return (
                  <Link
                    key={s}
                    href={`/passenger-tyres/${seasonToSlug[s]}`}
                    className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className={`rounded-full ${seasonBgLight[s]} p-3`}>
                      <SIcon className={`h-6 w-6 ${seasonTextColors[s]}`} />
                    </div>
                    <div>
                      <div className="heading-3 font-semibold">{seasonLabels[s]}</div>
                      <p className="text-sm text-muted-foreground">Переглянути каталог</p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section aria-label="Допомога у виборі" className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div className="rounded-3xl bg-graphite p-10 text-white shadow-2xl dark:ring-1 dark:ring-stone-700">
            <div className="heading-2 mb-4 text-3xl font-bold">{meta.ctaTitle}</div>
            <p className="mb-8 text-lg opacity-90">
              {meta.ctaDescription}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={meta.ctaPrimaryHref}
                className="rounded-full bg-white px-8 py-3 font-semibold text-graphite transition-colors hover:bg-stone-100"
              >
                {meta.ctaPrimaryLabel}
              </Link>
              <Link
                href={meta.ctaSecondaryHref}
                className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                {meta.ctaSecondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
