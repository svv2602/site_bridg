/**
 * Article Images Generator
 *
 * Generates images for articles using multi-provider image generation.
 */

import { image } from "../../providers/index.js";
import { getTaskRoutingFromDB } from "../../config/database-providers.js";
import {
  NEGATIVE_PROMPT,
  IMAGE_SIZES,
  generatePromptByType,
  type ImageType,
} from "../../config/image-prompts.js";
import type { GeneratedImage } from "../../types/content.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("ArticleImagesGenerator");

// Re-export ImageType for backward compatibility
export type { ImageType };

/**
 * Input for image generation
 */
export interface ArticleImageInput {
  type: ImageType;
  topic: string;
  season?: "summer" | "winter" | "allseason";
  tireModel?: string;
  context?: string;
  articleType?: string;
}

/**
 * Generate alt text for image
 */
function generateAltText(input: ArticleImageInput): string {
  const typeLabels: Record<ImageType, string> = {
    hero: "Головне зображення",
    content: "Ілюстрація",
    product: "Продуктове фото",
    lifestyle: "Lifestyle фото",
  };

  const seasonLabels = {
    summer: "літній",
    winter: "зимовий",
    allseason: "всесезонний",
  };

  let alt = `${typeLabels[input.type]}: ${input.topic}`;

  if (input.season) {
    alt += ` - ${seasonLabels[input.season]} сезон`;
  }

  if (input.tireModel) {
    alt += ` - Bridgestone ${input.tireModel}`;
  }

  return alt;
}

/**
 * Generate single article image
 * Uses task routing config for provider/model selection and fallbacks
 */
export async function generateArticleImage(
  input: ArticleImageInput,
  options?: {
    provider?: string;
    model?: string;
    quality?: "standard" | "hd";
    fallbackModels?: string[];
  }
): Promise<GeneratedImage> {
  const prompt = generatePromptByType(input.type, input.tireModel ? `Bridgestone ${input.tireModel}` : input.topic, {
    season: input.season,
    context: input.context,
    articleType: input.articleType,
  });
  const size = IMAGE_SIZES[input.type];

  // Get task routing config for fallback models
  const taskRouting = await getTaskRoutingFromDB("image-article");
  const fallbackModels = options?.fallbackModels || taskRouting?.fallbackModels || [];

  logger.info(`Generating ${input.type} image: ${input.topic}`, {
    provider: options?.provider || taskRouting?.preferredProvider || "default",
    model: options?.model || taskRouting?.preferredModel,
    fallbackModels: fallbackModels.length > 0 ? fallbackModels : "none",
  });

  const result = await image.generate(prompt, {
    size: `${size.width}x${size.height}` as "1024x1024" | "1792x1024" | "1024x1792",
    quality: options?.quality || "hd",
    negativePrompt: NEGATIVE_PROMPT,
    taskType: "image-article",
    fallbackModels,
    ...(options?.provider && { provider: options.provider }),
    ...(options?.model && { model: options.model }),
  });

  const generatedImage: GeneratedImage = {
    prompt,
    revisedPrompt: result.revisedPrompt,
    url: result.url,
    localPath: result.localPath,
    provider: result.provider,
    model: result.model,
    size: { width: size.width, height: size.height },
    cost: result.cost,
    alt: generateAltText(input),
  };

  logger.info(`Image generated: ${input.type}`, {
    provider: result.provider,
    cost: result.cost.toFixed(4),
    latencyMs: result.latencyMs,
  });

  return generatedImage;
}

/**
 * Generate hero image for article
 */
export async function generateHeroImage(
  topic: string,
  season?: "summer" | "winter" | "allseason",
  options?: {
    provider?: string;
    model?: string;
    articleType?: string;
  }
): Promise<GeneratedImage> {
  return generateArticleImage(
    {
      type: "hero",
      topic,
      season,
      articleType: options?.articleType,
    },
    { ...options, quality: "hd" }
  );
}

/**
 * Generate content images for article
 */
export async function generateContentImages(
  topic: string,
  count: number = 2,
  options?: {
    provider?: string;
    model?: string;
    contexts?: string[];
  }
): Promise<GeneratedImage[]> {
  const images: GeneratedImage[] = [];

  const defaultContexts = [
    "tire installation and maintenance",
    "safe driving conditions",
    "tire technology illustration",
  ];

  const contexts = options?.contexts || defaultContexts.slice(0, count);

  for (let i = 0; i < count; i++) {
    const context = contexts[i] || `content section ${i + 1}`;

    const img = await generateArticleImage(
      {
        type: "content",
        topic,
        context,
      },
      {
        provider: options?.provider,
        model: options?.model,
      }
    );

    images.push(img);
  }

  return images;
}

/**
 * Generate product image for tire
 */
export async function generateTireProductImage(
  tireModel: string,
  options?: {
    provider?: string;
    model?: string;
  }
): Promise<GeneratedImage> {
  return generateArticleImage(
    {
      type: "product",
      topic: `Bridgestone ${tireModel} tire`,
      tireModel,
    },
    { ...options, quality: "hd" }
  );
}

/**
 * Generate all images for an article
 */
export async function generateArticleImageSet(
  topic: string,
  options?: {
    season?: "summer" | "winter" | "allseason";
    tireModel?: string;
    includeHero?: boolean;
    contentCount?: number;
    provider?: string;
    model?: string;
  }
): Promise<{
  heroImage?: GeneratedImage;
  contentImages: GeneratedImage[];
  totalCost: number;
}> {
  const images: GeneratedImage[] = [];
  let heroImage: GeneratedImage | undefined;

  // Generate hero image
  if (options?.includeHero !== false) {
    heroImage = await generateHeroImage(topic, options?.season, {
      provider: options?.provider,
      model: options?.model,
    });
    images.push(heroImage);
  }

  // Generate content images
  const contentCount = options?.contentCount ?? 2;
  const contentImages = await generateContentImages(topic, contentCount, {
    provider: options?.provider,
    model: options?.model,
  });
  images.push(...contentImages);

  const totalCost = images.reduce((sum, img) => sum + img.cost, 0);

  logger.info(`Image set generated for: ${topic}`, {
    count: images.length,
    totalCost: totalCost.toFixed(4),
  });

  return {
    heroImage,
    contentImages,
    totalCost,
  };
}

