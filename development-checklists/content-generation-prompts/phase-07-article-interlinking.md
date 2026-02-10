# Фаза 7: Інтерлінкінг у статтях блогу

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити критичну проблему: `buildGenerationContext()` у `article-pipeline.ts` збирає `relatedItems` (пов'язані шини з CMS + 3 існуючі статті для крос-лінкінгу), але ці дані НЕ передаються у `generateArticle()`. Додано `relatedItems` до `ArticleInput` та `buildPrompt()`.

## Задачі

### 7.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Прочитати `article-pipeline.ts:266-358` — `buildGenerationContext()`
- [x] Прочитати `article-pipeline.ts:214-218` — виклик `generateArticle(context.input)`
- [x] Прочитати `article-generator.ts:28-39` — `ArticleInput`
- [x] Прочитати `article-generator.ts:80-121` — `buildPrompt()`
- [x] Прочитати `prompts/index.ts:305-354` — `getArticlePrompt()` з підтримкою `relatedItems`
- [x] Перевірити `INTERLINKING_RULES` у system prompt

#### B. Обрати підхід
- [x] Варіант A: Додати `relatedItems` у `ArticleInput`, передати в `buildPrompt()` ← ОБРАНО

**Обране рішення:** Варіант A

---

### 7.1 Додати `relatedItems` до `ArticleInput`
- [x] У `article-generator.ts`, додати поле `relatedItems?: RelatedItem[]` до `ArticleInput`
- [x] Імпортувати тип `RelatedItem` з `prompts/index.ts`

**Файли:** `backend-payload/content-automation/src/processors/content/article-generator.ts`

---

### 7.2 Оновити `buildPrompt()` для включення relatedItems
- [x] Додати секцію `ПОСИЛАННЯ ДЛЯ ПЕРЕЛІНКОВКИ` в user prompt
- [x] Формат: `- {name}: /shyny/{slug}` для шин, `- {name}: /blog/{slug}` для статей
- [x] Додати інструкцію: "Використай 2-3 посилання органічно в тексті через `<a href>`"
- [x] Якщо `relatedItems` порожній — не додавати секцію

**Файли:** `backend-payload/content-automation/src/processors/content/article-generator.ts`

---

### 7.3 Передати relatedItems з pipeline в generator
- [x] У `article-pipeline.ts`, передати `relatedItems: context.relatedItems` у виклик `generateArticle()`

**Файли:** `backend-payload/content-automation/src/article-pipeline.ts`

---

### 7.4 Перевірити санітизацію HTML з посиланнями
- [x] Переконатися що при публікації статті посилання `<a href>` зберігаються
- [x] Перевірити чи є санітизація в pipeline для статей
- [x] Переконатися що CKEditor/body поле зберігає HTML з посиланнями

---

### 7.5 Перевірка та тестування
- [x] Запустити генерацію статті з relatedItems
- [x] Перевірити що контент містить `<a href>` посилання
- [x] Перевірити що посилання внутрішні
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
