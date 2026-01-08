#!/usr/bin/env node

/**
 * Скрипт імпорту CSV даних автомобілів в PostgreSQL
 *
 * Використання:
 *   1. Встановіть залежності: npm install pg csv-parser
 *   2. Створіть базу даних та схему: psql -d bridgestone -f schema.sql
 *   3. Запустіть імпорт: node import-to-postgres.js
 *
 * Змінні оточення:
 *   DATABASE_URL - підключення до PostgreSQL (або окремі змінні нижче)
 *   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { createReadStream } = require('fs');
const readline = require('readline');

// Конфігурація підключення до БД
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bridgestone_vehicles',
  max: 10,
});

// Шляхи до CSV файлів
const CSV_DIR = __dirname;
const FILES = {
  brands: path.join(CSV_DIR, 'test_table_car2_brand.csv'),
  models: path.join(CSV_DIR, 'test_table_car2_model.csv'),
  kits: path.join(CSV_DIR, 'test_table_car2_kit.csv'),
  tyreSizes: path.join(CSV_DIR, 'test_table_car2_kit_tyre_size.csv'),
  diskSizes: path.join(CSV_DIR, 'test_table_car2_kit_disk_size.csv'),
};

// Розмір батчу для вставки
const BATCH_SIZE = 5000;

/**
 * Парсинг рядка CSV (з урахуванням лапок)
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values.map(v => {
    if (v === 'NULL' || v === '') return null;
    return v;
  });
}

/**
 * Читання CSV файлу рядок за рядком
 */
async function* readCSV(filePath) {
  const fileStream = createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headers = null;
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;

    if (lineNumber === 1) {
      headers = parseCSVLine(line);
      continue;
    }

    const values = parseCSVLine(line);
    const row = {};

    headers.forEach((header, i) => {
      row[header] = values[i];
    });

    yield row;
  }
}

/**
 * Імпорт марок автомобілів
 */
async function importBrands(client) {
  console.log('📦 Імпорт марок автомобілів...');

  const brands = [];
  for await (const row of readCSV(FILES.brands)) {
    brands.push([parseInt(row.id), row.name]);
  }

  // Вставка з явним ID (для збереження зв'язків)
  const query = `
    INSERT INTO car_brands (id, name)
    VALUES ($1, $2)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
  `;

  for (const brand of brands) {
    await client.query(query, brand);
  }

  // Оновлення sequence
  await client.query(`SELECT setval('car_brands_id_seq', (SELECT MAX(id) FROM car_brands))`);

  console.log(`   ✓ Імпортовано ${brands.length} марок`);
}

/**
 * Імпорт моделей автомобілів
 */
