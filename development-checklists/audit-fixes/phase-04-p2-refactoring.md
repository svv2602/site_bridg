# Фаза 4: P2 Refactoring — Рефакторинг та DRY

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Усунути дублювання коду та створити перевикористовувані компоненти:
- Винести спільні утиліти в shared файли
- Створити template компоненти для схожих сторінок
- Уніфікувати константи та стилі

---

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз дублювання
- [ ] Знайти всі місця де дублюється `seasonLabels`
- [ ] Знайти всі місця де дублюється `seasonIcons`
- [ ] Знайти всі місця де дублюється `formatSize()`
- [ ] Порівняти passenger-tyres, suv-4x4-tyres, lcv-tyres на дублювання

**Команди для пошуку:**
```bash
# Пошук seasonLabels
grep -rn "seasonLabels" frontend/src/
# Пошук formatSize
grep -rn "formatSize" frontend/src/
# Пошук StatCard в адмінці
grep -rn "StatCard" frontend/src/app/admin/
```

#### B. План рефакторингу
- [ ] Визначити які утиліти виносити в `lib/utils/`
- [ ] Визначити які компоненти виносити в `components/`
- [ ] Визначити структуру template компонента

**Нотатки для перевикористання:** -

---

### 4.1 Створити shared utilities для шин

- [ ] Створити `frontend/src/lib/utils/tyres.ts`
- [ ] Винести `seasonLabels` константу
- [ ] Винести `seasonIcons` константу (уніфікувати!)
- [ ] Винести `seasonColors` константу
- [ ] Винести `vehicleTypeLabels` константу
- [ ] Винести `formatSize()` функцію
- [ ] Винести `groupBySeason()` функцію

**Файл:** `frontend/src/lib/utils/tyres.ts`

**Приклад:**
```tsx
import { Sun, Snowflake, Cloud } from 'lucide-react';

export const seasonLabels = {
  summer: 'Літні шини',
  winter: 'Зимові шини',
  'all-season': 'Всесезонні шини',
} as const;

export const seasonIcons = {
  summer: Sun,
  winter: Snowflake,
  'all-season': Cloud,
} as const;

export const seasonColors = {
  summer: 'text-amber-500',
  winter: 'text-blue-400',
  'all-season': 'text-emerald-500',
} as const;

export const vehicleTypeLabels = {
  passenger: 'Легкові',
  suv: 'SUV / 4x4',
  lcv: 'Легкі вантажні',
} as const;

export function formatSize(tyre: { width: number; aspectRatio: number; diameter: number }): string {
  return `${tyre.width}/${tyre.aspectRatio} R${tyre.diameter}`;
}

export function groupBySeason<T extends { season: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const season = item.season || 'other';
    if (!acc[season]) acc[season] = [];
    acc[season].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
```

---

### 4.2 Оновити компоненти для використання shared utils

- [ ] Оновити `frontend/src/app/passenger-tyres/page.tsx`
- [ ] Оновити `frontend/src/app/suv-4x4-tyres/page.tsx`
- [ ] Оновити `frontend/src/app/lcv-tyres/page.tsx`
- [ ] Оновити `frontend/src/app/porivnyaty/page.tsx`
- [ ] Оновити `frontend/src/app/porivnyaty/[slug]/page.tsx`
- [ ] Оновити `frontend/src/app/shyny/[slug]/page.tsx`

**Приклад зміни:**
```tsx
// Було:
const seasonLabels = { summer: 'Літні шини', ... };
const seasonIcons = { summer: Sun, ... };

// Має бути:
import { seasonLabels, seasonIcons, formatSize } from '@/lib/utils/tyres';
```

---

### 4.3 Створити TyreCatalogTemplate компонент

**Джерело:** `plan/result_audit/02-tyre-catalog.md`

~85% коду однаковий між passenger-tyres, suv-4x4-tyres, lcv-tyres.

- [ ] Створити `frontend/src/components/TyreCatalogTemplate.tsx`
- [ ] Props: `vehicleType`, `title`, `description`
- [ ] Компонент включає: hero, breadcrumbs, season sections, CTA
- [ ] Рефакторити passenger-tyres на використання template
- [ ] Рефакторити suv-4x4-tyres на використання template
- [ ] Рефакторити lcv-tyres на використання template

**Структура компонента:**
```tsx
interface TyreCatalogTemplateProps {
  vehicleType: 'passenger' | 'suv' | 'lcv';
  title: string;
  description: string;
  tyres: TyreModel[];
}

export function TyreCatalogTemplate({
  vehicleType,
  title,
  description,
  tyres,
}: TyreCatalogTemplateProps) {
  const groupedTyres = groupBySeason(tyres);

  return (
    <>
      <HeroSection title={title} description={description} />
      <Breadcrumbs items={[...]} />
      {Object.entries(groupedTyres).map(([season, tyres]) => (
        <SeasonSection key={season} season={season} tyres={tyres} />
      ))}
      <CTASection />
    </>
  );
}
```

---

### 4.4 Створити shared Breadcrumb компонент

- [ ] Створити `frontend/src/components/ui/Breadcrumb.tsx`
- [ ] Підтримка різної кількості рівнів
- [ ] Semantic HTML (nav, ol, li)
- [ ] Accessibility (aria-label, aria-current)
- [ ] Замінити всі inline breadcrumbs на компонент

**Приклад:**
```tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-zinc-400">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

### 4.5 Створити shared StatCard для адмінки

**Джерело:** `plan/result_audit/06-admin.md`

StatCard дублюється в 3 файлах адмінки.

- [ ] Створити `frontend/src/components/admin/StatCard.tsx`
- [ ] Підтримка різних кольорів іконок
- [ ] Підтримка форматування значень
- [ ] Замінити дублікати на shared компонент

**Файли для оновлення:**
- `frontend/src/app/admin/automation/page.tsx`
- `frontend/src/app/admin/vehicles-import/page.tsx`
- `frontend/src/app/admin/content-generation/page.tsx`

---

### 4.6 Створити shared ActionButton для адмінки

**Джерело:** `plan/result_audit/06-admin.md`

- [ ] Створити `frontend/src/components/admin/ActionButton.tsx`
- [ ] Підтримка loading state
- [ ] Підтримка disabled state
- [ ] Підтримка різних варіантів (primary, secondary, danger)
- [ ] Замінити дублікати

---

### 4.7 Винести domain URL в env variable

**Джерело:** `plan/result_audit/02-tyre-catalog.md`

- [ ] Додати `NEXT_PUBLIC_SITE_URL` в `.env.example`
- [ ] Оновити Schema.org URL в `shyny/[slug]/page.tsx`
- [ ] Оновити Schema.org URL в інших місцях

**Було:**
```tsx
"url": `https://bridgestone.ua/shyny/${model.slug}`
```

**Має бути:**
```tsx
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bridgestone.ua';
// ...
"url": `${siteUrl}/shyny/${model.slug}`
```

---

### 4.8 Cleanup: видалити unused imports

**Джерело:** `plan/result_audit/02-tyre-catalog.md`

- [ ] Видалити unused `TyreCard` import в passenger-tyres
- [ ] Видалити unused `TyreCardGrid` import в lcv-tyres
- [ ] Видалити development-only текст ("У продакшн-версії...")
- [ ] Перевірити інші файли на unused imports

**Команди:**
```bash
# Знайти unused imports (потребує ESLint)
npm run lint
```

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "refactor(dry): phase-4 P2 shared utilities and components"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 5
   - Додай запис в історію
6. Відкрий `phase-05-p2-seo.md` та продовж роботу
