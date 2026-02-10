# Фаза 1: P1 -- Оптимізація зображень

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Оптимізувати критичні зображення: сконвертувати og-image.jpg (1.7 MB) у WebP (< 200 KB), сконвертувати hero PNG зображення шин у WebP (економія ~150 KB), оновити всі посилання на нові файли.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Перевірити розмір og-image.jpg — 1.7 MB
- [x] Перевірити розміри hero PNG файлів — blizzak 150K, turanza 125K, turanza-all-season 182K
- [x] Знайти всі місця де og-image використовується — layout.tsx, constants.ts, about/layout.tsx
- [x] Знайти всі місця де hero PNG імпортуються — SeasonalHero.tsx

#### B. Аналіз залежностей
- [x] Чи встановлено cwebp або sharp для конвертації? — sharp-cli доступний через npx
- [x] Чи підтримує Next.js config формат WebP для OG image? — так
- [x] Чи є already existing WebP hero backgrounds — так (hero-passenger.webp, hero-winter.webp тощо)

#### C. Перевірка дизайну
- [x] OG-image має бути 1200x630 (стандарт Open Graph)
- [x] Hero зображення мають зберігати якість (шини з деталями)

---

### 1.1 Сконвертувати og-image.jpg у WebP
- [x] Конвертувати за допомогою sharp-cli: quality 80
- [x] Результат: 141 KB (з 1.7 MB — економія 92%)
- [x] Перевірити розмір результату (< 200 KB) — ✓

**Файли:** `frontend/public/og-image.jpg` -> `frontend/public/og-image.webp`

---

### 1.2 Оновити посилання на og-image
- [x] layout.tsx: замінено '/og-image.jpg' на '/og-image.webp' (2 місця)
- [x] constants.ts: замінено OG_IMAGE
- [x] about/layout.tsx: замінено og-image посилання
- [x] Перевірено що не залишилось жодного посилання на og-image.jpg

**Файли:** `frontend/src/app/layout.tsx`, `frontend/src/lib/constants.ts`, `frontend/src/app/about/layout.tsx`

---

### 1.3 Конвертувати blizzak-hero.png у WebP
- [x] Конвертовано за допомогою sharp-cli: quality 85
- [x] Результат: 30 KB (з 150 KB — економія 80%)
- [x] Якість зображення збережена

**Файли:** `frontend/public/images/hero/blizzak-hero.png` -> `.webp`

---

### 1.4 Конвертувати turanza-hero.png та turanza-all-season-hero.png у WebP
- [x] turanza-hero.webp: 27 KB (з 125 KB — економія 78%)
- [x] turanza-all-season-hero.webp: 34 KB (з 182 KB — економія 81%)
- [x] Якість та розміри перевірено

**Файли:** `frontend/public/images/hero/turanza-hero.png`, `turanza-all-season-hero.png` -> `.webp`

---

### 1.5 Оновити import-и hero зображень у компонентах
- [x] SeasonalHero.tsx: оновлено всі 4 шляхи .png → .webp
- [x] Перевірено що не залишилось жодного посилання на hero .png файли
- [x] TypeScript компіляція проходить без помилок

**Файли:** `frontend/src/components/SeasonalHero.tsx`
**Нотатки:** Старі PNG файли залишено як fallback.

---

## Підсумок оптимізації

| Файл | До | Після | Економія |
|------|-----|-------|----------|
| og-image | 1.7 MB | 141 KB | 92% |
| blizzak-hero | 150 KB | 30 KB | 80% |
| turanza-hero | 125 KB | 27 KB | 78% |
| turanza-all-season-hero | 182 KB | 34 KB | 81% |
| **Разом** | **2.16 MB** | **232 KB** | **89%** |
