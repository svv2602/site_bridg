# Фаза 4: Quality & Polish

## Статус
- [x] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати інструменти якості, моніторинг, калькулятор економії палива та фінальна полірування системи.

## Попередні вимоги
- ✅ Phase 1, 2, 3 завершені
- Automation pipeline повністю працює
- Telegram notifications налаштовані
- Cron scheduler запущений

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути всі генератори контенту
- [ ] Перевірити де можуть бути проблеми якості
- [ ] Визначити метрики для моніторингу

**Команди для пошуку:**
```bash
# Всі процесори
ls backend/content-automation/src/processors/

# Перевірити логування
grep -r "console.log\|logger" backend/content-automation/src/

# Перевірити error handling
grep -r "catch\|error" backend/content-automation/src/
```

#### B. Аналіз потенційних проблем
- [ ] Що якщо LLM генерує неправильний JSON?
- [ ] Що якщо контент занадто схожий на джерело?
- [ ] Що якщо сайт-джерело змінив структуру?

**Валідації потрібні для:**
- Довжина тексту (min/max)
- Мова (українська)
- JSON структура
- Унікальність контенту

#### C. Метрики для моніторингу
- [ ] Кількість згенерованого контенту
- [ ] Вартість токенів LLM
- [ ] Час виконання
- [ ] Помилки та їх типи

**Нотатки для перевикористання:** -

---

### 4.1 Create content validator

- [ ] Створити `src/processors/validator.ts`
- [ ] Імплементувати валідації:
  - Required fields присутні
  - Довжина тексту в межах норми
  - Текст українською мовою (детект кирилиці)
  - SEO поля правильної довжини
- [ ] Імплементувати перевірку унікальності:
  - Hash контенту
  - Порівняння з існуючим в Strapi
- [ ] Повертати структуровані помилки та warnings
- [ ] Інтегрувати в pipeline перед публікацією

**Файли:**
- `backend/content-automation/src/processors/validator.ts`

**Validation result:**
```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];      // Critical - block publish
  warnings: string[];    // Non-critical - notify
}

// Validations
const validations = {
  shortDescription: { minLength: 100, maxLength: 300 },
  fullDescription: { minLength: 500, maxLength: 2000 },
  seoTitle: { maxLength: 60 },
  seoDescription: { maxLength: 160 },
};
```

**Нотатки:** -

---

### 4.2 Create fuel economy calculator widget

- [ ] Створити `frontend/src/components/FuelCalculator.tsx`
- [ ] Імплементувати розрахунок економії за EU Label:
  - Input: поточний label, порівнюваний label, річний пробіг
  - Output: економія літрів та грошей
- [ ] Додати слайдер для річного пробігу (5,000 - 50,000 км)
- [ ] Показувати результат в реальному часі
- [ ] Додати на сторінку шини (опціонально в sidebar)

**Файли:**
- `frontend/src/components/FuelCalculator.tsx`
- `frontend/src/app/shyny/[slug]/page.tsx` (інтегрувати)

**Формула економії:**
```typescript
// EU Label fuel efficiency difference (L/100km)
const fuelDifference: Record<string, number> = {
  'A-B': 0.1,
  'A-C': 0.25,
  'A-D': 0.4,
  'A-E': 0.55,
  'B-C': 0.15,
  'B-D': 0.3,
  'B-E': 0.45,
  'C-D': 0.15,
  'C-E': 0.3,
  'D-E': 0.15,
};

// Розрахунок
const liters = (annualKm / 100) * diff;
const money = liters * fuelPricePerLiter;
```

**UI:**
```
┌─────────────────────────────────────┐
│ 💰 Калькулятор економії палива      │
│                                     │
│ Річний пробіг: [═══════●═══] 15,000 │
│                                     │
│ Порівняння: A vs C                  │
│                                     │
│ 💧 Економія: 38 л на рік            │
│ 💰 Це 2,090 ₴ щороку!              │
└─────────────────────────────────────┘
```

