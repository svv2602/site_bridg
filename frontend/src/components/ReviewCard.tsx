import { Star, Check, X, User, Car, Clock } from 'lucide-react';

interface Review {
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
  createdAt?: string;
  tyre?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface ReviewCardProps {
  review: Review;
  showTyreName?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-stone-300 text-stone-300 dark:fill-stone-600 dark:text-stone-600'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-foreground">{rating}.0</span>
    </div>
  );
}

export function ReviewCard({ review, showTyreName = false }: ReviewCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-card p-5 dark:border-stone-700">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <StarRating rating={review.rating} />
        {!review.isGenerated && (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Check className="h-3 w-3" />
            Підтверджено
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="mb-2 text-base font-semibold">&ldquo;{review.title}&rdquo;</h4>

      {/* Content */}
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{review.content}</p>

      {/* Pros & Cons */}
      {((review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0)) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {review.pros?.map((pro, i) => (
            <span
              key={`pro-${i}`}
              className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
            >
              <Check className="h-3 w-3" />
              {pro.text}
            </span>
          ))}
          {review.cons?.map((con, i) => (
            <span
              key={`con-${i}`}
              className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            >
              <X className="h-3 w-3" />
              {con.text}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-200 pt-3 text-xs text-muted-foreground dark:border-stone-700">
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5 text-primary" />
          {review.authorName}
          {review.authorCity && <span>, {review.authorCity}</span>}
        </span>

        {review.vehicleInfo && (
          <span className="flex items-center gap-1">
            <Car className="h-3.5 w-3.5 text-blue-500" />
            {review.vehicleInfo}
          </span>
        )}

        {review.usagePeriod && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-orange-500" />
            {review.usagePeriod}
          </span>
        )}
      </div>

      {/* Tyre name (if showing) */}
      {showTyreName && review.tyre && (
        <div className="mt-3 border-t border-stone-200 pt-3 dark:border-stone-700">
          <span className="text-xs text-muted-foreground">
            Відгук на:{' '}
            <a
              href={`/shyny/${review.tyre.slug}`}
              className="font-medium text-primary hover:underline"
            >
              {review.tyre.name}
            </a>
          </span>
        </div>
      )}
    </div>
  );
}

export type { Review };
