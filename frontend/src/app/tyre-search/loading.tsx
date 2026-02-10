export default function TyreSearchLoading() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="animate-pulse">
            <div className="mb-2 h-4 w-32 rounded bg-stone-200 dark:bg-white/10" />
            <div className="mb-4 h-10 w-2/3 rounded bg-stone-200 dark:bg-white/10" />
            <div className="mb-6 h-5 w-1/2 rounded bg-stone-200 dark:bg-white/10" />
          </div>
        </div>
      </section>

      {/* Search form skeleton */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 animate-pulse">
            {/* Tabs */}
            <div className="mb-6 flex gap-4">
              <div className="h-10 w-32 rounded-full bg-muted" />
              <div className="h-10 w-32 rounded-full bg-muted" />
            </div>
            {/* Select fields */}
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-muted" />
              ))}
            </div>
            <div className="mt-6 h-12 w-full rounded-full bg-muted" />
          </div>
        </div>
      </section>

      {/* Results skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6">
                <div className="h-48 rounded-xl bg-muted mb-4" />
                <div className="h-5 w-3/4 rounded bg-muted mb-2" />
                <div className="h-4 w-1/2 rounded bg-muted mb-4" />
                <div className="h-10 w-full rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
