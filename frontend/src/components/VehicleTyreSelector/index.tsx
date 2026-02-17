"use client";

import {
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useVehicleSearch } from "./useVehicleSearch";
import {
  MakeSelector,
  ModelSelector,
  YearSelector,
  KitSelector,
  SeasonSelector,
} from "./VehicleSelectors";
import { SizeResults } from "./SizeResults";

export interface VehicleTyreSelectorProps {
  initialMake?: string;
  initialModel?: string;
  initialYear?: string;
  initialKit?: string;
  initialSeason?: string;
}

export function VehicleTyreSelector({
  initialMake,
  initialModel,
  initialYear,
  initialKit,
  initialSeason,
}: VehicleTyreSelectorProps) {
  const {
    brandId,
    setBrandId,
    modelId,
    setModelId,
    year,
    setYear,
    kitId,
    setKitId,
    season,
    setSeason,
    brandsLoading,
    modelsLoading,
    yearsLoading,
    kitsLoading,
    searchResult,
    searching,
    searchError,
    selectedSize,
    setSelectedSize,
    handleSearch,
    selectedKit,
    brandOptions,
    modelOptions,
    yearOptions,
    kitOptions,
    seasonOptions,
  } = useVehicleSearch({
    initialMake,
    initialModel,
    initialYear,
    initialKit,
    initialSeason,
  });

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MakeSelector
          value={brandId}
          onChange={setBrandId}
          options={brandOptions}
          loading={brandsLoading}
        />
        <ModelSelector
          value={modelId}
          onChange={setModelId}
          options={modelOptions}
          disabled={!brandId}
          loading={modelsLoading}
        />
        <YearSelector
          value={year}
          onChange={setYear}
          options={yearOptions}
          disabled={!modelId}
          loading={yearsLoading}
        />
        <KitSelector
          value={kitId}
          onChange={setKitId}
          options={kitOptions}
          disabled={!year}
          loading={kitsLoading}
        />
        <SeasonSelector
          value={season}
          onChange={setSeason}
          options={seasonOptions}
        />
      </div>

      {/* Kit info */}
      {selectedKit && (
        <div
          className="rounded-xl border border-stone-300 bg-stone-100/50 p-4 animate-fade-in dark:border-stone-700 dark:bg-stone-800/50"
        >
          <div className="heading-4 mb-2 text-sm font-semibold text-stone-900 dark:text-stone-50">
            Параметри кріплення коліс
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400">
            {selectedKit.pcd && (
              <span>
                PCD: <strong className="text-stone-900 dark:text-stone-50">{selectedKit.pcd}</strong>
              </span>
            )}
            {selectedKit.boltCount && (
              <span>
                Болтів: <strong className="text-stone-900 dark:text-stone-50">{selectedKit.boltCount}</strong>
              </span>
            )}
            {selectedKit.dia && (
              <span>
                DIA: <strong className="text-stone-900 dark:text-stone-50">{selectedKit.dia}</strong>
              </span>
            )}
            {selectedKit.boltSize && (
              <span>
                Болт: <strong className="text-stone-900 dark:text-stone-50">{selectedKit.boltSize}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Search button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSearch}
          disabled={!kitId || searching}
          className="flex-1 rounded-full bg-white py-3 text-base font-semibold text-stone-900 shadow-lg ring-2 ring-stone-300 transition-all hover:ring-stone-400 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-8"
        >
          {searching ? (
            <Loader2 className="mr-2 inline h-5 w-5 animate-spin" />
          ) : (
            <Search className="mr-2 inline h-5 w-5" />
          )}
          Підібрати шини Bridgestone
        </button>

        <div className="hidden items-center gap-2 text-sm text-stone-500 dark:text-stone-300 sm:flex">
          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
          <span>База даних 300,000+ комплектацій</span>
        </div>
      </div>

      {/* Error */}
      {searchError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Results */}
      {searchResult && (
        <SizeResults
          searchResult={searchResult}
          selectedSize={selectedSize}
          onSizeClick={setSelectedSize}
        />
      )}
    </div>
  );
}
