import type { MetadataRoute } from 'next';
import { getTyreModels } from '@/lib/api/tyres';
import { getArticles } from '@/lib/api/articles';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bridgestone.ua';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/shyny`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/dealers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tyre-search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/passenger-tyres`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/passenger-tyres/winter`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/passenger-tyres/summer`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/passenger-tyres/all-season`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/suv-4x4-tyres`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/technology`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/contacts`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/lcv-tyres`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/karta-saitu`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/porivnyaty`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic tyre pages
  let tyrePages: MetadataRoute.Sitemap = [];
  try {
    const tyres = await getTyreModels();
    tyrePages = tyres
      .filter((tyre) => tyre.slug)
      .map((tyre) => ({
        url: `${BASE_URL}/shyny/${tyre.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
  } catch (error) {
    console.warn('Failed to fetch tyres for sitemap:', error);
  }

  // Dynamic article pages
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await getArticles();
    articlePages = articles
      .filter((article) => article.slug)
      .map((article) => ({
        url: `${BASE_URL}/blog/${article.slug}`,
        lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }));
  } catch (error) {
    console.warn('Failed to fetch articles for sitemap:', error);
  }

  return [...staticPages, ...tyrePages, ...articlePages];
}
