/**
 * Cron Scheduler
 *
 * Schedules weekly automation tasks:
 * 1. Scrape ProKoleso for new models
 * 2. Scrape test results (ADAC, AutoBild)
 * 3. Generate content for new models
 * 4. Generate articles for new tests
 * 5. Publish to Payload CMS
 * 6. Send Telegram summary
 */

import { ENV } from "./config/env.js";
import { scrapeProkoleso, scrapeProkolesoBrand } from "./scrapers/prokoleso.js";
import { generateTireDescription } from "./processors/content/tire-description.js";
import { generateTireSEO } from "./processors/content/tire-seo.js";
import { getPayloadClient } from "./publishers/payload-client.js";
import { notifyWeeklySummary, notifyError } from "./publishers/telegram-bot.js";
import { markdownToHtml } from "./utils/markdown-to-html.js";
import type { Brand } from "./types/content.js";

// Types
export interface AutomationResult {
  tyresProcessed: number;
  tyresNew: number;
  articlesGenerated: number;
  badgesAssigned: number;
  errors: string[];
  duration: number;
}

// Statistics tracker
let stats = {
  tyresProcessed: 0,
  tyresNew: 0,
  articlesGenerated: 0,
  badgesAssigned: 0,
  errors: [] as string[],
};

function resetStats() {
  stats = {
    tyresProcessed: 0,
    tyresNew: 0,
    articlesGenerated: 0,
    badgesAssigned: 0,
    errors: [],
  };
}

/**
 * Run full weekly automation
 */
