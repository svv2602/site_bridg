"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { type Dealer } from "@/lib/data";
import { MapPin, Phone, Loader2, List, Map as MapIcon } from "lucide-react";
import { PHONE_HREF as DEFAULT_PHONE_HREF } from "@/lib/constants";
import { DealerFilters } from "./components/DealerFilters";
import { DealerList } from "./components/DealerList";
import { type FilteredDealer, type UserPosition } from "./types";

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

interface DealersClientProps {
  initialDealers: Dealer[];
  phoneHref?: string;
}

export function DealersClient({ initialDealers, phoneHref }: DealersClientProps) {
  const resolvedPhoneHref = phoneHref || DEFAULT_PHONE_HREF;
  const searchParams = useSearchParams();
  const router = useRouter();

  // Restore filter state from URL params
  const urlCity = searchParams.get("city") || "";
  const urlType = searchParams.get("type") || "all";

  const [cityQuery, setCityQuery] = useState(urlCity);
  const [debouncedCityQuery, setDebouncedCityQuery] = useState(urlCity);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedType, setSelectedType] = useState<string>(urlType);
  const [expandedDealer, setExpandedDealer] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  // Mobile view mode: 'list' or 'map'
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  // Only render the map on large screens (lg: breakpoint = 1024px)
  // This avoids loading ~30KB Google Maps JS on mobile where the map is hidden
  const [isLargeScreen, setIsLargeScreen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia("(min-width: 1024px)").matches
  );

  // Sync filter state to URL params
  const syncFiltersToUrl = useCallback(
    (city: string, type: string) => {
      const params = new URLSearchParams();
      if (city.trim()) params.set("city", city.trim());
      if (type && type !== "all") params.set("type", type);
      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router],
  );

  const handleCityQueryChange = useCallback(
    (value: string) => {
      setCityQuery(value);
      // Debounce: delay filtering and URL sync by 300ms
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedCityQuery(value);
        syncFiltersToUrl(value, selectedType);
      }, 300);
    },
    [selectedType, syncFiltersToUrl],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSelectedTypeChange = useCallback(
    (value: string) => {
      setSelectedType(value);
      syncFiltersToUrl(cityQuery, value);
    },
    [cityQuery, syncFiltersToUrl],
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsLargeScreen(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Geolocation handler
  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Геолокація не підтримується вашим браузером");
      return;
    }
    if (!window.isSecureContext) {
      setGeoError("Геолокація доступна лише на захищених (HTTPS) сторінках");
      setTimeout(() => setGeoError(null), 5000);
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
    setDebouncedCityQuery("");
    setSelectedType("all");
    setUserPosition(null);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  // When a map marker is clicked, scroll to the corresponding dealer card
  const handleMarkerSelect = useCallback(
    (id: string | null) => {
      setExpandedDealer(id);
      if (id) {
        // Allow DOM to update, then scroll to the dealer card
        setTimeout(() => {
          const el = document.getElementById(`dealer-${id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    },
    [],
  );

  const normalizedQuery = debouncedCityQuery.trim().toLowerCase();

  const dealers: FilteredDealer[] = useMemo(
    () =>
      initialDealers.map((d) => ({
        ...d,
        displayAddress: [d.city, d.address].filter(Boolean).join(", "),
        distance:
          userPosition && d.latitude && d.longitude
            ? haversineDistance(userPosition.lat, userPosition.lng, d.latitude, d.longitude)
            : undefined,
      })),
    [initialDealers, userPosition],
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

  return (
    <>
      {/* Search & Filters */}
      <section className="pt-8 pb-4">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          {/* Mobile view toggle — visible only on screens smaller than lg */}
          <div className="mb-4 flex justify-center lg:hidden">
            <div className="inline-flex rounded-full bg-stone-200 p-1 ring-1 ring-stone-300 dark:bg-stone-800 dark:ring-stone-700">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-stone-900 shadow-sm dark:bg-stone-50"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"
                }`}
              >
                <List className="h-4 w-4" aria-hidden="true" />
                Список
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  viewMode === "map"
                    ? "bg-white text-stone-900 shadow-sm dark:bg-stone-50"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"
                }`}
              >
                <MapIcon className="h-4 w-4" aria-hidden="true" />
                Карта
              </button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DealerFilters
                cityQuery={cityQuery}
                onCityQueryChange={handleCityQueryChange}
                selectedType={selectedType}
                onSelectedTypeChange={handleSelectedTypeChange}
                filteredCount={filteredDealers.length}
                isLoading={false}
                userPosition={userPosition}
                geoLoading={geoLoading}
                geoError={geoError}
                onRequestGeolocation={requestGeolocation}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Interactive Map - rendered on lg+ or when mobile viewMode is 'map' */}
            {(isLargeScreen || viewMode === "map") && (
              <div className={`rounded-2xl border border-border bg-card p-6 ${!isLargeScreen && viewMode === "map" ? "lg:hidden" : ""}`}>
                <div className="heading-3 mb-4 flex items-center gap-2 text-xl font-bold">
                  <MapPin className="h-5 w-5 text-primary" />
                  Інтерактивна карта
                </div>
                <div className="h-80 overflow-hidden rounded-xl">
                  <DealersMap
                    dealers={initialDealers}
                    selectedDealerId={expandedDealer}
                    onDealerSelect={handleMarkerSelect}
                    userPosition={userPosition}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dealers List — hidden on mobile when map view is active */}
      <section className={`pb-8 ${!isLargeScreen && viewMode === "map" ? "hidden" : ""}`}>
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="heading-2 mb-4 text-2xl font-bold">Результати пошуку</div>
          <DealerList
            dealers={filteredDealers}
            isLoading={false}
            error={null}
            expandedDealer={expandedDealer}
            onExpandDealer={setExpandedDealer}
            onRetry={() => {}}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div
            className="rounded-3xl bg-graphite p-10 text-white shadow-2xl dark:ring-1 dark:ring-stone-700"
          >
            <div className="heading-3 mb-4 text-3xl font-bold">Не знайшли потрібного дилера?</div>
            <p className="mb-8 text-lg opacity-90">
              Зв&apos;яжіться з нами напряму — ми допоможемо знайти найближчу точку продажу
              або організуємо доставку шин у ваше місто.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={resolvedPhoneHref}
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
    </>
  );
}
