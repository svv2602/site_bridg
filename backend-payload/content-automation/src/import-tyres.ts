/**
 * Import scraped tyres to Payload CMS
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
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

      const payload: PayloadTyre = {
        slug,
        name: tire.name,
        season: tire.season,
        vehicleTypes: determineVehicleTypes(tire.name),
        shortDescription: createShortDescription(tire),
        sizes: tire.sizes,
      };

      if (existing) {
        await updateTyre(existing.id, payload);
        console.log(`  Updated: ${tire.name} (${tire.sizes.length} sizes)`);
        updated++;
      } else {
        await createTyre(payload);
        console.log(`  Created: ${tire.name} (${tire.sizes.length} sizes)`);
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
