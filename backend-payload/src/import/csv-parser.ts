import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import type { TyreSizeType, AxleType } from './types';

// Директорія з CSV файлами
const CSV_DIR = path.join(process.cwd(), 'db_size_auto');

/**
 * Потокове читання CSV файлу
 */
export async function* parseCsvStream<T>(
  filename: string
): AsyncGenerator<T, void, unknown> {
  const filePath = path.join(CSV_DIR, filename);

  const parser = createReadStream(filePath, { encoding: 'latin1' }).pipe(
    parse({
      columns: (headers: string[]) => {
        // Remove quotes from column names
        return headers.map((h) => h.replace(/^"+|"+$/g, '').trim());
      },
      skip_empty_lines: true,
      trim: true,
      quote: false, // Disable quote parsing - CSV has malformed quotes
      relax_column_count: true,
      on_record: (record: Record<string, string>) => {
        // Clean up values - remove surrounding quotes
        const cleaned: Record<string, string> = {};
        for (const key of Object.keys(record)) {
          const cleanKey = key.replace(/^"+|"+$/g, '').trim();
          const value = record[key];
          cleaned[cleanKey] =
            typeof value === 'string' ? value.replace(/^"+|"+$/g, '').trim() : value;
        }
        return cleaned;
      },
    })
  );

  for await (const record of parser) {
    yield record as T;
  }
}

/**
 * Підрахунок рядків у CSV файлі
 */
export async function countCsvRows(filename: string): Promise<number> {
  let count = 0;
  for await (const _ of parseCsvStream(filename)) {
    count++;
  }
  return count;
}

/**
 * Маппінг type: 1 -> 'oem', 2 -> 'tuning'
 */
export function mapSizeType(type: string): TyreSizeType {
  return type === '1' ? 'oem' : 'tuning';
}

/**
 * Маппінг axle: 0 -> 'any', 1 -> 'front', 2 -> 'rear'
 */
export function mapAxle(axle: string): AxleType {
  switch (axle) {
    case '1':
      return 'front';
    case '2':
      return 'rear';
    default:
      return 'any';
  }
}

/**
 * Екранування рядка для SQL
 */
export function escapeSql(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

/**
 * Перетворення значення у SQL формат
 */
export function toSqlValue(
  value: string | null | undefined,
  type: 'string' | 'number' | 'decimal' = 'string'
): string {
  if (value === null || value === undefined || value === '' || value === 'NULL') {
    return 'NULL';
  }

  switch (type) {
    case 'number':
      const num = parseInt(value);
      return isNaN(num) ? 'NULL' : String(num);
    case 'decimal':
      const dec = parseFloat(value);
      return isNaN(dec) ? 'NULL' : String(dec);
    case 'string':
    default:
      return `'${escapeSql(value)}'`;
  }
}

// Імена CSV файлів
export const CSV_FILES = {
  brands: 'test_table_car2_brand.csv',
  models: 'test_table_car2_model.csv',
  kits: 'test_table_car2_kit.csv',
  tyreSizes: 'test_table_car2_kit_tyre_size.csv',
  diskSizes: 'test_table_car2_kit_disk_size.csv',
};
