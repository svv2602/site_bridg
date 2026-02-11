import type { Endpoint } from 'payload';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { getJob, updateJob } from './jobStore';
import { createBackgroundJobHandler } from './createBackgroundJob';
import { apiResponse, apiError } from './api-response';
import { requireRoleForEndpoint } from '../lib/rbac';

const execAsync = promisify(exec);

/** Parsed input for review generation */
interface ReviewGenerationInput {
  tyreId: number;
  tyreName: string;
  count: number;
}

/**
 * POST /api/review-ops/generate/:tyreId
 *
 * Generate reviews for a specific tyre using AI.
 * Body:
 *   - count: Number of reviews to generate (default: 3, max: 10)
 */
export const generateReviewsEndpoint: Endpoint = {
  path: '/review-ops/generate/:tyreId',
  method: 'post',
  handler: createBackgroundJobHandler<ReviewGenerationInput>({
    type: 'review',
    jobPrefix: 'review',
    minRole: 'editor',
    maxConcurrentJobs: 5,

    parseInput: async (req) => {
      const tyreId = parseInt((req.routeParams?.tyreId as string) || '0', 10);
      if (!tyreId) {
        throw new Error('Tyre ID is required');
      }

      // Get tyre info
      const tyre = await req.payload.findByID({
        collection: 'tyres',
        id: tyreId,
      });

      if (!tyre) {
        throw new Error('Tyre not found');
      }

      // Parse request body
      let body: { count?: number } = {};
      try {
        body = await req.json?.() || {};
      } catch {
        // No body or invalid JSON
      }

      const count = Math.min(Math.max(body.count || 3, 1), 10);

      return { tyreId, tyreName: tyre.name as string, count };
    },

    buildCommand: (input) =>
      `generate-reviews --tyreId=${input.tyreId} --count=${input.count}`,

    concurrencyKey: (input) => ({
      targetId: input.tyreId,
    }),

    buildJobExtras: (input) => ({
      targetId: input.tyreId,
      targetName: input.tyreName,
      count: input.count,
    }),

    statusPath: (jobId) => `/api/review-ops/generate/status/${jobId}`,
    responseMessage: 'Review generation started',

    execute: async (input, ctx) => {
      const projectDir = process.cwd();
      const automationDir = path.join(projectDir, 'content-automation');

      const command = `npx tsx src/generate-reviews.ts --tyreId=${input.tyreId} --count=${input.count}`;

      const { stdout, stderr } = await execAsync(command, {
        cwd: automationDir,
        timeout: 300000, // 5 minutes
        env: { ...process.env },
      });

      if (stderr) {
        ctx.payload.logger.warn(`Review generation stderr: ${stderr}`);
      }

      // Try to extract created review IDs from output
      let resultIds: number[] | undefined;
      const idsMatch = stdout.match(/Created review IDs: \[([\d,\s]+)\]/);
      if (idsMatch) {
        resultIds = idsMatch[1].split(',').map(id => parseInt(id.trim(), 10));
      }

      ctx.payload.logger.info(
        `Review generation completed: ${ctx.jobId}, created ${resultIds?.length || 0} reviews`,
      );

      return { output: stdout, resultIds };
    },
  }),
};

/**
 * GET /api/review-ops/generate/status/:jobId
 *
 * Get status of review generation job.
 */
