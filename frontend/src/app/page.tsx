import Link from "next/link";
import Image from "next/image";
import { Shield, Zap, Sun, Snowflake, Cloud, ChevronRight, Star, Users, Globe, Phone, Award } from "lucide-react";
import { SeasonalHero } from "@/components/SeasonalHero";
import { QuickSearchForm } from "@/components/QuickSearchForm";
import { ProductCarousel } from "@/components/ProductCarousel";
import { VehicleTypeCard, vehicleTypesData } from "@/components/VehicleTypeCard";
import { DealerLocatorCompact } from "@/components/DealerLocatorCompact";
import { AnimatedCard, AnimatedCardX } from "@/components/AnimatedSection";
import { getTyreModels } from "@/lib/api/tyres";
import { getDealers } from "@/lib/api/dealers";
import { getLatestArticles } from "@/lib/api/articles";
import { t } from "@/lib/i18n";

const tyreCategories = [
  {
    id: "summer",
    name: "Літні шини",
    description: "Для теплої пори року, оптимальні для сухого та мокрого асфальту.",
    icon: Sun,
    color: "from-orange-500 to-yellow-500",
    href: "/passenger-tyres/summer",
  },
  {
    id: "winter",
    name: "Зимові шини",
    description: "Максимальне зчеплення на снігу та льоду в зимових умовах.",
    icon: Snowflake,
    color: "from-blue-500 to-cyan-400",
    href: "/passenger-tyres/winter",
  },
  {
    id: "allseason",
    name: "Всесезонні шини",
    description: "Компромісне рішення для помірного клімату без екстремальних умов.",
    icon: Cloud,
    color: "from-gray-500 to-gray-300",
    href: "/passenger-tyres/all-season",
  },
];

const features = [
  {
    icon: Shield,
    title: "Безпека на першому місці",
    description: "Технології, що забезпечують надійне зчеплення в будь-яких умовах.",
  },
  {
    icon: Zap,
    title: "Економія палива",
    description: "Знижений опір коченню для зменшення витрат на пального.",
  },
  {
    icon: Users,
    title: "Експертна підтримка",
    description: "Консультації від офіційних дилерів та сервісних центрів.",
  },
  {
    icon: Globe,
    title: "Глобальна якість",
    description: "Продукція, що відповідає міжнародним стандартам безпеки.",
  },
];

const seasonLabels: Record<string, string> = {
  summer: "Літня",
  winter: "Зимова",
  allseason: "Всесезонна",
};

const vehicleLabels: Record<string, string> = {
  passenger: "Легковий авто",
  suv: "SUV/Кросовер",
  lcv: "Комерційний",
};

export default async function Home() {
  // Fetch popular tyres from API
  const allTyres = await getTyreModels();

  // Tyres for carousel (full model objects)
  const carouselTyres = allTyres.filter(t => t.isPopular).slice(0, 8);

  // Featured tyres for sidebar list (formatted)
  const featuredTyres = allTyres
    .filter(t => t.isPopular)
    .slice(0, 3)
    .map(t => ({
      name: `Bridgestone ${t.name}`,
      slug: t.slug,
      tag: `${seasonLabels[t.season] || t.season} • ${t.vehicleTypes.map(v => vehicleLabels[v] || v).join(' / ')}`,
      description: t.shortDescription || '',
      rating: 4.8,
    }));

  // Fetch dealers for locator
  const allDealers = await getDealers();

  // Fetch latest articles from API
  const latestArticles = await getLatestArticles(3);
  const articles = latestArticles.map(a => ({
    title: a.title,
    slug: a.slug,
    readingTime: a.readingTimeMinutes ? `${a.readingTimeMinutes} хвилин читання` : '5 хвилин читання',
    category: a.tags?.[0] || 'Поради',
  }));

  return (
    <div className="bg-background text-foreground">
      {/* Hero with Seasonal Content */}
      <SeasonalHero>
        <QuickSearchForm />
      </SeasonalHero>

      {/* Product Carousel */}
      <ProductCarousel tyres={carouselTyres} title="Популярні моделі" />

      {/* Features */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">{t('home.whyBridgestone')}</h2>
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
                <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <feat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">{feat.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Types */}
      <section className="py-12 bg-stone-50 dark:bg-stone-900/50">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">Шини за типом авто</h2>
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

      {/* Categories & Popular */}
      <section className="py-12 bg-background">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">{t('home.tyresBySeason')}</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                {t('home.tyresBySeasonDescription')}
              </p>
              <div className="space-y-4">
                {tyreCategories.map((cat, idx) => (
                  <AnimatedCardX
                    key={cat.id}
                    delay={idx * 0.1}
                    direction="left"
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className={`rounded-full bg-gradient-to-br ${cat.color} p-3`}>
                      <cat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                    <Link
                      href={cat.href}
                      className="rounded-full border border-border bg-transparent px-4 py-2 text-sm font-semibold hover:bg-card"
                    >
                      Обрати шини
                    </Link>
                  </AnimatedCardX>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-6 text-3xl font-bold">{t('home.popularModels')}</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                {t('home.popularModelsDescription')}
              </p>
              <div className="space-y-6">
                {featuredTyres.length > 0 ? (
                  featuredTyres.map((tyre, idx) => (
                    <AnimatedCardX
                      key={tyre.slug}
                      delay={idx * 0.1}
                      direction="right"
                      className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
                    >
                      <div className="mt-1 h-12 w-12 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{tyre.name}</h3>
                        <p className="text-sm uppercase tracking-wide text-primary">{tyre.tag}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{tyre.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            href={`/shyny/${tyre.slug}`}
                            className="rounded-full border border-border bg-transparent px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-card"
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
                  ))
                ) : (
                  <p className="text-muted-foreground">{t('home.loadingPopularModels')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">{t('home.adviceTitle')}</h2>
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
                <h3 className="mb-2 text-xl font-bold">{article.title}</h3>
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

      {/* Trust Indicators */}
      <section className="border-y border-border bg-stone-50 py-12 dark:bg-stone-900/50">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-stone-200 px-4 py-1.5 text-sm font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-200">
              <Award className="h-4 w-4" />
              Незалежні тести
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">Підтверджена якість</h2>
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

      {/* Dealer Locator */}
      <DealerLocatorCompact initialDealers={allDealers} />

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <AnimatedCard className="rounded-3xl bg-graphite p-10 text-white shadow-2xl">
            <h3 className="mb-4 text-3xl font-bold">Не впевнені, які шини обрати?</h3>
            <p className="mb-8 text-lg opacity-90">
              Наші експерти допоможуть підібрати ідеальні шини саме для вас —
              з урахуванням вашого стилю водіння та бюджету.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contacts"
                className="rounded-full bg-white px-8 py-3 font-semibold text-graphite hover:bg-stone-100"
              >
                Допоможіть мені обрати
              </Link>
              <a
                href="tel:+380800123456"
                className="inline-flex items-center gap-2 rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                Зателефонувати
              </a>
            </div>
          </AnimatedCard>
        </div>
      </section>
    </div>
  );
}
