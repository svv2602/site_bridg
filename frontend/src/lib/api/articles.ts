import { type Article } from "@/lib/data";
import {
  getPayloadArticles,
  getPayloadArticlesPaginated,
  getPayloadArticleBySlug,
  getPayloadArticleTags,
  transformPayloadArticle,
} from "./payload";

export interface PaginatedArticles {
  articles: Article[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Повертає всі статті / поради з Payload CMS.
 * При помилці повертає порожній масив — компоненти повинні обробити цей стан.
 */
export async function getArticles(params?: {
  tag?: string;
  search?: string;
}): Promise<Article[]> {
  try {
    const articles = await getPayloadArticles(params);
    return articles.map(article => transformPayloadArticle(article) as Article);
  } catch (error) {
    console.error("Помилка завантаження статей з CMS:", error);
    return [];
  }
}

/**
 * Повертає статті з пагінацією.
 */
export async function getArticlesPaginated(params?: {
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedArticles> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 9;

  try {
    const result = await getPayloadArticlesPaginated({
      tag: params?.tag,
      search: params?.search,
      page,
      limit,
    });

    return {
      articles: result.articles.map(article => transformPayloadArticle(article) as Article),
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    };
  } catch (error) {
    console.error("Помилка завантаження статей з CMS:", error);
    return {
      articles: [],
      totalDocs: 0,
      totalPages: 0,
      page,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }
}

/**
 * Повертає всі унікальні теги статей.
 */
export async function getArticleTags(): Promise<string[]> {
  try {
    return await getPayloadArticleTags();
  } catch (error) {
    console.error("Помилка завантаження тегів з CMS:", error);
    return [];
  }
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
    return null;
  } catch (error) {
    console.error("Помилка завантаження статті з CMS:", error);
    return null;
  }
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
