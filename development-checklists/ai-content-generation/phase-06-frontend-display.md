# Фаза 6: Frontend Display

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Оновити сторінку шини для відображення повного опису, FAQ, переваг та SEO метаданих.

## Передумови
- Завершена Фаза 5 (Admin UI)
- Є опублікований контент хоча б для однієї моделі

## Задачі

### 6.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити поточну сторінку шини `frontend/src/app/shyny/[slug]/page.tsx`
- [ ] Вивчити як отримуються дані з Payload API
- [ ] Знайти компоненти для rich text рендерингу

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
- [ ] Перевірити що PayloadTyre включає нові поля
- [ ] Перевірити формат fullDescription (Lexical)
- [ ] Перевірити формат keyBenefits та faqs

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

**Нотатки для перевикористання:** -

---

### 6.1 Створити компонент LexicalRenderer
- [ ] Створити компонент для рендерингу Lexical JSON
- [ ] Підтримувати: paragraph, heading, list, listItem, link
- [ ] Стилізувати відповідно до дизайну сайту
- [ ] Обробляти пустий контент

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
- [ ] Список переваг з іконками
- [ ] Анімація появи (motion)
- [ ] Адаптивна сітка (2 колонки на desktop)
- [ ] Стилі відповідно до дизайну

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
- [ ] Accordion з питаннями
- [ ] Плавна анімація розкриття
- [ ] Підтримка Schema.org FAQPage
- [ ] Стилі відповідно до дизайну

**Файли:** `frontend/src/components/FAQAccordion.tsx`
**Props:**
```typescript
interface FAQAccordionProps {
  items: { question: string; answer: string }[];
  title?: string;
}
```

---

### 6.4 Оновити сторінку шини
- [ ] Додати секцію з fullDescription
- [ ] Додати компонент KeyBenefits
- [ ] Додати компонент FAQAccordion
- [ ] Умовний рендеринг (якщо контент є)
- [ ] Оновити tabs navigation

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`
**Нотатки:** -

---

### 6.5 Оновити SEO метадані
- [ ] Використовувати seoTitle якщо є
- [ ] Використовувати seoDescription якщо є
- [ ] Fallback до поточної логіки
- [ ] Додати FAQ Schema.org розмітку

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

### 6.6 Тестування відображення
- [ ] Перевірити рендеринг fullDescription
- [ ] Перевірити відображення переваг
- [ ] Перевірити FAQ accordion
- [ ] Перевірити SEO метадані (View Source)
- [ ] Перевірити Schema.org валідатором
- [ ] Перевірити адаптивність (mobile/desktop)

**URL:** `http://localhost:3010/shyny/turanza-6`
**Інструменти:**
- Schema.org Validator: https://validator.schema.org/
- Google Rich Results Test
**Нотатки:** -

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
