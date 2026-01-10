/**
 * Payload CMS API Client
 * Replaces Strapi API for fetching data
 */

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';

// Types
export interface PayloadTyre {
  id: string;
  slug: string;
  name: string;
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

interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Fetch helpers
async function fetchPayload<T>(
  endpoint: string,
  options?: RequestInit
): Promise<PayloadResponse<T>> {
  const response = await fetch(`${PAYLOAD_URL}/api/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    next: { revalidate: 60 },
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
  if (params?.limit) {
    searchParams.set('limit', String(params.limit));
  }
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

// Articles API
export async function getPayloadArticles(params?: {
  limit?: number;
  page?: number;
  tag?: string;
}): Promise<PayloadArticle[]> {
  const searchParams = new URLSearchParams();

  if (params?.limit) {
    searchParams.set('limit', String(params.limit));
  }
  if (params?.page) {
    searchParams.set('page', String(params.page));
  }
  searchParams.set('sort', '-createdAt');
  searchParams.set('depth', '1');

  const query = searchParams.toString();
  const data = await fetchPayload<PayloadArticle>(`articles?${query}`);
  return data.docs;
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
}): Promise<PayloadDealer[]> {
  const searchParams = new URLSearchParams();

  if (params?.city) {
    searchParams.set('where[city][equals]', params.city);
  }
  if (params?.type) {
    searchParams.set('where[type][equals]', params.type);
  }

  const query = searchParams.toString();
  const data = await fetchPayload<PayloadDealer>(`dealers${query ? `?${query}` : ''}`);
  return data.docs;
}

// Technologies API
export async function getPayloadTechnologies(): Promise<PayloadTechnology[]> {
  const data = await fetchPayload<PayloadTechnology>('technologies');
  return data.docs;
}

// Seasonal content
export async function getSeasonalContent() {
  const response = await fetch(`${PAYLOAD_URL}/api/seasonal`, {
    next: { revalidate: 3600 }, // 1 hour cache
  });

  if (!response.ok) {
    // Return default
    return {
      heroTitle: 'Шини Bridgestone',
      heroSubtitle: 'Офіційний представник в Україні',
      featuredSeason: null,
      gradient: 'from-zinc-800 to-zinc-900',
      ctaText: 'Переглянути каталог',
      ctaLink: '/passenger-tyres',
    };
  }

  return response.json();
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
    slug: tyre.slug,
    name: tyre.name,
    season: tyre.season,
    vehicleTypes: tyre.vehicleTypes,
    isNew: tyre.isNew,
    isPopular: tyre.isPopular,
    shortDescription: tyre.shortDescription || '',
    imageUrl: tyre.image ? `${PAYLOAD_URL}${tyre.image.url}` : '/images/tire-placeholder.png',
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
    readingTimeMinutes: article.readingTimeMinutes || 5,
    publishedAt: article.createdAt, // Use createdAt as publishedAt
    tags: article.tags?.map(t => t.tag) || [],
  };
}
