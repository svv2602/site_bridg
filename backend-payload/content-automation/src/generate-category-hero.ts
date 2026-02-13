/**
 * Generate Hero Image for a CategoryPage
 *
 * Usage:
 *   npx tsx src/generate-category-hero.ts --pageId=6
 *   npx tsx src/generate-category-hero.ts --pageId=6 --topic="winter SUV tires" --season=winter
 *   npx tsx src/generate-category-hero.ts --pageId=6 --prompt="Custom prompt..."
 *   npx tsx src/generate-category-hero.ts --pageId=6 --dry-run
 *
 * Outputs JSON result to stdout on success: { success, mediaId, pageId }
 */

import { image } from "./providers/index.js";
import { getPayloadClient } from "./publishers/payload-client.js";
import {
  NEGATIVE_PROMPT,
  generatePromptByType,
} from "./config/image-prompts.js";
import { ENV } from "./config/env.js";

/** Map slug/vehicleType/season to a descriptive topic */
function autoDetectTopic(page: {
  slug?: string;
  pageType?: string;
  season?: string;
  vehicleType?: string;
  title?: string;
}): string {
  const { pageType, season, vehicleType } = page;

  if (pageType === "season") {
    switch (season) {
      case "summer":
        return "summer tires on European highway, sunny day";
      case "winter":
        return "winter SUV tires on snowy mountain road";
      case "allseason":
        return "allseason tires on wet autumn road";
    }
  }

  if (pageType === "vehicle") {
    switch (vehicleType) {
      case "passenger":
        return "elegant sedan passenger car tires, city street";
      case "suv":
        return "premium SUV tires on scenic mountain viewpoint";
      case "van":
        return "delivery van LCV tires in urban business district";
    }
  }

  return page.title || "automotive tires on a road";
}

function autoDetectSeason(page: {
  pageType?: string;
  season?: string;
}): string | undefined {
  if (page.pageType === "season" && page.season) {
    return page.season;
  }
  return undefined;
}

interface Options {
  pageId: number;
  topic?: string;
  season?: string;
  prompt?: string;
  dryRun: boolean;
}

/** Authenticate and return JWT token for direct REST calls */
async function getAuthToken(): Promise<string> {
  const payloadUrl = ENV.PAYLOAD_URL || "http://localhost:3001";
  const email = process.env.PAYLOAD_ADMIN_EMAIL;
  const password = process.env.PAYLOAD_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD required");

  const res = await fetch(`${payloadUrl}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const data = await res.json();
  return data.token;
}

async function generateCategoryHero(options: Options) {
  const { pageId, dryRun } = options;

  const payloadUrl = ENV.PAYLOAD_URL || "http://localhost:3001";

  // 1. Fetch category page data (public read)
  const pageResponse = await fetch(`${payloadUrl}/api/category-pages/${pageId}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!pageResponse.ok) {
    throw new Error(`Category page ${pageId} not found (${pageResponse.status})`);
  }

  const page = await pageResponse.json();

  // 2. Determine topic and season
  const topic = options.topic || autoDetectTopic(page);
  const season = options.season || autoDetectSeason(page);

  // 3. Build prompt
  const prompt = options.prompt || generatePromptByType("hero", topic, { season });

  console.error(`\nCategory Page: ${page.title} (ID: ${pageId})`);
  console.error(`  Slug: ${page.slug}`);
  console.error(`  Type: ${page.pageType}, Vehicle: ${page.vehicleType || "-"}, Season: ${page.season || "-"}`);
  console.error(`  Topic: ${topic}`);
  console.error(`  Season: ${season || "none"}`);

  if (dryRun) {
    console.error("\n[DRY RUN] Would generate with prompt:");
    console.error(prompt);
    console.log(JSON.stringify({ success: true, dryRun: true, pageId, topic, season }));
    return;
  }

  // 4. Authenticate
  const client = getPayloadClient();
  await client.authenticate();
  const token = await getAuthToken();

  // 5. Generate image
  console.error("\nGenerating image...");
  const result = await image.generate(prompt, {
    size: "1024x1024",
    quality: "hd",
    negativePrompt: NEGATIVE_PROMPT,
    taskType: "image-hero",
  });

  console.error(`  Generated! Provider: ${result.provider}, Cost: $${result.cost.toFixed(4)}`);

  // 6. Upload to Payload Media
  const filename = `hero-category-${page.slug}-${Date.now()}.png`;
  const uploaded = await client.uploadImageFromUrl(result.url, {
    alt: page.title || `Hero image for ${page.slug}`,
    filename,
    force: true,
  });

  if (!uploaded) {
    throw new Error("Failed to upload image to Payload Media");
  }

  console.error(`  Uploaded media ID: ${uploaded.id}`);

  // 7. Update category page's heroImage field via REST PATCH
  const updateResponse = await fetch(`${payloadUrl}/api/category-pages/${pageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify({ heroImage: uploaded.id }),
  });

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    throw new Error(`Failed to update category page: ${updateResponse.status} ${errorText}`);
  }

  console.error(`  Updated category page ${pageId} heroImage -> ${uploaded.id}`);

  // 8. Output JSON result to stdout
  console.log(JSON.stringify({
    success: true,
    mediaId: uploaded.id,
    pageId,
  }));
}

// Parse CLI args
const args = process.argv.slice(2);

if (args.includes("--help") || args.length === 0) {
  console.log(`
Generate Hero Image for CategoryPage

Usage:
  npx tsx src/generate-category-hero.ts --pageId=6
  npx tsx src/generate-category-hero.ts --pageId=6 --topic="winter SUV tires" --season=winter
  npx tsx src/generate-category-hero.ts --pageId=6 --prompt="Custom prompt..."
  npx tsx src/generate-category-hero.ts --pageId=6 --dry-run

Options:
  --pageId=<number>   Category page ID (required)
  --topic="..."       Topic for prompt (auto-detected from page data if omitted)
  --season=<season>   Season: summer, winter, allseason (auto-detected if omitted)
  --prompt="..."      Full custom prompt (overrides topic/season)
  --dry-run           Show prompt without generating
  --help              Show this help
`);
  process.exit(0);
}

const getArg = (name: string): string | undefined => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : undefined;
};

const pageId = parseInt(getArg("pageId") || "0", 10);
if (!pageId) {
  console.error("Error: --pageId is required");
  process.exit(1);
}

generateCategoryHero({
  pageId,
  topic: getArg("topic"),
  season: getArg("season"),
  prompt: getArg("prompt"),
  dryRun: args.includes("--dry-run"),
}).catch((err) => {
  console.error("Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
