import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type React from "react";
import { Car, MapPin, Shield, Zap, Snowflake, Sun, Cloud, ArrowLeft, ChevronRight, Truck } from "lucide-react";
import { type Season, type TyreModel } from "@/lib/data";
import { getTyreModels } from "@/lib/api/tyres";
import { TyreCardGrid } from "@/components/TyreCard";
import { generateProductSchema, generateBreadcrumbSchema, jsonLdScript } from "@/lib/schema";

const seasonLabels: Record<Season, string> = {
  summer: "Літні шини",
  winter: "Зимові шини",
  allseason: "Всесезонні шини",
};

const seasonIcons: Record<Season, React.ReactNode> = {
  summer: <Sun className="h-5 w-5" />,
  winter: <Snowflake className="h-5 w-5" />,
  allseason: <Cloud className="h-5 w-5" />,
};

function formatVehicleTypes(model: TyreModel) {
  const labels: string[] = [];
  if (model.vehicleTypes.includes("passenger")) {
    labels.push("Легкові авто");
  }
  if (model.vehicleTypes.includes("suv")) {
    labels.push("SUV / 4x4");
  }
  if (model.vehicleTypes.includes("lcv")) {
    labels.push("Легкі комерційні авто");
  }
  return labels.join(" • ");
}

function formatSize(size: TyreModel["sizes"][number]) {
  const base = `${size.width}/${size.aspectRatio} R${size.diameter}`;
  const li = size.loadIndex ? ` ${size.loadIndex}` : "";
  const si = size.speedIndex ?? "";
  return `${base}${li}${si}`;
}

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
    title: buildTitle(model),
    description:
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

  const productSchema = generateProductSchema(model);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Головна", url: "https://bridgestone.ua/" },
    { name: "Каталог шин", url: "https://bridgestone.ua/passenger-tyres" },
    { name: model.name, url: `https://bridgestone.ua/shyny/${model.slug}` },
  ]);

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
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="text-zinc-50">
              <nav className="mb-3 flex items-center gap-2 text-xs text-zinc-400">
                <Link href="/" className="hover:text-zinc-100">
                  Головна
                </Link>
                <span>/</span>
                <Link href="/passenger-tyres" className="hover:text-zinc-100">
                  Каталог шин
                </Link>
                <span>/</span>
                <span className="font-medium text-zinc-100">{model.name}</span>
              </nav>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-200 ring-1 ring-zinc-700">
                <Car className="h-3 w-3" />
                <span>Модель шини Bridgestone</span>
              </div>
              <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.7rem]">
                {model.name}
                <span className="mt-1 block text-base font-normal text-zinc-300 md:text-lg">
                  {seasonLabels[model.season]} для {formatVehicleTypes(model)}
                </span>
              </h1>
              <p className="mb-6 max-w-xl text-sm text-zinc-300 md:text-base">
                {model.shortDescription}
              </p>
              <div className="mb-6 flex flex-wrap gap-3 text-xs">
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-100">
                  Сезонність: {seasonLabels[model.season]}
                </span>
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-100">
                  Тип авто: {formatVehicleTypes(model)}
                </span>
                {model.technologies && model.technologies.length > 0 && (
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-100">
                    Технології: {model.technologies.length}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dealers"
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white"
                >
                  <MapPin className="h-4 w-4" />
                  Знайти дилера
                </Link>
                <Link
                  href="/tyre-search"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-500 bg-transparent px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
                >
                  Підібрати розмір
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-square min-h-[400px] overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 lg:min-h-[500px]">
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
                <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-zinc-900/90 px-4 py-2 text-sm font-semibold text-zinc-50 ring-1 ring-zinc-600">
                  {seasonIcons[model.season]}
                  <span className="ml-1">{seasonLabels[model.season]}</span>
                </div>
                {model.isNew && (
                  <div className="absolute top-4 right-4 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                    Новинка
                  </div>
                )}
                {!model.imageUrl && (
                  <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 p-6">
                    <h3 className="text-lg font-semibold text-zinc-50">Фото незабаром</h3>
                    <p className="text-sm text-zinc-300">
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
                {model.sizes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Дані про типорозміри для цієї моделі будуть додані пізніше.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="py-2 pr-4">Типорозмір</th>
                          <th className="py-2 pr-4">Індекс навантаження</th>
                          <th className="py-2 pr-4">Індекс швидкості</th>
                        </tr>
                      </thead>
                      <tbody>
                        {model.sizes.map((size, idx) => (
                          <tr
                            key={`${model.slug}-${idx}`}
                            className="border-b border-border/60 last:border-0"
                          >
                            <td className="py-2 pr-4 font-medium text-foreground">
                              {formatSize(size)}
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground">
                              {size.loadIndex ?? "—"}
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground">
                              {size.speedIndex ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {model.euLabel && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-bold">EU‑маркування</h2>
                  <div className="grid gap-4 sm:grid-cols-3 text-sm">
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Зчеплення на мокрій дорозі</p>
                      <p className="mt-1 text-2xl font-bold text-primary">
                        {model.euLabel.wetGrip ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Економія пального</p>
                      <p className="mt-1 text-2xl font-bold text-primary">
                        {model.euLabel.fuelEfficiency ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Рівень шуму, dB</p>
                      <p className="mt-1 text-2xl font-bold text-primary">
                        {model.euLabel.noiseDb ?? "—"}
                      </p>
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
