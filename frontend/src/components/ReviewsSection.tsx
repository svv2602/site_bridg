import { MessageSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ReviewCard } from './ReviewCard';
import {
  getReviews,
  getReviewsByTyre,
  getReviewsBySeason,
  getReviewsByVehicleType,
  getRandomReviews,
} from '@/lib/api/reviews';

interface ReviewsSectionProps {
  tyreId?: number;
  season?: 'summer' | 'winter' | 'allseason';
  vehicleType?: 'passenger' | 'suv' | 'van';
  limit?: number;
  title?: string;
  showTyreName?: boolean;
  showAllLink?: boolean;
}

export async function ReviewsSection({
  tyreId,
  season,
  vehicleType,
  limit = 3,
  title = 'Відгуки покупців',
  showTyreName = false,
  showAllLink = false,
}: ReviewsSectionProps) {
  // Fetch reviews based on props
  let reviews;

  if (tyreId) {
    reviews = await getReviewsByTyre(tyreId, limit);
  } else if (season) {
    reviews = await getReviewsBySeason(season, limit);
  } else if (vehicleType) {
    reviews = await getReviewsByVehicleType(vehicleType, limit);
  } else {
    reviews = await getRandomReviews(limit);
  }

  // Don't render if no reviews
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
              <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>

          {showAllLink && (
            <Link
              href="/reviews"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Всі відгуки
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showTyreName={showTyreName || !tyreId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
