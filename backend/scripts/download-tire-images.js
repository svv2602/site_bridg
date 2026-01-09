/**
 * Download Bridgestone tire images from official CDN and upload to Strapi
 *
 * Usage: node scripts/download-tire-images.js
 *
 * NOTE: These images are for demo/prototype purposes only.
 * For production, official licensed images from Bridgestone should be used.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const FormData = require('form-data');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN || '';

// Mapping of our tire slugs to Bridgestone CDN image names
const TIRE_IMAGE_MAP = {
  'turanza-6': 'bridgestone-turanza-006',
  'turanza-t005': 'bridgestone-turanza-t005',
  'potenza-sport': 'bridgestone-potenza-sport',
  'blizzak-lm005': 'bridgestone-blizzak-lm005',
  'blizzak-dm-v3': 'bridgestone-blizzak-dm-v3',
  'dueler-hp-sport': 'bridgestone-dueler-hp-sport',
  'dueler-at-001': 'bridgestone-dueler-at-001',
  'alenza-001': 'bridgestone-alenza-001',
  'weather-control-a005-evo': 'bridgestone-weather-control-a005-evo',
  'duravis-van': 'bridgestone-duravis-van',
  'duravis-all-season': 'bridgestone-duravis-all-season',
  'ecopia-ep150': 'bridgestone-ecopia-ep150',
  'ecopia-hl-422-plus': 'bridgestone-ecopia-hl-422-plus',
  'driveguard': 'bridgestone-driveguard',
};

// Alternative image names to try if primary fails
const ALTERNATIVE_NAMES = {
  'turanza-6': ['bridgestone-turanza-6', 'bridgestone-turanza-006-60-zoom-web-global-consumer'],
  'blizzak-dm-v3': ['bridgestone-blizzak-dmv3', 'bridgestone-blizzak-dm-v2'],
  'dueler-at-001': ['bridgestone-dueler-a-t-001', 'bridgestone-dueler-at001'],
  'weather-control-a005-evo': ['bridgestone-weather-control-a005', 'bridgestone-weathercontrol-a005-evo'],
  'ecopia-hl-422-plus': ['bridgestone-ecopia-hl422-plus', 'bridgestone-ecopia-h-l-422-plus'],
};

function buildImageUrl(imageName, format = 'png', width = 800) {
  return `https://s7d1.scene7.com/is/image/bridgestone/${imageName}-60-zoom-web-global-consumer?fmt=${format}&wid=${width}&qlt=85`;
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Check for redirect
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function uploadToStrapi(imageBuffer, filename) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('files', imageBuffer, {
      filename: filename,
      contentType: 'image/png',
    });

    const url = new URL(`${STRAPI_URL}/api/upload`);
    const options = {
      hostname: url.hostname,
      port: url.port || 1337,
      path: url.pathname,
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        ...(STRAPI_TOKEN ? { 'Authorization': `Bearer ${STRAPI_TOKEN}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
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

async function updateTyreWithImage(tyreId, imageId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      data: {
        image: imageId,
      },
    });

    const url = new URL(`${STRAPI_URL}/api/tyres/${tyreId}`);
    const options = {
      hostname: url.hostname,
      port: url.port || 1337,
      path: url.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(STRAPI_TOKEN ? { 'Authorization': `Bearer ${STRAPI_TOKEN}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`Update failed: ${res.statusCode} - ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getTyres() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${STRAPI_URL}/api/tyres?populate=*`);
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to get tyres: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function tryDownloadImage(slug, imageName) {
  const namesToTry = [imageName, ...(ALTERNATIVE_NAMES[slug] || [])];

  for (const name of namesToTry) {
    const url = buildImageUrl(name);
    console.log(`  Trying: ${name}...`);
    try {
      const buffer = await downloadImage(url);
      // Check if we got a valid image (not an error page)
      if (buffer.length > 10000) { // Real images should be > 10KB
        return { buffer, name };
      }
      console.log(`    Got small response (${buffer.length} bytes), trying next...`);
    } catch (err) {
      console.log(`    Failed: ${err.message}`);
    }
  }

  return null;
}

async function main() {
  console.log('===========================================');
  console.log('Bridgestone Tire Image Downloader');
  console.log('===========================================\n');

  // Create images directory
  const imagesDir = path.join(__dirname, '..', 'public', 'uploads', 'tyres');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Get existing tyres from Strapi
  console.log('Fetching existing tyres from Strapi...');
  let tyres;
  try {
    const response = await getTyres();
    tyres = response.data;
    console.log(`Found ${tyres.length} tyres in database\n`);
  } catch (err) {
    console.error('Failed to fetch tyres:', err.message);
    console.log('\nFalling back to downloading images to disk only...\n');
    tyres = null;
  }

  const results = {
    downloaded: [],
    failed: [],
    uploaded: [],
  };

  for (const [slug, imageName] of Object.entries(TIRE_IMAGE_MAP)) {
    console.log(`\nProcessing: ${slug}`);

    const result = await tryDownloadImage(slug, imageName);

    if (result) {
      const filename = `${slug}.png`;
      const filepath = path.join(imagesDir, filename);

      // Save to disk
      fs.writeFileSync(filepath, result.buffer);
      console.log(`  ✓ Downloaded: ${filename} (${(result.buffer.length / 1024).toFixed(1)} KB)`);
      results.downloaded.push(slug);

      // Upload to Strapi if available
      if (tyres) {
        const tyre = tyres.find(t => t.slug === slug);
        if (tyre) {
          try {
            console.log(`  Uploading to Strapi...`);
            const uploadResult = await uploadToStrapi(result.buffer, filename);
            if (uploadResult && uploadResult[0]) {
              const imageId = uploadResult[0].id;
              await updateTyreWithImage(tyre.id, imageId);
              console.log(`  ✓ Uploaded and linked to tyre ID ${tyre.id}`);
              results.uploaded.push(slug);
            }
          } catch (err) {
            console.log(`  ✗ Upload failed: ${err.message}`);
          }
        }
      }
    } else {
      console.log(`  ✗ Failed to download image for ${slug}`);
      results.failed.push(slug);
    }
  }

  console.log('\n===========================================');
  console.log('SUMMARY');
  console.log('===========================================');
  console.log(`Downloaded: ${results.downloaded.length}/${Object.keys(TIRE_IMAGE_MAP).length}`);
  console.log(`Uploaded to Strapi: ${results.uploaded.length}`);
  console.log(`Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log(`\nFailed images: ${results.failed.join(', ')}`);
  }

  console.log(`\nImages saved to: ${imagesDir}`);
}

main().catch(console.error);
