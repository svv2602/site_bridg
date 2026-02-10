"use client";

import Image from "next/image";
import {
  Search,
  MapPin,
  Filter,
  ChevronDown,
  Loader2,
  LocateFixed,
} from "lucide-react";

const dealerTypes = [
  { key: "all", label: "Всі типи" },
  { key: "official", label: "Офіційний дилер" },
  { key: "partner", label: "Партнер" },
  { key: "service", label: "Сервісний центр" },
];

import { type UserPosition } from "../types";

export interface DealerFiltersProps {
  cityQuery: string;
  onCityQueryChange: (value: string) => void;
  selectedType: string;
  onSelectedTypeChange: (value: string) => void;
  filteredCount: number;
  isLoading: boolean;
  userPosition: UserPosition | null;
  geoLoading: boolean;
  geoError: string | null;
  onRequestGeolocation: () => void;
  onResetFilters: () => void;
}

export function DealerFilters({
  cityQuery,
  onCityQueryChange,
  selectedType,
  onSelectedTypeChange,
  filteredCount,
  isLoading,
  userPosition,
  geoLoading,
  geoError,
  onRequestGeolocation,
  onResetFilters,
}: DealerFiltersProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      {/* Service image at top - hidden on mobile */}
      <div className="relative hidden min-h-[180px] flex-1 lg:block">
        <Image
          src="/images/hero/hero-dealer-service.webp"
          alt="Професійний шиномонтаж Bridgestone"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 0vw, 66vw"
        />
      </div>
      {/* Search form */}
      <div className="p-6">
        <h2 className="mb-4 text-2xl font-semibold">Пошук дилерів</h2>
        <div role="search" className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="city-search" className="mb-2 block text-sm font-medium text-foreground">
              Місто або адреса
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500 dark:text-stone-400" aria-hidden="true" />
              <input
                type="text"
                id="city-search"
                placeholder="Наприклад, Київ, Львів..."
                aria-label="Пошук дилерів"
                value={cityQuery}
                onChange={(e) => onCityQueryChange(e.target.value)}
                maxLength={100}
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label htmlFor="dealer-type" className="mb-2 block text-sm font-medium text-foreground">Тип точки</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500 dark:text-stone-400" aria-hidden="true" />
              <select
                id="dealer-type"
                value={selectedType}
                onChange={(e) => onSelectedTypeChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-background py-3 pl-10 pr-8 text-sm text-foreground outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {dealerTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500 dark:text-stone-400" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Знайдено дилерів:{" "}
              <span className="text-2xl font-bold text-foreground">
                {isLoading ? "..." : filteredCount}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRequestGeolocation}
              disabled={geoLoading}
              title="Визначити ваше місцезнаходження для сортування дилерів за відстанню"
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                userPosition
                  ? "border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300"
                  : "border-stone-300 bg-transparent text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700"
              } disabled:cursor-wait disabled:opacity-60`}
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="h-4 w-4" />
              )}
              {userPosition ? "Локація визначена" : "Моє місцезнаходження"}
            </button>
            <button
              onClick={onResetFilters}
              className="rounded-full border border-stone-300 bg-transparent px-5 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700"
            >
              Скинути фільтри
            </button>
          </div>
        </div>
        {/* Geolocation error toast */}
        {geoError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-stone-300 bg-stone-100 px-4 py-2.5 text-sm text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300">
            <MapPin className="h-4 w-4 shrink-0 text-stone-500" />
            {geoError}
          </div>
        )}
      </div>
    </div>
  );
}
