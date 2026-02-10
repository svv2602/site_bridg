"use client";

import { useState, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer } from "@react-google-maps/api";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import type { Dealer, DealerType } from "@/lib/data";

// Cluster styles using stone palette
const clusterStyles = [
  {
    // Small clusters (2-9)
    textColor: "#1c1917", // stone-950
    textSize: 13,
    height: 40,
    width: 40,
    url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="18" fill="#d6d3d1" stroke="#a8a29e" stroke-width="2"/></svg>')}`,
  },
  {
    // Medium clusters (10-49)
    textColor: "#1c1917",
    textSize: 14,
    height: 48,
    width: 48,
    url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="22" fill="#a8a29e" stroke="#78716c" stroke-width="2"/></svg>')}`,
  },
  {
    // Large clusters (50+)
    textColor: "#fafaf9", // stone-50
    textSize: 15,
    height: 56,
    width: 56,
    url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><circle cx="28" cy="28" r="26" fill="#78716c" stroke="#57534e" stroke-width="2"/></svg>')}`,
  },
];

interface DealersMapProps {
  dealers: Dealer[];
  selectedDealerId?: string | null;
  onDealerSelect?: (dealerId: string | null) => void;
  userPosition?: { lat: number; lng: number } | null;
}

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "300px",
};

// Center of Ukraine
const defaultCenter = {
  lat: 48.3794,
  lng: 31.1656,
};

// Marker colors by dealer type (stone palette + brand red)
const markerColors: Record<DealerType, string> = {
  official: "#dc2626", // red-600 - brand primary
  partner: "#292524", // stone-800 - dark stone
  service: "#78716c", // stone-500 - medium stone
};

