import { type Dealer } from "@/lib/data";

export type FilteredDealer = Dealer & {
  displayAddress: string;
  distance?: number;
};

export interface UserPosition {
  lat: number;
  lng: number;
}

/** Build a Google Maps directions URL for a dealer */
export function buildRouteUrl(dealer: Dealer): string {
  if (dealer.latitude && dealer.longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${dealer.latitude},${dealer.longitude}`;
  }
  const address = encodeURIComponent(`${dealer.address}, ${dealer.city}, Україна`);
  return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
}
