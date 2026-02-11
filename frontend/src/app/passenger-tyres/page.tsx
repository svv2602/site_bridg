import type { Metadata } from "next";
import { getPayloadTyres, transformPayloadTyre, getCategoryPageBySlug } from "@/lib/api/payload";
import type { TyreModel } from "@/lib/data";
import { CategoryPage } from "@/components/CategoryPage";
import { fallbackVehicleConfigs, fallbackSeo } from "@/lib/fallback/category-pages";
import { transformToVehicleConfig } from "@/lib/api/transforms/category-page";

const SLUG = "passenger-tyres";

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
      title: seo.title,
      description: seo.description,
      type: "website",
      locale: "uk_UA",
      siteName: "Bridgestone Україна",
    },
  };
}

export default async function PassengerTyresPage() {
  const [page, payloadTyres] = await Promise.all([
    getCategoryPageBySlug(SLUG),
    getPayloadTyres({ vehicleType: "passenger" }),
  ]);

  const config = page ? transformToVehicleConfig(page) : fallbackVehicleConfigs[SLUG];
  const passengerTyres = payloadTyres.map((t) => transformPayloadTyre(t) as TyreModel);

  return <CategoryPage config={config} tyres={passengerTyres} />;
}
