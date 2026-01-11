import { execute, ensureDatabase, getVehiclesPool } from './vehicles-db';
import { parseCsvStream, mapSizeType, mapAxle, toSqlValue, isValidName, CSV_FILES } from './csv-parser';
import type {
  ImportProgress,
  ImportStats,
  CsvBrand,
  CsvModel,
  CsvKit,
  CsvTyreSize,
  ImportConfig,
} from './types';

// Глобальний стан прогресу імпорту
let importProgress: ImportProgress = createInitialProgress();

function createInitialProgress(): ImportProgress {
  return {
    stage: 'idle',
    currentTable: '',
    processedRows: 0,
    totalRows: 0,
    startedAt: null,
    completedAt: null,
    error: null,
    stats: {
      brands: 0,
      models: 0,
      kits: 0,
      tyreSizes: 0,
      filteredKits: 0,
      filteredSizes: 0,
    },
  };
}

/**
 * Отримати поточний прогрес імпорту
 */
export function getProgress(): ImportProgress {
  return { ...importProgress };
}

/**
 * Скидання таблиць та створення нових
 */
export async function resetTables(): Promise<void> {
  await ensureDatabase();

  // Видаляємо таблиці у правильному порядку (через FK)
  await execute('DROP TABLE IF EXISTS car_kit_tyre_sizes CASCADE');
  await execute('DROP TABLE IF EXISTS car_kit_disk_sizes CASCADE');
  await execute('DROP TABLE IF EXISTS car_kits CASCADE');
  await execute('DROP TABLE IF EXISTS car_models CASCADE');
  await execute('DROP TABLE IF EXISTS car_brands CASCADE');

  // Створюємо таблиці
  await execute(`
    CREATE TABLE car_brands (
      id INTEGER PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    )
  `);

  await execute(`
    CREATE TABLE car_models (
      id INTEGER PRIMARY KEY,
      brand_id INTEGER NOT NULL REFERENCES car_brands(id),
      name VARCHAR(200) NOT NULL
    )
  `);

  await execute(`
    CREATE TABLE car_kits (
      id INTEGER PRIMARY KEY,
      model_id INTEGER NOT NULL REFERENCES car_models(id),
      year INTEGER NOT NULL,
      name VARCHAR(200) NOT NULL,
      pcd DECIMAL(8,2),
      bolt_count INTEGER,
      dia DECIMAL(8,2),
      bolt_size VARCHAR(50)
    )
  `);

  await execute(`
    CREATE TABLE car_kit_tyre_sizes (
      id INTEGER PRIMARY KEY,
      kit_id INTEGER NOT NULL REFERENCES car_kits(id),
      width DECIMAL(8,2) NOT NULL,
      height DECIMAL(8,2) NOT NULL,
      diameter DECIMAL(8,2) NOT NULL,
      size_type VARCHAR(10) NOT NULL CHECK (size_type IN ('oem', 'tuning')),
      axle VARCHAR(10) NOT NULL CHECK (axle IN ('any', 'front', 'rear')),
      axle_group INTEGER
    )
  `);

  console.log('Tables reset successfully');
}

/**
 * Створення індексів
 */
async function createIndexes(): Promise<void> {
  await execute(
    'CREATE INDEX IF NOT EXISTS idx_car_models_brand_id ON car_models(brand_id)'
  );
  await execute(
    'CREATE INDEX IF NOT EXISTS idx_car_kits_model_id ON car_kits(model_id)'
  );
  await execute('CREATE INDEX IF NOT EXISTS idx_car_kits_year ON car_kits(year)');
  await execute(
    'CREATE INDEX IF NOT EXISTS idx_car_kit_tyre_sizes_kit_id ON car_kit_tyre_sizes(kit_id)'
  );
  await execute(
    'CREATE INDEX IF NOT EXISTS idx_car_kit_tyre_sizes_dimensions ON car_kit_tyre_sizes(width, height, diameter)'
  );
}

/**
 * Імпорт марок автомобілів
 */
async function importBrands(): Promise<Set<number>> {
  importProgress.stage = 'brands';
  importProgress.currentTable = 'car_brands';
  importProgress.processedRows = 0;

  const BATCH_SIZE = 500;
  let batch: string[] = [];
  const validBrandIds = new Set<number>();
  let skipped = 0;

  for await (const row of parseCsvStream<CsvBrand>(CSV_FILES.brands)) {
    importProgress.processedRows++;

    // Skip brands with invalid names (empty or control characters)
    if (!isValidName(row.name)) {
      skipped++;
      continue;
    }

    validBrandIds.add(parseInt(row.id));
    const name = toSqlValue(row.name, 'string');
    batch.push(`(${row.id}, ${name})`);
    importProgress.stats.brands++;

    if (batch.length >= BATCH_SIZE) {
      await execute(
        `INSERT INTO car_brands (id, name) VALUES ${batch.join(',')}`
      );
      batch = [];
    }
  }

  if (batch.length > 0) {
    await execute(`INSERT INTO car_brands (id, name) VALUES ${batch.join(',')}`);
  }

  console.log(`Imported ${importProgress.stats.brands} brands (skipped ${skipped} invalid)`);
  return validBrandIds;
}

