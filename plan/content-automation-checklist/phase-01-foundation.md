# Фаза 1: Foundation + Design Fixes

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-08
**Завершена:** 2026-01-08

## Ціль фази
Виправити проблеми контрастності UI, створити компонент Badge та налаштувати базову структуру системи автоматизації контенту.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути `globals.css` - поточні CSS змінні
- [x] Переглянути існуючі компоненти в `frontend/src/components/`
- [x] Переглянути структуру `backend/` для розуміння де створювати automation

**Команди для пошуку:**
```bash
# Поточні CSS змінні
cat frontend/src/app/globals.css | head -50

# Існуючі компоненти
ls frontend/src/components/

# Backend структура
ls backend/

# Існуючі API функції
ls frontend/src/lib/api/
```

#### B. Аналіз залежностей
- [x] Чи є вже Badge компонент? (шукати badge, chip, tag) → Немає, тільки inline стилі в TyreCard
- [x] Які залежності потрібні для scraper? (puppeteer, cheerio) → puppeteer або playwright
- [x] Які залежності потрібні для LLM? (@anthropic-ai/sdk) → @anthropic-ai/sdk

**Пошук існуючих компонентів:**
```bash
grep -r "Badge\|Chip\|Tag" frontend/src/components/
```

**Нові залежності (backend/content-automation):**
- puppeteer або playwright (scraping)
- @anthropic-ai/sdk (Claude API)
- better-sqlite3 (локальна БД)
- node-cron (scheduler)

#### C. Перевірка дизайну
- [x] Перевірити поточний контраст в dark theme → --muted: #9ca3af, --border: #27272a, --card: #18181b
- [x] Визначити де використовується `text-muted-foreground` → 12 файлів у frontend/src/app/
- [x] Знайти всі місця з `zinc-300` на темному фоні → 12 файлів у frontend/src/app/

**Команди:**
```bash
# Пошук muted-foreground
grep -r "muted-foreground" frontend/src/app/

# Пошук zinc-300 на темному фоні (hero секції)
grep -r "zinc-300" frontend/src/app/page.tsx
```

**Референс для бейджів:** Дизайн з ТЗ (section 14.4)

**Нотатки для перевикористання:** -

---

### 1.1 Fix contrast issues in globals.css

- [x] Оновити `--muted` в dark theme: `#9ca3af` → `#a1a1aa`
- [x] Оновити `--border` в dark theme: `#27272a` → `#3f3f46`
- [x] Оновити `--card` в dark theme: `#18181b` → `#1c1c1f`
- [x] Замінити `text-zinc-300` на `text-zinc-100` в hero секціях (page.tsx)
- [x] Перевірити контраст після змін (візуально або WCAG checker)

**Файли:**
- `frontend/src/app/globals.css`
- `frontend/src/app/page.tsx`

**Зміни в globals.css:**
```css
:root[data-theme="dark"] {
  --muted: #a1a1aa;           /* було #9ca3af */
  --muted-foreground: #a1a1aa;
  --border: #3f3f46;          /* було #27272a */
  --card: #1c1c1f;            /* було #18181b */
}
```

**Нотатки:** -

---

### 1.2 Create Badge component with variants

- [x] Створити файл `frontend/src/components/ui/Badge.tsx`
- [x] Імплементувати варіанти: winner, recommended, top3, category, eco
- [x] Імплементувати варіанти сезонів: summer, winter, allseason
- [x] Додати підтримку розмірів: sm, md, lg
- [x] Додати іконки (emoji або Lucide) → використано Lucide icons
- [x] Експортувати з `frontend/src/components/ui/index.ts` (створити якщо немає)

**Файли:**
- `frontend/src/components/ui/Badge.tsx` (новий)
- `frontend/src/components/ui/index.ts` (новий або оновити)

**Приклад використання:**
```tsx
<Badge variant="winner">🏆 Переможець ADAC 2024</Badge>
<Badge variant="recommended" size="sm">✓ Рекомендовано</Badge>
<Badge variant="summer">☀️ Літня</Badge>
```

**Нотатки:** -

---

### 1.3 Create EU Label Badge component

