"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, useRef, useCallback } from "react";

import {
  type Season,
  type Brand,
  type TyreModel,
  type TyreSize,
} from "@/lib/data";
import { brandLabels, brandColors } from "@/lib/utils/tyres";
import {
  Search,
  Car,
  Ruler,
  Filter,
  ChevronRight,
  CheckCircle,
  MapPin,
  Database,
  Loader2,
} from "lucide-react";
import { VehicleTyreSelector } from "@/components/VehicleTyreSelector";
import { TyreCard } from "@/components/TyreCard";
import { Breadcrumb } from "@/components/ui";

type SearchMode = "size" | "car";

const seasonLabels: Record<Season, string> = {
  summer: "Літні шини",
  winter: "Зимові шини",
  allseason: "Всесезонні шини",
};

function formatSize(size: TyreSize) {
  const base = `${size.width}/${size.aspectRatio} R${size.diameter}`;
  const li = size.loadIndex ? ` ${size.loadIndex}` : "";
  const si = size.speedIndex ?? "";
  return `${base}${li}${si}`;
}

interface SizeOption {
  value: number;
  count: number;
}

// Тип даних з sessionStorage
interface StoredSearchParams {
  mode: 'size' | 'car';
  width?: string;
  aspectRatio?: string;
  diameter?: string;
  season?: string;
  make?: string;
  model?: string;
  year?: string;
  kit?: string;
  timestamp?: number;
}

