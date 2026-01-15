import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Car, MapPin, ChevronRight, Truck, ArrowLeft } from "lucide-react";
import { type TyreModel } from "@/lib/data";
import { getTyreModels } from "@/lib/api/tyres";
import { TyreCardGrid } from "@/components/TyreCard";
import { generateProductSchemaWithReviews, generateBreadcrumbSchema, generateFAQSchema, jsonLdScript } from "@/lib/schema";
import { getReviewsByTyre, getReviewStats } from "@/lib/api/reviews";
import { EuLabelBadge } from "@/components/ui/EuLabelBadge";
import { FAQSection } from "@/components/FAQSection";
import { TestResultsSection } from "@/components/TestResultsSection";
import { LexicalRenderer } from "@/components/LexicalRenderer";
import { KeyBenefits } from "@/components/KeyBenefits";
import { Breadcrumb } from "@/components/ui";
import { SizesByDiameter } from "@/components/SizesByDiameter";
import { ReviewsSectionWithMore } from "@/components/ReviewsSectionWithMore";
import { seasonLabels, SeasonIcons, formatVehicleTypes, getSiteUrl } from "@/lib/utils/tyres";

function buildTitle(model: TyreModel): string {
  return `${model.name} — ${seasonLabels[model.season]} Bridgestone`;
}

