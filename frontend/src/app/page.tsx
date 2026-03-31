import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ChevronRight, Star, Award } from "lucide-react";
import { getSiteSettingsWithDefaults } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Bridgestone Україна — офіційний сайт | Шини для легкових авто, SUV, фургонів",
  description:
    "Офіційний сайт Bridgestone в Україні. Підберіть літні, зимові та всесезонні шини преміум-класу для легкових авто, SUV та комерційного транспорту. Знайдіть дилера поруч.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bridgestone Україна — офіційний сайт | Шини для легкових авто, SUV, фургонів",
    description:
      "Підберіть літні, зимові та всесезонні шини Bridgestone преміум-класу. Пошук за розміром та авто, карта дилерів, поради експертів.",
  },
};
import { tyreCategories, features } from "./page-data";
import { SeasonalHero } from "@/components/SeasonalHero";
import { QuickSearchForm } from "@/components/QuickSearchForm";
import { getSeasonalContent } from "@/lib/api/payload";
import { ProductCarousel } from "@/components/ProductCarousel";
import { VehicleTypeCard, vehicleTypesData } from "@/components/VehicleTypeCard";
import { AnimatedCard, AnimatedCardX } from "@/components/AnimatedSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { pluralize } from "@/lib/utils/pluralize";

// Lazy load below-the-fold components
const DealerLocatorCompact = dynamic(
  () => import("@/components/DealerLocatorCompact").then(mod => mod.DealerLocatorCompact),
  {
    loading: () => (
      <section className="py-12 bg-stone-50 dark:bg-stone-900/50">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="h-64 animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
        </div>
      </section>
    ),
  }
);
import { getTyreModels } from "@/lib/api/tyres";
import { getDealers } from "@/lib/api/dealers";
import { getLatestArticles } from "@/lib/api/articles";
import { t } from "@/lib/i18n";
import { seasonLabelsShort, vehicleTypeLabels } from "@/lib/utils/tyres";

// vehicleLabels consolidated into vehicleTypeLabels from @/lib/utils/tyres

// ---- Suspense skeleton components ----

