import { MOCK_ARTICLES, type Article } from "@/lib/data";

/**
 * Повертає всі статті / поради.
 * У продакшн‑версії тут буде запит до CMS (тип Article).
 */
export async function getArticles(): Promise<Article[]> {
  return MOCK_ARTICLES;
}

/**
 * Повертає одну статтю за slug або null, якщо не знайдена.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const all = await getArticles();
  const article = all.find((a) => a.slug === slug);
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