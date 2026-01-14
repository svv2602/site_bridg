"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, X, Check, Search, Filter } from "lucide-react";
import type { TyreModel, Season } from "@/lib/data";
import { getTyreModels } from "@/lib/api/tyres";
import { Breadcrumb } from "@/components/ui";
import { seasonLabelsShort } from "@/lib/utils/tyres";

// Літо = зелений, Зима = синій, Всесезон = оранжевий
const seasonBadgeColors: Record<Season, string> = {
  summer: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  winter: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  allseason:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function ComparisonSelectionPage() {
  const [tyres, setTyres] = useState<TyreModel[]>([]);
  const [selectedTyres, setSelectedTyres] = useState<TyreModel[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<Season | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTyres() {
      try {
        const data = await getTyreModels();
        setTyres(data);
      } catch (error) {
        console.error("Failed to load tyres:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTyres();
  }, []);

  const filteredTyres = useMemo(() => {
    return tyres.filter((tyre) => {
      const matchesSeason =
        seasonFilter === "all" || tyre.season === seasonFilter;
      const matchesSearch =
        searchQuery === "" ||
        tyre.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeason && matchesSearch;
    });
  }, [tyres, seasonFilter, searchQuery]);

  const toggleTyre = (tyre: TyreModel) => {
    if (selectedTyres.find((t) => t.slug === tyre.slug)) {
      setSelectedTyres(selectedTyres.filter((t) => t.slug !== tyre.slug));
    } else if (selectedTyres.length < 3) {
      setSelectedTyres([...selectedTyres, tyre]);
    }
  };

  const isSelected = (tyre: TyreModel) =>
    selectedTyres.some((t) => t.slug === tyre.slug);

  const comparisonUrl =
    selectedTyres.length >= 2
      ? `/porivnyaty/${selectedTyres.map((t) => t.slug).join("-vs-")}`
      : null;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-stone-900 to-stone-800 text-white py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb
            className="mb-4"
            items={[
              { label: "Головна", href: "/" },
              { label: "Порівняння шин" },
            ]}
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Порівняння шин
          </h1>
          <p className="text-stone-300 text-lg max-w-2xl">
            Оберіть 2-3 моделі шин для порівняння характеристик, EU-маркування
            та технологій.
          </p>
        </div>
      </section>

      {/* Selected Tyres Bar */}
      {selectedTyres.length > 0 && (
        <div className="sticky top-16 z-40 bg-card border-b border-border shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <span
                className="text-sm font-medium text-muted-foreground"
                aria-live="polite"
                aria-atomic="true"
              >
                Обрано ({selectedTyres.length}/3):
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedTyres.map((tyre) => (
                  <span
                    key={tyre.slug}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-text rounded-full text-sm font-medium"
                  >
                    {tyre.name}
                    <button
                      onClick={() => toggleTyre(tyre)}
                      className="hover:bg-primary-hover rounded-full p-0.5"
                      aria-label={`Видалити ${tyre.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              {comparisonUrl && (
                <Link
                  href={comparisonUrl}
                  className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Порівняти
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <section className="py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <label htmlFor="search-tyres" className="sr-only">
                Пошук шин за назвою
              </label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                id="search-tyres"
                placeholder="Пошук за назвою..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Season Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div className="flex gap-2" role="group" aria-label="Фільтр за сезоном">
                <button
                  onClick={() => setSeasonFilter("all")}
                  aria-pressed={seasonFilter === "all"}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    seasonFilter === "all"
                      ? "bg-primary text-primary-text"
                      : "bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
                  }`}
                >
                  Всі
                </button>
                {(["summer", "winter", "allseason"] as Season[]).map(
                  (season) => (
                    <button
                      key={season}
                      onClick={() => setSeasonFilter(season)}
                      aria-pressed={seasonFilter === season}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        seasonFilter === season
                          ? "bg-primary text-primary-text"
                          : "bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
                      }`}
                    >
                      {seasonLabelsShort[season]}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tyres Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl p-4 animate-pulse"
                >
                  <div className="aspect-square bg-muted rounded-lg mb-4" />
                  <div className="h-5 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredTyres.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Шини не знайдено. Спробуйте змінити фільтри.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTyres.map((tyre) => {
                const selected = isSelected(tyre);
                const disabled = !selected && selectedTyres.length >= 3;

                return (
                  <button
                    key={tyre.slug}
                    onClick={() => !disabled && toggleTyre(tyre)}
                    disabled={disabled}
                    className={`relative bg-card border rounded-xl p-4 text-left transition-all ${
                      selected
                        ? "border-primary ring-2 ring-primary/20"
                        : disabled
                          ? "border-border opacity-50 cursor-not-allowed"
                          : "border-border hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    {/* Selection indicator */}
                    {selected && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    {/* Image */}
                    <div className="aspect-square relative mb-3 bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden">
                      <Image
                        src={tyre.imageUrl || "/placeholder-tyre.png"}
                        alt={tyre.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    {/* Info */}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                      {tyre.name}
                    </h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${seasonBadgeColors[tyre.season]}`}
                    >
                      {seasonLabelsShort[tyre.season]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Popular Comparisons */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Популярні порівняння</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {[
              {
                title: "Turanza 6 vs Potenza Sport",
                slug: "turanza-6-vs-potenza-sport",
                description: "Комфорт vs Спортивність",
              },
              {
                title: "Blizzak LM005 vs Blizzak DM-V3",
                slug: "blizzak-lm005-vs-blizzak-dm-v3",
                description: "Легкові vs SUV зимові шини",
              },
              {
                title: "Turanza T005 vs Turanza 6",
                slug: "turanza-t005-vs-turanza-6",
                description: "Попередник vs Новинка",
              },
            ].map((comparison) => (
              <Link
                key={comparison.slug}
                href={`/porivnyaty/${comparison.slug}`}
                className="bg-card border border-border rounded-xl p-6 hover:border-silver/50 hover:shadow-md hover:-translate-y-1 transition-all group"
              >
                <h3 className="font-medium mb-3 text-foreground transition-all group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                  {comparison.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {comparison.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
