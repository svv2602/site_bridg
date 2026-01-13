# Фаза 5: Локатор дилерів на головній

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати компактний блок пошуку дилерів на головну сторінку, як у Goodyear. Блок дозволяє швидко знайти найближчого дилера без переходу на окрему сторінку.

## Референс
Goodyear: Блок "Швидко знайдіть найближчий магазин" з полем пошуку за адресою/містом, кнопкою та посиланням на повну карту.

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити `DealersMap.tsx` - поточну карту дилерів
- [ ] Вивчити `dealers/page.tsx` - сторінку дилерів
- [ ] Вивчити API дилерів `lib/api/dealers.ts`
- [ ] Перевірити як працює геолокація

**Команди для пошуку:**
```bash
# Компонент карти
cat frontend/src/components/DealersMap.tsx

# Сторінка дилерів
cat frontend/src/app/dealers/page.tsx

# API
cat frontend/src/lib/api/dealers.ts
```

#### B. Аналіз залежностей
- [ ] Чи можна перевикористати логіку пошуку з DealersMap?
- [ ] Чи потрібен новий API endpoint для пошуку по місту?
- [ ] Чи використовувати геолокацію браузера?

**Перевикористання:** Логіка з DealersMap.tsx
**Новий компонент:** DealerLocatorCompact.tsx

#### C. Перевірка дизайну
- [ ] Чи показувати мініатюрну карту?
- [ ] Скільки результатів показувати (3-4)?
- [ ] Як виглядає на mobile?

**Варіант 1:** Тільки поле пошуку + список результатів (без карти)
**Варіант 2:** Поле пошуку + мініатюрна карта

**Нотатки для перевикористання:** -

---

### 5.1 Створення DealerLocatorCompact компонента

- [ ] Створити `frontend/src/components/DealerLocatorCompact.tsx`
- [ ] Імплементувати поле пошуку за містом
- [ ] Додати автокомпліт міст України
- [ ] Показати 3-4 найближчих дилери
- [ ] Додати кнопку "Показати всіх дилерів"

**Файли:** `frontend/src/components/DealerLocatorCompact.tsx`

**Базова структура:**
```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Search, Phone, ChevronRight } from 'lucide-react';

interface DealerLocatorCompactProps {
  initialDealers?: Dealer[];
}

export function DealerLocatorCompact({ initialDealers }: DealerLocatorCompactProps) {
  const [query, setQuery] = useState('');
  const [dealers, setDealers] = useState<Dealer[]>(initialDealers || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    // Search logic
    setIsLoading(false);
  };

  return (
    <section className="py-12 bg-stone-100 dark:bg-stone-900">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Search form */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Знайдіть найближчого дилера
            </h2>
            <p className="text-muted-foreground mb-6">
              Введіть ваше місто для пошуку офіційних дилерів Bridgestone
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Київ, Львів, Одеса..."
                className="input flex-1"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={handleSearch} className="btn-primary">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {dealers.slice(0, 4).map((dealer) => (
              <DealerCard key={dealer.id} dealer={dealer} />
            ))}
            <Link
              href="/dealers"
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-border hover:bg-card transition-colors"
            >
              Показати всіх дилерів
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Нотатки:** -

---

### 5.2 Картка дилера (compact версія)

- [ ] Створити компактну картку дилера
- [ ] Показати: назву, адресу, телефон
- [ ] Додати кнопку "Маршрут" (Google Maps link)
- [ ] Мінімалістичний дизайн

**Файли:** `frontend/src/components/DealerLocatorCompact.tsx`

**Compact dealer card:**
```tsx
function DealerCard({ dealer }: { dealer: Dealer }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
      <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
        <MapPin className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate">{dealer.name}</h4>
        <p className="text-sm text-muted-foreground truncate">{dealer.city}</p>
      </div>
      <a
        href={`tel:${dealer.phone}`}
        className="flex-shrink-0 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        <Phone className="h-4 w-4" />
      </a>
    </div>
  );
}
```

**Нотатки:** -

---

### 5.3 Логіка пошуку дилерів

- [ ] Імплементувати фільтрацію по місту
- [ ] Сортувати за відстанню (якщо є геолокація)
- [ ] Показати "Нічого не знайдено" якщо немає результатів
- [ ] Debounce для автопошуку при введенні

**Файли:** `frontend/src/components/DealerLocatorCompact.tsx`

**Логіка пошуку:**
```typescript
const searchDealers = (query: string, allDealers: Dealer[]): Dealer[] => {
  if (!query) return allDealers.slice(0, 4);

  const normalizedQuery = query.toLowerCase();
  return allDealers
    .filter(d =>
      d.city.toLowerCase().includes(normalizedQuery) ||
      d.name.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 4);
};
```

**Нотатки:** -

---

### 5.4 Інтеграція на головну сторінку

- [ ] Імпортувати DealerLocatorCompact в `app/page.tsx`
- [ ] Отримати початкові дані дилерів (SSR)
- [ ] Розмістити перед CTA секцією
- [ ] Додати заголовок секції

**Файли:** `frontend/src/app/page.tsx`

**Розташування:**
```tsx
{/* Trust Indicators */}
<section className="...">
  ...
</section>

{/* NEW: Dealer Locator */}
<DealerLocatorCompact initialDealers={popularDealers} />

{/* CTA */}
<section className="py-16">
  ...
</section>
```

**Нотатки:** -

---

### 5.5 Геолокація (optional)

- [ ] Додати кнопку "Використати моє місцезнаходження"
- [ ] Запросити дозвіл на геолокацію
- [ ] Розрахувати найближчих дилерів за координатами
- [ ] Показати відстань до кожного дилера

**Файли:** `frontend/src/components/DealerLocatorCompact.tsx`

**Геолокація:**
```typescript
const requestGeolocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Find nearest dealers
      },
      (error) => {
        console.warn('Geolocation error:', error);
      }
    );
  }
};
```

**Нотатки:** Optional feature, можна пропустити для MVP

---

### 5.6 Тестування та оптимізація

- [ ] Перевірити роботу пошуку з різними запитами
- [ ] Тестувати на mobile (touch keyboard)
- [ ] Перевірити accessibility (labels, focus)
- [ ] Оптимізувати для slow connections (loading states)

**Файли:** -

**Test cases:**
- [ ] Пошук за назвою міста
- [ ] Пошук з помилкою в написанні
- [ ] Порожній результат
- [ ] Велика кількість результатів

**Нотатки:** -

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(goodyear-ux): phase-5 dealer locator homepage completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 6
   - Загальний прогрес: 35/48 задач
   - Додай запис в історію
6. Відкрий `phase-06-ux-enhancements.md` та продовж роботу
