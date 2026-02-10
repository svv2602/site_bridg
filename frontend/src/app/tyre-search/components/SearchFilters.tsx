"use client";

import {
  Ruler,
  Filter,
  ChevronRight,
  CheckCircle,
  Search,
  Loader2,
} from "lucide-react";
import type { SizeOption } from "./useSearchState";

export interface SearchFiltersProps {
  width: string;
  aspectRatio: string;
  diameter: string;
  season: string;
  onWidthChange: (value: string) => void;
  onAspectChange: (value: string) => void;
  onDiameterChange: (value: string) => void;
  onSeasonChange: (value: string) => void;
  widthOptions: SizeOption[];
  aspectOptions: SizeOption[];
  diameterOptions: SizeOption[];
  loadingWidths: boolean;
  loadingAspects: boolean;
  loadingDiameters: boolean;
  searching: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children?: React.ReactNode; // For rendering results inside the form
}

export function SearchFilters({
  width,
  aspectRatio,
  diameter,
  season,
  onWidthChange,
  onAspectChange,
  onDiameterChange,
  onSeasonChange,
  widthOptions,
  aspectOptions,
  diameterOptions,
  loadingWidths,
  loadingAspects,
  loadingDiameters,
  searching,
  onSubmit,
  children,
}: SearchFiltersProps) {
  return (
    <form
      id="size-search-panel"
      role="tabpanel"
      aria-labelledby="size-search-tab"
      className="space-y-6"
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Width */}
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-100">
            Ширина {widthOptions.length > 0 && <span className="text-stone-500">({widthOptions.length})</span>}
          </label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
            {loadingWidths ? (
              <div className="flex h-12 w-full items-center justify-center rounded-xl border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900">
                <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
              </div>
            ) : (
              <select
                className="w-full appearance-none rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-8 text-sm text-stone-900 outline-none focus:border-primary dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
                value={width}
                onChange={(e) => onWidthChange(e.target.value)}
                required
              >
                <option value="">Оберіть ширину</option>
                {widthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value} мм
                  </option>
                ))}
              </select>
            )}
            <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
          </div>
        </div>

        {/* Aspect ratio */}
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-100">
            Висота профілю {aspectOptions.length > 0 && <span className="text-stone-500">({aspectOptions.length})</span>}
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
            {loadingAspects ? (
              <div className="flex h-12 w-full items-center justify-center rounded-xl border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900">
                <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
              </div>
            ) : (
              <select
                className="w-full appearance-none rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-8 text-sm text-stone-900 outline-none focus:border-primary dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                value={aspectRatio}
                onChange={(e) => onAspectChange(e.target.value)}
                disabled={!width}
                required
              >
                <option value="">{width ? "Оберіть висоту" : "Спочатку оберіть ширину"}</option>
                {aspectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value}%
                  </option>
                ))}
              </select>
            )}
            <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
          </div>
        </div>

        {/* Diameter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-100">
            Діаметр {diameterOptions.length > 0 && <span className="text-stone-500">({diameterOptions.length})</span>}
          </label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
            {loadingDiameters ? (
              <div className="flex h-12 w-full items-center justify-center rounded-xl border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900">
                <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
              </div>
            ) : (
              <select
                className="w-full appearance-none rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-8 text-sm text-stone-900 outline-none focus:border-primary dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                value={diameter}
                onChange={(e) => onDiameterChange(e.target.value)}
                disabled={!aspectRatio}
                required
              >
                <option value="">{aspectRatio ? "Оберіть діаметр" : "Спочатку оберіть висоту"}</option>
                {diameterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    R{opt.value}
                  </option>
                ))}
              </select>
            )}
            <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
          </div>
        </div>
      </div>

      {/* Season (optional) */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-100">
          Сезонність <span className="text-stone-500">(опційно)</span>
        </label>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
          <select
            className="w-full appearance-none rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-8 text-sm text-stone-900 outline-none focus:border-primary dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            value={season}
            onChange={(e) => onSeasonChange(e.target.value)}
          >
            <option value="">Не важливо</option>
            <option value="summer">Літні</option>
            <option value="winter">Зимові</option>
            <option value="allseason">Всесезонні</option>
          </select>
          <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-stone-500" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
        <span>Точний підбір за офіційними каталогами Bridgestone та Firestone</span>
      </div>
      <button
        type="submit"
        disabled={!width || !aspectRatio || !diameter || searching}
        className="w-full rounded-full bg-brand py-3 text-base font-semibold text-white shadow-lg hover:bg-brand/90 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {searching ? (
          <Loader2 className="mr-2 inline h-5 w-5 animate-spin" />
        ) : (
          <Search className="mr-2 inline h-5 w-5" />
        )}
        {searching ? "Шукаємо..." : "Знайти шини"}
      </button>

      {/* Results rendered inside form for proper layout */}
      {children}
    </form>
  );
}
