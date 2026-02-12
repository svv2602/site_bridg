/**
 * Regenerate AI Content for a Specific Tyre
 *
 * Usage: npx tsx src/regenerate-tyre.ts <slug>
 *
 * This script:
 * 1. Fetches the tyre from Payload CMS by slug
 * 2. Generates new AI content (EN → UA two-stage)
 * 3. Updates the tyre in Payload CMS with the new content
 */

import { getPayloadClient } from "./publishers/payload-client.js";
import { generateTireDescription } from "./processors/content/tire-description.js";
import { generateTireSEO } from "./processors/content/tire-seo.js";
import { markdownToHtml } from "./utils/markdown-to-html.js";
import type { Brand } from "./types/content.js";

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.error("Usage: npx tsx src/regenerate-tyre.ts <slug>");
    console.error("Example: npx tsx src/regenerate-tyre.ts blizzak-lm005");
    process.exit(1);
  }

  console.log(`\nRegenerating content for: ${slug}`);
  console.log("=".repeat(50));

  const client = getPayloadClient();
  await client.authenticate();

  // 1. Find the tyre in Payload CMS
  console.log("\n[1/3] Fetching tyre from Payload CMS...");
  const tyre = await client.findTyreBySlug(slug);

  if (!tyre) {
    console.error(`Tyre not found: ${slug}`);
    process.exit(1);
  }

  console.log(`Found: ${tyre.name} (ID: ${tyre.id})`);
  console.log(`Season: ${tyre.season}`);
  console.log(`Vehicle types: ${tyre.vehicleTypes?.join(", ") || "N/A"}`);

  const tireBrand = (tyre as { brand?: Brand }).brand || "bridgestone";
  const tireSeason = tyre.season as "summer" | "winter" | "allseason";

  // Load scraped data for additional context
  let scrapedTire: any = null;
  try {
    const fs = await import("fs/promises");
    const dataPath = new URL("../data/prokoleso-tires.json", import.meta.url);
    const data = await fs.readFile(dataPath, "utf-8");
    const tires = JSON.parse(data);
    scrapedTire = tires.find((t: any) =>
      (t.canonicalSlug || t.sourceSlug) === slug
    );
  } catch {
    // No scraped data — use DB data only
  }

  // 2. Generate new AI content (EN → UA two-stage)
  console.log("\n[2/3] Generating AI content...");

  const descResult = await generateTireDescription({
    modelSlug: tyre.slug,
    modelName: tyre.name,
    brand: tireBrand,
    season: tireSeason,
    vehicleTypes: tyre.vehicleTypes,
    euLabel: tyre.euLabel || scrapedTire?.euLabel,
    technologies: scrapedTire?.technologies,
  }, { skipValidation: true, twoStage: true });

  // Generate SEO
  const seoResult = await generateTireSEO({
    modelSlug: tyre.slug,
    modelName: tyre.name,
    brand: tireBrand,
    season: tireSeason,
    shortDescription: descResult.content.shortDescription,
    keyBenefits: descResult.content.keyBenefits,
  }, { skipValidation: true });

  console.log("Content generated successfully!");
  console.log(`  Short description: ${descResult.content.shortDescription.substring(0, 80)}...`);
  console.log(`  Full description: ${descResult.content.fullDescription.length} chars`);
  console.log(`  Key benefits: ${descResult.content.keyBenefits.length} items`);
  console.log(`  SEO title: ${seoResult.seo.seoTitle}`);
  console.log(`  Cost: $${(descResult.metadata.cost + seoResult.metadata.cost).toFixed(4)}`);

  // 3. Update tyre in Payload CMS
  console.log("\n[3/3] Updating tyre in Payload CMS...");

  const fullDescriptionHtml = markdownToHtml(descResult.content.fullDescription);
  const seoTitle = (seoResult.seo.seoTitle || "").substring(0, 70);
  const seoDescription = (seoResult.seo.seoDescription || "").substring(0, 170);

  const keyBenefits = descResult.content.keyBenefits.map((b: string) => ({
    benefit: b,
  }));

  await client.updateTyre(tyre.id, {
    shortDescription: descResult.content.shortDescription,
    fullDescription: fullDescriptionHtml,
    keyBenefits,
    seoTitle,
    seoDescription,
  });

  console.log(`\n✓ Tyre "${tyre.name}" updated successfully.`);
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
