import type { Endpoint } from 'payload';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { getJob } from './jobStore';
import { createBackgroundJobHandler } from './createBackgroundJob';

const execAsync = promisify(exec);

/** Parsed input for review generation */
interface ReviewGenerationInput {
  tyreId: number;
  tyreName: string;
  count: number;
}

/**
 * POST /api/reviews/generate/:tyreId
 *
 * Generate reviews for a specific tyre using AI.
 * Body:
 *   - count: Number of reviews to generate (default: 3, max: 10)
 */
export const generateReviewsEndpoint: Endpoint = {
  path: '/reviews/generate/:tyreId',
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

    statusPath: (jobId) => `/api/reviews/generate/status/${jobId}`,
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
 * GET /api/reviews/generate/status/:jobId
 *
 * Get status of review generation job.
 */
export const generateReviewsStatusEndpoint: Endpoint = {
  path: '/reviews/generate/status/:jobId',
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
 * GET /api/reviews/stats/:tyreId
 *
 * Get review statistics for a tyre.
 */
export const reviewStatsEndpoint: Endpoint = {
  path: '/reviews/stats/:tyreId',
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
