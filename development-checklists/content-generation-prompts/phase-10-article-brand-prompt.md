# Фаза 10: Brand-specific system prompt для статей

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
`generateArticle()` тепер використовує `getSystemPromptsForBrand(brand).article` коли `brand` вказано, інакше загальний `SYSTEM_PROMPTS.article`. Brand визначається автоматично з triggerData або related tyres.

## Задачі

### 10.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Прочитати `article-generator.ts:256` — виклик `SYSTEM_PROMPTS.article`
- [x] Прочитати `prompts/index.ts:193-247` — `getSystemPromptsForBrand()`
- [x] Прочитати `article-pipeline.ts:330-335` — як формуються `tireModels`
- [x] Прочитати `article-pipeline.ts:297-312` — relatedTyres
- [x] Перевірити як визначається бренд у tyre pipeline

#### B. Обрати підхід
- [x] Варіант A: Додати опціональний `brand?: Brand` в `ArticleInput` ← ОБРАНО

**Обране рішення:** Варіант A

---

### 10.1 Додати `brand` у `ArticleInput`
- [x] У `article-generator.ts`, додати поле `brand?: Brand`
- [x] Імпортувати тип `Brand` з `types/content.ts`

**Файли:** `backend-payload/content-automation/src/processors/content/article-generator.ts`

---

### 10.2 Використати brand-specific system prompt
- [x] У `generateArticle()` — якщо `input.brand` вказаний, використовувати `getSystemPromptsForBrand(input.brand).article`
- [x] Якщо не вказаний — загальний `SYSTEM_PROMPTS.article`
- [x] Імпортувати `getSystemPromptsForBrand`

**Файли:** `backend-payload/content-automation/src/processors/content/article-generator.ts`

---

### 10.3 Передати brand з pipeline
- [x] У `article-pipeline.ts:buildGenerationContext()` — визначити brand з triggerData або relatedTyres
- [x] Додати `brand` у `context.input`

**Файли:** `backend-payload/content-automation/src/article-pipeline.ts`

---

### 10.4 Перевірка та тестування
- [x] Перевірити що brand-specific prompt використовується для Firestone
- [x] Перевірити що загальний prompt працює без brand
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
