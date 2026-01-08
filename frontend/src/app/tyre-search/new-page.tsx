"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  type Season,
  type TyreModel,
  type TyreSize,
} from "@/lib/data";
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
import VehicleTyreSelector from "@/components/VehicleTyreSelector";
import { TyreCard } from "@/components/TyreCard";

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

export default function TyreSearchPage() {
  const [mode, setMode] = useState<SearchMode>("car");
  const [width, setWidth] = useState("");
  const [aspectRatio, setAspectRatio] = useState("");
  const [diameter, setDiameter] = useState("");
  const [results, setResults] = useState<TyreModel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchedSize, setSearchedSize] = useState("");

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
      setAspectRatio("");
      return;
    }
    setLoadingAspects(true);
    setAspectRatio("");
    setDiameter("");
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
      setDiameter("");
      return;
    }
    setLoadingDiameters(true);
    setDiameter("");
    fetch(`/api/tyres/sizes?type=diameter&width=${width}&height=${aspectRatio}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) setDiameterOptions(json.data);
      })
      .catch(console.error)
      .finally(() => setLoadingDiameters(false));
  }, [width, aspectRatio]);

  async function handleSizeSearch(e: FormEvent) {
    e.preventDefault();
    if (!width || !aspectRatio || !diameter) return;

    setSearching(true);
    setSearchedSize(`${width}/${aspectRatio} R${diameter}`);

    try {
      const res = await fetch(`/api/tyres/search?width=${width}&height=${aspectRatio}&diameter=${diameter}`);
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
    }
  }

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-5xl flex-col gap-6 text-left text-zinc-50 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <nav className="mb-3 text-xs text-zinc-400">
                <span className="cursor-pointer hover:text-zinc-100">Головна</span>
                <span className="mx-2">/</span>
                <span className="font-medium text-zinc-100">Пошук шин</span>
              </nav>
              <h1 className="mb-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Технічний підбір шин
                <span className="block text-base font-normal text-zinc-300 md:text-lg">
                  за розміром або за вашим автомобілем
                </span>
              </h1>
              <p className="max-w-xl text-sm text-zinc-300 md:text-base">
                Введіть параметри, а ми підберемо відповідні моделі шин Bridgestone з демонстраційної бази.
                Інтерфейс оформлений у більш «технічному» стилі на основі референсів Goodyear.
              </p>
            </div>
            <div className="hidden gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/60 p-4 text-xs text-zinc-300 shadow-lg md:flex md:flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Режим підбору
              </span>
              <p>
                Оберіть пошук за <span className="font-semibold">типорозміром</span> або
                <span className="font-semibold"> за авто</span>, заповніть поля й запустіть пошук.
              </p>
              <p className="text-[11px] text-zinc-500">
                У продакшн‑версії форми будуть підключені до повного каталогу шин та бази авто.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Search Panel */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 text-zinc-50 shadow-[0_18px_40px_rgba(0,0,0,0.45)] md:p-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-2xl font-bold">Оберіть спосіб пошуку</h2>
                  <div className="inline-flex rounded-full bg-zinc-800 p-1 ring-1 ring-zinc-700">
                    <button
                      type="button"
                      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                        mode === "size"
                          ? "bg-zinc-50 text-zinc-900"
                          : "text-zinc-300 hover:text-zinc-50"
                      }`}
                      onClick={() => setMode("size")}
                    >
                      <Ruler className="h-4 w-4" />
                      За розміром
                    </button>
                    <button
                      type="button"
                      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                        mode === "car"
                          ? "bg-zinc-50 text-zinc-900"
                          : "text-zinc-300 hover:text-zinc-50"
                      }`}
                      onClick={() => setMode("car")}
                    >
                      <Car className="h-4 w-4" />
                      За авто
                    </button>
                  </div>
                </div>

                {mode === "size" ? (
                  <form className="space-y-6" onSubmit={handleSizeSearch}>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {/* Ширина */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-100">
                          Ширина {widthOptions.length > 0 && <span className="text-zinc-500">({widthOptions.length})</span>}
                        </label>
                        <div className="relative">
                          <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                          {loadingWidths ? (
                            <div className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
                              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                            </div>
                          ) : (
                            <select
                              className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-8 text-sm text-zinc-50 outline-none focus:border-primary"
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
                        <label className="mb-2 block text-sm font-medium text-zinc-100">
                          Висота профілю {aspectOptions.length > 0 && <span className="text-zinc-500">({aspectOptions.length})</span>}
                        </label>
                        <div className="relative">
                          <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                          {loadingAspects ? (
                            <div className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
                              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                            </div>
                          ) : (
                            <select
                              className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-8 text-sm text-zinc-50 outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
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
                        <label className="mb-2 block text-sm font-medium text-zinc-100">
                          Діаметр {diameterOptions.length > 0 && <span className="text-zinc-500">({diameterOptions.length})</span>}
                        </label>
                        <div className="relative">
                          <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                          {loadingDiameters ? (
                            <div className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
                              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                            </div>
                          ) : (
                            <select
                              className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-8 text-sm text-zinc-50 outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Ми гарантуємо точний підбір за офіційними каталогами Bridgestone</span>
                    </div>
                    <button
                      type="submit"
                      disabled={!width || !aspectRatio || !diameter || searching}
                      className="w-full rounded-full bg-zinc-50 py-3 text-base font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
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
                      <div className="mt-8 border-t border-zinc-700 pt-6">
                        <h3 className="mb-4 text-xl font-bold text-zinc-50">
                          Результати пошуку
                          {searchedSize && (
                            <span className="ml-3 rounded-full bg-primary px-3 py-1 text-sm font-medium text-white">
                              {searchedSize}
                            </span>
                          )}
                        </h3>
                        {results.length === 0 ? (
                          <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-6 text-center">
                            <Search className="mx-auto h-10 w-10 text-zinc-500" />
                            <p className="mt-3 text-zinc-400">
                              Шин Bridgestone для розміру {searchedSize} не знайдено в каталозі.
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
                            {results.map((model) => (
                              <TyreCard key={model.slug} tyre={model} variant="compact" />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                ) : (
                  <VehicleTyreSelector />
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-6">
              {mode === "car" ? (
                <div className="rounded-2xl border border-zinc-700 bg-zinc-800/50 p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-100">
                    <Database className="h-5 w-5 text-primary" />
                    База даних авто
                  </h3>
                  <ul className="space-y-3 text-sm text-zinc-400">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                      <span><strong className="text-zinc-200">227 марок</strong> автомобілів</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                      <span><strong className="text-zinc-200">5,900+ моделей</strong> від 1990 до 2024 року</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                      <span><strong className="text-zinc-200">300,000+ комплектацій</strong> з розмірами</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                      <span><strong className="text-zinc-200">OEM та альтернативні</strong> розміри шин</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-xs text-zinc-500">
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
                  Зв'яжіться з нашими експертами — ми допоможемо підібрати альтернативу
                  або знайти шини під замовлення.
                </p>
                <Link
                  href="/dealers"
                  className="block w-full rounded-full border border-primary bg-transparent py-2.5 text-center text-sm font-semibold text-primary hover:bg-primary/10"
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