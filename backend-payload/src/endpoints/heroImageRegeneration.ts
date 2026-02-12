/**
 * Hero Image Batch Regeneration Endpoints
 *
 * POST /api/image-regeneration/batch-heroes — start batch regeneration job
 * GET  /api/image-regeneration/batch-heroes/list — list articles for selection
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import type { Endpoint, PayloadRequest } from 'payload';
import { createBackgroundJobHandler } from './createBackgroundJob';
import { apiResponse, apiError } from './api-response';
import { requireRoleForEndpoint } from '../lib/rbac';

const execAsync = promisify(exec);

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

    buildCommand: (input) => `batch-heroes --articleIds=${input.articleIds.join(',')}`,

    concurrencyKey: () => ({ targetName: 'batch-heroes' }),

    buildJobExtras: (input) => ({
      totalSteps: input.articleIds.length,
      currentStep: 0,
      stepLabel: 'Підготовка...',
      count: input.articleIds.length,
    }),

    responseMessage: 'Batch hero image regeneration started',

    execute: async (input, ctx) => {
      const automationDir = path.join(process.cwd(), 'content-automation');
      const idsArg = input.articleIds.join(',');
      const command = `npx tsx src/batch-hero-regen.ts --articleIds=${idsArg}`;

      ctx.payload.logger.info(`[batch-heroes] Running: ${command}`);

      const { stdout, stderr } = await execAsync(command, {
        cwd: automationDir,
        timeout: 600000, // 10 minutes
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env },
      });

      if (stderr) {
        ctx.payload.logger.info(`[batch-heroes] stderr: ${stderr.slice(0, 2000)}`);
      }

      // Parse JSON result from stdout (last non-empty line)
      let result = { success: 0, failed: 0, results: [] as Array<{ articleId: number; success: boolean }> };
      try {
        const lines = stdout.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        result = JSON.parse(lastLine);
      } catch {
        ctx.payload.logger.warn(`[batch-heroes] Could not parse stdout as JSON: ${stdout.slice(0, 500)}`);
      }

      return {
        output: JSON.stringify(result),
        resultIds: result.results?.filter((r) => r.success).map((r) => r.articleId),
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
