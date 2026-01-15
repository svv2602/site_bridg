import type { Metadata } from "next";
import { MessageSquare, Star, Filter } from "lucide-react";
import { ReviewCard } from "@/components/ReviewCard";
import { getReviews } from "@/lib/api/reviews";
import { Breadcrumb } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Відгуки про шини Bridgestone — Bridgestone Україна",
  description:
    "Реальні відгуки покупців про шини Bridgestone та Firestone. Дізнайтесь думку водіїв про якість, комфорт та безпеку шин.",
};

interface ReviewsPageProps {
  searchParams: Promise<{
    season?: "summer" | "winter" | "allseason";
    vehicleType?: "passenger" | "suv" | "van";
  }>;
}

const seasonLabels = {
  summer: "Літні",
  winter: "Зимові",
  allseason: "Всесезонні",
};

const vehicleTypeLabels = {
  passenger: "Легкові",
  suv: "SUV",
  van: "Van/LCV",
};

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams;
  const { season, vehicleType } = params;

  // Fetch reviews with optional filtering, no randomization for SEO
  const reviews = await getReviews({
    season,
    vehicleType,
    limit: 50,
    random: false,
  });

  // Calculate stats
  const totalCount = reviews.length;
  const averageRating =
    totalCount > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10
        ) / 10
      : 0;
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percent:
      totalCount > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === rating).length / totalCount) *
              100
          )
        : 0,
  }));

  // Get active filter label
  const activeFilters: string[] = [];
  if (season) activeFilters.push(seasonLabels[season]);
  if (vehicleType) activeFilters.push(vehicleTypeLabels[vehicleType]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-stone-200 bg-gradient-to-br from-amber-50 via-white to-stone-50 py-12 dark:border-stone-800 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <Breadcrumb
            className="mb-4"
            items={[
              { label: "Головна", href: "/" },
              { label: "Відгуки" },
            ]}
          />

          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-100 p-4 dark:bg-amber-900/30">
              <MessageSquare className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                Відгуки про шини Bridgestone
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Реальні відгуки власників автомобілів про досвід використання шин
                Bridgestone та Firestone в українських умовах.
              </p>
            </div>
          </div>

          {/* Stats */}
          {totalCount > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800/50">
                <div className="text-sm text-muted-foreground">
                  Загальна оцінка
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{averageRating}</span>
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800/50">
                <div className="text-sm text-muted-foreground">
                  Кількість відгуків
                </div>
                <div className="mt-1 text-3xl font-bold">{totalCount}</div>
              </div>
              <div className="col-span-2 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800/50">
                <div className="mb-2 text-sm text-muted-foreground">
                  Розподіл оцінок
                </div>
                <div className="space-y-1">
                  {distribution.map(({ rating, count, percent }) => (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-4">{rating}</span>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border py-4">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Фільтр:</span>

            {/* Season filters */}
            <div className="flex gap-1">
              {(["summer", "winter", "allseason"] as const).map((s) => (
                <Link
                  key={s}
                  href={`/reviews?${new URLSearchParams({
                    ...(vehicleType && { vehicleType }),
                    ...(season !== s && { season: s }),
                  }).toString()}`}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    season === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  }`}
                >
                  {seasonLabels[s]}
                </Link>
              ))}
            </div>

            <span className="text-stone-300 dark:text-stone-600">|</span>

            {/* Vehicle type filters */}
            <div className="flex gap-1">
              {(["passenger", "suv", "van"] as const).map((v) => (
                <Link
                  key={v}
                  href={`/reviews?${new URLSearchParams({
                    ...(season && { season }),
                    ...(vehicleType !== v && { vehicleType: v }),
                  }).toString()}`}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    vehicleType === v
                      ? "bg-primary text-primary-foreground"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  }`}
                >
                  {vehicleTypeLabels[v]}
                </Link>
              ))}
            </div>

            {/* Clear filters */}
            {(season || vehicleType) && (
              <>
                <span className="text-stone-300 dark:text-stone-600">|</span>
                <Link
                  href="/reviews"
                  className="rounded-full px-3 py-1 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Скинути
                </Link>
              </>
            )}
          </div>

          {activeFilters.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Показано відгуки: {activeFilters.join(", ")} шини
            </p>
          )}
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          {reviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} showTyreName />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/30" />
              <h2 className="mt-4 text-xl font-semibold">Відгуки не знайдено</h2>
              <p className="mt-2 text-muted-foreground">
                {activeFilters.length > 0
                  ? "Спробуйте змінити фільтри або скиньте їх."
                  : "Поки що немає відгуків."}
              </p>
              {activeFilters.length > 0 && (
                <Link
                  href="/reviews"
                  className="mt-4 inline-flex rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground"
                >
                  Показати всі відгуки
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
