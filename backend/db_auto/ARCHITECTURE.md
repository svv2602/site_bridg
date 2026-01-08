# Архитектура подбора шин по автомобилю

## Обзор системы

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    VehicleTyreSelector Component                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐   │   │
│  │  │  Марка   │→│  Модель  │→│   Рік    │→│   Комплектація       │   │   │
│  │  │ (Select) │ │ (Select) │ │ (Select) │ │   (Select)           │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘   │   │
│  │                              ↓                                       │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                    TyreSizeResults                             │  │   │
│  │  │  OEM: 205/55 R16, 225/45 R17                                  │  │   │
│  │  │  Tuning: 235/40 R18                                           │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                              ↓                                       │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │              MatchingBridgestoneTyres                          │  │   │
│  │  │  [Turanza T005] [Blizzak LM005] [Potenza Sport]               │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/JSON
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API ROUTES (Next.js)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GET /api/vehicles/brands                                                   │
│      → [{id, name}]                                                         │
│                                                                             │
│  GET /api/vehicles/models?brandId=4                                         │
│      → [{id, name}]                                                         │
│                                                                             │
│  GET /api/vehicles/years?modelId=123                                        │
│      → [2020, 2021, 2022, 2023]                                             │
│                                                                             │
│  GET /api/vehicles/kits?modelId=123&year=2020                               │
│      → [{id, name: "2.0 TSI", pcd, boltCount, dia}]                         │
│                                                                             │
│  GET /api/vehicles/tyre-sizes?kitId=456                                     │
│      → {oem: [...], tuning: [...]}                                          │
│                                                                             │
│  GET /api/vehicles/search?brandId=4&modelId=123&year=2020&kitId=456         │
│      → {vehicle: {...}, tyreSizes: {...}, matchingTyres: [...]}             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PostgreSQL Database                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐      ┌────────────────┐      ┌────────────────────┐    │
│  │  car_brands    │──1:N─│  car_models    │──1:N─│    car_kits        │    │
│  │  id, name      │      │  id, brand_id  │      │  id, model_id      │    │
│  │                │      │  name          │      │  year, name        │    │
│  │  227 записей   │      │  5,902 записей │      │  pcd, bolt_count   │    │
│  └────────────────┘      └────────────────┘      │  dia, bolt_size    │    │
│                                                  │  304,924 записей   │    │
│                                                  └─────────┬──────────┘    │
│                                                            │ 1:N           │
│                          ┌─────────────────────────────────┴───────┐       │
│                          │                                         │       │
│                          ↓                                         ↓       │
│              ┌────────────────────────┐            ┌────────────────────┐  │
│              │   car_kit_tyre_sizes   │            │  car_kit_disk_sizes│  │
│              │  id, kit_id            │            │  id, kit_id        │  │
│              │  width, height         │            │  width, diameter   │  │
│              │  diameter, type        │            │  et, type, axle    │  │
│              │  axle, axle_group      │            │  1,144,266 записей │  │
│              │  1,198,772 записей     │            └────────────────────┘  │
│              └────────────────────────┘                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. GET /api/vehicles/brands

Возвращает список всех марок автомобилей.

**Response:**
```json
{
  "data": [
    {"id": 1, "name": "Acura"},
    {"id": 2, "name": "Alfa Romeo"},
    {"id": 4, "name": "Audi"}
  ]
}
```

### 2. GET /api/vehicles/models

Возвращает модели для выбранной марки.

**Query params:**
- `brandId` (required): ID марки

**Response:**
```json
{
  "data": [
    {"id": 100, "name": "A3"},
    {"id": 101, "name": "A4"},
    {"id": 102, "name": "A6"}
  ]
}
```

### 3. GET /api/vehicles/years

Возвращает годы выпуска для модели.

**Query params:**
- `modelId` (required): ID модели

**Response:**
```json
{
  "data": [2018, 2019, 2020, 2021, 2022, 2023]
}
```

### 4. GET /api/vehicles/kits

Возвращает комплектации для модели и года.

**Query params:**
- `modelId` (required): ID модели
- `year` (required): год выпуска

