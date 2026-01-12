import type { Endpoint } from 'payload';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const REMBG_CLI = path.resolve(process.cwd(), '.venv/bin/rembg');

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

    // Check if rembg is available
    try {
      await fs.access(REMBG_CLI);
    } catch {
      return Response.json(
        {
          error: 'rembg not installed',
          hint: 'Run: cd backend-payload && python3 -m venv .venv && .venv/bin/pip install "rembg[cpu,cli]"',
        },
        { status: 500 }
      );
    }

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
      } else if (!processAll) {
        // Only process items that have removeBackground checked but not yet processed
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
        const filename = item.filename;
        const filePath = path.join(mediaDir, filename);

        // Check if file exists
        try {
          await fs.access(filePath);
        } catch {
          results.push({ id: item.id, filename, status: 'file_not_found' });
          skipped++;
          continue;
        }

        // Skip if already processed
        if (item.backgroundRemoved) {
          results.push({ id: item.id, filename, status: 'already_processed' });
          skipped++;
          continue;
        }

        // Generate output filename
        const baseName = path.basename(filename, path.extname(filename));
        const newFilename = `${baseName}-nobg.png`;
        const newFilePath = path.join(mediaDir, newFilename);

        payload.logger.info(`Processing: ${filename}`);

        const success = await removeBackground(filePath, newFilePath);

        if (success) {
          // Update database record
          await payload.update({
            collection: 'media',
            id: item.id,
            data: {
              filename: newFilename,
              mimeType: 'image/png',
              backgroundRemoved: true,
              removeBackground: true,
            },
          });

          // Delete original file if different
          if (filename !== newFilename) {
            try {
              await fs.unlink(filePath);
            } catch {
              // Ignore deletion errors
            }
          }

          results.push({ id: item.id, filename: newFilename, status: 'success' });
          processed++;
        } else {
          results.push({ id: item.id, filename, status: 'failed' });
          failed++;
        }
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
        payload.count({ collection: 'media', where: { mimeType: { contains: 'image' } } }),
        payload.count({ collection: 'media', where: { backgroundRemoved: { equals: true } } }),
        payload.count({
          collection: 'media',
          where: {
            mimeType: { contains: 'image' },
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
