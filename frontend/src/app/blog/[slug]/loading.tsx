export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Завантаження" className="bg-background text-foreground">
      {/* Hero skeleton — matches article page: dark gradient, max-w-4xl */}
      <section className="border-b border-border bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 py-8 md:py-12">
        <div className="container mx-auto max-w-4xl px-4 md:px-8">
          <div className="animate-pulse">
            <div className="mb-2 h-4 w-48 rounded bg-white/10" />
            <div className="mb-4 h-12 w-3/4 rounded bg-white/10" />
            <div className="mb-6 h-5 w-1/2 rounded bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-32 rounded bg-white/10" />
              <div className="h-4 w-24 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Article content skeleton — matches article page: max-w-6xl with sidebar grid */}
      <section className="py-10">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_240px]">
            <div className="animate-pulse space-y-4 max-w-4xl">
              <div className="h-5 w-full rounded bg-skeleton" />
              <div className="h-5 w-full rounded bg-skeleton" />
              <div className="h-5 w-3/4 rounded bg-skeleton" />
              <div className="h-8 w-0" />
              <div className="h-5 w-full rounded bg-skeleton" />
              <div className="h-5 w-full rounded bg-skeleton" />
              <div className="h-5 w-5/6 rounded bg-skeleton" />
              <div className="h-8 w-0" />
              <div className="h-64 w-full rounded-xl bg-skeleton" />
              <div className="h-8 w-0" />
              <div className="h-5 w-full rounded bg-skeleton" />
              <div className="h-5 w-full rounded bg-skeleton" />
              <div className="h-5 w-2/3 rounded bg-skeleton" />
            </div>

            {/* Sidebar skeleton (table of contents) */}
            <aside className="hidden lg:block">
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-32 rounded bg-skeleton" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 w-full rounded bg-skeleton" />
                ))}
              </div>
            </aside>
          </div>

          {/* Tags skeleton */}
          <div className="mt-8 flex flex-wrap gap-2 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-7 w-20 rounded-full bg-skeleton" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
