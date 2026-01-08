# Фаза 2: Content Generation

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-08
**Завершена:** 2026-01-08

## Ціль фази
Створити повний pipeline генерації контенту: від парсингу даних до публікації в Strapi CMS з автоматичним присвоєнням бейджів.

## Попередні вимоги
- ✅ Phase 1 завершена
- ProKoleso scraper працює
- Claude API інтегровано
- Badge компоненти створені

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути існуючі Strapi content types (`backend/src/api/`) → article, dealer, technology, tyre, vehicle-fitment
- [x] Переглянути існуючий `lib/api/strapi.ts` → базові API (getStrapiTyres, getStrapiTyreBySlug, transformStrapiData)
- [x] Переглянути як TyreCard використовує дані → EU Label inline стилі, сезонні бейджі, без test badges

**Команди для пошуку:**
```bash
# Strapi content types
ls backend/src/api/

# Tyre schema
cat backend/src/api/tyre/content-types/tyre/schema.json

# Існуючий Strapi клієнт
cat frontend/src/lib/api/strapi.ts | head -100

# TyreCard компонент
cat frontend/src/components/TyreCard.tsx
```

#### B. Аналіз залежностей
- [x] Чи потрібно оновити Tyre schema для badges? → ТАК, немає поля badges
- [x] Чи потрібен новий content type Test? → НІ, badges зберігати як component
- [x] Які поля потрібні для генерованого контенту? → shortDescription, fullDescription, keyBenefits, seoTitle, seoDescription

**Зміни в Strapi:**
- Tyre: додати `badges` component (repeatable)
- Article: додати `relatedTyres` relation
- Test: новий content type (опціонально)

#### C. Перевірка промптів
- [x] Підготувати промпт для опису шин → spec.md section 3.1
- [x] Підготувати промпт для статей → spec.md section 3.2
- [x] Визначити структуру output (JSON) → GeneratedTireContent interface

**Референс промптів:** `/plan/content-automation-spec.md` (section 3.1, 3.2)

**Нотатки для перевикористання:** TyreCard потребує рефакторингу EU Label на EuLabelBadge компонент

---

### 2.1 Create tire description generator

- [x] Створити `src/processors/tire-description-generator.ts`
- [x] Імплементувати промпт для shortDescription (2-3 речення)
- [x] Імплементувати промпт для fullDescription (300-500 слів)
- [x] Імплементувати генерацію keyBenefits (4-5 пунктів)
- [x] Імплементувати генерацію seoTitle та seoDescription
- [x] Додати парсинг JSON відповіді від LLM
- [x] Тестувати з реальними даними від scraper → npm run generate:tire

**Файли:**
- `backend/content-automation/src/processors/tire-description-generator.ts`
- `backend/content-automation/src/config/prompts.ts`

**Структура output:**
```typescript
interface GeneratedTireContent {
  shortDescription: string;      // 150-200 chars
  fullDescription: string;       // 300-500 words, markdown
  keyBenefits: string[];         // 4-5 items
  seoTitle: string;              // 50-60 chars
  seoDescription: string;        // 150-160 chars
}
```

**Нотатки:** Додано generateBatchTireContent для пакетної генерації з retry logic

---

### 2.2 Integrate EU Label colors in frontend

- [x] Оновити TyreCard для відображення EU Label з кольорами
- [x] Використати EuLabelBadge компонент (з Phase 1)
- [x] Оновити сторінку шини `/shyny/[slug]/page.tsx`
- [x] Показувати EU Label в компактному вигляді на картках
- [x] Показувати детальний EU Label на сторінці шини

**Файли:**
- `frontend/src/components/TyreCard.tsx`
- `frontend/src/app/shyny/[slug]/page.tsx`

**Приклад відображення:**
```
Картка: 🟢A 🟢A 69dB
Сторінка: Мокре зчеплення: A | Паливо: A | Шум: 69 dB
```

**Нотатки:** Використано EuLabelGroup для карток, EuLabelBadge size="lg" для сторінки

---

### 2.3 Create technology icons component

- [x] Створити `frontend/src/components/ui/TechnologyIcon.tsx`
- [x] Визначити маппінг технологій на іконки та кольори
- [x] Імплементувати компоненти:
  - ENLITEN → Leaf (green)
  - Run-Flat → Shield (blue)
  - Noise Reduction → Volume2 (purple)
  - Wet Grip → Droplets (cyan)
  - Winter Compound → Snowflake (blue)
- [x] Інтегрувати в TyreCard та сторінку шини

**Файли:**
- `frontend/src/components/ui/TechnologyIcon.tsx`
- `frontend/src/components/TyreCard.tsx` (оновити)

**Маппінг:**
```typescript
const techIcons = {
  'enliten': { icon: Leaf, color: 'text-green-500', bg: 'bg-green-500/10' },
  'run-flat': { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  'noise-reduction': { icon: Volume2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  'wet-grip': { icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  'winter-compound': { icon: Snowflake, color: 'text-blue-400', bg: 'bg-blue-400/10' },
};
```

**Нотатки:** Додано TechnologyGroup для карток, normalizeSlug для flexible matching