function ArticlesSkeleton() {
  return (
    <section className="py-12">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 h-8 w-64 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="mx-auto h-6 w-96 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Async data-fetching server components ----

interface FeaturedTyre {
  name: string;
  slug: string;
  tag: string;
  description: string;
  rating: number;
}

function FeaturedTyresCards({ featuredTyres }: { featuredTyres: FeaturedTyre[] }) {
  return featuredTyres.length > 0 ? (
    <>
      {featuredTyres.map((tyre, idx) => (
        <AnimatedCardX
          key={tyre.slug}
          delay={idx * 0.1}
          direction="right"
          className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="mt-1 h-12 w-12 flex-shrink-0 rounded-full bg-purple-500/15 flex items-center justify-center">
            <Star className="h-6 w-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <div className="heading-3 text-xl font-bold">{tyre.name}</div>
            <p className="text-sm uppercase tracking-wide text-primary">{tyre.tag}</p>
            <p className="mt-2 text-sm text-muted-foreground">{tyre.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/shyny/${tyre.slug}`}
                className="rounded-full border border-stone-300 bg-transparent px-3 py-1.5 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700"
              >
                Дізнатися більше
              </Link>
              <Link
                href="/dealers"
                className="rounded-full bg-primary px-3 py-1.5 text-xs sm:text-sm font-semibold text-primary-text hover:bg-primary-hover"
              >
                Знайти магазин
              </Link>
            </div>
          </div>
        </AnimatedCardX>
      ))}
    </>
  ) : (
    <p className="text-muted-foreground">{t('home.loadingPopularModels')}</p>
  );
}

async function ArticlesSection() {
  const latestArticles = await getLatestArticles(3);
  const articles = latestArticles.map(a => ({
    title: a.title,
    slug: a.slug,
    readingTime: a.readingTimeMinutes
      ? `${pluralize(a.readingTimeMinutes, 'хвилина', 'хвилини', 'хвилин')} читання`
      : '5 хвилин читання',
    category: a.tags?.[0] || 'Поради',
  }));

  return (
    <section className="py-12">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 text-center">
          <div className="heading-2 mb-4 text-3xl font-bold">{t('home.adviceTitle')}</div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('home.adviceDescription')}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article, idx) => (
            <AnimatedCard
              key={article.slug}
              delay={idx * 0.1}
              className="rounded-2xl border border-border bg-card p-6 shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-700 dark:bg-stone-700 dark:text-stone-200">
                {article.category}
              </div>
              <div className="heading-3 mb-2 text-xl font-bold">{article.title}</div>
              <p className="mb-4 text-sm text-muted-foreground">{article.readingTime}</p>
              <Link
                href={`/blog/${article.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Читати <ChevronRight className="h-4 w-4" />
              </Link>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}

async function DealerLocatorSection() {
  const allDealers = await getDealers();
  return <DealerLocatorCompact initialDealers={allDealers} />;
}

// ---- Main page component ----

export default async function Home() {
  const [seasonalData, allTyres, settings] = await Promise.all([
    getSeasonalContent(),
    getTyreModels(),
    getSiteSettingsWithDefaults(),
  ]);

  const popularTyres = allTyres.filter(t => t.isPopular);
  const carouselTyres = popularTyres.slice(0, 8);
  const featuredTyres: FeaturedTyre[] = popularTyres
    .slice(0, 3)
    .map(t => ({
      name: `Bridgestone ${t.name}`,
      slug: t.slug,
      tag: `${seasonLabelsShort[t.season] || t.season} • ${t.vehicleTypes.map(v => vehicleTypeLabels[v] || v).join(' / ')}`,
      description: t.shortDescription || '',
      rating: 4.8,
    }));

  return (
    <div className="bg-background text-foreground">
      {/* Hero with Seasonal Content — data fetched server-side to avoid CORS */}
      <SeasonalHero seasonalData={seasonalData}>
        <QuickSearchForm />
      </SeasonalHero>

      {/* Product Carousel */}
      <ProductCarousel tyres={carouselTyres} title="Популярні моделі" />

      {/* Features — static content, no data fetch needed */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <div className="heading-2 mb-4 text-3xl font-bold">{t('home.whyBridgestone')}</div>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t('home.whyBridgestoneDescription')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, idx) => (
              <AnimatedCard
                key={idx}
                delay={idx * 0.1}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-lg"
              >
                <div className={`mx-auto mb-4 inline-flex rounded-full ${feat.color.bg} p-3`}>
                  <feat.icon className={`h-6 w-6 ${feat.color.text}`} />
                </div>
                <div className="heading-3 mb-2 text-xl font-bold">{feat.title}</div>
                <p className="text-sm text-muted-foreground">{feat.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Types — static content */}
      <section className="py-12 bg-stone-50 dark:bg-stone-900/50">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 text-center">
            <div className="heading-2 mb-4 text-3xl font-bold">Шини за типом авто</div>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Оберіть категорію, що відповідає вашому автомобілю
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-2">
            {vehicleTypesData.map((vehicle, idx) => (
              <AnimatedCard key={vehicle.href} delay={idx * 0.15}>
                <VehicleTypeCard {...vehicle} />
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Categories & Popular — Categories are static, Popular fetches data */}
      <section className="py-12 bg-background">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="heading-2 mb-6 text-3xl font-bold">{t('home.tyresBySeason')}</div>
              <p className="mb-8 text-lg text-muted-foreground">
                {t('home.tyresBySeasonDescription')}
              </p>
              <div className="space-y-4">
                {tyreCategories.map((cat, idx) => {
                  const isFeatured = cat.id === seasonalData.featuredSeason;
                  return (
                    <AnimatedCardX
                      key={cat.id}
                      delay={idx * 0.1}
                      direction="left"
                      className={`flex items-center gap-4 rounded-2xl border p-5 shadow-sm ${
                        isFeatured
                          ? 'border-primary/40 ring-1 ring-primary/20 bg-card'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className={`rounded-full bg-gradient-to-br ${cat.color} p-3`}>
                        <cat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="heading-3 text-xl font-bold">{cat.name}</div>
                          {isFeatured && (
                            <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-700 dark:bg-stone-700 dark:text-stone-200">
                              Рекомендовано
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      </div>
                      <Link
                        href={cat.href}
                        className="rounded-full border border-stone-300 bg-transparent px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700"
                      >
                        Обрати шини
                      </Link>
                    </AnimatedCardX>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="heading-2 mb-6 text-3xl font-bold">{t('home.popularModels')}</div>
              <p className="mb-8 text-lg text-muted-foreground">
                {t('home.popularModelsDescription')}
              </p>
              <div className="space-y-6">
                <FeaturedTyresCards featuredTyres={featuredTyres} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles — streams */}
      <Suspense fallback={<ArticlesSkeleton />}>
        <ArticlesSection />
      </Suspense>

      {/* Trust Indicators — static content */}
      <section className="border-y border-border bg-stone-50 py-12 dark:bg-stone-900/50">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-stone-200 px-4 py-1.5 text-sm font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-200">
              <Award className="h-4 w-4" />
              Незалежні тести
            </div>
            <div className="heading-2 text-2xl font-bold md:text-3xl">Підтверджена якість</div>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Шини Bridgestone регулярно отримують високі оцінки від провідних європейських тестових організацій
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="group flex flex-col items-center gap-2">
              <div className="flex h-16 w-28 items-center justify-center rounded-xl bg-white p-3 shadow-sm transition-shadow group-hover:shadow-md dark:bg-stone-800">
                <Image
                  src="/images/logos/adac.svg"
                  alt="ADAC"
                  width={80}
                  height={40}
                  className="h-8 w-auto object-contain opacity-70 transition-opacity group-hover:opacity-100"
                />
              </div>
              <span className="text-xs text-muted-foreground">Німеччина</span>
            </div>
            <div className="group flex flex-col items-center gap-2">
              <div className="flex h-16 w-28 items-center justify-center rounded-xl bg-white p-3 shadow-sm transition-shadow group-hover:shadow-md dark:bg-stone-800">
                <Image
                  src="/images/logos/autobild.svg"
                  alt="Auto Bild"
                  width={80}
                  height={40}
                  className="h-8 w-auto object-contain opacity-70 transition-opacity group-hover:opacity-100"
                />
              </div>
              <span className="text-xs text-muted-foreground">Німеччина</span>
            </div>
            <div className="group flex flex-col items-center gap-2">
              <div className="flex h-16 w-28 items-center justify-center rounded-xl bg-white p-3 shadow-sm transition-shadow group-hover:shadow-md dark:bg-stone-800">
                <Image
                  src="/images/logos/tcs.svg"
                  alt="TCS"
                  width={80}
                  height={40}
                  className="h-8 w-auto object-contain opacity-70 transition-opacity group-hover:opacity-100"
                />
              </div>
              <span className="text-xs text-muted-foreground">Швейцарія</span>
            </div>
            <div className="group flex flex-col items-center gap-2">
              <div className="flex h-16 w-28 items-center justify-center rounded-xl bg-white p-3 shadow-sm transition-shadow group-hover:shadow-md dark:bg-stone-800">
                <Image
                  src="/images/logos/tyrereviews.svg"
                  alt="Tyre Reviews"
                  width={80}
                  height={40}
                  className="h-8 w-auto object-contain opacity-70 transition-opacity group-hover:opacity-100"
                />
              </div>
              <span className="text-xs text-muted-foreground">Великобританія</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSection
        limit={6}
        title="Відгуки покупців"
        showTyreName
      />

      {/* Dealer Locator — streams */}
      <Suspense fallback={
        <section className="py-12 bg-stone-50 dark:bg-stone-900/50">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="h-64 animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
          </div>
        </section>
      }>
        <DealerLocatorSection />
      </Suspense>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <AnimatedCard className="rounded-3xl bg-graphite p-10 text-white shadow-2xl dark:ring-1 dark:ring-stone-700">
            <div className="heading-2 mb-4 text-3xl font-bold">Не впевнені, які шини обрати?</div>
            <p className="mb-8 text-lg opacity-90">
              Наші експерти допоможуть підібрати ідеальні шини саме для вас —
              з урахуванням вашого стилю водіння та бюджету.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contacts"
                className="rounded-full bg-white px-8 py-3 font-semibold text-graphite transition-colors hover:bg-stone-100"
              >
                Допоможіть мені обрати
              </Link>
            </div>
          </AnimatedCard>
        </div>
      </section>
    </div>
  );
}
