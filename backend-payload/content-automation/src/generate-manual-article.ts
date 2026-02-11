/**
 * Manual Article Generation CLI
 *
 * Thin entry point that creates a queue item and processes it.
 * Called by the backend endpoint via execAsync.
 *
 * Usage:
 *   npx tsx src/generate-manual-article.ts '<JSON params>'
 *
 * Input JSON:
 *   { topic, articleType, keywords?, relatedTyres?, brand? }
 *
 * Output JSON (to stdout):
 *   { success, payloadId?, articleTitle?, articleSlug?, queueItemId?, error? }
 */

import {
  addToQueue,
  type ArticleType,
} from "./db/article-queue.js";
import { processSingleQueueItem } from "./article-pipeline.js";

interface ManualArticleInput {
  topic: string;
  articleType: ArticleType;
  keywords?: string[];
  relatedTyres?: string[];
  brand?: "bridgestone" | "firestone";
}

async function main() {
  const jsonArg = process.argv[2];
  if (!jsonArg) {
    console.log(JSON.stringify({ success: false, error: "No input provided" }));
    process.exit(1);
  }

  let input: ManualArticleInput;
  try {
    input = JSON.parse(jsonArg);
  } catch {
    console.log(JSON.stringify({ success: false, error: "Invalid JSON input" }));
    process.exit(1);
  }

  // Validate required fields
  if (!input.topic || !input.articleType) {
    console.log(JSON.stringify({ success: false, error: "topic and articleType are required" }));
    process.exit(1);
  }

  const validTypes: ArticleType[] = [
    "seasonal-guide", "model-review", "test-summary",
    "comparison", "technology", "tips",
  ];
  if (!validTypes.includes(input.articleType)) {
    console.log(JSON.stringify({ success: false, error: `Invalid articleType: ${input.articleType}` }));
    process.exit(1);
  }

  try {
    // Create queue entry
    const queueItemId = addToQueue({
      triggerType: "manual",
      triggerData: {
        ...(input.keywords?.length ? { keywords: input.keywords } : {}),
        ...(input.brand ? { brand: input.brand } : {}),
      },
      articleType: input.articleType,
      topic: input.topic,
      priority: 1, // High priority for manual items
      relatedTyres: input.relatedTyres,
    });

    console.error(`[Manual] Created queue item #${queueItemId}: "${input.topic}"`);

    // Process it immediately
    const result = await processSingleQueueItem(queueItemId);

    // Output JSON result to stdout
    console.log(JSON.stringify({
      ...result,
      queueItemId,
    }));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(JSON.stringify({ success: false, error: msg }));
    process.exit(1);
  }
}

main().catch((error) => {
  console.log(JSON.stringify({ success: false, error: String(error) }));
  process.exit(1);
});
