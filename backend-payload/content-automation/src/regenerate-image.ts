/**
 * Regenerate Single Image CLI
 *
 * Usage:
 *   npx tsx content-automation/src/regenerate-image.ts --id=74 --prompt="custom prompt"
 *   npx tsx content-automation/src/regenerate-image.ts --id=74 --type=hero --season=winter
 *   npx tsx content-automation/src/regenerate-image.ts --list  # show recent images
 *
 * Options:
 *   --id=<number>       Media ID to replace
 *   --prompt="..."      Custom prompt (overrides default)
 *   --type=<type>       Image type: hero, content, product, lifestyle
 *   --season=<season>   Season: summer, winter, allseason
 *   --topic="..."       Topic for default prompt generation
 *   --list              List recent media with prompts
 *   --dry-run           Generate but don't upload
 */

import { image } from "./providers/index.js";
import { getPayloadClient } from "./publishers/payload-client.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("RegenerateImage");

// Negative prompt for quality
const NEGATIVE_PROMPT = `blurry, low quality, distorted, deformed, disfigured, bad anatomy,
watermark, text, logo, signature, cropped, out of frame, worst quality, low resolution,
jpeg artifacts, pixelated, noise, grain, overexposed, underexposed, oversaturated,
cartoon, anime, illustration, 3d render, cgi, artificial looking, plastic looking`;

// Default prompts by type
const DEFAULT_PROMPTS = {
  hero: (topic: string, season?: string) => {
    const seasonContext: Record<string, string> = {
      summer: `golden hour sunlight, warm summer day, dry clean asphalt highway,
clear blue sky with soft clouds, vibrant green landscape in background`,
      winter: `fresh snow on road, winter morning atmosphere, cold blue and white tones,
frost on trees, overcast sky with soft diffused light, tire tracks in snow`,
      allseason: `dramatic weather transition, partly cloudy sky with sun breaking through,
wet road reflecting light, dynamic atmospheric lighting`,
    };
    const weather = season ? seasonContext[season] : "professional studio lighting";

    return `Award-winning automotive photography, ultra high resolution 8K, ${topic}.

Scene: ${weather}. Modern premium SUV or luxury sedan photographed at dynamic 3/4 front angle.
Vehicle positioned on scenic road with emphasis on wheel and tire visibility.

Technical: Shot with Sony A7R V, 85mm f/1.4 lens, shallow depth of field.
Professional color grading, high dynamic range. Cinematic widescreen composition.

Style: Editorial automotive magazine quality, photorealistic, hyperdetailed.
Requirements: Photorealistic only, no CGI, no text, no logos, no watermarks.`;
  },

  content: (topic: string) => `Professional editorial photography for automotive blog about ${topic}.

Scene: Clean, well-organized frame with clear focal point.
Environmental context showing real-world automotive situations.

Technical: High resolution, 24-70mm lens, balanced exposure, sharp details.
Style: Modern editorial magazine aesthetic, authentic documentary feel.
Requirements: Photorealistic, no text overlays, no watermarks, publication-ready.`,

  product: (topic: string) => `Ultra high-resolution product photography of ${topic} automotive tire.

Setup: Professional studio, infinity curve backdrop in gradient dark gray to black.
Single tire at slight angle to showcase tread pattern and sidewall.

Lighting: Three-point setup - key light softbox, fill reflector, rim light for edge definition.
Focus: Razor-sharp detail on tread grooves, sipes, shoulder blocks.

Technical: Medium format camera, 100mm macro, f/8-f/11, focus stacking.
Requirements: Hyperrealistic, studio quality, no text, no watermarks.`,

  lifestyle: (topic: string, season?: string) => {
    const seasonContext: Record<string, string> = {
      summer: `family summer road trip, scenic highway, bright sunny day, vacation mood`,
      winter: `cozy winter journey, snow-covered landscape, safe confident driving`,
      allseason: `versatile everyday driving, suburban neighborhood, practical daily life`,
    };
    const scene = season ? seasonContext[season] : "everyday driving moments";

    return `Authentic lifestyle automotive photography capturing ${scene}.

Story: Real moments of people enjoying safe, confident driving.
Subjects: Diverse, relatable people in natural poses.
Vehicle: Modern family SUV, clean but realistic everyday condition.

Technical: Editorial style, 35-50mm lens, natural depth of field.
Lighting: Natural light, golden hour preferred, soft flattering illumination.
Requirements: Photorealistic, authentic feel, no text, no watermarks.`;
  },
};

type ImageType = keyof typeof DEFAULT_PROMPTS;

interface RegenerateOptions {
  mediaId: number;
  prompt?: string;
  type?: ImageType;
  season?: string;
  topic?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  dryRun?: boolean;
}

