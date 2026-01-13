# Фаза 2: Карусель продуктів

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати карусель популярних шин після hero-секції, як у Goodyear. Карусель показує 4-6 флагманських моделей з можливістю прокрутки.

## Референс
Goodyear: Карусель "Останні продукти" з Eagle F1 Asymmetric 6, Vector 4Seasons тощо. Показує зображення, назву, короткий опис.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Перевірити чи є Embla/Swiper в залежностях
- [ ] Вивчити TyreCard.tsx для перевикористання
- [ ] Перевірити як виглядають каруселі в інших частинах проекту
- [ ] Вивчити API для отримання популярних шин

**Команди для пошу|ку:**
```bash
# Перевірка залежностей
grep -E "embla|swiper" frontend/package.json

# Існуючі картки
cat frontend/src/components/TyreCard.tsx

# API популярних шин
grep -n "isPopular" frontend/src/lib/api/tyres.ts
```

#### B. Аналіз залежностей
- [ ] Чи встановлено бібліотеку каруселі?
- [ ] Чи потрібен новий компонент ProductCarousel?
- [ ] Чи потрібна модифікація TyreCard для compact варіанту?

**Бібліотека каруселі:** -
**Нові компоненти:** ProductCarousel.tsx

#### C. Перевірка дизайну
- [ ] Скільки карток показувати на кожному breakpoint?
- [ ] Чи потрібні стрілки навігації?
- [ ] Чи потрібна автопрокрутка?

**Desktop:** 4 картки
**Tablet:** 2-3 картки
**Mobile:** 1 картка (swipe)

**Нотатки для перевикористання:** -

---

### 2.1 Встановлення бібліотеки каруселі

- [ ] Встановити Embla Carousel (рекомендовано) або Swiper
- [ ] Встановити типи TypeScript якщо потрібно
- [ ] Перевірити сумісність з React 19

**Команди:**
```bash
cd frontend
npm install embla-carousel-react embla-carousel-autoplay
```

**Файли:** `frontend/package.json`

**Нотатки:** -

---

### 2.2 Створення компонента ProductCarousel

- [ ] Створити `frontend/src/components/ProductCarousel.tsx`
- [ ] Імплементувати Embla Carousel з autoplay
- [ ] Додати навігаційні кнопки (стрілки)
- [ ] Додати індикатори (dots)
- [ ] Налаштувати responsive breakpoints

**Файли:** `frontend/src/components/ProductCarousel.tsx`

**Базова структура:**
```tsx
'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { TyreCard } from './TyreCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCarouselProps {
  tyres: TyreModel[];
  title?: string;
}

export function ProductCarousel({ tyres, title }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  // ... navigation handlers

  return (
    <section className="py-12">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        {title && <h2 className="mb-8 text-3xl font-bold">{title}</h2>}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {tyres.map((tyre) => (
                <div key={tyre.slug} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]">
                  <TyreCard tyre={tyre} variant="compact" />
                </div>
              ))}
            </div>
          </div>
          {/* Navigation buttons */}
        </div>
      </div>
    </section>
  );
}
```

**Нотатки:** -

---

### 2.3 Стилізація навігації каруселі

- [ ] Створити стилі для кнопок prev/next
- [ ] Створити стилі для dots індикаторів
- [ ] Додати hover ефекти та transitions
- [ ] Забезпечити доступність (aria-labels)

**Файли:** `frontend/src/components/ProductCarousel.tsx`

**Стилі кнопок:**
```tsx
<button
  onClick={scrollPrev}
  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-white p-3 shadow-lg transition-all hover:bg-stone-100 disabled:opacity-50"
  aria-label="Попередній слайд"
>
  <ChevronLeft className="h-5 w-5" />
</button>
```

**Нотатки:** -

---

### 2.4 Інтеграція на головну сторінку

- [ ] Імпортувати ProductCarousel в `app/page.tsx`
- [ ] Отримати популярні шини через API
- [ ] Розмістити карусель після hero, перед секцією "Чому Bridgestone"
- [ ] Додати заголовок секції

**Файли:** `frontend/src/app/page.tsx`

**Розташування:**
```tsx
<SeasonalHero>
  <QuickSearchForm />
</SeasonalHero>

{/* NEW: Product Carousel */}
<ProductCarousel
  tyres={featuredTyres}
  title="Популярні моделі"
/>

{/* Features section */}
<section className="py-12">
  ...
</section>
```

**Нотатки:** -

---

### 2.5 Оптимізація та тестування

- [ ] Перевірити lazy loading зображень в каруселі
- [ ] Тестувати swipe на touch devices
- [ ] Перевірити autoplay pause on hover
- [ ] Тестувати keyboard navigation
- [ ] Перевірити accessibility (screen readers)

**Файли:** -

**Accessibility checklist:**
- [ ] `aria-label` на кнопках
- [ ] `role="region"` на каруселі
- [ ] Keyboard focus visible
- [ ] Pause autoplay on focus

**Нотатки:** -

---

### 2.6 Fallback для малої кількості продуктів

- [ ] Додати умову: якщо < 4 шин, показати grid замість каруселі
- [ ] Додати skeleton loading стан
- [ ] Обробити випадок порожнього масиву

**Файли:** `frontend/src/components/ProductCarousel.tsx`

**Логіка:**
```tsx
if (tyres.length === 0) {
  return null;
}

if (tyres.length < 4) {
  return (
    <section className="py-12">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="mb-8 text-3xl font-bold">{title}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tyres.map((tyre) => (
            <TyreCard key={tyre.slug} tyre={tyre} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

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
   git commit -m "checklist(goodyear-ux): phase-2 product carousel completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Загальний прогрес: 15/48 задач
   - Додай запис в історію
6. Відкрий `phase-03-mega-menu.md` та продовж роботу
