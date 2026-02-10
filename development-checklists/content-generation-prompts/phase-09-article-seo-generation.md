# Фаза 9: Окрема SEO-генерація для статей

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Додати генерацію `seoTitle` та `seoDescription` в промпт статей (раніше копіювались з title/excerpt). Видалити мертвий `seoKeywords`.

## Задачі

### 9.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Прочитати `article-generator.ts:276-284` — як формуються seoTitle та seoDescription
- [x] Прочитати `article-generator.ts:98-105` — JSON формат відповіді
- [x] Прочитати `tire-seo.ts` — як реалізовано окрему SEO-генерацію для шин
- [x] Прочитати `Articles.ts:42-55` — CMS поля seoTitle та seoDescription
- [x] Прочитати `blog/[slug]/page.tsx:26-65` — як фронтенд використовує seoTitle/seoDescription
- [x] Перевірити `layout.tsx` — title.template

#### B. Обрати підхід
- [x] Варіант A: Додати seoTitle і seoDescription до JSON-відповіді промпту ← ОБРАНО

**Обране рішення:** Варіант A

---

### 9.1 Додати seoTitle та seoDescription у промпт
- [x] У `article-generator.ts:buildPrompt()` — додати в JSON формат seoTitle та seoDescription
- [x] Додати інструкції: "seoTitle — НЕ дублюй title, НЕ включай назву сайту"
- [x] Оновити `ArticleOutput` інтерфейс: додати `seoTitle?` та `seoDescription?`

**Файли:** `backend-payload/content-automation/src/processors/content/article-generator.ts`

---

### 9.2 Оновити парсинг та маппінг
- [x] У `parseResponse()` — додати парсинг seoTitle та seoDescription
- [x] У формуванні `GeneratedArticle` — використати `data.seoTitle || data.title` як fallback
- [x] Додати валідацію довжини

**Файли:** `backend-payload/content-automation/src/processors/content/article-generator.ts`

---

### 9.3 Видалити мертвий seoKeywords
- [x] У `article-generator.ts` — видалити `seoKeywords: data.tags`
- [x] У `GeneratedArticle` тип (types/content.ts) — видалити поле `seoKeywords`
- [x] Перевірити що `publishArticleToCMS()` не публікує seoKeywords

**Файли:**
- `backend-payload/content-automation/src/processors/content/article-generator.ts`
- `backend-payload/content-automation/src/types/content.ts`

---

### 9.4 Перевірка та тестування
- [x] Згенерувати тестову статтю — перевірити що seoTitle !== title
- [x] Перевірити що seoTitle містить ключове слово
- [x] Перевірити що seoDescription 150-160 символів
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
