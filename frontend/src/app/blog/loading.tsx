export default function BlogLoading() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-2 h-4 w-32 animate-pulse rounded bg-stone-200 dark:bg-white/10" />
            <div className="mb-4 h-10 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-white/10" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-stone-200 dark:bg-white/10" />
          </div>
        </div>
      </section>

      {/* Search and tags skeleton */}
      <section className="border-b border-border bg-card py-6">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-6 h-10 w-full max-w-md animate-pulse rounded-full bg-muted" />
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
        </div>
      </section>

      {/* Articles skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="h-48 animate-pulse bg-muted" />
                <div className="p-6">
                  <div className="mb-3 h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="mb-2 h-6 w-full animate-pulse rounded bg-muted" />
                  <div className="mb-4 h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="mb-6 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-10 w-full animate-pulse rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
