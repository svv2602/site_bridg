import { MOCK_ARTICLES, type Article } from "@/lib/data";
import {
  getPayloadArticles,
  getPayloadArticleBySlug,
  transformPayloadArticle,
} from "./payload";

/**
 * Повертає всі статті / поради. Спробує отримати з Payload CMS, якщо недоступний — повертає mock дані.
 */
export async function getArticles(): Promise<Article[]> {
  try {
    const articles = await getPayloadArticles();
    if (articles.length > 0) {
      return articles.map(article => transformPayloadArticle(article) as Article);
    }
  } catch (error) {
    console.warn("Payload CMS unavailable, using mock data:", error);
  }
  return MOCK_ARTICLES;
}

/**
 * Повертає одну статтю за slug або null, якщо не знайдена.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const article = await getPayloadArticleBySlug(slug);
    if (article) {
      return transformPayloadArticle(article) as Article;
    }
  } catch (error) {
    console.warn("Payload CMS unavailable, using mock data:", error);
  }
  // Fallback to mock data
  const mockArticle = MOCK_ARTICLES.find((a) => a.slug === slug);
  return mockArticle ?? null;
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
