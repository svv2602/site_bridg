import { MOCK_ARTICLES, type Article } from "@/lib/data";
import {
  getStrapiArticles,
  getStrapiArticleBySlug,
  transformStrapiData,
  transformStrapiSingle,
} from "./strapi";

// Strapi article attributes
interface StrapiArticleAttributes {
  slug: string;
  title: string;
  subtitle?: string;
  previewText: string;
  readingTimeMinutes?: number;
  publishedAt?: string;
  tags?: string[];
}

function transformStrapiArticle(data: StrapiArticleAttributes & { id: number }): Article {
  return {
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    previewText: data.previewText,
    readingTimeMinutes: data.readingTimeMinutes,
    publishedAt: data.publishedAt,
    tags: data.tags,
  };
}

/**
 * Повертає всі статті / поради. Спробує отримати з Strapi, якщо недоступний — повертає mock дані.
 */
export async function getArticles(): Promise<Article[]> {
  try {
    const response = await getStrapiArticles<StrapiArticleAttributes>("*");
    const data = transformStrapiData<StrapiArticleAttributes>(response);
    if (data.length > 0) {
      return data.map(transformStrapiArticle);
    }
  } catch (error) {
    console.warn("Strapi unavailable, using mock data:", error);
  }
  return MOCK_ARTICLES;
}

/**
 * Повертає одну статтю за slug або null, якщо не знайдена.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const response = await getStrapiArticleBySlug<StrapiArticleAttributes>(slug, "*");
    const data = transformStrapiSingle<StrapiArticleAttributes>(response);
    if (data) {
      return transformStrapiArticle(data);
    }
  } catch (error) {
    console.warn("Strapi unavailable, using mock data:", error);
  }
  // Fallback to mock data
  const article = MOCK_ARTICLES.find((a) => a.slug === slug);
  return article ?? null;
}

/**
 * Повертає список останніх статей,
 * відсортованих за датою публікації (якщо є) або в порядку масиву.
 */
export async function getLatestArticles(limit?: number): Promise<Article[]> {
  const all = await getArticles();

  const sorted = [...all].sort((a, b) => {
    const da = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const db = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return db - da;
  });

  if (typeof limit === "number") {
    return sorted.slice(0, limit);
  }

  return sorted;
}