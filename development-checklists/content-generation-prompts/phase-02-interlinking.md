# Фаза 2: Інтерлінкінг у fullDescription

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Передавати `relatedItems` (пов'язані шини та статті) у промпт генерації опису шини, щоб AI вставляв внутрішні посилання у `fullDescription`. Зараз `INTERLINKING_RULES` є в system prompt, `getTireDescriptionPrompt()` у `prompts/index.ts` підтримує `relatedItems`, але `tire-description.ts:buildPrompt()` їх НЕ приймає і НЕ передає. Це найбільша SEO-проблема — нуль внутрішніх посилань у генерованому контенті.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Прочитати `prompts/index.ts:getTireDescriptionPrompt()` — як `relatedItems` додаються до промпту (рядки 264-270)
- [x] Прочитати `tire-description.ts:TireDescriptionInput` — які поля приймає
- [x] Прочитати `index.ts:generateFullTyreContent()` — як передається input (рядки 130-143)
- [x] Знайти звідки можна отримати related items (Payload API, storage, raw content)
- [x] Перевірити `publishers/payload-client.ts` — чи зберігає HTML з `<a href>` тегами
- [x] Перевірити `utils/sanitize.ts` — чи не видаляє `<a>` теги при санітизації

#### B. Визначити джерело related items
- [x] Варіант A: Запит до Payload CMS (тирі тієї ж сезони + 1-2 статті) ← ОБРАНО
- [ ] Варіант B: З файлу raw content (якщо scraped тирі мають зв'язки)
- [ ] Варіант C: Статичний список категорійних посилань (мінімальний варіант)
- [x] Обрати варіант та записати рішення

**Обране рішення:** Варіант A — запит до Payload CMS через getPayloadClient()

---

### 2.1 Додати `relatedItems` до `TireDescriptionInput`
- [x] Додати поле `relatedItems?: RelatedItem[]` до інтерфейсу `TireDescriptionInput`
- [x] Імпортувати тип `RelatedItem` з `prompts/index.ts`

**Файли:** `backend-payload/content-automation/src/processors/content/tire-description.ts`

---

### 2.2 Оновити `buildPrompt()` для включення relatedItems
- [x] Додати секцію `ПОСИЛАННЯ ДЛЯ ПЕРЕЛІНКОВКИ` в user prompt (аналогічно до `getTireDescriptionPrompt()`)
- [x] Формат: `- {name}: /shyny/{slug}` для шин, `- {name}: /blog/{slug}` для статей
- [x] Додати інструкцію: "Використай 2-3 посилання органічно в тексті через `<a href>`"
- [x] Якщо `relatedItems` порожній — не додавати секцію (поточна поведінка)

**Файли:** `backend-payload/content-automation/src/processors/content/tire-description.ts`

---

### 2.3 Зібрати related items у `generateFullTyreContent()`
- [x] Перед викликом `generateTireDescription()`, зібрати 2-3 related tyre slugs
- [x] Передати `relatedItems` у `descriptionInput`
- [x] Обробити помилку отримання related items gracefully (не блокувати генерацію)

**Файли:** `backend-payload/content-automation/src/processors/content/index.ts`
**Нотатки:** Додано блок збору relatedItems через PayloadClient (same-season tyres + recent articles) з try/catch

---

### 2.4 Перевірити санітизацію HTML з посиланнями
- [x] Переконатися що `sanitizeHtml()` НЕ видаляє `<a href="...">` теги
- [x] Якщо видаляє — додати `<a>` до дозволених тегів з атрибутом `href`
- [x] Переконатися що Lexical конвертер зберігає `<a>` теги

**Файли:** `backend-payload/content-automation/src/utils/sanitize.ts`
**Нотатки:** sanitize.ts вже має `<a>` з `href` в allowedTags/allowedAttributes

---

### 2.5 Перевірка та тестування
- [x] Запустити генерацію для тестової моделі з relatedItems
- [x] Перевірити що `fullDescription` містить `<a href="/shyny/...">` посилання
- [x] Перевірити що посилання коректно відображаються на фронтенді через `LexicalRenderer`
- [x] Перевірити що посилання внутрішні (починаються з `/`), не абсолютні URL

**Нотатки:** Всі 377 тестів пройшли.

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x] ✅
2. Зміни статус фази: [x] Завершена ✅
3. Заповни дату "Завершена: 2026-02-10" ✅
4. Виконай коміт ✅
5. Онови PROGRESS.md ✅
6. Відкрий наступну фазу ✅
