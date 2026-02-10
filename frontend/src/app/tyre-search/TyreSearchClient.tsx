"use client";

import Link from "next/link";

import {
  Car,
  Ruler,
  CheckCircle,
  MapPin,
  Database,
} from "lucide-react";
import { VehicleTyreSelector } from "@/components/VehicleTyreSelector";
import { useSearchState } from "./components/useSearchState";
import { SearchFilters } from "./components/SearchFilters";
import { SearchResults } from "./components/SearchResults";

export function TyreSearchClient() {
  const {
    mode,
    handleModeChange,
    width,
    aspectRatio,
    diameter,
    season,
    handleWidthChange,
    handleAspectChange,
    handleDiameterChange,
    handleSeasonChange,
    widthOptions,
    aspectOptions,
    diameterOptions,
    loadingWidths,
    loadingAspects,
    loadingDiameters,
    results,
    filteredResults,
    hasSearched,
    searching,
    searchedSize,
    searchedSeason,
    selectedBrands,
    toggleBrand,
    handleSizeSearch,
    handleResetFilters,
    resultsRef,
    urlMake,
    urlModel,
    urlYear,
    urlSeason,
  } = useSearchState();

  return (
    <section className="py-12">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Search Panel */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-foreground shadow-lg dark:border-stone-800 dark:bg-stone-900/95 dark:text-stone-50 dark:shadow-[0_18px_40px_rgba(0,0,0,0.45)] md:p-8">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Оберіть спосіб пошуку</h2>
                <div
                  role="tablist"
                  aria-label="Спосіб пошуку шин"
                  className="inline-flex rounded-full bg-stone-200 p-1 ring-1 ring-stone-300 dark:bg-stone-800 dark:ring-stone-700"
                >
                  <button
                    type="button"
                    role="tab"
                    id="size-search-tab"
                    aria-selected={mode === "size"}
                    aria-controls="size-search-panel"
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                      mode === "size"
                        ? "bg-white text-stone-900 shadow-sm dark:bg-stone-50"
                        : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"
                    }`}
                    onClick={() => handleModeChange("size")}
                  >
                    <Ruler className="h-4 w-4" aria-hidden="true" />
                    За розміром
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="car-search-tab"
                    aria-selected={mode === "car"}
                    aria-controls="car-search-panel"
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                      mode === "car"
                        ? "bg-white text-stone-900 shadow-sm dark:bg-stone-50"
                        : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"
                    }`}
                    onClick={() => handleModeChange("car")}
                  >
                    <Car className="h-4 w-4" aria-hidden="true" />
                    За авто
                  </button>
                </div>
              </div>

              {mode === "size" ? (
                <SearchFilters
                  width={width}
                  aspectRatio={aspectRatio}
                  diameter={diameter}
                  season={season}
                  onWidthChange={handleWidthChange}
                  onAspectChange={handleAspectChange}
                  onDiameterChange={handleDiameterChange}
                  onSeasonChange={handleSeasonChange}
                  onResetFilters={handleResetFilters}
                  widthOptions={widthOptions}
                  aspectOptions={aspectOptions}
                  diameterOptions={diameterOptions}
                  loadingWidths={loadingWidths}
                  loadingAspects={loadingAspects}
                  loadingDiameters={loadingDiameters}
                  searching={searching}
                  onSubmit={handleSizeSearch}
                >
                  {/* Results rendered inside the form for layout continuity */}
                  {hasSearched && (
                    <SearchResults
                      ref={resultsRef}
                      results={results}
                      filteredResults={filteredResults}
                      searchedSize={searchedSize}
                      searchedSeason={searchedSeason}
                      selectedBrands={selectedBrands}
                      onToggleBrand={toggleBrand}
                    />
                  )}
                </SearchFilters>
              ) : (
                <div
                  id="car-search-panel"
                  role="tabpanel"
                  aria-labelledby="car-search-tab"
                >
                  <VehicleTyreSelector
                    initialMake={urlMake || undefined}
                    initialModel={urlModel || undefined}
                    initialYear={urlYear || undefined}
                    initialSeason={urlSeason || undefined}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-6">
            {mode === "car" ? (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                  <Database className="h-5 w-5 text-primary" />
                  База даних авто
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                    <span><strong className="text-foreground">227 марок</strong> автомобілів</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                    <span><strong className="text-foreground">5,900+ моделей</strong> від 1990 до 2024 року</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                    <span><strong className="text-foreground">300,000+ комплектацій</strong> з розмірами</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                    <span><strong className="text-foreground">OEM та альтернативні</strong> розміри шин</span>
                  </li>
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">
                  Дані включають заводські розміри та допустимі заміни з урахуванням різних осей.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Поради щодо підбору
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>Перевірте маркування на боковині ваших поточних шин.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>Враховуйте кліматичні умови вашого регіону при виборі сезонності.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>Для SUV та позашляховиків обирайте шини з посиленою конструкцією.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>Звертайтеся до офіційних дилерів для професійної консультації.</span>
                  </li>
                </ul>
              </div>
            )}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <MapPin className="h-5 w-5 text-primary" />
                Не знайшли потрібний розмір?
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Зв&apos;яжіться з нашими експертами — ми допоможемо підібрати альтернативу
                або знайти шини під замовлення.
              </p>
              <Link
                href="/dealers"
                className="block w-full rounded-full border border-primary bg-transparent py-2.5 text-center text-sm font-semibold text-primary hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                Знайти дилера
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