export const generateReviewsStatusEndpoint: Endpoint = {
  path: '/review-ops/generate/status/:jobId',
  method: 'get',
  handler: async (req) => {
    const jobId = req.routeParams?.jobId as string;
    if (!jobId) {
      return Response.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const job = getJob(jobId);
    if (!job) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    return Response.json(job);
  },
};

/**
 * GET /api/review-ops/stats/:tyreId
 *
 * Get review statistics for a tyre.
 */
export const reviewStatsEndpoint: Endpoint = {
  path: '/review-ops/stats/:tyreId',
  method: 'get',
  handler: async (req) => {
    const tyreId = parseInt((req.routeParams?.tyreId as string) || '0', 10);
    if (!tyreId) {
      return Response.json({ error: 'Tyre ID is required' }, { status: 400 });
    }

    const reviews = await req.payload.find({
      collection: 'reviews',
      where: {
        tyre: { equals: tyreId },
      },
      limit: 0, // Just get count
    });

    const publishedReviews = await req.payload.find({
      collection: 'reviews',
      where: {
        and: [
          { tyre: { equals: tyreId } },
          { isPublished: { equals: true } },
        ],
      },
      limit: 100,
    });

    // Calculate average rating
    let averageRating = 0;
    if (publishedReviews.docs.length > 0) {
      const sum = publishedReviews.docs.reduce((acc, r) => acc + ((r.rating as number) || 0), 0);
      averageRating = Math.round((sum / publishedReviews.docs.length) * 10) / 10;
    }

    return Response.json({
      tyreId,
      totalCount: reviews.totalDocs,
      publishedCount: publishedReviews.totalDocs,
      averageRating,
    });
  },
};

// ============================================================
// Bulk review generation endpoints
// ============================================================

/** Parsed input for batch review generation */
interface BatchReviewInput {
  items: Array<{ tyreId: number; count: number }>;
}

/**
 * POST /api/review-ops/generate/batch
 *
 * Batch generate reviews for multiple tyres.
 * Body:
 *   - items: Array of { tyreId, count? }
 *   - defaultCount: Default number of reviews per tyre (default: 3, max: 10)
 */
export const generateReviewsBatchEndpoint: Endpoint = {
  path: '/review-ops/generate/batch',
  method: 'post',
  handler: createBackgroundJobHandler<BatchReviewInput>({
    type: 'review',
    jobPrefix: 'review-batch',
    minRole: 'editor',
    maxConcurrentJobs: 3,

    parseInput: async (req) => {
      let body: { items?: Array<{ tyreId: number; count?: number }>; defaultCount?: number } = {};
      try {
        body = await req.json?.() || {};
      } catch (e) {
        // req.json() may fail if body already consumed — try text fallback
        try {
          const text = await req.text?.();
          if (text) body = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON body: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        throw new Error('items array is required and must not be empty');
      }

      if (body.items.length > 100) {
        throw new Error('Maximum 100 tyres per batch');
      }

      const defaultCount = Math.min(Math.max(body.defaultCount || 3, 1), 10);

      const items = body.items.map((item) => ({
        tyreId: item.tyreId,
        count: Math.min(Math.max(item.count || defaultCount, 1), 10),
      }));

      // Validate all tyreIds are positive integers
      for (const item of items) {
        if (!Number.isInteger(item.tyreId) || item.tyreId <= 0) {
          throw new Error(`Invalid tyre ID: ${item.tyreId}`);
        }
      }

      return { items };
    },

    buildCommand: (input) =>
      `generate-reviews --batch --count=${input.items.length}`,

    statusPath: (jobId) => `/api/review-ops/generate/batch/status/${jobId}`,
    responseMessage: 'Batch review generation started',

    execute: async (input, ctx) => {
      const { payload, job } = ctx;
      const { items } = input;
      const automationDir = path.join(process.cwd(), 'content-automation');

      const total = items.length;
      let completed = 0;
      let totalReviewsCreated = 0;
      let failed = 0;
      const allResultIds: number[] = [];
      const errors: Array<{ tyreId: number; error: string }> = [];

      job.totalSteps = total;
      job.currentStep = 0;
      job.stepLabel = `Підготовка (0/${total})`;
      updateJob(job);

      for (const item of items) {
        try {
          // Get tyre name for progress display
          let tyreName = `ID ${item.tyreId}`;
          try {
            const tyre = await payload.findByID({ collection: 'tyres', id: item.tyreId });
            if (tyre) tyreName = tyre.name as string;
          } catch {
            // Use ID as fallback
          }

          job.stepLabel = `${completed}/${total}: ${tyreName}`;
          updateJob(job);

          // Run CLI subprocess for each tyre
          const command = `npx tsx src/generate-reviews.ts --tyreId=${item.tyreId} --count=${item.count}`;
          const { stdout, stderr } = await execAsync(command, {
            cwd: automationDir,
            timeout: 300000,
            env: { ...process.env },
          });

          if (stderr) {
            payload.logger.warn(`Review generation stderr for tyre ${item.tyreId}: ${stderr}`);
          }

          // Extract created review IDs from CLI output
          const idsMatch = stdout.match(/Created review IDs: \[([\d,\s]+)\]/);
          if (idsMatch) {
            const ids = idsMatch[1].split(',').map((id: string) => parseInt(id.trim(), 10));
            allResultIds.push(...ids);
            totalReviewsCreated += ids.length;
          }

          // Extract count from "Created N reviews" pattern
          const countMatch = stdout.match(/Created (\d+) reviews in database/);
          if (countMatch && !idsMatch) {
            totalReviewsCreated += parseInt(countMatch[1], 10);
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          errors.push({ tyreId: item.tyreId, error: errMsg });
          failed++;
          payload.logger.error(`Batch review error for tyre ${item.tyreId}: ${errMsg}`);
        }

        completed++;
        job.currentStep = completed;
        job.stepLabel = `${completed}/${total} (${totalReviewsCreated} відгуків, ${failed} помилок)`;
        updateJob(job);

        // Small delay between tyres to avoid rate limits
        if (completed < total) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return {
        output: JSON.stringify({
          totalTyres: total,
          completedTyres: completed,
          failedTyres: failed,
          totalReviewsCreated,
          errors,
        }),
        resultIds: allResultIds,
      };
    },
  }),
};

/**
 * GET /api/review-ops/generate/batch/status/:jobId
 *
 * Get status of a batch review generation job.
 */
export const generateReviewsBatchStatusEndpoint: Endpoint = {
  path: '/review-ops/generate/batch/status/:jobId',
  method: 'get',
  handler: async (req) => {
    const jobId = req.routeParams?.jobId as string;
    if (!jobId) {
      return Response.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const job = getJob(jobId);
    if (!job) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    let progress: Record<string, unknown> | undefined;
    if (job.status === 'completed' && job.output) {
      try {
        progress = JSON.parse(job.output);
      } catch {
        // Not JSON
      }
    }

    return Response.json({
      ...job,
      ...(progress ? { progress } : {}),
    });
  },
};

/**
 * GET /api/review-ops/bulk-stats
 *
 * Get all tyres with their review counts and average ratings.
 * Used for the bulk review generation table.
 */
export const reviewBulkStatsEndpoint: Endpoint = {
  path: '/review-ops/bulk-stats',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return apiError('Unauthorized', 401);
    }

    const forbidden = requireRoleForEndpoint(req.user, 'editor');
    if (forbidden) return forbidden;

    try {
      // Get all tyres
      const tyres = await req.payload.find({
        collection: 'tyres',
        limit: 500,
        sort: 'name',
      });

      // Get all reviews grouped by tyre
      const reviews = await req.payload.find({
        collection: 'reviews',
        limit: 10000,
        depth: 0,
      });

      // Build stats map: tyreId -> { count, totalRating }
      const statsMap = new Map<number, { count: number; totalRating: number }>();
      for (const review of reviews.docs) {
        const tyreId = typeof review.tyre === 'number' ? review.tyre : (review.tyre as any)?.id;
        if (!tyreId) continue;
        const existing = statsMap.get(tyreId) || { count: 0, totalRating: 0 };
        existing.count++;
        existing.totalRating += (review.rating as number) || 0;
        statsMap.set(tyreId, existing);
      }

      const tyreStats = tyres.docs.map((tyre) => {
        const stats = statsMap.get(tyre.id) || { count: 0, totalRating: 0 };
        return {
          id: tyre.id,
          name: tyre.name,
          brand: tyre.brand,
          season: tyre.season,
          reviewCount: stats.count,
          averageRating: stats.count > 0
            ? Math.round((stats.totalRating / stats.count) * 10) / 10
            : 0,
        };
      });

      const totalTyres = tyreStats.length;
      const totalReviews = reviews.totalDocs;
      const tyresWithoutReviews = tyreStats.filter((t) => t.reviewCount === 0).length;

      return apiResponse({
        tyres: tyreStats,
        summary: {
          totalTyres,
          totalReviews,
          tyresWithoutReviews,
        },
      });
    } catch (error) {
      return apiError(`Failed to fetch bulk stats: ${error}`, 500);
    }
  },
};