**Нотатки:** -

---

### 4.3 Add monitoring and logging

- [ ] Створити `src/utils/logger.ts` з structured logging
- [ ] Створити `src/utils/metrics.ts` для збору метрик
- [ ] Логувати всі операції:
  - Scraping: URLs, кількість items, час
  - LLM: промпт, токени, вартість, час
  - Publish: success/fail, Strapi ID
- [ ] Зберігати логи у файл `logs/automation.log`
- [ ] Зберігати метрики в SQLite
- [ ] Додати weekly summary в Telegram

**Файли:**
- `backend/content-automation/src/utils/logger.ts`
- `backend/content-automation/src/utils/metrics.ts`
- `backend/content-automation/src/db/metrics.ts`

**Metrics schema:**
```sql
CREATE TABLE metrics (
    id INTEGER PRIMARY KEY,
    date DATE,
    tires_scraped INTEGER,
    tires_generated INTEGER,
    articles_generated INTEGER,
    tokens_used INTEGER,
    cost_usd REAL,
    errors_count INTEGER,
    execution_time_ms INTEGER
);
```

**Weekly summary:**
```
📊 Тижневий звіт
📅 01.01.2025 - 07.01.2025

📦 Нові шини: 3
📝 Нові статті: 2
🏆 Badges додано: 5

💰 Витрати: $2.45
⏱ Час виконання: 5 хв 23 сек
❌ Помилок: 0
```

**Нотатки:** -

---

### 4.4 Implement deduplication system

- [ ] Створити `src/processors/deduplicator.ts`
- [ ] Імплементувати unique test ID (test_uid)
- [ ] Імплементувати перевірку дублікатів:
  - По test_uid для тестів
  - По tire_slug для шин
  - По content hash для контенту
- [ ] Імплементувати update vs create логіку:
  - Якщо існує і дані змінились → update
  - Якщо існує і дані ті самі → skip
  - Якщо не існує → create
- [ ] Інтегрувати в pipeline

**Файли:**
- `backend/content-automation/src/processors/deduplicator.ts`
- `backend/content-automation/src/db/schema.sql` (оновити)

**Decision tree:**
```typescript
type DeduplicationAction = 'create' | 'update' | 'skip' | 'link_only';

async function checkDeduplication(item): Promise<DeduplicationAction> {
  const existing = await findExisting(item);
  if (!existing) return 'create';

  const hasArticle = await hasRelatedArticle(existing.id);
  if (!hasArticle) return 'create';

  const dataChanged = hashData(item) !== existing.dataHash;
  if (dataChanged) return 'update';

  return 'skip';
}
```

**Нотатки:** -

---

### 4.5 Add error recovery and retry logic

- [ ] Створити `src/utils/retry.ts` з exponential backoff
- [ ] Обгорнути всі API calls в retry:
  - LLM API (Claude)
  - Strapi API
  - Scraping requests
- [ ] Імплементувати circuit breaker для критичних сервісів
- [ ] Додати graceful degradation:
  - Якщо LLM недоступний → skip generation, notify
  - Якщо Strapi недоступний → save to local, retry later
- [ ] Зберігати failed jobs для manual retry

**Файли:**
- `backend/content-automation/src/utils/retry.ts`
- `backend/content-automation/src/utils/circuit-breaker.ts`
- `backend/content-automation/src/db/failed-jobs.ts`

**Retry config:**
```typescript
const retryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

async function withRetry<T>(
  fn: () => Promise<T>,
  config = retryConfig
): Promise<T> {
  // exponential backoff implementation
}
```

**Нотатки:** -

---

### 4.6 Create admin dashboard (optional)

- [ ] Створити `frontend/src/app/admin/automation/page.tsx`
- [ ] Показувати статистику:
  - Кількість згенерованого контенту
  - Витрати за місяць
  - Графік активності
