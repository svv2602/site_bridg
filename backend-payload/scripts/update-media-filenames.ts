/**
 * Update media records to use background-removed filenames
 */
import { existsSync } from 'fs';
import { join, basename, extname } from 'path';

const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bridgestone.ua';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const MEDIA_DIR = join(process.cwd(), 'media');

async function login(): Promise<string> {
  console.log('Logging in to Payload CMS...');

  const response = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('Login successful!\n');
  return data.token;
}

async function main() {
  const token = await login();

  // Get all media items
  const response = await fetch(`${PAYLOAD_URL}/api/media?limit=100`, {
    headers: { Authorization: `JWT ${token}` },
  });
  const data = await response.json();

  console.log(`Found ${data.docs.length} media items\n`);

  let updated = 0;
  let skipped = 0;

  for (const item of data.docs) {
    const filename = item.filename;
    const baseName = basename(filename, extname(filename));

    // Skip if already a -nobg file
    if (baseName.endsWith('-nobg')) {
      console.log(`  Skipping (already -nobg): ${filename}`);
      skipped++;
      continue;
    }

    // Check if -nobg version exists
    const nobgFilename = `${baseName}-nobg.png`;
    const nobgPath = join(MEDIA_DIR, nobgFilename);

    if (!existsSync(nobgPath)) {
      console.log(`  Skipping (no -nobg version): ${filename}`);
      skipped++;
      continue;
    }

    // Update the record
    console.log(`  Updating: ${filename} -> ${nobgFilename}`);
    const updateResponse = await fetch(`${PAYLOAD_URL}/api/media/${item.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        filename: nobgFilename,
        mimeType: 'image/png',
        backgroundRemoved: true,
      }),
    });

    if (updateResponse.ok) {
      updated++;
    } else {
      const error = await updateResponse.text();
      console.log(`    Error: ${error}`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
}

main().catch(console.error);
