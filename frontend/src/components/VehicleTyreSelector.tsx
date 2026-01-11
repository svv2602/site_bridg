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
        <label className="mb-2 block text-sm font-medium text-foreground">
          {label}
        </label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          {loading ? (
            <div className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-card">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <select
              className="w-full appearance-none rounded-xl border border-border bg-card py-3 pl-10 pr-8 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
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
          <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Searchable dropdown для великих списків
  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label} <span className="text-xs text-muted-foreground">({options.length})</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10" />
        {loading ? (
          <div className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-card">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <input
              type="text"
              className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-8 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
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
              className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}
            />

            {isOpen && !disabled && (
              <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-xl">
                {displayOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Нічого не знайдено
                  </div>
                ) : (
                  <>
                    {displayOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                          opt.value === value
                            ? "bg-muted text-primary"
                            : "text-foreground"
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
                      <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
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
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        {loading ? (
          <div className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-card">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <select
            className="w-full appearance-none rounded-xl border border-border bg-card py-3 pl-10 pr-8 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
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
        <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted-foreground" />
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
          : "border-border bg-muted text-foreground hover:border-muted-foreground hover:bg-muted/80"
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
          ? "border-success/50 bg-success/10"
          : "border-border bg-card/30"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        {isOEM ? (
          <CheckCircle className="h-5 w-5 text-success" />
        ) : (
          <Info className="h-5 w-5 text-muted-foreground" />
        )}
        <span
          className={`text-sm font-semibold ${
            isOEM ? "text-success" : "text-foreground"
          }`}
        >
          {isOEM ? "Заводські розміри (OEM)" : "Допустимі заміни"}
        </span>
        <span className="text-xs text-muted-foreground">(натисніть для фільтру)</span>
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
                className="rounded-lg bg-muted/50 p-3"
              >
                {frontSizes.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground">Передня вісь:</span>
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
                    <span className="text-xs text-muted-foreground">Задня вісь:</span>
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

export function VehicleTyreSelector() {
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
            className="rounded-xl border border-border bg-card/50 p-4"
          >
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Параметри кріплення коліс
            </h4>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {selectedKit.pcd && (
                <span>
                  PCD: <strong className="text-foreground">{selectedKit.pcd}</strong>
                </span>
              )}
              {selectedKit.boltCount && (
                <span>
                  Болтів: <strong className="text-foreground">{selectedKit.boltCount}</strong>
                </span>
              )}
              {selectedKit.dia && (
                <span>
                  DIA: <strong className="text-foreground">{selectedKit.dia}</strong>
                </span>
              )}
              {selectedKit.boltSize && (
                <span>
                  Болт: <strong className="text-foreground">{selectedKit.boltSize}</strong>
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
          className="flex-1 rounded-full bg-primary py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-8"
        >
          {searching ? (
            <Loader2 className="mr-2 inline h-5 w-5 animate-spin" />
          ) : (
            <Search className="mr-2 inline h-5 w-5" />
          )}
          Підібрати шини Bridgestone
        </button>

        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <CheckCircle className="h-4 w-4 text-success" />
          <span>База даних 300,000+ комплектацій</span>
        </div>
      </div>

      {/* Помилка */}
      {searchError && (
        <div className="flex items-center gap-2 rounded-xl border border-error/50 bg-error/10 p-4 text-error">
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
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-xl font-bold text-foreground">
                {searchResult.vehicle.brand} {searchResult.vehicle.model}{" "}
                {searchResult.vehicle.year}
                <span className="ml-2 text-base font-normal text-muted-foreground">
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
                <div className="flex items-center gap-2 text-sm mt-4">
                  <span className="text-muted-foreground">Фільтр:</span>
                  <span className="rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground">
                    {selectedSize}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSize(null)}
                    className="text-muted-foreground hover:text-foreground"
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
                <h3 className="mb-4 text-xl font-bold text-foreground">
                  Шини Bridgestone для вашого авто
                  {selectedSize && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
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
                      className="group overflow-hidden rounded-xl border border-border bg-card/50 transition-all hover:border-muted-foreground hover:shadow-xl"
                    >
                      <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50">
                        {tyre.imageUrl ? (
                          <img
                            src={tyre.imageUrl}
                            alt={tyre.name}
                            className="h-full w-full object-contain p-4"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Car className="h-16 w-16 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold text-foreground">
                          {tyre.season === "summer"
                            ? "Літні"
                            : tyre.season === "winter"
                              ? "Зимові"
                              : "Всесезонні"}
                        </div>
                      </div>
                      <div className="flex flex-col p-4">
                        <h4 className="font-bold text-foreground transition-colors group-hover:text-primary line-clamp-2">
                          {tyre.name}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-1 min-h-[1.5rem]">
                          {tyre.matchingSizes.slice(0, 3).map((size) => (
                            <span
                              key={size}
                              className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {size}
                            </span>
                          ))}
                          {tyre.matchingSizes.length > 3 && (
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              +{tyre.matchingSizes.length - 3}
                            </span>
                          )}
                        </div>
                        <div className="mt-auto pt-4 flex flex-wrap gap-2">
                          <Link
                            href={`/shyny/${tyre.slug}`}
                            className="flex-1 min-w-[80px] rounded-full border border-border px-3 py-1.5 text-center text-xs sm:text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                          >
                            Детальніше
                          </Link>
                          <Link
                            href="/dealers"
                            className="flex-1 min-w-[80px] flex items-center justify-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs sm:text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                            Купити
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card/30 p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Шин Bridgestone для цих розмірів наразі немає в каталозі
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
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