- [ ] Показувати останні jobs та їх статус
- [ ] Додати кнопку для manual trigger
- [ ] Захистити сторінку (basic auth або Strapi admin)

**Файли:**
- `frontend/src/app/admin/automation/page.tsx` (новий)
- `frontend/src/lib/api/automation.ts` (новий)

**UI:**
```
┌─────────────────────────────────────────────────┐
│ 📊 Content Automation Dashboard                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ Цей місяць:                                      │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ 12      │ │ 5       │ │ $8.50   │ │ 0       │ │
│ │ Шин     │ │ Статей  │ │ Витрати │ │ Помилок │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│                                                  │
│ Останні jobs:                                    │
│ ┌────────────────────────────────────────────┐  │
│ │ ✅ 2025-01-07 03:00 - Weekly automation    │  │
│ │ ✅ 2025-01-06 - Manual: Potenza Sport      │  │
│ │ ❌ 2025-01-05 - Error: Strapi timeout     │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ [🔄 Run Now] [📋 View Logs]                     │
└─────────────────────────────────────────────────┘
```

**Нотатки:** Ця задача опціональна, можна пропустити

---

### 4.7 Final testing and documentation

- [ ] Протестувати повний цикл автоматизації:
  1. Scrape → 2. Generate → 3. Validate → 4. Publish → 5. Notify
- [ ] Перевірити всі edge cases:
  - Нова модель шини
  - Оновлена модель
  - Новий тест
  - Помилка API
- [ ] Оновити README.md в content-automation
- [ ] Додати приклади використання CLI
- [ ] Оновити CLAUDE.md з інформацією про automation
- [ ] Написати короткий guide для команди

**Файли:**
- `backend/content-automation/README.md` (створити/оновити)
- `CLAUDE.md` (оновити)

**README структура:**
```markdown
# Content Automation System

## Quick Start
npm install
npm run start

## CLI Commands
npm run scrape
npm run generate
npm run publish
npm run full

## Configuration
Copy .env.example to .env and fill API keys

## Architecture
[diagram]

## Troubleshooting
Common issues and solutions
```

**Нотатки:** -

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Виконай повний end-to-end тест:
   ```bash
   cd backend/content-automation

   # Full automation cycle
   npm run full

   # Check logs
   cat logs/automation.log | tail -50

   # Check metrics
   sqlite3 data/content.db "SELECT * FROM metrics ORDER BY date DESC LIMIT 5"

   # Verify in Strapi
   open http://localhost:1337/admin

   # Verify on frontend
   open http://localhost:3010
   ```
3. Зміни статус фази на "Завершена"
4. Заповни дату "Завершена: YYYY-MM-DD"
5. Виконай фінальний коміт:
   ```bash
   git add .
   git commit -m "checklist(content-automation): phase-4 quality polish completed

   - Add content validator
   - Create fuel economy calculator
   - Add monitoring and logging
   - Implement deduplication system
   - Add error recovery with retry
   - Final testing and documentation

   Content Automation System is now complete!"
   ```
6. Онови PROGRESS.md:
   - Поточна фаза: COMPLETED
   - Статус Phase 4: ✅ Завершена
   - Загальний прогрес: 28/28 (100%)
7. Створи release commit:
   ```bash
   git tag -a v1.0.0-content-automation -m "Content Automation System v1.0"
   ```

---

## 🎉 Проект завершено!

### Що було створено:
- ✅ ProKoleso scraper
- ✅ ADAC/AutoBild test scrapers
- ✅ LLM content generator (Claude)
- ✅ Badge assignment system
- ✅ Strapi publisher
- ✅ Telegram notifications
- ✅ Cron scheduler
- ✅ Content validator
- ✅ Monitoring & logging
- ✅ UI improvements (contrast, badges, EU labels)

### Наступні кроки:
1. Моніторити роботу системи протягом 2-4 тижнів
2. Збирати feedback від команди
3. Оптимізувати промпти на основі якості контенту
4. Розглянути додаткові джерела даних
