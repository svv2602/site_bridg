# Фаза 2: Frontend - Seasonal Hero + Logos

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати динамічний SeasonalHero на головну сторінку та логотипи джерел тестів для TestResultsSection.

## Передумови
- API endpoint `/api/seasonal` вже існує в backend-payload
- Логотипи потрібно створити або завантажити

---

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути поточний Hero на головній сторінці `frontend/src/app/page.tsx`
- [ ] Перевірити API endpoint `/api/seasonal` в backend-payload
- [ ] Вивчити seasonal config в `backend-payload/src/automation/seasonal.ts`

**Команди для пошуку:**
```bash
# Головна сторінка
cat frontend/src/app/page.tsx

# Seasonal API
cat backend-payload/src/app/api/seasonal/route.ts

# Seasonal config
cat backend-payload/src/automation/seasonal.ts
```

#### B. Аналіз залежностей
- [ ] Чи потрібен новий API route в frontend?
- [ ] Які формати логотипів використовувати (SVG)?

**Нові типи:** SeasonalData
**Нові API-функції:** frontend API route `/api/seasonal` (proxy до backend)
**Нові компоненти:** SeasonalHero.tsx

#### C. Перевірка дизайну
- [ ] Градієнти для сезонів (spring: orange-yellow, autumn: blue-cyan)
- [ ] Fallback до default hero при помилках
- [ ] Responsive design для hero

**Референс-сторінка:** поточний hero в `page.tsx`

**Нотатки для перевикористання:**
- Зберегти структуру існуючого hero
- Додати динамічний контент на основі сезону

---

### 2.1 Створити SeasonalHero компонент

- [ ] Створити `frontend/src/components/SeasonalHero.tsx`
- [ ] Додати fetch до backend `/api/seasonal`
- [ ] Реалізувати fallback при помилці або loading
- [ ] Застосувати динамічний градієнт на основі сезону

**Файли:** `frontend/src/components/SeasonalHero.tsx`

**Seasonal Data Interface:**
```typescript
interface SeasonalData {
  heroTitle: string;
  heroSubtitle: string;
  featuredSeason: 'summer' | 'winter' | null;
  gradient: string;
  ctaText: string;
  ctaLink: string;
}
```

**Логіка сезонів:**
- Березень-Квітень → spring (літні шини)
- Жовтень-Листопад → autumn (зимові шини)
- Інше → default

---

### 2.2 Інтегрувати SeasonalHero на головну сторінку

- [ ] Замінити статичний hero на SeasonalHero в `page.tsx`
- [ ] Зберегти Quick Search форму
- [ ] Перевірити що fallback працює коректно

**Файли:** `frontend/src/app/page.tsx`

**Структура:**
```tsx
<section className={`bg-gradient-to-br ${gradient} py-8 md:py-12`}>
  <div className="container mx-auto max-w-7xl px-4 md:px-8">
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Динамічний контент */}
      <SeasonalContent data={seasonalData} />

      {/* Quick Search (залишається без змін) */}
      <QuickSearchForm />
    </div>
  </div>
</section>
```

---

### 2.3 Створити логотипи джерел тестів

- [ ] Створити директорію `frontend/public/images/logos/`
- [ ] Створити або завантажити `adac.svg`
- [ ] Створити або завантажити `autobild.svg`
- [ ] Створити або завантажити `tyrereviews.svg`
- [ ] Створити або завантажити `tcs.svg`

**Файли:**
```
frontend/public/images/logos/
├── adac.svg
├── autobild.svg
├── tyrereviews.svg
└── tcs.svg
```

**Вимоги до логотипів:**
- Формат: SVG (для чіткості на всіх екранах)
- Розмір: оптимізовані для 60x40px display
- Колір: нейтральний або з підтримкою dark mode

**Примітка:** Якщо офіційні логотипи недоступні, створити текстові placeholder:
```svg
<svg viewBox="0 0 60 40">
  <text x="30" y="25" text-anchor="middle" font-size="12" font-weight="bold">ADAC</text>
</svg>
```

---

### 2.4 Оновити TestResultCard для використання логотипів

- [ ] Оновити `TestResultCard.tsx` з Image компонентом
- [ ] Додати mapping source → logo path
- [ ] Додати fallback якщо логотип не знайдено

**Файли:** `frontend/src/components/TestResultCard.tsx`

**Logo mapping:**
```typescript
const sourceLogos: Record<string, string> = {
  adac: '/images/logos/adac.svg',
  autobild: '/images/logos/autobild.svg',
  tyrereviews: '/images/logos/tyrereviews.svg',
  tcs: '/images/logos/tcs.svg'
};
```

---

## Верифікація

- [ ] SeasonalHero показує правильний контент для поточного місяця
- [ ] Градієнти змінюються в залежності від сезону
- [ ] Quick Search форма працює в новому hero
- [ ] Логотипи відображаються в TestResultCard
- [ ] Fallback працює при помилці API
- [ ] Responsive design працює

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(frontend): add SeasonalHero and test source logos

   - Add SeasonalHero component with dynamic content
   - Add test source logos (ADAC, AutoBild, TyreReviews, TCS)
   - Update TestResultCard to display source logos
   - Integrate SeasonalHero on homepage"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Загальний прогрес: 9/24
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