---

### 2.4 Implement test badge assignment logic

- [x] Створити `src/processors/badge-assigner.ts`
- [x] Імплементувати логіку присвоєння бейджів:
  - Winner: position === 1
  - Recommended: rating <= 2.0 (ADAC) або "gut" (AutoBild)
  - Top 3: position 2-3
  - Best Category: categoryWins
- [x] Імплементувати фільтрацію старих бейджів (>3 років)
- [x] Імплементувати пріоритизацію бейджів
- [x] Створити SQLite таблицю для зберігання бейджів

**Файли:**
- `backend/content-automation/src/processors/badge-assigner.ts`
- `backend/content-automation/src/db/schema.sql` (новий)

**Логіка пріоритету:**
```typescript
const priorities = {
  winner: 1,
  recommended: 2,
  top3: 3,
  best_category: 4,
  eco: 5
};
```

**Нотатки:** Додано getTopBadge, prioritizeBadges, generateBadgeLabel для української локалізації

---

### 2.5 Create Strapi publisher

- [x] Створити `src/publishers/strapi-client.ts`
- [x] Імплементувати функцію `publishTyre(content)`:
  - Перевірити чи шина існує (by slug)
  - Якщо існує — оновити
  - Якщо ні — створити
- [x] Імплементувати функцію `publishArticle(article)`
- [x] Імплементувати функцію `updateTyreBadges(slug, badges)`
- [x] Додати обробку помилок та логування

**Файли:**
- `backend/content-automation/src/publishers/strapi-client.ts`
- `backend/content-automation/src/publishers/index.ts`

**API Endpoints:**
```typescript
// Strapi REST API
POST /api/tyres          // Create
PUT /api/tyres/:id       // Update
GET /api/tyres?filters[slug][$eq]=blizzak-lm005  // Find by slug

POST /api/articles
PUT /api/articles/:id
```

**Нотатки:** Додано batch publishing з delay, singleton pattern для client

---

### 2.6 Update Strapi Tyre schema for badges

- [x] Створити component `award.badge` в Strapi
- [x] Додати поле `badges` до Tyre content type
- [x] Додати поле `testResults` (relation або JSON) → keyBenefits, seoTitle, seoDescription
- [ ] Перегенерувати types для frontend → потрібен перезапуск Strapi

**Файли:**
- `backend/src/components/award/badge.json` (новий)
- `backend/src/api/tyre/content-types/tyre/schema.json` (оновити)

**Badge component schema:**
```json
{
  "collectionName": "components_award_badges",
  "info": { "displayName": "Badge", "icon": "trophy" },
  "attributes": {
    "type": {
      "type": "enumeration",
      "enum": ["winner", "recommended", "top3", "best_category", "eco"]
    },
    "source": {
      "type": "enumeration",
      "enum": ["adac", "autobild", "tyrereviews", "tcs"]
    },
    "year": { "type": "integer" },
    "testType": { "type": "enumeration", "enum": ["summer", "winter", "allseason"] },
    "label": { "type": "string" }
  }
}
```

**Нотатки:** Додано badges, keyBenefits, seoTitle, seoDescription до Tyre schema. Потрібен перезапуск Strapi.

---

### 2.7 Display badges on TyreCard

- [x] Оновити TyreCard для відображення топового бейджа
- [x] Показувати бейдж у верхньому правому куті
- [x] Використати Badge компонент з Phase 1
- [x] Оновити сторінку шини для показу всіх бейджів → типи додані до data.ts
- [ ] Додати секцію "Результати тестів" на сторінку шини → буде в Phase 3

**Файли:**
- `frontend/src/components/TyreCard.tsx`
- `frontend/src/app/shyny/[slug]/page.tsx`
- `frontend/src/lib/data.ts` - додані TyreBadge types

**Приклад TyreCard:**
```tsx
<div className="relative">
  {topBadge && (
    <div className="absolute top-2 right-2">
      <Badge variant={topBadge.type} size="sm">
        {topBadge.label}
      </Badge>
    </div>
  )}
  {/* rest of card */}
</div>
```

**Нотатки:** Додано getTopBadge функцію з фільтрацією бейджів >3 років

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Протестуй повний pipeline:
   ```bash
   # 1. Scrape ProKoleso
   cd backend/content-automation
   npx ts-node src/scrapers/prokoleso.ts

   # 2. Generate content
   npx ts-node src/processors/tire-description-generator.ts

   # 3. Publish to Strapi
   npx ts-node src/publishers/strapi-client.ts

   # 4. Check frontend
   cd frontend && npm run dev
   # Відкрити /shyny/[slug] та перевірити badges
   ```
3. Зміни статус фази на "Завершена"
4. Заповни дату "Завершена: YYYY-MM-DD"
5. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(content-automation): phase-2 content generation completed

   - Add tire description generator with LLM
   - Integrate EU Label colors
   - Add technology icons
   - Implement badge assignment logic
   - Create Strapi publisher
   - Display badges on TyreCard"
   ```
6. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Статус Phase 2: ✅ Завершена
7. Відкрий `phase-03-advanced-features.md` та продовж роботу