**Response:**
```json
{
  "data": [
    {
      "id": 5000,
      "name": "2.0 TFSI",
      "pcd": "112.00",
      "boltCount": 5,
      "dia": "57.10",
      "boltSize": "M14 x 1.5"
    },
    {
      "id": 5001,
      "name": "2.0 TDI",
      "pcd": "112.00",
      "boltCount": 5,
      "dia": "57.10",
      "boltSize": "M14 x 1.5"
    }
  ]
}
```

### 5. GET /api/vehicles/tyre-sizes

Возвращает размеры шин для комплектации.

**Query params:**
- `kitId` (required): ID комплектации

**Response:**
```json
{
  "data": {
    "oem": [
      {
        "width": 225,
        "height": 45,
        "diameter": 17,
        "axle": "any",
        "axleGroup": null
      },
      {
        "width": 245,
        "height": 35,
        "diameter": 19,
        "axle": "front",
        "axleGroup": 1
      },
      {
        "width": 265,
        "height": 35,
        "diameter": 19,
        "axle": "rear",
        "axleGroup": 1
      }
    ],
    "tuning": [
      {
        "width": 255,
        "height": 30,
        "diameter": 20,
        "axle": "any",
        "axleGroup": null
      }
    ]
  }
}
```

### 6. GET /api/vehicles/search (комплексный поиск)

Полный поиск с подбором шин Bridgestone.

**Query params:**
- `kitId` (required): ID комплектации

**Response:**
```json
{
  "data": {
    "vehicle": {
      "brand": "Audi",
      "model": "A4",
      "year": 2020,
      "kit": "2.0 TFSI",
      "pcd": "112.00",
      "boltCount": 5,
      "dia": "57.10"
    },
    "tyreSizes": {
      "oem": [...],
      "tuning": [...]
    },
    "matchingTyres": [
      {
        "slug": "turanza-t005",
        "name": "Bridgestone Turanza T005",
        "season": "summer",
        "matchingSizes": ["225/45 R17", "245/35 R19"]
      },
      {
        "slug": "blizzak-lm005",
        "name": "Bridgestone Blizzak LM005",
        "season": "winter",
        "matchingSizes": ["225/45 R17"]
      }
    ]
  }
}
```

## TypeScript Types

```typescript
// types/vehicles.ts

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
  pcd: string;
  boltCount: number;
  dia: string;
  boltSize: string;
}

export type TyreSizeType = 'oem' | 'tuning';
export type AxleType = 'any' | 'front' | 'rear';

export interface CarTyreSize {
  id: number;
  kitId: number;
  width: number;
  height: number;
  diameter: number;
  type: TyreSizeType;
  axle: AxleType;
  axleGroup: number | null;
}

export interface VehicleTyreSizeResult {
  oem: CarTyreSize[];
  tuning: CarTyreSize[];
}

export interface VehicleSearchResult {
  vehicle: {
    brand: string;
    model: string;
    year: number;
    kit: string;
    pcd: string;
    boltCount: number;
    dia: string;
  };
  tyreSizes: VehicleTyreSizeResult;
  matchingTyres: MatchingTyre[];
}

export interface MatchingTyre {
  slug: string;
  name: string;
  season: 'summer' | 'winter' | 'allseason';
  imageUrl?: string;
  matchingSizes: string[];
}
```

## Индексы базы данных

Для оптимальной производительности каскадного поиска:

```sql
-- Быстрый поиск моделей по марке
CREATE INDEX idx_car_models_brand ON car_models(brand_id);

-- Быстрый поиск комплектаций по модели и году
CREATE INDEX idx_car_kits_model_year ON car_kits(model_id, year);

-- Быстрый поиск размеров шин по комплектации
CREATE INDEX idx_car_kit_tyre_sizes_kit ON car_kit_tyre_sizes(kit_id);

-- Поиск шин по размеру (для matching с каталогом Bridgestone)
CREATE INDEX idx_car_kit_tyre_sizes_dimensions
  ON car_kit_tyre_sizes(width, height, diameter);
```

## Кэширование

Для снижения нагрузки на БД рекомендуется:

1. **Статические данные** (марки, модели) — кэшировать на уровне Next.js:
   ```typescript
   export const revalidate = 86400; // 24 часа
   ```

2. **Динамические данные** (комплектации, размеры) — кэшировать 1 час:
   ```typescript
   export const revalidate = 3600;
   ```

3. **Client-side кэш** — React Query / SWR для повторных запросов.

## Переменные окружения

```env
# .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/bridgestone_vehicles
```
