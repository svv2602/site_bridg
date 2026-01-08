import { query, queryOne } from '@/lib/db/postgres';
import {
  CarBrand,
  CarModel,
  CarKit,
  CarTyreSize,
  GroupedTyreSizes,
  VehicleInfo,
  VehicleSearchResult,
  MatchingTyre,
  TyreSizeType,
  AxleType,
  formatTyreSizeLabel,
} from '@/lib/types/vehicles';
import { getTyreModels } from './tyres';

// ============================================================================
// Запити до бази даних автомобілів
// ============================================================================

/**
 * Отримати всі марки автомобілів
 */
export async function getCarBrands(): Promise<CarBrand[]> {
  const rows = await query<{ id: number; name: string }>(
    'SELECT id, name FROM car_brands ORDER BY name'
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
  }));
}

/**
 * Отримати моделі для марки
 */
export async function getCarModels(brandId: number): Promise<CarModel[]> {
  const rows = await query<{ id: number; brand_id: number; name: string }>(
    'SELECT id, brand_id, name FROM car_models WHERE brand_id = $1 ORDER BY name',
    [brandId]
  );

  return rows.map((row) => ({
    id: row.id,
    brandId: row.brand_id,
    name: row.name,
  }));
}

/**
 * Отримати роки випуску для моделі
 */
export async function getModelYears(modelId: number): Promise<number[]> {
  const rows = await query<{ year: number }>(
    'SELECT DISTINCT year FROM car_kits WHERE model_id = $1 ORDER BY year DESC',
    [modelId]
  );

  return rows.map((row) => row.year);
}

/**
 * Отримати комплектації для моделі та року
 */
export async function getCarKits(modelId: number, year: number): Promise<CarKit[]> {
  const rows = await query<{
    id: number;
    model_id: number;
    year: number;
    name: string;
    pcd: string | null;
    bolt_count: number | null;
    dia: string | null;
    bolt_size: string | null;
  }>(
    `SELECT id, model_id, year, name, pcd::text, bolt_count, dia::text, bolt_size
     FROM car_kits
     WHERE model_id = $1 AND year = $2
     ORDER BY name`,
    [modelId, year]
  );

  return rows.map((row) => ({
    id: row.id,
    modelId: row.model_id,
    year: row.year,
    name: row.name,
    pcd: row.pcd,
    boltCount: row.bolt_count,
    dia: row.dia,
    boltSize: row.bolt_size,
  }));
}

/**
 * Отримати розміри шин для комплектації
 */
export async function getTyreSizes(kitId: number): Promise<GroupedTyreSizes> {
  const rows = await query<{
    id: number;
    kit_id: number;
    width: string;
    height: string;
    diameter: string;
    size_type: TyreSizeType;
    axle: AxleType;
    axle_group: number | null;
  }>(
    `SELECT id, kit_id, width::text, height::text, diameter::text, size_type, axle, axle_group
     FROM car_kit_tyre_sizes
     WHERE kit_id = $1
     ORDER BY size_type, diameter, width`,
    [kitId]
  );

  const sizes: CarTyreSize[] = rows.map((row) => ({
    id: row.id,
    kitId: row.kit_id,
    width: parseFloat(row.width),
    height: parseFloat(row.height),
    diameter: parseFloat(row.diameter),
    sizeType: row.size_type,
    axle: row.axle,
    axleGroup: row.axle_group,
  }));

  return {
    oem: sizes.filter((s) => s.sizeType === 'oem'),
    tuning: sizes.filter((s) => s.sizeType === 'tuning'),
  };
}

/**
 * Отримати повну інформацію про комплектацію
 */
