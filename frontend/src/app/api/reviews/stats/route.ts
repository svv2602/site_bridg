import { NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/rate-limit';

// Internal API URL for server-side requests (container-to-container in Docker)
const PAYLOAD_API_URL =
  process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';

// Rate limiter: max 30 requests per minute per IP
const statsLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60 * 1000 });

interface ReviewDoc {
  id: number;
  rating: number;
}

interface ReviewStatsResponse {
  averageRating: number;
  totalCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

/**
 * GET /api/reviews/stats
 * Server-side review stats aggregation.
 * Optional query param: ?tyreSlug=xxx to filter by tyre slug
 *
 * Returns: { averageRating, totalCount, distribution: { 1: count, 2: count, ... } }
 */
export async function GET(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    if (!statsLimiter.check(ip)) {
      return NextResponse.json(
        { error: 'Забагато запитів. Спробуйте через хвилину.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tyreSlug = searchParams.get('tyreSlug');

    // Build Payload query
    const params = new URLSearchParams();
    params.set('where[isPublished][equals]', 'true');
    params.set('limit', '500');
    params.set('depth', '0');
    // Only select rating to minimize payload
    params.set('select[rating]', 'true');

    if (tyreSlug) {
      // We need to resolve slug -> id. Fetch the tyre first.
      const tyreRes = await fetch(
        `${PAYLOAD_API_URL}/api/tyres?where[slug][equals]=${encodeURIComponent(tyreSlug)}&limit=1&depth=0&select[id]=true`,
        { next: { revalidate: 3600 } }
      );

      if (tyreRes.ok) {
        const tyreData = await tyreRes.json();
        const tyreId = tyreData.docs?.[0]?.id;
        if (tyreId) {
          params.set('where[tyre][equals]', String(tyreId));
        } else {
          // Tyre not found — return empty stats
          return NextResponse.json({
            averageRating: 0,
            totalCount: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          });
        }
      }
    }

    const url = `${PAYLOAD_API_URL}/api/reviews?${params.toString()}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('Failed to fetch reviews for stats:', response.status);
      return NextResponse.json(
        { error: 'Помилка завантаження відгуків' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reviews: ReviewDoc[] = data.docs || [];
    const totalCount = data.totalDocs ?? reviews.length;

    // Compute distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;

    for (const review of reviews) {
      const r = Math.round(review.rating);
      if (r >= 1 && r <= 5) {
        distribution[r]++;
        ratingSum += review.rating;
      }
    }

    const averageRating = reviews.length > 0
      ? Math.round((ratingSum / reviews.length) * 10) / 10
      : 0;

    const stats: ReviewStatsResponse = {
      averageRating,
      totalCount,
      distribution: distribution as ReviewStatsResponse['distribution'],
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error computing review stats:', error);
    return NextResponse.json(
      { error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}
