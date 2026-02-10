# Фаза 5: Покращення FAQ генерації

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Вирішити дві проблеми з FAQ:

1. **Шаблонні питання** — всі 5 FAQ однакові для кожної моделі. Замінено на 3 стандартних + 2 динамічних (на основі технологій, EU Label, тестових результатів).

2. **Зайві HTML-правила в system prompt** — `tireFAQ` system prompt включає `SEO_FORMATTING_RULES` з інструкціями про HTML теги. FAQ відповіді — plain text. Видалено зайві правила.

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Прочитати `tire-faq.ts:buildPrompt()` — список фіксованих питань
- [x] Прочитати `prompts/index.ts:getSystemPromptsForBrand().tireFAQ` — system prompt
- [x] Прочитати `prompts/tire-faq.md` — шаблон промпту
- [x] Прочитати `tire-faq.ts:validateFAQs()` — обмеження на довжину відповіді
- [x] Прочитати фронтенд `FAQSection` компонент — як відображаються відповіді

---

### 5.1 Додати модельно-специфічні питання у промпт
- [x] У `tire-faq.ts:buildPrompt()`, додати умовні питання на основі вхідних даних
- [x] Замінити фіксований список 5 питань на 3 обов'язкових + 2 динамічних
- [x] Оновити інструкцію: "3 стандартних + 2 модельно-специфічних питання"

**Файли:** `backend-payload/content-automation/src/processors/content/tire-faq.ts`

---

### 5.2 Оновити промпт-шаблон FAQ
- [x] У `prompts/tire-faq.md` — оновити секцію "Required Questions"
- [x] Додати секцію "Динамічні питання" з прикладами
- [x] Додати інструкцію: "Хоча б 2 питання мають бути унікальними для цієї моделі"

**Файли:** `backend-payload/content-automation/src/prompts/tire-faq.md`

---

### 5.3 Видалити `SEO_FORMATTING_RULES` з FAQ system prompt
- [x] У `prompts/index.ts`, `SYSTEM_PROMPTS.tireFAQ` — видалити `${SEO_FORMATTING_RULES}`
- [x] У `prompts/index.ts`, `getSystemPromptsForBrand().tireFAQ` — видалити `${SEO_FORMATTING_RULES}`
- [x] Додати замість цього: "Відповіді — plain text, 2-3 речення. Без HTML тегів у відповідях."

**Файли:** `backend-payload/content-automation/src/prompts/index.ts`

---

### 5.4 Передати testResults у FAQ input
- [x] У `index.ts:173-179`, додати дані про тестові результати у `TireFAQInput`
- [x] Якщо `TireFAQInput` не має поля для тестів — додати опціональне поле `testResults?: string`
- [x] Форматувати тестові результати як рядок

**Файли:**
- `backend-payload/content-automation/src/processors/content/tire-faq.ts`
- `backend-payload/content-automation/src/processors/content/index.ts`

---

### 5.5 Перевірка та тестування
- [x] Запустити генерацію FAQ для тестової моделі з технологіями та EU Label
- [x] Перевірити що з 5 FAQ хоча б 2 модельно-специфічні
- [x] Перевірити що відповіді — plain text без HTML тегів
- [x] Перевірити FAQSection відображення на фронтенді
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
