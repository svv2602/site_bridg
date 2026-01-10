// Типи для імпорту бази автомобілів

export interface ImportProgress {
  stage:
    | 'idle'
    | 'preparing'
    | 'brands'
    | 'models'
    | 'kits'
    | 'sizes'
    | 'indexing'
    | 'done'
    | 'error';
  currentTable: string;
  processedRows: number;
  totalRows: number;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  stats: ImportStats;
}

export interface ImportStats {
  brands: number;
  models: number;
  kits: number;
  tyreSizes: number;
  filteredKits: number;
  filteredSizes: number;
}

// CSV типи - відповідають структурі файлів
export interface CsvBrand {
  id: string;
  name: string;
}

export interface CsvModel {
  id: string;
  brand: string;
  name: string;
}

export interface CsvKit {
  id: string;
  model: string;
  year: string;
  name: string;
  pcd: string;
  bolt_count: string;
  dia: string;
  bolt_size: string;
}

export interface CsvTyreSize {
  id: string;
  kit: string;
  width: string;
  height: string;
  diameter: string;
  type: string; // 1 = oem, 2 = tuning
  axle: string; // 0 = any, 1 = front, 2 = rear
  axle_group: string | null;
}

// Тип розміру шини
export type TyreSizeType = 'oem' | 'tuning';

// Тип осі
export type AxleType = 'any' | 'front' | 'rear';

// Конфігурація імпорту
export interface ImportConfig {
  minYear: number;
  batchSize: number;
}

export const DEFAULT_IMPORT_CONFIG: ImportConfig = {
  minYear: 2005,
  batchSize: 5000,
};
