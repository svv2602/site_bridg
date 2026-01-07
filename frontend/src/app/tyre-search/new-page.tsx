"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  MOCK_TYRE_MODELS,
  MOCK_VEHICLE_FITMENTS,
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
  Star,
  Calendar,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

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

export default function TyreSearchPage() {
  const [mode, setMode] = useState<SearchMode>("size");
  const [width, setWidth] = useState("");
  const [aspectRatio, setAspectRatio] = useState("");
  const [diameter, setDiameter] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState<TyreModel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const widthOptions = ["195", "205", "215", "225", "235", "245", "255", "265"];
  const aspectOptions = ["45", "50", "55", "60", "65", "70"];
  const diameterOptions = ["15", "16", "17", "18", "19", "20", "21"];

  const makes = Array.from(new Set(MOCK_VEHICLE_FITMENTS.map((v) => v.make)));
  const modelsForMake = MOCK_VEHICLE_FITMENTS.filter((v) => v.make === make).map(
    (v) => v.model,
  );
  const yearsForMakeModel = MOCK_VEHICLE_FITMENTS.filter(
    (v) => v.make === make && v.model === model,
  ).flatMap((v) => {
    const start = v.yearFrom;
    const end = v.yearTo ?? new Date().getFullYear();
    const arr: number[] = [];
    for (let y = start; y <= end; y += 1) {
      arr.push(y);
    }
    return arr;
  });

  function handleSizeSearch(e: FormEvent) {
    e.preventDefault();
    const w = parseInt(width, 10);
    const a = parseInt(aspectRatio, 10);
    const d = parseInt(diameter, 10);
    const filtered = MOCK_TYRE_MODELS.filter((model) =>
      model.sizes.some(
        (s) => s.width === w && s.aspectRatio === a && s.diameter === d,
      ),
    );
    setResults(filtered);
    setHasSearched(true);
  }

  function handleCarSearch(e: FormEvent) {
    e.preventDefault();
    if (!make || !model || !year) {
      setResults([]);
      setHasSearched(true);
      return;
    }
    const y = parseInt(year, 10);
    const fitment = MOCK_VEHICLE_FITMENTS.find(
      (v) =>
        v.make === make &&
        v.model === model &&
        v.yearFrom <= y &&
        (v.yearTo ?? y) >= y,
    );
    if (!fitment) {
      setResults([]);
      setHasSearched(true);
      return;
    }
    const filtered = MOCK_TYRE_MODELS.filter((model) =>
      model.sizes.some((s) =>
        fitment.recommendedSizes.some(
          (rec) =>
            rec.width === s.width &&
            rec.aspectRatio === s.aspectRatio &&
            rec.diameter === s.diameter,
        ),
      ),
    );
    setResults(filtered);
    setHasSearched(true);
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
                      {[
                        { label: "Ширина", value: width, setter: setWidth, options: widthOptions, icon: Ruler },
                        { label: "Висота профілю", value: aspectRatio, setter: setAspectRatio, options: aspectOptions, icon: Filter },
                        { label: "Діаметр", value: diameter, setter: setDiameter, options: diameterOptions, icon: Ruler },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className="mb-2 block text-sm font-medium text-zinc-100">{field.label}</label>
                          <div className="relative">
                            <field.icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                            <select
                              className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-8 text-sm text-zinc-50 outline-none focus:border-primary"
                              value={field.value}
                              onChange={(e) => field.setter(e.target.value)}
                              required
                            >
                              <option value="">Оберіть</option>
                              {field.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Ми гарантуємо точний підбір за офіційними каталогами Bridgestone</span>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-full bg-zinc-50 py-3 text-base font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white"
                    >
                      <Search className="mr-2 inline h-5 w-5" />
                      Знайти шини
                    </button>
                  </form>
                ) : (
                  <form className="space-y-6" onSubmit={handleCarSearch}>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { label: "Марка авто", value: make, setter: setMake, options: makes, icon: Car, disabled: false },
                        { label: "Модель", value: model, setter: setModel, options: modelsForMake, icon: Car, disabled: !make },
                        { label: "Рік випуску", value: year, setter: setYear, options: Array.from(new Set(yearsForMakeModel)).sort((a, b) => b - a), icon: Calendar, disabled: !model },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className="mb-2 block text-sm font-medium text-zinc-100">{field.label}</label>
                          <div className="relative">
                            <field.icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                            <select
                              className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-8 text-sm text-zinc-50 outline-none focus:border-primary"
                              value={field.value}
                              onChange={(e) => field.setter(e.target.value)}
                              required
                              disabled={field.disabled}
                            >
                              <option value="">Оберіть</option>
                              {field.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Рекомендації базуються на офіційних даних виробників авто</span>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-full bg-zinc-50 py-3 text-base font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white"
                    >
                      <Search className="mr-2 inline h-5 w-5" />
                      Підібрати шини
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-6">
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
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                  <MapPin className="h-5 w-5 text-primary" />
                  Не знайшли потрібний розмір?
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Зв’яжіться з нашими експертами — ми допоможемо підібрати альтернативу
                  або знайти шини під замовлення.
                </p>
                <button className="w-full rounded-full border border-primary bg-transparent py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
                  Замовити консультацію
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-6 text-2xl font-semibold md:text-3xl">Результати пошуку</h2>
          {!hasSearched ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-border bg-card p-12 text-center"
            >
              <Search className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-xl font-semibold">Введіть параметри пошуку</h3>
              <p className="mt-2 text-muted-foreground">
                Заповніть форму зліва та натисніть кнопку для відображення доступних моделей шин.
              </p>
            </motion.div>
          ) : results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-border bg-card p-12 text-center"
            >
              <Search className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-xl font-semibold">Шин не знайдено</h3>
              <p className="mt-2 text-muted-foreground">
                За вказаними параметрами наразі немає результатів у демонстраційних даних.
                Спробуйте змінити критерії пошуку.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((model, idx) => (
                <motion.article
                  key={model.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all hover:shadow-2xl"
                >
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Car className="h-20 w-20 text-zinc-700" />
                    </div>
                    <div className="absolute top-4 left-4 rounded-full bg-zinc-900/90 px-3 py-1 text-xs font-semibold text-zinc-50 ring-1 ring-zinc-600">
                      {seasonLabels[model.season]}
                    </div>
                    <div className="absolute top-4 right-4 rounded-full bg-zinc-900/80 px-3 py-1 text-xs font-semibold text-zinc-100 ring-1 ring-zinc-700">
                      {model.vehicleTypes.includes("suv")
                        ? "SUV / 4x4"
                        : model.vehicleTypes.includes("passenger")
                          ? "Легковий авто"
                          : "Легкий комерційний транспорт"}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-bold transition-colors group-hover:text-primary">
                      {model.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {model.shortDescription}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {model.sizes.map((size, index) => (
                        <span
                          key={`${model.slug}-${index}`}
                          className="rounded-full border border-border bg-background px-2 py-1"
                        >
                          {formatSize(size)}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/shyny/${model.slug}`}
                        className="inline-flex items-center rounded-full border border-border bg-transparent px-4 py-2 text-sm font-semibold hover:bg-card"
                      >
                        Детальніше про модель
                      </Link>
                      <Link
                        href="/dealers"
                        className="inline-flex items-center rounded-full border border-zinc-400 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-white"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Знайти дилера
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}