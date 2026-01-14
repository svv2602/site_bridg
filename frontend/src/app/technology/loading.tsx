export default function Loading() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="animate-pulse">
              <div className="h-3 w-40 rounded bg-stone-200 dark:bg-white/10 mb-4" />
              <div className="h-10 w-3/4 rounded bg-stone-200 dark:bg-white/10 mb-2" />
              <div className="h-5 w-1/2 rounded bg-stone-200 dark:bg-white/10 mb-6" />
              <div className="h-4 w-full rounded bg-stone-200 dark:bg-white/10 mb-2" />
              <div className="h-4 w-4/5 rounded bg-stone-200 dark:bg-white/10 mb-6" />
              <div className="flex gap-4">
                <div className="h-12 w-40 rounded-full bg-stone-200 dark:bg-white/10" />
                <div className="h-12 w-36 rounded-full bg-stone-200 dark:bg-white/10" />
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-80 rounded-3xl bg-stone-200 dark:bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 h-8 w-48 mx-auto animate-pulse rounded bg-muted" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted" />
                <div className="h-5 w-24 mx-auto rounded bg-muted mb-2" />
                <div className="h-4 w-full rounded bg-muted mb-1" />
                <div className="h-4 w-3/4 mx-auto rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div>
                    <div className="h-6 w-40 rounded bg-muted mb-2" />
                    <div className="h-4 w-32 rounded bg-muted" />
                  </div>
                </div>
                <div className="h-4 w-full rounded bg-muted mb-2" />
                <div className="h-4 w-3/4 rounded bg-muted mb-8" />
                <div className="flex gap-4">
                  <div className="h-12 w-48 rounded-full bg-muted" />
                  <div className="h-12 w-56 rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
