/**
 * Payload CMS Publisher
 *
 * Publishes generated content and badges to Payload CMS.
 * Supports multi-brand (Bridgestone & Firestone).
 */

import { ENV } from "../config/env.js";
import type { Brand } from "../types/content.js";

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
  brand?: Brand;
  season: "summer" | "winter" | "allseason";
  vehicleTypes: ("passenger" | "suv" | "van" | "sport")[];
  shortDescription?: string;
  fullDescription?: string; // HTML content for CKEditor
  seoTitle?: string;
  seoDescription?: string;
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
  private token: string | null = null;

  constructor() {
    this.baseUrl = ENV.PAYLOAD_URL || "http://localhost:3001";
  }

  /**
   * Authenticate with Payload CMS
   */
  async authenticate(email?: string, password?: string): Promise<void> {
    const credentials = {
      email: email || process.env.PAYLOAD_ADMIN_EMAIL || "admin@bridgestone.ua",
      password: password || process.env.PAYLOAD_ADMIN_PASSWORD || "admin123",
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      this.token = data.token;
      console.log("Authenticated with Payload CMS");
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }

  /**
   * Ensure we have a valid token
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.token) {
      await this.authenticate();
    }
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // For write operations, ensure authenticated
    if (options.method && options.method !== "GET") {
      await this.ensureAuthenticated();
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `JWT ${this.token}` } : {}),
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
  async findTyreBySlug(slug: string, brand?: Brand): Promise<TyreDoc | null> {
    let query = `/tyres?where[slug][equals]=${encodeURIComponent(slug)}&depth=1`;
    if (brand) {
      query += `&where[brand][equals]=${brand}`;
    }
    const response = await this.fetch<PayloadResponse<TyreDoc>>(query);

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
    const existing = await this.findTyreBySlug(data.slug, data.brand);

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
  async getAllTyres(limit = 100, brand?: Brand): Promise<TyreDoc[]> {
    let query = `/tyres?limit=${limit}&depth=1`;
    if (brand) {
      query += `&where[brand][equals]=${brand}`;
    }
    const response = await this.fetch<PayloadResponse<TyreDoc>>(query);
    return response.docs;
  }

  /**
   * Get all tyres for a specific brand
   */
  async getTyresByBrand(brand: Brand, limit = 100): Promise<TyreDoc[]> {
    return this.getAllTyres(limit, brand);
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
  console.log("Testing Payload Publisher with multi-brand support...\n");

  const client = getPayloadClient();

  // Test finding a Bridgestone tyre
  console.log("Finding Bridgestone tyre 'turanza-6'...");
  const bridgestoneTyre = await client.findTyreBySlug("turanza-6", "bridgestone");

  if (bridgestoneTyre) {
    console.log(`Found: ${bridgestoneTyre.name} (ID: ${bridgestoneTyre.id})`);
  } else {
    console.log("Bridgestone tyre not found");
  }

  // List tyres by brand
  console.log("\nListing Bridgestone tyres...");
  const bridgestoneTyres = await client.getTyresByBrand("bridgestone");
  console.log(`Total Bridgestone tyres: ${bridgestoneTyres.length}`);
  bridgestoneTyres.slice(0, 5).forEach(t => console.log(`  - ${t.name} (${t.slug})`));

  console.log("\nListing Firestone tyres...");
  const firestoneTyres = await client.getTyresByBrand("firestone");
  console.log(`Total Firestone tyres: ${firestoneTyres.length}`);
  firestoneTyres.slice(0, 5).forEach(t => console.log(`  - ${t.name} (${t.slug})`));
}

// Run test if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(console.error);
}
