import { type Dealer, type DealerType } from "@/lib/data";
import { getPayloadDealers } from "./payload";

export interface DealerSearchParams {
  query?: string;
  type?: DealerType | "all";
}

/**
 * Повертає повний список дилерів з Payload CMS.
 * При помилці повертає порожній масив — компоненти повинні обробити цей стан.
 */
export async function getDealers(): Promise<Dealer[]> {
  try {
    const dealers = await getPayloadDealers();
    return dealers.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      city: d.city,
      address: d.address,
      latitude: d.latitude,
      longitude: d.longitude,
      phone: d.phone,
      website: d.website,
      workingHours: d.workingHours,
    }));
  } catch (error) {
    console.error("Помилка завантаження дилерів з CMS:", error);
    return [];
  }
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
