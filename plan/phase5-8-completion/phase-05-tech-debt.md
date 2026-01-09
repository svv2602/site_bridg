# Фаза 5: Tech Debt - Tests + Types

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Закрити технічний борг: додати unit та integration тести, оновити TypeScript типи, оновити документацію.

## Передумови
- Всі попередні фази завершені
- Система стабільна та працює

---

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути поточні типи в lib/data.ts
- [ ] Перевірити чи є vitest.config
- [ ] Переглянути структуру content-automation для тестування

**Команди для пошуку:**
```bash
# Frontend types
cat frontend/src/lib/data.ts

# Check for test config
ls backend-payload/content-automation/
cat backend-payload/content-automation/package.json | grep test

# Modules to test
ls backend-payload/content-automation/src/processors/
```

#### B. Аналіз залежностей
- [ ] Чи встановлено vitest?
- [ ] Чи є mock utilities?

**Нові залежності:** vitest, @vitest/coverage-v8

#### C. Пріоритети тестування
1. validator.ts - критичний для якості контенту
2. badge-assigner.ts - бізнес логіка
3. deduplicator.ts - запобігає дублікатам
4. Integration test для pipeline

---

### 5.1 Встановити Test Framework

- [ ] Встановити vitest та coverage
- [ ] Створити vitest.config.ts
- [ ] Додати test scripts в package.json

**Команди:**
```bash
cd backend-payload/content-automation
npm install -D vitest @vitest/coverage-v8
```

**Файли:**
- `backend-payload/content-automation/vitest.config.ts`
- `backend-payload/content-automation/package.json`

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules', 'src/**/*.d.ts']
    }
  }
});
```

**package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

### 5.2 Додати Unit Tests для Validator

- [ ] Створити `src/processors/validator.test.ts`
- [ ] Тест: valid content passes
- [ ] Тест: empty fields fail
- [ ] Тест: too long SEO title warns
- [ ] Тест: non-Ukrainian content fails

**Файли:** `backend-payload/content-automation/src/processors/validator.test.ts`

**Test cases:**
```typescript
describe('validateTireContent', () => {
  it('should pass valid content', () => { /* ... */ });
  it('should fail on missing required fields', () => { /* ... */ });
  it('should warn on too long SEO title', () => { /* ... */ });
  it('should detect non-Ukrainian content', () => { /* ... */ });
});
```

---

### 5.3 Додати Unit Tests для Badge Assigner

- [ ] Створити `src/processors/badge-assigner.test.ts`
- [ ] Тест: winner badge для position 1
- [ ] Тест: recommended badge для rating <= 2.0
- [ ] Тест: filter out old badges (> 3 years)

**Файли:** `backend-payload/content-automation/src/processors/badge-assigner.test.ts`

**Test cases:**
```typescript
describe('assignBadges', () => {
  it('should assign winner badge for position 1', () => { /* ... */ });
  it('should assign recommended badge for rating <= 2.0', () => { /* ... */ });
});

describe('filterActiveBadges', () => {
  it('should filter out badges older than 3 years', () => { /* ... */ });
});
```

---

### 5.4 Додати Integration Test

- [ ] Створити `src/integration.test.ts`
- [ ] Mock external services (LLM, Strapi)
- [ ] Тест: full pipeline runs without errors
- [ ] Тест: error handling works

**Файли:** `backend-payload/content-automation/src/integration.test.ts`

**Mocking:**
```typescript
vi.mock('./processors/llm-generator', () => ({
  generateContent: vi.fn().mockResolvedValue({
    shortDescription: 'Тестовий опис...',
    // ...
  })
}));

vi.mock('./publishers/strapi-client', () => ({
  publishTyre: vi.fn().mockResolvedValue({ id: 1 })
}));
```

---

### 5.5 Оновити TypeScript Types

- [ ] Перевірити що всі types в lib/data.ts актуальні
- [ ] Перевірити що API responses типізовані
- [ ] Запустити `npm run build` для перевірки
- [ ] Виправити будь-які type errors

**Файли:**
- `frontend/src/lib/data.ts`
- `frontend/src/lib/api/payload.ts`

**Checklist:**
```bash
cd frontend
npm run build
# Перевірити що немає type errors
```

---

### 5.6 Оновити CLAUDE.md

- [ ] Додати секцію Content Automation
- [ ] Документувати CLI команди
- [ ] Документувати Telegram commands
- [ ] Документувати Admin Dashboard

**Файли:** `CLAUDE.md`

**Нова секція:**
```markdown
## Content Automation

### Overview
Automated content generation system in `backend-payload/content-automation/`:
- Scrapes tire data from ProKoleso, ADAC, AutoBild
- Generates descriptions using Claude API
- Assigns test badges automatically
- Publishes to Payload CMS
- Sends Telegram notifications

### Commands
```bash
cd backend-payload/content-automation
npm run start              # Start daemon (cron + telegram)
npm run automation         # Show CLI help
npm run automation:scrape  # Scrape only
npm run automation:generate # Generate only
npm run automation:full    # Full pipeline
```

### Telegram Bot Commands
- `/run` - Start full automation
- `/scrape` - Scrape only
- `/status` - Last run status
- `/stats` - Weekly statistics

### Admin Dashboard
Available at `/admin/automation` (requires authentication).
```

---

## Верифікація

- [ ] `npm test` passes
- [ ] Coverage > 50% для processors/
- [ ] `npm run build` passes в frontend
- [ ] Немає type errors
- [ ] CLAUDE.md оновлено
- [ ] Documentation актуальна

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "chore: technical debt cleanup

   - Add vitest test framework
   - Add unit tests for validator and badge-assigner
   - Add integration test for pipeline
   - Update TypeScript types
   - Update CLAUDE.md documentation"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: COMPLETED
   - Загальний прогрес: 24/24 (100%)
   - Додай запис в історію
6. 🎉 Phase 5-8 Completion завершено!

---

## Фінальний Checklist

Після завершення всіх фаз:

### Frontend
- [x] FAQSection компонент
- [x] TestResultsSection компонент
- [x] SeasonalHero компонент
- [x] Логотипи джерел тестів
- [x] Admin Dashboard

### Backend
- [x] Telegram bot commands
- [x] Cron scheduler
- [x] API endpoints

### Quality
- [x] Unit tests
- [x] Integration tests
- [x] TypeScript types
- [x] Documentation

### Project Status
- **Phase 1-4:** ✅ 28/28 (100%)
- **Phase 5-8:** ✅ 24/24 (100%)
- **Total:** ✅ 52/52 (100%)
