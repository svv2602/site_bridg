export default function ArticleLoading() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-4xl px-4 md:px-8">
          <div className="animate-pulse">
            <div className="mb-2 h-4 w-48 rounded bg-stone-200 dark:bg-white/10" />
            <div className="mb-4 h-12 w-3/4 rounded bg-stone-200 dark:bg-white/10" />
            <div className="mb-6 h-5 w-1/2 rounded bg-stone-200 dark:bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-32 rounded bg-stone-200 dark:bg-white/10" />
              <div className="h-4 w-24 rounded bg-stone-200 dark:bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Article content skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-4xl px-4 md:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-full rounded bg-muted" />
            <div className="h-5 w-full rounded bg-muted" />
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-8 w-0" />
            <div className="h-5 w-full rounded bg-muted" />
            <div className="h-5 w-full rounded bg-muted" />
            <div className="h-5 w-5/6 rounded bg-muted" />
            <div className="h-8 w-0" />
            <div className="h-64 w-full rounded-xl bg-muted" />
            <div className="h-8 w-0" />
            <div className="h-5 w-full rounded bg-muted" />
            <div className="h-5 w-full rounded bg-muted" />
            <div className="h-5 w-2/3 rounded bg-muted" />
          </div>

          {/* Tags skeleton */}
          <div className="mt-8 flex flex-wrap gap-2 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-7 w-20 rounded-full bg-muted" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
