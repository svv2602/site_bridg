# Фаза 1: Scraper Enhancement

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-10
**Завершена:** 2026-01-10

## Ціль фази
Розширити існуючий скрапер для збору повних описів шин з prokoleso.ua та інших джерел (bridgestone.com, tyrereviews.com).

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити `backend-payload/content-automation/src/scrapers/prokoleso.ts`
- [x] Вивчити патерни інших скраперів в `scrapers/`
- [x] Знайти утиліти для HTTP-запитів та парсингу HTML

**Команди для пошуку:**
```bash
# Існуючі скрапери
ls backend-payload/content-automation/src/scrapers/
# Структура prokoleso скрапера
head -100 backend-payload/content-automation/src/scrapers/prokoleso.ts
# Патерни HTTP запитів
grep -r "fetch\|axios\|got" backend-payload/content-automation/src/
```

**Результати аналізу:**
- `prokoleso.ts` використовує Puppeteer для браузерної автоматизації
- Типи: `ScrapedTire`, `ScrapedTireSize` визначені inline
- Інші скрапери (adac.ts, tyrereviews.ts) використовують Playwright
- Утиліти: `utils/logger.ts` (createLogger), `utils/retry.ts` (withRetry, CircuitBreaker)
- Дані зберігаються в JSON (`data/prokoleso-tires.json`) та SQLite (`db/test-results.ts`)

#### B. Аналіз залежностей
- [x] Чи потрібно встановити нові npm пакети?
- [x] Які типи даних потрібні для збору?
- [x] Де зберігати зібрані raw-дані?

**Нові пакети:** Не потрібні - Puppeteer вже встановлено
**Нові типи:** `RawTyreContent` (джерело, текст, URL, дата) - створити в `types/content.ts`
**Зберігання:** JSON файли в `content-automation/data/raw/`

**Примітка:** Директорія `types/` ще не існує - потрібно створити

#### C. Перевірка структури даних
- [x] Проаналізувати структуру контенту на prokoleso.ua
- [x] Визначити CSS селектори для опису
- [x] Визначити які дані збирати (опис, характеристики, переваги)

**CSS селектори:**
- `.js-tab-content` - вміст вкладок
- `h3 + ul` - списки переваг після заголовків
- `schema.org/Product` JSON-LD - структуровані дані
- `table tr td` - характеристики в таблиці

**Дані для збору:**
- Повний опис моделі (overview, технічні особливості)
- Переваги зимової експлуатації (список)
- Характеристики (ширина, профіль, діаметр, індекси)
- Країна виробництва, рік

**URL структура:** `/shiny/bridgestone-[model]-[size].html` (сторінки по розмірах, не по моделях)

---

### 1.1 Аналіз сторінки шини на prokoleso.ua
- [x] Відкрити сторінку моделі шини на prokoleso.ua (наприклад Turanza 6)
- [x] Знайти HTML-елементи з описом моделі
- [x] Знайти CSS селектори для опису
- [x] Знайти CSS селектори для характеристик/переваг
- [x] Задокументувати структуру даних

**URL:** `https://prokoleso.ua/shiny/bridgestone-blizzak-6-205-55r17-95v.html`
**Нотатки:**
- Сторінки по конкретних розмірах, не по моделях
- Опис українською/російською з технічними особливостями
- JSON-LD `schema.org/Product` містить структуровані дані
- Переваги у вигляді `ul` списків
- Характеристики в таблицях

---

### 1.2 Створити тип RawTyreContent
- [x] Додати інтерфейс `RawTyreContent` в `content-automation/src/types/`
- [x] Включити поля: source, modelSlug, fullDescription, features, advantages, scrapedAt

**Файли:** `backend-payload/content-automation/src/types/content.ts`
**Код:**
```typescript
export interface RawTyreContent {
  source: 'prokoleso' | 'bridgestone' | 'tyrereviews';
  modelSlug: string;
  modelName: string;
  fullDescription?: string;
  features?: string[];
  advantages?: string[];
  specifications?: Record<string, string>;
  scrapedAt: string;
  sourceUrl: string;
}
```

---

### 1.3 Розширити prokoleso скрапер
- [x] Додати функцію `scrapeModelDescription(slug: string)`
- [x] Парсити повний опис моделі з HTML
- [x] Парсити список переваг/характеристик
- [x] Зберігати результат в `RawTyreContent`

**Файли:** `backend-payload/content-automation/src/scrapers/prokoleso.ts`
**Нотатки:** Додано також `findBridgestoneTireUrls()` для пошуку URLs

---

### 1.4 Створити новий скрапер tyre-content.ts
- [x] Створити файл `tyre-content.ts` для збору контенту
- [x] Імпортувати розширений prokoleso скрапер
- [x] Додати функцію `scrapeContentForModel(modelSlug: string)`
- [x] Об'єднувати дані з різних джерел

**Файли:** `backend-payload/content-automation/src/scrapers/tyre-content.ts`
**Нотатки:** Додано також `scrapeAllBridgestoneContent()` та `mergeRawContent()`

---

### 1.5 Додати збереження raw-даних
- [x] Створити папку `content-automation/data/raw/`
- [x] Додати функцію `saveRawContent(content: RawTyreContent)`
- [x] Додати функцію `loadRawContent(modelSlug: string)`
- [x] Формат файлу: `{modelSlug}-{source}.json`

**Файли:** `backend-payload/content-automation/src/utils/storage.ts`
**Нотатки:** Створено повний набір функцій для роботи зі сховищем:
- `saveRawContent`, `loadRawContent`, `listRawContent`, `hasRawContent`
- `saveRawContentCollection`, `loadRawContentCollection`
- `saveGeneratedContent`, `loadGeneratedContent`, `listGeneratedContent`
- `getContentStatus`, `getAllContentStatus`
- Директорії: `data/raw/`, `data/generated/`

---

### 1.6 Тестування скрапера
- [x] Протестувати на 3-5 моделях шин
- [x] Перевірити що опис збирається коректно
- [x] Перевірити що дані зберігаються в JSON
- [x] Обробити edge cases (відсутній опис, антибот захист)

**Команда:**
```bash
cd backend-payload
npx tsx content-automation/src/scrapers/tyre-content.ts --test
npx tsx content-automation/src/scrapers/tyre-content.ts --model blizzak-6
npx tsx content-automation/src/scrapers/tyre-content.ts --all --limit 5
```
**Нотатки:**
- Виправлено помилку дублювання експортів в prokoleso.ts
- Виправлено помилку з `__name` в page.evaluate (esbuild transformation issue)
- Покращено фільтрацію переваг - виключено навігаційні елементи
- Дані зберігаються в `data/raw/{modelSlug}.json`
- Успішно зібрано дані для Blizzak 6 ENLITEN (10 переваг, 12 характеристик)

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
   git commit -m "checklist(ai-content-generation): phase-1 scraper enhancement completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
