export function CategoryLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Завантаження" className="bg-background text-foreground">
      {/* Hero skeleton */}
      <div className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-4xl animate-pulse">
            <div className="mb-2 h-4 w-48 rounded bg-stone-300/30" />
            <div className="mb-4 h-10 w-96 rounded bg-stone-300/30" />
            <div className="h-5 w-72 rounded bg-stone-300/30" />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 h-8 w-64 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
          <div className="grid gap-6 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
