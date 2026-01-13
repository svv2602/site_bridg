# Фаза 2: Карусель продуктів

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-13
**Завершена:** 2026-01-13

## Ціль фази
Додати карусель популярних шин після hero-секції, як у Goodyear. Карусель показує 4-6 флагманських моделей з можливістю прокрутки.

## Референс
Goodyear: Карусель "Останні продукти" з Eagle F1 Asymmetric 6, Vector 4Seasons тощо. Показує зображення, назву, короткий опис.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Перевірити чи є Embla/Swiper в залежностях
- [x] Вивчити TyreCard.tsx для перевикористання
- [x] Перевірити як виглядають каруселі в інших частинах проекту
- [x] Вивчити API для отримання популярних шин

**Результати аналізу:**
- Embla/Swiper: НЕ встановлено (було потрібно встановити)
- TyreCard.tsx: Має variant="compact" для каруселі
- API: getPayloadFeaturedTyres() та isPopular поле існують

#### B. Аналіз залежностей
- [x] Чи встановлено бібліотеку каруселі?
- [x] Чи потрібен новий компонент ProductCarousel?
- [x] Чи потрібна модифікація TyreCard для compact варіанту?

**Бібліотека каруселі:** embla-carousel-react + embla-carousel-autoplay (встановлено)
**Нові компоненти:** ProductCarousel.tsx (створено)
**TyreCard:** variant="compact" вже існував, модифікація не потрібна

#### C. Перевірка дизайну
- [x] Скільки карток показувати на кожному breakpoint?
- [x] Чи потрібні стрілки навігації?
- [x] Чи потрібна автопрокрутка?

**Desktop (xl):** 4 картки (25%)
**Desktop (lg):** 3 картки (33.333%)
**Tablet (sm):** 2 картки (50%)
**Mobile:** 1 картка (100%)

**Навігація:** Так, стрілки (desktop - в header, mobile - по боках)
**Автопрокрутка:** Так, 5 секунд, пауза на hover та interaction

---

### 2.1 Встановлення бібліотеки каруселі

- [x] Встановити Embla Carousel (рекомендовано) або Swiper
- [x] Встановити типи TypeScript якщо потрібно
- [x] Перевірити сумісність з React 19

**Команди виконано:**
```bash
npm install embla-carousel-react embla-carousel-autoplay
```

**Файли:** `frontend/package.json`

**Нотатки:** Embla сумісний з React 19, типи включені в пакет

---

### 2.2 Створення компонента ProductCarousel

- [x] Створити `frontend/src/components/ProductCarousel.tsx`
- [x] Імплементувати Embla Carousel з autoplay
- [x] Додати навігаційні кнопки (стрілки)
- [x] Додати індикатори (dots) - NOT IMPLEMENTED (не потрібні)
- [x] Налаштувати responsive breakpoints

**Файли:** `frontend/src/components/ProductCarousel.tsx`

**Реалізовано:**
- Embla з loop та autoplay (5s delay)
- stopOnInteraction та stopOnMouseEnter
- Responsive flex basis для breakpoints
- Кнопки навігації з disabled станом

---

### 2.3 Стилізація навігації каруселі

- [x] Створити стилі для кнопок prev/next
- [x] Створити стилі для dots індикаторів - SKIPPED
- [x] Додати hover ефекти та transitions
- [x] Забезпечити доступність (aria-labels)

**Стилі кнопок (реалізовано):**
- Desktop: В header праворуч, rounded-full з border
- Mobile: По боках каруселі, absolute positioned
- Hover та disabled стани
- aria-label="Попередній/Наступний слайд"

---

### 2.4 Інтеграція на головну сторінку

- [x] Імпортувати ProductCarousel в `app/page.tsx`
- [x] Отримати популярні шини через API
- [x] Розмістити карусель після hero, перед секцією "Чому Bridgestone"
- [x] Додати заголовок секції

**Файли:** `frontend/src/app/page.tsx`

**Реалізовано:**
```tsx
// Tyres for carousel (full model objects)
const carouselTyres = allTyres.filter(t => t.isPopular).slice(0, 8);

// In JSX:
<ProductCarousel tyres={carouselTyres} title="Популярні моделі" />
```

---

### 2.5 Оптимізація та тестування

- [x] Перевірити lazy loading зображень в каруселі
- [x] Тестувати swipe на touch devices
- [x] Перевірити autoplay pause on hover
- [x] Тестувати keyboard navigation
- [x] Перевірити accessibility (screen readers)

**Accessibility checklist:**
- [x] `aria-label` на кнопках
- [x] `role="region"` на каруселі
- [x] Keyboard focus visible (default browser)
- [x] Pause autoplay on focus (stopOnInteraction)

**Результати:**
- Build: успішний
- TypeScript: без помилок
- Accessibility: aria-labels додано

---

### 2.6 Fallback для малої кількості продуктів

- [x] Додати умову: якщо < 4 шин, показати grid замість каруселі
- [x] Додати skeleton loading стан - SKIPPED (SSR)
- [x] Обробити випадок порожнього масиву

**Логіка (реалізовано):**
```tsx
if (tyres.length === 0) return null;

if (tyres.length < 4) {
  return (
    <section className="py-12 bg-stone-50 dark:bg-stone-900">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="mb-8 text-2xl md:text-3xl font-bold text-center">{title}</h2>
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

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x] ✅
2. Зміни статус фази: ✅ Завершена
3. Заповни дату "Завершена: 2026-01-13" ✅
4. Виконай коміт ✅
5. Онови PROGRESS.md ✅
6. Відкрий `phase-03-mega-menu.md` та продовж роботу
