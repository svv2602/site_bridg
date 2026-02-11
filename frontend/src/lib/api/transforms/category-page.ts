import type { PayloadCategoryPage } from "@/lib/api/payload";
import type { CategoryPageConfig } from "@/components/CategoryPage";
import type { SeasonMeta } from "@/lib/fallback/category-pages";
import { resolveIcon } from "@/lib/utils/icons";

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3001";

function buildImageUrl(image?: { url?: string }): string | undefined {
  if (!image?.url) return undefined;
  return image.url.startsWith("http") ? image.url : `${PAYLOAD_URL}${image.url}`;
}

/**
 * Transform CMS data → CategoryPageConfig for vehicle category pages.
 */
export function transformToVehicleConfig(page: PayloadCategoryPage): CategoryPageConfig {
  const heroImageUrl = buildImageUrl(page.heroImage);

  return {
    slug: page.slug,
    vehicleType: page.vehicleType === "van" ? "lcv" : (page.vehicleType || "passenger"),

    title: page.title,
    subtitle: page.subtitle || "",
    heroDescription: page.heroDescription || "",
    features: (page.features || []).map((f) => ({
      icon: resolveIcon(f.icon),
      title: f.title,
      description: f.description,
      color: { bg: f.colorBg || "", text: f.colorText || "" },
    })),
    heroImageSrc: heroImageUrl || `/images/hero/hero-${page.vehicleType || "passenger"}.webp`,
    heroImageAlt: page.heroImageAlt || page.title,
    heroOverlayIcon: resolveIcon(page.heroOverlay?.icon || "car"),
    heroOverlayIconBg: page.heroOverlay?.iconBg || "",
    heroOverlayIconText: page.heroOverlay?.iconText || "",
    heroOverlayTitle: page.heroOverlay?.title || page.title,
    heroOverlayDescription: page.heroOverlay?.description || "",

    breadcrumbLabel: page.breadcrumbLabel || page.title,

    seasonSectionDescription: page.seasonSectionDescription || "",
    seasonDescriptions: {
      summer: page.seasonDescriptionSummer || "",
      winter: page.seasonDescriptionWinter || "",
      allseason: page.seasonDescriptionAllseason || "",
    },
    seasonInitialCount: page.seasonInitialCount,

    featuredTitle: page.featuredTitle || "",
    featuredCount: page.featuredCount,
    filterPopular: page.filterPopular,

    reviewsVehicleType: page.reviewsVehicleType || "passenger",
    reviewsTitle: page.reviewsTitle || "",
    reviewsLimit: page.reviewsLimit,
    reviewsShowAllLink: page.reviewsShowAllLink,

    ctaTitle: page.ctaTitle || "",
    ctaDescription: page.ctaDescription || "",
    ctaPrimaryLabel: page.ctaPrimaryLabel || "",
    ctaPrimaryHref: page.ctaPrimaryHref || "/contacts",
    ctaSecondaryLabel: page.ctaSecondaryLabel || "",
    ctaSecondaryHref: page.ctaSecondaryHref || "/dealers",
  };
}

/**
 * Transform CMS data → SeasonMeta for season pages.
 */
export function transformToSeasonMeta(page: PayloadCategoryPage): SeasonMeta {
  const heroImageUrl = buildImageUrl(page.heroImage);

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || "",
    h1: page.title,
    subtitle: page.subtitle || "",
    heroText: page.heroDescription || "",
    heroImageSrc: heroImageUrl || `/images/hero/hero-${page.season || "summer"}.webp`,
    features: (page.features || []).map((f) => ({
      icon: resolveIcon(f.icon),
      title: f.title,
      description: f.description,
      color: { bg: f.colorBg || "", text: f.colorText || "" },
    })),
    ctaTitle: page.ctaTitle || "Потрібна допомога у виборі?",
    ctaDescription: page.ctaDescription || "",
    ctaPrimaryLabel: page.ctaPrimaryLabel || "Отримати консультацію",
    ctaPrimaryHref: page.ctaPrimaryHref || "/contacts",
    ctaSecondaryLabel: page.ctaSecondaryLabel || "Знайти дилера",
    ctaSecondaryHref: page.ctaSecondaryHref || "/dealers",
  };
}
