# Фаза 3: Advanced Features (P1 & P2)

## Статус
- [x] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати розширені функції: сезонний автоконтент, сторінки порівняння, FAQ генератор та Telegram-бот для команди.

## Попередні вимоги
- ✅ Phase 1 та Phase 2 завершені
- Content generation pipeline працює
- Strapi publisher налаштований
- Badges відображаються на frontend

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути головну сторінку для seasonal promo
- [ ] Переглянути структуру каталогів шин для порівняння
- [ ] Переглянути сторінку шини для FAQ секції

**Команди для пошуку:**
```bash
# Головна сторінка (hero section)
cat frontend/src/app/page.tsx | head -150

# Каталог шин
ls frontend/src/app/
cat frontend/src/app/passenger-tyres/page.tsx | head -100

# Сторінка статті (референс для FAQ schema)
cat frontend/src/app/advice/[slug]/page.tsx | head -50
```

#### B. Аналіз залежностей
- [ ] Чи потрібен новий content type SeasonalPromo в Strapi?
- [ ] Чи потрібен роут `/porivnyaty/`?
- [ ] Які залежності для Telegram bot? (node-telegram-bot-api)

**Нові роути:**
- `/porivnyaty/[slug]` - динамічна сторінка порівняння
- `/porivnyaty?models=slug1,slug2` - порівняння за query params

**Нові Strapi типи:**
- SeasonalPromo (опціонально, можна через JSON config)

#### C. Перевірка UI/UX
- [ ] Як виглядатиме сторінка порівняння?
- [ ] Де розміщувати FAQ на сторінці шини?
- [ ] Як показувати сезонний банер?

**Референс:** ТЗ section 13.1-13.4

**Нотатки для перевикористання:** -

---

### 3.1 Implement seasonal auto-content

- [ ] Створити `src/config/seasonal.ts` з конфігурацією сезонів
- [ ] Створити `src/processors/seasonal-content.ts`:
  - Визначати поточний сезон (березень = літні, жовтень = зимові)
  - Генерувати hero title/subtitle
  - Вибирати featured шини за сезоном
- [ ] Додати API endpoint для отримання сезонного контенту
- [ ] Оновити головну сторінку для показу сезонного hero

**Файли:**
- `backend/content-automation/src/config/seasonal.ts`
- `backend/content-automation/src/processors/seasonal-content.ts`
- `frontend/src/app/page.tsx` (оновити hero section)

**Конфігурація сезонів:**
```typescript
const seasonalConfig = {
  spring: {  // березень-квітень
    heroTitle: 'Час переходити на літні шини',
    heroSubtitle: 'Температура стабільно вище +7°C',
    featuredSeason: 'summer',
    accentColor: 'from-orange-500 to-yellow-500'
  },
  autumn: {  // жовтень-листопад
    heroTitle: 'Готуйтесь до зими завчасно',
    heroSubtitle: 'Перші заморозки вже близько',
    featuredSeason: 'winter',
    accentColor: 'from-blue-500 to-cyan-400'
  }
};
```

**Нотатки:** -

---

### 3.2 Create comparison pages generator

- [ ] Створити `src/processors/comparison-generator.ts`:
  - Генерувати slug: `blizzak-lm005-vs-turanza-6`
  - Створювати таблицю порівняння
  - Генерувати verdict через LLM
- [ ] Створити `frontend/src/app/porivnyaty/[slug]/page.tsx`
- [ ] Імплементувати UI таблиці порівняння
- [ ] Додати SEO metadata та Schema.org
- [ ] Створити сторінку з вибором моделей для порівняння

**Файли:**
- `backend/content-automation/src/processors/comparison-generator.ts`
- `frontend/src/app/porivnyaty/[slug]/page.tsx` (новий)
- `frontend/src/app/porivnyaty/page.tsx` (новий - вибір моделей)

**Структура порівняння:**
```typescript
interface ComparisonPage {
  slug: string;                    // blizzak-lm005-vs-turanza-6
  title: string;                   // Blizzak LM005 vs Turanza 6
  tyres: TyreModel[];              // 2-3 шини
  comparisonTable: ComparisonRow[];
  verdict: string;                 // LLM-generated
  seoTitle: string;
  seoDescription: string;
}

interface ComparisonRow {
  attribute: string;               // "Мокре зчеплення"
  values: {
    tyreSlug: string;
    value: string;
    isWinner?: boolean;
  }[];
}
```

**Нотатки:** -

---

### 3.3 Implement FAQ generator

- [ ] Створити `src/processors/faq-generator.ts`
- [ ] Визначити 5 стандартних питань для шин
- [ ] Імплементувати генерацію відповідей через LLM
- [ ] Зберігати FAQ в Strapi (component або JSON поле)
- [ ] Додати FAQ секцію на сторінку шини
- [ ] Додати Schema.org FAQPage structured data

**Файли:**
- `backend/content-automation/src/processors/faq-generator.ts`
- `frontend/src/app/shyny/[slug]/page.tsx` (додати FAQ секцію)
- `frontend/src/lib/schema.ts` (додати FAQPage schema)

**Стандартні питання:**
1. Для яких автомобілів підходить ця шина?
2. Чи можна використовувати цю шину взимку/влітку?
3. Який приблизний термін служби?
4. Як правильно зберігати шини?
5. Чим ця модель відрізняється від [попередника]?

**FAQ Schema.org:**
```typescript
function generateFAQSchema(faqs: FAQ[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
```

**Нотатки:** -

