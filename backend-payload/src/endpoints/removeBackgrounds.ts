import type { Endpoint } from 'payload';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getRembgPath } from '../utils/rembg';
import { requireRoleForEndpoint } from '../lib/rbac';
import { createBackgroundJobHandler, type JobResult } from './createBackgroundJob';
import { getJob, updateJob } from './jobStore';

const execAsync = promisify(exec);

const REMBG_CLI = getRembgPath();

/**
 * Remove background from a single image file
 */
async function removeBackground(
  filePath: string,
  outputPath: string
): Promise<boolean> {
  try {
    const command = `"${REMBG_CLI}" i "${filePath}" "${outputPath}"`;
    await execAsync(command, { timeout: 120000 }); // 2 minute timeout
    await fs.access(outputPath);
    return true;
  } catch (error) {
    console.error(`Failed to remove background from ${filePath}:`, error);
    return false;
  }
}

/**
 * Check if rembg CLI is available on the system.
 * Returns null if available, or an error Response if not.
 */
async function checkRembgAvailability(): Promise<Response | null> {
  try {
    await fs.access(REMBG_CLI);
    return null;
  } catch {
    return Response.json(
      {
        error: 'rembg not installed',
        hint: 'Run: cd backend-payload && python3 -m venv .venv && .venv/bin/pip install "rembg[cpu,cli]"',
      },
      { status: 500 }
    );
  }
}

/**
 * Process a single media item: remove background, update DB, cleanup original.
 * Returns the result status string for reporting.
 */
async function processMediaItem(
  payload: any, // Payload instance
  item: { id: number; filename: string; backgroundRemoved?: boolean },
  mediaDir: string,
): Promise<{ id: number; filename: string; status: string }> {
  const filename = item.filename;
  const filePath = path.join(mediaDir, filename);

  // Check if file exists
  try {
    await fs.access(filePath);
  } catch {
    return { id: item.id, filename, status: 'file_not_found' };
  }

  // Skip if already processed
  if (item.backgroundRemoved) {
    return { id: item.id, filename, status: 'already_processed' };
  }

  // Generate output filename
  const baseName = path.basename(filename, path.extname(filename));
  const newFilename = `${baseName}-nobg.png`;
  const newFilePath = path.join(mediaDir, newFilename);

  payload.logger.info(`Processing: ${filename}`);

  const success = await removeBackground(filePath, newFilePath);

  if (!success) {
    return { id: item.id, filename, status: 'failed' };
  }

  // Get file stats for the new file
  const newFileStats = await fs.stat(newFilePath);

  // Construct new URL to match new filename
  const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001';
  const newUrl = `${serverUrl}/api/media/file/${newFilename}`;

  // Update database record with new filename and matching URL
  try {
    await payload.update({
      collection: 'media',
      id: item.id,
      data: {
        filename: newFilename,
        mimeType: 'image/png',
        url: newUrl,
        filesize: newFileStats.size,
        backgroundRemoved: true,
        removeBackground: true,
      },
    });
  } catch (updateError) {
    payload.logger.error(`Failed to update media ${item.id}: ${String(updateError)}`);
    return { id: item.id, filename, status: 'db_update_failed' };
  }

  // Delete original file if different
  if (filename !== newFilename) {
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      payload.logger.warn(`Failed to delete original file ${filePath}: ${String(unlinkError)}`);
    }
  }

  return { id: item.id, filename: newFilename, status: 'success' };
}

/**
 * POST /api/remove-backgrounds
 *
 * Remove backgrounds from all tyre images that haven't been processed yet.
 * Query params:
 *   - id: Process single media item by ID
 *   - all: Process all unprocessed media items
 */
