"use client";

import { useState, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin, Phone, Globe, Clock, Navigation } from "lucide-react";
import type { Dealer, DealerType } from "@/lib/data";

interface DealersMapProps {
  dealers: Dealer[];
  selectedDealerId?: string | null;
  onDealerSelect?: (dealerId: string | null) => void;
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

// Marker colors by dealer type
const markerColors: Record<DealerType, string> = {
  official: "#dc2626", // red-600 - primary
  partner: "#2563eb", // blue-600
  service: "#16a34a", // green-600
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

function DealerInfoContent({ dealer }: { dealer: Dealer }) {
  const googleMapsUrl = dealer.latitude && dealer.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${dealer.latitude},${dealer.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.address + ", " + dealer.city)}`;

  return (
    <div className="max-w-xs p-1">
      <div className="mb-2">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
            dealer.type === "official"
              ? "bg-red-100 text-red-700"
              : dealer.type === "partner"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
          }`}
        >
          {dealer.type === "official"
            ? "Офіційний дилер"
            : dealer.type === "partner"
              ? "Партнер"
              : "Сервісний центр"}
        </span>
      </div>
      <h3 className="font-bold text-gray-900">{dealer.name}</h3>
      <div className="mt-2 space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{dealer.city}, {dealer.address}</span>
        </div>
        {dealer.phone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <a href={`tel:${dealer.phone}`} className="hover:text-red-600">
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
        className="mt-3 inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
      >
        <Navigation className="h-3 w-3" />
        Маршрут
      </a>
    </div>
  );
}

export default function DealersMap({
  dealers,
  selectedDealerId,
  onDealerSelect,
}: DealersMapProps) {
  const [infoWindowDealer, setInfoWindowDealer] = useState<Dealer | null>(null);

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
    if (dealersWithCoords.length === 0) return defaultCenter;

    // If a dealer is selected, center on it
    if (selectedDealerId) {
      const selected = dealersWithCoords.find((d) => d.id === selectedDealerId);
      if (selected?.latitude && selected?.longitude) {
        return { lat: selected.latitude, lng: selected.longitude };
      }
    }

    // Otherwise, calculate center from all dealers
    const sumLat = dealersWithCoords.reduce((sum, d) => sum + (d.latitude || 0), 0);
    const sumLng = dealersWithCoords.reduce((sum, d) => sum + (d.longitude || 0), 0);
    return {
      lat: sumLat / dealersWithCoords.length,
      lng: sumLng / dealersWithCoords.length,
    };
  }, [dealersWithCoords, selectedDealerId]);

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
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl bg-zinc-100 p-4 text-center dark:bg-zinc-800">
        <Navigation className="mb-4 h-12 w-12 text-zinc-400" />
        <p className="font-medium text-zinc-600 dark:text-zinc-300">
          Карта дилерів Bridgestone
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Для відображення карти необхідний Google Maps API ключ.
        </p>
        <p className="mt-1 text-xs text-zinc-400">
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
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <div className="flex items-center gap-2 text-zinc-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
          <span>Завантаження карти...</span>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={selectedDealerId ? 12 : 6}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {dealersWithCoords.map((dealer) => (
        <Marker
          key={dealer.id}
          position={{ lat: dealer.latitude!, lng: dealer.longitude! }}
          onClick={() => handleMarkerClick(dealer)}
          icon={{
            url: getMarkerIcon(dealer.type),
            scaledSize: new google.maps.Size(32, 40),
            anchor: new google.maps.Point(16, 40),
          }}
        />
      ))}

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
  );
}
