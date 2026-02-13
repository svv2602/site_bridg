/**
 * Generate Hero Images for Frontend Pages
 *
 * Usage:
 *   npx tsx content-automation/src/generate-hero-images.ts
 *   npx tsx content-automation/src/generate-hero-images.ts --dry-run
 */

import { image } from "./providers/index.js";
import { NEGATIVE_PROMPT, generatePromptByType } from "./config/image-prompts.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_HERO_DIR = path.resolve(__dirname, "../../../frontend/public/images/hero");

interface HeroImageConfig {
  filename: string;
  topic: string;
  season?: string;
  size: "1792x1024" | "1024x1024";
}

const heroImages: HeroImageConfig[] = [
  // Season pages
  { filename: "hero-summer.jpg",    topic: "summer tires on European highway, sunny day",          season: "summer",    size: "1024x1024" },
  { filename: "hero-winter.jpg",    topic: "winter SUV tires on snowy mountain road",              season: "winter",    size: "1024x1024" },
  { filename: "hero-allseason.jpg", topic: "allseason tires on wet autumn road",                   season: "allseason", size: "1024x1024" },
  // Vehicle type pages
  { filename: "hero-passenger.jpg", topic: "elegant sedan passenger car tires, city street",       size: "1024x1024" },
  { filename: "hero-suv.jpg",       topic: "premium SUV tires on scenic mountain viewpoint",       size: "1024x1024" },
  { filename: "hero-lcv.jpg",       topic: "delivery van LCV tires in urban business district",    size: "1024x1024" },
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
    const prompt = generatePromptByType("hero", config.topic, { season: config.season });

    console.log(`\n📷 ${config.filename}`);
    console.log(`   Size: ${config.size}`);
    console.log(`   Topic: ${config.topic}`);

    if (dryRun) {
      console.log("   [DRY RUN] Would generate with prompt:");
      console.log(`   ${prompt.substring(0, 150)}...`);
      continue;
    }

    try {
      const result = await image.generate(prompt, {
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
