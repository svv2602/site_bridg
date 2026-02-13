/**
 * One-time migration: re-process existing media as WebP
 *
 * Downloads each PNG/JPEG from Payload, re-uploads it so the new
 * `formatOptions` pipeline converts to WebP and regenerates all sizes.
 *
 * Usage:
 *   cd backend-payload
 *   npx tsx content-automation/src/convert-media-to-webp.ts --dry-run
 *   npx tsx content-automation/src/convert-media-to-webp.ts --limit=5
 *   npx tsx content-automation/src/convert-media-to-webp.ts
 */

import { ENV } from "./config/env.js";

const PAYLOAD_URL = ENV.PAYLOAD_URL || "http://localhost:3001";
const SKIP_MIME_TYPES = ["image/svg+xml", "image/webp"];

interface MediaDoc {
  id: number;
  filename: string;
  mimeType: string;
  url: string;
  alt?: string;
  filesize?: number;
  width?: number;
  height?: number;
  removeBackground?: boolean;
  backgroundRemoved?: boolean;
  generationPrompt?: string;
  generationType?: string;
  generationSeason?: string;
  generationSize?: string;
}

interface PaginatedResponse {
  docs: MediaDoc[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
}

// ---- Auth ----

async function getAuthToken(): Promise<string> {
  const email = process.env.PAYLOAD_ADMIN_EMAIL;
  const password = process.env.PAYLOAD_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD required");
  }

  const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const data = await res.json();
  return data.token;
}

// ---- Fetch all media ----

async function fetchAllMedia(token: string): Promise<MediaDoc[]> {
  const allDocs: MediaDoc[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `${PAYLOAD_URL}/api/media?limit=100&page=${page}&sort=id`,
      { headers: { Authorization: `JWT ${token}` } }
    );
    if (!res.ok) throw new Error(`Failed to fetch media: ${res.status}`);
    const data: PaginatedResponse = await res.json();
    allDocs.push(...data.docs);
    if (!data.hasNextPage) break;
    page++;
  }

  return allDocs;
}

// ---- Re-upload a single media doc ----

async function reUploadMedia(
  doc: MediaDoc,
  token: string
): Promise<{ newId: number; newFilename: string; newFilesize: number }> {
  // 1. Download original file — rewrite public URLs to local Payload URL
  let imageUrl: string;
  if (doc.url.startsWith("http")) {
    const parsed = new URL(doc.url);
    imageUrl = `${PAYLOAD_URL}${parsed.pathname}`;
  } else {
    imageUrl = `${PAYLOAD_URL}${doc.url}`;
  }

  const downloadRes = await fetch(imageUrl);
  if (!downloadRes.ok) {
    throw new Error(`Download failed for ${doc.filename}: ${downloadRes.status}`);
  }
  const imageBuffer = await downloadRes.arrayBuffer();

  // 2. Build FormData for re-upload
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: doc.mimeType });
  formData.append("file", blob, doc.filename);

  // Preserve metadata
  const payload: Record<string, unknown> = {
    alt: doc.alt || doc.filename.replace(/\.[^.]+$/, "").replace(/-/g, " "),
  };
  if (doc.removeBackground) payload.removeBackground = true;
  if (doc.generationPrompt) payload.generationPrompt = doc.generationPrompt;
  if (doc.generationType) payload.generationType = doc.generationType;
  if (doc.generationSeason) payload.generationSeason = doc.generationSeason;
  if (doc.generationSize) payload.generationSize = doc.generationSize;

  formData.append("_payload", JSON.stringify(payload));

  // 3. Delete old media
  const deleteRes = await fetch(`${PAYLOAD_URL}/api/media/${doc.id}`, {
    method: "DELETE",
    headers: { Authorization: `JWT ${token}` },
  });
  if (!deleteRes.ok) {
    throw new Error(`Delete failed for ID ${doc.id}: ${deleteRes.status}`);
  }

  // 4. Upload (triggers WebP conversion via formatOptions)
  const uploadRes = await fetch(`${PAYLOAD_URL}/api/media`, {
    method: "POST",
    headers: { Authorization: `JWT ${token}` },
    body: formData,
  });
  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Upload failed: ${uploadRes.status} ${errText}`);
  }

  const result = await uploadRes.json();
  return {
    newId: result.doc.id,
    newFilename: result.doc.filename,
    newFilesize: result.doc.filesize,
  };
}

// ---- Update references ----

async function updateReferences(
  oldId: number,
  newId: number,
  token: string
): Promise<string[]> {
  const updated: string[] = [];

  // Collections that reference media
  const collections = [
    { slug: "tyres", field: "image" },
    { slug: "articles", field: "image" },
    { slug: "category-pages", field: "heroImage" },
    { slug: "technologies", field: "icon" },
  ];

  for (const { slug, field } of collections) {
    const searchRes = await fetch(
      `${PAYLOAD_URL}/api/${slug}?where[${field}][equals]=${oldId}&limit=100`,
      { headers: { Authorization: `JWT ${token}` } }
    );
    if (!searchRes.ok) continue;

    const data = await searchRes.json();
    for (const doc of data.docs || []) {
      const patchRes = await fetch(`${PAYLOAD_URL}/api/${slug}/${doc.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({ [field]: newId }),
      });
      if (patchRes.ok) {
        updated.push(`${slug}/${doc.id}`);
      }
    }
  }

  return updated;
}

