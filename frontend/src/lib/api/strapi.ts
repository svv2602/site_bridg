/**
 * Strapi API client for Bridgestone CMS
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

async function fetchStrapi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const response = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Generic fetch function for any content type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getStrapiCollection<T = any>(
  contentType: string,
  query = ''
): Promise<StrapiResponse<StrapiEntity<T>[]>> {
  const separator = query ? '&' : '?';
  const fullQuery = query ? `?${query}` : '';
  return fetchStrapi<StrapiResponse<StrapiEntity<T>[]>>(
    `/${contentType}${fullQuery}`
  );
}

// Tyres API
export async function getStrapiTyres<T = unknown>(populate = '*') {
  return fetchStrapi<StrapiResponse<StrapiEntity<T>[]>>(
    `/tyres?populate=${populate}`
  );
}

export async function getStrapiTyreBySlug<T = unknown>(slug: string, populate = '*') {
  return fetchStrapi<StrapiResponse<StrapiEntity<T>[]>>(
    `/tyres?filters[slug][$eq]=${slug}&populate=${populate}`
  );
}

// Dealers API
export async function getStrapiDealers<T = unknown>(populate = '*') {
  return fetchStrapi<StrapiResponse<StrapiEntity<T>[]>>(
    `/dealers?populate=${populate}`
  );
}

export async function getStrapiDealersByCity<T = unknown>(city: string) {
  return fetchStrapi<StrapiResponse<StrapiEntity<T>[]>>(
    `/dealers?filters[city][$containsi]=${city}`
  );
}

// Articles API
export async function getStrapiArticles<T = unknown>(populate = '*') {
  return fetchStrapi<StrapiResponse<StrapiEntity<T>[]>>(
    `/articles?populate=${populate}&sort=publishedAt:desc`
  );
}

export async function getStrapiArticleBySlug<T = unknown>(slug: string, populate = '*') {
  return fetchStrapi<StrapiResponse<StrapiEntity<T>[]>>(
    `/articles?filters[slug][$eq]=${slug}&populate=${populate}`
  );
}

// Technologies API
export async function getStrapiTechnologies<T = unknown>(populate = '*') {
  return fetchStrapi<StrapiResponse<StrapiEntity<T>[]>>(
    `/technologies?populate=${populate}`
  );
}

// Vehicle Fitments API
export async function getStrapiVehicleFitments<T = unknown>(make?: string, model?: string) {
  let endpoint = '/vehicle-fitments?populate=*';
  if (make) endpoint += `&filters[make][$eq]=${make}`;
  if (model) endpoint += `&filters[model][$eq]=${model}`;
  return fetchStrapi<StrapiResponse<StrapiEntity<T>[]>>(endpoint);
}

// Helper to transform Strapi response to flat objects
export function transformStrapiData<T>(
  response: StrapiResponse<StrapiEntity<T>[]>
): (T & { id: number })[] {
  return response.data.map((item) => ({
    id: item.id,
    ...item.attributes,
  }));
}

export function transformStrapiSingle<T>(
  response: StrapiResponse<StrapiEntity<T>[]>
): (T & { id: number }) | null {
  if (response.data.length === 0) return null;
  const item = response.data[0];
  return {
    id: item.id,
    ...item.attributes,
  };
}