- [x] Створити файл `frontend/src/components/ui/EuLabelBadge.tsx`
- [x] Імплементувати кольори для A, B, C, D, E
- [x] Показувати тип (Wet Grip, Fuel, Noise) + значення
- [x] Компактний вигляд для карток → додано EuLabelGroup

**Файли:**
- `frontend/src/components/ui/EuLabelBadge.tsx` (новий)

**Приклад:**
```tsx
<EuLabelBadge type="wetGrip" value="A" />
<EuLabelBadge type="fuelEfficiency" value="B" />
<EuLabelBadge type="noise" value={71} />
```

**Нотатки:** -

---

### 1.4 Setup content-automation project structure

- [x] Створити папку `backend/content-automation/`
- [x] Ініціалізувати package.json (`npm init -y`)
- [x] Встановити TypeScript та налаштувати tsconfig.json
- [x] Створити структуру папок:
  ```
  backend/content-automation/
  ├── src/
  │   ├── scrapers/
  │   ├── processors/
  │   ├── publishers/
  │   ├── config/
  │   └── index.ts
  ├── data/
  │   └── .gitkeep
  ├── logs/
  │   └── .gitkeep
  ├── package.json
  └── tsconfig.json
  ```
- [x] Додати базові залежності → typescript, tsx, @types/node

**Файли:**
- `backend/content-automation/package.json`
- `backend/content-automation/tsconfig.json`
- `backend/content-automation/src/index.ts`

**Команди:**
```bash
cd backend
mkdir -p content-automation/src/{scrapers,processors,publishers,config}
mkdir -p content-automation/{data,logs}
cd content-automation
npm init -y
npm install typescript @types/node ts-node --save-dev
npx tsc --init
```

**Нотатки:** -

---

### 1.5 Implement ProKoleso scraper (basic)

- [x] Встановити puppeteer або playwright → puppeteer
- [x] Створити `src/scrapers/prokoleso.ts`
- [x] Імплементувати функцію `scrapeProkoleso()`:
  - Отримати список моделей Bridgestone
  - Витягти: name, slug, season, sizes, description, imageUrl
- [x] Створити тест-скрипт для перевірки → npm run scrape
- [x] Зберегти результат в JSON для аналізу → data/prokoleso-tires.json

**Файли:**
- `backend/content-automation/src/scrapers/prokoleso.ts`
- `backend/content-automation/src/scrapers/index.ts`

**URL для парсингу:**
```
https://prokoleso.ua/shiny/bridgestone/
```

**Очікувана структура даних:**
```typescript
interface ScrapedTire {
  name: string;
  slug: string;
  season: 'summer' | 'winter' | 'allseason';
  sizes: Array<{
    width: number;
    aspectRatio: number;
    diameter: number;
    country: string;
  }>;
  description: string;
  imageUrl: string;
  sourceUrl: string;
}
```

**Нотатки:** -

---

### 1.6 Basic LLM integration (Claude API)

- [x] Встановити `@anthropic-ai/sdk`
- [x] Створити `src/config/env.ts` для API keys
- [x] Створити `src/processors/llm-generator.ts`
- [x] Імплементувати базову функцію `generateContent(prompt)`
- [x] Протестувати з простим промптом → npm run generate
- [x] Додати обробку помилок та retry logic

**Файли:**
- `backend/content-automation/src/config/env.ts`
- `backend/content-automation/src/processors/llm-generator.ts`

**Приклад використання:**
```typescript
const content = await generateContent(`
  Напиши короткий опис шини Bridgestone Turanza 6 українською.
  Сезон: літня
  EU Label: A/A/69dB
`);
```

**Нотатки:** Потрібен ANTHROPIC_API_KEY в .env

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [ ] Не розпочата
   - [ ] В процесі
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Перевір що все працює:
   ```bash
   # Frontend з новими стилями
   cd frontend && npm run dev

   # Content automation
   cd backend/content-automation && npx ts-node src/index.ts
   ```
5. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(content-automation): phase-1 foundation completed

   - Fix contrast issues in dark theme
   - Add Badge and EuLabelBadge components
   - Setup content-automation project structure
   - Implement ProKoleso scraper
   - Add basic Claude API integration"
   ```
6. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Статус Phase 1: ✅ Завершена
   - Додай запис в історію
7. Відкрий `phase-02-content-generation.md` та продовж роботу
