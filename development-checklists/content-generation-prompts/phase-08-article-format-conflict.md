# Фаза 8: Конфлікт формату контенту статей (Markdown vs HTML vs Lexical)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Вирішити конфлікт форматів: промпт просив Markdown, system prompt — HTML, фронтенд очікує HTML. Стандартизовано на HTML.

## Задачі

### 8.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Прочитати `article-generator.ts:101` — формат у user prompt ("Markdown")
- [x] Прочитати `prompts/index.ts:173-183` — system prompt article з `SEO_FORMATTING_RULES` (HTML)
- [x] Прочитати `prompts/index.ts:305-354` — `getArticlePrompt()` (просить HTML)
- [x] Прочитати `article-pipeline.ts:370-374` — `publishArticleToCMS()`
- [x] Прочитати `Articles.ts:88-96` — CMS поле body
- [x] Прочитати `blog/[slug]/page.tsx:186-197` — як фронтенд рендерить content
- [x] Перевірити `LexicalRenderer`
- [x] Перевірити чи є утиліта `markdownToLexical` або `htmlToLexical`

#### B. Обрати єдиний формат
- [x] Варіант A: HTML ← ОБРАНО

**Обране рішення:** HTML — стандартизовано на HTML, аналогічно Phase 1 для шин

---

### 8.1 Уніфікувати формат у промпті
- [x] У `article-generator.ts:buildPrompt()` — змінити "Markdown" на "HTML"
- [x] Оновити структуру контенту: HTML теги замість Markdown
- [x] Переконатися що system prompt і user prompt узгоджені

**Файли:** `backend-payload/content-automation/src/processors/content/article-generator.ts`

---

### 8.2 Конвертувати контент перед публікацією
- [x] HTML зберігається напряму — конвертація не потрібна
- [x] Додано HTML теги в prompt format instructions

---

### 8.3 Оновити фронтенд рендеринг
- [x] body зберігається як HTML — фронтенд вже підтримує HTML рендеринг
- [x] TableOfContents працює з HTML h2/h3 елементами

---

### 8.4 Перевірка та тестування
- [x] Згенерувати тестову статтю — перевірити формат output
- [x] Перевірити що посилання `<a href>` рендеряться коректно
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
