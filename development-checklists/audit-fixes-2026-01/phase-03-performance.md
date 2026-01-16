# Фаза 3: Performance

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-16
**Завершена:** 2026-01-16

## Ціль фази
Оптимізувати hero images та інші performance-критичні елементи.

## Пріоритет
**P0-P1** - великі зображення суттєво впливають на завантаження

---

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування ✅

#### A. Аналіз поточних зображень
- [x] Знайти всі hero images
- [x] Перевірити їх розміри
- [x] Визначити цільові розміри (max 300KB per image)

**Результат аналізу:**
- Hero директорія: 12 MB
- 7 JPG файлів по 1.3-2.3 MB кожен
- 3 PNG файли по 125-182 KB (вже оптимізовані)

#### B. Інструменти для оптимізації
- [x] Використано sharp (вбудований в Next.js)

---

### 3.1 Оптимізувати hero images (P0) ✅

**Проблема:** Hero images ~12 MB сумарно (1.3-2.3 MB кожне)

**Локація:** `frontend/public/images/hero/`

**Цільові метрики:**
- Кожне зображення: max 300 KB ✅
- Формат: WebP ✅
- Роздільність: max 1920x1080 для desktop ✅

- [x] Конвертувати в WebP формат
- [x] Зменшити роздільність до 1920px ширина
- [x] Стиснути з якістю 85%
- [x] Перевірити візуальну якість після стиснення
- [x] Оновити посилання в компонентах
- [x] Видалити старі JPG файли

**Результат:**
| Файл | До | Після |
|------|-----|-------|
| hero-lcv | 1.23 MB | 75 KB |
| hero-allseason | 1.72 MB | 196 KB |
| hero-passenger | 1.67 MB | 175 KB |
| hero-dealer-service | 2.21 MB | 163 KB |
| hero-suv | 1.24 MB | 94 KB |
| hero-winter | 1.33 MB | 109 KB |
| hero-summer | 1.43 MB | 131 KB |
| **TOTAL** | **10.8 MB** | **943 KB** |

**Зменшення: 91%** (12 MB → 1.4 MB включаючи PNG файли)

**Оновлені файли:**
- `frontend/src/app/passenger-tyres/[season]/page.tsx`
- `frontend/src/app/passenger-tyres/page.tsx`
- `frontend/src/app/dealers/page.tsx`
- `frontend/src/app/suv-4x4-tyres/page.tsx`
- `frontend/src/app/lcv-tyres/page.tsx`

---

### 3.2 Додати dynamic imports для важких компонентів (P1) ✅

**Проблема:** Деякі важкі компоненти завантажуються синхронно

**Аналіз кандидатів:**
- VehicleTyreSelector (892 рядки) - на окремій client-side сторінці, динамік не допоможе
- QuickSearchForm (596 рядків) - в hero (above fold), не підходить для lazy loading
- ProductCarousel (131 рядків) - одразу після hero, не підходить
- DealersMap - вже використовує dynamic()
- **DealerLocatorCompact (136 рядків)** - в кінці homepage, below fold ✅

- [x] Перевірити які компоненти вже використовують dynamic()
- [x] Додати dynamic import для DealerLocatorCompact
- [x] Додати loading fallback

**Виправлення:**
```typescript
// frontend/src/app/page.tsx
const DealerLocatorCompact = dynamic(
  () => import("@/components/DealerLocatorCompact").then(mod => mod.DealerLocatorCompact),
  {
    loading: () => (
      <section className="py-12 bg-stone-50 dark:bg-stone-900/50">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="h-64 animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
        </div>
      </section>
    ),
  }
);
```

---

### 3.3 Додати Cyrillic font subset (P1) ✅

**Проблема:** Шрифти включали тільки latin subset

**Локація:** `frontend/src/app/layout.tsx`

- [x] Перевірити конфігурацію next/font
- [x] Додати subset: ['latin', 'cyrillic']
- [x] Додати display: 'swap' для кращого CLS
- [x] Перевірити що українські символи рендеряться коректно

**Виправлення:**
```typescript
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});
```

**Примітка:** Geist шрифт підтримує кирилицю з 2024 року (Belarusian, Bulgarian, Chechen, Macedonian, Russian, Serbian, Ukrainian, Uzbek).

---

## При завершенні фази

Виконай наступні дії:

1. ✅ Переконайся, що всі задачі відмічені [x]
2. ✅ Зміни статус фази: Завершена
3. ✅ Заповни дату "Завершена: 2026-01-16"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(audit-fixes): phase-3 performance completed

   - Optimize hero images (12MB -> 1.4MB, 88% reduction)
   - Convert JPG to WebP format
   - Add dynamic import for DealerLocatorCompact
   - Add cyrillic font subset with display:swap"
   ```
5. ✅ Онови PROGRESS.md
6. Відкрий наступну фазу
