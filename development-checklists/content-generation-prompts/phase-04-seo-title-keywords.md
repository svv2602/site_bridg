# Фаза 4: seoTitle суфікс та seoKeywords мертвий код

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Вирішити дві проблеми з SEO метаданими:

1. **seoTitle без суфіксу сайту** — Next.js `layout.tsx` вже має `title.template: '%s | Bridgestone Україна'`. Промпт повинен інструктувати НЕ включати суфікс.

2. **seoKeywords мертвий код** — `seoKeywords[]` генерується LLM (витрата ~50 токенів), зберігається в `GeneratedTyreContent`, публікується в CMS, але НІДЕ не використовується на фронтенді. Видалено.

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Прочитати `frontend/src/app/shyny/[slug]/page.tsx:33-63` — як формується metadata
- [x] Перевірити `frontend/src/app/layout.tsx` — чи є глобальний title template
- [x] Прочитати `tire-seo.ts:buildPrompt()` — що промпт каже про формат title
- [x] Перевірити `GeneratedTyreContent` тип — чи є `seoKeywords`
- [x] Знайти де `seoKeywords` зберігається та чи читається десь

#### B. Прийняти рішення
- [x] Варіант A для title: Фронтенд додає суфікс через Next.js `metadata.title.template` ← ОБРАНО
- [ ] Варіант B для title: Промпт інструктує НЕ включати суфікс (фронтенд додає)
- [x] Рішення для keywords: видалити генерацію (рекомендовано) ← ОБРАНО

**Обрані рішення:** Варіант A (layout.tsx вже має template), видалити seoKeywords

---

### 4.1 Стандартизувати seoTitle (обрано варіант A)
- [x] Перевірити чи `layout.tsx` має `metadata.title.template` — ТАК, вже є
- [x] Оновити промпт `tire-seo.ts:buildPrompt()`: додати інструкцію "НЕ включай назву сайту у title — вона додається автоматично"
- [x] Оновити промпт-шаблон `prompts/tire-seo.md` відповідно
- [x] Перевірити що валідація `30-70 символів` ще релевантна — оновлено на 40-55

**Файли:** `frontend/src/app/layout.tsx`, `backend-payload/content-automation/src/processors/content/tire-seo.ts`, `backend-payload/content-automation/src/prompts/tire-seo.md`

---

### 4.2 Усунути мертвий код seoKeywords
- [x] Видалити `seoKeywords` з `SEOOutput` інтерфейсу у `tire-seo.ts`
- [x] Видалити генерацію та валідацію keywords у `tire-seo.ts`
- [x] Видалити `seoKeywords` з `GeneratedTyreContent` типу в `types/content.ts`
- [x] Видалити `seoKeywords` з промпту `buildPrompt()` у `tire-seo.ts`
- [x] Видалити з оркестратору `index.ts:203`
- [x] Оновити промпт-шаблон `prompts/tire-seo.md` — видалити секцію keywords
- [x] Перевірити чи `payload-client.ts` публікує keywords

**Файли:**
- `backend-payload/content-automation/src/processors/content/tire-seo.ts`
- `backend-payload/content-automation/src/processors/content/index.ts`
- `backend-payload/content-automation/src/types/content.ts`
- `backend-payload/content-automation/src/prompts/tire-seo.md`

---

### 4.3 Перевірка та тестування
- [x] Запустити генерацію SEO для тестової моделі
- [x] Перевірити що title БЕЗ суфіксу
- [x] Перевірити що keywords НЕ генеруються
- [x] Перевірити фронтенд: `<title>` має формат "Model Name | Bridgestone Україна"
- [x] Запустити тести

**Нотатки:** Всі 377 тестів пройшли.

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x] ✅
2. Зміни статус фази: [x] Завершена ✅
3. Заповни дату "Завершена: 2026-02-10" ✅
4. Виконай коміт ✅
5. Онови PROGRESS.md ✅
6. Відкрий наступну фазу ✅
