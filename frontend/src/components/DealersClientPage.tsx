"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { type Dealer } from "@/lib/data";
import { Search, MapPin, Phone, Globe, Clock, Filter, ChevronDown, Loader2, Navigation, Map, List } from "lucide-react";
import { pluralize } from "@/lib/utils/pluralize";
import analytics from "@/lib/analytics";

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

interface DealersClientPageProps {
  initialDealers: Dealer[];
}

export function DealersClientPage({ initialDealers }: DealersClientPageProps) {
  const [cityQuery, setCityQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [expandedDealer, setExpandedDealer] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("dealers-mobile-view") as "list" | "map") || "list";
    }
    return "list";
  });

  const normalizedQuery = cityQuery.trim().toLowerCase();

  const dealers: FilteredDealer[] = useMemo(
    () =>
      initialDealers.map((d) => ({
        ...d,
        displayAddress: [d.city, d.address].filter(Boolean).join(", "),
      })),
    [initialDealers],
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

  const handleMobileViewChange = (view: "list" | "map") => {
    setMobileView(view);
    if (typeof window !== "undefined") {
      localStorage.setItem("dealers-mobile-view", view);
    }
  };

  return (
    <>
      {/* Mobile View Toggle */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm lg:hidden">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex">
            <button
              onClick={() => handleMobileViewChange("list")}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                mobileView === "list"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
              Список
            </button>
            <button
              onClick={() => handleMobileViewChange("map")}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                mobileView === "map"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Map className="h-4 w-4" />
              Карта
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Map View */}
      {mobileView === "map" && (
        <div className="lg:hidden">
          <div className="h-[60vh] w-full">
            <DealersMap
              dealers={filteredDealers}
              selectedDealerId={expandedDealer}
              onDealerSelect={(id) => {
                setExpandedDealer(id);
                handleMobileViewChange("list");
              }}
            />
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <section className={`pt-8 pb-4 ${mobileView === "map" ? "hidden lg:block" : ""}`}>
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
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
                        {pluralize(filteredDealers.length, 'дилер знайдено', 'дилери знайдено', 'дилерів знайдено')}
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
            </div>

            {/* Interactive Map - hidden on mobile to show results immediately */}
            <div className="hidden rounded-2xl border border-border bg-card p-6 lg:block">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <MapPin className="h-5 w-5 text-primary" />
                Інтерактивна карта
              </h3>
              <div className="h-80 overflow-hidden rounded-xl">
                <DealersMap
                  dealers={initialDealers}
                  selectedDealerId={expandedDealer}
                  onDealerSelect={(id) => setExpandedDealer(id)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dealers List */}
      <section className={`pb-8 ${mobileView === "map" ? "hidden lg:block" : ""}`}>
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-4 text-2xl font-bold">Результати пошуку</h2>

          {filteredDealers.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-xl font-semibold">Дилерів не знайдено</h3>
              <p className="mt-2 text-muted-foreground">
                Спробуйте змінити параметри пошуку або обрати інше місто.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">
              {filteredDealers.map((dealer) => (
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
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
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
                              onClick={() => analytics.trackPhoneClick(dealer.phone || '', "dealer_card")}
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
                        onClick={() => {
                          const isExpanding = expandedDealer !== dealer.id;
                          setExpandedDealer(isExpanding ? dealer.id : null);
                          if (isExpanding) {
                            analytics.trackDealerClick({ id: dealer.id, name: dealer.name, city: dealer.city });
                          }
                        }}
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
                          <li>Можливість онлайн-бронювання</li>
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
    </>
  );
}
