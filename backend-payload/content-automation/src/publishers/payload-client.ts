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
  subtitle?: string;
  previewText: string;
  body?: any; // HTML or Lexical rich text
  image?: number; // Media ID for preview image
  tags?: Array<{ tag: string }>;
  seoTitle?: string;
  seoDescription?: string;
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
   * Check if tyre exists in DB and has content filled
   * Returns: { exists: boolean, hasContent: boolean, missingFields: string[] }
   */
  async checkTyreHasContent(slug: string): Promise<{
    exists: boolean;
    hasContent: boolean;
    hasImage: boolean;
    missingFields: string[];
    tyre?: TyreDoc;
  }> {
    const tyre = await this.findTyreBySlug(slug);

    if (!tyre) {
      return { exists: false, hasContent: false, hasImage: false, missingFields: ["all"] };
    }

    const missingFields: string[] = [];

    // Check required content fields
    if (!tyre.shortDescription || tyre.shortDescription.length < 50) {
      missingFields.push("shortDescription");
    }
    if (!tyre.fullDescription || tyre.fullDescription.length < 100) {
      missingFields.push("fullDescription");
    }
    if (!tyre.seoTitle || tyre.seoTitle.length < 10) {
      missingFields.push("seoTitle");
    }
    if (!tyre.seoDescription || tyre.seoDescription.length < 20) {
      missingFields.push("seoDescription");
    }

    // Check image
    const hasImage = !!(tyre as any).image;

    return {
      exists: true,
      hasContent: missingFields.length === 0,
      hasImage,
      missingFields,
      tyre,
    };
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

  // ============ MEDIA ============

  /**
   * Find media by filename (checks both original and processed -nobg versions)
   * Prefers processed (-nobg) version if available
   */
  async findMediaByFilename(filename: string): Promise<{ id: number; url: string; backgroundRemoved: boolean } | null> {
    try {
      // Get base name without extension
      const baseName = filename.replace(/\.[^.]+$/, "");

      // Search for processed version first (preferred), then original
      const filenames = [
        `${baseName}-nobg.png`,            // processed: blizzak-6-enliten-nobg.png (preferred)
        filename,                          // original: blizzak-6-enliten.png
      ];

      for (const searchFilename of filenames) {
        const query = `/media?where[filename][equals]=${encodeURIComponent(searchFilename)}&limit=1`;
        const response = await this.fetch<PayloadResponse<{ id: number; url: string; filename: string; backgroundRemoved?: boolean }>>(query);

        if (response.docs.length > 0) {
          const media = response.docs[0];
          return {
            id: media.id,
            url: media.url,
            backgroundRemoved: media.backgroundRemoved || false,
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`  Error finding media by filename:`, error);
      return null;
    }
  }

  /**
   * Download image from URL and upload to Payload CMS Media
   * Reuses existing media if found by filename
   */
  async uploadImageFromUrl(
    imageUrl: string,
    options: { alt?: string; filename?: string; removeBackground?: boolean } = {}
  ): Promise<{ id: number; url: string } | null> {
    try {
      await this.ensureAuthenticated();

      // Determine filename first
      let filename = options.filename;
      if (!filename) {
        const urlPath = new URL(imageUrl).pathname;
        filename = urlPath.split("/").pop() || "image.png";
      }

      // Check if media already exists (including processed -nobg version)
      const existing = await this.findMediaByFilename(filename);
      if (existing) {
        console.log(`  ✓ Reusing existing media ID: ${existing.id} (backgroundRemoved: ${existing.backgroundRemoved})`);
        return { id: existing.id, url: existing.url };
      }

      // Download image
      console.log(`  Downloading image: ${imageUrl}`);
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        console.error(`  Failed to download image: ${imageResponse.status}`);
        return null;
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get("content-type") || "image/png";

      // Create form data for upload
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: contentType });
      formData.append("file", blob, filename);

      // Alt is required by Payload Media collection
      // Payload expects metadata in _payload JSON field
      const altText = options.alt || filename.replace(/\.[^.]+$/, "").replace(/-/g, " ");
      const payload: Record<string, unknown> = { alt: altText };

      // Enable background removal for tire images
      if (options.removeBackground) {
        payload.removeBackground = true;
      }

      formData.append("_payload", JSON.stringify(payload));

      // Upload to Payload
      console.log(`  Uploading to Payload: ${filename} (alt: ${altText})`);
      const uploadResponse = await fetch(`${this.baseUrl}/api/media`, {
        method: "POST",
        headers: {
          Authorization: `JWT ${this.token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error(`  Upload failed: ${uploadResponse.status} ${errorText}`);
        return null;
      }

      const result = await uploadResponse.json();
      console.log(`  ✓ Uploaded media ID: ${result.doc?.id}`);

      return {
        id: result.doc?.id,
        url: result.doc?.url,
      };
    } catch (error) {
      console.error(`  Image upload error:`, error);
      return null;
    }
  }

  /**
   * Update tyre with image
   */
  async updateTyreImage(tyreId: string, mediaId: number): Promise<boolean> {
    try {
      await this.fetch(`/tyres/${tyreId}`, {
        method: "PATCH",
        body: JSON.stringify({ image: mediaId }),
      });
      return true;
    } catch (error) {
      console.error(`Failed to update tyre image:`, error);
      return false;
    }
  }

  /**
   * Update media to trigger background removal
   */
  async enableBackgroundRemoval(mediaId: number): Promise<boolean> {
    try {
      await this.fetch(`/media/${mediaId}`, {
        method: "PATCH",
        body: JSON.stringify({ removeBackground: true }),
      });
      console.log(`  ✓ Background removal enabled for media ID: ${mediaId}`);
      return true;
    } catch (error) {
      console.error(`Failed to enable background removal:`, error);
      return false;
    }
  }

  /**
   * Batch enable background removal for multiple media
   */
  async enableBackgroundRemovalBatch(mediaIds: number[]): Promise<number> {
    let successCount = 0;
    for (const id of mediaIds) {
      if (await this.enableBackgroundRemoval(id)) {
        successCount++;
      }
    }
    return successCount;
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
