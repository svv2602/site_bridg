# Фаза 1: Frontend - FAQ + Test Results

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-09
**Завершена:** 2026-01-09

## Ціль фази
Додати FAQ секцію та секцію результатів тестів на сторінку шини `/shyny/[slug]` з Schema.org structured data.

## Передумови
- Payload CMS має поля `faqs` та `testResults` в колекції Tyres
- Референс: `frontend/src/app/shyny/[slug]/page.tsx`

---

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути структуру `frontend/src/app/shyny/[slug]/page.tsx`
- [x] Вивчити існуючі компоненти в `frontend/src/components/ui/`
- [x] Перевірити типи в `frontend/src/lib/data.ts`
- [x] Перевірити Payload API response для tyres

**Команди для пошуку:**
```bash
# Перегляд сторінки шини
cat frontend/src/app/shyny/[slug]/page.tsx

# Перегляд типів
grep -n "interface Tyre" frontend/src/lib/data.ts

# Перевірка API
cat frontend/src/lib/api/payload.ts

# Перегляд Payload collection
cat backend-payload/src/collections/Tyres.ts
```

#### B. Аналіз залежностей
- [x] Чи є типи FAQ та TestResult в lib/data.ts?
- [x] Чи повертає Payload API ці поля?
- [x] Чи є lucide-react icons для accordion?

**Нові типи:** FAQ, TestResult
**Нові API-функції:** оновити getPayloadTyreBySlug для populate faqs, testResults
**Нові компоненти:** FAQSection.tsx, TestResultsSection.tsx, TestResultCard.tsx

#### C. Перевірка дизайну
- [x] Accordion стиль для FAQ (ChevronDown/ChevronUp icons)
- [x] Card стиль для Test Results
- [x] Schema.org FAQPage structured data

**Референс-сторінка:** `/shyny/[slug]/page.tsx`, `/plan/content-automation-phase2/phase-05-frontend.md`

**Нотатки для перевикористання:**
- Використати патерн карток з існуючої сторінки
- Tailwind класи: `rounded-2xl border border-border bg-card p-6`

---

### 1.1 Додати типи FAQ та TestResult

- [x] Додати `FAQ` interface в `frontend/src/lib/data.ts`
- [x] Додати `TestResult` interface в `frontend/src/lib/data.ts`
- [x] Оновити `TyreModel` interface з `faqs?: FAQ[]` та `testResults?: TestResult[]`

**Файли:** `frontend/src/lib/data.ts`

**Код:**
```typescript
export interface FAQ {
  question: string;
  answer: string;
}

export interface TestResult {
  source: 'adac' | 'autobild' | 'tyrereviews' | 'tcs';
  testType: 'summer' | 'winter' | 'allseason';
  year: number;
  testedSize: string;
  position: number;
  totalTested: number;
  rating: string;
  ratingNumeric: number;
  articleSlug?: string;
}

export interface TyreModel {
  // ... existing fields
  faqs?: FAQ[];
  testResults?: TestResult[];
}
```

---

### 1.2 Створити FAQSection компонент

- [x] Створити `frontend/src/components/FAQSection.tsx`
- [x] Реалізувати accordion з expand/collapse
- [x] Додати іконки ChevronDown/ChevronUp з lucide-react
- [x] Стилізувати згідно патернів проекту

**Файли:** `frontend/src/components/FAQSection.tsx`

**Структура компонента:**
```tsx
'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FAQ } from '@/lib/data';

interface FAQSectionProps {
  faqs: FAQ[];
  tireName: string;
}

export function FAQSection({ faqs, tireName }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  // ...
}
```

---

### 1.3 Створити TestResultsSection компонент

- [x] Створити `frontend/src/components/TestResultCard.tsx`
- [x] Створити `frontend/src/components/TestResultsSection.tsx`
- [x] Додати кольорове кодування для рейтингів (green для хороших)
- [x] Додати посилання на статті якщо є articleSlug

**Файли:**
- `frontend/src/components/TestResultCard.tsx`
- `frontend/src/components/TestResultsSection.tsx`

**Логіка рейтингів:**
- `ratingNumeric <= 2.0` → green (відмінно)
- `ratingNumeric <= 2.5` → lime (добре)
- `ratingNumeric > 2.5` → gray (задовільно)

---

### 1.4 Інтегрувати компоненти на сторінку шини

- [x] Імпортувати FAQSection та TestResultsSection в `/shyny/[slug]/page.tsx`
- [x] Додати секції після основного контенту
- [x] Умовний рендеринг (тільки якщо дані є)

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`

**Розміщення:**
```tsx
{/* Після секції "Для яких умов підходить" */}

{model.testResults && model.testResults.length > 0 && (
  <TestResultsSection results={model.testResults} tireName={model.name} />
)}

{model.faqs && model.faqs.length > 0 && (
  <FAQSection faqs={model.faqs} tireName={model.name} />
)}
```

---

### 1.5 Додати Schema.org FAQPage structured data

- [x] Створити функцію `generateFAQSchema` в `frontend/src/lib/schema.ts`
- [x] Додати JSON-LD script на сторінку якщо є FAQ
- [ ] Перевірити через Google Rich Results Test

**Файли:**
- `frontend/src/lib/schema.ts`
- `frontend/src/app/shyny/[slug]/page.tsx`

**Schema.org формат:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Питання",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Відповідь"
      }
    }
  ]
}
```

---

## Верифікація

- [x] FAQ секція рендериться на сторінці шини
- [x] Accordion працює (expand/collapse)
- [x] Test Results секція рендериться
- [x] Schema.org JSON-LD присутній в page source
- [x] Стилі відповідають патернам проекту
- [x] Немає TypeScript помилок

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(frontend): add FAQ and Test Results sections to tyre page

   - Add FAQSection component with accordion
   - Add TestResultsSection and TestResultCard components
   - Add Schema.org FAQPage structured data
   - Update TyreModel types with faqs and testResults"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Загальний прогрес: 5/24
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
