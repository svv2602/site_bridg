import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, ExternalLink } from "lucide-react";
import type { TyreModel } from "@/lib/data";
import { getTyreModels, getTyreModelBySlug } from "@/lib/api/tyres";
import { generateBreadcrumbSchema, jsonLdScript } from "@/lib/schema";
import { Breadcrumb } from "@/components/ui";
import { seasonLabelsShort, brandLabels, vehicleTypeLabelsLong } from "@/lib/utils/tyres";
import { pluralize } from "@/lib/utils/pluralize";
import { TrackComparisonView } from "@/components/AnalyticsEvents";
import { SITE_URL } from "@/lib/constants";

// Comparison attributes
const comparisonAttributes = [
  { key: "brand", label: "Бренд" },
  { key: "season", label: "Сезон" },
  { key: "vehicleTypes", label: "Тип авто" },
  { key: "fuelEfficiency", label: "Паливна ефективність (EU)" },
  { key: "wetGrip", label: "Зчеплення на мокрій дорозі (EU)" },
  { key: "noiseDb", label: "Рівень шуму (EU)" },
  { key: "usage", label: "Призначення" },
  { key: "technologies", label: "Технології" },
  { key: "sizes", label: "Доступні розміри" },
];

function getAttributeValue(tyre: TyreModel, key: string): string {
  switch (key) {
    case "brand":
      return brandLabels[tyre.brand] || tyre.brand;
    case "season":
      return seasonLabelsShort[tyre.season] || tyre.season;
    case "vehicleTypes":
      return tyre.vehicleTypes.map((v) => vehicleTypeLabelsLong[v] || v).join(", ");
    case "fuelEfficiency":
      return tyre.euLabel?.fuelEfficiency || "—";
    case "wetGrip":
      return tyre.euLabel?.wetGrip || "—";
    case "noiseDb":
      return tyre.euLabel?.noiseDb ? `${tyre.euLabel.noiseDb} дБ` : "—";
    case "usage": {
      const usageLabels: string[] = [];
      if (tyre.usage?.city) usageLabels.push("Місто");
      if (tyre.usage?.highway) usageLabels.push("Траса");
      if (tyre.usage?.offroad) usageLabels.push("Бездоріжжя");
      if (tyre.usage?.winter) usageLabels.push("Зима");
      return usageLabels.length > 0 ? usageLabels.join(", ") : "—";
    }
    case "technologies":
      return tyre.technologies?.join(", ") || "—";
    case "sizes":
      return tyre.sizes?.length
        ? pluralize(tyre.sizes.length, "розмір", "розміри", "розмірів")
        : "—";
    default:
      return "—";
  }
}

function determineWinner(
  attribute: string,
  values: { slug: string; value: string }[]
): string | null {
  if (["fuelEfficiency", "wetGrip"].includes(attribute)) {
    const validValues = values.filter((v) => v.value !== "—");
    if (validValues.length < 2) return null;
    const sorted = [...validValues].sort((a, b) =>
      a.value.localeCompare(b.value)
    );
    if (sorted[0].value !== sorted[1].value) {
      return sorted[0].slug;
    }
    return null;
  }

  if (attribute === "noiseDb") {
    const validValues = values.filter(
      (v) => v.value !== "—" && v.value.includes("дБ")
    );
    if (validValues.length < 2) return null;
    const sorted = [...validValues].sort((a, b) => {
      const aNum = parseInt(a.value);
      const bNum = parseInt(b.value);
      return aNum - bNum;
    });
    const diff = parseInt(sorted[1].value) - parseInt(sorted[0].value);
    if (diff >= 2) {
      return sorted[0].slug;
    }
    return null;
  }

  return null;
}

// Parse slug to get tyre slugs
function parseComparisonSlug(slug: string): string[] {
  return slug.split("-vs-");
}

