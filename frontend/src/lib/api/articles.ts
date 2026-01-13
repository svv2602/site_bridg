import { MOCK_ARTICLES, type Article } from "@/lib/data";
import {
  getPayloadArticles,
  getPayloadArticlesPaginated,
  getPayloadArticleBySlug,
  getPayloadArticleTags,
  transformPayloadArticle,
  type PaginatedArticlesResult,
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
 * Повертає всі статті / поради. Спробує отримати з Payload CMS, якщо недоступний — повертає mock дані.
 */
export async function getArticles(params?: {
  tag?: string;
  search?: string;
}): Promise<Article[]> {
  try {
    const articles = await getPayloadArticles(params);
    if (articles.length > 0) {
      return articles.map(article => transformPayloadArticle(article) as Article);
    }
  } catch (error) {
    console.warn("Payload CMS unavailable, using mock data:", error);
  }

  // Fallback to mock data with filtering
  let result = MOCK_ARTICLES;

  if (params?.tag) {
    result = result.filter(a => a.tags?.some(t => t.toLowerCase() === params.tag?.toLowerCase()));
  }

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    result = result.filter(a =>
      a.title.toLowerCase().includes(searchLower) ||
      a.previewText?.toLowerCase().includes(searchLower) ||
      a.tags?.some(t => t.toLowerCase().includes(searchLower))
    );
  }

  return result;
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

    if (result.articles.length > 0 || result.totalDocs === 0) {
      return {
        articles: result.articles.map(article => transformPayloadArticle(article) as Article),
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      };
    }
  } catch (error) {
    console.warn("Payload CMS unavailable, using mock data:", error);
  }

  // Fallback to mock data with filtering and pagination
  let filtered = MOCK_ARTICLES;

  if (params?.tag) {
    filtered = filtered.filter(a => a.tags?.some(t => t.toLowerCase() === params.tag?.toLowerCase()));
  }

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(searchLower) ||
      a.previewText?.toLowerCase().includes(searchLower) ||
      a.tags?.some(t => t.toLowerCase().includes(searchLower))
    );
  }

  const totalDocs = filtered.length;
  const totalPages = Math.ceil(totalDocs / limit);
  const startIndex = (page - 1) * limit;
  const paginatedArticles = filtered.slice(startIndex, startIndex + limit);

  return {
    articles: paginatedArticles,
    totalDocs,
    totalPages,
    page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Повертає всі унікальні теги статей.
 */
export async function getArticleTags(): Promise<string[]> {
  try {
    const tags = await getPayloadArticleTags();
    if (tags.length > 0) {
      return tags;
    }
  } catch (error) {
    console.warn("Payload CMS unavailable, using mock data:", error);
  }

  // Fallback to mock data
  const tagsSet = new Set<string>();
  MOCK_ARTICLES.forEach(a => a.tags?.forEach(t => tagsSet.add(t)));
  return Array.from(tagsSet).sort();
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
