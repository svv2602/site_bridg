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
import { scrapeProkoleso } from "./scrapers/prokoleso.js";
import { generateTireContent } from "./processors/tire-description-generator.js";
import { getPayloadClient } from "./publishers/payload-client.js";
import { notifyWeeklySummary, notifyError } from "./publishers/telegram-bot.js";
import { markdownToLexical } from "./utils/markdown-to-lexical.js";
import { markdownToHtml } from "./utils/markdown-to-html.js";

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
async function runScrapePipeline() {
  try {
    const tires = await scrapeProkoleso();
    stats.tyresProcessed = tires.length;
    console.log(`Found ${tires.length} tires`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    stats.errors.push(`Scrape failed: ${errorMessage}`);
    console.error("Scrape error:", errorMessage);
  }
}

/**
 * Content generation pipeline
 */
async function runContentGeneration() {
  try {
    // Read scraped data
    const fs = await import("fs/promises");
    const dataPath = new URL("../data/prokoleso-tires.json", import.meta.url);

    let tires: any[];
    try {
      const data = await fs.readFile(dataPath, "utf-8");
      tires = JSON.parse(data);
    } catch {
      console.log("No scraped data found. Run 'scrape' first.");
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

    // Process up to 3 tires (to avoid high costs during testing)
    const batchSize = Math.min(tiresToProcess.length, 3);
    console.log(`Processing ${batchSize} tires...`);

    for (let i = 0; i < batchSize; i++) {
      const tire = tiresToProcess[i];
      console.log(`\n[${i + 1}/${batchSize}] Generating content for: ${tire.name}`);

      const result = await generateTireContent({
        name: tire.name,
        slug: tire.canonicalSlug || tire.sourceSlug,
        season: tire.season,
        euLabel: tire.euLabel,
        sourceDescription: tire.description,
      });

      if (result.success && result.content) {
        console.log(`  ✓ Generated: ${result.content.shortDescription.substring(0, 60)}...`);

        // Mark as processed and store generated content
        tire.aiGenerated = true;
        tire.generatedContent = result.content;
        stats.tyresNew++;
      } else {
        console.log(`  ✗ Failed: ${result.error}`);
        stats.errors.push(`${tire.name}: ${result.error}`);
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
 */
async function runPublishPipeline() {
  try {
    const fs = await import("fs/promises");
    const dataPath = new URL("../data/prokoleso-tires.json", import.meta.url);

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

    for (const tire of tiresToPublish) {
      const slug = tire.canonicalSlug || tire.sourceSlug;
      console.log(`\nPublishing: ${tire.name} (${slug})`);

      try {
        const content = tire.generatedContent;

        // Convert markdown fullDescription to Lexical and HTML
        const fullDescriptionLexical = markdownToLexical(content.fullDescription);
        const fullDescriptionHtml = markdownToHtml(content.fullDescription);

        // Convert keyBenefits array to Payload format
        const keyBenefits = content.keyBenefits.map((b: string) => ({
          benefit: b,
        }));

        // Truncate SEO fields to meet Payload limits
        const seoTitle = (content.seoTitle || "").substring(0, 70);
        const seoDescription = (content.seoDescription || "").substring(0, 170);

        // Find existing tyre or create new
        const existing = await client.findTyreBySlug(slug);

        if (existing) {
          // Update existing tyre with generated content
          await client.updateTyre(existing.id, {
            shortDescription: content.shortDescription,
            fullDescription: fullDescriptionLexical,
            fullDescriptionHtml,
            keyBenefits,
            seoTitle,
            seoDescription,
          });
          console.log(`  ✓ Updated tyre ID: ${existing.id}`);
        } else {
          // Create new tyre
          await client.createTyre({
            name: tire.name,
            slug,
            season: tire.season || "summer",
            vehicleTypes: ["passenger"],
            shortDescription: content.shortDescription,
            fullDescription: fullDescriptionLexical,
            fullDescriptionHtml,
            keyBenefits,
            seoTitle,
            seoDescription,
            euLabel: tire.euLabel,
          });
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
    console.log(`\nPublished ${published}/${tiresToPublish.length} tires`);
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
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  switch (command) {
    case "run-full":
      await runWeeklyAutomation();
      break;

    case "scrape":
      console.log("Running scrape only...");
      resetStats();
      await runScrapePipeline();
      console.log(`Found ${stats.tyresProcessed} tires`);
      break;

    case "generate":
      console.log("Running content generation only...");
      resetStats();
      await runContentGeneration();
      break;

    case "publish":
      console.log("Running publish only...");
      resetStats();
      await runPublishPipeline();
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
  npx tsx src/scheduler.ts <command>

Commands:
  run-full       Run complete weekly automation
  scrape         Only run scrapers
  generate       Only generate content
  publish        Only publish to Payload CMS
  test-telegram  Send test Telegram notification
  help           Show this help

Environment:
  ANTHROPIC_API_KEY   Required for content generation
  PAYLOAD_URL         Payload CMS URL (default: http://localhost:3001)
  TELEGRAM_BOT_TOKEN  Required for notifications
  TELEGRAM_CHAT_ID    Required for notifications
      `);
  }
}

main();
