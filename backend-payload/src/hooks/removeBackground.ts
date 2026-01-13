import type { CollectionAfterChangeHook } from 'payload';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Support multiple rembg locations: env var, venv, or system-wide
function getRembgPath(): string {
  if (process.env.REMBG_PATH) {
    return process.env.REMBG_PATH;
  }
  // Try venv first (local development)
  const venvPath = path.resolve(process.cwd(), '.venv/bin/rembg');
  return venvPath;
}

const REMBG_CLI = getRembgPath();

/**
 * Process background removal asynchronously.
 * This runs in the background without blocking the hook.
 */
async function processBackgroundRemoval(
  docId: number | string,
  filename: string,
  payload: any
): Promise<void> {
  const mediaDir = path.resolve(process.cwd(), 'media');
  const filePath = path.join(mediaDir, filename);

  // Generate output filename
  const baseName = path.basename(filename, path.extname(filename));
  const newFilename = `${baseName}-nobg.png`;
  const newFilePath = path.join(mediaDir, newFilename);

  payload.logger.info(`[BG] Starting background removal for: ${filename}`);

  try {
    // Check if rembg CLI is available
    try {
      await fs.access(REMBG_CLI);
    } catch {
      payload.logger.error(
        '[BG] rembg not installed. Run: cd backend-payload && python3 -m venv .venv && .venv/bin/pip install "rembg[cpu,cli]"'
      );
      return;
    }

    // Use rembg CLI to process the image
    const command = `"${REMBG_CLI}" i "${filePath}" "${newFilePath}"`;
    await execAsync(command, { timeout: 120000 }); // 2 minute timeout

    // Verify output file was created
    try {
      await fs.access(newFilePath);
    } catch {
      throw new Error('Output file was not created');
    }

    // Get file stats for the new file
    const stats = await fs.stat(newFilePath);

    // Update the document with new file info
    // Use direct database update to avoid triggering hooks again
    await payload.update({
      collection: 'media',
      id: docId,
      data: {
        filename: newFilename,
        mimeType: 'image/png',
        filesize: stats.size,
        backgroundRemoved: true,
      },
      // Prevent infinite loop - don't trigger hooks on this update
      overrideAccess: true,
    });

    // Remove original file if different
    if (filename !== newFilename) {
      try {
        await fs.unlink(filePath);
      } catch {
        // Ignore if original file can't be deleted
      }
    }

    payload.logger.info(`[BG] Background removed successfully: ${newFilename}`);
  } catch (error) {
    payload.logger.error(
      `[BG] Failed to remove background from ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Hook to automatically remove background from images using rembg (Python).
 * Triggered when 'removeBackground' checkbox is enabled on Media upload.
 *
 * The actual processing runs asynchronously in the background to avoid
 * blocking the API response. The hook returns immediately.
 *
 * Requirements:
 *   cd backend-payload && python3 -m venv .venv && source .venv/bin/activate
 *   pip install "rembg[cpu]" pillow
 */
export const removeBackgroundHook: CollectionAfterChangeHook = async ({
  doc,
  req,
}) => {
  // Only process when removeBackground is checked and not yet processed
  if (!doc.removeBackground || doc.backgroundRemoved) {
    return doc;
  }

  // Only process image files
  const mimeType = doc.mimeType as string;
  if (!mimeType?.startsWith('image/')) {
    return doc;
  }

  const filename = doc.filename as string;

  // Fire-and-forget: start background processing without waiting
  // This allows the hook to return immediately while rembg runs
  setImmediate(() => {
    processBackgroundRemoval(doc.id, filename, req.payload).catch((err) => {
      req.payload.logger.error(`[BG] Unhandled error: ${err}`);
    });
  });

  req.payload.logger.info(`[BG] Queued background removal for: ${filename}`);

  // Return original doc - the update will happen asynchronously
  return doc;
};
