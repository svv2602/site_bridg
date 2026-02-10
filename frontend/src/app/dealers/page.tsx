"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { type Dealer } from "@/lib/data";
import { getDealers } from "@/lib/api/dealers";
import { MapPin, Phone, Loader2 } from "lucide-react";
import { generateLocalBusinessSchema, generateBreadcrumbSchema, jsonLdScript } from "@/lib/schema";
import { Breadcrumb } from "@/components/ui";
import { DealerFilters } from "./components/DealerFilters";
import { DealerList } from "./components/DealerList";

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
  distance?: number;
};

interface UserPosition {
  lat: number;
  lng: number;
}

/** Haversine formula: calculate distance between two lat/lng points in km */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function DealersPage() {
  const [cityQuery, setCityQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [expandedDealer, setExpandedDealer] = useState<string | null>(null);
  const [allDealers, setAllDealers] = useState<Dealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

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

  // Geolocation handler
  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Геолокація не підтримується вашим браузером");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Доступ до геолокації відхилено");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError("Місцезнаходження недоступне");
        } else {
          setGeoError("Не вдалося визначити місцезнаходження");
        }
        setTimeout(() => setGeoError(null), 5000);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const handleResetFilters = useCallback(() => {
    setCityQuery("");
    setSelectedType("all");
    setUserPosition(null);
  }, []);

  const normalizedQuery = cityQuery.trim().toLowerCase();

  const dealers: FilteredDealer[] = useMemo(
    () =>
      allDealers.map((d) => ({
        ...d,
        displayAddress: [d.city, d.address].filter(Boolean).join(", "),
        distance:
          userPosition && d.latitude && d.longitude
            ? haversineDistance(userPosition.lat, userPosition.lng, d.latitude, d.longitude)
            : undefined,
      })),
    [allDealers, userPosition],
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
    if (userPosition) {
      filtered = [...filtered].sort((a, b) => {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
    }
    return filtered;
  }, [dealers, normalizedQuery, selectedType, userPosition]);

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
      <section className="pt-8 pb-4">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DealerFilters
                cityQuery={cityQuery}
                onCityQueryChange={setCityQuery}
                selectedType={selectedType}
                onSelectedTypeChange={setSelectedType}
                filteredCount={filteredDealers.length}
                isLoading={isLoading}
                userPosition={userPosition}
                geoLoading={geoLoading}
                geoError={geoError}
                onRequestGeolocation={requestGeolocation}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Interactive Map - hidden on mobile to show results immediately */}
            <div className="hidden rounded-2xl border border-border bg-card p-6 lg:block">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <MapPin className="h-5 w-5 text-primary" />
                Інтерактивна карта
              </h3>
              <div className="h-80 overflow-hidden rounded-xl">
                <DealersMap
                  dealers={allDealers}
                  selectedDealerId={expandedDealer}
                  onDealerSelect={(id) => setExpandedDealer(id)}
                  userPosition={userPosition}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dealers List */}
      <section className="pb-8">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-4 text-2xl font-bold">Результати пошуку</h2>
          <DealerList
            dealers={filteredDealers}
            isLoading={isLoading}
            error={error}
            expandedDealer={expandedDealer}
            onExpandDealer={setExpandedDealer}
            onRetry={fetchDealers}
          />
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