// ---- Format bytes ----

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---- Main ----

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

  if (args.includes("--help")) {
    console.log(`
Convert existing media to WebP format

Usage:
  npx tsx content-automation/src/convert-media-to-webp.ts [options]

Options:
  --dry-run    Preview without making changes
  --limit=N    Process only first N images
  --help       Show this help
`);
    process.exit(0);
  }

  console.log("=== Media WebP Migration ===");
  console.log(`Payload URL: ${PAYLOAD_URL}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  if (limit < Infinity) console.log(`Limit: ${limit}`);
  console.log();

  // Authenticate
  const token = await getAuthToken();
  console.log("Authenticated.\n");

  // Fetch all media
  const allMedia = await fetchAllMedia(token);
  console.log(`Total media documents: ${allMedia.length}`);

  // Filter to convertible images (skip SVGs, already-WebP)
  const toConvert = allMedia.filter((doc) => {
    if (SKIP_MIME_TYPES.includes(doc.mimeType)) return false;
    if (!doc.mimeType?.startsWith("image/")) return false;
    // Skip if filename already ends with .webp (already converted)
    if (doc.filename?.endsWith(".webp")) return false;
    return true;
  });

  const batch = toConvert.slice(0, limit);
  console.log(`To convert: ${toConvert.length} (processing ${batch.length})\n`);

  if (batch.length === 0) {
    console.log("Nothing to convert.");
    return;
  }

  let converted = 0;
  let failed = 0;
  let totalSavedBytes = 0;

  for (let i = 0; i < batch.length; i++) {
    const doc = batch[i];
    const progress = `[${i + 1}/${batch.length}]`;
    const originalSize = doc.filesize ? formatBytes(doc.filesize) : "unknown";

    if (dryRun) {
      console.log(
        `${progress} Would convert: ${doc.filename} (${originalSize}, ${doc.mimeType})`
      );
      converted++;
      continue;
    }

    try {
      process.stdout.write(
        `${progress} Converting ${doc.filename} (${originalSize})...`
      );

      const result = await reUploadMedia(doc, token);
      const newSize = formatBytes(result.newFilesize);
      const saved = (doc.filesize || 0) - result.newFilesize;
      if (saved > 0) totalSavedBytes += saved;

      // Update references if ID changed
      let refInfo = "";
      if (result.newId !== doc.id) {
        const refs = await updateReferences(doc.id, result.newId, token);
        if (refs.length > 0) {
          refInfo = ` | refs updated: ${refs.join(", ")}`;
        }
      }

      console.log(
        ` ${result.newFilename} (${newSize}, saved ${formatBytes(Math.max(0, saved))})${refInfo}`
      );
      converted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(` FAILED: ${msg}`);
      failed++;
    }

    // Small delay between operations
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("\n=== Summary ===");
  console.log(`Converted: ${converted}`);
  if (failed > 0) console.log(`Failed: ${failed}`);
  if (!dryRun && totalSavedBytes > 0) {
    console.log(`Total space saved: ${formatBytes(totalSavedBytes)}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
