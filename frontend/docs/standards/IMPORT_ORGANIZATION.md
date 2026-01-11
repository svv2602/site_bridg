# Организация Импортов

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Порядок Импортов

Импорты группируются в следующем порядке с пустой строкой между группами:

```typescript
// 1. React и Next.js
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { notFound } from 'next/navigation';

// 2. Сторонние библиотеки
import { motion, AnimatePresence } from 'framer-motion';

// 3. Иконки (Lucide)
import { Search, MapPin, ChevronRight, Car, Truck } from 'lucide-react';

// 4. Локальные компоненты
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { TyreCard } from '@/components/TyreCard';

// 5. Утилиты и хелперы
import { cn } from '@/lib/utils';
import { seasonLabels, formatVehicleTypes } from '@/lib/utils/tyres';

// 6. API и data fetching
import { getTyreModels } from '@/lib/api/tyres';
import { getArticles } from '@/lib/api/articles';

// 7. Типы (всегда последними, с type import)
import type { TyreModel, Season } from '@/lib/data';
import type { Metadata } from 'next';
```

---

## Path Aliases

Используйте `@/` alias вместо относительных путей:

```typescript
// ПРАВИЛЬНО
import { Badge } from '@/components/ui/Badge';
import { getTyreModels } from '@/lib/api/tyres';
import type { TyreModel } from '@/lib/data';

// НЕПРАВИЛЬНО
import { Badge } from '../../../components/ui/Badge';
import { getTyreModels } from '../../lib/api/tyres';
```

---

## Type Imports

Для типов используйте `import type`:

```typescript
// ПРАВИЛЬНО — явный type import
import type { TyreModel, Season } from '@/lib/data';
import type { Metadata } from 'next';

// ДОПУСТИМО — смешанный import
import { getTyreModels, type TyreModel } from '@/lib/api/tyres';

// НЕПРАВИЛЬНО — type как обычный import
import { TyreModel } from '@/lib/data'; // Если это только тип
```

---

## Группировка Иконок

```typescript
// Все иконки в одном импорте
import {
  Search,
  MapPin,
  ChevronRight,
  Car,
  Truck,
  Sun,
  Snowflake,
  Cloud,
} from 'lucide-react';

// НЕ несколько строк импортов из lucide
import { Search } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { Car } from 'lucide-react';
```

---

## UI Компоненты

```typescript
// Компоненты из папки ui/
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EuLabelBadge } from '@/components/ui/EuLabelBadge';

// Или через barrel export (если есть index.ts)
import { Badge, Breadcrumb, ErrorState } from '@/components/ui';
```

---

## Пример Полного Файла

```typescript
/**
 * Страница каталога легковых шин
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { Car, Shield, Zap, Star } from 'lucide-react';

import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { TyreCardGrid } from '@/components/TyreCard';

import { getTyreModels } from '@/lib/api/tyres';
import { seasonLabels, groupBySeason } from '@/lib/utils/tyres';

import type { TyreModel, Season } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Легкові шини Bridgestone',
  description: 'Каталог легкових шин',
};

export default async function PassengerTyresPage() {
  const tyres = await getTyreModels();
  // ...
}
```

---

## ESLint Правила

Рекомендуемые правила для автоматической сортировки:

```json
{
  "rules": {
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "type"
        ],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "next/**",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        "newlines-between": "always"
      }
    ]
  }
}
```

---

## Связанные Документы

- [Структура Компонентов](./COMPONENT_STRUCTURE.md)
- [TypeScript Стандарты](./TYPESCRIPT_STANDARDS.md)
