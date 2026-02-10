interface LoadingSkeletonProps {
  count?: number;
  variant?: 'card' | 'article' | 'list';
}

export function LoadingSkeleton({ count = 3, variant = 'card' }: LoadingSkeletonProps) {
  if (variant === 'article') {
    return (
      <div role="status" aria-label="Завантаження" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-card overflow-hidden">
            <div className="h-48 bg-skeleton" />
            <div className="p-6">
              <div className="h-3 w-24 rounded bg-skeleton mb-3" />
              <div className="h-5 w-3/4 rounded bg-skeleton mb-2" />
              <div className="h-4 w-full rounded bg-skeleton mb-4" />
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-16 rounded-full bg-skeleton" />
                <div className="h-6 w-20 rounded-full bg-skeleton" />
              </div>
              <div className="h-10 w-full rounded-full bg-skeleton" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div role="status" aria-label="Завантаження" className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-full bg-skeleton flex-shrink-0" />
              <div className="flex-1">
                <div className="h-5 w-1/3 rounded bg-skeleton mb-2" />
                <div className="h-4 w-2/3 rounded bg-skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default card variant
  return (
    <div role="status" aria-label="Завантаження" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6">
          <div className="h-48 rounded-xl bg-skeleton mb-4" />
          <div className="h-5 w-3/4 rounded bg-skeleton mb-2" />
          <div className="h-4 w-1/2 rounded bg-skeleton mb-4" />
          <div className="h-4 w-full rounded bg-skeleton mb-2" />
          <div className="h-4 w-2/3 rounded bg-skeleton" />
        </div>
      ))}
    </div>
  );
}
