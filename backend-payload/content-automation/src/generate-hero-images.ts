/**
 * Generate Hero Images for Frontend Pages
 *
 * Usage:
 *   npx tsx content-automation/src/generate-hero-images.ts
 *   npx tsx content-automation/src/generate-hero-images.ts --dry-run
 */

import { image } from "./providers/index.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_HERO_DIR = path.resolve(__dirname, "../../../frontend/public/images/hero");

const NEGATIVE_PROMPT = `blurry, low quality, distorted, deformed, text, logo, watermark,
signature, cropped, worst quality, low resolution, cartoon, anime, illustration, 3d render,
cgi, artificial looking, brand names, license plates readable`;

interface HeroImageConfig {
  filename: string;
  prompt: string;
  size: "1792x1024" | "1024x1024";
}

const heroImages: HeroImageConfig[] = [
  // Season pages
  {
    filename: "hero-summer.jpg",
    size: "1792x1024",
    prompt: `Cinematic automotive photography, summer road trip scene.

Modern sedan or SUV driving on a scenic highway during golden hour.
Warm sunlight, clear blue sky, green trees and fields along the road.
The car is in motion, showing dynamic movement.
Emphasis on the wheels and tires gripping the dry asphalt.

Technical: Shot with Sony A7R V, 70-200mm lens, motion blur on background.
Professional color grading, warm tones, high dynamic range.
Style: Premium automotive magazine quality, photorealistic.

Requirements: No text, no logos, no watermarks, no visible brand names on car.
Clean composition, focus on the driving experience in summer conditions.`,
  },
  {
    filename: "hero-winter.jpg",
    size: "1792x1024",
    prompt: `Cinematic automotive photography, winter driving scene.

Modern SUV or crossover confidently driving on a snowy mountain road.
Fresh snow on the road and trees, cold blue winter light, overcast sky.
Tire tracks in snow showing excellent grip.
The vehicle is in control, demonstrating winter tire performance.

Technical: Shot with professional camera, wide angle lens.
Cool color grading, blue and white tones, sharp details.
Style: Premium automotive magazine quality, photorealistic.

Requirements: No text, no logos, no watermarks, no visible brand names.
Atmospheric winter mood, emphasis on safety and control in winter conditions.`,
  },
  {
    filename: "hero-allseason.jpg",
    size: "1792x1024",
    prompt: `Cinematic automotive photography, autumn driving scene.

Modern car driving on a wet road with fallen autumn leaves.
Dramatic sky with clouds, rain just stopped, wet reflective asphalt.
Golden and orange autumn foliage along the road.
The car shows stability on the wet surface.

Technical: Shot with professional camera, medium telephoto lens.
Rich autumn colors, moody atmospheric lighting.
Style: Premium automotive magazine quality, photorealistic.

Requirements: No text, no logos, no watermarks, no visible brand names.
Transitional weather conditions, showing all-season tire versatility.`,
  },

  // Vehicle type pages
  {
    filename: "hero-passenger.jpg",
    size: "1792x1024",
    prompt: `Premium automotive photography of a modern sedan on the road.

Elegant executive sedan (like Mercedes E-class or BMW 5 series style)
driving on a well-maintained highway. Professional photoshoot quality.
Focus on the sleek design and premium tires.
Daytime lighting, clean background, urban or suburban setting.

Technical: Professional automotive photography, sharp focus on the car.
Neutral color grading, balanced exposure.
Style: Car advertisement quality, photorealistic.

Requirements: No text, no logos, no watermarks, no visible brand names.
Emphasize comfort, elegance, and daily commuting reliability.`,
  },
  {
    filename: "hero-suv.jpg",
    size: "1792x1024",
    prompt: `Dynamic automotive photography of a modern SUV in action.

Premium SUV or crossover (like BMW X5 or Audi Q7 style) on a scenic mountain road.
The vehicle shows capability and adventure spirit.
Dramatic landscape background, slight dust or dynamic movement.
Emphasis on the robust tires and ground clearance.

Technical: Professional automotive photography, dynamic angle.
Rich colors, dramatic lighting, high contrast.
Style: Adventure automotive magazine quality, photorealistic.

Requirements: No text, no logos, no watermarks, no visible brand names.
Show versatility - capable on various terrains while maintaining road comfort.`,
  },
  {
    filename: "hero-lcv.jpg",
    size: "1792x1024",
    prompt: `Professional photography of a modern delivery van or light commercial vehicle.

Clean white or silver van (like Mercedes Sprinter or Ford Transit style)
driving in an urban business district. Professional business context.
The vehicle is well-maintained, showing reliability for commercial use.
Focus on durability and professional appearance.

Technical: Professional commercial photography, clean composition.
Bright, professional lighting, urban environment.
Style: Commercial fleet advertising quality, photorealistic.

Requirements: No text, no logos, no watermarks, no visible brand names.
Emphasize reliability, efficiency, and professional business transport.`,
  },
];

async function ensureDirectory(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function downloadImage(url: string, filepath: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  await fs.writeFile(filepath, Buffer.from(buffer));
}

async function generateHeroImages(dryRun: boolean = false) {
  console.log("\n🎨 Generating Hero Images for Frontend\n");
  console.log("=".repeat(60));

  await ensureDirectory(FRONTEND_HERO_DIR);

  let totalCost = 0;

  for (const config of heroImages) {
    console.log(`\n📷 ${config.filename}`);
    console.log(`   Size: ${config.size}`);

    if (dryRun) {
      console.log("   [DRY RUN] Would generate with prompt:");
      console.log(`   ${config.prompt.substring(0, 100)}...`);
      continue;
    }

    try {
      const result = await image.generate(config.prompt, {
        size: config.size,
        quality: "hd",
        negativePrompt: NEGATIVE_PROMPT,
        taskType: "image-hero",
      });

      console.log(`   ✅ Generated! Provider: ${result.provider}, Cost: $${result.cost.toFixed(4)}`);
      totalCost += result.cost;

      // Download to frontend public folder
      const filepath = path.join(FRONTEND_HERO_DIR, config.filename);
      await downloadImage(result.url, filepath);
      console.log(`   💾 Saved to: ${filepath}`);

    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`Total cost: $${totalCost.toFixed(4)}`);
  console.log(`Images saved to: ${FRONTEND_HERO_DIR}`);
  console.log("\nNext steps:");
  console.log("1. Update frontend pages to use these images");
  console.log("2. Commit the changes");
}

// Parse args
const dryRun = process.argv.includes("--dry-run");
generateHeroImages(dryRun).catch(console.error);