export async function getKitFullInfo(kitId: number): Promise<VehicleInfo | null> {
  const row = await queryOne<{
    brand_name: string;
    model_name: string;
    year: number;
    kit_name: string;
    pcd: string | null;
    bolt_count: number | null;
    dia: string | null;
    bolt_size: string | null;
  }>(
    `SELECT
       cb.name AS brand_name,
       cm.name AS model_name,
       ck.year,
       ck.name AS kit_name,
       ck.pcd::text,
       ck.bolt_count,
       ck.dia::text,
       ck.bolt_size
     FROM car_kits ck
     JOIN car_models cm ON ck.model_id = cm.id
     JOIN car_brands cb ON cm.brand_id = cb.id
     WHERE ck.id = $1`,
    [kitId]
  );

  if (!row) return null;

  return {
    brand: row.brand_name,
    model: row.model_name,
    year: row.year,
    kit: row.kit_name,
    pcd: row.pcd,
    boltCount: row.bolt_count,
    dia: row.dia,
    boltSize: row.bolt_size,
  };
}

/**
 * Знайти шини Bridgestone, що підходять до розмірів
 */
export async function findMatchingBridgestoneTyres(
  tyreSizes: GroupedTyreSizes
): Promise<MatchingTyre[]> {
  // Отримуємо всі шини з каталогу Bridgestone
  const allTyres = await getTyreModels();

  // Збираємо унікальні розміри (OEM + tuning)
  const allSizes = [...tyreSizes.oem, ...tyreSizes.tuning];

  // Шукаємо відповідності
  const matchingTyres: MatchingTyre[] = [];

  for (const tyre of allTyres) {
    const matchingSizes: string[] = [];

    for (const vehicleSize of allSizes) {
      // Перевіряємо чи є такий розмір у моделі шини
      const hasSize = tyre.sizes.some(
        (tyreSize) =>
          tyreSize.width === Math.round(vehicleSize.width) &&
          tyreSize.aspectRatio === Math.round(vehicleSize.height) &&
          tyreSize.diameter === Math.round(vehicleSize.diameter)
      );

      if (hasSize) {
        const sizeLabel = formatTyreSizeLabel(vehicleSize);
        if (!matchingSizes.includes(sizeLabel)) {
          matchingSizes.push(sizeLabel);
        }
      }
    }

    if (matchingSizes.length > 0) {
      matchingTyres.push({
        slug: tyre.slug,
        name: tyre.name,
        season: tyre.season,
        imageUrl: tyre.imageUrl,
        matchingSizes,
      });
    }
  }

  // Сортуємо: спочатку з більшою кількістю відповідних розмірів
  return matchingTyres.sort((a, b) => b.matchingSizes.length - a.matchingSizes.length);
}

/**
 * Повний пошук: інформація про авто + розміри + підходящі шини Bridgestone
 */
export async function searchVehicleTyres(kitId: number): Promise<VehicleSearchResult | null> {
  // Отримуємо інформацію про авто
  const vehicle = await getKitFullInfo(kitId);
  if (!vehicle) return null;

  // Отримуємо розміри шин
  const tyreSizes = await getTyreSizes(kitId);

  // Знаходимо підходящі шини Bridgestone
  const matchingTyres = await findMatchingBridgestoneTyres(tyreSizes);

  return {
    vehicle,
    tyreSizes,
    matchingTyres,
  };
}

// ============================================================================
// Пошук по тексту (для автодоповнення)
// ============================================================================

/**
 * Пошук марок за текстом
 */
export async function searchBrands(searchText: string): Promise<CarBrand[]> {
  const rows = await query<{ id: number; name: string }>(
    `SELECT id, name FROM car_brands
     WHERE name ILIKE $1
     ORDER BY name
     LIMIT 20`,
    [`%${searchText}%`]
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
  }));
}

/**
 * Пошук моделей за текстом (в межах марки)
 */
export async function searchModels(brandId: number, searchText: string): Promise<CarModel[]> {
  const rows = await query<{ id: number; brand_id: number; name: string }>(
    `SELECT id, brand_id, name FROM car_models
     WHERE brand_id = $1 AND name ILIKE $2
     ORDER BY name
     LIMIT 20`,
    [brandId, `%${searchText}%`]
  );

  return rows.map((row) => ({
    id: row.id,
    brandId: row.brand_id,
    name: row.name,
  }));
}
