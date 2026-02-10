export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Завантаження" className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-5 animate-pulse">
              <div className="h-8 w-48 rounded-full bg-stone-200 dark:bg-white/10" />
              <div className="h-12 w-3/4 rounded bg-stone-200 dark:bg-white/10" />
              <div className="h-6 w-1/2 rounded bg-stone-200 dark:bg-white/10" />
              <div className="h-4 w-full max-w-xl rounded bg-stone-200 dark:bg-white/10" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-5 w-full rounded bg-stone-200 dark:bg-white/10" />
                ))}
              </div>
              {/* QuickSearchForm skeleton */}
              <div className="mt-4 rounded-2xl border border-stone-200 dark:border-white/10 p-4">
                <div className="mb-3 flex gap-2">
                  <div className="h-9 w-28 rounded-full bg-stone-200 dark:bg-white/10" />
                  <div className="h-9 w-28 rounded-full bg-stone-200 dark:bg-white/10" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 rounded-xl bg-stone-200 dark:bg-white/10" />
                  ))}
                </div>
                <div className="mt-3 h-10 w-full rounded-full bg-stone-200 dark:bg-white/10" />
              </div>
            </div>
            <div className="space-y-6 animate-pulse">
              <div className="h-64 rounded-2xl bg-stone-200 dark:bg-white/10 lg:h-80" />
              <div className="h-48 rounded-2xl bg-stone-200 dark:bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Product carousel skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 h-8 w-64 animate-pulse rounded bg-skeleton" />
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-72 flex-shrink-0 animate-pulse rounded-2xl border border-border bg-card p-6">
                <div className="h-48 rounded-xl bg-skeleton mb-4" />
                <div className="h-5 w-3/4 rounded bg-skeleton mb-2" />
                <div className="h-4 w-1/2 rounded bg-skeleton" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 h-8 w-64 animate-pulse rounded bg-skeleton" />
            <div className="mx-auto h-5 w-96 animate-pulse rounded bg-skeleton" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-skeleton" />
                <div className="mx-auto mb-2 h-6 w-3/4 rounded bg-skeleton" />
                <div className="mx-auto h-4 w-full rounded bg-skeleton" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
