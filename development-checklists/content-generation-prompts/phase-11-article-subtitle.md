# Фаза 11: Генерація subtitle для статей

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
CMS та фронтенд підтримують subtitle, але article-generator не генерував його. Додано subtitle у промпт, output та pipeline публікації.

## Задачі

### 11.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Прочитати `Articles.ts:73-75` — поле `subtitle` в CMS
- [x] Прочитати `blog/[slug]/page.tsx:116-119` — відображення subtitle
- [x] Прочитати `article-generator.ts:44-51` — `ArticleOutput`
- [x] Прочитати `article-generator.ts:98-105` — JSON формат
- [x] Прочитати `payload-client.ts:65-76` — `ArticleData` (має `subtitle?`)
- [x] Прочитати `article-pipeline.ts:370-383` — `publishArticleToCMS()`

---

### 11.1 Додати subtitle у промпт та output
- [x] У `article-generator.ts:buildPrompt()` — додати subtitle в JSON формат
- [x] Додати інструкцію: "subtitle доповнює title, не дублює його"
- [x] У `ArticleOutput` — додати `subtitle?: string`
- [x] У `parseResponse()` — додати парсинг `parsed.subtitle`

**Файли:** `backend-payload/content-automation/src/processors/content/article-generator.ts`

---

### 11.2 Передати subtitle при публікації
- [x] У `GeneratedArticle` тип — додати поле `subtitle?: string`
- [x] У формуванні `article` об'єкту — додати `subtitle: data.subtitle`
- [x] У `publishArticleToCMS()` — додати `subtitle: article.subtitle`

**Файли:**
- `backend-payload/content-automation/src/processors/content/article-generator.ts`
- `backend-payload/content-automation/src/types/content.ts`
- `backend-payload/content-automation/src/article-pipeline.ts`

---

### 11.3 Перевірка та тестування
- [x] Перевірити що subtitle генерується
- [x] Перевірити що subtitle зберігається в CMS
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