async function listRecentMedia() {
  const client = getPayloadClient();
  await client.authenticate();

  console.log("\n📷 Recent Media (last 20):\n");

  const response = await fetch(`${process.env.PAYLOAD_URL || "http://localhost:3001"}/api/media?limit=20&sort=-createdAt`, {
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  for (const media of data.docs) {
    console.log(`ID: ${media.id}`);
    console.log(`  Filename: ${media.filename}`);
    console.log(`  Alt: ${media.alt || "-"}`);
    console.log(`  Size: ${media.width}x${media.height}`);
    console.log(`  URL: ${media.url}`);
    console.log("");
  }
}

async function regenerateImage(options: RegenerateOptions) {
  const { mediaId, type = "content", season, topic = "automotive tires", dryRun } = options;

  // Build prompt
  let prompt = options.prompt;
  if (!prompt) {
    const promptFn = DEFAULT_PROMPTS[type];
    prompt = type === "hero" || type === "lifestyle"
      ? (promptFn as (t: string, s?: string) => string)(topic, season)
      : (promptFn as (t: string) => string)(topic);
  }

  // Determine size: use explicit size, or default based on type
  const size = options.size || (type === "hero" ? "1792x1024" : "1024x1024");

  console.log("\n🎨 Regenerating Image");
  console.log("=".repeat(50));
  console.log(`Media ID: ${mediaId}`);
  console.log(`Type: ${type}`);
  console.log(`Season: ${season || "none"}`);
  console.log(`Size: ${size}`);
  console.log(`Dry run: ${dryRun ? "yes" : "no"}`);
  console.log("\n📝 Prompt:");
  console.log(prompt);
  console.log("=".repeat(50));

  logger.info("Generating image...");

  const result = await image.generate(prompt, {
    size: size as "1024x1024" | "1792x1024",
    quality: "hd",
    negativePrompt: NEGATIVE_PROMPT,
    taskType: "image-article",
  });

  console.log(`\n✅ Image generated!`);
  console.log(`  Provider: ${result.provider}`);
  console.log(`  Model: ${result.model}`);
  console.log(`  Cost: $${result.cost.toFixed(4)}`);
  console.log(`  Latency: ${result.latencyMs}ms`);
  console.log(`  URL: ${result.url}`);

  if (result.revisedPrompt) {
    console.log(`\n📝 Revised prompt by AI:`);
    console.log(result.revisedPrompt);
  }

  if (dryRun) {
    console.log("\n⚠️  Dry run - not uploading to Payload");
    return;
  }

  // Get existing media info
  const client = getPayloadClient();
  await client.authenticate();

  const existingMedia = await client.getMediaById(mediaId);
  if (!existingMedia) {
    console.error(`\n❌ Media ID ${mediaId} not found`);
    return;
  }

  console.log(`\n🔄 Replacing media ID ${mediaId} (${existingMedia.filename})`);

  // Delete old media
  await client.deleteMedia(mediaId);
  console.log(`  Deleted old media`);

  // Upload new image with same filename
  const uploadResult = await client.uploadImageFromUrl(result.url, {
    alt: existingMedia.alt || `Regenerated ${type} image`,
    filename: existingMedia.filename,
    force: true,
  });

  if (uploadResult) {
    console.log(`  ✅ Uploaded new media ID: ${uploadResult.id}`);
    console.log(`  URL: ${uploadResult.url}`);
  }
}

// Parse CLI args
const args = process.argv.slice(2);

if (args.includes("--list")) {
  listRecentMedia().catch(console.error);
} else if (args.includes("--help") || args.length === 0) {
  console.log(`
Regenerate Single Image CLI

Usage:
  npx tsx content-automation/src/regenerate-image.ts --id=74 --prompt="custom prompt"
  npx tsx content-automation/src/regenerate-image.ts --id=74 --type=hero --season=winter
  npx tsx content-automation/src/regenerate-image.ts --list

Options:
  --id=<number>       Media ID to replace (required)
  --prompt="..."      Custom prompt (overrides default)
  --type=<type>       Image type: hero, content, product, lifestyle (default: content)
  --season=<season>   Season: summer, winter, allseason
  --size=<size>       Image size: 1024x1024, 1792x1024, 1024x1792 (default: based on type)
  --topic="..."       Topic for default prompt generation
  --list              List recent media
  --dry-run           Generate but don't upload
  --help              Show this help

Examples:
  # Regenerate hero image with winter theme
  npx tsx content-automation/src/regenerate-image.ts --id=74 --type=hero --season=winter --topic="winter tires guide"

  # Regenerate with fully custom prompt
  npx tsx content-automation/src/regenerate-image.ts --id=75 --prompt="Professional photo of tire installation in modern garage"

  # Preview generation without uploading
  npx tsx content-automation/src/regenerate-image.ts --id=76 --type=content --dry-run
`);
} else {
  // Parse options
  const getArg = (name: string): string | undefined => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split("=").slice(1).join("=") : undefined;
  };

  const mediaId = parseInt(getArg("id") || "0", 10);
  if (!mediaId) {
    console.error("❌ Error: --id is required");
    process.exit(1);
  }

  const options: RegenerateOptions = {
    mediaId,
    prompt: getArg("prompt"),
    type: getArg("type") as ImageType | undefined,
    season: getArg("season"),
    size: getArg("size") as '1024x1024' | '1792x1024' | '1024x1792' | undefined,
    topic: getArg("topic"),
    dryRun: args.includes("--dry-run"),
  };

  regenerateImage(options).catch(console.error);
}
