import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

const COLLECTION_PATHS: Record<string, { listing: string; detail: (slug: string) => string }> = {
  articles: {
    listing: '/blog',
    detail: (slug) => `/blog/${slug}`,
  },
  tyres: {
    listing: '/shyny',
    detail: (slug) => `/shyny/${slug}`,
  },
};

export async function POST(request: NextRequest) {
  if (!REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'REVALIDATION_SECRET not configured' }, { status: 500 });
  }

  let body: { secret?: string; collection?: string; slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.secret !== REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const { collection, slug } = body;

  if (!collection || !COLLECTION_PATHS[collection]) {
    return NextResponse.json(
      { error: `Unknown collection: ${collection}` },
      { status: 400 }
    );
  }

  const config = COLLECTION_PATHS[collection];
  const revalidatedPaths: string[] = [];

  // Always revalidate the listing page
  revalidatePath(config.listing);
  revalidatedPaths.push(config.listing);

  // Revalidate the detail page if slug is provided
  if (slug) {
    const detailPath = config.detail(slug);
    revalidatePath(detailPath);
    revalidatedPaths.push(detailPath);
  }

  // Also revalidate homepage (it may show latest articles/tyres)
  revalidatePath('/');
  revalidatedPaths.push('/');

  return NextResponse.json({ revalidated: true, paths: revalidatedPaths });
}
