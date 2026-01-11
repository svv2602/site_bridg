import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="hero-dark border-b border-hero-border py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-4xl animate-pulse">
            <div className="h-3 w-40 rounded bg-hero-accent mb-4" />
            <div className="h-10 w-3/4 rounded bg-hero-accent mb-2" />
            <div className="h-5 w-1/2 rounded bg-hero-accent mb-6" />
            <div className="h-4 w-full rounded bg-hero-accent mb-2" />
            <div className="h-4 w-4/5 rounded bg-hero-accent mb-6" />
            <div className="flex gap-4">
              <div className="h-12 w-40 rounded-full bg-hero-accent" />
              <div className="h-12 w-36 rounded-full bg-hero-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 h-8 w-48 mx-auto animate-pulse rounded bg-muted" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted" />
                <div className="h-5 w-24 mx-auto rounded bg-muted mb-2" />
                <div className="h-4 w-16 mx-auto rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
          </div>
          <LoadingSkeleton count={6} variant="article" />
        </div>
      </section>
    </div>
  );
}
