/**
 * Article Images Generator
 *
 * Generates images for articles using multi-provider image generation.
 */

import { image } from "../../providers/index.js";
import type { GeneratedImage } from "../../types/content.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("ArticleImagesGenerator");

/**
 * Image type for articles
 */
export type ImageType = "hero" | "content" | "product" | "lifestyle";

/**
 * Input for image generation
 */
export interface ArticleImageInput {
  type: ImageType;
  topic: string;
  season?: "summer" | "winter" | "allseason";
  tireModel?: string;
  context?: string;
}

/**
 * Image prompt templates
 */
const IMAGE_PROMPTS: Record<ImageType, (input: ArticleImageInput) => string> = {
  hero: (input) => {
    const seasonContext = {
      summer: "sunny day, dry asphalt road, warm lighting",
      winter: "snowy road, winter atmosphere, cold blue tones",
      allseason: "varied weather conditions, dramatic sky",
    };
    const weather = input.season ? seasonContext[input.season] : "professional lighting";

    return `Professional automotive photography, ${input.topic}, ${weather},
modern SUV or sedan with premium tires, cinematic composition,
4K quality, realistic, no text or watermarks, clean background`;
  },

  content: (input) => {
    return `Illustrative photo for article about ${input.topic},
${input.context || "automotive theme"}, editorial style,
professional photography, clean composition, realistic,
no text or watermarks, suitable for blog article`;
  },

  product: (input) => {
    const model = input.tireModel || "premium tire";
    return `Close-up product photography of ${model} tire,
studio lighting, black or white background,
focus on tread pattern detail, high quality,
professional product shot, 4K quality, realistic`;
  },

  lifestyle: (input) => {
    const seasonContext = {
      summer: "summer road trip, sunny weather, happy atmosphere",
      winter: "winter family vacation, snowy scenery, cozy feeling",
      allseason: "all weather adventure, versatile driving",
    };
    const scene = input.season ? seasonContext[input.season] : "road trip atmosphere";

    return `Lifestyle automotive photography, ${scene},
family or driver enjoying the journey, safety concept,
warm tones, photorealistic, editorial quality,
no text or watermarks, subtle car/tire context`;
  },
};

/**
 * Image size presets
 */
const IMAGE_SIZES: Record<ImageType, { width: number; height: number; aspect: string }> = {
  hero: { width: 1792, height: 1024, aspect: "16:9" },
  content: { width: 1024, height: 1024, aspect: "1:1" },
  product: { width: 1024, height: 1024, aspect: "1:1" },
  lifestyle: { width: 1024, height: 1024, aspect: "1:1" },
};

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
 */
export async function generateArticleImage(
  input: ArticleImageInput,
  options?: {
    provider?: string;
    model?: string;
    quality?: "standard" | "hd";
  }
): Promise<GeneratedImage> {
  const promptTemplate = IMAGE_PROMPTS[input.type];
  const prompt = promptTemplate(input);
  const size = IMAGE_SIZES[input.type];

  logger.info(`Generating ${input.type} image: ${input.topic}`, {
    provider: options?.provider || "default",
  });

  const result = await image.generate(prompt, {
    size: `${size.width}x${size.height}` as "1024x1024" | "1792x1024" | "1024x1792",
    quality: options?.quality || "standard",
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
  }
): Promise<GeneratedImage> {
  return generateArticleImage(
    {
      type: "hero",
      topic,
      season,
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

// CLI test
async function main() {
  console.log("Testing Article Images Generator...\n");

  const testInput: ArticleImageInput = {
    type: "hero",
    topic: "Як вибрати зимові шини",
    season: "winter",
  };

  try {
    const result = await generateArticleImage(testInput);

    console.log("\n=== GENERATED IMAGE ===");
    console.log(`Prompt: ${result.prompt.slice(0, 100)}...`);
    console.log(`URL: ${result.url}`);
    console.log(`Alt: ${result.alt}`);
    console.log(`Size: ${result.size.width}x${result.size.height}`);
    console.log(`Provider: ${result.provider}`);
    console.log(`Model: ${result.model}`);
    console.log(`Cost: $${result.cost.toFixed(4)}`);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

if (process.argv[1]?.includes("article-images.ts")) {
  main();
}
