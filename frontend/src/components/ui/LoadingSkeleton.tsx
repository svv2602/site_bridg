interface LoadingSkeletonProps {
  count?: number;
  variant?: 'card' | 'article' | 'list';
}

export function LoadingSkeleton({ count = 3, variant = 'card' }: LoadingSkeletonProps) {
  if (variant === 'article') {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-card overflow-hidden">
            <div className="h-48 bg-muted" />
            <div className="p-6">
              <div className="h-3 w-24 rounded bg-muted mb-3" />
              <div className="h-5 w-3/4 rounded bg-muted mb-2" />
              <div className="h-4 w-full rounded bg-muted mb-4" />
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-16 rounded-full bg-muted" />
                <div className="h-6 w-20 rounded-full bg-muted" />
              </div>
              <div className="h-10 w-full rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1">
                <div className="h-5 w-1/3 rounded bg-muted mb-2" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default card variant
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6">
          <div className="h-48 rounded-xl bg-muted mb-4" />
          <div className="h-5 w-3/4 rounded bg-muted mb-2" />
          <div className="h-4 w-1/2 rounded bg-muted mb-4" />
          <div className="h-4 w-full rounded bg-muted mb-2" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 rounded bg-zinc-700 mb-4" />
      <div className="h-10 w-3/4 rounded bg-zinc-700 mb-2" />
      <div className="h-6 w-1/2 rounded bg-zinc-700 mb-6" />
      <div className="h-4 w-full rounded bg-zinc-700 mb-2" />
      <div className="h-4 w-4/5 rounded bg-zinc-700 mb-6" />
      <div className="flex gap-4">
        <div className="h-12 w-40 rounded-full bg-zinc-700" />
        <div className="h-12 w-40 rounded-full bg-zinc-700" />
      </div>
    </div>
  );
}