export async function generateStaticParams() {
  // Generate common comparison pairs
  const tyres = await getTyreModels();
  const params: { slug: string }[] = [];

  // Group by season
  const bySeason = tyres.reduce(
    (acc, tyre) => {
      if (!acc[tyre.season]) acc[tyre.season] = [];
      acc[tyre.season].push(tyre);
      return acc;
    },
    {} as Record<string, TyreModel[]>
  );

  // Create pairs within same season
  for (const season of Object.keys(bySeason)) {
    const seasonTyres = bySeason[season];
    for (let i = 0; i < seasonTyres.length && i < 5; i++) {
      for (let j = i + 1; j < seasonTyres.length && j < 5; j++) {
        params.push({
          slug: `${seasonTyres[i].slug}-vs-${seasonTyres[j].slug}`,
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tyreSlugs = parseComparisonSlug(slug);
  const compareTyres = (await Promise.all(
    tyreSlugs.map((s) => getTyreModelBySlug(s))
  )).filter(Boolean) as TyreModel[];

  if (compareTyres.length < 2) {
    return {
      title: "Порівняння шин — Bridgestone Україна",
    };
  }

  const names = compareTyres.map((t) => t.name).join(" vs ");
  const description = `Детальне порівняння ${names}. EU-маркування, технології, характеристики. Який варіант обрати для вашого автомобіля?`;

  return {
    title: `${names} — Порівняння шин Bridgestone`,
    description,
    alternates: {
      canonical: `/porivnyaty/${slug}`,
    },
    openGraph: {
      title: `${names} — Порівняння шин Bridgestone | Bridgestone Україна`,
      description,
      type: "website",
      locale: "uk_UA",
      siteName: "Bridgestone Україна",
    },
  };
}

function generateComparisonSchema(tyres: TyreModel[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Порівняння: ${tyres.map((t) => t.name).join(" vs ")}`,
    description: `Детальне порівняння шин Bridgestone: ${tyres.map((t) => t.name).join(", ")}`,
    inLanguage: "uk",
    about: tyres.map((tyre) => ({
      "@type": "Product",
      name: `Bridgestone ${tyre.name}`,
      brand: {
        "@type": "Brand",
        name: "Bridgestone",
      },
      category: "Автомобільні шини",
    })),
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tyreSlugs = parseComparisonSlug(slug);
  const compareTyres = (await Promise.all(
    tyreSlugs.map((s) => getTyreModelBySlug(s))
  )).filter(Boolean) as TyreModel[];

  if (compareTyres.length < 2) {
    notFound();
  }

  const siteUrl = SITE_URL;
  const comparisonSchema = generateComparisonSchema(compareTyres);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Головна", url: `${siteUrl}/` },
    { name: "Порівняння", url: `${siteUrl}/porivnyaty` },
    {
      name: compareTyres.map((t) => t.name).join(" vs "),
      url: `${siteUrl}/porivnyaty/${slug}`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(comparisonSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-gradient-to-br from-stone-900 to-stone-800 text-white py-12">
          <div className="container mx-auto px-4">
            <Breadcrumb
              className="mb-4"
              items={[
                { label: "Головна", href: "/" },
                { label: "Порівняння шин", href: "/porivnyaty" },
                { label: compareTyres.map((t) => t.name).join(" vs ") },
              ]}
            />

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {compareTyres.map((t) => t.name).join(" vs ")}
            </h1>
            <p className="text-stone-300 text-lg">
              Порівняння характеристик шин Bridgestone
            </p>
          </div>
        </section>

        {/* Tyre Cards */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div
              className={`grid gap-6 ${compareTyres.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}
            >
              {compareTyres.map((tyre) => (
                <div
                  key={tyre.slug}
                  className="bg-card border border-border rounded-xl p-6 text-center"
                >
                  <div className="aspect-square relative mb-4 bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden">
                    <Image
                      src={tyre.imageUrl || "/placeholder-tyre.png"}
                      alt={tyre.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 300px"
                      className="object-contain p-4"
                    />
                  </div>
                  <div className="heading-2 text-xl font-bold mb-2">{tyre.name}</div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {seasonLabelsShort[tyre.season]}
                  </p>
                  <Link
                    href={`/shyny/${tyre.slug}`}
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Детальніше
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="heading-2 text-2xl font-bold mb-8">Порівняння характеристик</div>

            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                aria-label={`Порівняння характеристик: ${compareTyres.map((t) => t.name).join(" vs ")}`}
              >
                <thead>
                  <tr className="border-b border-border">
                    <th
                      scope="col"
                      className="text-left py-4 px-4 font-semibold text-muted-foreground"
                    >
                      Характеристика
                    </th>
                    {compareTyres.map((tyre) => (
                      <th
                        key={tyre.slug}
                        scope="col"
                        className="text-center py-4 px-4 font-semibold"
                      >
                        {tyre.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonAttributes.map((attr) => {
                    const values = compareTyres.map((t) => ({
                      slug: t.slug,
                      value: getAttributeValue(t, attr.key),
                    }));
                    const winner = determineWinner(attr.key, values);

                    return (
                      <tr
                        key={attr.key}
                        className="border-b border-border hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      >
                        <th scope="row" className="py-4 px-4 font-medium text-left">
                          {attr.label}
                        </th>
                        {values.map((val) => (
                          <td
                            key={val.slug}
                            className={`py-4 px-4 text-center ${winner === val.slug ? "text-green-600 dark:text-green-400 font-semibold" : ""}`}
                          >
                            <span className="inline-flex items-center gap-2">
                              {val.value}
                              {winner === val.slug && (
                                <Check
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              )}
                              {winner === val.slug && (
                                <span className="sr-only">(Краще значення)</span>
                              )}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Verdict */}
        <section className="py-12 bg-stone-50 dark:bg-stone-900/50">
          <div className="container mx-auto px-4">
            <div className="heading-2 text-2xl font-bold mb-6">Висновок</div>
            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Обидві моделі є якісними шинами від Bridgestone. Вибір залежить
                від ваших потреб та стилю водіння. Рекомендуємо звернути увагу
                на EU-маркування та характеристики, що найважливіші для ваших
                умов експлуатації.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="heading-2 text-2xl font-bold mb-4">
              Готові обрати?
            </div>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Знайдіть найближчого дилера Bridgestone та придбайте обрану модель
              шин.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dealers"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-text rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Знайти дилера
              </Link>
              <Link
                href="/porivnyaty"
                className="inline-flex items-center justify-center px-6 py-3 border border-stone-300 rounded-lg font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Порівняти інші моделі
              </Link>
            </div>
          </div>
        </section>
      </main>
      <TrackComparisonView tyreNames={compareTyres.map((t) => t.name)} />
    </>
  );
}