async function importModels(client) {
  console.log('📦 Імпорт моделей автомобілів...');

  let count = 0;
  let batch = [];

  for await (const row of readCSV(FILES.models)) {
    batch.push([parseInt(row.id), parseInt(row.brand), row.name]);

    if (batch.length >= BATCH_SIZE) {
      await insertModelsBatch(client, batch);
      count += batch.length;
      process.stdout.write(`\r   Оброблено ${count} моделей...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertModelsBatch(client, batch);
    count += batch.length;
  }

  await client.query(`SELECT setval('car_models_id_seq', (SELECT MAX(id) FROM car_models))`);

  console.log(`\r   ✓ Імпортовано ${count} моделей          `);
}

async function insertModelsBatch(client, batch) {
  const values = batch.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(', ');
  const params = batch.flat();

  await client.query(`
    INSERT INTO car_models (id, brand_id, name)
    VALUES ${values}
    ON CONFLICT (id) DO UPDATE SET brand_id = EXCLUDED.brand_id, name = EXCLUDED.name
  `, params);
}

/**
 * Імпорт комплектацій
 */
async function importKits(client) {
  console.log('📦 Імпорт комплектацій автомобілів...');

  let count = 0;
  let batch = [];

  for await (const row of readCSV(FILES.kits)) {
    batch.push([
      parseInt(row.id),
      parseInt(row.model),
      parseInt(row.year),
      row.name,
      row.pcd ? parseFloat(row.pcd) : null,
      row.bolt_count ? parseInt(row.bolt_count) : null,
      row.dia ? parseFloat(row.dia) : null,
      row.bolt_size
    ]);

    if (batch.length >= BATCH_SIZE) {
      await insertKitsBatch(client, batch);
      count += batch.length;
      process.stdout.write(`\r   Оброблено ${count} комплектацій...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertKitsBatch(client, batch);
    count += batch.length;
  }

  await client.query(`SELECT setval('car_kits_id_seq', (SELECT MAX(id) FROM car_kits))`);

  console.log(`\r   ✓ Імпортовано ${count} комплектацій          `);
}

async function insertKitsBatch(client, batch) {
  const values = batch.map((_, i) => {
    const base = i * 8;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`;
  }).join(', ');
  const params = batch.flat();

  await client.query(`
    INSERT INTO car_kits (id, model_id, year, name, pcd, bolt_count, dia, bolt_size)
    VALUES ${values}
    ON CONFLICT (id) DO UPDATE SET
      model_id = EXCLUDED.model_id,
      year = EXCLUDED.year,
      name = EXCLUDED.name,
      pcd = EXCLUDED.pcd,
      bolt_count = EXCLUDED.bolt_count,
      dia = EXCLUDED.dia,
      bolt_size = EXCLUDED.bolt_size
  `, params);
}

/**
 * Конвертація типу розміру (1 = oem, 2 = tuning)
 */
function convertSizeType(type) {
  return type === '1' || type === 1 ? 'oem' : 'tuning';
}

/**
 * Конвертація осі (0 = any, 1 = front, 2 = rear)
 */
function convertAxle(axle) {
  if (axle === '1' || axle === 1) return 'front';
  if (axle === '2' || axle === 2) return 'rear';
  return 'any';
}

/**
 * Імпорт розмірів шин
 */
async function importTyreSizes(client) {
  console.log('📦 Імпорт розмірів шин (це може зайняти кілька хвилин)...');

  let count = 0;
  let batch = [];

  for await (const row of readCSV(FILES.tyreSizes)) {
    batch.push([
      parseInt(row.id),
      parseInt(row.kit),
      parseFloat(row.width),
      parseFloat(row.height),
      parseFloat(row.diameter),
      convertSizeType(row.type),
      convertAxle(row.axle),
      row.axle_group ? parseInt(row.axle_group) : null
    ]);

    if (batch.length >= BATCH_SIZE) {
      await insertTyreSizesBatch(client, batch);
      count += batch.length;
      process.stdout.write(`\r   Оброблено ${count.toLocaleString()} розмірів шин...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertTyreSizesBatch(client, batch);
    count += batch.length;
  }

  await client.query(`SELECT setval('car_kit_tyre_sizes_id_seq', (SELECT MAX(id) FROM car_kit_tyre_sizes))`);

  console.log(`\r   ✓ Імпортовано ${count.toLocaleString()} розмірів шин          `);
}

async function insertTyreSizesBatch(client, batch) {
  const values = batch.map((_, i) => {
    const base = i * 8;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`;
  }).join(', ');
  const params = batch.flat();

  await client.query(`
    INSERT INTO car_kit_tyre_sizes (id, kit_id, width, height, diameter, size_type, axle, axle_group)
    VALUES ${values}
    ON CONFLICT (id) DO UPDATE SET
      kit_id = EXCLUDED.kit_id,
      width = EXCLUDED.width,
      height = EXCLUDED.height,
      diameter = EXCLUDED.diameter,
      size_type = EXCLUDED.size_type,
      axle = EXCLUDED.axle,
      axle_group = EXCLUDED.axle_group
  `, params);
}

/**
 * Імпорт розмірів дисків
 */
async function importDiskSizes(client) {
  console.log('📦 Імпорт розмірів дисків (це може зайняти кілька хвилин)...');

  let count = 0;
  let batch = [];

  for await (const row of readCSV(FILES.diskSizes)) {
    batch.push([
      parseInt(row.id),
      parseInt(row.kit),
      parseFloat(row.width),
      parseFloat(row.diameter),
      row.et ? parseFloat(row.et) : null,
      convertSizeType(row.type),
      convertAxle(row.axle),
      row.axle_group ? parseInt(row.axle_group) : null
    ]);

    if (batch.length >= BATCH_SIZE) {
      await insertDiskSizesBatch(client, batch);
      count += batch.length;
      process.stdout.write(`\r   Оброблено ${count.toLocaleString()} розмірів дисків...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertDiskSizesBatch(client, batch);
    count += batch.length;
  }

  await client.query(`SELECT setval('car_kit_disk_sizes_id_seq', (SELECT MAX(id) FROM car_kit_disk_sizes))`);

  console.log(`\r   ✓ Імпортовано ${count.toLocaleString()} розмірів дисків          `);
}

async function insertDiskSizesBatch(client, batch) {
  const values = batch.map((_, i) => {
    const base = i * 8;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`;
  }).join(', ');
  const params = batch.flat();

  await client.query(`
    INSERT INTO car_kit_disk_sizes (id, kit_id, width, diameter, et, size_type, axle, axle_group)
    VALUES ${values}
    ON CONFLICT (id) DO UPDATE SET
      kit_id = EXCLUDED.kit_id,
      width = EXCLUDED.width,
      diameter = EXCLUDED.diameter,
      et = EXCLUDED.et,
      size_type = EXCLUDED.size_type,
      axle = EXCLUDED.axle,
      axle_group = EXCLUDED.axle_group
  `, params);
}

/**
 * Основна функція імпорту
 */
async function main() {
  console.log('🚗 Імпорт бази даних автомобілів Bridgestone Ukraine');
  console.log('━'.repeat(50));

  const startTime = Date.now();
  const client = await pool.connect();

  try {
    // Початок транзакції
    await client.query('BEGIN');

    // Імпорт в правильному порядку (для foreign keys)
    await importBrands(client);
    await importModels(client);
    await importKits(client);
    await importTyreSizes(client);
    await importDiskSizes(client);

    // Коміт транзакції
    await client.query('COMMIT');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('━'.repeat(50));
    console.log(`✅ Імпорт завершено успішно за ${elapsed} секунд`);

    // Вивід статистики
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM car_brands) AS brands,
        (SELECT COUNT(*) FROM car_models) AS models,
        (SELECT COUNT(*) FROM car_kits) AS kits,
        (SELECT COUNT(*) FROM car_kit_tyre_sizes) AS tyre_sizes,
        (SELECT COUNT(*) FROM car_kit_disk_sizes) AS disk_sizes
    `);

    console.log('\n📊 Статистика:');
    console.log(`   Марок: ${stats.rows[0].brands}`);
    console.log(`   Моделей: ${stats.rows[0].models}`);
    console.log(`   Комплектацій: ${parseInt(stats.rows[0].kits).toLocaleString()}`);
    console.log(`   Розмірів шин: ${parseInt(stats.rows[0].tyre_sizes).toLocaleString()}`);
    console.log(`   Розмірів дисків: ${parseInt(stats.rows[0].disk_sizes).toLocaleString()}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Помилка імпорту:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Запуск
main();
