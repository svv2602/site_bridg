/**
 * Hero Image Batch Regeneration Endpoints
 *
 * POST /api/image-regeneration/batch-heroes — start batch regeneration job
 * GET  /api/image-regeneration/batch-heroes/list — list articles for selection
 */

import type { Endpoint, PayloadRequest } from 'payload';
import { createBackgroundJobHandler } from './createBackgroundJob';
import { apiResponse, apiError } from './api-response';
import { requireRoleForEndpoint } from '../lib/rbac';

// Dynamic imports for content-automation modules (ESM)
// webpackIgnore prevents Next.js build from tracing into content-automation's
// .js imports which only resolve at runtime via tsx
async function getArticleImages() {
  const mod = await import(/* webpackIgnore: true */ '../../content-automation/src/processors/content/article-images');
  return mod;
}

async function getPayloadClientModule() {
  const mod = await import(/* webpackIgnore: true */ '../../content-automation/src/publishers/payload-client');
  return mod;
}

/**
 * Infer articleType from article tags.
 */
function inferArticleType(tags: Array<{ tag: string }> | undefined): string {
  if (!tags || tags.length === 0) return 'seasonal-guide';

  const joined = tags.map((t) => t.tag.toLowerCase()).join(' ');

  if (joined.includes('тест')) return 'test-summary';
  if (joined.includes('порівняння')) return 'comparison';
  if (joined.includes('сезон') || joined.includes('зимов') || joined.includes('літн') || joined.includes('всесезон')) return 'seasonal-guide';
  if (joined.includes('огляд')) return 'model-review';
  if (joined.includes('технолог')) return 'technology';
  if (joined.includes('порад')) return 'tips';

  return 'seasonal-guide';
}

/**
 * Infer season from article tags.
 */
function inferSeason(tags: Array<{ tag: string }> | undefined): 'summer' | 'winter' | 'allseason' {
  if (!tags || tags.length === 0) return 'allseason';

  const joined = tags.map((t) => t.tag.toLowerCase()).join(' ');

  if (joined.includes('зимов') || joined.includes('зима') || joined.includes('зимн')) return 'winter';
  if (joined.includes('літн') || joined.includes('літо')) return 'summer';

  return 'allseason';
}

interface BatchHeroesInput {
  articleIds: number[];
}

/**
 * POST /api/image-regeneration/batch-heroes
 *
 * Start batch hero image regeneration for selected articles.
 * Body: { articleIds: number[] }
 */
export const batchHeroesEndpoint: Endpoint = {
  path: '/image-regeneration/batch-heroes',
  method: 'post',
  handler: createBackgroundJobHandler<BatchHeroesInput>({
    type: 'image',
    jobPrefix: 'batch-heroes',
    minRole: 'editor',
    maxConcurrentJobs: 3,

    parseInput: async (req: PayloadRequest) => {
      const body = await req.json?.();
      if (!body?.articleIds || !Array.isArray(body.articleIds)) {
        throw new Error('articleIds array is required');
      }
      if (body.articleIds.length === 0) {
        throw new Error('At least one article must be selected');
      }
      if (body.articleIds.length > 20) {
        throw new Error('Maximum 20 articles per batch');
      }
      // Validate all IDs are numbers
      const ids = body.articleIds.map((id: unknown) => {
        const num = Number(id);
        if (isNaN(num) || num <= 0) throw new Error(`Invalid article ID: ${id}`);
        return num;
      });
      return { articleIds: ids };
    },

    buildCommand: (input) => `batch-heroes --count=${input.articleIds.length}`,

    concurrencyKey: () => ({ targetName: 'batch-heroes' }),

    buildJobExtras: (input) => ({
      totalSteps: input.articleIds.length,
      currentStep: 0,
      stepLabel: 'Підготовка...',
      count: input.articleIds.length,
    }),

    responseMessage: 'Batch hero image regeneration started',

    execute: async (input, ctx) => {
      const { generateHeroImage } = await getArticleImages();
      const { getPayloadClient } = await getPayloadClientModule();
      const client = getPayloadClient();
      await client.authenticate();

      const results: Array<{ articleId: number; success: boolean; error?: string }> = [];
      let successCount = 0;

      for (let i = 0; i < input.articleIds.length; i++) {
        const articleId = input.articleIds[i];

        // Update progress
        ctx.job.currentStep = i + 1;
        ctx.job.stepLabel = `Зображення ${i + 1}/${input.articleIds.length}`;

        try {
          // Fetch article
          const article = await ctx.payload.findByID({
            collection: 'articles',
            id: articleId,
            depth: 1,
          });

          if (!article) {
            results.push({ articleId, success: false, error: 'Article not found' });
            continue;
          }

          const tags = article.tags as Array<{ tag: string }> | undefined;
          const articleType = inferArticleType(tags);
          const season = inferSeason(tags);

          ctx.job.stepLabel = `${i + 1}/${input.articleIds.length}: ${(article.title as string).slice(0, 40)}...`;

          // Generate new hero image
          const heroImage = await generateHeroImage(article.title as string, season, { articleType });

          if (!heroImage.url) {
            results.push({ articleId, success: false, error: 'Image generation returned no URL' });
            continue;
          }

          // Upload to CMS
          const slug = article.slug as string;
          const filename = `hero-${slug}-${Date.now()}.png`;
          const uploaded = await client.uploadImageFromUrl(heroImage.url, {
            alt: heroImage.alt || `Hero: ${article.title}`,
            filename,
            force: true,
          });

          if (!uploaded) {
            results.push({ articleId, success: false, error: 'Failed to upload image' });
            continue;
          }

          // Update article's image field
          await ctx.payload.update({
            collection: 'articles',
            id: articleId,
            data: { image: uploaded.id },
          });

          results.push({ articleId, success: true });
          successCount++;

          ctx.payload.logger.info(`[batch-heroes] Updated article ${articleId} with new hero image ${uploaded.id}`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          results.push({ articleId, success: false, error: message });
          ctx.payload.logger.error(`[batch-heroes] Failed for article ${articleId}: ${message}`);
        }
      }

      const failCount = results.filter((r) => !r.success).length;

      return {
        output: JSON.stringify({
          success: successCount,
          failed: failCount,
          results,
        }),
        resultIds: results.filter((r) => r.success).map((r) => r.articleId),
      };
    },
  }),
};

/**
 * GET /api/image-regeneration/batch-heroes/list
 *
 * List articles for hero image regeneration selection.
 * Returns: { articles: Array<{ id, title, slug, hasImage, imageUrl?, tags? }> }
 */
export const batchHeroesListEndpoint: Endpoint = {
  path: '/image-regeneration/batch-heroes/list',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return apiError('Unauthorized', 401);
    }

    const forbidden = requireRoleForEndpoint(req.user, 'editor');
    if (forbidden) return forbidden;

    try {
      const result = await req.payload.find({
        collection: 'articles',
        depth: 1,
        limit: 200,
        sort: '-createdAt',
      });

      const articles = result.docs.map((doc) => {
        const imageField = doc.image as { id?: number; url?: string } | number | null;
        let hasImage = false;
        let imageUrl: string | undefined;

        if (imageField && typeof imageField === 'object') {
          hasImage = !!imageField.url;
          imageUrl = imageField.url || undefined;
        } else if (typeof imageField === 'number') {
          hasImage = true;
        }

        return {
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          hasImage,
          imageUrl,
          tags: (doc.tags as Array<{ tag: string }> | undefined)?.map((t) => t.tag) || [],
        };
      });

      return apiResponse({ articles });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return apiError(message, 500);
    }
  },
};