export async function generateStaticParams() {
  const tyres = await getTyreModels();
  return tyres.map((model) => ({
    slug: model.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tyres = await getTyreModels();
  const model = tyres.find((m) => m.slug === slug);
  if (!model) {
    return {
      title: "Модель шини не знайдена — Bridgestone Україна",
    };
  }
  return {
    title: model.seoTitle || buildTitle(model),
    description:
      model.seoDescription ||
      model.shortDescription ||
      `Детальна інформація про шини ${model.name} Bridgestone: доступні розміри, індекси навантаження та швидкості, рекомендовані умови використання.`,
  };
}

export default async function TyreModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tyres = await getTyreModels();
  const model = tyres.find((m) => m.slug === slug);

  if (!model) {
    notFound();
  }

  const recommended = tyres.filter(
    (m) =>
      m.slug !== model.slug &&
      (m.season === model.season ||
        m.vehicleTypes.some((type) => model.vehicleTypes.includes(type))),
  ).slice(0, 3);

  // Fetch reviews and stats for schema.org and display (stable, not randomized)
  const [reviews, reviewStats] = await Promise.all([
    model.id ? getReviewsByTyre(model.id, 6, false) : Promise.resolve([]),
    model.id ? getReviewStats(model.id) : Promise.resolve({ totalCount: 0, averageRating: 0 }),
  ]);

  const siteUrl = getSiteUrl();
  const productSchema = generateProductSchemaWithReviews(model, reviews, reviewStats, siteUrl);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Головна", url: `${siteUrl}/` },
    { name: "Каталог шин", url: `${siteUrl}/passenger-tyres` },
    { name: model.name, url: `${siteUrl}/shyny/${model.slug}` },
  ]);
  const faqSchema = model.faqs && model.faqs.length > 0 ? generateFAQSchema(model.faqs) : null;

  return (
    <div className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(faqSchema) }}
        />
      ) : null}
      {/* Hero - Silver (light) / Dark (dark theme) */}
      <section className="border-b border-stone-200 dark:border-stone-800 bg-gradient-to-br from-stone-100 via-stone-50 to-white dark:from-stone-950 dark:via-stone-900 dark:to-stone-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <Breadcrumb
                className="mb-3 text-stone-500 dark:text-stone-400 [&_a:hover]:text-stone-900 dark:[&_a:hover]:text-white [&_span]:text-stone-700 dark:[&_span]:text-stone-200"
                items={[
                  { label: "Головна", href: "/" },
                  { label: "Каталог шин", href: "/passenger-tyres" },
                  { label: model.name },
                ]}
              />
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 px-4 py-1.5 text-[11px] uppercase tracking-wide text-stone-600 dark:text-stone-300 shadow-sm">
                <Car className="h-3 w-3" />
                <span>Модель шини Bridgestone</span>
              </div>
              <h1 className="mb-4 text-3xl font-semibold tracking-tight text-stone-900 dark:text-white md:text-4xl lg:text-[2.7rem]">
                {model.name}
                <span className="mt-1 block text-base font-normal text-stone-500 dark:text-stone-400 md:text-lg">
                  {seasonLabels[model.season]} для {formatVehicleTypes(model)}
                </span>
              </h1>
              <p className="mb-6 max-w-xl text-sm text-stone-600 dark:text-stone-300 md:text-base">
                {model.shortDescription}
              </p>
              <div className="mb-6 flex flex-wrap gap-3 text-xs">
                <span className="rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 px-3 py-1 text-stone-700 dark:text-stone-200 shadow-sm">
                  Сезонність: {seasonLabels[model.season]}
                </span>
                <span className="rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 px-3 py-1 text-stone-700 dark:text-stone-200 shadow-sm">
                  Тип авто: {formatVehicleTypes(model)}
                </span>
                {model.technologies && model.technologies.length > 0 && (
                  <span className="rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 px-3 py-1 text-stone-700 dark:text-stone-200 shadow-sm">
                    Технології: {model.technologies.length}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dealers"
                  className="inline-flex items-center gap-2 rounded-full bg-stone-900 dark:bg-white px-6 py-3 font-semibold text-white dark:text-stone-900 shadow-lg transition-all hover:bg-stone-800 dark:hover:bg-stone-100"
                >
                  <MapPin className="h-4 w-4" />
                  Знайти дилера
                </Link>
                <Link
                  href="/tyre-search"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 dark:border-stone-600 bg-white dark:bg-transparent px-6 py-3 font-semibold text-stone-900 dark:text-white transition-all hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Підібрати розмір
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-square min-h-[400px] overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-700 bg-gradient-to-br from-white to-stone-100 dark:from-stone-800 dark:to-stone-900 shadow-xl lg:min-h-[500px]">
                {model.imageUrl ? (
                  <Image
                    src={model.imageUrl}
                    alt={`Шина ${model.name}`}
                    fill
                    className="object-contain p-8 transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {model.vehicleTypes.includes("lcv") ? (
                      <Truck className="h-48 w-48 text-muted-foreground/20" />
                    ) : (
                      <Car className="h-48 w-48 text-muted-foreground/20" />
                    )}
                  </div>
                )}
                <div className={`absolute top-4 left-4 flex items-center gap-2 rounded-lg badge-${model.season} px-4 py-2 text-sm font-semibold shadow-lg`}>
                  {(() => {
                    const Icon = SeasonIcons[model.season];
                    return <Icon className="h-5 w-5" aria-hidden="true" />;
                  })()}
                  <span className="ml-1">{seasonLabels[model.season]}</span>
                </div>
                {model.isNew && (
                  <div className="absolute top-4 right-4 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                    Новинка
                  </div>
                )}
                {!model.imageUrl && (
                  <div className="absolute bottom-0 left-0 right-0 border-t border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold text-stone-900 dark:text-white">Фото незабаром</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      Зображення моделі {model.name} буде додано найближчим часом.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Description - Full Width */}
      {model.fullDescription ? (
        <section className="border-b border-border bg-stone-50 dark:bg-stone-900/50 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl px-4 md:px-8">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">Про модель {model.name}</h2>
            <div className="prose prose-lg max-w-none">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <LexicalRenderer
                content={model.fullDescription as any}
                variant="product"
                leadParagraph
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* Key Benefits - Full Width */}
      {model.keyBenefits && model.keyBenefits.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <KeyBenefits benefits={model.keyBenefits} />
          </div>
        </section>
      )}

      {/* Specs & usage */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold">Технічні характеристики</h2>
                <SizesByDiameter sizes={model.sizes} modelSlug={model.slug} />
              </div>

              {model.euLabel && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-bold">EU‑маркування</h2>
                  <div className="grid gap-4 sm:grid-cols-3 text-sm">
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="mb-2 text-xs text-muted-foreground">Зчеплення на мокрій дорозі</p>
                      {model.euLabel.wetGrip ? (
                        <EuLabelBadge
                          type="wetGrip"
                          value={model.euLabel.wetGrip as "A" | "B" | "C" | "D" | "E"}
                          size="lg"
                          showLabel={false}
                        />
                      ) : (
                        <p className="text-2xl font-bold text-muted-foreground">—</p>
                      )}
                    </div>
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="mb-2 text-xs text-muted-foreground">Економія пального</p>
                      {model.euLabel.fuelEfficiency ? (
                        <EuLabelBadge
                          type="fuelEfficiency"
                          value={model.euLabel.fuelEfficiency as "A" | "B" | "C" | "D" | "E"}
                          size="lg"
                          showLabel={false}
                        />
                      ) : (
                        <p className="text-2xl font-bold text-muted-foreground">—</p>
                      )}
                    </div>
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="mb-2 text-xs text-muted-foreground">Рівень шуму</p>
                      {model.euLabel.noiseDb ? (
                        <EuLabelBadge
                          type="noise"
                          value={model.euLabel.noiseDb}
                          size="lg"
                          showLabel={false}
                        />
                      ) : (
                        <p className="text-2xl font-bold text-muted-foreground">—</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-bold">Для яких умов підходить</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Інформаційний блок на основі сценаріїв використання з технічного опису моделі.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    Місто:{" "}
                    <span className="font-medium">
                      {model.usage.city ? "рекомендовано" : "можливо"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    Траса:{" "}
                    <span className="font-medium">
                      {model.usage.highway ? "рекомендовано" : "можливо"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    Зима / сніг:{" "}
                    <span className="font-medium">
                      {model.usage.winter
                        ? "рекомендовано"
                        : "можливо за умовами експлуатації"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    Офф‑роуд:{" "}
                    <span className="font-medium">
                      {model.usage.offroad ? "рекомендовано" : "для легкого бездоріжжя"}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-bold">Повернутися до каталогу</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Ви можете перейти до загального каталогу шин або до пошуку за параметрами.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/passenger-tyres"
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Повернутися до каталогу
                  </Link>
                  <Link
                    href="/tyre-search"
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                    Перейти до пошуку шин
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Test Results */}
      {model.testResults && model.testResults.length > 0 && (
        <TestResultsSection results={model.testResults} tireName={model.name} />
      )}

      {/* Reviews */}
      {model.id && reviewStats.totalCount > 0 && (
        <div className="border-t border-border">
          <ReviewsSectionWithMore
            initialReviews={reviews}
            tyreId={model.id}
            totalCount={reviewStats.totalCount}
            title={`Відгуки про ${model.name}`}
          />
        </div>
      )}

      {/* FAQ */}
      {model.faqs && model.faqs.length > 0 && (
        <FAQSection faqs={model.faqs} tireName={model.name} />
      )}

      {/* Recommended models */}
      {recommended.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-card to-background">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <h2 className="mb-8 text-2xl font-bold md:text-3xl">
              Рекомендовані моделі Bridgestone
            </h2>
            <TyreCardGrid tyres={recommended} />
          </div>
        </section>
      )}
    </div>
  );
}
