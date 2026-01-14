/**
 * Resize/Crop Image CLI
 *
 * Usage:
 *   npx tsx content-automation/src/resize-image.ts --id=79 --width=1792 --height=1024
 *   npx tsx content-automation/src/resize-image.ts --id=79 --height=500  # keep aspect ratio
 *   npx tsx content-automation/src/resize-image.ts --id=79 --crop=1792x1024  # crop to exact size
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDIA_DIR = path.resolve(__dirname, '../../media');
const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3001';

interface ResizeOptions {
  mediaId: number;
  width?: number;
  height?: number;
  crop?: string; // "1792x1024" format
}

async function getMediaById(id: number) {
  const response = await fetch(`${PAYLOAD_URL}/api/media/${id}`);
  if (!response.ok) {
    throw new Error(`Media ${id} not found`);
  }
  return response.json();
}

async function resizeImage(options: ResizeOptions) {
  const { mediaId, width, height, crop } = options;

  // Get media info
  const media = await getMediaById(mediaId);
  console.log(`\n📷 Found media: ${media.filename}`);
  console.log(`   Current size: ${media.width}x${media.height}`);

  const inputPath = path.join(MEDIA_DIR, media.filename);

  // Check file exists
  try {
    await fs.access(inputPath);
  } catch {
    throw new Error(`File not found: ${inputPath}`);
  }

  // Create backup
  const backupPath = inputPath + '.backup';
  await fs.copyFile(inputPath, backupPath);
  console.log(`   Backup created: ${media.filename}.backup`);

  let sharpInstance = sharp(inputPath);

  if (crop) {
    // Crop to exact dimensions (center crop)
    const [cropWidth, cropHeight] = crop.split('x').map(Number);
    console.log(`\n✂️  Cropping to ${cropWidth}x${cropHeight}...`);

    sharpInstance = sharpInstance.resize(cropWidth, cropHeight, {
      fit: 'cover',
      position: 'center',
    });
  } else if (width && height) {
    // Resize to exact dimensions (may distort)
    console.log(`\n📐 Resizing to ${width}x${height}...`);
    sharpInstance = sharpInstance.resize(width, height, {
      fit: 'fill',
    });
  } else if (width) {
    // Resize by width, keep aspect ratio
    console.log(`\n📐 Resizing to width ${width}...`);
    sharpInstance = sharpInstance.resize(width, null);
  } else if (height) {
    // Resize by height, keep aspect ratio
    console.log(`\n📐 Resizing to height ${height}...`);
    sharpInstance = sharpInstance.resize(null, height);
  } else {
    throw new Error('Specify --width, --height, or --crop');
  }

  // Process and save
  const outputBuffer = await sharpInstance.toBuffer();
  await fs.writeFile(inputPath, outputBuffer);

  // Get new dimensions
  const newMeta = await sharp(inputPath).metadata();
  console.log(`   New size: ${newMeta.width}x${newMeta.height}`);

  // Update media record in Payload
  console.log(`\n🔄 Updating media record...`);

  // Need to re-upload to update dimensions in DB
  // For now just inform user
  console.log(`   ⚠️  File updated on disk. Dimensions in database may need manual update.`);
  console.log(`   To restore: mv "${backupPath}" "${inputPath}"`);

  console.log(`\n✅ Done!`);
}

// Parse CLI args
const args = process.argv.slice(2);

if (args.includes('--help') || args.length === 0) {
  console.log(`
Resize/Crop Image CLI

Usage:
  npx tsx content-automation/src/resize-image.ts --id=79 --width=1792 --height=1024
  npx tsx content-automation/src/resize-image.ts --id=79 --height=500
  npx tsx content-automation/src/resize-image.ts --id=79 --crop=1792x1024

Options:
  --id=<number>       Media ID (required)
  --width=<number>    Target width (keeps aspect ratio if height not specified)
  --height=<number>   Target height (keeps aspect ratio if width not specified)
  --crop=<WxH>        Crop to exact size (e.g., 1792x1024), centers the crop
  --help              Show this help

Examples:
  # Crop to 1792x1024 (wide banner)
  npx tsx content-automation/src/resize-image.ts --id=79 --crop=1792x1024

  # Resize to height 500, keeping aspect ratio
  npx tsx content-automation/src/resize-image.ts --id=79 --height=500

  # Resize to exact dimensions
  npx tsx content-automation/src/resize-image.ts --id=79 --width=1024 --height=576
`);
} else {
  const getArg = (name: string): string | undefined => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split('=').slice(1).join('=') : undefined;
  };

  const mediaId = parseInt(getArg('id') || '0', 10);
  if (!mediaId) {
    console.error('❌ Error: --id is required');
    process.exit(1);
  }

  const options: ResizeOptions = {
    mediaId,
    width: getArg('width') ? parseInt(getArg('width')!, 10) : undefined,
    height: getArg('height') ? parseInt(getArg('height')!, 10) : undefined,
    crop: getArg('crop'),
  };

  resizeImage(options).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}
