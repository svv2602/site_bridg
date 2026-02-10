import { type Dealer, type DealerType } from "@/lib/data";
import { getPayloadDealers } from "./payload";

export interface DealerSearchParams {
  query?: string;
  type?: DealerType | "all";
}

/**
 * Повертає список дилерів з Payload CMS.
 * При помилці повертає порожній масив — компоненти повинні обробити цей стан.
 * @param limit — максимальна кількість записів (за замовчуванням: всі)
 */
export async function getDealers(limit?: number): Promise<Dealer[]> {
  const dealers = await getPayloadDealers(limit != null ? { limit } : undefined);
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
}

/**
 * Повертає дилера за ідентифікатором або null, якщо не знайдено.
 * Використовує прямий запит до API замість завантаження всіх дилерів.
 */
export async function getDealerById(id: string): Promise<Dealer | null> {
  try {
    const { getPayloadDealerById } = await import("./payload");
    const d = await getPayloadDealerById(id);
    if (!d) return null;
    return {
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
    };
  } catch {
    return null;
  }
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
