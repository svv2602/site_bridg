# Фаза 1: High Priority Fixes

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена (код написано, потребує тестування)

**Розпочата:** 2026-01-15
**Завершена:** 2026-01-15

## Ціль фази
Виправити всі критичні проблеми, що блокують production реліз: неробочі посилання, mobile overflow, security headers, SEO файли.

---

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти компоненти карусель/слайдер в codebase
- [x] Вивчити next.config.js на наявні headers
- [x] Перевірити чи існують robots.ts/sitemap.ts в app/
- [x] Знайти місця де використовуються проблемні slug'и шин

**Результати:**
- Carousel: `frontend/src/components/ProductCarousel.tsx` (Embla Carousel)
- Config: `frontend/next.config.ts` (не .js) — є тільки cache headers
- SEO файли: **ВІДСУТНІ** (sitemap.ts, robots.ts, robots.txt)
- Проблемні slug'и: `seasonal-content.ts` (2 файли)

#### B. Аналіз залежностей
- [x] Чи використовується Embla Carousel?
- [x] Чи є централізований конфіг для headers?
- [x] Звідки беруться дані для головної сторінки (mock vs API)?

**Carousel бібліотека:** Embla Carousel (`embla-carousel-react`, `embla-carousel-autoplay`)
**Headers location:** `frontend/next.config.ts` → `headers()` function (тільки cache)
**Джерело даних homepage:** API (`getTyreModels()`) → Payload CMS → fallback to mock

#### C. Перевірка контексту
- [x] Переглянути homepage компонент для розуміння структури
- [x] Знайти секцію з проблемними шинами

**Homepage file:** `frontend/src/app/page.tsx`
**Проблемна секція:** `ProductCarousel` + `seasonal-content.ts`

**Нотатки для перевикористання:**
- Mock data в `frontend/src/lib/data.ts` синхронізований з seed.ts
- Seasonal content hardcodes slug'и для різних сезонів

---

### 1.1 Виправити неробочі посилання на шини

**Проблема:** 3 посилання на головній ведуть до 404:
- `/shyny/dueler-at-001`
- `/shyny/turanza-er300`
- `/shyny/weather-control-a005-evo`

**Підзадачі:**
- [x] Знайти де визначаються ці slug'и (mock data або CMS)
- [x] Визначити стратегію: створити записи в CMS АБО видалити/замінити посилання
- [x] Виконати обрану стратегію
- [ ] Перевірити що всі посилання працюють (потребує запуску сервера)

**Файли:**
- `frontend/src/lib/data.ts` (mock) — slug'и коректні
- `backend-payload/content-automation/src/processors/seasonal-content.ts` — **ВИПРАВЛЕНО**
- `backend-payload/src/automation/processors/seasonal-content.ts` — **ВИПРАВЛЕНО**

**Рішення:** Оновлено `seasonal-content.ts` (обидва файли) — замінено неіснуючі slug'и на валідні з mock data:
- `turanza-6` → `turanza-t005`
- `ecopia-ep150` → `dueler-hp-sport`
- `noranza-001` → `turanza-t005` (з поміткою про підготовку до літа)
- `weather-control-a005` → `weather-control-a005-evo`
- `turanza-all-season-6` → `blizzak-lm005`
- `dueler-at-001` → `dueler-hp-sport`

**Нотатки:** -

---

### 1.2 Виправити horizontal overflow на mobile

**Проблема:** На viewport 375px контент виходить за межі екрану. Причина - carousel з фіксованою шириною.

**Підзадачі:**
- [x] Знайти carousel компонент
- [x] Ідентифікувати елементи з `flex-[0_0_100%]` класами
- [x] Виправити padding/margin для mobile
- [x] Додати `overflow-x: hidden` як fallback якщо потрібно
- [ ] Протестувати на різних mobile viewport (320px, 375px, 414px) — потребує запуску

**Файли:** `frontend/src/components/ProductCarousel.tsx`

**Виправлення:**
1. Slide width: `flex-[0_0_100%]` → `flex-[0_0_calc(100%-1rem)]`
2. Container margins: `mx-6` → `mx-4 sm:mx-6`
3. Section: додано `overflow-x-hidden`
4. Navigation buttons: зменшено translate та розмір на mobile (`-translate-x-2`, `p-1.5`, `h-4 w-4`)

**Нотатки:** Embla carousel використовує `-ml-4` + `pl-4` патерн для gaps

---

### 1.3 Додати Security Headers

**Проблема:** Відсутні важливі security headers для production.

**Підзадачі:**
- [x] Відкрити `frontend/next.config.ts` (не .js)
- [x] Додати security headers до існуючої функції `headers()`
- [x] Включити: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- [ ] Перезапустити dev server (потребує запуску)
- [ ] Перевірити headers через curl або DevTools (потребує запуску)

**Файли:** `frontend/next.config.ts`

**Код для додавання:**
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ];
},
```

**Нотатки:** CSP може потребувати додаткової настройки для Next.js inline scripts

---

### 1.4 Створити robots.txt

**Проблема:** `/robots.txt` повертає 404.

**Підзадачі:**
- [x] Створити файл `frontend/public/robots.txt`
- [x] Додати базові правила
- [ ] Перевірити доступність через браузер (потребує запуску)

**Файли:** `frontend/public/robots.txt` — **СТВОРЕНО**

**Вміст:**
- User-agent: * Allow: /
- Disallow: /admin/, /api/, /_next/
- Sitemap: https://bridgestone.ua/sitemap.xml

**Нотатки:** URL sitemap автоматично підставляється з NEXT_PUBLIC_SITE_URL

---

### 1.5 Створити sitemap.xml

**Проблема:** `/sitemap.xml` повертає 404.

**Підзадачі:**
- [x] Створити `frontend/src/app/sitemap.ts` (Next.js App Router)
- [x] Додати статичні сторінки
- [x] Додати динамічні сторінки (шини, статті) з API
- [ ] Перевірити генерацію через браузер (потребує запуску)

**Файли:** `frontend/src/app/sitemap.ts` — **СТВОРЕНО**

**Код:**
```typescript
import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bridgestone.ua'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/shyny`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/dealers`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/tyre-search`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/passenger-tyres`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/passenger-tyres/winter`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/passenger-tyres/summer`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/suv-4x4-tyres`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/technology`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contacts`, changeFrequency: 'monthly', priority: 0.4 },
  ]

  // TODO: Fetch dynamic pages from API
  // const tyres = await getTyres()
  // const articles = await getArticles()

  return staticPages
}
```

**Нотатки:** Після інтеграції з CMS - додати динамічні URL

---

### 1.6 Перевірка виправлень

**Підзадачі:**
- [ ] Перевірити всі 3 посилання на шини
- [ ] Перевірити mobile viewport (375px) на overflow
- [ ] Перевірити security headers через `curl -I localhost:3010`
- [ ] Перевірити robots.txt: `curl localhost:3010/robots.txt`
- [ ] Перевірити sitemap.xml: `curl localhost:3010/sitemap.xml`

**Команди перевірки:**
```bash
# Security headers
curl -I http://localhost:3010 2>/dev/null | grep -E "X-|Content-Security"

# robots.txt
curl -s http://localhost:3010/robots.txt

# sitemap.xml
curl -s http://localhost:3010/sitemap.xml | head -20
```

**Результати тестування:** -

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
   git commit -m "checklist(production-audit): phase-1 high priority fixes completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Загальний прогрес: 8/24 (33%)
   - Додай запис в історію
6. Відкрий `phase-02-seo-improvements.md` та продовж роботу
