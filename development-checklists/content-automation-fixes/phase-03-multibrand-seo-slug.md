# Фаза 3: P2 -- Tire SEO Multi-brand і Slug транслітерація

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати multi-brand підтримку в tire-seo.ts (аналогічно tire-description.ts). Реалізувати ua-to-latin транслітерацію для slug-ів статей, щоб URL були SEO-friendly замість URL-encoded кирилиці.

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити як multi-brand реалізовано в `tire-description.ts` (BRAND_NAMES, getSystemPromptsForBrand)
- [ ] Вивчити як multi-brand реалізовано в `tire-faq.ts`
- [ ] Порівняти з поточним кодом `tire-seo.ts` (hardcoded "Bridgestone")
- [ ] Перевірити наявність бібліотек транслітерації в package.json (transliteration, slugify)
- [ ] Вивчити поточну функцію `generateSlug()` в `article-generator.ts`

**Команди для пошуку:**
```bash
# Multi-brand в інших генераторах
grep -n "BRAND_NAMES\|getSystemPrompts\|brand" backend-payload/content-automation/src/processors/content/tire-description.ts
grep -n "BRAND_NAMES\|getSystemPrompts\|brand" backend-payload/content-automation/src/processors/content/tire-faq.ts
# Hardcoded brand в tire-seo.ts
grep -n "Bridgestone\|brand" backend-payload/content-automation/src/processors/content/tire-seo.ts
# Поточна slug-генерація
grep -n "generateSlug\|slug" backend-payload/content-automation/src/processors/content/article-generator.ts
# Бібліотеки транслітерації
grep "transliteration\|slugify\|transliter" backend-payload/package.json
```

#### B. Аналіз залежностей
- [ ] Чи потрібно додати поле `brand` в TireSEOInput інтерфейс?
- [ ] Звідки TireSEOInput отримує дані (scheduler.ts, pipeline)?
- [ ] Чи потрібно встановити нову npm-залежність для транслітерації?

**Нові залежності:** -
**Зміни інтерфейсів:** TireSEOInput (додати brand)

#### C. Перевірка патернів
- [ ] Як tire-description.ts вирішує fallback для невідомого бренду?
- [ ] Чи є unit-тести для tire-seo.ts та article-generator.ts?

**Ціль:** Зрозуміти патерн multi-brand та вибрати підхід до транслітерації.

**Нотатки для перевикористання:** -

---

### 3.1 Додати multi-brand підтримку в tire-seo.ts
- [ ] Додати поле `brand` в `TireSEOInput` інтерфейс
- [ ] Імпортувати `BRAND_NAMES` з конфігурації (або створити якщо не існує)
- [ ] Замінити hardcoded `"Bridgestone"` на `BRAND_NAMES[input.brand]` в промпті (рядок ~41)
- [ ] Додати fallback для випадку коли brand не вказано (default "Bridgestone")
- [ ] Перевірити що виклики tire-seo з scheduler.ts передають brand

**Файли:** `backend-payload/content-automation/src/processors/content/tire-seo.ts`
**Нотатки:** Аудит: M-3. tire-description.ts і tire-faq.ts вже підтримують multi-brand -- використати як референс.

---

### 3.2 Реалізувати ua-to-latin транслітерацію для slug-ів
- [ ] Вибрати підхід:
  - Варіант A: Встановити бібліотеку `transliteration` або `slugify`
  - Варіант B: Написати маппінг кириллиця->латиниця (український алфавіт)
- [ ] Реалізувати функцію `transliterateSlug(title: string): string`
- [ ] Інтегрувати в `generateSlug()` в article-generator.ts (рядки 182-189)

**Файли:** `backend-payload/content-automation/src/processors/content/article-generator.ts`
**Нотатки:** Аудит: M-4. Поточний код зберігає кирилицю в slug, що створює URL-encoded URL типу `%D1%8F%D0%BA-%D0%BE%D0%B1%D1%80%D0%B0%D1%82%D0%B8-...`

---

### 3.3 Протестувати генерацію slug-а для кириличного заголовка
- [ ] Написати тест або вручну перевірити транслітерацію:
  - `"Як обрати зимові шини"` -> `"yak-obraty-zymovi-shyny"`
  - `"Огляд Bridgestone Turanza"` -> `"ohlyad-bridgestone-turanza"`
  - `"Що таке Run-Flat технологія?"` -> `"shcho-take-run-flat-tekhnolohiya"`
- [ ] Перевірити edge cases: символи ї, є, ґ, апостроф
- [ ] Перевірити що slug не містить подвійних дефісів та не починається/закінчується дефісом

**Файли:** -
**Нотатки:** Українська транслітерація має специфіку (ї->yi, є->ye, ґ->g, щ->shch тощо)

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
   git commit -m "checklist(content-automation-fixes): phase-3 multibrand seo and slug transliteration completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 4
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
