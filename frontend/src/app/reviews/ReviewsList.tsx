"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ReviewCard, type Review } from "@/components/ReviewCard";

const REVIEWS_PER_PAGE = 10;

interface ReviewsListProps {
  reviews: Review[];
  showTyreName?: boolean;
}

export function ReviewsList({ reviews, showTyreName = false }: ReviewsListProps) {
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;
  const remaining = reviews.length - visibleCount;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} showTyreName={showTyreName} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + REVIEWS_PER_PAGE)}
            className="flex items-center gap-2 rounded-full border border-stone-300 bg-transparent px-6 py-3 text-sm font-medium transition-colors hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700"
          >
            <ChevronDown className="h-4 w-4" />
            Показати ще відгуки ({remaining} залишилось)
          </button>
        </div>
      )}
    </>
  );
}
