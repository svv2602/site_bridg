export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Завантаження" className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-4xl animate-pulse">
            <div className="mb-2 h-4 w-32 rounded bg-stone-200 dark:bg-white/10" />
            <div className="mb-4 h-10 w-3/4 rounded bg-stone-200 dark:bg-white/10" />
            <div className="mb-2 h-5 w-1/2 rounded bg-stone-200 dark:bg-white/10" />
            <div className="h-4 w-2/3 rounded bg-stone-200 dark:bg-white/10" />
          </div>
        </div>
      </section>

      {/* Search & Map skeleton */}
      <section className="pt-8 pb-4">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
                <div className="mb-4 h-7 w-40 rounded bg-skeleton" />
                <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1 h-12 rounded-xl bg-skeleton" />
                  <div className="h-12 w-48 rounded-xl bg-skeleton" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-6 w-48 rounded bg-skeleton" />
                  <div className="h-10 w-32 rounded-full bg-skeleton" />
                </div>
              </div>
            </div>
            <div className="hidden lg:block rounded-2xl border border-border bg-card p-6 animate-pulse">
              <div className="mb-4 h-6 w-40 rounded bg-skeleton" />
              <div className="h-80 rounded-xl bg-skeleton" />
            </div>
          </div>
        </div>
      </section>

      {/* Dealers list skeleton */}
      <section className="pb-8">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-4 h-8 w-48 animate-pulse rounded bg-skeleton" />
          <div className="grid gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 h-6 w-32 rounded-full bg-skeleton" />
                <div className="mb-2 h-6 w-3/4 rounded bg-skeleton" />
                <div className="mb-4 h-4 w-2/3 rounded bg-skeleton" />
                <div className="space-y-3">
                  <div className="h-5 w-full rounded bg-skeleton" />
                  <div className="h-5 w-full rounded bg-skeleton" />
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="h-10 w-28 rounded-full bg-skeleton" />
                  <div className="h-10 flex-1 rounded-full bg-skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
