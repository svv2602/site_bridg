import type { Endpoint } from 'payload';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { saveJob, updateJob, getJob, findActiveByTarget, countActiveJobs, type JobStatus } from './jobStore';
import { generatePromptByType, type ImageType } from '../../content-automation/src/config/image-prompts';
import { requireRoleForEndpoint } from '../lib/rbac';

const execAsync = promisify(exec);

/**
 * Per-user rate limiting for image regeneration.
 * Tracks timestamps of regeneration requests per user.
 * Max 10 regenerations per hour per user to prevent API key abuse.
 */
const IMAGE_REGEN_RATE_LIMIT = 10;
const IMAGE_REGEN_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const userRegenTimestamps: Map<string, number[]> = new Map();

function checkUserRateLimit(userId: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const cutoff = now - IMAGE_REGEN_WINDOW_MS;

  // Get and clean old timestamps
  let timestamps = userRegenTimestamps.get(userId) || [];
  timestamps = timestamps.filter((ts) => ts > cutoff);
  userRegenTimestamps.set(userId, timestamps);

  if (timestamps.length >= IMAGE_REGEN_RATE_LIMIT) {
    // Calculate when the oldest timestamp will expire
    const oldestInWindow = timestamps[0];
    const retryAfterSeconds = Math.ceil((oldestInWindow + IMAGE_REGEN_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // Record this request
  timestamps.push(now);
  return { allowed: true };
}

/**
 * POST /api/media/regenerate/:id
 *
 * Regenerate image using AI and replace existing media.
 * Body:
 *   - prompt: Custom prompt (optional, uses generationPrompt from media if not provided)
 *   - type: Image type (hero, content, product, lifestyle)
 *   - season: Season for hero/lifestyle (summer, winter, allseason)
 *   - size: Image size (1024x1024, 1792x1024, 1024x1792)
 *   - topic: Topic for default prompt generation
 */
export const regenerateImageEndpoint: Endpoint = {
  path: '/image-regeneration/:id',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: image regeneration requires editor or admin role
    const forbidden = requireRoleForEndpoint(req.user, 'editor');
    if (forbidden) return forbidden;

    // Per-user rate limiting: max 10 regenerations per hour
    const userId = String(req.user.id || 'unknown');
    const rateCheck = checkUserRateLimit(userId);
    if (!rateCheck.allowed) {
      return Response.json(
        { error: `Rate limit exceeded. Maximum ${IMAGE_REGEN_RATE_LIMIT} regenerations per hour.` },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSeconds || 60) },
        }
      );
    }

    const mediaId = parseInt((req.routeParams?.id as string) || '0', 10);
    if (!mediaId) {
      return Response.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Get existing media
    const existingMedia = await req.payload.findByID({
      collection: 'media',
      id: mediaId,
    });

    if (!existingMedia) {
      return Response.json({ error: 'Media not found' }, { status: 404 });
    }

    // Parse request body
    let body: {
      prompt?: string;
      type?: string;
      season?: string;
      size?: string;
      topic?: string;
    } = {};

    try {
      body = await req.json?.() || {};
    } catch {
      // No body or invalid JSON
    }

    const prompt = body.prompt || (existingMedia.generationPrompt as string);
    const type = body.type || (existingMedia.generationType as string) || 'content';
    const season = body.season || (existingMedia.generationSeason as string);
    const size = body.size || (existingMedia.generationSize as string) || '1024x1024';
    const topic = body.topic || 'automotive tires';

    if (!prompt) {
      return Response.json({
        error: 'Prompt is required. Either provide prompt in body or save generationPrompt in media first.'
      }, { status: 400 });
    }

    // Concurrency check: prevent duplicate jobs for the same media
    const existingJob = findActiveByTarget('image', mediaId);
    if (existingJob) {
      return Response.json({
        message: 'Image regeneration already running for this media',
        jobId: existingJob.id,
        checkStatus: `/api/media/regenerate-status/${existingJob.id}`,
      });
    }

    // Rate limit: max 5 concurrent AI jobs
    if (countActiveJobs() >= 5) {
      return Response.json(
        { error: 'Too many concurrent jobs. Please wait and try again.' },
        { status: 429 }
      );
    }

    // Create job in unified store
    const jobId = `img-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      type: 'image',
      status: 'running',
      startedAt: new Date().toISOString(),
      command: `regenerate-image --id=${mediaId}`,
      targetId: mediaId,
    };
    saveJob(job);

    req.payload.logger.info(`Starting image regeneration: ${jobId} for media ${mediaId}`);

    // Build command for regenerate-image.ts
    const projectDir = process.cwd();
    const automationDir = path.join(projectDir, 'content-automation');

    // Escape prompt for shell
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, ' ');

    let command = `npx tsx src/regenerate-image.ts --id=${mediaId} --prompt="${escapedPrompt}"`;
    if (type) command += ` --type=${type}`;
    if (season) command += ` --season=${season}`;
    if (size) command += ` --size=${size}`;

    // Run in background
    execAsync(command, {
      cwd: automationDir,
      timeout: 300000, // 5 minutes
      env: { ...process.env },
    })
      .then(async ({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();

        // Try to extract new media ID from output
        const newIdMatch = stdout.match(/Uploaded new media ID: (\d+)/);
        if (newIdMatch) {
          job.newMediaId = parseInt(newIdMatch[1], 10);
        }

        job.output = stdout.slice(0, 2000);
        updateJob(job);

        // Update media with generation metadata
        try {
          const updateId = job.newMediaId || mediaId;
          await req.payload.update({
            collection: 'media',
            id: updateId,
            data: {
              generationPrompt: prompt,
              generationType: type as 'hero' | 'content' | 'product' | 'lifestyle',
              generationSeason: (season || null) as 'summer' | 'winter' | 'allseason' | null,
              generationSize: size as '1024x1024' | '1792x1024' | '1024x1792',
            },
          });
        } catch (err) {
          req.payload.logger.error(`Failed to update generation metadata: ${err}`);
        }

        req.payload.logger.info(`Image regeneration completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message || String(error);
        updateJob(job);
        req.payload.logger.error(`Image regeneration failed: ${jobId} - ${job.error}`);
      });

    return Response.json({
      message: 'Image regeneration started',
      jobId,
      checkStatus: `/api/media/regenerate-status/${jobId}`,
    });
  },
};

/**
 * GET /api/media/regenerate/status/:jobId
 *
 * Get status of image regeneration job.
 */
export const regenerateImageStatusEndpoint: Endpoint = {
  path: '/image-regeneration/status/:jobId',
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
 * GET /api/media/regenerate/prompt
 *
 * Generate default prompt based on type, season, and topic.
 * Query params:
 *   - type: Image type (hero, content, product, lifestyle)
 *   - season: Season (summer, winter, allseason)
 *   - topic: Topic for the prompt
 */
export const generatePromptEndpoint: Endpoint = {
  path: '/image-regeneration/prompt',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const type = url.searchParams.get('type') || 'content';
    const season = url.searchParams.get('season') || undefined;
    const topic = url.searchParams.get('topic') || 'automotive tires';

    const prompt = generateDefaultPrompt(type, topic, season);

    return Response.json({ prompt, type, season, topic });
  },
};

/**
 * Generate default prompt based on type and season.
 * Delegates to shared image-prompts module.
 */
function generateDefaultPrompt(type: string, topic: string, season?: string): string {
  return generatePromptByType(type as ImageType, topic, { season });
}
