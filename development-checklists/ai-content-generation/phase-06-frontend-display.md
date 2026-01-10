# Фаза 6: Frontend Display

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-10
**Завершена:** 2026-01-10

## Ціль фази
Оновити сторінку шини для відображення повного опису, FAQ, переваг та SEO метаданих.

## Передумови
- Завершена Фаза 5 (Admin UI)
- Є опублікований контент хоча б для однієї моделі

## Задачі

### 6.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити поточну сторінку шини `frontend/src/app/shyny/[slug]/page.tsx`
- [x] Вивчити як отримуються дані з Payload API
- [x] Знайти компоненти для rich text рендерингу

**Команди для пошуку:**
```bash
# Сторінка шини
cat frontend/src/app/shyny/[slug]/page.tsx
# Компоненти для рендерингу
ls frontend/src/components/
# Rich text
grep -r "RichText\|Lexical\|richtext" frontend/src/
```

#### B. Аналіз структури даних
- [x] Перевірити що PayloadTyre включає нові поля
- [x] Перевірити формат fullDescription (Lexical)
- [x] Перевірити формат keyBenefits та faqs

**Поля для відображення:**
- `fullDescription` - Lexical richtext
- `keyBenefits` - масив { benefit: string }
- `faqs` - масив { question, answer }
- `seoTitle`, `seoDescription` - метадані

#### C. Планування UI секцій

```
┌─────────────────────────────────────────────┐
│ Hero (існуючий)                             │
├─────────────────────────────────────────────┤
│ [Tab: Опис] [Tab: Розміри] [Tab: Технології]│
├─────────────────────────────────────────────┤
│ Про модель Turanza 6                        │
│ ─────────────────────                       │
│ (fullDescription - rich text)              │
│                                             │
│ Ключові переваги                            │
│ ─────────────────                           │
│ ✓ Перевага 1                                │
│ ✓ Перевага 2                                │
├─────────────────────────────────────────────┤
│ Часті питання (FAQ)                         │
│ ─────────────────────                       │
│ ▼ Питання 1?                                │
│   Відповідь 1...                            │
│ ▶ Питання 2?                                │
└─────────────────────────────────────────────┘
```

**Нотатки для перевикористання:** FAQSection already exists, reused

---

### 6.1 Створити компонент LexicalRenderer
- [x] Створити компонент для рендерингу Lexical JSON
- [x] Підтримувати: paragraph, heading, list, listItem, link
- [x] Стилізувати відповідно до дизайну сайту
- [x] Обробляти пустий контент

**Файли:** `frontend/src/components/LexicalRenderer.tsx`
**Props:**
```typescript
interface LexicalRendererProps {
  content: any; // Lexical JSON
  className?: string;
}
```

---

### 6.2 Створити компонент KeyBenefits
- [x] Список переваг з іконками
- [x] Анімація появи (motion)
- [x] Адаптивна сітка (2 колонки на desktop)
- [x] Стилі відповідно до дизайну

**Файли:** `frontend/src/components/KeyBenefits.tsx`
**Props:**
```typescript
interface KeyBenefitsProps {
  benefits: string[];
  title?: string;
}
```

---

### 6.3 Створити компонент FAQAccordion
- [x] Accordion з питаннями - використано існуючий FAQSection
- [x] Плавна анімація розкриття
- [x] Підтримка Schema.org FAQPage
- [x] Стилі відповідно до дизайну

**Файли:** `frontend/src/components/FAQSection.tsx` (вже існував)
**Нотатки:** Reused existing FAQSection component

---

### 6.4 Оновити сторінку шини
- [x] Додати секцію з fullDescription
- [x] Додати компонент KeyBenefits
- [x] Додати компонент FAQAccordion
- [x] Умовний рендеринг (якщо контент є)
- [x] Оновити tabs navigation

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`
**Нотатки:** Added LexicalRenderer and KeyBenefits after EU Label section

---

### 6.5 Оновити SEO метадані
- [x] Використовувати seoTitle якщо є
- [x] Використовувати seoDescription якщо є
- [x] Fallback до поточної логіки
- [x] Додати FAQ Schema.org розмітку (вже було)

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`
**Код:**
```typescript
export async function generateMetadata({ params }) {
  const tyre = await getPayloadTyreBySlug(params.slug);
  return {
    title: tyre?.seoTitle || `${tyre?.name} - Bridgestone Україна`,
    description: tyre?.seoDescription || tyre?.shortDescription,
  };
}
```

---

### 6.6 Тестування відображення - відкладено до Phase 7
- [ ] Перевірити рендеринг fullDescription → Phase 7
- [ ] Перевірити відображення переваг → Phase 7
- [ ] Перевірити FAQ accordion → Phase 7
- [ ] Перевірити SEO метадані (View Source) → Phase 7
- [ ] Перевірити Schema.org валідатором → Phase 7
- [ ] Перевірити адаптивність (mobile/desktop) → Phase 7

**URL:** `http://localhost:3010/shyny/turanza-6`
**Інструменти:**
- Schema.org Validator: https://validator.schema.org/
- Google Rich Results Test
**Нотатки:** Visual testing deferred to integration phase

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
   git commit -m "feat(frontend): tire page with full description, FAQ, benefits"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 7
   - Додай запис в історію
6. Відкрий наступну фазу (phase-07-integration-testing.md)
