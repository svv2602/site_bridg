# Фаза 2: Content Generation

## Статус
- [x] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

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
- [ ] Переглянути існуючі Strapi content types (`backend/src/api/`)
- [ ] Переглянути існуючий `lib/api/strapi.ts`
- [ ] Переглянути як TyreCard використовує дані

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
- [ ] Чи потрібно оновити Tyre schema для badges?
- [ ] Чи потрібен новий content type Test?
- [ ] Які поля потрібні для генерованого контенту?

**Зміни в Strapi:**
- Tyre: додати `badges` component (repeatable)
- Article: додати `relatedTyres` relation
- Test: новий content type (опціонально)

#### C. Перевірка промптів
- [ ] Підготувати промпт для опису шин
- [ ] Підготувати промпт для статей
- [ ] Визначити структуру output (JSON)

**Референс промптів:** `/plan/content-automation-spec.md` (section 3.1, 3.2)

**Нотатки для перевикористання:** -

---

### 2.1 Create tire description generator

- [ ] Створити `src/processors/tire-description-generator.ts`
- [ ] Імплементувати промпт для shortDescription (2-3 речення)
- [ ] Імплементувати промпт для fullDescription (300-500 слів)
- [ ] Імплементувати генерацію keyBenefits (4-5 пунктів)
- [ ] Імплементувати генерацію seoTitle та seoDescription
- [ ] Додати парсинг JSON відповіді від LLM
- [ ] Тестувати з реальними даними від scraper

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

**Нотатки:** -

---

### 2.2 Integrate EU Label colors in frontend

- [ ] Оновити TyreCard для відображення EU Label з кольорами
- [ ] Використати EuLabelBadge компонент (з Phase 1)
- [ ] Оновити сторінку шини `/shyny/[slug]/page.tsx`
- [ ] Показувати EU Label в компактному вигляді на картках
- [ ] Показувати детальний EU Label на сторінці шини

**Файли:**
- `frontend/src/components/TyreCard.tsx`
- `frontend/src/app/shyny/[slug]/page.tsx`

**Приклад відображення:**
```
Картка: 🟢A 🟢A 69dB
Сторінка: Мокре зчеплення: A | Паливо: A | Шум: 69 dB
```

**Нотатки:** -

---

### 2.3 Create technology icons component

- [ ] Створити `frontend/src/components/ui/TechnologyIcon.tsx`
- [ ] Визначити маппінг технологій на іконки та кольори
- [ ] Імплементувати компоненти:
  - ENLITEN → Leaf (green)
  - Run-Flat → Shield (blue)
  - Noise Reduction → Volume2 (purple)
  - Wet Grip → Droplets (cyan)
  - Winter Compound → Snowflake (blue)
- [ ] Інтегрувати в TyreCard та сторінку шини

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

**Нотатки:** -

---

### 2.4 Implement test badge assignment logic

- [ ] Створити `src/processors/badge-assigner.ts`
- [ ] Імплементувати логіку присвоєння бейджів:
  - Winner: position === 1
  - Recommended: rating <= 2.0 (ADAC) або "gut" (AutoBild)
  - Top 3: position 2-3
  - Best Category: categoryWins
- [ ] Імплементувати фільтрацію старих бейджів (>3 років)
- [ ] Імплементувати пріоритизацію бейджів
- [ ] Створити SQLite таблицю для зберігання бейджів

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

**Нотатки:** -

---

### 2.5 Create Strapi publisher

- [ ] Створити `src/publishers/strapi-client.ts`
- [ ] Імплементувати функцію `publishTyre(content)`:
  - Перевірити чи шина існує (by slug)
  - Якщо існує — оновити
  - Якщо ні — створити
- [ ] Імплементувати функцію `publishArticle(article)`
- [ ] Імплементувати функцію `updateTyreBadges(slug, badges)`
- [ ] Додати обробку помилок та логування

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

**Нотатки:** Потрібен STRAPI_API_TOKEN з правами на запис

---

### 2.6 Update Strapi Tyre schema for badges

- [ ] Створити component `award.badge` в Strapi
- [ ] Додати поле `badges` до Tyre content type
- [ ] Додати поле `testResults` (relation або JSON)
- [ ] Перегенерувати types для frontend

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

**Нотатки:** Після змін потрібно перезапустити Strapi

---

### 2.7 Display badges on TyreCard

- [ ] Оновити TyreCard для відображення топового бейджа
- [ ] Показувати бейдж у верхньому правому куті
- [ ] Використати Badge компонент з Phase 1
- [ ] Оновити сторінку шини для показу всіх бейджів
- [ ] Додати секцію "Результати тестів" на сторінку шини

**Файли:**
- `frontend/src/components/TyreCard.tsx`
- `frontend/src/app/shyny/[slug]/page.tsx`

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

**Нотатки:** -

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
