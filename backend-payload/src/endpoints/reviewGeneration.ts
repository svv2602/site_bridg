import type { Endpoint } from 'payload';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Store for background job status
interface ReviewJobStatus {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  tyreId: number;
  tyreName?: string;
  count: number;
  createdReviewIds?: number[];
  error?: string;
}

const reviewJobs: Map<string, ReviewJobStatus> = new Map();

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
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tyreId = parseInt((req.routeParams?.tyreId as string) || '0', 10);
    if (!tyreId) {
      return Response.json({ error: 'Tyre ID is required' }, { status: 400 });
    }

    // Get tyre info
    const tyre = await req.payload.findByID({
      collection: 'tyres',
      id: tyreId,
    });

    if (!tyre) {
      return Response.json({ error: 'Tyre not found' }, { status: 404 });
    }

    // Parse request body
    let body: { count?: number } = {};
    try {
      body = await req.json?.() || {};
    } catch {
      // No body or invalid JSON
    }

    const count = Math.min(Math.max(body.count || 3, 1), 10);

    // Create job
    const jobId = `review-${Date.now()}`;
    const job: ReviewJobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      tyreId,
      tyreName: tyre.name as string,
      count,
    };
    reviewJobs.set(jobId, job);

    req.payload.logger.info(`Starting review generation: ${jobId} for tyre ${tyreId} (${tyre.name}), count: ${count}`);

    // Build command for generate-reviews.ts
    const projectDir = process.cwd();
    const automationDir = path.join(projectDir, 'content-automation');

    const command = `npx tsx src/generate-reviews.ts --tyreId=${tyreId} --count=${count}`;

    // Run in background
    execAsync(command, {
      cwd: automationDir,
      timeout: 300000, // 5 minutes
      env: { ...process.env },
    })
      .then(async ({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();

        // Try to extract created review IDs from output
        const idsMatch = stdout.match(/Created review IDs: \[([\d,\s]+)\]/);
        if (idsMatch) {
          job.createdReviewIds = idsMatch[1].split(',').map(id => parseInt(id.trim(), 10));
        }

        req.payload.logger.info(`Review generation completed: ${jobId}, created ${job.createdReviewIds?.length || 0} reviews`);

        if (stderr) {
          req.payload.logger.warn(`Review generation stderr: ${stderr}`);
        }
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message || String(error);
        req.payload.logger.error(`Review generation failed: ${jobId} - ${job.error}`);
      });

    return Response.json({
      message: 'Review generation started',
      jobId,
      tyreId,
      tyreName: tyre.name,
      count,
      checkStatus: `/api/reviews/generate/status/${jobId}`,
    });
  },
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

    const job = reviewJobs.get(jobId);
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
