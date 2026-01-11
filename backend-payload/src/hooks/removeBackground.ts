import type { CollectionAfterChangeHook } from 'payload';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Hook to automatically remove background from images using rembg (Python).
 * Triggered when 'removeBackground' checkbox is enabled on Media upload.
 *
 * Requirements:
 *   pip install "rembg[cpu]" pillow
 *
 * In Docker, rembg is installed in /opt/venv (see Dockerfile).
 * Locally, ensure rembg is available in PATH or activate venv first.
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
    // Check if rembg is available
    try {
      await execAsync('python3 -c "import rembg"');
    } catch {
      req.payload.logger.error(
        'rembg not installed. Run: pip install rembg pillow'
      );
      return doc;
    }

    // Use rembg CLI to process the image
    const command = `python3 -m rembg i "${filePath}" "${newFilePath}"`;
    await execAsync(command, { timeout: 60000 }); // 60 second timeout

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