/**
 * Імпорт моделей автомобілів
 */
async function importModels(validBrandIds: Set<number>): Promise<Set<number>> {
  importProgress.stage = 'models';
  importProgress.currentTable = 'car_models';
  importProgress.processedRows = 0;

  const BATCH_SIZE = 1000;
  let batch: string[] = [];
  const validModelIds = new Set<number>();
  let skipped = 0;

  for await (const row of parseCsvStream<CsvModel>(CSV_FILES.models)) {
    importProgress.processedRows++;
    const brandId = parseInt(row.brand);

    // Skip models with invalid names or belonging to invalid brands
    if (!isValidName(row.name) || !validBrandIds.has(brandId)) {
      skipped++;
      continue;
    }

    validModelIds.add(parseInt(row.id));
    const name = toSqlValue(row.name, 'string');
    batch.push(`(${row.id}, ${row.brand}, ${name})`);
    importProgress.stats.models++;

    if (batch.length >= BATCH_SIZE) {
      await execute(
        `INSERT INTO car_models (id, brand_id, name) VALUES ${batch.join(',')}`
      );
      batch = [];
    }
  }

  if (batch.length > 0) {
    await execute(
      `INSERT INTO car_models (id, brand_id, name) VALUES ${batch.join(',')}`
    );
  }

  console.log(`Imported ${importProgress.stats.models} models (skipped ${skipped} invalid)`);
  return validModelIds;
}

/**
 * Перший прохід: знаходимо максимальний рік для кожної моделі
 */
async function findModelMaxYears(): Promise<Map<number, number>> {
  console.log('Scanning kits to find max year per model...');
  const modelMaxYears = new Map<number, number>();

  for await (const row of parseCsvStream<CsvKit>(CSV_FILES.kits)) {
    const year = parseInt(row.year);
    const modelId = parseInt(row.model);

    if (!isNaN(year) && !isNaN(modelId)) {
      const currentMax = modelMaxYears.get(modelId) || 0;
      if (year > currentMax) {
        modelMaxYears.set(modelId, year);
      }
    }
  }

  console.log(`Found max years for ${modelMaxYears.size} models`);
  return modelMaxYears;
}

/**
 * Імпорт комплектацій з фільтрацією по моделях, що актуальні (max year >= minYear)
 */
async function importKits(minYear: number, validModelIds: Set<number>): Promise<Set<number>> {
  importProgress.stage = 'kits';
  importProgress.currentTable = 'car_kits';
  importProgress.processedRows = 0;

  // Перший прохід: знаходимо max year для кожної моделі
  const modelMaxYears = await findModelMaxYears();

  // Визначаємо які моделі актуальні (max year >= minYear)
  const relevantModelIds = new Set<number>();
  for (const [modelId, maxYear] of modelMaxYears) {
    if (maxYear >= minYear && validModelIds.has(modelId)) {
      relevantModelIds.add(modelId);
    }
  }
  console.log(`${relevantModelIds.size} models have max year >= ${minYear}`);

  // Другий прохід: імпортуємо комплектації для актуальних моделей (тільки роки >= minYear)
  const BATCH_SIZE = 5000;
  let batch: string[] = [];
  const validKitIds = new Set<number>();

  for await (const row of parseCsvStream<CsvKit>(CSV_FILES.kits)) {
    const year = parseInt(row.year);
    const modelId = parseInt(row.model);
    importProgress.processedRows++;
    importProgress.stats.kits++;

    // Імпортуємо тільки роки >= minYear для актуальних моделей
    if (relevantModelIds.has(modelId) && year >= minYear) {
      validKitIds.add(parseInt(row.id));

      const name = toSqlValue(row.name, 'string');
      const pcd = toSqlValue(row.pcd, 'decimal');
      const boltCount = toSqlValue(row.bolt_count, 'number');
      const dia = toSqlValue(row.dia, 'decimal');
      const boltSize = toSqlValue(row.bolt_size, 'string');

      batch.push(
        `(${row.id}, ${row.model}, ${year}, ${name}, ${pcd}, ${boltCount}, ${dia}, ${boltSize})`
      );
      importProgress.stats.filteredKits++;

      if (batch.length >= BATCH_SIZE) {
        await execute(
          `INSERT INTO car_kits (id, model_id, year, name, pcd, bolt_count, dia, bolt_size) VALUES ${batch.join(',')}`
        );
        batch = [];
      }
    }
  }

  if (batch.length > 0) {
    await execute(
      `INSERT INTO car_kits (id, model_id, year, name, pcd, bolt_count, dia, bolt_size) VALUES ${batch.join(',')}`
    );
  }

  console.log(
    `Imported ${importProgress.stats.filteredKits} kits (filtered from ${importProgress.stats.kits})`
  );

  return validKitIds;
}

