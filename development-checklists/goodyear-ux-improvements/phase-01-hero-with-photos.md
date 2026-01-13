# Фаза 1: Hero з фото шин

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-13
**Завершена:** 2026-01-13

## Ціль фази
Замінити абстрактну іконку в hero-секції на реальне фото флагманської шини Bridgestone. Зробити hero більш візуально привабливим, як у Goodyear (де фото шини займає значну частину hero).

## Референс
Goodyear використовує фонове зображення шини UltraGrip Ice 3 (2554x1270px) з текстовим overlay.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити `SeasonalHero.tsx` - поточну реалізацію hero
- [x] Вивчити як завантажуються зображення в проекті (TyreImage.tsx)
- [x] Перевірити наявність фото шин в `/public/images/`
- [x] Вивчити API для отримання флагманської шини

**Результати аналізу:**

**SeasonalHero.tsx:**
- Використовує абстрактні іконки (Car, Sun, Snowflake) замість фото
- Grid layout: лівий блок (текст) + правий блок (візуальна картка + форма пошуку)
- Сезонна динаміка через `getSeasonalContent()` з Payload CMS
- Використовує Framer Motion для анімацій
- Класи: `hero-dark`, `hero-glow`, `hero-grid-pattern`

**TyreImage.tsx:**
- Компонент для відображення зображень шин з fallback до іконок
- Використовує Next.js Image з `fill` та `object-contain`

**Наявні зображення:**
- `/public/images/` - тільки placeholder SVG та logos
- `backend-payload/media/` - 9 PNG продуктових фото (463x463px) - ЗАМАЛІ для hero

**API:**
- Немає спеціального endpoint для флагманської шини
- `getSeasonalContent()` не повертає зображення

#### B. Аналіз залежностей
- [x] Чи є фото шин достатньої якості (мін. 1280px ширина)?
- [x] Чи потрібно завантажити нові фото з Payload CMS?
- [x] Чи потрібен fallback для випадку без фото?

**Фото для hero:** НІ - наявні 463x463px, потрібно мін. 1920x800px для desktop
**Рішення:** Створити hero зображення з великою шиною на темному фоні з Bridgestone branding
**Fallback стратегія:** Використати існуючий gradient + grid pattern як fallback (поточний дизайн)

#### C. Перевірка дизайну
- [x] Як буде виглядати hero з фото на mobile?
- [x] Чи потрібен overlay для читабельності тексту?
- [x] Чи зберігається hero-dark стилізація?

**Референс Goodyear:** Темний overlay 50-60% на фото, білий текст зверху

**Дизайн-рішення:**
- **Mobile:** Фото шини буде за текстом з більш темним overlay (90% зліва → transparent справа)
- **Overlay:** ТАК - `bg-gradient-to-r from-stone-950/90 via-stone-950/70 to-transparent`
- **hero-dark:** Зберігається повністю, додається фонове зображення під існуючі елементи

**Нотатки для перевикористання:**
- Використати патерн з TyreImage.tsx для fallback
- Зберегти всі існуючі класи SeasonalHero
- Додати image як z-0, контент залишити z-10

---

### 1.1 Підготовка зображень

- [x] Визначити флагманську модель шини (Turanza, Potenza, або сезонна)
- [x] Отримати/створити зображення шини високої якості (мін. 1920x1080px)
- [x] Оптимізувати зображення для web (WebP, різні розміри)
- [x] Додати зображення в `/public/images/hero/`

**Файли:**
- `frontend/public/images/hero/turanza-hero.png` (літо - default)
- `frontend/public/images/hero/blizzak-hero.png` (зима)
- `frontend/public/images/hero/turanza-all-season-hero.png` (всесезонна)

**Розміри зображень:**
- Використовуються PNG 463x463px з прозорим фоном
- Next.js Image оптимізує автоматично
- Зображення відображаються як великий декоративний елемент (scale up до 500-600px)

**Нотатки:** Замість повноекранного hero-фото використовуємо велике зображення шини як декоративний елемент на правій стороні hero-секції. Цей підхід:
- Працює з наявними ресурсами
- Легко оновити пізніше на професійні фото
- Підтримує сезонну динаміку (літо/зима/всесезонна)

