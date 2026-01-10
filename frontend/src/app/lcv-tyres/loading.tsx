import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="animate-pulse">
              <div className="h-4 w-32 rounded bg-zinc-700 mb-4" />
              <div className="h-10 w-2/3 rounded bg-zinc-700 mb-2" />
              <div className="h-6 w-1/2 rounded bg-zinc-700 mb-6" />
              <div className="h-4 w-full rounded bg-zinc-700 mb-2" />
              <div className="h-4 w-4/5 rounded bg-zinc-700 mb-8" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-700" />
                    <div className="flex-1">
                      <div className="h-4 w-1/3 rounded bg-zinc-700 mb-2" />
                      <div className="h-3 w-2/3 rounded bg-zinc-700" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-80 rounded-3xl bg-zinc-800" />
            </div>
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 text-center">
            <div className="h-8 w-64 mx-auto animate-pulse rounded bg-muted mb-4" />
            <div className="h-4 w-96 mx-auto animate-pulse rounded bg-muted" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="h-6 w-24 rounded bg-muted" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-muted" />
                </div>
                <div className="h-4 w-full rounded bg-muted mb-6" />
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="h-5 w-1/2 rounded bg-muted mb-2" />
                    <div className="h-4 w-full rounded bg-muted" />
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="h-5 w-1/2 rounded bg-muted mb-2" />
                    <div className="h-4 w-full rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