export async function runWeeklyAutomation(): Promise<AutomationResult> {
  console.log("=".repeat(50));
  console.log("Starting weekly automation...");
  console.log("=".repeat(50));

  const startTime = Date.now();
  resetStats();

  try {
    // Step 1: Scrape ProKoleso
    console.log("\n[1/6] Scraping ProKoleso...");
    await runScrapePipeline();

    // Step 2: Scrape test results (placeholder)
    console.log("\n[2/6] Scraping test results...");
    console.log("(Test scrapers not implemented yet)");

    // Step 3: Generate content
    console.log("\n[3/6] Generating content...");
    await runContentGeneration();

    // Step 4: Generate articles (placeholder)
    console.log("\n[4/6] Generating articles...");
    console.log("(Article generation triggered by new tests)");

    // Step 5: Publish to Strapi
    console.log("\n[5/6] Publishing to Payload...");
    await runPublishPipeline();

    // Step 6: Send summary
    console.log("\n[6/6] Sending Telegram summary...");
    await sendSummary();

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    stats.errors.push(errorMessage);
    console.error("Automation error:", errorMessage);

    // Notify about error
    await notifyError({
      operation: "Weekly Automation",
      error: errorMessage,
    });
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  console.log("\n" + "=".repeat(50));
  console.log("Automation completed!");
  console.log(`Duration: ${duration}s`);
  console.log(`Tyres processed: ${stats.tyresProcessed}`);
  console.log(`New tyres: ${stats.tyresNew}`);
  console.log(`Articles: ${stats.articlesGenerated}`);
  console.log(`Badges: ${stats.badgesAssigned}`);
  console.log(`Errors: ${stats.errors.length}`);
  console.log("=".repeat(50));

  return {
    ...stats,
    duration,
  };
}

/**
 * Scrape pipeline
 */
async function runScrapePipeline(brand?: Brand) {
  try {
    let tires;
    if (brand) {
      console.log(`Scraping ${brand} tires...`);
      tires = await scrapeProkolesoBrand(brand);
    } else {
      console.log("Scraping all tires...");
      tires = await scrapeProkoleso();
    }
    stats.tyresProcessed = tires.length;
    console.log(`Found ${tires.length} tires`);

    // Save brand-specific data file
    if (brand && tires.length > 0) {
      const fs = await import("fs/promises");
      const dataPath = new URL(`../data/prokoleso-${brand}-tires.json`, import.meta.url);
      await fs.writeFile(dataPath, JSON.stringify(tires, null, 2));
      console.log(`Saved to ${dataPath}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    stats.errors.push(`Scrape failed: ${errorMessage}`);
    console.error("Scrape error:", errorMessage);
  }
}

/**
 * Content generation pipeline
 * Skips tires that already have content in DB
 */
async function runContentGeneration(brand?: Brand, limit?: number) {
  try {
    // Read scraped data (brand-specific or general)
    const fs = await import("fs/promises");
    const dataFileName = brand ? `prokoleso-${brand}-tires.json` : "prokoleso-tires.json";
    const dataPath = new URL(`../data/${dataFileName}`, import.meta.url);

    let tires: any[];
    try {
      const data = await fs.readFile(dataPath, "utf-8");
      tires = JSON.parse(data);
    } catch {
      console.log(`No scraped data found at ${dataFileName}. Run 'scrape${brand ? ` --brand ${brand}` : ""}' first.`);
      return;
    }

    if (tires.length === 0) {
      console.log("No tires to process");
      return;
    }

    // Generate content for tires without AI-generated descriptions
    const tiresToProcess = tires.filter((t: any) => !t.aiGenerated);
    console.log(`Found ${tiresToProcess.length} tires needing content generation`);

    if (tiresToProcess.length === 0) {
      console.log("All tires already have generated content");
      return;
    }

    // Check which tires already have content in DB and skip them
    const client = getPayloadClient();
    console.log("Checking existing content in DB...");

    let skippedCount = 0;
    const tiresNeedingGeneration: any[] = [];

    for (const tire of tiresToProcess) {
      const slug = tire.canonicalSlug || tire.sourceSlug;
      const dbCheck = await client.checkTyreHasContent(slug);

      if (dbCheck.exists && dbCheck.hasContent) {
        // Already has content in DB - mark as generated and skip
        tire.aiGenerated = true;
        tire.publishedToPayload = true;
        tire.skippedReason = "Already has content in DB";
        skippedCount++;
        console.log(`  ⏭️  Skipped: ${tire.name} (already has content in DB)`);
      } else if (dbCheck.exists && !dbCheck.hasContent) {
        // Exists but missing content - needs generation
        tire.missingFields = dbCheck.missingFields;
        tiresNeedingGeneration.push(tire);
        console.log(`  📝 Needs content: ${tire.name} (missing: ${dbCheck.missingFields.join(", ")})`);
      } else {
        // New tire - needs generation
        tiresNeedingGeneration.push(tire);
        console.log(`  🆕 New tire: ${tire.name}`);
      }
    }

    console.log(`\nSkipped ${skippedCount} tires (already have content in DB)`);
    console.log(`${tiresNeedingGeneration.length} tires need content generation`);

    if (tiresNeedingGeneration.length === 0) {
      // Save updated flags
      await fs.writeFile(dataPath, JSON.stringify(tires, null, 2));
      console.log("No tires need content generation");
      return;
    }

    // Process tires (default limit 3 for safety)
    const batchSize = limit || Math.min(tiresNeedingGeneration.length, 3);
    console.log(`Processing ${batchSize} tires...`);

    for (let i = 0; i < batchSize; i++) {
      const tire = tiresNeedingGeneration[i];
      const tireBrand = brand || tire.brand || "bridgestone";
      const slug = tire.canonicalSlug || tire.sourceSlug;
      console.log(`\n[${i + 1}/${batchSize}] Generating content for: ${tire.name}`);

      try {
        // Generate description using new content pipeline
        const descResult = await generateTireDescription({
          modelSlug: slug,
          modelName: tire.name,
          brand: tireBrand,
          season: tire.season || "summer",
          euLabel: tire.euLabel,
        }, { skipValidation: true });

        // Generate SEO metadata (skip strict validation for now)
        const seoResult = await generateTireSEO({
          modelSlug: slug,
          modelName: tire.name,
          season: tire.season || "summer",
          shortDescription: descResult.content.shortDescription,
          keyBenefits: descResult.content.highlights,
        }, { skipValidation: true });

        // Combine results into unified content object
        const content = {
          shortDescription: descResult.content.shortDescription,
          fullDescription: descResult.content.fullDescription,
          keyBenefits: descResult.content.highlights,
          seoTitle: seoResult.seo.seoTitle,
          seoDescription: seoResult.seo.seoDescription,
        };

        console.log(`  ✓ Generated: ${content.shortDescription.substring(0, 60)}...`);
        console.log(`    Cost: $${(descResult.metadata.cost + seoResult.metadata.cost).toFixed(4)}`);

        // Mark as processed and store generated content
        tire.aiGenerated = true;
        tire.generatedContent = content;
        tire.brand = tireBrand;
        stats.tyresNew++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`  ✗ Failed: ${errorMessage}`);
        stats.errors.push(`${tire.name}: ${errorMessage}`);
      }
    }

    // Save updated data
    await fs.writeFile(dataPath, JSON.stringify(tires, null, 2));
    console.log(`\nUpdated ${dataPath}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    stats.errors.push(`Content generation failed: ${errorMessage}`);
    console.error("Content generation error:", errorMessage);
  }
}

/**
 * Publish pipeline - publishes generated content to Payload CMS
 * Skips tires that already have content in DB (only publishes new or incomplete)
 */
async function runPublishPipeline(brand?: Brand) {
  try {
    const fs = await import("fs/promises");
    const dataFileName = brand ? `prokoleso-${brand}-tires.json` : "prokoleso-tires.json";
    const dataPath = new URL(`../data/${dataFileName}`, import.meta.url);

    let tires: any[];
    try {
      const data = await fs.readFile(dataPath, "utf-8");
      tires = JSON.parse(data);
    } catch {
      console.log("No scraped data found. Run 'scrape' first.");
      return;
    }

    // Find tires with generated content that haven't been published yet
    const tiresToPublish = tires.filter(
      (t: any) => t.aiGenerated && t.generatedContent && !t.publishedToPayload
    );

    console.log(`Found ${tiresToPublish.length} tires ready for publishing`);

    if (tiresToPublish.length === 0) {
      console.log("No tires to publish");
      return;
    }

    const client = getPayloadClient();
    let published = 0;
    let skipped = 0;

    for (const tire of tiresToPublish) {
      const slug = tire.canonicalSlug || tire.sourceSlug;
      console.log(`\nPublishing: ${tire.name} (${slug})`);

      try {
        // Check if tyre already exists with content in DB
        const dbCheck = await client.checkTyreHasContent(slug);

        if (dbCheck.exists && dbCheck.hasContent && dbCheck.hasImage) {
          // Already complete in DB - skip
          tire.publishedToPayload = true;
          tire.skippedReason = "Already complete in DB";
          skipped++;
          console.log(`  ⏭️  Skipped (already complete in DB)`);
          continue;
        }

        const content = tire.generatedContent;

        // Convert markdown fullDescription to HTML (CKEditor stores HTML directly)
        const fullDescriptionHtml = markdownToHtml(content.fullDescription);

        // Convert keyBenefits array to Payload format
        const keyBenefits = content.keyBenefits.map((b: string) => ({
          benefit: b,
        }));

        // Truncate SEO fields to meet Payload limits
        const seoTitle = (content.seoTitle || "").substring(0, 70);
        const seoDescription = (content.seoDescription || "").substring(0, 170);

        // Upload image if available and not already set
        let imageId: number | undefined;
        if (tire.imageUrl && !dbCheck.hasImage) {
          const imageResult = await client.uploadImageFromUrl(tire.imageUrl, {
            alt: `${tire.brand || brand} ${tire.name}`,
            filename: `${slug}.png`,
            removeBackground: true,
          });
          if (imageResult) {
            imageId = imageResult.id;
          }
        }

        if (dbCheck.exists) {
          // Update existing tyre - only update missing fields
          const updateData: Record<string, unknown> = {};

          // Only update fields that are missing in DB
          if (dbCheck.missingFields.includes("shortDescription")) {
            updateData.shortDescription = content.shortDescription;
          }
          if (dbCheck.missingFields.includes("fullDescription")) {
            updateData.fullDescription = fullDescriptionHtml;
          }
          if (dbCheck.missingFields.includes("seoTitle")) {
            updateData.seoTitle = seoTitle;
          }
          if (dbCheck.missingFields.includes("seoDescription")) {
            updateData.seoDescription = seoDescription;
          }

          // Always update keyBenefits if empty
          const existingBenefits = (dbCheck.tyre as any)?.keyBenefits;
          if (!existingBenefits || existingBenefits.length === 0) {
            updateData.keyBenefits = keyBenefits;
          }

          // Update image if not set
          if (imageId && !dbCheck.hasImage) {
            updateData.image = imageId;
          }

          // Add sizes if available and not already set
          const existingSizes = (dbCheck.tyre as any)?.sizes;
          if (tire.sizes && tire.sizes.length > 0 && (!existingSizes || existingSizes.length === 0)) {
            updateData.sizes = tire.sizes;
          }

          if (Object.keys(updateData).length > 0) {
            await client.updateTyre(dbCheck.tyre!.id, updateData);
            console.log(`  ✓ Updated tyre ID: ${dbCheck.tyre!.id} (fields: ${Object.keys(updateData).join(", ")})`);
          } else {
            console.log(`  ⏭️  No updates needed`);
          }
        } else {
          // Create new tyre
          const createData: Record<string, unknown> = {
            name: tire.name,
            slug,
            brand: tire.brand || brand,
            season: tire.season || "summer",
            vehicleTypes: ["passenger"],
            shortDescription: content.shortDescription,
            fullDescription: fullDescriptionHtml,
            keyBenefits,
            seoTitle,
            seoDescription,
            euLabel: tire.euLabel,
          };
          if (imageId) {
            createData.image = imageId;
          }
          // Add sizes if available
          if (tire.sizes && tire.sizes.length > 0) {
            createData.sizes = tire.sizes;
          }
          await client.createTyre(createData as any);
          console.log(`  ✓ Created new tyre`);
        }

        // Mark as published
        tire.publishedToPayload = true;
        tire.publishedAt = new Date().toISOString();
        published++;
        stats.tyresProcessed++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`  ✗ Failed: ${errorMessage}`);
        stats.errors.push(`Publish ${tire.name}: ${errorMessage}`);
      }
    }

    // Save updated data with publish flags
    await fs.writeFile(dataPath, JSON.stringify(tires, null, 2));
    console.log(`\nPublished ${published}, skipped ${skipped} / ${tiresToPublish.length} tires`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    stats.errors.push(`Publish pipeline failed: ${errorMessage}`);
    console.error("Publish pipeline error:", errorMessage);
  }
}

/**
 * Send Telegram summary
 */
async function sendSummary() {
  await notifyWeeklySummary({
    tyresProcessed: stats.tyresProcessed,
    tyresNew: stats.tyresNew,
    articlesGenerated: stats.articlesGenerated,
    badgesAssigned: stats.badgesAssigned,
    errors: stats.errors.length,
  });
}

// CLI interface
function parseArgs(args: string[]): { brand?: Brand; limit?: number } {
  const result: { brand?: Brand; limit?: number } = {};

  const brandIndex = args.indexOf("--brand");
  if (brandIndex !== -1 && args[brandIndex + 1]) {
    const brandValue = args[brandIndex + 1].toLowerCase();
    if (brandValue === "bridgestone" || brandValue === "firestone") {
      result.brand = brandValue as Brand;
    }
  }

  const limitIndex = args.indexOf("--limit");
  if (limitIndex !== -1 && args[limitIndex + 1]) {
    result.limit = parseInt(args[limitIndex + 1], 10);
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  const { brand, limit } = parseArgs(args);

  switch (command) {
    case "run-full":
      await runWeeklyAutomation();
      break;

    case "scrape":
      console.log(`Running scrape${brand ? ` for ${brand}` : " for all brands"}...`);
      resetStats();
      await runScrapePipeline(brand);
      console.log(`Found ${stats.tyresProcessed} tires`);
      break;

    case "generate":
      console.log(`Running content generation${brand ? ` for ${brand}` : ""}${limit ? ` (limit: ${limit})` : ""}...`);
      resetStats();
      await runContentGeneration(brand, limit);
      break;

    case "publish":
      console.log(`Running publish${brand ? ` for ${brand}` : ""}...`);
      resetStats();
      await runPublishPipeline(brand);
      break;

    case "test-telegram":
      console.log("Testing Telegram notification...");
      await notifyWeeklySummary({
        tyresProcessed: 10,
        tyresNew: 2,
        articlesGenerated: 1,
        badgesAssigned: 5,
        errors: 0,
      });
      console.log("Test notification sent!");
      break;

    case "help":
    default:
      console.log(`
Content Automation CLI

Usage:
  npx tsx src/scheduler.ts <command> [options]

Commands:
  run-full       Run complete weekly automation
  scrape         Only run scrapers
  generate       Only generate content
  publish        Only publish to Payload CMS
  test-telegram  Send test Telegram notification
  help           Show this help

Options:
  --brand <brand>   Filter by brand (bridgestone or firestone)
  --limit <n>       Limit number of items to process

Examples:
  npx tsx src/scheduler.ts scrape --brand firestone
  npx tsx src/scheduler.ts generate --brand firestone --limit 5
  npx tsx src/scheduler.ts scrape --brand bridgestone

Environment:
  ANTHROPIC_API_KEY   Required for content generation
  PAYLOAD_URL         Payload CMS URL (default: http://localhost:3001)
  TELEGRAM_BOT_TOKEN  Required for notifications
  TELEGRAM_CHAT_ID    Required for notifications
      `);
  }
}

main();