export const removeBackgroundsEndpoint: Endpoint = {
  path: '/remove-backgrounds',
  method: 'post',
  handler: async (req) => {
    const payload = req.payload;

    // Check authentication
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: background removal requires admin role
    const forbidden = requireRoleForEndpoint(req.user, 'admin');
    if (forbidden) return forbidden;

    // Check if rembg is available
    const rembgError = await checkRembgAvailability();
    if (rembgError) return rembgError;

    const mediaDir = path.resolve(process.cwd(), 'media');
    const url = new URL(req.url || '', 'http://localhost');
    const singleId = url.searchParams.get('id');
    const processAll = url.searchParams.get('all') === 'true';

    let processed = 0;
    let failed = 0;
    let skipped = 0;
    const results: Array<{ id: number; filename: string; status: string }> = [];

    try {
      // Get media items to process
      let query: any = {
        where: {
          mimeType: { contains: 'image' },
          backgroundRemoved: { not_equals: true },
        },
        limit: 100,
      };

      if (singleId) {
        query = {
          where: { id: { equals: parseInt(singleId, 10) } },
          limit: 1,
        };
      } else {
        // Only process items that have removeBackground checked but not yet processed
        // This ensures article images and other non-tyre media are never touched
        query.where.removeBackground = { equals: true };
      }

      const mediaItems = await payload.find({
        collection: 'media',
        ...query,
      });

      payload.logger.info(
        `Processing ${mediaItems.docs.length} media items for background removal`
      );

      for (const item of mediaItems.docs as Array<{
        id: number;
        filename: string;
        backgroundRemoved?: boolean;
      }>) {
        const result = await processMediaItem(payload, item, mediaDir);
        results.push(result);

        if (result.status === 'success') processed++;
        else if (result.status === 'failed' || result.status === 'db_update_failed') failed++;
        else skipped++;
      }

      return Response.json({
        message: `Background removal completed`,
        processed,
        failed,
        skipped,
        results,
      });
    } catch (error) {
      payload.logger.error(`Background removal batch error: ${String(error)}`);
      return Response.json(
        { error: 'Batch processing failed', details: String(error) },
        { status: 500 }
      );
    }
  },
};

/** Parsed input for batch background removal */
interface BatchRemoveBackgroundsInput {
  /** Media IDs to process, or empty array for "all" */
  mediaIds: number[];
  /** Whether to process all unprocessed images */
  processAll: boolean;
}

/**
 * POST /api/remove-backgrounds/batch
 *
 * Batch remove backgrounds from images with progress tracking.
 * Creates a background job and processes images one by one.
 *
 * Body:
 *   - mediaIds: Array of media IDs to process (optional)
 *   - all: true to process all unprocessed images (optional)
 *
 * Returns immediately with a jobId. Poll /api/remove-backgrounds/batch/status/:jobId for progress.
 */
