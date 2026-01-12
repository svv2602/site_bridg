import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Car, MapPin, ChevronRight, Truck, ArrowLeft } from "lucide-react";
import { type TyreModel } from "@/lib/data";
import { getTyreModels } from "@/lib/api/tyres";
import { TyreCardGrid } from "@/components/TyreCard";
import { generateProductSchema, generateBreadcrumbSchema, generateFAQSchema, jsonLdScript } from "@/lib/schema";
import { EuLabelBadge } from "@/components/ui/EuLabelBadge";
import { FAQSection } from "@/components/FAQSection";
import { TestResultsSection } from "@/components/TestResultsSection";
import { LexicalRenderer } from "@/components/LexicalRenderer";
import { KeyBenefits } from "@/components/KeyBenefits";
import { Breadcrumb } from "@/components/ui";
import { SizesByDiameter } from "@/components/SizesByDiameter";
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

  const siteUrl = getSiteUrl();
  const productSchema = generateProductSchema(model);
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
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(faqSchema) }}
        />
      )}
      {/* Hero */}
      <section className="hero-dark border-b border-hero-border py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <Breadcrumb
                className="mb-3 text-hero-muted [&_a:hover]:text-hero-foreground [&_span]:text-hero-foreground"
                items={[
                  { label: "Головна", href: "/" },
                  { label: "Каталог шин", href: "/passenger-tyres" },
                  { label: model.name },
                ]}
              />
              <div className="hero-badge mb-3 text-[11px] uppercase tracking-wide">
                <Car className="h-3 w-3" />
                <span>Модель шини Bridgestone</span>
              </div>
              <h1 className="hero-title mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.7rem]">
                {model.name}
                <span className="hero-subtitle mt-1 block text-base font-normal md:text-lg">
                  {seasonLabels[model.season]} для {formatVehicleTypes(model)}
                </span>
              </h1>
              <p className="hero-text mb-6 max-w-xl text-sm md:text-base">
                {model.shortDescription}
              </p>
              <div className="mb-6 flex flex-wrap gap-3 text-xs">
                <span className="rounded-full bg-hero-accent px-3 py-1 text-hero-foreground">
                  Сезонність: {seasonLabels[model.season]}
                </span>
                <span className="rounded-full bg-hero-accent px-3 py-1 text-hero-foreground">
                  Тип авто: {formatVehicleTypes(model)}
                </span>
                {model.technologies && model.technologies.length > 0 && (
                  <span className="rounded-full bg-hero-accent px-3 py-1 text-hero-foreground">
                    Технології: {model.technologies.length}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dealers"
                  className="hero-btn-primary inline-flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Знайти дилера
                </Link>
                <Link
                  href="/tyre-search"
                  className="hero-btn-secondary inline-flex items-center gap-2"
                >
                  Підібрати розмір
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="hero-card relative aspect-square min-h-[400px] overflow-hidden bg-gradient-to-br from-muted/50 to-muted lg:min-h-[500px]">
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
                  <div className="absolute bottom-0 left-0 right-0 border-t border-hero-border bg-black/50 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold text-hero-foreground">Фото незабаром</h3>
                    <p className="text-sm text-hero-muted">
                      Зображення моделі {model.name} буде додано найближчим часом.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specs & usage */}
      <section className="py-12">
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

              {/* Full Description */}
              {model.fullDescription ? (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-bold">Про модель {model.name}</h2>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <LexicalRenderer content={model.fullDescription as any} />
                </div>
              ) : null}

              {/* Key Benefits */}
              {model.keyBenefits && model.keyBenefits.length > 0 && (
                <KeyBenefits benefits={model.keyBenefits} />
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
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-card"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Повернутися до каталогу
                  </Link>
                  <Link
                    href="/tyre-search"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-card"
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
