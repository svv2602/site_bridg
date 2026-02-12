import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3010';
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

async function revalidateOnFrontend(
  collection: string,
  slug?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger?: any,
): Promise<void> {
  if (!REVALIDATION_SECRET) {
    logger?.warn('[Revalidate] REVALIDATION_SECRET not set, skipping');
    return;
  }

  const url = `${FRONTEND_URL}/api/revalidate`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: REVALIDATION_SECRET, collection, slug }),
    });

    if (res.ok) {
      const data = await res.json();
      logger?.info(`[Revalidate] ${collection}${slug ? `/${slug}` : ''} → paths: ${data.paths?.join(', ')}`);
    } else {
      logger?.error(`[Revalidate] Failed (${res.status}): ${await res.text()}`);
    }
  } catch (error) {
    logger?.error(
      `[Revalidate] Could not reach frontend at ${url}: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export function createRevalidateHook(collection: string) {
  const afterChange: CollectionAfterChangeHook = ({ doc, req }) => {
    setImmediate(() => {
      revalidateOnFrontend(collection, doc.slug, req.payload.logger).catch(() => {});
    });
    return doc;
  };

  const afterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
    setImmediate(() => {
      revalidateOnFrontend(collection, doc.slug, req.payload.logger).catch(() => {});
    });
    return doc;
  };

  return { afterChange, afterDelete };
}
