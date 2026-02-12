/**
 * Batch Hero Image Regeneration CLI
 *
 * Usage: npx tsx src/batch-hero-regen.ts --articleIds=1,2,3
 *
 * Generates hero images for specified articles and uploads them to CMS.
 * Outputs JSON result to stdout.
 */

import { generateHeroImage } from "./processors/content/article-images.js";
import { getPayloadClient } from "./publishers/payload-client.js";

interface ArticleResult {
  articleId: number;
  success: boolean;
  error?: string;
}

function inferArticleType(tags: Array<{ tag: string }> | undefined): string {
  if (!tags || tags.length === 0) return "seasonal-guide";
  const joined = tags.map((t) => t.tag.toLowerCase()).join(" ");
  if (joined.includes("тест")) return "test-summary";
  if (joined.includes("порівняння")) return "comparison";
  if (joined.includes("сезон") || joined.includes("зимов") || joined.includes("літн") || joined.includes("всесезон")) return "seasonal-guide";
  if (joined.includes("огляд")) return "model-review";
  if (joined.includes("технолог")) return "technology";
  if (joined.includes("порад")) return "tips";
  return "seasonal-guide";
}

function inferSeason(tags: Array<{ tag: string }> | undefined): "summer" | "winter" | "allseason" {
  if (!tags || tags.length === 0) return "allseason";
  const joined = tags.map((t) => t.tag.toLowerCase()).join(" ");
  if (joined.includes("зимов") || joined.includes("зима") || joined.includes("зимн")) return "winter";
  if (joined.includes("літн") || joined.includes("літо")) return "summer";
  return "allseason";
}

async function main() {
  const args = process.argv.slice(2);
  const idsArg = args.find((a) => a.startsWith("--articleIds="));
  if (!idsArg) {
    console.error("Usage: npx tsx src/batch-hero-regen.ts --articleIds=1,2,3");
    process.exit(1);
  }

  const articleIds = idsArg
    .replace("--articleIds=", "")
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id) && id > 0);

  if (articleIds.length === 0) {
    console.error("No valid article IDs provided");
    process.exit(1);
  }

  const client = getPayloadClient();
  await client.authenticate();

  const results: ArticleResult[] = [];
  let successCount = 0;

  for (let i = 0; i < articleIds.length; i++) {
    const articleId = articleIds[i];
    console.error(`[${i + 1}/${articleIds.length}] Processing article ${articleId}...`);

    try {
      // Fetch article via REST API
      const article = await client.getArticleById(articleId);
      if (!article) {
        results.push({ articleId, success: false, error: "Article not found" });
        continue;
      }

      const tags = article.tags as Array<{ tag: string }> | undefined;
      const articleType = inferArticleType(tags);
      const season = inferSeason(tags);
      const title = article.title as string;
      const slug = article.slug as string;

      console.error(`  Title: ${title.slice(0, 60)}...`);
      console.error(`  Type: ${articleType}, Season: ${season}`);

      // Generate new hero image
      const heroImage = await generateHeroImage(title, season, { articleType });

      if (!heroImage.url) {
        results.push({ articleId, success: false, error: "Image generation returned no URL" });
        continue;
      }

      // Upload to CMS
      const filename = `hero-${slug}-${Date.now()}.png`;
      const uploaded = await client.uploadImageFromUrl(heroImage.url, {
        alt: heroImage.alt || `Hero: ${title}`,
        filename,
        force: true,
      });

      if (!uploaded) {
        results.push({ articleId, success: false, error: "Failed to upload image" });
        continue;
      }

      // Update article's image field
      await client.updateArticle(String(articleId), { image: uploaded.id } as any);

      results.push({ articleId, success: true });
      successCount++;
      console.error(`  ✓ Updated article ${articleId} with new hero image ${uploaded.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ articleId, success: false, error: message });
      console.error(`  ✗ Failed: ${message}`);
    }
  }

  const failCount = results.filter((r) => !r.success).length;

  // Output JSON result to stdout
  const output = { success: successCount, failed: failCount, results };
  console.log(JSON.stringify(output));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
