/**
 * Import scraped tyres to Payload CMS
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Types
interface ScrapedTire {
  name: string;
  sourceSlug: string;
  canonicalSlug: string;
  brand?: string;
  season: "summer" | "winter" | "allseason";
  sizes: Array<{
    width: number;
    aspectRatio: number;
    diameter: number;
    loadIndex?: string;
    speedIndex?: string;
  }>;
  euLabel?: {
    fuelEfficiency?: string;
    wetGrip?: string;
    noiseClass?: string;
    noiseDb?: number;
  };
  description: string;
  imageUrl: string;
  sourceUrl: string;
  scrapedAt: string;
}

interface PayloadTyre {
  slug: string;
  name: string;
  brand: string;
  season: "summer" | "winter" | "allseason";
  vehicleTypes: string[];
  shortDescription?: string;
  sizes: Array<{
    width: number;
    aspectRatio: number;
    diameter: number;
    loadIndex?: string;
    speedIndex?: string;
  }>;
  euLabel?: {
    fuelEfficiency?: string;
    wetGrip?: string;
    noiseDb?: number;
    noiseClass?: string;
  };
}

const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3001";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bridgestone.ua";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

let authToken: string | null = null;

async function login(): Promise<string> {
  console.log("Logging in to Payload CMS...");

  const response = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();
  console.log("Login successful!\n");
  return data.token;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `JWT ${authToken}`;
  }
  return headers;
}

async function findTyreBySlug(slug: string): Promise<any | null> {
  const response = await fetch(
    `${PAYLOAD_URL}/api/tyres?where[slug][equals]=${encodeURIComponent(slug)}`
  );
  const data = await response.json();
  return data.docs?.length > 0 ? data.docs[0] : null;
}

async function createTyre(data: PayloadTyre): Promise<any> {
  const response = await fetch(`${PAYLOAD_URL}/api/tyres`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create tyre: ${error}`);
  }

  return response.json();
}

async function updateTyre(id: string, data: Partial<PayloadTyre>): Promise<any> {
  const response = await fetch(`${PAYLOAD_URL}/api/tyres/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update tyre: ${error}`);
  }

  return response.json();
}

// Cache for uploaded media IDs to avoid re-uploading
const mediaCache: Map<string, number> = new Map();

async function findMediaByFilename(filename: string): Promise<number | null> {
  const response = await fetch(
    `${PAYLOAD_URL}/api/media?where[filename][equals]=${encodeURIComponent(filename)}&limit=1`,
    { headers: getHeaders() }
  );
  const data = await response.json();
  return data.docs?.length > 0 ? data.docs[0].id : null;
}

/**
 * Remove background from image using rembg + white cleanup.
 * After rembg, flood-fills remaining white areas from corners to make them transparent.
 * Returns processed buffer or original if processing fails.
 */
function removeBackground(inputBuffer: Buffer): Buffer {
  const tmpDir = "/tmp";
  const ts = Date.now();
  const inputPath = join(tmpDir, `rembg-input-${ts}.png`);
  const outputPath = join(tmpDir, `rembg-output-${ts}.png`);

  const pythonScript = `
import sys
from PIL import Image
import numpy as np
from rembg import remove

# Load image
img = Image.open(sys.argv[1])

# Step 1: rembg background removal
result = remove(img)
arr = np.array(result)

# Step 2: Flood-fill remaining white/near-white pixels from edges
# Build mask of near-white pixels (R>240, G>240, B>240) that are still opaque
h, w = arr.shape[:2]
white_mask = (arr[:,:,0] > 240) & (arr[:,:,1] > 240) & (arr[:,:,2] > 240) & (arr[:,:,3] > 200)

# BFS flood fill from all edge pixels that are white
from collections import deque
visited = np.zeros((h, w), dtype=bool)
queue = deque()

# Seed from all 4 edges
for x in range(w):
    if white_mask[0, x]:
        queue.append((0, x))
        visited[0, x] = True
    if white_mask[h-1, x]:
        queue.append((h-1, x))
        visited[h-1, x] = True
for y in range(h):
    if white_mask[y, 0]:
        queue.append((y, 0))
        visited[y, 0] = True
    if white_mask[y, w-1]:
        queue.append((y, w-1))
        visited[y, w-1] = True

# Also seed from already-transparent pixels adjacent to white
for y in range(h):
    for x in range(w):
        if arr[y, x, 3] == 0:  # transparent pixel
            for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
                ny, nx = y+dy, x+dx
                if 0 <= ny < h and 0 <= nx < w and white_mask[ny, nx] and not visited[ny, nx]:
                    queue.append((ny, nx))
                    visited[ny, nx] = True

while queue:
    cy, cx = queue.popleft()
    arr[cy, cx, 3] = 0  # Make transparent
    for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
        ny, nx = cy+dy, cx+dx
        if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and white_mask[ny, nx]:
            visited[ny, nx] = True
            queue.append((ny, nx))

# Save result
Image.fromarray(arr).save(sys.argv[2])
`;

  try {
    const fs = require("fs");
    const scriptPath = join(tmpDir, `rembg-script-${ts}.py`);
    fs.writeFileSync(inputPath, inputBuffer);
    fs.writeFileSync(scriptPath, pythonScript);
    execSync(`/opt/venv/bin/python "${scriptPath}" "${inputPath}" "${outputPath}"`, {
      timeout: 120000,
      stdio: "pipe",
    });
    const result = fs.readFileSync(outputPath);
    // Cleanup
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(outputPath); } catch {}
    try { fs.unlinkSync(scriptPath); } catch {}
    return result;
  } catch (error) {
    console.log(`    Warning: rembg failed, using original image`);
    // Cleanup on error
    const fs = require("fs");
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(outputPath); } catch {}
    try { fs.unlinkSync(join(tmpDir, `rembg-script-${ts}.py`)); } catch {}
    return inputBuffer;
  }
}

