#!/usr/bin/env node

/**
 * Надійний скрипт імпорту CSV з коректною обробкою кавичок та спецсимволів
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const pool = new Pool({
  host: '/var/run/postgresql',
  port: 5433,
  database: 'bridgestone_vehicles',
});

const CSV_DIR = __dirname;
const BATCH_SIZE = 1000;

/**
 * Правильний парсинг CSV рядка з підтримкою кавичок
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      // Escaped quote
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values.map(v => {
    v = v.trim();
    if (v === 'NULL' || v === '' || v === '""') return null;
    return v;
  });
}

async function* readCSV(filePath) {
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let headers = null;
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;
    if (!line.trim()) continue;

    if (lineNumber === 1) {
      headers = parseCSVLine(line);
      continue;
    }

    try {
      const values = parseCSVLine(line);
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i];
      });
      yield row;
    } catch (err) {
      console.warn(`   ⚠ Пропущено рядок ${lineNumber}: ${err.message}`);
    }
  }
}

async function importBrands(client) {
  console.log('📦 Імпорт марок...');
  await client.query('TRUNCATE car_brands CASCADE');

  let count = 0;
  for await (const row of readCSV(path.join(CSV_DIR, 'test_table_car2_brand.csv'))) {
    if (!row.id || !row.name) continue;
    await client.query(
      'INSERT INTO car_brands (id, name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name',
      [parseInt(row.id), row.name]
    );
    count++;
  }
  await client.query(`SELECT setval('car_brands_id_seq', (SELECT MAX(id) FROM car_brands))`);
  console.log(`   ✓ ${count} марок`);
  return count;
}

async function importModels(client) {
  console.log('📦 Імпорт моделей...');

  let count = 0;
  let batch = [];

  for await (const row of readCSV(path.join(CSV_DIR, 'test_table_car2_model.csv'))) {
    if (!row.id || !row.brand) continue;
    batch.push([parseInt(row.id), parseInt(row.brand), row.name || 'Unknown']);

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(client, 'car_models', ['id', 'brand_id', 'name'], batch);
      count += batch.length;
      process.stdout.write(`\r   Оброблено ${count}...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertBatch(client, 'car_models', ['id', 'brand_id', 'name'], batch);
    count += batch.length;
  }

  await client.query(`SELECT setval('car_models_id_seq', (SELECT MAX(id) FROM car_models))`);
  console.log(`\r   ✓ ${count} моделей          `);
  return count;
}

async function importKits(client) {
  console.log('📦 Імпорт комплектацій...');

  let count = 0;
  let skipped = 0;
  let batch = [];

  for await (const row of readCSV(path.join(CSV_DIR, 'test_table_car2_kit.csv'))) {
    if (!row.id || !row.model || !row.year) {
      skipped++;
      continue;
    }

    const pcd = row.pcd && /^[\d.]+$/.test(row.pcd) ? parseFloat(row.pcd) : null;
    const dia = row.dia && /^[\d.]+$/.test(row.dia) ? parseFloat(row.dia) : null;
    const boltCount = row.bolt_count ? parseInt(row.bolt_count) : null;

    batch.push([
      parseInt(row.id),
      parseInt(row.model),
      parseInt(row.year),
      row.name || 'Base',
      pcd,
      boltCount,
      dia,
      row.bolt_size
    ]);

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(client, 'car_kits', ['id', 'model_id', 'year', 'name', 'pcd', 'bolt_count', 'dia', 'bolt_size'], batch);
      count += batch.length;
      process.stdout.write(`\r   Оброблено ${count.toLocaleString()}...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertBatch(client, 'car_kits', ['id', 'model_id', 'year', 'name', 'pcd', 'bolt_count', 'dia', 'bolt_size'], batch);
    count += batch.length;
  }

  await client.query(`SELECT setval('car_kits_id_seq', (SELECT MAX(id) FROM car_kits))`);
  console.log(`\r   ✓ ${count.toLocaleString()} комплектацій (пропущено: ${skipped})          `);
  return count;
}

async function importTyreSizes(client) {
  console.log('📦 Імпорт розмірів шин...');

  let count = 0;
  let skipped = 0;
  let batch = [];

  for await (const row of readCSV(path.join(CSV_DIR, 'test_table_car2_kit_tyre_size.csv'))) {
    if (!row.id || !row.kit || !row.width || !row.height || !row.diameter) {
      skipped++;
      continue;
    }

    const sizeType = row.type === '1' ? 'oem' : 'tuning';
    const axle = row.axle === '1' ? 'front' : row.axle === '2' ? 'rear' : 'any';
    const axleGroup = row.axle_group ? parseInt(row.axle_group) : null;

    batch.push([
      parseInt(row.id),
      parseInt(row.kit),
      parseFloat(row.width),
      parseFloat(row.height),
      parseFloat(row.diameter),
      sizeType,
      axle,
      axleGroup
    ]);

    if (batch.length >= BATCH_SIZE) {
      try {
        await insertBatch(client, 'car_kit_tyre_sizes', ['id', 'kit_id', 'width', 'height', 'diameter', 'size_type', 'axle', 'axle_group'], batch);
        count += batch.length;
      } catch (e) {
        // Спробуємо вставити по одному, щоб знайти проблемні записи
        for (const item of batch) {
          try {
            await client.query(
              `INSERT INTO car_kit_tyre_sizes (id, kit_id, width, height, diameter, size_type, axle, axle_group)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
              item
            );
            count++;
          } catch (e2) {
            skipped++;
          }
        }
      }
      process.stdout.write(`\r   Оброблено ${count.toLocaleString()}...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    try {
      await insertBatch(client, 'car_kit_tyre_sizes', ['id', 'kit_id', 'width', 'height', 'diameter', 'size_type', 'axle', 'axle_group'], batch);
      count += batch.length;
    } catch (e) {
      for (const item of batch) {
        try {
          await client.query(
            `INSERT INTO car_kit_tyre_sizes (id, kit_id, width, height, diameter, size_type, axle, axle_group)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
            item
          );
          count++;
        } catch (e2) {
          skipped++;
        }
      }
    }
  }

  await client.query(`SELECT setval('car_kit_tyre_sizes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM car_kit_tyre_sizes))`);
  console.log(`\r   ✓ ${count.toLocaleString()} розмірів шин (пропущено: ${skipped})          `);
  return count;
}

async function importDiskSizes(client) {
  console.log('📦 Імпорт розмірів дисків...');

  let count = 0;
  let skipped = 0;
  let batch = [];

  for await (const row of readCSV(path.join(CSV_DIR, 'test_table_car2_kit_disk_size.csv'))) {
    if (!row.id || !row.kit || !row.width || !row.diameter) {
      skipped++;
      continue;
    }

    const sizeType = row.type === '1' ? 'oem' : 'tuning';
    const axle = row.axle === '1' ? 'front' : row.axle === '2' ? 'rear' : 'any';
    const axleGroup = row.axle_group ? parseInt(row.axle_group) : null;
    const et = row.et ? parseFloat(row.et) : null;

    batch.push([
      parseInt(row.id),
      parseInt(row.kit),
      parseFloat(row.width),
      parseFloat(row.diameter),
      et,
      sizeType,
      axle,
      axleGroup
    ]);

    if (batch.length >= BATCH_SIZE) {
      try {
        await insertBatch(client, 'car_kit_disk_sizes', ['id', 'kit_id', 'width', 'diameter', 'et', 'size_type', 'axle', 'axle_group'], batch);
        count += batch.length;
      } catch (e) {
        for (const item of batch) {
          try {
            await client.query(
              `INSERT INTO car_kit_disk_sizes (id, kit_id, width, diameter, et, size_type, axle, axle_group)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
              item
            );
            count++;
          } catch (e2) {
            skipped++;
          }
        }
      }
      process.stdout.write(`\r   Оброблено ${count.toLocaleString()}...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    try {
      await insertBatch(client, 'car_kit_disk_sizes', ['id', 'kit_id', 'width', 'diameter', 'et', 'size_type', 'axle', 'axle_group'], batch);
      count += batch.length;
    } catch (e) {
      for (const item of batch) {
        try {
          await client.query(
            `INSERT INTO car_kit_disk_sizes (id, kit_id, width, diameter, et, size_type, axle, axle_group)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
            item
          );
          count++;
        } catch (e2) {
          skipped++;
        }
      }
    }
  }

  await client.query(`SELECT setval('car_kit_disk_sizes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM car_kit_disk_sizes))`);
  console.log(`\r   ✓ ${count.toLocaleString()} розмірів дисків (пропущено: ${skipped})          `);
  return count;
}

async function insertBatch(client, table, columns, batch) {
  if (batch.length === 0) return;

  const placeholders = batch.map((_, i) => {
    const start = i * columns.length;
    return `(${columns.map((_, j) => `$${start + j + 1}`).join(', ')})`;
  }).join(', ');

  const values = batch.flat();
  const colNames = columns.join(', ');

  await client.query(
    `INSERT INTO ${table} (${colNames}) VALUES ${placeholders} ON CONFLICT (id) DO NOTHING`,
    values
  );
}

async function main() {
  console.log('🚗 Імпорт бази даних автомобілів Bridgestone Ukraine');
  console.log('━'.repeat(55));

  const start = Date.now();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await importBrands(client);
    await importModels(client);
    await importKits(client);
    await importTyreSizes(client);
    await importDiskSizes(client);

    await client.query('COMMIT');

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log('━'.repeat(55));
    console.log(`✅ Імпорт завершено за ${elapsed} сек`);

    // Статистика
    const stats = await client.query(`
      SELECT 'brands' AS t, COUNT(*) AS c FROM car_brands
      UNION ALL SELECT 'models', COUNT(*) FROM car_models
      UNION ALL SELECT 'kits', COUNT(*) FROM car_kits
      UNION ALL SELECT 'tyre_sizes', COUNT(*) FROM car_kit_tyre_sizes
      UNION ALL SELECT 'disk_sizes', COUNT(*) FROM car_kit_disk_sizes
    `);

    console.log('\n📊 Підсумок:');
    for (const row of stats.rows) {
      console.log(`   ${row.t}: ${parseInt(row.c).toLocaleString()}`);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Помилка:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