/**
 * Імпорт розмірів шин
 */
async function importTyreSizes(validKitIds: Set<number>): Promise<void> {
  importProgress.stage = 'sizes';
  importProgress.currentTable = 'car_kit_tyre_sizes';
  importProgress.processedRows = 0;

  const BATCH_SIZE = 5000;
  let batch: string[] = [];

  for await (const row of parseCsvStream<CsvTyreSize>(CSV_FILES.tyreSizes)) {
    const kitId = parseInt(row.kit);
    importProgress.processedRows++;
    importProgress.stats.tyreSizes++;

    if (validKitIds.has(kitId)) {
      const sizeType = mapSizeType(row.type);
      const axle = mapAxle(row.axle);
      const axleGroup = toSqlValue(row.axle_group, 'number');

      batch.push(
        `(${row.id}, ${kitId}, ${row.width}, ${row.height}, ${row.diameter}, '${sizeType}', '${axle}', ${axleGroup})`
      );
      importProgress.stats.filteredSizes++;

      if (batch.length >= BATCH_SIZE) {
        await execute(
          `INSERT INTO car_kit_tyre_sizes (id, kit_id, width, height, diameter, size_type, axle, axle_group) VALUES ${batch.join(',')}`
        );
        batch = [];
      }
    }
  }

  if (batch.length > 0) {
    await execute(
      `INSERT INTO car_kit_tyre_sizes (id, kit_id, width, height, diameter, size_type, axle, axle_group) VALUES ${batch.join(',')}`
    );
  }

  console.log(
    `Imported ${importProgress.stats.filteredSizes} tyre sizes (filtered from ${importProgress.stats.tyreSizes})`
  );
}

/**
 * Запуск повного імпорту
 */
export async function runImport(
  config: Partial<ImportConfig> = {}
): Promise<void> {
  const minYear = config.minYear ?? 2005;

  try {
    importProgress = createInitialProgress();
    importProgress.stage = 'preparing';
    importProgress.startedAt = new Date().toISOString();

    console.log(`Starting import with minYear = ${minYear}`);

    // Переконуємось що БД існує
    await ensureDatabase();

    // 1. Імпорт марок (з фільтрацією невалідних назв)
    const validBrandIds = await importBrands();

    // 2. Імпорт моделей (з фільтрацією по бренду та невалідних назв)
    const validModelIds = await importModels(validBrandIds);

    // 3. Імпорт комплектацій (з фільтрацією по році та валідних моделях)
    const validKitIds = await importKits(minYear, validModelIds);

    // 4. Імпорт розмірів шин
    await importTyreSizes(validKitIds);

    // 5. Створення індексів
    importProgress.stage = 'indexing';
    importProgress.currentTable = 'indexes';
    await createIndexes();

    // Завершення
    importProgress.stage = 'done';
    importProgress.completedAt = new Date().toISOString();

    console.log('Import completed successfully!');
    console.log('Stats:', importProgress.stats);
  } catch (error) {
    importProgress.stage = 'error';
    importProgress.error =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Import failed:', error);
    throw error;
  }
}

/**
 * Перевірка чи йде імпорт зараз
 */
export function isImportRunning(): boolean {
  return (
    importProgress.stage !== 'idle' &&
    importProgress.stage !== 'done' &&
    importProgress.stage !== 'error'
  );
}

/**
 * Отримання статистики з БД
 */
export async function getDbStats(): Promise<ImportStats | null> {
  try {
    const pool = getVehiclesPool();

    const [brandsResult, modelsResult, kitsResult, sizesResult] =
      await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM car_brands'),
        pool.query('SELECT COUNT(*) as count FROM car_models'),
        pool.query('SELECT COUNT(*) as count FROM car_kits'),
        pool.query('SELECT COUNT(*) as count FROM car_kit_tyre_sizes'),
      ]);

    return {
      brands: parseInt(brandsResult.rows[0].count),
      models: parseInt(modelsResult.rows[0].count),
      kits: parseInt(kitsResult.rows[0].count),
      tyreSizes: parseInt(sizesResult.rows[0].count),
      filteredKits: parseInt(kitsResult.rows[0].count),
      filteredSizes: parseInt(sizesResult.rows[0].count),
    };
  } catch {
    return null;
  }
}
