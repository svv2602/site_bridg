import {
  type Season,
  type TyreModel,
  type TyreSize,
  type VehicleFitment,
} from "@/lib/data";
import {
  getPayloadTyres,
  getPayloadTyreBySlug,
  getPayloadVehicleFitmentByCarParams,
  transformPayloadTyre,
} from "./payload";

/**
 * Параметри пошуку шин за розміром.
 */
export interface SizeSearchParams {
  width: number;
  aspectRatio: number;
  diameter: number;
  season?: Season;
}

/**
 * Параметри пошуку шин за авто.
 */
export interface CarSearchParams {
  make: string;
  model: string;
  year: number;
}

/**
 * Повертає всі моделі шин з Payload CMS.
 * При помилці повертає порожній масив — компоненти повинні обробити цей стан.
 * @param options.depth — глибина розкриття зв'язків (за замовчуванням: 2)
 */
export async function getTyreModels(options?: { depth?: number }): Promise<TyreModel[]> {
  const tyres = await getPayloadTyres(options?.depth != null ? { depth: options.depth } : undefined);
  return tyres.map(tyre => transformPayloadTyre(tyre) as TyreModel);
}

/**
 * Повертає одну модель шини за slug або null, якщо не знайдена.
 */
export async function getTyreModelBySlug(slug: string): Promise<TyreModel | null> {
  const tyre = await getPayloadTyreBySlug(slug);
  if (tyre) {
    return transformPayloadTyre(tyre) as TyreModel;
  }
  return null;
}

/**
 * Пошук шин за точним типорозміром (ширина / висота / діаметр) та, опційно, сезоном.
 */
export async function searchTyresBySize(params: SizeSearchParams): Promise<TyreModel[]> {
  const { width, aspectRatio, diameter, season } = params;
  const raw = await getPayloadTyres(season ? { season } : undefined);
  const all = raw.map(tyre => transformPayloadTyre(tyre) as TyreModel);

  return all.filter((model) =>
    model.sizes.some(
      (s) =>
        s.width === width &&
        s.aspectRatio === aspectRatio &&
        s.diameter === diameter,
    ),
  );
}

/**
 * Знаходить фітмент авто (рекомендовані розміри) за маркою, моделлю та роком випуску.
 */
export async function getVehicleFitment(
  params: CarSearchParams,
): Promise<VehicleFitment | null> {
  const { make, model, year } = params;

  try {
    const payloadFitment = await getPayloadVehicleFitmentByCarParams(make, model, year);
    if (payloadFitment) {
      return {
        make: payloadFitment.make,
        model: payloadFitment.model,
        yearFrom: payloadFitment.yearFrom ?? payloadFitment.year ?? year,
        yearTo: payloadFitment.yearTo,
        recommendedSizes: payloadFitment.recommendedSizes ?? [],
      };
    }
    return null;
  } catch (error) {
    console.error("Помилка завантаження фітменту з CMS:", error);
    return null;
  }
}

/**
 * Пошук шин за маркою/моделлю авто та роком випуску:
 * 1) знаходимо рекомендовані типорозміри;
 * 2) повертаємо моделі шин, які випускаються в цих розмірах.
 */
export async function searchTyresByCar(params: CarSearchParams): Promise<TyreModel[]> {
  const fitment = await getVehicleFitment(params);
  if (!fitment) {
    return [];
  }

  const all = await getTyreModels();

  return all.filter((model) =>
    model.sizes.some((s) =>
      fitment.recommendedSizes.some(
        (rec: TyreSize) =>
          rec.width === s.width &&
          rec.aspectRatio === s.aspectRatio &&
          rec.diameter === s.diameter,
      ),
    ),
  );
}

