import { NextResponse } from 'next/server';

// Internal API URL for server-side requests (container-to-container in Docker)
const PAYLOAD_API_URL =
  process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';

/**
 * GET /api/reviews/more
 * Proxy endpoint to load more reviews from Payload CMS.
 * Keeps the Payload URL server-side, avoiding client-side exposure of internal URLs.
 *
 * Query params:
 *   - tyreId: required, the tyre ID
 *   - offset: the number of reviews to skip
 *   - limit: the number of reviews to fetch (default 6)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tyreId = searchParams.get('tyreId');
    const offset = searchParams.get('offset') || '0';
    const limit = searchParams.get('limit') || '6';

    if (!tyreId) {
      return NextResponse.json(
        { error: 'tyreId is required' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    params.set('where[tyre][equals]', tyreId);
    params.set('where[isPublished][equals]', 'true');
    params.set('limit', limit);
    params.set('offset', offset);
    params.set('depth', '1');

    const url = `${PAYLOAD_API_URL}/api/reviews?${params.toString()}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour, aligned with review caching strategy
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
