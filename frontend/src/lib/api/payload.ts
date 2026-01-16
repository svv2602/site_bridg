/**
 * Payload CMS API Client
 * Replaces Strapi API for fetching data
 */

// Internal API URL for server-side requests (container-to-container in Docker)
const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';
// Public URL for image URLs that browsers will access
const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';

// Types
export interface PayloadTyre {
  id: string;
  slug: string;
  name: string;
  brand?: 'bridgestone' | 'firestone';
  season: 'summer' | 'winter' | 'allseason';
  vehicleTypes: ('passenger' | 'suv' | 'van' | 'sport')[];
  isNew: boolean;
  isPopular: boolean;
  isPublished: boolean;
  shortDescription?: string;
  fullDescription?: any; // Lexical rich text
  image?: PayloadMedia;
  euLabel?: {
    wetGrip?: string;
    fuelEfficiency?: string;
    noiseDb?: number;
    noiseClass?: string;
  };
  sizes?: {
    width: number;
    aspectRatio: number;
    diameter: number;
    loadIndex?: string;
    speedIndex?: string;
  }[];
  usage?: {
    city?: number;
    highway?: number;
    offroad?: number;
    winter?: number;
  };
  technologies?: PayloadTechnology[];
  badges?: {
    type: string;
    source: string;
    year: number;
    testType?: string;
    category?: string;
    label: string;
  }[];
  keyBenefits?: { benefit: string }[];
  faqs?: { question: string; answer: string }[];
  testResults?: {
    source: string;
    testType: string;
    year: number;
    testedSize: string;
    position: number;
    totalTested: number;
    rating: string;
    ratingNumeric: number;
    articleSlug?: string;
  }[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayloadArticle {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  previewText: string;
  body?: any; // Lexical rich text
  image?: PayloadMedia;
  readingTimeMinutes?: number;
  tags?: { tag: string }[];
  relatedTyres?: PayloadTyre[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayloadDealer {
  id: string;
  name: string;
  type: 'official' | 'partner' | 'service';
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  workingHours?: string;
  services?: string[];
}

export interface PayloadTechnology {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface PayloadMedia {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface PayloadVehicleFitment {
  id: string;
  make: string;
  model: string;
  yearFrom?: number;
  yearTo?: number;
  year?: number;
  recommendedSizes?: {
    width: number;
    aspectRatio: number;
    diameter: number;
  }[];
}

export interface PayloadSeasonalContent {
  id: string;
  name: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  featuredSeason: 'winter' | 'summer' | 'allseason';
  heroTitle: string;
  heroSubtitle?: string;
  ctaText: string;
  ctaLink: string;
  gradient?: string;
  promoText?: string;
}

interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  SHORT: 300,      // 5 min - for frequently changing data
  MEDIUM: 3600,    // 1 hour - for product data (tyres, articles)
  LONG: 86400,     // 24 hours - for rarely changing data (technologies)
} as const;

// Fetch helpers
async function fetchPayload<T>(
  endpoint: string,
  options?: RequestInit & { revalidate?: number }
): Promise<PayloadResponse<T>> {
  const { revalidate = CACHE_TTL.MEDIUM, ...fetchOptions } = options || {};

  const response = await fetch(`${PAYLOAD_API_URL}/api/${endpoint}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`Payload API error: ${response.status}`);
  }

  return response.json();
}

// Tyres API
export async function getPayloadTyres(params?: {
  season?: string;
  vehicleType?: string;
  limit?: number;
  page?: number;
}): Promise<PayloadTyre[]> {
  const searchParams = new URLSearchParams();

  // Only show published tyres
  searchParams.set('where[isPublished][equals]', 'true');

  if (params?.season) {
    searchParams.set('where[season][equals]', params.season);
  }
  if (params?.vehicleType) {
    searchParams.set('where[vehicleTypes][contains]', params.vehicleType);
  }

  // Set limit (default 100 to get all tyres)
  searchParams.set('limit', String(params?.limit ?? 100));

  if (params?.page) {
    searchParams.set('page', String(params.page));
  }

  // Populate relationships
  searchParams.set('depth', '2');

  const query = searchParams.toString();
  const data = await fetchPayload<PayloadTyre>(`tyres${query ? `?${query}` : ''}`);
  return data.docs;
}

export async function getPayloadTyreBySlug(slug: string): Promise<PayloadTyre | null> {
  const data = await fetchPayload<PayloadTyre>(
    `tyres?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`
  );
  return data.docs[0] || null;
}

export async function getPayloadFeaturedTyres(limit = 4): Promise<PayloadTyre[]> {
  const data = await fetchPayload<PayloadTyre>(
    `tyres?where[isPublished][equals]=true&where[isPopular][equals]=true&limit=${limit}&depth=1`
  );
  return data.docs;
}

// Server-side tyre search with filters
export async function searchPayloadTyres(params: {
  season?: 'summer' | 'winter' | 'allseason';
  vehicleType?: string;
  width?: number;
  aspectRatio?: number;
  diameter?: number;
  limit?: number;
  page?: number;
}): Promise<{ tyres: PayloadTyre[]; total: number }> {
  const searchParams = new URLSearchParams();

  // Only show published tyres
  searchParams.set('where[isPublished][equals]', 'true');

  if (params.season) {
    searchParams.set('where[season][equals]', params.season);
  }
  if (params.vehicleType) {
    searchParams.set('where[vehicleTypes][contains]', params.vehicleType);
  }

  // For size filtering, we need to check if any size in the sizes array matches
  // Payload CMS doesn't directly support array element queries via REST,
  // so we fetch and filter on the client side for now
  // In production, consider using a custom endpoint or Payload Local API

  if (params.limit) {
    searchParams.set('limit', String(params.limit));
  }
  if (params.page) {
    searchParams.set('page', String(params.page));
  }

  searchParams.set('depth', '1');

  const query = searchParams.toString();
  const data = await fetchPayload<PayloadTyre>(`tyres?${query}`);

  // Filter by size if specified
  let filteredDocs = data.docs;
  if (params.width || params.aspectRatio || params.diameter) {
    filteredDocs = data.docs.filter((tyre) =>
      tyre.sizes?.some(
        (size) =>
          (!params.width || size.width === params.width) &&
          (!params.aspectRatio || size.aspectRatio === params.aspectRatio) &&
          (!params.diameter || size.diameter === params.diameter)
      )
    );
  }

  return {
    tyres: filteredDocs,
    total: filteredDocs.length,
  };
}

// Articles API
export async function getPayloadArticles(params?: {
  limit?: number;
  page?: number;
  tag?: string;
  search?: string;
}): Promise<PayloadArticle[]> {
  const result = await getPayloadArticlesPaginated(params);
  return result.articles;
}

export interface PaginatedArticlesResult {
  articles: PayloadArticle[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function getPayloadArticlesPaginated(params?: {
  limit?: number;
  page?: number;
  tag?: string;
  search?: string;
}): Promise<PaginatedArticlesResult> {
  const limit = params?.limit ?? 9;
  const page = params?.page ?? 1;
  const hasFilters = params?.tag || params?.search;

  // If no filters, use server-side pagination
  if (!hasFilters) {
    const searchParams = new URLSearchParams();
    searchParams.set('limit', String(limit));
    searchParams.set('page', String(page));
    searchParams.set('sort', '-createdAt');
    searchParams.set('depth', '1');

    const query = searchParams.toString();
    const data = await fetchPayload<PayloadArticle>(`articles?${query}`);

    return {
      articles: data.docs,
      totalDocs: data.totalDocs,
      totalPages: data.totalPages,
      page: data.page,
      hasNextPage: data.hasNextPage,
      hasPrevPage: data.hasPrevPage,
    };
  }

  // With filters, fetch all and paginate client-side
  const searchParams = new URLSearchParams();
  searchParams.set('limit', '500');
  searchParams.set('sort', '-createdAt');
  searchParams.set('depth', '1');

  const query = searchParams.toString();
  const data = await fetchPayload<PayloadArticle>(`articles?${query}`);

  let articles = data.docs;

  // Client-side filtering for tag
  if (params?.tag) {
    articles = articles.filter(article =>
      article.tags?.some(t => t.tag.toLowerCase() === params.tag?.toLowerCase())
    );
  }

  // Client-side search (title + previewText)
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    articles = articles.filter(article =>
      article.title.toLowerCase().includes(searchLower) ||
      article.previewText?.toLowerCase().includes(searchLower) ||
      article.tags?.some(t => t.tag.toLowerCase().includes(searchLower))
    );
  }

  // Manual pagination
  const totalDocs = articles.length;
  const totalPages = Math.ceil(totalDocs / limit);
  const startIndex = (page - 1) * limit;
  const paginatedArticles = articles.slice(startIndex, startIndex + limit);

  return {
    articles: paginatedArticles,
    totalDocs,
    totalPages,
    page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// Get all unique tags from articles
export async function getPayloadArticleTags(): Promise<string[]> {
  const articles = await getPayloadArticles();
  const tagsSet = new Set<string>();

  articles.forEach(article => {
    article.tags?.forEach(t => tagsSet.add(t.tag));
  });

  return Array.from(tagsSet).sort();
}

export async function getPayloadArticleBySlug(slug: string): Promise<PayloadArticle | null> {
  const data = await fetchPayload<PayloadArticle>(
    `articles?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`
  );
  return data.docs[0] || null;
}

// Dealers API
export async function getPayloadDealers(params?: {
  city?: string;
  type?: string;
  limit?: number;
}): Promise<PayloadDealer[]> {
  const searchParams = new URLSearchParams();

  if (params?.city) {
    searchParams.set('where[city][equals]', params.city);
  }
  if (params?.type) {
    searchParams.set('where[type][equals]', params.type);
  }

  // Set limit (default 200 to get all dealers)
  searchParams.set('limit', String(params?.limit ?? 200));

  const query = searchParams.toString();
  const data = await fetchPayload<PayloadDealer>(`dealers?${query}`);
  return data.docs;
}

// Technologies API (rarely changes - use long cache)
export async function getPayloadTechnologies(): Promise<PayloadTechnology[]> {
  const data = await fetchPayload<PayloadTechnology>('technologies?limit=100', {
    revalidate: CACHE_TTL.LONG,
  });
  return data.docs;
}

// Vehicle Fitments API
export async function getPayloadVehicleFitments(params?: {
  make?: string;
  model?: string;
  year?: number;
}): Promise<PayloadVehicleFitment[]> {
  const searchParams = new URLSearchParams();

  if (params?.make) {
    searchParams.set('where[make][equals]', params.make);
  }
  if (params?.model) {
    searchParams.set('where[model][equals]', params.model);
  }
  if (params?.year) {
    // Support both yearFrom/yearTo range and single year field
    searchParams.set('where[or][0][and][0][yearFrom][less_than_equal]', String(params.year));
    searchParams.set('where[or][0][and][1][yearTo][greater_than_equal]', String(params.year));
    searchParams.set('where[or][1][year][equals]', String(params.year));
  }

  searchParams.set('limit', '100');

  const query = searchParams.toString();
  const data = await fetchPayload<PayloadVehicleFitment>(`vehicle-fitments${query ? `?${query}` : ''}`);
  return data.docs;
}

export async function getPayloadVehicleFitmentByCarParams(
  make: string,
  model: string,
  year: number
): Promise<PayloadVehicleFitment | null> {
  const fitments = await getPayloadVehicleFitments({ make, model, year });
  return fitments[0] || null;
}

// Seasonal content (may change for promotions - use short cache)
export async function getSeasonalContent() {
  try {
    // Try to get active seasonal content from CMS
    const data = await fetchPayload<PayloadSeasonalContent>(
      'seasonal-content?where[isActive][equals]=true&limit=1',
      { revalidate: CACHE_TTL.SHORT }
    );

    if (data.docs.length > 0) {
      const content = data.docs[0];
      return {
        heroTitle: content.heroTitle,
        heroSubtitle: content.heroSubtitle || 'Офіційний представник в Україні',
        featuredSeason: content.featuredSeason,
        gradient: content.gradient || 'from-stone-800 to-stone-900',
        ctaText: content.ctaText,
        ctaLink: content.ctaLink,
        promoText: content.promoText,
      };
    }
  } catch (error) {
    console.warn('Failed to fetch seasonal content from CMS, using defaults:', error);
  }

  // Fallback: Determine season based on current month
  const month = new Date().getMonth();
  const isWinter = month >= 9 || month <= 2; // Oct-Feb = winter season

  return {
    heroTitle: isWinter ? 'Зимові шини Bridgestone' : 'Шини Bridgestone',
    heroSubtitle: 'Офіційний представник в Україні',
    featuredSeason: isWinter ? ('winter' as const) : ('summer' as const),
    gradient: 'from-stone-800 to-stone-900',
    ctaText: isWinter ? 'Зимові моделі' : 'Переглянути каталог',
    ctaLink: isWinter ? '/passenger-tyres/winter' : '/passenger-tyres',
  };
}

// Transform Payload data to match existing frontend TyreModel type
export function transformPayloadTyre(tyre: PayloadTyre) {
  // Convert usage from numbers (0-100) to booleans (>0 means true)
  const usage = tyre.usage ? {
    city: (tyre.usage.city ?? 0) > 0,
    highway: (tyre.usage.highway ?? 0) > 0,
    offroad: (tyre.usage.offroad ?? 0) > 0,
    winter: (tyre.usage.winter ?? 0) > 0,
  } : {};

  return {
    id: typeof tyre.id === 'string' ? parseInt(tyre.id, 10) : tyre.id,
    slug: tyre.slug,
    name: tyre.name,
    brand: tyre.brand || 'bridgestone', // Default to bridgestone for existing data
    season: tyre.season,
    vehicleTypes: tyre.vehicleTypes,
    isNew: tyre.isNew,
    isPopular: tyre.isPopular,
    shortDescription: tyre.shortDescription || '',
    fullDescription: tyre.fullDescription || null, // Lexical rich text
    imageUrl: tyre.image?.url
      ? (tyre.image.url.startsWith('http') ? tyre.image.url : `${PAYLOAD_URL}${tyre.image.url}`)
      : '/images/tire-placeholder.svg',
    euLabel: tyre.euLabel || {},
    sizes: tyre.sizes || [],
    usage,
    // Technologies as array of slugs to match TyreModel type
    technologies: tyre.technologies?.map(t => t.slug) || [],
    badges: tyre.badges || [],
    keyBenefits: tyre.keyBenefits?.map(kb => kb.benefit) || [],
    faqs: tyre.faqs || [],
    testResults: tyre.testResults || [],
    seoTitle: tyre.seoTitle,
    seoDescription: tyre.seoDescription,
  };
}

// Transform Payload data to match existing frontend Article type
export function transformPayloadArticle(article: PayloadArticle) {
  return {
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    previewText: article.previewText,
    content: article.body, // Lexical rich text content
    readingTimeMinutes: article.readingTimeMinutes || 5,
    publishedAt: article.createdAt, // Use createdAt as publishedAt
    tags: article.tags?.map(t => t.tag) || [],
  };
}
