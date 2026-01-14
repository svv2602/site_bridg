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
  // Season pages - square format for hero cards
  {
    filename: "hero-summer.jpg",
    size: "1024x1024",
    prompt: `Ultra-realistic photograph of a modern silver sedan driving on a European highway in summer.
Bright sunny day, blue sky with white clouds, lush green trees along the road.
The car is captured from a 3/4 front angle, showing the full vehicle profile.
Dry asphalt road, professional automotive photography lighting.
Shot with Canon EOS R5, 85mm f/1.4 lens, natural daylight.
Hyperrealistic, 8K quality, no distortion, correct car proportions.
CRITICAL: No text, no logos, no watermarks, no brand emblems visible.`,
  },
  {
    filename: "hero-winter.jpg",
    size: "1024x1024",
    prompt: `Ultra-realistic photograph of a dark gray SUV driving on a snowy mountain road in winter.
Fresh snow covering the road and pine trees, overcast sky, cold winter atmosphere.
The SUV is captured from the side-front angle, showing confident winter driving.
Visible tire tracks in fresh snow, demonstrating grip and control.
Shot with Sony A7R IV, 70-200mm lens, natural winter light.
Hyperrealistic, 8K quality, correct vehicle proportions, no distortion.
CRITICAL: No text, no logos, no watermarks, no brand emblems visible.`,
  },
  {
    filename: "hero-allseason.jpg",
    size: "1024x1024",
    prompt: `Ultra-realistic photograph of a modern crossover on a wet autumn road.
Rainy weather just stopped, wet reflective asphalt, fallen orange and yellow leaves.
Moody autumn sky with dramatic clouds, trees with colorful foliage.
The car is captured from 3/4 angle, showing stability on wet surface.
Shot with Nikon Z9, 50mm lens, natural overcast lighting.
Hyperrealistic, 8K quality, correct proportions, photojournalistic style.
CRITICAL: No text, no logos, no watermarks, no brand emblems visible.`,
  },

  // Vehicle type pages - square format
  {
    filename: "hero-passenger.jpg",
    size: "1024x1024",
    prompt: `Ultra-realistic photograph of an elegant silver sedan on a clean city street.
Modern executive car similar to Audi A6 or BMW 5 series styling.
Daytime urban setting, modern architecture in background, clean sidewalks.
The sedan captured from 3/4 front angle showing sleek design.
Professional automotive photography, soft shadows, balanced exposure.
Shot with Phase One XF camera, 80mm lens, studio-quality natural light.
Hyperrealistic, 8K quality, perfect proportions, showroom finish.
CRITICAL: No text, no logos, no watermarks, no brand emblems visible.`,
  },
  {
    filename: "hero-suv.jpg",
    size: "1024x1024",
    prompt: `Ultra-realistic photograph of a premium black SUV on a scenic mountain viewpoint.
Large luxury SUV similar to BMW X5 or Volvo XC90 styling.
Dramatic mountain landscape background, golden hour sunlight.
The SUV captured from 3/4 angle showing robust stance and ground clearance.
Adventure spirit with professional automotive photography quality.
Shot with Canon EOS R5, 35mm wide angle, warm golden light.
Hyperrealistic, 8K quality, correct proportions, magazine cover quality.
CRITICAL: No text, no logos, no watermarks, no brand emblems visible.`,
  },
  {
    filename: "hero-lcv.jpg",
    size: "1024x1024",
    prompt: `Ultra-realistic photograph of a white delivery van in an urban business district.
Modern commercial van similar to Mercedes Sprinter or Ford Transit styling.
Clean city environment, modern office buildings, professional business context.
The van captured from 3/4 front angle, showing practical design.
Bright daylight, professional commercial photography style.
Shot with Sony A7R IV, 50mm lens, clean natural lighting.
Hyperrealistic, 8K quality, correct proportions, fleet advertising quality.
CRITICAL: No text, no logos, no watermarks, no brand emblems visible.`,
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
