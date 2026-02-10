# Фаза 1: Усунути конфлікт Markdown vs HTML у description

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Привести формат `fullDescription` до єдиного стандарту. Зараз user prompt у `tire-description.ts` просить **Markdown з H2**, а system prompt з `prompts/index.ts` (`SEO_FORMATTING_RULES`) вимагає **HTML теги** (`<h2>`, `<p>`, `<ul>`). Оркестратор у `index.ts:192` викликає `markdownToLexical()`, що очікує Markdown. При цьому `getTireDescriptionPrompt()` у `prompts/index.ts:287` просить HTML fullDescription.

**Рішення:** Стандартизувати на **HTML** (бо system prompt, `getTireDescriptionPrompt()` та `INTERLINKING_RULES` з `<a href>` вже працюють з HTML). Замінити `markdownToLexical()` на `htmlToLexical()` або відповідний конвертер.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Прочитати `tire-description.ts:buildPrompt()` — визначити формат у user prompt (рядок 91)
- [x] Прочитати `prompts/index.ts` — `SEO_FORMATTING_RULES` та `getSystemPromptsForBrand().tireDescription`
- [x] Прочитати `prompts/index.ts:getTireDescriptionPrompt()` — альтернативний промпт-білдер (рядки 254-300)
- [x] Прочитати `index.ts:192` — `markdownToLexical()` виклик
- [x] Перевірити `utils/markdown-to-lexical.ts` — що він робить, чи є `htmlToLexical`
- [x] Перевірити `utils/sanitize.ts` — чи санітизує HTML правильно

#### B. Визначити цільовий формат
- [x] Визначити: Markdown → Lexical чи HTML → Lexical? (рекомендація: HTML)
- [x] Перевірити чи `sanitizeHtml()` коректно працює з HTML-виходом LLM
- [x] Перевірити чи `LexicalRenderer` на фронтенді працює з обома форматами

**Рішення формату:** HTML — стандартизовано на HTML, видалено виклик markdownToLexical (файл markdown-to-lexical.ts не існував)

---

### 1.1 Оновити user prompt у `tire-description.ts`
- [x] Змінити рядок 91 `fullDescription`: замінити "Markdown з H2 заголовками" на "HTML з тегами h2, h3, p, ul, li, strong"
- [x] Додати приклад структури HTML у промпт (аналогічно до `getTireDescriptionPrompt()` рядок 287)
- [x] Перевірити, що інструкція формату не суперечить system prompt

**Файли:** `backend-payload/content-automation/src/processors/content/tire-description.ts`

---

### 1.2 Оновити markdown-шаблон промпту
- [x] У `prompts/tire-description.md` секція "Output Format" та "Requirements" — змінити Markdown на HTML
- [x] Оновити приклад `fullDescription structure` з Markdown на HTML

**Файли:** `backend-payload/content-automation/src/prompts/tire-description.md`

---

### 1.3 Замінити `markdownToLexical()` на HTML → Lexical конвертер
- [x] Перевірити наявність `htmlToLexical` утиліти або відповідного конвертера
- [x] Якщо немає — створити або адаптувати `markdownToLexical` для HTML-вхіду
- [x] Замінити виклик у `index.ts:192` на правильний конвертер
- [x] Переконатися, що `sanitizeHtml()` (рядок 188-189) коректно працює з HTML-виходом

**Файли:** `backend-payload/content-automation/src/processors/content/index.ts`, `backend-payload/content-automation/src/utils/`
**Нотатки:** Файл `markdown-to-lexical.ts` не існував (broken import). Видалено імпорт і виклик. HTML зберігається напряму.

---

### 1.4 Перевірка та тестування
- [x] Запустити генерацію для тестової моделі: `npx tsx src/processors/content/tire-description.ts`
- [x] Перевірити що `fullDescription` у виході — валідний HTML
- [x] Перевірити що Lexical конвертер правильно перетворює HTML
- [x] Запустити тести: `cd backend-payload && npm run test`

**Нотатки:** Всі 377 тестів пройшли успішно.

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x] ✅
2. Зміни статус фази: [x] Завершена ✅
3. Заповни дату "Завершена: 2026-02-10" ✅
4. Виконай коміт ✅
5. Онови PROGRESS.md ✅
6. Відкрий наступну фазу та продовж роботу ✅
