import type { Review } from '@/components/ReviewCard';

// Internal API URL for server-side requests (container-to-container in Docker)
const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';

interface GetReviewsOptions {
  tyreId?: number;
  season?: 'summer' | 'winter' | 'allseason';
  vehicleType?: 'passenger' | 'suv' | 'van';
  limit?: number;
  random?: boolean;
}

interface ReviewDoc {
  id: number;
  authorName: string;
  authorCity?: string;
  rating: number;
  title: string;
  content: string;
  pros?: Array<{ text: string }>;
  cons?: Array<{ text: string }>;
  vehicleInfo?: string;
  usagePeriod?: string;
  isGenerated?: boolean;
  isPublished: boolean;
  createdAt: string;
  tyre: {
    id: number;
    name: string;
    slug: string;
    season: string;
    vehicleTypes: string[];
  };
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get reviews with optional filtering
 */
export async function getReviews(options: GetReviewsOptions = {}): Promise<Review[]> {
  const { tyreId, season, vehicleType, limit = 3, random = true } = options;

  try {
    // Build query
    const whereConditions: string[] = ['where[isPublished][equals]=true'];

    if (tyreId) {
      whereConditions.push(`where[tyre][equals]=${tyreId}`);
    }

    // For season/vehicleType filtering, we need to filter by tyre properties
    // We'll fetch more and filter client-side since Payload doesn't support deep filtering well
    const fetchLimit = season || vehicleType ? 100 : (random ? 50 : limit);

    const queryString = whereConditions.join('&');
    const url = `${PAYLOAD_API_URL}/api/reviews?${queryString}&limit=${fetchLimit}&depth=1`;

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error('Failed to fetch reviews:', response.status);
      return [];
    }

    const data = await response.json();
    let reviews: ReviewDoc[] = data.docs || [];

    // Filter by season if specified
    if (season) {
      reviews = reviews.filter((r) => r.tyre?.season === season);
    }

    // Filter by vehicle type if specified
    if (vehicleType) {
      reviews = reviews.filter((r) => r.tyre?.vehicleTypes?.includes(vehicleType));
    }

    // Shuffle for random selection, or sort by rating/date for stable SEO output
    if (random) {
      reviews = shuffleArray(reviews);
    } else {
      // Stable sort: highest rating first, then newest first
      reviews = reviews.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    // Limit results
    reviews = reviews.slice(0, limit);

    // Map to Review type
    return reviews.map((doc) => ({
      id: doc.id,
      authorName: doc.authorName,
      authorCity: doc.authorCity,
      rating: doc.rating,
      title: doc.title,
      content: doc.content,
      pros: doc.pros,
      cons: doc.cons,
      vehicleInfo: doc.vehicleInfo,
      usagePeriod: doc.usagePeriod,
      isGenerated: doc.isGenerated,
      createdAt: doc.createdAt,
      tyre: doc.tyre
        ? {
            id: doc.tyre.id,
            name: doc.tyre.name,
            slug: doc.tyre.slug,
          }
        : undefined,
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

/**
 * Get reviews for a specific tyre
 * @param tyreId - The tyre ID to get reviews for
 * @param limit - Maximum number of reviews to return
 * @param random - Whether to randomize the order (default: true for display, false for schema.org)
 */
export async function getReviewsByTyre(tyreId: number, limit = 3, random = true): Promise<Review[]> {
  return getReviews({ tyreId, limit, random });
}

/**
 * Get reviews for a specific season
 */
export async function getReviewsBySeason(
  season: 'summer' | 'winter' | 'allseason',
  limit = 3
): Promise<Review[]> {
  return getReviews({ season, limit, random: true });
}

/**
 * Get reviews for a specific vehicle type
 */
export async function getReviewsByVehicleType(
  vehicleType: 'passenger' | 'suv' | 'van',
  limit = 3
): Promise<Review[]> {
  return getReviews({ vehicleType, limit, random: true });
}

/**
 * Get random reviews from all available
 */
export async function getRandomReviews(limit = 3): Promise<Review[]> {
  return getReviews({ limit, random: true });
}

/**
 * Get review stats for a tyre
 */
export async function getReviewStats(tyreId: number): Promise<{
  totalCount: number;
  averageRating: number;
}> {
  try {
    const url = `${PAYLOAD_API_URL}/api/reviews?where[tyre][equals]=${tyreId}&where[isPublished][equals]=true&limit=100`;

    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return { totalCount: 0, averageRating: 0 };
    }

    const data = await response.json();
    const reviews: ReviewDoc[] = data.docs || [];

    if (reviews.length === 0) {
      return { totalCount: 0, averageRating: 0 };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Math.round((sum / reviews.length) * 10) / 10;

    return {
      totalCount: reviews.length,
      averageRating,
    };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return { totalCount: 0, averageRating: 0 };
  }
}
