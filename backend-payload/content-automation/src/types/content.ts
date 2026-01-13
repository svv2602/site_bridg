/**
 * Content Types for AI Content Generation
 *
 * Types for raw scraped content and generated content.
 */

// === Brand Type ===

/**
 * Supported tire brands
 */
export type Brand = 'bridgestone' | 'firestone';

/**
 * Brand display names
 */
export const BRAND_NAMES: Record<Brand, string> = {
  bridgestone: 'Bridgestone',
  firestone: 'Firestone',
};

// === Raw Content Types ===

/**
 * Source of scraped content
 */
export type ContentSource = 'prokoleso' | 'bridgestone' | 'firestone' | 'tyrereviews';

/**
 * Raw tyre content scraped from external sources
 */
export interface RawTyreContent {
  /** Source website identifier */
  source: ContentSource;

  /** Brand of the tire */
  brand: Brand;

  /** Tyre model slug (e.g., "turanza-6", "blizzak-lm005") */
  modelSlug: string;

  /** Tyre model name (e.g., "Turanza 6", "Blizzak LM005") */
  modelName: string;

  /** Full description text from the source */
  fullDescription?: string;

  /** List of features/characteristics */
  features?: string[];

  /** List of advantages/benefits */
  advantages?: string[];

  /** Technical specifications (key-value pairs) */
  specifications?: Record<string, string>;

  /** Season type if detected */
  season?: 'summer' | 'winter' | 'allseason';

  /** EU label data if available */
  euLabel?: {
    fuelEfficiency?: string;
    wetGrip?: string;
    noiseLevel?: number;
    noiseClass?: string;
  };

  /** Technologies mentioned */
  technologies?: string[];

  /** ISO timestamp when content was scraped */
  scrapedAt: string;

  /** Source URL */
  sourceUrl: string;
}

/**
 * Collection of raw content from multiple sources for a single tyre model
 */
export interface RawTyreContentCollection {
  modelSlug: string;
  modelName: string;
  brand: Brand;
  sources: RawTyreContent[];
  collectedAt: string;
}

// === Generated Content Types ===

/**
 * Generated SEO content for a tyre model
 */
export interface GeneratedTyreContent {
  modelSlug: string;
  brand: Brand;

  // Main content
  shortDescription: string;           // 150-200 chars for product card
  fullDescription: string;            // Markdown, 800-1200 words
  fullDescriptionLexical?: object;    // Lexical JSON for Payload CMS

  // SEO metadata
  seoTitle: string;                   // up to 60 chars
  seoDescription: string;             // up to 160 chars
  seoKeywords: string[];

  // Structured content
  keyBenefits: { benefit: string; icon?: string }[];
  faqs: { question: string; answer: string }[];

  // Generation metadata
  metadata: {
    generatedAt: string;
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    cost: number;
    sources: string[];                 // Source URLs used
  };
}

/**
 * Generated article content
 */
export interface GeneratedArticle {
  slug: string;

  // Content
  title: string;
  excerpt: string;                     // 150-200 chars
  content: string;                     // Markdown
  contentLexical?: object;             // Lexical JSON

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];

  // Images
  heroImage?: GeneratedImage;
  contentImages?: GeneratedImage[];

  // Categorization
  tags: string[];
  relatedTyres?: string[];             // slugs

  // Metadata
  metadata: {
    generatedAt: string;
    provider: string;
    model: string;
    totalCost: number;
  };
}

/**
 * Generated image
 */
export interface GeneratedImage {
  prompt: string;
  revisedPrompt?: string;
  url: string;
  localPath?: string;

  provider: string;
  model: string;
  size: { width: number; height: number };
  cost: number;

  alt: string;                         // Alt text for SEO
  caption?: string;
}

// === Status Types ===

/**
 * Content generation status for a tyre model
 */
export interface ContentStatus {
  modelSlug: string;
  brand: Brand;
  hasRawData: boolean;
  hasGeneratedContent: boolean;
  isPublished: boolean;
  rawDataDate?: string;
  generatedDate?: string;
  publishedDate?: string;
}