export const removeBackgroundsBatchEndpoint: Endpoint = {
  path: '/remove-backgrounds/batch',
  method: 'post',
  handler: createBackgroundJobHandler<BatchRemoveBackgroundsInput>({
    type: 'image',
    jobPrefix: 'rembg-batch',
    minRole: 'admin',
    maxConcurrentJobs: 5,

    parseInput: async (req) => {
      // Check rembg availability during input parsing
      const rembgError = await checkRembgAvailability();
      if (rembgError) {
        throw new Error('rembg not installed. Run: cd backend-payload && python3 -m venv .venv && .venv/bin/pip install "rembg[cpu,cli]"');
      }

      let body: { mediaIds?: number[]; all?: boolean } = {};
      try {
        body = await req.json?.() || {};
      } catch {
        // No body or invalid JSON
      }

      const mediaIds = body.mediaIds || [];
      const processAll = body.all === true;

      if (mediaIds.length === 0 && !processAll) {
        throw new Error('Either provide mediaIds array or set all: true');
      }

      // Validate mediaIds are numbers
      if (mediaIds.length > 0) {
        for (const id of mediaIds) {
          if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error(`Invalid media ID: ${id}. Must be a positive integer.`);
          }
        }
      }

      return { mediaIds, processAll };
    },

    buildCommand: (input) =>
      input.processAll
        ? 'remove-backgrounds --batch --all'
        : `remove-backgrounds --batch --ids=${input.mediaIds.join(',')}`,

    statusPath: (jobId) => `/api/remove-backgrounds/batch/status/${jobId}`,
    responseMessage: 'Batch background removal started',

    execute: async (input, ctx) => {
      const { payload, job } = ctx;
      const mediaDir = path.resolve(process.cwd(), 'media');

      // Build query
      let query: any;
      if (input.mediaIds.length > 0) {
        query = {
          where: { id: { in: input.mediaIds } },
          limit: input.mediaIds.length,
        };
      } else {
        // Only process images that have removeBackground explicitly enabled
        // This ensures article images and other non-tyre media are never touched
        query = {
          where: {
            mimeType: { contains: 'image' },
            backgroundRemoved: { not_equals: true },
            removeBackground: { equals: true },
          },
          limit: 500,
        };
      }

      const mediaItems = await payload.find({
        collection: 'media',
        ...query,
      });

      const items = mediaItems.docs as Array<{
        id: number;
        filename: string;
        backgroundRemoved?: boolean;
      }>;

      const total = items.length;
      let processed = 0;
      let succeeded = 0;
      let failed = 0;

      // Set total steps for progress tracking
      job.totalSteps = total;
      job.currentStep = 0;
      job.stepLabel = `Processing 0/${total}`;
      updateJob(job);

      const results: Array<{ id: number; filename: string; status: string }> = [];

      for (const item of items) {
        const result = await processMediaItem(payload, item, mediaDir);
        results.push(result);
        processed++;

        if (result.status === 'success') {
          succeeded++;
        } else if (result.status === 'failed' || result.status === 'db_update_failed') {
          failed++;
        }

        // Update progress
        job.currentStep = processed;
        job.stepLabel = `Processing ${processed}/${total} (${succeeded} ok, ${failed} failed)`;
        updateJob(job);
      }

      return {
        output: JSON.stringify({
          total,
          processed,
          succeeded,
          failed,
          skipped: processed - succeeded - failed,
          results,
        }),
      };
    },
  }),
};

/**
 * GET /api/remove-backgrounds/batch/status/:jobId
 *
 * Get progress of a batch background removal job.
 */
export const removeBackgroundsBatchStatusEndpoint: Endpoint = {
  path: '/remove-backgrounds/batch/status/:jobId',
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

    // Parse output for completed jobs to return structured progress
    let progress: Record<string, unknown> | undefined;
    if (job.status === 'completed' && job.output) {
      try {
        progress = JSON.parse(job.output);
      } catch {
        // Not JSON, use raw output
      }
    }

    return Response.json({
      ...job,
      ...(progress ? { progress } : {}),
    });
  },
};

/**
 * GET /api/remove-backgrounds/status
 *
 * Get status of background removal (how many processed, how many pending)
 */
export const removeBackgroundsStatusEndpoint: Endpoint = {
  path: '/remove-backgrounds/status',
  method: 'get',
  handler: async (req) => {
    const payload = req.payload;

    try {
      const [total, processed, pending] = await Promise.all([
        payload.count({ collection: 'media', where: { removeBackground: { equals: true } } }),
        payload.count({ collection: 'media', where: { removeBackground: { equals: true }, backgroundRemoved: { equals: true } } }),
        payload.count({
          collection: 'media',
          where: {
            removeBackground: { equals: true },
            backgroundRemoved: { not_equals: true },
          },
        }),
      ]);

      // Check if rembg is available
      let rembgAvailable = false;
      try {
        await fs.access(REMBG_CLI);
        rembgAvailable = true;
      } catch {
        // rembg not available
      }

      return Response.json({
        total: total.totalDocs,
        processed: processed.totalDocs,
        pending: pending.totalDocs,
        rembgAvailable,
      });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  },
};
