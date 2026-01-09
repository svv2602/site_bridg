/**
 * Strapi Publisher
 *
 * Publishes generated content and badges to Strapi CMS.
 */

import { ENV } from "../config/env.js";

// Types
interface StrapiResponse<T> {
  data: T;
  meta?: {
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

interface TyreData {
  slug: string;
  name: string;
  season: "summer" | "winter" | "allseason";
  vehicleTypes: string[];
  shortDescription?: string;
  fullDescription?: string;
  isNew?: boolean;
  isPopular?: boolean;
  euLabel?: {
    wetGrip?: string;
    fuelEfficiency?: string;
    noiseDb?: number;
  };
  sizes?: Array<{
    width: number;
    aspectRatio: number;
    diameter: number;
    loadIndex?: string;
    speedIndex?: string;
  }>;
  badges?: Array<{
    type: string;
    source: string;
    year: number;
    testType: string;
    label: string;
  }>;
}

interface ArticleData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags?: string[];
  readingTime?: number;
  publishedAt?: string;
}

// Strapi API client
class StrapiClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = ENV.STRAPI_URL || "http://localhost:1337";
    this.token = ENV.STRAPI_API_TOKEN || "";

    if (!this.token) {
      console.warn("Warning: STRAPI_API_TOKEN not set. Write operations will fail.");
    }
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const url = `${this.baseUrl}/api${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Strapi API error: ${response.status} ${response.statusText}\n${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Strapi request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ============ TYRES ============

  /**
   * Find tyre by slug
   */
  async findTyreBySlug(slug: string): Promise<StrapiEntity<TyreData> | null> {
    const response = await this.fetch<StrapiResponse<StrapiEntity<TyreData>[]>>(
      `/tyres?filters[slug][$eq]=${slug}&populate=*`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Create new tyre
   */
  async createTyre(data: TyreData): Promise<StrapiEntity<TyreData>> {
    const response = await this.fetch<StrapiResponse<StrapiEntity<TyreData>>>(
      "/tyres",
      {
        method: "POST",
        body: JSON.stringify({ data }),
      }
    );

    console.log(`Created tyre: ${data.name} (ID: ${response.data.id})`);
    return response.data;
  }

  /**
   * Update existing tyre
   */
  async updateTyre(id: number, data: Partial<TyreData>): Promise<StrapiEntity<TyreData>> {
    const response = await this.fetch<StrapiResponse<StrapiEntity<TyreData>>>(
      `/tyres/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({ data }),
      }
    );

    console.log(`Updated tyre ID: ${id}`);
    return response.data;
  }

  /**
   * Publish tyre - creates new or updates existing
   */
  async publishTyre(data: TyreData): Promise<{ action: "create" | "update"; id: number }> {
    const existing = await this.findTyreBySlug(data.slug);

    if (existing) {
      await this.updateTyre(existing.id, data);
      return { action: "update", id: existing.id };
    } else {
      const created = await this.createTyre(data);
      return { action: "create", id: created.id };
    }
  }

  /**
   * Update tyre badges only
   */
  async updateTyreBadges(
    slug: string,
    badges: TyreData["badges"]
  ): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const existing = await this.findTyreBySlug(slug);

      if (!existing) {
        return { success: false, error: `Tyre not found: ${slug}` };
      }

      await this.updateTyre(existing.id, { badges });
      return { success: true, id: existing.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  // ============ ARTICLES ============

  /**
   * Find article by slug
   */
  async findArticleBySlug(slug: string): Promise<StrapiEntity<ArticleData> | null> {
    const response = await this.fetch<StrapiResponse<StrapiEntity<ArticleData>[]>>(
      `/articles?filters[slug][$eq]=${slug}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Create new article
   */
  async createArticle(data: ArticleData): Promise<StrapiEntity<ArticleData>> {
    const response = await this.fetch<StrapiResponse<StrapiEntity<ArticleData>>>(
      "/articles",
      {
        method: "POST",
        body: JSON.stringify({ data }),
      }
    );

    console.log(`Created article: ${data.title} (ID: ${response.data.id})`);
    return response.data;
  }

  /**
   * Update existing article
   */
  async updateArticle(id: number, data: Partial<ArticleData>): Promise<StrapiEntity<ArticleData>> {
    const response = await this.fetch<StrapiResponse<StrapiEntity<ArticleData>>>(
      `/articles/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({ data }),
      }
    );

    console.log(`Updated article ID: ${id}`);
    return response.data;
  }

  /**
   * Publish article - creates new or updates existing
   */
  async publishArticle(data: ArticleData): Promise<{ action: "create" | "update"; id: number }> {
    const existing = await this.findArticleBySlug(data.slug);

    if (existing) {
      await this.updateArticle(existing.id, data);
      return { action: "update", id: existing.id };
    } else {
      const created = await this.createArticle(data);
      return { action: "create", id: created.id };
    }
  }

  // ============ BATCH OPERATIONS ============

  /**
   * Publish multiple tyres
   */
  async publishTyres(
    tyres: TyreData[],
    options: { delayMs?: number } = {}
  ): Promise<Array<{ slug: string; action: string; id?: number; error?: string }>> {
    const { delayMs = 500 } = options;
    const results: Array<{ slug: string; action: string; id?: number; error?: string }> = [];

    for (const tyre of tyres) {
      try {
        const result = await this.publishTyre(tyre);
        results.push({ slug: tyre.slug, ...result });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({ slug: tyre.slug, action: "error", error: errorMessage });
      }

      // Delay between requests
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    return results;
  }
}

// Singleton instance
let clientInstance: StrapiClient | null = null;

export function getStrapiClient(): StrapiClient {
  if (!clientInstance) {
    clientInstance = new StrapiClient();
  }
  return clientInstance;
}

// Convenience exports
export async function publishTyre(data: TyreData) {
  return getStrapiClient().publishTyre(data);
}

export async function publishArticle(data: ArticleData) {
  return getStrapiClient().publishArticle(data);
}

export async function updateTyreBadges(slug: string, badges: TyreData["badges"]) {
  return getStrapiClient().updateTyreBadges(slug, badges);
}

// Test
async function main() {
  console.log("Testing Strapi Publisher...\n");

  if (!ENV.STRAPI_API_TOKEN) {
    console.error("STRAPI_API_TOKEN not set. Skipping test.");
    console.log("\nTo test, add STRAPI_API_TOKEN to .env file");
    return;
  }

  const client = getStrapiClient();

  // Test finding a tyre
  console.log("Finding tyre 'turanza-6'...");
  const tyre = await client.findTyreBySlug("turanza-6");

  if (tyre) {
    console.log(`Found: ${tyre.attributes.name} (ID: ${tyre.id})`);
  } else {
    console.log("Tyre not found");
  }

  // Test publishing (dry run - uncomment to actually publish)
  /*
  const testTyre: TyreData = {
    slug: "test-tyre-automation",
    name: "Test Tyre Automation",
    season: "summer",
    vehicleTypes: ["passenger"],
    shortDescription: "Test tyre created by automation",
  };

  const result = await client.publishTyre(testTyre);
  console.log("Publish result:", result);
  */
}

main();
