# TypeScript Стандарты

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Строгий Режим

tsconfig.json настроен на строгий режим:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

## Interface vs Type

### Interface — для объектов и props

```typescript
// Props компонентов
interface TyreCardProps {
  tyre: TyreModel;
  className?: string;
  variant?: 'default' | 'compact';
}

// Объекты данных
interface TyreModel {
  id: string;
  slug: string;
  name: string;
  season: Season;
  sizes: TyreSize[];
}
```

### Type — для union, intersection, примитивов

```typescript
// Union types
type Season = 'summer' | 'winter' | 'all-season';
type VehicleType = 'passenger' | 'suv' | 'lcv';

// Intersection
type TyreWithPrice = TyreModel & { price: number };

// Function types
type ClickHandler = (id: string) => void;
```

---

## Запрет `any`

```typescript
// ЗАПРЕЩЕНО
const data: any = await fetchData();
function process(item: any) {}

// ПРАВИЛЬНО — используйте unknown
const data: unknown = await fetchData();
if (isValidData(data)) {
  // TypeScript знает тип
}

// ПРАВИЛЬНО — определите тип
interface ApiResponse {
  data: TyreModel[];
  total: number;
}
const response: ApiResponse = await fetchData();
```

---

## Типизация Props

### Обязательные и Опциональные

```typescript
interface CardProps {
  // Обязательные
  title: string;
  tyre: TyreModel;

  // Опциональные с ?
  className?: string;
  variant?: 'default' | 'compact';
  onClick?: () => void;
}
```

### Props с Children

```typescript
interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

// Для строго типизированных children
interface ButtonProps {
  children: string; // Только строка
}
```

### Props с Дефолтными Значениями

```typescript
interface BadgeProps {
  variant?: 'default' | 'outline' | 'destructive';
}

function Badge({ variant = 'default' }: BadgeProps) {
  // variant гарантированно не undefined
}
```

---

## Generics

### Компоненты с Generics

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Использование
<List
  items={tyres}
  renderItem={tyre => <TyreCard tyre={tyre} />}
  keyExtractor={tyre => tyre.id}
/>
```

### API Response

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

async function fetchTyres(): Promise<PaginatedResponse<TyreModel>> {
  // ...
}
```

---

## Utility Types

### Partial и Required

```typescript
// Все поля опциональные
type PartialTyre = Partial<TyreModel>;

// Все поля обязательные
type RequiredTyre = Required<TyreModel>;
```

### Pick и Omit

```typescript
// Выбрать только некоторые поля
type TyreSummary = Pick<TyreModel, 'id' | 'name' | 'season'>;

// Исключить поля
type TyreWithoutSizes = Omit<TyreModel, 'sizes'>;
```

### Record

```typescript
// Объект с ключами определённого типа
type SeasonLabels = Record<Season, string>;

const seasonLabels: SeasonLabels = {
  summer: 'Літні',
  winter: 'Зимові',
  'all-season': 'Всесезонні',
};
```

---

## as const

```typescript
// Readonly literal types
const SEASONS = ['summer', 'winter', 'all-season'] as const;
type Season = typeof SEASONS[number]; // 'summer' | 'winter' | 'all-season'

// Объект с literal типами
const BADGE_CLASSES = {
  summer: 'badge-summer',
  winter: 'badge-winter',
  'all-season': 'badge-allseason',
} as const;
```

---

## Type Guards

```typescript
// Type guard функция
function isValidTyre(data: unknown): data is TyreModel {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'slug' in data &&
    'name' in data
  );
}

// Использование
const data = await fetchData();
if (isValidTyre(data)) {
  // TypeScript знает, что data: TyreModel
  console.log(data.name);
}
```

---

## Event Handlers

```typescript
// Form events
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

// Input events
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// Select events
const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setOption(e.target.value);
};

// Click events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // ...
};

// Keyboard events
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') {
    close();
  }
};
```

---

## Next.js Специфика

### Page Props (App Router)

```typescript
// Динамические параметры
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  // ...
}
```

### Metadata

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Заголовок',
  description: 'Описание',
};
```

### generateStaticParams

```typescript
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const tyres = await getTyreModels();
  return tyres.map(t => ({ slug: t.slug }));
}
```

---

## Примеры

### Полный Компонент

```typescript
import type { TyreModel, Season } from '@/lib/data';

interface TyreCardProps {
  tyre: TyreModel;
  className?: string;
  variant?: 'default' | 'compact';
  onSelect?: (id: string) => void;
}

const VARIANT_STYLES = {
  default: 'p-6',
  compact: 'p-4',
} as const satisfies Record<string, string>;

export function TyreCard({
  tyre,
  className,
  variant = 'default',
  onSelect,
}: TyreCardProps) {
  const handleClick = () => {
    onSelect?.(tyre.id);
  };

  return (
    <article
      className={cn(VARIANT_STYLES[variant], className)}
      onClick={handleClick}
    >
      <h3>{tyre.name}</h3>
    </article>
  );
}
```

---

## Чеклист

- [ ] Нет `any` в коде
- [ ] Props типизированы через interface
- [ ] Event handlers правильно типизированы
- [ ] `as const` для literal objects
- [ ] Type guards для unknown данных
- [ ] Generics где нужна переиспользуемость

---

## Связанные Документы

- [Структура Компонентов](./COMPONENT_STRUCTURE.md)
- [API Интеграция](./API_INTEGRATION.md)
- [Стиль Кода](./CODE_STYLE.md)
