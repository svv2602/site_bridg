export default function TyreDetailLoading() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="border-b border-stone-200 dark:border-stone-800 bg-gradient-to-br from-stone-100 via-stone-50 to-white dark:from-stone-950 dark:via-stone-900 dark:to-stone-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="animate-pulse">
              <div className="mb-3 h-4 w-48 rounded bg-stone-200 dark:bg-white/10" />
              <div className="mb-3 h-7 w-56 rounded-full bg-stone-200 dark:bg-white/10" />
              <div className="mb-4 h-10 w-3/4 rounded bg-stone-200 dark:bg-white/10" />
              <div className="mb-2 h-5 w-1/2 rounded bg-stone-200 dark:bg-white/10" />
              <div className="mb-6 h-16 w-full max-w-xl rounded bg-stone-200 dark:bg-white/10" />
              <div className="mb-6 flex gap-3">
                <div className="h-8 w-32 rounded-full bg-stone-200 dark:bg-white/10" />
                <div className="h-8 w-28 rounded-full bg-stone-200 dark:bg-white/10" />
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-40 rounded-full bg-stone-200 dark:bg-white/10" />
                <div className="h-12 w-40 rounded-full bg-stone-200 dark:bg-white/10" />
              </div>
            </div>
            <div className="animate-pulse">
              <div className="aspect-square min-h-[400px] rounded-3xl bg-stone-200 dark:bg-white/10 lg:min-h-[500px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Specs skeleton */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
                <div className="mb-4 h-6 w-48 rounded bg-muted" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 w-full rounded bg-muted" />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
                <div className="mb-4 h-6 w-36 rounded bg-muted" />
                <div className="grid gap-4 sm:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-muted" />
                  ))}
                </div>
              </div>
            </div>
            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
                <div className="mb-3 h-6 w-40 rounded bg-muted" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-5 w-full rounded bg-muted" />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