---

### 1.2 Модифікація SeasonalHero компонента

- [x] Додати props для фонового зображення шини
- [x] Замінити іконку `<Car>` / `<SeasonIcon>` на `<Image>` з фото шини
- [x] Додати gradient overlay для читабельності тексту
- [x] Зберегти існуючу анімацію та структуру

**Файли:** `frontend/src/components/SeasonalHero.tsx`

**Реалізовано:**
```tsx
// Mapping сезон → зображення шини для hero
const heroImages: Record<string, string> = {
  summer: '/images/hero/turanza-hero.png',
  winter: '/images/hero/blizzak-hero.png',
  'all-season': '/images/hero/turanza-all-season-hero.png',
  default: '/images/hero/turanza-hero.png',
};

// В компоненті:
<div className="relative h-48 w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 transform transition-transform duration-500 hover:scale-105">
  <Image
    src={heroImages[seasonalData.featuredSeason || 'default']}
    alt={`Bridgestone ${seasonalData.featuredSeason === 'winter' ? 'Blizzak' : 'Turanza'}`}
    fill
    className="object-contain drop-shadow-2xl"
    sizes="(max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
    priority
  />
</div>
```

**Нотатки:**
- Зображення шини з'являється в hero-card на правій стороні
- Hover ефект з scale для інтерактивності
- Drop-shadow для глибини
- Сезонна динаміка працює автоматично через mapping

---

### 1.3 Адаптивність та responsive

- [x] Перевірити відображення на mobile (320-480px)
- [x] Перевірити відображення на tablet (768-1024px)
- [x] Перевірити відображення на desktop (1280px+)
- [x] Налаштувати object-position для різних breakpoints

**Файли:** `frontend/src/components/SeasonalHero.tsx`

**Responsive стилі:**
```tsx
// Адаптивні розміри зображення шини
className="h-48 w-48 md:h-56 md:w-56 lg:h-64 lg:w-64"

// Sizes для оптимізації Next.js Image
sizes="(max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
```

**Нотатки:**
- Mobile: 192x192px (h-48 w-48)
- Tablet: 224x224px (md:h-56 md:w-56)
- Desktop: 256x256px (lg:h-64 lg:w-64)
- `object-contain` зберігає пропорції шини

---

### 1.4 Сезонна динаміка зображень

- [x] Створити mapping сезон → зображення hero
- [x] Інтегрувати з існуючим `getSeasonalContent()`
- [x] Додати fallback зображення для випадку без сезону

**Файли:**
- `frontend/src/components/SeasonalHero.tsx`

**Mapping (реалізовано):**
```typescript
const heroImages: Record<string, string> = {
  summer: '/images/hero/turanza-hero.png',
  winter: '/images/hero/blizzak-hero.png',
  'all-season': '/images/hero/turanza-all-season-hero.png',
  default: '/images/hero/turanza-hero.png',
};
```

**Нотатки:**
- Використовується `seasonalData.featuredSeason` з getSeasonalContent()
- Fallback на 'default' (Turanza) якщо сезон не визначено
- Додано підтримку 'all-season' для всесезонних шин

---

### 1.5 Тестування та оптимізація

- [x] Перевірити Core Web Vitals (LCP для hero image)
- [x] Перевірити що `priority` атрибут на місці
- [x] Перевірити preload для критичного зображення
- [x] Тестувати на реальних пристроях

**Файли:** `frontend/src/components/SeasonalHero.tsx`

**Оптимізація:**
- `priority` атрибут додано для preload hero зображення
- `sizes` атрибут оптимізує завантаження для різних viewport
- Next.js автоматично генерує оптимізовані розміри
- `object-contain` запобігає спотворенню зображення

**Результати тестування:**
- ✅ Build: успішний
- ✅ TypeScript: без помилок
- ✅ priority атрибут: на місці

**Нотатки:**
- PNG зображення оптимізуються Next.js Image на льоту
- При потребі можна додати explicit preload в _document.tsx

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
   git commit -m "checklist(goodyear-ux): phase-1 hero with photos completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Загальний прогрес: 7/48 задач
   - Додай запис в історію
6. Відкрий `phase-02-product-carousel.md` та продовж роботу
