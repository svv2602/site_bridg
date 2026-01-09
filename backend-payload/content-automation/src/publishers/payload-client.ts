/**
 * Payload CMS Publisher
 *
 * Publishes generated content and badges to Payload CMS.
 * Replaces Strapi client after migration.
 */

import { ENV } from "../config/env.js";

// Types
interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PayloadDoc {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface TyreData {
  slug: string;
  name: string;
  season: "summer" | "winter" | "allseason";
  vehicleTypes: ("passenger" | "suv" | "van" | "sport")[];
  shortDescription?: string;
  fullDescription?: any; // Lexical rich text
  isNew?: boolean;
  isPopular?: boolean;
  euLabel?: {
    wetGrip?: string;
    fuelEfficiency?: string;
    noiseDb?: number;
    noiseClass?: string;
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
    testType?: string;
    category?: string;
    label: string;
  }>;
  keyBenefits?: Array<{ benefit: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}

interface ArticleData {
  slug: string;
  title: string;
  previewText: string;
  body?: any; // Lexical rich text
  tags?: Array<{ tag: string }>;
  readingTimeMinutes?: number;
}

type TyreDoc = TyreData & PayloadDoc;
type ArticleDoc = ArticleData & PayloadDoc;

// Payload API client
class PayloadClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ENV.PAYLOAD_URL || "http://localhost:3001";
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

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
        throw new Error(`Payload API error: ${response.status} ${response.statusText}\n${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Payload request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ============ TYRES ============

  /**
   * Find tyre by slug
   */
  async findTyreBySlug(slug: string): Promise<TyreDoc | null> {
    const response = await this.fetch<PayloadResponse<TyreDoc>>(
      `/tyres?where[slug][equals]=${encodeURIComponent(slug)}&depth=1`
    );

    return response.docs.length > 0 ? response.docs[0] : null;
  }

  /**
   * Create new tyre
   */
  async createTyre(data: TyreData): Promise<TyreDoc> {
    const response = await this.fetch<TyreDoc>(
      "/tyres",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    console.log(`Created tyre: ${data.name} (ID: ${response.id})`);
    return response;
  }

  /**
   * Update existing tyre
   */
  async updateTyre(id: string, data: Partial<TyreData>): Promise<TyreDoc> {
    const response = await this.fetch<TyreDoc>(
      `/tyres/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

    console.log(`Updated tyre ID: ${id}`);
    return response;
  }

  /**
   * Publish tyre - creates new or updates existing
   */
  async publishTyre(data: TyreData): Promise<{ action: "create" | "update"; id: string }> {
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
  ): Promise<{ success: boolean; id?: string; error?: string }> {
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
  async findArticleBySlug(slug: string): Promise<ArticleDoc | null> {
    const response = await this.fetch<PayloadResponse<ArticleDoc>>(
      `/articles?where[slug][equals]=${encodeURIComponent(slug)}`
    );

    return response.docs.length > 0 ? response.docs[0] : null;
  }

  /**
   * Create new article
   */
  async createArticle(data: ArticleData): Promise<ArticleDoc> {
    const response = await this.fetch<ArticleDoc>(
      "/articles",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    console.log(`Created article: ${data.title} (ID: ${response.id})`);
    return response;
  }

  /**
   * Update existing article
   */
  async updateArticle(id: string, data: Partial<ArticleData>): Promise<ArticleDoc> {
    const response = await this.fetch<ArticleDoc>(
      `/articles/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

    console.log(`Updated article ID: ${id}`);
    return response;
  }

  /**
   * Publish article - creates new or updates existing
   */
  async publishArticle(data: ArticleData): Promise<{ action: "create" | "update"; id: string }> {
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
  ): Promise<Array<{ slug: string; action: string; id?: string; error?: string }>> {
    const { delayMs = 500 } = options;
    const results: Array<{ slug: string; action: string; id?: string; error?: string }> = [];

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

  /**
   * Get all tyres
   */
  async getAllTyres(limit = 100): Promise<TyreDoc[]> {
    const response = await this.fetch<PayloadResponse<TyreDoc>>(
      `/tyres?limit=${limit}&depth=1`
    );
    return response.docs;
  }

  /**
   * Get all articles
   */
  async getAllArticles(limit = 100): Promise<ArticleDoc[]> {
    const response = await this.fetch<PayloadResponse<ArticleDoc>>(
      `/articles?limit=${limit}&depth=1`
    );
    return response.docs;
  }
}

// Singleton instance
let clientInstance: PayloadClient | null = null;

export function getPayloadClient(): PayloadClient {
  if (!clientInstance) {
    clientInstance = new PayloadClient();
  }
  return clientInstance;
}

// Convenience exports
export async function publishTyre(data: TyreData) {
  return getPayloadClient().publishTyre(data);
}

export async function publishArticle(data: ArticleData) {
  return getPayloadClient().publishArticle(data);
}

export async function updateTyreBadges(slug: string, badges: TyreData["badges"]) {
  return getPayloadClient().updateTyreBadges(slug, badges);
}

// Test
async function main() {
  console.log("Testing Payload Publisher...\n");

  const client = getPayloadClient();

  // Test finding a tyre
  console.log("Finding tyre 'turanza-6'...");
  const tyre = await client.findTyreBySlug("turanza-6");

  if (tyre) {
    console.log(`Found: ${tyre.name} (ID: ${tyre.id})`);
  } else {
    console.log("Tyre not found");
  }

  // List all tyres
  console.log("\nListing all tyres...");
  const tyres = await client.getAllTyres();
  console.log(`Total tyres: ${tyres.length}`);
  tyres.forEach(t => console.log(`  - ${t.name} (${t.slug})`));
}

// Run test if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(console.error);
}
