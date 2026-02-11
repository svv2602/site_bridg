import type { Metadata } from "next";
import Link from "next/link";
import { Truck, ChevronRight } from "lucide-react";
import { getPayloadTyres, transformPayloadTyre, getCategoryPageBySlug } from "@/lib/api/payload";
import type { TyreModel } from "@/lib/data";
import { CategoryPage } from "@/components/CategoryPage";
import { fallbackVehicleConfigs, fallbackSeo } from "@/lib/fallback/category-pages";
import { transformToVehicleConfig } from "@/lib/api/transforms/category-page";

const SLUG = "lcv-tyres";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCategoryPageBySlug(SLUG);
  const seo = page
    ? { title: page.seoTitle || page.title, description: page.seoDescription || "" }
    : fallbackSeo[SLUG];

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `/${SLUG}` },
    openGraph: {
      title: seo.title ? `${seo.title} | Bridgestone Україна` : seo.title,
      description: seo.description,
      type: "website",
      locale: "uk_UA",
      siteName: "Bridgestone Україна",
    },
  };
}

export default async function LcvTyresPage() {
  const [page, payloadTyres] = await Promise.all([
    getCategoryPageBySlug(SLUG),
    getPayloadTyres({ vehicleType: "van" }),
  ]);

  const config = page ? transformToVehicleConfig(page) : fallbackVehicleConfigs[SLUG];
  const lcvTyres = payloadTyres.map((t) => transformPayloadTyre(t) as TyreModel);

  // If no LCV tyres available, show empty state instead of template
  if (lcvTyres.length === 0) {
    return (
      <div className="bg-background text-foreground">
        <section className="py-16">
          <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
            <Truck className="mx-auto h-16 w-16 text-stone-500 dark:text-stone-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Шини LCV незабаром з&apos;являться</h3>
            <p className="text-stone-500 dark:text-stone-400 mb-6">
              Наразі каталог комерційних шин оновлюється. Зверніться до наших консультантів для підбору.
            </p>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-text hover:bg-primary-hover"
            >
              Зв&apos;язатися з нами
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return <CategoryPage config={config} tyres={lcvTyres} />;
}
