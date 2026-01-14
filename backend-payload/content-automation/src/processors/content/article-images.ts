/**
 * Article Images Generator
 *
 * Generates images for articles using multi-provider image generation.
 */

import { image } from "../../providers/index.js";
import { getTaskRoutingFromDB } from "../../config/database-providers.js";
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
 * Negative prompt to avoid common AI image artifacts
 */
const NEGATIVE_PROMPT = `blurry, low quality, distorted, deformed, disfigured, bad anatomy,
watermark, text, logo, signature, cropped, out of frame, worst quality, low resolution,
jpeg artifacts, pixelated, noise, grain, overexposed, underexposed, oversaturated,
cartoon, anime, illustration, 3d render, cgi, artificial looking, plastic looking,
duplicate, clone, extra limbs, missing parts, floating objects, unnatural proportions`;

/**
 * Image prompt templates - detailed prompts for high-quality generation
 */
const IMAGE_PROMPTS: Record<ImageType, (input: ArticleImageInput) => string> = {
  hero: (input) => {
    const seasonContext = {
      summer: `golden hour sunlight, warm summer day, dry clean asphalt highway,
clear blue sky with soft clouds, vibrant green landscape in background,
warm orange and gold color grading, lens flare effects`,
      winter: `fresh snow on road, winter morning atmosphere, cold blue and white tones,
frost on trees, overcast sky with soft diffused light,
breath-visible cold air, tire tracks in snow showing grip`,
      allseason: `dramatic weather transition, partly cloudy sky with sun breaking through,
wet road reflecting light, versatile conditions,
dynamic atmospheric lighting, moody cinematic feel`,
    };
    const weather = input.season ? seasonContext[input.season] : "professional studio lighting, neutral backdrop";

    return `Award-winning automotive photography, ultra high resolution 8K, ${input.topic}.

Scene: ${weather}. Modern premium SUV or luxury sedan (Mercedes, BMW, Audi style)
photographed at dynamic 3/4 front angle. Vehicle positioned on scenic road with
emphasis on wheel and tire visibility.

Technical details: Shot with Sony A7R V, 85mm f/1.4 lens, shallow depth of field
with sharp focus on vehicle and tires. Professional color grading, high dynamic range.
Cinematic widescreen composition following rule of thirds.

Style: Editorial automotive magazine quality, photorealistic, hyperdetailed.
Lighting: Natural environmental lighting with professional fill, rim lighting on vehicle.
Colors: Rich, vibrant but natural color palette, professional post-processing.

Requirements: Photorealistic only, no CGI, no text, no logos, no watermarks,
clean uncluttered composition, premium luxury feel.`;
  },

  content: (input) => {
    return `Professional editorial photography for automotive blog article about ${input.topic}.

Context: ${input.context || "tire and automotive safety theme"}.

Scene composition: Clean, well-organized frame with clear focal point.
Environmental context showing real-world automotive situations.
People interacting naturally with vehicles when appropriate.

Technical specs: High resolution photograph, 24-70mm lens perspective,
balanced exposure, professional white balance, sharp details throughout.

Style: Modern editorial magazine aesthetic, authentic documentary feel,
relatable to everyday drivers, warm and approachable mood.

Lighting: Natural daylight or professional studio setup, soft shadows,
even illumination, no harsh contrasts.

Requirements: Photorealistic, no text overlays, no watermarks,
publication-ready quality, clean background, professional composition.`;
  },

  product: (input) => {
    const model = input.tireModel || "premium performance tire";
    return `Ultra high-resolution product photography of ${model} automotive tire.

Setup: Professional product photography studio, infinity curve backdrop in
gradient dark gray to black. Single tire displayed at slight angle (15-20 degrees)
to showcase both tread pattern and sidewall branding.

Lighting: Three-point professional lighting setup:
- Key light: Large softbox 45 degrees from front
- Fill light: Reflector panel opposite key light
- Rim/accent light: Strip softbox behind for edge definition

Focus: Razor-sharp detail on tread pattern grooves, sipes, and shoulder blocks.
Visible sidewall markings and size specifications in crisp detail.

Technical: Shot with medium format camera, 100mm macro lens, f/8-f/11 for
maximum depth of field, focus stacking for complete sharpness.

Style: Clean commercial product photography, premium brand aesthetic,
suitable for e-commerce and marketing materials.

Post-processing: Professional retouching, enhanced contrast on rubber texture,
clean background, color-accurate representation of black rubber.

Requirements: Hyperrealistic, no text additions, no watermarks,
studio quality, emphasize quality and engineering precision.`;
  },

  lifestyle: (input) => {
    const seasonContext = {
      summer: `family summer road trip adventure, scenic coastal or mountain highway,
bright sunny day, happy relaxed atmosphere, adventure and freedom feeling,
warm golden tones, vacation mood, luggage on roof rack`,
      winter: `cozy winter family journey, snow-covered landscape,
safe confident driving in winter conditions, warm interior glow from vehicle,
holiday travel feeling, ski equipment visible, breath in cold air`,
      allseason: `versatile everyday driving, suburban family neighborhood,
mix of weather conditions showing adaptability, practical daily life,
school run, grocery shopping, weekend activities`,
    };
    const scene = input.season ? seasonContext[input.season] : "everyday driving moments, relatable situations";

    return `Authentic lifestyle automotive photography capturing ${scene}.

Story: Real moments of people enjoying safe, confident driving.
Families, couples, or individuals in genuine automotive situations.
Subtle emphasis on tire/vehicle reliability without being promotional.

Subjects: Diverse, relatable people (age 30-50) in natural poses,
authentic expressions of comfort and confidence while driving.

Vehicle: Modern family SUV or crossover, clean but not showroom-perfect,
realistic everyday use condition.

Environment: ${scene}. Authentic locations, real backgrounds,
environmental context that tells a story.

Technical: Editorial style photography, 35-50mm lens,
natural depth of field, candid documentary approach.

Lighting: Natural available light, golden hour preferred,
soft flattering illumination on subjects, environmental fill.

Mood: Warm, positive, aspirational but achievable, family-oriented,
safety and reliability themes subtly conveyed.

Requirements: Photorealistic, authentic feel, no staged look,
no text, no watermarks, magazine editorial quality.`;
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
  const promptTemplate = IMAGE_PROMPTS[input.type];
  const prompt = promptTemplate(input);
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
