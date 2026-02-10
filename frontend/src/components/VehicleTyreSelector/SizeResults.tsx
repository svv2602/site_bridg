"use client";

import Link from "next/link";
import {
  CheckCircle,
  AlertCircle,
  Info,
  MapPin,
} from "lucide-react";
import { TyreCard } from "@/components/TyreCard";
import type {
  CarTyreSize,
  VehicleSearchResult,
} from "@/lib/types/vehicles";

// Size formatting
function formatTyreSize(size: CarTyreSize): string {
  return `${Math.round(size.width)}/${Math.round(size.height)} R${Math.round(size.diameter)}`;
}

// Group sizes by axle
function groupByAxle(sizes: CarTyreSize[]): Map<number | null, CarTyreSize[]> {
  const groups = new Map<number | null, CarTyreSize[]>();

  for (const size of sizes) {
    const key = size.axleGroup;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(size);
  }

  return groups;
}

// --- SizeBadge ---

function SizeBadge({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm font-medium transition-all ${
        isSelected
          ? "border-stone-900 bg-stone-900 text-white shadow-lg dark:border-white dark:bg-white dark:text-stone-900"
          : "border-stone-300 bg-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-300 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-50 dark:hover:border-stone-500 dark:hover:bg-stone-600"
      }`}
    >
      {label}
    </button>
  );
}

// --- TyreSizeCard ---

interface TyreSizeCardProps {
  sizes: CarTyreSize[];
  type: "oem" | "tuning";
  selectedSize: string | null;
  onSizeClick: (size: string | null) => void;
}

function TyreSizeCard({ sizes, type, selectedSize, onSizeClick }: TyreSizeCardProps) {
  const isOEM = type === "oem";
  const groups = groupByAxle(sizes);

  return (
    <div
      className={`rounded-xl border p-4 ${
        isOEM
          ? "border-green-500/50 bg-green-500/10"
          : "border-stone-300 bg-stone-200/30 dark:border-stone-600 dark:bg-stone-700/30"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        {isOEM ? (
          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
        ) : (
          <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        )}
        <span
          className={`text-sm font-semibold ${
            isOEM ? "text-green-600 dark:text-green-400" : "text-stone-900 dark:text-stone-50"
          }`}
        >
          {isOEM ? "Заводські розміри (OEM)" : "Допустимі заміни"}
        </span>
        <span className="text-xs text-stone-500 dark:text-stone-400">(натисніть для фільтру)</span>
      </div>

      <div className="space-y-2">
        {Array.from(groups.entries()).map(([axleGroup, groupSizes]) => {
          // If there are different axles in the group
          const hasDifferentAxles = groupSizes.some((s) => s.axle !== "any");

          if (hasDifferentAxles) {
            const frontSizes = groupSizes.filter((s) => s.axle === "front");
            const rearSizes = groupSizes.filter((s) => s.axle === "rear");

            return (
              <div
                key={axleGroup ?? "default"}
                className="rounded-lg bg-stone-200/50 p-3 dark:bg-stone-700/50"
              >
                {frontSizes.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-stone-500 dark:text-stone-400">Передня вісь:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {frontSizes.map((size) => {
                        const label = formatTyreSize(size);
                        return (
                          <SizeBadge
                            key={size.id}
                            label={label}
                            isSelected={selectedSize === label}
                            onClick={() => onSizeClick(selectedSize === label ? null : label)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
                {rearSizes.length > 0 && (
                  <div>
                    <span className="text-xs text-stone-500 dark:text-stone-400">Задня вісь:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {rearSizes.map((size) => {
                        const label = formatTyreSize(size);
                        return (
                          <SizeBadge
                            key={size.id}
                            label={label}
                            isSelected={selectedSize === label}
                            onClick={() => onSizeClick(selectedSize === label ? null : label)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Same sizes for all axles
          const uniqueSizes = Array.from(
            new Set(groupSizes.map((s) => formatTyreSize(s)))
          );

          return (
            <div key={axleGroup ?? "default"} className="flex flex-wrap gap-2">
              {uniqueSizes.map((sizeLabel) => (
                <SizeBadge
                  key={sizeLabel}
                  label={sizeLabel}
                  isSelected={selectedSize === sizeLabel}
                  onClick={() => onSizeClick(selectedSize === sizeLabel ? null : sizeLabel)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- SizeResults ---

export interface SizeResultsProps {
  searchResult: VehicleSearchResult;
  selectedSize: string | null;
  onSizeClick: (size: string | null) => void;
}

export function SizeResults({ searchResult, selectedSize, onSizeClick }: SizeResultsProps) {
  const filteredTyres = selectedSize
    ? searchResult.matchingTyres.filter((t) =>
        t.matchingSizes.includes(selectedSize)
      )
    : searchResult.matchingTyres;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Vehicle info */}
      <div className="rounded-xl border border-stone-300 bg-stone-100 p-6 dark:border-stone-700 dark:bg-stone-800">
        <h3 className="mb-4 text-xl font-bold text-stone-900 dark:text-stone-50">
          {searchResult.vehicle.brand} {searchResult.vehicle.model}{" "}
          {searchResult.vehicle.year}
          <span className="ml-2 text-base font-normal text-stone-500 dark:text-stone-400">
            {searchResult.vehicle.kit}
          </span>
        </h3>

        {/* Tyre sizes */}
        <div className="grid gap-4 md:grid-cols-2">
          {searchResult.tyreSizes.oem.length > 0 && (
            <TyreSizeCard
              sizes={searchResult.tyreSizes.oem}
              type="oem"
              selectedSize={selectedSize}
              onSizeClick={onSizeClick}
            />
          )}
          {searchResult.tyreSizes.tuning.length > 0 && (
            <TyreSizeCard
              sizes={searchResult.tyreSizes.tuning}
              type="tuning"
              selectedSize={selectedSize}
              onSizeClick={onSizeClick}
            />
          )}
        </div>

        {/* Size filter indicator */}
        {selectedSize && (
          <div className="flex items-center gap-2 text-sm mt-4">
            <span className="text-stone-500 dark:text-stone-400">Фільтр:</span>
            <span className="rounded-full bg-stone-900 px-3 py-1 font-medium text-white dark:bg-white dark:text-stone-900">
              {selectedSize}
            </span>
            <button
              type="button"
              onClick={() => onSizeClick(null)}
              className="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
            >
              ✕ скинути
            </button>
          </div>
        )}
      </div>

      {/* Matching Bridgestone tyres */}
      {filteredTyres.length > 0 ? (
        <div>
          <h3 className="mb-4 text-xl font-bold text-stone-900 dark:text-stone-50">
            Шини Bridgestone для вашого авто
            {selectedSize && (
              <span className="ml-2 text-base font-normal text-stone-500 dark:text-stone-400">
                ({filteredTyres.length} моделей для {selectedSize})
              </span>
            )}
          </h3>
          <div className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTyres.map((tyre, idx) => (
              <div
                key={tyre.slug}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <TyreCard
                  tyre={tyre}
                  variant="compact"
                  matchingSizes={tyre.matchingSizes}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-300 bg-stone-100/50 p-8 text-center dark:border-stone-700 dark:bg-stone-800/50">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500 dark:text-amber-400" />
          <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-50">
            Шин Bridgestone для цих розмірів наразі немає в каталозі
          </h3>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Зверніться до наших дилерів — вони допоможуть підібрати
            альтернативу або замовити потрібний розмір.
          </p>
          <Link
            href="/dealers"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-900 px-6 py-2 font-semibold text-stone-900 transition-colors hover:bg-stone-900/10 dark:border-stone-50 dark:text-stone-50 dark:hover:bg-stone-50/10"
          >
            <MapPin className="h-4 w-4 text-primary" />
            Знайти дилера
          </Link>
        </div>
      )}
    </div>
  );
}
