"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { type Brand, type TyreModel } from "@/lib/data";
import { brandLabels, brandColors } from "@/lib/utils/tyres";
import { TyreCard } from "@/components/TyreCard";

export interface SearchResultsProps {
  results: TyreModel[];
  filteredResults: TyreModel[];
  searchedSize: string;
  searchedSeason: string;
  selectedBrands: Brand[];
  onToggleBrand: (brand: Brand) => void;
}

export const SearchResults = forwardRef<HTMLDivElement, SearchResultsProps>(
  function SearchResults(
    {
      results,
      filteredResults,
      searchedSize,
      searchedSeason,
      selectedBrands,
      onToggleBrand,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className="mt-8 border-t border-stone-300 pt-6 dark:border-stone-700"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="heading-3 text-xl font-bold text-stone-900 dark:text-stone-50 flex flex-wrap items-center gap-2">
            <span>Результати пошуку {filteredResults.length > 0 && `(${filteredResults.length})`}</span>
            {searchedSize && (
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-text">
                {searchedSize}
              </span>
            )}
            {searchedSeason && (
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                searchedSeason === "summer" ? "bg-amber-500/20 text-amber-400" :
                searchedSeason === "winter" ? "bg-blue-500/20 text-blue-400" :
                "bg-teal-500/20 text-teal-400"
              }`}>
                {searchedSeason === "summer" ? "Літні" : searchedSeason === "winter" ? "Зимові" : "Всесезонні"}
              </span>
            )}
          </div>
          {/* Brand filter */}
          {results.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 dark:text-stone-400">Бренд:</span>
              {(["bridgestone", "firestone"] as Brand[]).map(brand => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onToggleBrand(brand)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedBrands.includes(brand)
                      ? `${brandColors[brand].bg} text-white`
                      : "bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-400 dark:hover:bg-stone-600"
                  }`}
                >
                  {brandLabels[brand]}
                </button>
              ))}
            </div>
          )}
        </div>
        {filteredResults.length === 0 ? (
          <div className="rounded-xl border border-stone-300 bg-stone-100 p-6 text-center dark:border-stone-700 dark:bg-stone-800/50">
            <Search className="mx-auto h-10 w-10 text-stone-400 dark:text-stone-500" />
            <p className="mt-3 text-stone-600 dark:text-stone-400">
              {results.length === 0
                ? `Шин для розміру ${searchedSize} не знайдено в каталозі.`
                : `Шин обраних брендів для розміру ${searchedSize} не знайдено.`
              }
            </p>
            <Link
              href="/dealers"
              className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <MapPin className="h-4 w-4" />
              Зверніться до дилера
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 pt-2 sm:grid-cols-2">
            {filteredResults.map((model) => (
              <TyreCard key={model.slug} tyre={model} variant="compact" />
            ))}
          </div>
        )}
      </div>
    );
  }
);
