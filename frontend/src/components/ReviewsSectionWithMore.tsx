'use client';

import { useState, useCallback } from 'react';
import { MessageSquare, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ReviewCard, type Review } from './ReviewCard';

interface ReviewsSectionWithMoreProps {
  initialReviews: Review[];
  tyreId: number;
  totalCount: number;
  title?: string;
}

export function ReviewsSectionWithMore({
  initialReviews,
  tyreId,
  totalCount,
  title = 'Відгуки покупців',
}: ReviewsSectionWithMoreProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(totalCount > initialReviews.length);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const offset = reviews.length;
      const limit = 6;

      // Use a relative Next.js API route to proxy the request server-side.
      // This avoids exposing the internal Payload URL to the browser and works
      // correctly in both development (localhost) and production environments.
      const response = await fetch(
        `/api/reviews/more?tyreId=${tyreId}&limit=${limit}&offset=${offset}`
      );

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Payload API response
      const newReviews: Review[] = (data.docs || []).map((doc: any) => ({
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

      setReviews((prev) => [...prev, ...newReviews]);
      setHasMore(reviews.length + newReviews.length < totalCount);
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [reviews.length, tyreId, totalCount, isLoading, hasMore]);

  if (reviews.length === 0) {
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
            <div>
              <div className="heading-2 text-2xl font-bold">{title}</div>
              <p className="text-sm text-muted-foreground">
                {totalCount} {totalCount === 1 ? 'відгук' : totalCount < 5 ? 'відгуки' : 'відгуків'}
              </p>
            </div>
          </div>

          <Link
            href="/reviews"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Всі відгуки
          </Link>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 dark:border-stone-600 bg-card px-6 py-3 font-semibold transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-stone-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Завантаження...
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Показати ще відгуки
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
