import { MOCK_DEALERS, type Dealer, type DealerType } from "@/lib/data";
import { getStrapiDealers, transformStrapiData } from "./strapi";

export interface DealerSearchParams {
  query?: string;
  type?: DealerType | "all";
}

// Strapi dealer attributes
interface StrapiDealerAttributes {
  name: string;
  type: DealerType;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  workingHours?: string;
}

function transformStrapiDealer(data: StrapiDealerAttributes & { id: number }): Dealer {
  return {
    id: String(data.id),
    name: data.name,
    type: data.type,
    city: data.city,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    phone: data.phone,
    website: data.website,
    workingHours: data.workingHours,
  };
}

/**
 * Повертає повний список дилерів. Спробує отримати з Strapi, якщо недоступний — повертає mock дані.
 */
export async function getDealers(): Promise<Dealer[]> {
  try {
    const response = await getStrapiDealers<StrapiDealerAttributes>("*");
    const data = transformStrapiData<StrapiDealerAttributes>(response);
    if (data.length > 0) {
      return data.map(transformStrapiDealer);
    }
  } catch (error) {
    console.warn("Strapi unavailable, using mock data:", error);
  }
  return MOCK_DEALERS;
}

/**
 * Повертає дилера за ідентифікатором або null, якщо не знайдено.
 */
export async function getDealerById(id: string): Promise<Dealer | null> {
  const all = await getDealers();
  const dealer = all.find((d) => d.id === id);
  return dealer ?? null;
}

function normalize(str: string | undefined | null): string {
  return (str ?? "").toLowerCase();
}

/**
 * Пошук дилерів за містом/адресою та типом точки.
 * Віддзеркалює поточну фронтенд‑логіку на сторінці дилерів.
 */
export async function searchDealers(
  params: DealerSearchParams,
): Promise<Dealer[]> {
  const { query, type } = params;
  const all = await getDealers();

  let filtered = all;

  const q = (query ?? "").trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((dealer) => {
      const city = normalize(dealer.city);
      const address = normalize(dealer.address);
      return city.includes(q) || address.includes(q);
    });
  }

  if (type && type !== "all") {
    filtered = filtered.filter((dealer) => dealer.type === type);
  }

  return filtered;
}