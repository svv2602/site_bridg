"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { type Dealer } from "@/lib/data";
import { getDealers } from "@/lib/api/dealers";
import { Search, MapPin, Phone, Globe, Clock, Filter, ChevronDown, Loader2, Navigation } from "lucide-react";
import { generateLocalBusinessSchema, generateBreadcrumbSchema, jsonLdScript } from "@/lib/schema";
import { Breadcrumb, ErrorState } from "@/components/ui";

// Lazy load Google Maps component (saves ~30KB initial bundle)
const DealersMap = dynamic(
  () => import("@/components/DealersMap").then((mod) => mod.DealersMap),
  {
    loading: () => (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
        <div className="flex items-center gap-2 text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Завантаження карти...</span>
        </div>
      </div>
    ),
    ssr: false,
  }
);

type FilteredDealer = Dealer & {
  displayAddress: string;
};

const dealerTypes = [
  { key: "all", label: "Всі типи" },
  { key: "official", label: "Офіційний дилер" },
  { key: "partner", label: "Партнер" },
  { key: "service", label: "Сервісний центр" },
];

export default function DealersPage() {
  const [cityQuery, setCityQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [expandedDealer, setExpandedDealer] = useState<string | null>(null);
  const [allDealers, setAllDealers] = useState<Dealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dealers on mount
  const fetchDealers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDealers();
      setAllDealers(data);
    } catch (err) {
      console.error("Failed to fetch dealers:", err);
      setError("Не вдалося завантажити список дилерів. Перевірте з'єднання з інтернетом.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const normalizedQuery = cityQuery.trim().toLowerCase();

  const dealers: FilteredDealer[] = useMemo(
    () =>
      allDealers.map((d) => ({
        ...d,
        displayAddress: [d.city, d.address].filter(Boolean).join(", "),
      })),
    [allDealers],
  );

  const filteredDealers = useMemo(() => {
    let filtered = dealers;
    if (normalizedQuery) {
      filtered = filtered.filter((dealer) => {
        const city = dealer.city?.toLowerCase() ?? "";
        const address = dealer.address?.toLowerCase() ?? "";
        return city.includes(normalizedQuery) || address.includes(normalizedQuery);
      });
    }
    if (selectedType !== "all") {
      filtered = filtered.filter((dealer) => dealer.type === selectedType);
    }
    return filtered;
  }, [dealers, normalizedQuery, selectedType]);

  const buildRouteUrl = (dealer: Dealer) => {
    if (dealer.latitude && dealer.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${dealer.latitude},${dealer.longitude}`;
    }
    const address = encodeURIComponent(`${dealer.address}, ${dealer.city}, Україна`);
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

  const dealerSchemas = allDealers.map((dealer) => generateLocalBusinessSchema(dealer));
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Головна", url: "https://bridgestone.ua/" },
    { name: "Де купити", url: "https://bridgestone.ua/dealers" },
  ]);

  return (
    <div className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
      />
      {dealerSchemas.map((schema, idx) => (
        <script
          key={`dealer-schema-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(schema) }}
        />
      ))}
      {/* Hero */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div
            
            
            
            className="mx-auto flex max-w-4xl flex-col gap-4 text-left md:gap-5"
          >
            <Breadcrumb
              className="hero-breadcrumb-adaptive mb-1"
              items={[
                { label: "Головна", href: "/" },
                { label: "Дилери / Де купити" },
              ]}
            />
            <h1 className="hero-title-adaptive text-3xl font-semibold tracking-tight md:text-4xl">
              Пошук офіційних дилерів Bridgestone
              <span className="hero-subtitle-adaptive mt-1 block text-base font-normal md:text-lg">
                використовуйте технічний пошук за містом, адресою та типом точки
              </span>
            </h1>
            <p className="hero-text-adaptive max-w-2xl text-sm md:text-base">
              Фільтруйте офіційні точки продажу та сервісні партнери Bridgestone по всій Україні.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <h2 className="mb-4 text-2xl font-semibold">Пошук дилерів</h2>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <label htmlFor="city-search" className="mb-2 block text-sm font-medium text-foreground">
                      Місто або адреса
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <input
                        type="text"
                        id="city-search"
                        placeholder="Наприклад, Київ, Львів..."
                        value={cityQuery}
                        onChange={(e) => setCityQuery(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <label htmlFor="dealer-type" className="mb-2 block text-sm font-medium text-foreground">Тип точки</label>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <select
                        id="dealer-type"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-border bg-background py-3 pl-10 pr-8 text-sm text-foreground outline-none focus:border-primary"
                      >
                        {dealerTypes.map((type) => (
                          <option key={type.key} value={type.key}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Знайдено дилерів:{" "}
                      <span className="text-2xl font-bold text-foreground">
                        {isLoading ? "..." : filteredDealers.length}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCityQuery("");
                      setSelectedType("all");
                    }}
                    className="rounded-full border border-stone-300 bg-transparent px-5 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700"
                  >
                    Скинути фільтри
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <MapPin className="h-5 w-5 text-primary" />
                Інтерактивна карта
              </h3>
              <div className="h-80 overflow-hidden rounded-xl">
                <DealersMap
                  dealers={allDealers}
                  selectedDealerId={expandedDealer}
                  onDealerSelect={(id) => setExpandedDealer(id)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dealers List */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-8 text-3xl font-bold">Список дилерів</h2>

          {error ? (
            <ErrorState
              title="Помилка завантаження"
              message={error}
              onRetry={fetchDealers}
            />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Завантаження дилерів...</span>
            </div>
          ) : filteredDealers.length === 0 ? (
            <div
              
              
              className="rounded-2xl border border-border bg-card p-12 text-center"
            >
              <Search className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-xl font-semibold">Дилерів не знайдено</h3>
              <p className="mt-2 text-muted-foreground">
                Спробуйте змінити параметри пошуку або обрати інше місто.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">
              {filteredDealers.map((dealer, idx) => (
                <article
                  key={dealer.id}
                  
                  
                  
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${dealer.type === "official"
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                              : dealer.type === "partner"
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200"
                                : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                            }`}
                        >
                          {dealer.type === "official"
                            ? "Офіційний дилер"
                            : dealer.type === "partner"
                              ? "Партнер"
                              : "Сервісний центр"}
                        </span>
                        <h3 className="mt-3 mb-1 text-xl font-medium text-foreground transition-all group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                          {dealer.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{dealer.displayAddress}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dealer.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted">Телефон</p>
                            <a
                              href={`tel:${dealer.phone}`}
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {dealer.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {dealer.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted">Вебсайт</p>
                            <a
                              href={dealer.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {dealer.website}
                            </a>
                          </div>
                        </div>
                      )}
                      {dealer.workingHours && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted">Години роботи</p>
                            <p className="font-medium">{dealer.workingHours}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <button
                        onClick={() => setExpandedDealer(expandedDealer === dealer.id ? null : dealer.id)}
                        aria-expanded={expandedDealer === dealer.id}
                        aria-controls={`dealer-details-${dealer.id}`}
                        className="rounded-full border border-stone-300 bg-transparent px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700"
                      >
                        {expandedDealer === dealer.id ? "Менше" : "Детальніше"}
                      </button>
                      <a
                        href={buildRouteUrl(dealer)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-text hover:bg-primary-hover"
                      >
                        <Navigation className="h-4 w-4" />
                        Побудувати маршрут
                      </a>
                    </div>

                    {expandedDealer === dealer.id && (
                      <div
                        id={`dealer-details-${dealer.id}`}
                        
                        
                        className="mt-6 space-y-3 border-t border-border pt-6 text-sm"
                      >
                        <p className="font-medium">Додаткова інформація</p>
                        <p className="text-muted-foreground">
                          Цей дилер пропонує повний спектр послуг: продаж шин Bridgestone, шиномонтаж,
                          балансування, зберігання шин та консультації.
                        </p>
                        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                          <li>Наявність шин на складі</li>
                          <li>Можливість онлайн‑бронювання</li>
                          <li>Сервіс «шини на винос»</li>
                          <li>Гарантія на послуги</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div
            
            
            
            className="rounded-3xl bg-graphite p-10 text-white shadow-2xl"
          >
            <h3 className="mb-4 text-3xl font-bold">Не знайшли потрібного дилера?</h3>
            <p className="mb-8 text-lg opacity-90">
              Зв&apos;яжіться з нами напряму — ми допоможемо знайти найближчу точку продажу
              або організуємо доставку шин у ваше місто.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+380800123456"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-graphite transition-colors hover:bg-stone-100"
              >
                <Phone className="h-4 w-4" />
                Зателефонувати
              </a>
              <Link
                href="/contacts"
                className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Заповнити форму
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