export default function TyreSearchPage() {
  const searchParams = useSearchParams();
  const urlMode = searchParams.get('mode') as SearchMode | null;

  const [mode, setMode] = useState<SearchMode>(urlMode === 'car' ? 'car' : 'size');
  const [width, setWidth] = useState("");
  const [aspectRatio, setAspectRatio] = useState("");
  const [diameter, setDiameter] = useState("");
  const [season, setSeason] = useState<string>("");
  const [results, setResults] = useState<TyreModel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchedSize, setSearchedSize] = useState("");
  const [searchedSeason, setSearchedSeason] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>(["bridgestone", "firestone"]);
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const [storedParams, setStoredParams] = useState<StoredSearchParams | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const hasReadStorage = useRef(false);

  // Оновлення mode при зміні URL параметрів (навігація в межах сторінки)
  useEffect(() => {
    if (urlMode === 'car' || urlMode === 'size') {
      setMode(urlMode);
    }
  }, [urlMode]);

  // Filter results by selected brands
  const filteredResults = results.filter(tyre => selectedBrands.includes(tyre.brand));

  function toggleBrand(brand: Brand) {
    setSelectedBrands(prev => {
      if (prev.includes(brand)) {
        // Don't allow deselecting all brands
        if (prev.length === 1) return prev;
        return prev.filter(b => b !== brand);
      }
      return [...prev, brand];
    });
  }

  // Читання параметрів з sessionStorage при монтуванні
  useEffect(() => {
    // Захист від подвійного виконання в React Strict Mode
    if (hasReadStorage.current) return;
    hasReadStorage.current = true;

    // Перевірка що ми на клієнті
    if (typeof window === 'undefined') return;

    const stored = sessionStorage.getItem('tyreSearchParams');
    if (stored) {
      try {
        const params: StoredSearchParams = JSON.parse(stored);
        // Перевіряємо що дані свіжі (не старші 5 хвилин)
        if (params.timestamp && Date.now() - params.timestamp < 5 * 60 * 1000) {
          console.log('[TyreSearchPage] Loaded params from sessionStorage:', params);
          setStoredParams(params);
          setMode(params.mode || 'size');
          if (params.mode === 'size') {
            if (params.width) setWidth(params.width);
            if (params.aspectRatio) setAspectRatio(params.aspectRatio);
            if (params.diameter) setDiameter(params.diameter);
            if (params.season) setSeason(params.season);
          }
          // Очищаємо sessionStorage - для 'car' дані передаються через props
          sessionStorage.removeItem('tyreSearchParams');
        } else {
          sessionStorage.removeItem('tyreSearchParams');
        }
      } catch (e) {
        sessionStorage.removeItem('tyreSearchParams');
      }
    }
  }, []);

  // Динамічні опції з бази даних
  const [widthOptions, setWidthOptions] = useState<SizeOption[]>([]);
  const [aspectOptions, setAspectOptions] = useState<SizeOption[]>([]);
  const [diameterOptions, setDiameterOptions] = useState<SizeOption[]>([]);
  const [loadingWidths, setLoadingWidths] = useState(false);
  const [loadingAspects, setLoadingAspects] = useState(false);
  const [loadingDiameters, setLoadingDiameters] = useState(false);

  // Завантаження ширин при монтуванні
  useEffect(() => {
    setLoadingWidths(true);
    fetch('/api/tyres/sizes?type=width')
      .then(res => res.json())
      .then(json => {
        if (json.data) setWidthOptions(json.data);
      })
      .catch(console.error)
      .finally(() => setLoadingWidths(false));
  }, []);

  // Завантаження висот при зміні ширини
  useEffect(() => {
    if (!width) {
      setAspectOptions([]);
      return;
    }
    setLoadingAspects(true);
    fetch(`/api/tyres/sizes?type=height&width=${width}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) setAspectOptions(json.data);
      })
      .catch(console.error)
      .finally(() => setLoadingAspects(false));
  }, [width]);

  // Завантаження діаметрів при зміні висоти
  useEffect(() => {
    if (!width || !aspectRatio) {
      setDiameterOptions([]);
      return;
    }
    setLoadingDiameters(true);
    fetch(`/api/tyres/sizes?type=diameter&width=${width}&height=${aspectRatio}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) setDiameterOptions(json.data);
      })
      .catch(console.error)
      .finally(() => setLoadingDiameters(false));
  }, [width, aspectRatio]);

  // Функція пошуку (визначена перед useEffect що її використовує)
  const performSearch = useCallback(async () => {
    if (!width || !aspectRatio || !diameter) return;

    setSearching(true);
    setSearchedSize(`${width}/${aspectRatio} R${diameter}`);
    setSearchedSeason(season);

    try {
      let url = `/api/tyres/search?width=${width}&height=${aspectRatio}&diameter=${diameter}`;
      if (season) url += `&season=${season}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.data?.tyres) {
        setResults(json.data.tyres);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setSearching(false);
      setHasSearched(true);
      // Scroll to results after DOM updates
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [width, aspectRatio, diameter, season]);

  // Авто-пошук при завантаженні сторінки з sessionStorage параметрами
  useEffect(() => {
    if (initialSearchDone) return;
    if (loadingWidths || loadingAspects || loadingDiameters) return;
    if (!storedParams || storedParams.mode !== 'size') return;

    // Перевіряємо що є всі параметри
    if (!storedParams.width || !storedParams.aspectRatio || !storedParams.diameter) return;

    // Перевіряємо що опції завантажені і містять потрібні значення
    const hasWidth = widthOptions.some(o => o.value === parseInt(storedParams.width!));
    const hasAspect = aspectOptions.some(o => o.value === parseInt(storedParams.aspectRatio!));
    const hasDiameter = diameterOptions.some(o => o.value === parseInt(storedParams.diameter!));

    if (hasWidth && hasAspect && hasDiameter && width && aspectRatio && diameter) {
      setInitialSearchDone(true);
      // Використовуємо setTimeout щоб React встиг оновити DOM
      setTimeout(() => {
        performSearch();
      }, 0);
    }
  }, [width, aspectRatio, diameter, widthOptions, aspectOptions, diameterOptions, loadingWidths, loadingAspects, loadingDiameters, initialSearchDone, storedParams, performSearch]);

  async function handleSizeSearch(e: FormEvent) {
    e.preventDefault();
    performSearch();
  }

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div
            
            
            
            className="mx-auto flex max-w-5xl flex-col gap-6 text-left md:flex-row md:items-center md:justify-between"
          >
            <div>
              <Breadcrumb
                className="hero-breadcrumb-adaptive mb-3"
                items={[
                  { label: "Головна", href: "/" },
                  { label: "Пошук шин" },
                ]}
              />
              <h1 className="hero-title-adaptive mb-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Технічний підбір шин
                <span className="hero-subtitle-adaptive block text-base font-normal md:text-lg">
                  за розміром або за вашим автомобілем
                </span>
              </h1>
              <p className="hero-text-adaptive max-w-xl text-sm md:text-base">
                Введіть параметри, а ми підберемо відповідні моделі шин Bridgestone з демонстраційної бази.
                Інтерфейс оформлений у більш «технічному» стилі на основі референсів Goodyear.
              </p>
            </div>
            <div className="hidden gap-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-900/60 p-4 text-xs text-stone-600 dark:text-stone-300 shadow-lg md:flex md:flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Режим підбору
              </span>
              <p>
                Оберіть пошук за <span className="font-semibold">типорозміром</span> або
                <span className="font-semibold"> за авто</span>, заповніть поля й запустіть пошук.
              </p>
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                У продакшн‑версії форми будуть підключені до повного каталогу шин та бази авто.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
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
                      onClick={() => setMode("size")}
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
                      onClick={() => setMode("car")}
                    >
                      <Car className="h-4 w-4" aria-hidden="true" />
                      За авто
                    </button>
                  </div>
                </div>

                {mode === "size" ? (
                  <form
                    id="size-search-panel"
                    role="tabpanel"
                    aria-labelledby="size-search-tab"
                    className="space-y-6"
                    onSubmit={handleSizeSearch}
                  >
                    <div className="grid gap-4 sm:grid-cols-3">
                      {/* Ширина */}
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
                              onChange={(e) => setWidth(e.target.value)}
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

                      {/* Висота профілю */}
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
                              onChange={(e) => setAspectRatio(e.target.value)}
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

                      {/* Діаметр */}
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
                              onChange={(e) => setDiameter(e.target.value)}
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

                    {/* Сезон (опційно) */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-100">
                        Сезонність <span className="text-stone-500">(опційно)</span>
                      </label>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                        <select
                          className="w-full appearance-none rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-8 text-sm text-stone-900 outline-none focus:border-primary dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
                          value={season}
                          onChange={(e) => setSeason(e.target.value)}
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

                    {/* Результати пошуку за розміром - відразу після форми */}
                    {hasSearched && (
                      <div
                        ref={resultsRef}
                        className="mt-8 border-t border-stone-300 pt-6 dark:border-stone-700"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50 flex flex-wrap items-center gap-2">
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
                          </h3>
                          {/* Brand filter */}
                          {results.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-500 dark:text-stone-400">Бренд:</span>
                              {(["bridgestone", "firestone"] as Brand[]).map(brand => (
                                <button
                                  key={brand}
                                  type="button"
                                  onClick={() => toggleBrand(brand)}
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
                          <div className="grid gap-4 sm:grid-cols-2">
                            {filteredResults.map((model) => (
                              <TyreCard key={model.slug} tyre={model} variant="compact" />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                ) : (
                  <div
                    id="car-search-panel"
                    role="tabpanel"
                    aria-labelledby="car-search-tab"
                  >
                    {(() => {
                      const props = {
                        initialMake: storedParams?.mode === 'car' ? storedParams.make : undefined,
                        initialModel: storedParams?.mode === 'car' ? storedParams.model : undefined,
                        initialYear: storedParams?.mode === 'car' ? storedParams.year : undefined,
                        initialKit: storedParams?.mode === 'car' ? storedParams.kit : undefined,
                        initialSeason: storedParams?.mode === 'car' ? storedParams.season : undefined,
                      };
                      console.log('[TyreSearchPage] VehicleTyreSelector props:', props);
                      return <VehicleTyreSelector {...props} />;
                    })()}
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
    </div>
  );
}