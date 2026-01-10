import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-zinc-700 mb-4" />
            <div className="h-10 w-2/3 rounded bg-zinc-700 mb-2" />
            <div className="h-6 w-1/2 rounded bg-zinc-700 mb-6" />
            <div className="h-4 w-full max-w-xl rounded bg-zinc-700 mb-2" />
            <div className="h-4 w-4/5 max-w-xl rounded bg-zinc-700" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 h-8 w-64 animate-pulse rounded bg-muted" />
          <LoadingSkeleton count={6} variant="card" />
        </div>
      </section>
    </div>
  );
}