---

### 3.4 Create Telegram bot for notifications

- [ ] Встановити `node-telegram-bot-api`
- [ ] Створити Telegram bot через @BotFather
- [ ] Створити `src/publishers/telegram-bot.ts`
- [ ] Імплементувати функцію `notify(message, buttons?)`
- [ ] Імплементувати типи повідомлень:
  - new_content: новий контент згенеровано
  - error: помилка
  - weekly_summary: тижневий звіт
- [ ] Додати inline buttons для швидких дій

**Файли:**
- `backend/content-automation/src/publishers/telegram-bot.ts`
- `backend/content-automation/src/config/env.ts` (додати TELEGRAM_*)

**Приклад повідомлення:**
```
🆕 *Новий контент згенеровано*

📦 *Шина:* Bridgestone Potenza Sport
📝 *Опис:* 487 слів
🏆 *Badges:* Winner ADAC 2025

🔗 [Переглянути в Strapi](http://localhost:1337/admin)
```

**Env variables:**
```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=-100123456789
```

**Нотатки:** -

---

### 3.5 Implement test results scrapers (ADAC, AutoBild)

- [ ] Створити `src/scrapers/adac.ts`:
  - Парсити тести з adac.de
  - Витягувати: models, ratings, positions, categories
- [ ] Створити `src/scrapers/autobild.ts`:
  - Парсити тести з autobild.de
  - Витягувати аналогічні дані
- [ ] Створити `src/scrapers/tyrereviews.ts` (агрегатор)
- [ ] Зберігати результати в SQLite

**Файли:**
- `backend/content-automation/src/scrapers/adac.ts`
- `backend/content-automation/src/scrapers/autobild.ts`
- `backend/content-automation/src/scrapers/tyrereviews.ts`
- `backend/content-automation/src/db/test-results.ts`

**Структура test result:**
```typescript
interface TestResult {
  testUid: string;           // adac-winter-2024-205/55r16-passenger
  source: 'adac' | 'autobild' | 'tyrereviews';
  testType: 'summer' | 'winter' | 'allseason';
  year: number;
  testedSize: string;
  sourceUrl: string;
  results: {
    tireName: string;
    position: number;
    rating: string;
    ratingNumeric: number;
    categoryWins?: string[];
  }[];
}
```

**Нотатки:** Можливі проблеми з парсингом німецьких сайтів (локалізація, структура)

---

### 3.6 Create article generator for test summaries

- [ ] Створити `src/processors/article-generator.ts`
- [ ] Імплементувати генерацію статей про тести:
  - Вступ про тест
  - Результати Bridgestone
  - Порівняння з конкурентами
  - Висновок для українських водіїв
- [ ] Інтегрувати з Telegram для сповіщень
- [ ] Публікувати як draft в Strapi (для модерації)

**Файли:**
- `backend/content-automation/src/processors/article-generator.ts`
- `backend/content-automation/src/config/prompts.ts` (додати article prompts)

**Структура статті:**
```typescript
interface GeneratedArticle {
  slug: string;
  title: string;
  subtitle: string;
  body: string;              // Markdown
  previewText: string;
  readingTimeMinutes: number;
  tags: string[];
  relatedTyres: string[];    // slugs
  seoTitle: string;
  seoDescription: string;
}
```

**Нотатки:** -

---

### 3.7 Setup cron scheduler

- [ ] Встановити `node-cron`
- [ ] Створити `src/scheduler.ts`
- [ ] Налаштувати weekly job (неділя 03:00):
  1. Scrape ProKoleso → знайти нові моделі
  2. Scrape test results → знайти нові тести
  3. Generate content для нових моделей
  4. Generate articles для нових тестів
  5. Publish to Strapi
  6. Send Telegram summary
- [ ] Додати error handling та retry
- [ ] Створити CLI команди для manual trigger

**Файли:**
- `backend/content-automation/src/scheduler.ts`
- `backend/content-automation/src/cli.ts` (manual commands)

**Cron expression:**
```typescript
// Every Sunday at 03:00 AM
cron.schedule('0 3 * * 0', async () => {
  await runWeeklyAutomation();
});
```

**CLI команди:**
```bash
# Manual run
npx ts-node src/cli.ts run-full

# Only scrape
npx ts-node src/cli.ts scrape

# Only generate
npx ts-node src/cli.ts generate

# Only publish
npx ts-node src/cli.ts publish
```

**Нотатки:** -

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Протестуй всі нові функції:
   ```bash
   # Seasonal content
   curl http://localhost:3010/api/seasonal

   # Comparison page
   open http://localhost:3010/porivnyaty/blizzak-lm005-vs-turanza-6

   # FAQ on tire page
   open http://localhost:3010/shyny/blizzak-lm005

   # Telegram notification
   npx ts-node src/cli.ts test-telegram

   # Full automation
   npx ts-node src/cli.ts run-full
   ```
3. Зміни статус фази на "Завершена"
4. Заповни дату "Завершена: YYYY-MM-DD"
5. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(content-automation): phase-3 advanced features completed

   - Add seasonal auto-content
   - Create comparison pages generator
   - Implement FAQ generator with Schema.org
   - Create Telegram bot for notifications
   - Add ADAC/AutoBild scrapers
   - Create article generator
   - Setup cron scheduler"
   ```
6. Онови PROGRESS.md:
   - Поточна фаза: 4
   - Статус Phase 3: ✅ Завершена
7. Відкрий `phase-04-quality-polish.md` та продовж роботу
