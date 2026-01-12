import type { CollectionAfterChangeHook } from 'payload';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Path to rembg CLI in virtual environment
const REMBG_CLI = path.resolve(process.cwd(), '.venv/bin/rembg');

/**
 * Hook to automatically remove background from images using rembg (Python).
 * Triggered when 'removeBackground' checkbox is enabled on Media upload.
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

  const mediaDir = path.resolve(process.cwd(), 'media');
  const filename = doc.filename as string;
  const filePath = path.join(mediaDir, filename);

  // Generate output filename
  const baseName = path.basename(filename, path.extname(filename));
  const newFilename = `${baseName}-nobg.png`;
  const newFilePath = path.join(mediaDir, newFilename);

  req.payload.logger.info(`Removing background from: ${filename}`);

  try {
    // Check if rembg CLI is available
    try {
      await fs.access(REMBG_CLI);
    } catch {
      req.payload.logger.error(
        'rembg not installed. Run: cd backend-payload && python3 -m venv .venv && .venv/bin/pip install "rembg[cpu,cli]"'
      );
      return doc;
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

    // Update the document with new file info
    await req.payload.update({
      collection: 'media',
      id: doc.id,
      data: {
        filename: newFilename,
        mimeType: 'image/png',
        backgroundRemoved: true,
      },
    });

    // Remove original file if different
    if (filename !== newFilename) {
      try {
        await fs.unlink(filePath);
      } catch {
        // Ignore if original file can't be deleted
      }
    }

    req.payload.logger.info(`Background removed successfully: ${newFilename}`);

    return {
      ...doc,
      filename: newFilename,
      mimeType: 'image/png',
      backgroundRemoved: true,
    };
  } catch (error) {
    req.payload.logger.error(
      `Failed to remove background: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return doc;
  }
};
