/**
 * Download Bridgestone tire images from prokoleso.ua dealer website
 * and upload to Strapi CMS
 *
 * Usage: node scripts/download-prokoleso-images.js
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

// Mapping of tire slugs to prokoleso.ua image URLs
// Note: slugs must match Strapi database slugs
const TIRE_IMAGE_MAP = {
  'turanza-6': 'https://prokoleso.ua/storage/catalog_models/1974/image/t006.jpg',
  'turanza-t005': 'https://prokoleso.ua/storage/catalog_models/1951/image/turanza-t005.png',
  'potenza-sport': 'https://prokoleso.ua/storage/catalog_models/1966/image/potenza-sport.png',
  'blizzak-lm005': 'https://prokoleso.ua/storage/catalog_models/1954/image/bridgestone-blizzak-lm005.jpg',
  'blizzak-dm-v3': 'https://prokoleso.ua/storage/catalog_models/1929/image/bridzh2.jpg',
  'dueler-hp-sport': 'https://prokoleso.ua/storage/catalog_models/1940/image/bridgestone-dueler-hp-sport.jpg',
  'dueler-at-001': 'https://prokoleso.ua/storage/catalog_models/1980/image/dueler-at-002-bridgestone.jpg',
  'alenza-001': 'https://prokoleso.ua/storage/catalog_models/1950/image/alenza-001.png',
  'duravis-r660': 'https://prokoleso.ua/storage/catalog_models/1975/image/bridgestone-duravisr660.jpg',
  'ecopia-ep150': 'https://prokoleso.ua/storage/catalog_models/1933/image/ecopia-ep150.png',
};

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
        'Referer': 'https://prokoleso.ua/',
      }
    };

    protocol.get(url, options, (response) => {
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
    const extension = path.extname(filename).toLowerCase();
    const contentType = extension === '.png' ? 'image/png' : 'image/jpeg';

    form.append('files', imageBuffer, {
      filename: filename,
      contentType: contentType,
    });

    const url = new URL(`${STRAPI_URL}/api/upload`);
    const options = {
      hostname: url.hostname,
      port: url.port || 1337,
      path: url.pathname,
      method: 'POST',
      headers: form.getHeaders(),
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

async function main() {
  console.log('===========================================');
  console.log('Bridgestone Tire Images from prokoleso.ua');
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

  for (const [slug, imageUrl] of Object.entries(TIRE_IMAGE_MAP)) {
    console.log(`\nProcessing: ${slug}`);
    console.log(`  URL: ${imageUrl}`);

    try {
      const buffer = await downloadImage(imageUrl);

      if (buffer.length < 5000) {
        throw new Error(`Image too small (${buffer.length} bytes)`);
      }

      const extension = path.extname(imageUrl) || '.jpg';
      const filename = `${slug}${extension}`;
      const filepath = path.join(imagesDir, filename);

      // Save to disk
      fs.writeFileSync(filepath, buffer);
      console.log(`  Downloaded: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
      results.downloaded.push(slug);

      // Upload to Strapi if available
      if (tyres) {
        // Handle both Strapi v4 (nested attributes) and flat structure
        const tyre = tyres.find(t => {
          const tyreSlug = t.attributes?.slug || t.slug;
          return tyreSlug === slug;
        });
        if (tyre) {
          try {
            console.log(`  Uploading to Strapi...`);
            const uploadResult = await uploadToStrapi(buffer, filename);
            if (uploadResult && uploadResult[0]) {
              const imageId = uploadResult[0].id;
              await updateTyreWithImage(tyre.id, imageId);
              console.log(`  Uploaded and linked to tyre ID ${tyre.id}`);
              results.uploaded.push(slug);
            }
          } catch (err) {
            console.log(`  Upload failed: ${err.message}`);
          }
        } else {
          console.log(`  Warning: Tyre "${slug}" not found in Strapi`);
        }
      }
    } catch (err) {
      console.log(`  Failed: ${err.message}`);
      results.failed.push(slug);
    }

    // Small delay between requests to be polite
    await new Promise(r => setTimeout(r, 500));
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
