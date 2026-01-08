"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Calendar,
  Settings,
  Search,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  MapPin,
} from "lucide-react";
import type {
  CarBrand,
  CarModel,
  CarKit,
  VehicleSearchResult,
  CarTyreSize,
  AxleType,
} from "@/lib/types/vehicles";

// Хук для fetching даних
function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json.data);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Помилка завантаження даних");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

// Локалізація осі
function getAxleLabel(axle: AxleType): string {
  switch (axle) {
    case "front":
      return "передня вісь";
    case "rear":
      return "задня вісь";
    default:
      return "будь-яка вісь";
  }
}

// Форматування розміру
function formatTyreSize(size: CarTyreSize): string {
  return `${Math.round(size.width)}/${Math.round(size.height)} R${Math.round(size.diameter)}`;
}

// Групування розмірів по осях
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

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  loading?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  searchable?: boolean;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  loading,
  icon: Icon,
  placeholder = "Оберіть",
  searchable = false,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  // Фільтрація опцій
  const filteredOptions = searchable && search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Показувати максимум 100 опцій
  const displayOptions = filteredOptions.slice(0, 100);
  const hasMore = filteredOptions.length > 100;

  // Закрити при кліку поза компонентом
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Скидання пошуку при зміні опцій
  useEffect(() => {
    setSearch("");
  }, [options.length]);

  if (!searchable || options.length < 50) {
    // Звичайний select для невеликих списків
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-100">
          {label}
        </label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          {loading ? (
            <div className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            <select
              className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-8 text-sm text-zinc-50 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled || options.length === 0}
            >
              <option value="">{placeholder}</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-zinc-500" />
        </div>
      </div>
    );
  }

  // Searchable dropdown для великих списків
  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-2 block text-sm font-medium text-zinc-100">
        {label} <span className="text-xs text-zinc-500">({options.length})</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 z-10" />
        {loading ? (
          <div className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            <input
              type="text"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-8 text-sm text-zinc-50 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={value ? selectedLabel : placeholder}
              value={isOpen ? search : (value ? selectedLabel : "")}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              disabled={disabled || options.length === 0}
            />
            <ChevronRight
              className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-transform ${isOpen ? "rotate-90" : ""}`}
            />

            {isOpen && !disabled && (
              <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
                {displayOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-zinc-500">
                    Нічого не знайдено
                  </div>
                ) : (
                  <>
                    {displayOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-800 ${
                          opt.value === value
                            ? "bg-zinc-800 text-primary"
                            : "text-zinc-100"
                        }`}
                        onClick={() => {
                          onChange(opt.value);
                          setIsOpen(false);
                          setSearch("");
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                    {hasMore && (
                      <div className="px-3 py-2 text-xs text-zinc-500 border-t border-zinc-800">
                        Показано {displayOptions.length} з {filteredOptions.length}. Введіть текст для пошуку.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SelectFieldSimple({
  label,
  value,
  onChange,
  options,
  disabled,
  loading,
  icon: Icon,
  placeholder = "Оберіть",
}: Omit<SelectFieldProps, "searchable">) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-100">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        {loading ? (
          <div className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : (
          <select
            className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-8 text-sm text-zinc-50 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || options.length === 0}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-zinc-500" />
      </div>
    </div>
  );
}

interface TyreSizeCardProps {
  sizes: CarTyreSize[];
  type: "oem" | "tuning";
  selectedSize: string | null;
  onSizeClick: (size: string | null) => void;
}

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
          ? "border-primary bg-primary text-white shadow-lg shadow-primary/30"
          : "border-zinc-600 bg-zinc-800 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}

function TyreSizeCard({ sizes, type, selectedSize, onSizeClick }: TyreSizeCardProps) {
  const isOEM = type === "oem";
  const groups = groupByAxle(sizes);

  return (
    <div
      className={`rounded-xl border p-4 ${
        isOEM
          ? "border-green-800 bg-green-950/30"
          : "border-zinc-700 bg-zinc-800/30"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        {isOEM ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <Info className="h-5 w-5 text-zinc-400" />
        )}
        <span
          className={`text-sm font-semibold ${
            isOEM ? "text-green-400" : "text-zinc-300"
          }`}
        >
          {isOEM ? "Заводські розміри (OEM)" : "Допустимі заміни"}
        </span>
        <span className="text-xs text-zinc-500">(натисніть для фільтру)</span>
      </div>

      <div className="space-y-2">
        {Array.from(groups.entries()).map(([axleGroup, groupSizes]) => {
          // Якщо є різні осі в групі
          const hasDifferentAxles = groupSizes.some((s) => s.axle !== "any");

          if (hasDifferentAxles) {
            const frontSizes = groupSizes.filter((s) => s.axle === "front");
            const rearSizes = groupSizes.filter((s) => s.axle === "rear");

            return (
              <div
                key={axleGroup ?? "default"}
                className="rounded-lg bg-zinc-900/50 p-3"
              >
                {frontSizes.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-zinc-500">Передня вісь:</span>
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
                    <span className="text-xs text-zinc-500">Задня вісь:</span>
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

          // Однакові розміри для всіх осей
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

export default function VehicleTyreSelector() {
  // Стан вибору
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [year, setYear] = useState("");
  const [kitId, setKitId] = useState("");

  // Результати пошуку
  const [searchResult, setSearchResult] = useState<VehicleSearchResult | null>(
    null
  );
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Fetching даних для селектів
  const { data: brands, loading: brandsLoading } = useFetch<CarBrand[]>(
    "/api/vehicles/brands"
  );

  const { data: models, loading: modelsLoading } = useFetch<CarModel[]>(
    brandId ? `/api/vehicles/models?brandId=${brandId}` : null
  );

  const { data: years, loading: yearsLoading } = useFetch<number[]>(
    modelId ? `/api/vehicles/years?modelId=${modelId}` : null
  );

  const { data: kits, loading: kitsLoading } = useFetch<CarKit[]>(
    modelId && year
      ? `/api/vehicles/kits?modelId=${modelId}&year=${year}`
      : null
  );

  // Скидання залежних полів
  useEffect(() => {
    setModelId("");
    setYear("");
    setKitId("");
    setSearchResult(null);
  }, [brandId]);

  useEffect(() => {
    setYear("");
    setKitId("");
    setSearchResult(null);
  }, [modelId]);

  useEffect(() => {
    setKitId("");
    setSearchResult(null);
  }, [year]);

  useEffect(() => {
    setSearchResult(null);
    setSelectedSize(null);
  }, [kitId]);

  // Автовибір якщо тільки один елемент
  useEffect(() => {
    if (models && models.length === 1 && !modelId) {
      setModelId(String(models[0].id));
    }
  }, [models, modelId]);

  useEffect(() => {
    if (years && years.length === 1 && !year) {
      setYear(String(years[0]));
    }
  }, [years, year]);

  useEffect(() => {
    if (kits && kits.length === 1 && !kitId) {
      setKitId(String(kits[0].id));
    }
  }, [kits, kitId]);

  // Пошук шин
  const handleSearch = useCallback(async () => {
    if (!kitId) return;

    setSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/vehicles/search?kitId=${kitId}`);
      const json = await res.json();

      if (json.error) {
        setSearchError(json.error);
      } else {
        setSearchResult(json.data);
      }
    } catch {
      setSearchError("Помилка пошуку шин");
    } finally {
      setSearching(false);
    }
  }, [kitId]);

  // Опції для селектів
  const brandOptions =
    brands?.map((b) => ({ value: String(b.id), label: b.name })) ?? [];
  const modelOptions =
    models?.map((m) => ({ value: String(m.id), label: m.name })) ?? [];
  const yearOptions =
    years?.map((y) => ({ value: String(y), label: String(y) })) ?? [];
  const kitOptions =
    kits?.map((k) => ({ value: String(k.id), label: k.name })) ?? [];

  // Вибрана комплектація
  const selectedKit = kits?.find((k) => String(k.id) === kitId);

  return (
    <div className="space-y-6">
      {/* Селекти */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Марка авто"
          value={brandId}
          onChange={setBrandId}
          options={brandOptions}
          loading={brandsLoading}
          icon={Car}
          placeholder="Оберіть марку"
          searchable={true}
        />
        <SelectField
          label="Модель"
          value={modelId}
          onChange={setModelId}
          options={modelOptions}
          disabled={!brandId}
          loading={modelsLoading}
          icon={Car}
          placeholder="Оберіть модель"
          searchable={true}
        />
        <SelectField
          label="Рік випуску"
          value={year}
          onChange={setYear}
          options={yearOptions}
          disabled={!modelId}
          loading={yearsLoading}
          icon={Calendar}
          placeholder="Оберіть рік"
        />
        <SelectField
          label="Комплектація"
          value={kitId}
          onChange={setKitId}
          options={kitOptions}
          disabled={!year}
          loading={kitsLoading}
          icon={Settings}
          placeholder="Оберіть комплектацію"
        />
      </div>

      {/* Інформація про комплектацію */}
      <AnimatePresence>
        {selectedKit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4"
          >
            <h4 className="mb-2 text-sm font-semibold text-zinc-200">
              Параметри кріплення коліс
            </h4>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
              {selectedKit.pcd && (
                <span>
                  PCD: <strong className="text-zinc-200">{selectedKit.pcd}</strong>
                </span>
              )}
              {selectedKit.boltCount && (
                <span>
                  Болтів: <strong className="text-zinc-200">{selectedKit.boltCount}</strong>
                </span>
              )}
              {selectedKit.dia && (
                <span>
                  DIA: <strong className="text-zinc-200">{selectedKit.dia}</strong>
                </span>
              )}
              {selectedKit.boltSize && (
                <span>
                  Болт: <strong className="text-zinc-200">{selectedKit.boltSize}</strong>
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопка пошуку */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSearch}
          disabled={!kitId || searching}
          className="flex-1 rounded-full bg-zinc-50 py-3 text-base font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-8"
        >
          {searching ? (
            <Loader2 className="mr-2 inline h-5 w-5 animate-spin" />
          ) : (
            <Search className="mr-2 inline h-5 w-5" />
          )}
          Підібрати шини Bridgestone
        </button>

        <div className="hidden items-center gap-2 text-sm text-zinc-400 sm:flex">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>База даних 300,000+ комплектацій</span>
        </div>
      </div>

      {/* Помилка */}
      {searchError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Результати */}
      <AnimatePresence>
        {searchResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Інформація про авто */}
            <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">
              <h3 className="mb-4 text-xl font-bold text-zinc-50">
                {searchResult.vehicle.brand} {searchResult.vehicle.model}{" "}
                {searchResult.vehicle.year}
                <span className="ml-2 text-base font-normal text-zinc-400">
                  {searchResult.vehicle.kit}
                </span>
              </h3>

              {/* Розміри шин */}
              <div className="grid gap-4 md:grid-cols-2">
                {searchResult.tyreSizes.oem.length > 0 && (
                  <TyreSizeCard
                    sizes={searchResult.tyreSizes.oem}
                    type="oem"
                    selectedSize={selectedSize}
                    onSizeClick={setSelectedSize}
                  />
                )}
                {searchResult.tyreSizes.tuning.length > 0 && (
                  <TyreSizeCard
                    sizes={searchResult.tyreSizes.tuning}
                    type="tuning"
                    selectedSize={selectedSize}
                    onSizeClick={setSelectedSize}
                  />
                )}
              </div>

              {/* Фільтр по розміру */}
              {selectedSize && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-400">Фільтр:</span>
                  <span className="rounded-full bg-primary px-3 py-1 font-medium text-white">
                    {selectedSize}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSize(null)}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    ✕ скинути
                  </button>
                </div>
              )}
            </div>

            {/* Підходящі шини Bridgestone */}
            {(() => {
              const filteredTyres = selectedSize
                ? searchResult.matchingTyres.filter((t) =>
                    t.matchingSizes.includes(selectedSize)
                  )
                : searchResult.matchingTyres;

              return filteredTyres.length > 0 ? (
              <div>
                <h3 className="mb-4 text-xl font-bold text-zinc-50">
                  Шини Bridgestone для вашого авто
                  {selectedSize && (
                    <span className="ml-2 text-base font-normal text-zinc-400">
                      ({filteredTyres.length} моделей для {selectedSize})
                    </span>
                  )}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTyres.map((tyre, idx) => (
                    <motion.article
                      key={tyre.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800/50 transition-all hover:border-zinc-600 hover:shadow-xl"
                    >
                      <div className="relative h-32 bg-gradient-to-br from-zinc-800 to-zinc-900">
                        {tyre.imageUrl ? (
                          <img
                            src={tyre.imageUrl}
                            alt={tyre.name}
                            className="h-full w-full object-contain p-4"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Car className="h-16 w-16 text-zinc-700" />
                          </div>
                        )}
                        <div className="absolute left-3 top-3 rounded-full bg-zinc-900/90 px-2 py-0.5 text-xs font-semibold text-zinc-100">
                          {tyre.season === "summer"
                            ? "Літні"
                            : tyre.season === "winter"
                              ? "Зимові"
                              : "Всесезонні"}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-zinc-100 transition-colors group-hover:text-primary">
                          {tyre.name}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tyre.matchingSizes.map((size) => (
                            <span
                              key={size}
                              className="rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/shyny/${tyre.slug}`}
                            className="flex-1 rounded-full border border-zinc-600 px-3 py-1.5 text-center text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-700"
                          >
                            Детальніше
                          </Link>
                          <Link
                            href="/dealers"
                            className="flex items-center gap-1 rounded-full bg-zinc-50 px-3 py-1.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white"
                          >
                            <MapPin className="h-4 w-4" />
                            Купити
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-700 bg-zinc-800/30 p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-zinc-500" />
                <h3 className="mt-4 text-lg font-semibold text-zinc-200">
                  Шин Bridgestone для цих розмірів наразі немає в каталозі
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Зверніться до наших дилерів — вони допоможуть підібрати
                  альтернативу або замовити потрібний розмір.
                </p>
                <Link
                  href="/dealers"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary px-6 py-2 font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  <MapPin className="h-4 w-4" />
                  Знайти дилера
                </Link>
              </div>
            );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
