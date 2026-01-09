/**
 * Upload tire images to Strapi and link them to tyre entries
 *
 * Run with: node scripts/upload-tire-images-to-strapi.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const FormData = require('form-data');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'uploads', 'tyres');

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
}

async function getTyres() {
  const response = await fetchJson(`${STRAPI_URL}/api/tyres?populate=image`);
  return response.data;
}

function uploadImage(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('files', fs.createReadStream(filePath), {
      filename: fileName,
      contentType: 'image/png',
    });

    const url = new URL(`${STRAPI_URL}/api/upload`);

    const req = http.request({
      method: 'POST',
      hostname: url.hostname,
      port: url.port || 1337,
      path: url.pathname,
      headers: form.getHeaders(),
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Parse error: ${data}`));
          }
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

async function updateTyreImage(tyreId, imageId) {
  const response = await fetchJson(`${STRAPI_URL}/api/tyres/${tyreId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        image: imageId,
      },
    }),
  });
  return response;
}

async function main() {
  console.log('=========================================');
  console.log('Upload Tire Images to Strapi');
  console.log('=========================================\n');

  // Check if images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found: ${IMAGES_DIR}`);
    console.log('Run download-tire-images.js first to download images.');
    process.exit(1);
  }

  // Get available images
  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png'));
  console.log(`Found ${imageFiles.length} images in ${IMAGES_DIR}\n`);

  // Get tyres from Strapi
  console.log('Fetching tyres from Strapi...');
  const tyres = await getTyres();
  console.log(`Found ${tyres.length} tyres in database\n`);

  const results = {
    uploaded: [],
    skipped: [],
    failed: [],
  };

  for (const imageFile of imageFiles) {
    const slug = imageFile.replace('.png', '');
    // Strapi v4 uses data[].attributes format
    const tyre = tyres.find(t => t.attributes?.slug === slug || t.slug === slug);

    if (!tyre) {
      console.log(`⚠ No tyre found for: ${slug}`);
      results.skipped.push(slug);
      continue;
    }

    const attrs = tyre.attributes || tyre;
    const tyreName = attrs.name;

    // Check if tyre already has an image
    if (attrs.image?.data) {
      console.log(`⏭ ${slug}: already has image, skipping`);
      results.skipped.push(slug);
      continue;
    }

    console.log(`📤 Uploading: ${imageFile}...`);
    const filePath = path.join(IMAGES_DIR, imageFile);

    try {
      // Upload the image
      const uploadResult = await uploadImage(filePath, imageFile);

      if (!uploadResult || !uploadResult[0]) {
        throw new Error('No upload result returned');
      }

      const imageId = uploadResult[0].id;
      console.log(`   ✓ Uploaded, image ID: ${imageId}`);

      // Link to tyre
      await updateTyreImage(tyre.id, imageId);
      console.log(`   ✓ Linked to tyre ID: ${tyre.id} (${tyreName})`);

      results.uploaded.push(slug);
    } catch (error) {
      console.log(`   ✗ Failed: ${error.message}`);
      results.failed.push(slug);
    }
  }

  console.log('\n=========================================');
  console.log('SUMMARY');
  console.log('=========================================');
  console.log(`Uploaded: ${results.uploaded.length}`);
  console.log(`Skipped: ${results.skipped.length}`);
  console.log(`Failed: ${results.failed.length}`);

  if (results.uploaded.length > 0) {
    console.log(`\n✓ Uploaded: ${results.uploaded.join(', ')}`);
  }
  if (results.failed.length > 0) {
    console.log(`\n✗ Failed: ${results.failed.join(', ')}`);
  }
}

main().catch(console.error);
