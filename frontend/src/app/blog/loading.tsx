export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Завантаження" className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-4xl animate-pulse">
            <div className="mb-2 h-4 w-32 rounded bg-stone-200 dark:bg-white/10" />
            <div className="mb-4 h-10 w-3/4 rounded bg-stone-200 dark:bg-white/10" />
            <div className="h-5 w-1/2 rounded bg-stone-200 dark:bg-white/10" />
          </div>
        </div>
      </section>

      {/* Search and tags skeleton */}
      <section className="border-b border-border bg-card py-6">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 animate-pulse">
          <div className="mb-6 h-10 w-full max-w-md rounded-full bg-skeleton" />
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-full bg-skeleton" />
            ))}
          </div>
        </div>
      </section>

      {/* Articles skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 flex items-center justify-between animate-pulse">
            <div className="h-8 w-48 rounded bg-skeleton" />
            <div className="h-10 w-24 rounded-full bg-skeleton" />
          </div>
          <div className="grid gap-8 pt-2 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="h-48 bg-skeleton" />
                <div className="p-6">
                  <div className="mb-3 h-4 w-24 rounded bg-skeleton" />
                  <div className="mb-2 h-6 w-full rounded bg-skeleton" />
                  <div className="mb-4 h-4 w-3/4 rounded bg-skeleton" />
                  <div className="mb-6 space-y-2">
                    <div className="h-4 w-full rounded bg-skeleton" />
                    <div className="h-4 w-2/3 rounded bg-skeleton" />
                  </div>
                  <div className="h-10 w-full rounded-full bg-skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
