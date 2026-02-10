import type { Metadata } from "next";
import { getDealers } from "@/lib/api/dealers";
import { generateBreadcrumbSchema, jsonLdScript } from "@/lib/schema";
import { SITE_URL, getSiteSettingsWithDefaults } from "@/lib/constants";
import { Breadcrumb } from "@/components/ui";
import { TrackDealerSearch } from "@/components/AnalyticsEvents";
import { DealersClient } from "./DealersClient";

export const metadata: Metadata = {
  title: "Де купити | Дилери Bridgestone в Україні",
  description:
    "Знайдіть офіційного дилера Bridgestone поруч з вами. Інтерактивна карта авторизованих точок продажу та сервісних центрів по всій Україні.",
  alternates: {
    canonical: "/dealers",
  },
  openGraph: {
    title: "Де купити | Дилери Bridgestone в Україні",
    description:
      "Інтерактивна карта офіційних дилерів Bridgestone по всій Україні. Пошук за містом та адресою.",
  },
};

export default async function DealersPage() {
  const [allDealers, settings] = await Promise.all([
    getDealers(),
    getSiteSettingsWithDefaults(),
  ]);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Головна", url: `${SITE_URL}/` },
    { name: "Дилери", url: `${SITE_URL}/dealers` },
  ]);

  return (
    <div className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
      />
      {/* Hero — server-rendered for SEO */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div
            className="mx-auto flex max-w-4xl flex-col gap-4 text-left md:gap-5"
          >
            <Breadcrumb
              className="hero-breadcrumb-adaptive mb-1"
              items={[
                { label: "Головна", href: "/" },
                { label: "Дилери / Де купити" },
              ]}
            />
            <h1 className="hero-title-adaptive text-3xl font-semibold tracking-tight md:text-4xl">
              Пошук офіційних дилерів Bridgestone
              <span className="hero-subtitle-adaptive mt-1 block text-base font-normal md:text-lg">
                використовуйте технічний пошук за містом, адресою та типом точки
              </span>
            </h1>
            <p className="hero-text-adaptive max-w-2xl text-sm md:text-base">
              Фільтруйте офіційні точки продажу та сервісні партнери Bridgestone по всій Україні.
            </p>
          </div>
        </div>
      </section>

      {/* Server-rendered dealers list for SEO (visible when JS is disabled) */}
      <noscript>
        <section className="pb-8">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <h2 className="mb-4 text-2xl font-bold">Усі дилери ({allDealers.length})</h2>
            <ul className="space-y-4">
              {allDealers.map((dealer) => (
                <li key={dealer.id} className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-semibold">{dealer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {[dealer.city, dealer.address].filter(Boolean).join(", ")}
                  </p>
                  {dealer.phone && (
                    <p className="text-sm">
                      <a href={`tel:${dealer.phone}`}>{dealer.phone}</a>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </noscript>

      {/* Interactive client parts (filters, map, geolocation, dealer list) */}
      <DealersClient initialDealers={allDealers} phoneHref={settings.phoneHref} />
      <TrackDealerSearch />
    </div>
  );
}
