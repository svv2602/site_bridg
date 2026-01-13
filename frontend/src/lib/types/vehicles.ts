// Типи для бази даних автомобілів та підбору шин

export interface CarBrand {
  id: number;
  name: string;
}

export interface CarModel {
  id: number;
  brandId: number;
  name: string;
}

export interface CarKit {
  id: number;
  modelId: number;
  year: number;
  name: string;
  pcd: string | null;
  boltCount: number | null;
  dia: string | null;
  boltSize: string | null;
}

export type TyreSizeType = 'oem' | 'tuning';
export type AxleType = 'any' | 'front' | 'rear';

export interface CarTyreSize {
  id: number;
  kitId: number;
  width: number;
  height: number;
  diameter: number;
  sizeType: TyreSizeType;
  axle: AxleType;
  axleGroup: number | null;
}

export interface CarDiskSize {
  id: number;
  kitId: number;
  width: number;
  diameter: number;
  et: number | null;
  sizeType: TyreSizeType;
  axle: AxleType;
  axleGroup: number | null;
}

// Групований результат розмірів шин
export interface GroupedTyreSizes {
  oem: CarTyreSize[];
  tuning: CarTyreSize[];
}

// Повна інформація про автомобіль
export interface VehicleInfo {
  brand: string;
  model: string;
  year: number;
  kit: string;
  pcd: string | null;
  boltCount: number | null;
  dia: string | null;
  boltSize: string | null;
}

// Шина Bridgestone, що підходить (повні дані моделі + підходящі розміри)
import type { TyreModel } from '@/lib/data';

export interface MatchingTyre extends TyreModel {
  matchingSizes: string[];
}

// Повний результат пошуку
export interface VehicleSearchResult {
  vehicle: VehicleInfo;
  tyreSizes: GroupedTyreSizes;
  diskSizes?: GroupedTyreSizes;
  matchingTyres: MatchingTyre[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface BrandsResponse extends ApiResponse<CarBrand[]> {}
export interface ModelsResponse extends ApiResponse<CarModel[]> {}
export interface YearsResponse extends ApiResponse<number[]> {}
export interface KitsResponse extends ApiResponse<CarKit[]> {}
export interface TyreSizesResponse extends ApiResponse<GroupedTyreSizes> {}
export interface SearchResponse extends ApiResponse<VehicleSearchResult> {}

// Форматування розміру шини
export function formatTyreSizeLabel(size: CarTyreSize): string {
  return `${Math.round(size.width)}/${Math.round(size.height)} R${Math.round(size.diameter)}`;
}

// Локалізація типу осі
export function getAxleLabel(axle: AxleType): string {
  switch (axle) {
    case 'front':
      return 'передня вісь';
    case 'rear':
      return 'задня вісь';
    default:
      return 'будь-яка вісь';
  }
}

// Локалізація типу розміру
export function getSizeTypeLabel(sizeType: TyreSizeType): string {
  return sizeType === 'oem' ? 'Заводський' : 'Альтернативний';
}