const forceImages = process.argv.includes("--force-images");
if (forceImages) {
  console.log("Force images mode: will re-download and re-process all images");
}

async function deleteMedia(id: number): Promise<void> {
  const resp = await fetch(`${PAYLOAD_URL}/api/media/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!resp.ok) {
    console.log(`    Warning: failed to delete media ${id}: ${resp.status}`);
  }
}

async function downloadAndUploadImage(imageUrl: string, tyreName: string, tyreBrand: string = 'Bridgestone'): Promise<number | null> {
  if (!imageUrl || imageUrl.includes("logo") || imageUrl.includes(".svg")) {
    return null;
  }

  try {
    // Always use png for processed images
    const filename = `${tyreName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

    // Check cache first (skip if --force-images)
    if (!forceImages && mediaCache.has(filename)) {
      return mediaCache.get(filename)!;
    }

    // Check if already uploaded
    const existingId = await findMediaByFilename(filename);
    if (existingId && !forceImages) {
      mediaCache.set(filename, existingId);
      return existingId;
    }

    // If forcing re-upload, delete existing media first
    if (existingId && forceImages) {
      console.log(`    Deleting existing image for re-upload...`);
      await deleteMedia(existingId);
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.log(`    Warning: Could not download image from ${imageUrl}`);
      return null;
    }

    let imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Remove background
    console.log(`    Removing background...`);
    imageBuffer = removeBackground(imageBuffer);

    // Create FormData for multipart upload
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: "image/png" });
    formData.append("file", blob, filename);
    formData.append("_payload", JSON.stringify({ alt: `${tyreBrand} ${tyreName}` }));

    // Upload to Payload Media
    const uploadResponse = await fetch(`${PAYLOAD_URL}/api/media`, {
      method: "POST",
      headers: {
        Authorization: `JWT ${authToken}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.log(`    Warning: Could not upload image: ${error}`);
      return null;
    }

    const uploadData = await uploadResponse.json();
    const mediaId = uploadData.doc?.id;

    if (mediaId) {
      mediaCache.set(filename, mediaId);
      console.log(`    Uploaded image: ${filename}`);
    }

    return mediaId;
  } catch (error) {
    console.log(`    Warning: Image error - ${error}`);
    return null;
  }
}

function determineVehicleTypes(name: string): string[] {
  const lower = name.toLowerCase();
  const types: string[] = ["passenger"];

  if (lower.includes("dueler") || lower.includes("a/t") || lower.includes("suv")) {
    types.push("suv");
  }
  if (lower.includes("potenza") || lower.includes("sport")) {
    types.push("sport");
  }

  return types;
}


async function importTyres() {
  // Login first
  authToken = await login();

  console.log("Loading scraped tyre data...");

  const dataPath = join(__dirname, "../data/prokoleso-tires.json");
  const rawData = readFileSync(dataPath, "utf-8");
  const tyres: ScrapedTire[] = JSON.parse(rawData);

  console.log(`Found ${tyres.length} tyres to import\n`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const tire of tyres) {
    try {
      const slug = tire.canonicalSlug;
      const existing = await findTyreBySlug(slug);

      // Upload image if available
      const brand = tire.brand || "bridgestone";
      const brandLabel = brand === "firestone" ? "Firestone" : "Bridgestone";
      let imageId: number | null = null;
      if (tire.imageUrl) {
        imageId = await downloadAndUploadImage(tire.imageUrl, tire.name, brandLabel);
      }

      const payload: PayloadTyre & { isPublished: boolean; image?: number } = {
        slug,
        name: tire.name,
        brand,
        season: tire.season,
        vehicleTypes: determineVehicleTypes(tire.name),
        sizes: tire.sizes,
        euLabel: tire.euLabel,
        isPublished: true,
      };

      // Add image reference if uploaded
      if (imageId) {
        payload.image = imageId;
      }

      if (existing) {
        await updateTyre(existing.id, payload);
        console.log(`  Updated: ${tire.name} (${tire.sizes.length} sizes)${imageId ? ' [+image]' : ''}`);
        updated++;
      } else {
        await createTyre(payload);
        console.log(`  Created: ${tire.name} (${tire.sizes.length} sizes)${imageId ? ' [+image]' : ''}`);
        created++;
      }
    } catch (error) {
      console.error(`  Error: ${tire.name} - ${error}`);
      errors++;
    }
  }

  console.log(`\n${"=".repeat(40)}`);
  console.log(`Import completed!`);
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errors}`);
  console.log(`${"=".repeat(40)}`);
}

importTyres().catch(console.error);