// Custom marker icon SVG (as data URL)
function getMarkerIcon(type: DealerType) {
  const color = markerColors[type];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path fill="${color}" d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z"/>
      <circle fill="white" cx="16" cy="14" r="6"/>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * InfoWindow content for Google Maps.
 *
 * Google Maps InfoWindow renders inside a Google-controlled container with a
 * forced white background. Tailwind dark: variants do NOT apply here because
 * the content is injected into a separate DOM context. We use inline styles
 * to guarantee readability regardless of the site's color scheme.
 */
function DealerInfoContent({ dealer }: { dealer: Dealer }) {
  const googleMapsUrl = dealer.latitude && dealer.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${dealer.latitude},${dealer.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.address + ", " + dealer.city)}`;

  // Match DealerList badge colors: red=official, orange=partner, green=service
  const badgeStyle =
    dealer.type === "official"
      ? { backgroundColor: "#fee2e2", color: "#b91c1c" }
      : dealer.type === "partner"
        ? { backgroundColor: "#ffedd5", color: "#c2410c" }
        : { backgroundColor: "#dcfce7", color: "#15803d" };

  return (
    <div style={{ maxWidth: 280, padding: 4, color: "#1c1917" }}>
      <div style={{ marginBottom: 8 }}>
        <span
          style={{ ...badgeStyle, display: "inline-block", borderRadius: 9999, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}
        >
          {dealer.type === "official"
            ? "Офіційний дилер"
            : dealer.type === "partner"
              ? "Партнер"
              : "Сервісний центр"}
        </span>
      </div>
      <h3 style={{ fontWeight: 700, color: "#1c1917", margin: 0 }}>{dealer.name}</h3>
      <div style={{ marginTop: 8, fontSize: 14, color: "#57534e" }} className="space-y-1">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{dealer.city}, {dealer.address}</span>
        </div>
        {dealer.phone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <a href={`tel:${dealer.phone}`} style={{ color: "#57534e", textDecoration: "none" }}>
              {dealer.phone}
            </a>
          </div>
        )}
        {dealer.workingHours && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{dealer.workingHours}</span>
          </div>
        )}
      </div>
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 9999, backgroundColor: "#dc2626", padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#ffffff", textDecoration: "none" }}
      >
        <Navigation className="h-3 w-3" />
        Маршрут
      </a>
    </div>
  );
}

export function DealersMap({
  dealers,
  selectedDealerId,
  onDealerSelect,
  userPosition,
}: DealersMapProps) {
  const [infoWindowDealer, setInfoWindowDealer] = useState<Dealer | null>(null);

  // SECURITY: This is a public API key (NEXT_PUBLIC_*) which is expected for the
  // Google Maps JavaScript API — it is embedded in client-side bundles. However,
  // it MUST be restricted in the Google Cloud Console:
  //   1. Application restrictions → HTTP referrers: bridgestone.ua/*, localhost:3010/*
  //   2. API restrictions → Maps JavaScript API only
  // Without these restrictions, the key could be abused for unauthorized usage.
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
  });

  const dealersWithCoords = useMemo(
    () => dealers.filter((d) => d.latitude && d.longitude),
    [dealers]
  );

  const center = useMemo(() => {
    // If a dealer is selected, center on it
    if (selectedDealerId) {
      const selected = dealersWithCoords.find((d) => d.id === selectedDealerId);
      if (selected?.latitude && selected?.longitude) {
        return { lat: selected.latitude, lng: selected.longitude };
      }
    }

    // If user position is available, center on it
    if (userPosition) {
      return { lat: userPosition.lat, lng: userPosition.lng };
    }

    if (dealersWithCoords.length === 0) return defaultCenter;

    // Otherwise, calculate center from all dealers
    const sumLat = dealersWithCoords.reduce((sum, d) => sum + (d.latitude || 0), 0);
    const sumLng = dealersWithCoords.reduce((sum, d) => sum + (d.longitude || 0), 0);
    return {
      lat: sumLat / dealersWithCoords.length,
      lng: sumLng / dealersWithCoords.length,
    };
  }, [dealersWithCoords, selectedDealerId, userPosition]);

  const handleMarkerClick = useCallback((dealer: Dealer) => {
    setInfoWindowDealer(dealer);
    onDealerSelect?.(dealer.id);
  }, [onDealerSelect]);

  const handleInfoWindowClose = useCallback(() => {
    setInfoWindowDealer(null);
  }, []);

  // Show placeholder if no API key
  if (!apiKey) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl bg-stone-100 p-4 text-center dark:bg-stone-800">
        <Navigation className="mb-4 h-12 w-12 text-stone-400" />
        <p className="font-medium text-stone-600 dark:text-stone-300">
          Карта дилерів Bridgestone
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Для відображення карти необхідний Google Maps API ключ.
        </p>
        <p className="mt-1 text-xs text-stone-400">
          Додайте NEXT_PUBLIC_GOOGLE_MAPS_API_KEY в .env.local
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl bg-red-50 p-4 text-center dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">
          Помилка завантаження карти. Перевірте API ключ.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
        <div className="flex items-center gap-2 text-stone-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
          <span>Завантаження карти...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      role="application"
      aria-label="Інтерактивна карта дилерів Bridgestone в Україні"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={selectedDealerId ? 12 : userPosition ? 10 : 6}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
      <MarkerClusterer
        styles={clusterStyles}
        maxZoom={14}
        gridSize={60}
        minimumClusterSize={3}
      >
        {(clusterer) => (
          <>
            {dealersWithCoords.map((dealer) => (
              <Marker
                key={dealer.id}
                position={{ lat: dealer.latitude!, lng: dealer.longitude! }}
                onClick={() => handleMarkerClick(dealer)}
                clusterer={clusterer}
                icon={{
                  url: getMarkerIcon(dealer.type),
                  scaledSize: new google.maps.Size(32, 40),
                  anchor: new google.maps.Point(16, 40),
                }}
              />
            ))}
          </>
        )}
      </MarkerClusterer>

      {infoWindowDealer && infoWindowDealer.latitude && infoWindowDealer.longitude && (
        <InfoWindow
          position={{
            lat: infoWindowDealer.latitude,
            lng: infoWindowDealer.longitude,
          }}
          onCloseClick={handleInfoWindowClose}
        >
          <DealerInfoContent dealer={infoWindowDealer} />
        </InfoWindow>
      )}
      </GoogleMap>
    </div>
  );
}
