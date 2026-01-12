/**
 * Import scraped tyres to Payload CMS
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Types
interface ScrapedTire {
  name: string;
  sourceSlug: string;
  canonicalSlug: string;
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
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

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

async function downloadAndUploadImage(imageUrl: string, tyreName: string): Promise<number | null> {
  if (!imageUrl || imageUrl.includes("logo") || imageUrl.includes(".svg")) {
    return null;
  }

  try {
    // Generate a consistent filename based on tyre name
    const extension = imageUrl.split(".").pop()?.split("?")[0] || "png";
    const filename = `${tyreName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${extension}`;

    // Check cache first
    if (mediaCache.has(filename)) {
      return mediaCache.get(filename)!;
    }

    // Check if already uploaded
    const existingId = await findMediaByFilename(filename);
    if (existingId) {
      mediaCache.set(filename, existingId);
      return existingId;
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.log(`    Warning: Could not download image from ${imageUrl}`);
      return null;
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Create FormData for multipart upload
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: `image/${extension}` });
    formData.append("file", blob, filename);
    // Payload CMS expects _payload JSON field for additional data
    formData.append("_payload", JSON.stringify({ alt: `Bridgestone ${tyreName}` }));

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

function createShortDescription(tire: ScrapedTire): string {
  const seasonNames: Record<string, string> = {
    summer: "Літня",
    winter: "Зимова",
    allseason: "Всесезонна",
  };

  const season = seasonNames[tire.season] || "Літня";
  return `${season} шина Bridgestone ${tire.name}. Доступно ${tire.sizes.length} типорозмірів.`;
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
      let imageId: number | null = null;
      if (tire.imageUrl) {
        imageId = await downloadAndUploadImage(tire.imageUrl, tire.name);
      }

      const payload: PayloadTyre & { isPublished: boolean; image?: number } = {
        slug,
        name: tire.name,
        season: tire.season,
        vehicleTypes: determineVehicleTypes(tire.name),
        shortDescription: createShortDescription(tire),
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
