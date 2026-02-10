# Фаза 2: P1 -- Рефакторинг дублювання в ProKoleso Scraper

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Видалити дублювання типів та конфігурації в prokoleso.ts. Імпортувати типи з types.ts, конфіг з config.ts. Інтегрувати AdaptiveDelay з config.ts.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Порівняти типи в `prokoleso.ts` з типами в `types.ts` (ScrapedTireSize, EuLabel, ScrapedTire, ProcessingFlags, ExistingTireRecord, ScrapeOptions, ScrapeResult)
- [ ] Порівняти константи в `prokoleso.ts` з `config.ts` (BRAND_CATALOGS, ADDITIONAL_MODEL_URLS, MAX_CATALOG_PAGES, BASE_URL)
- [ ] Визначити що є в config.ts, але не використовується в prokoleso.ts (AdaptiveDelay, getRandomUserAgent, sanity-checks)

**Команди для пошуку:**
```bash
# Типи в prokoleso.ts
grep -n "interface\|type " backend-payload/content-automation/src/scrapers/prokoleso.ts
# Типи в types.ts
grep -n "interface\|type " backend-payload/content-automation/src/scrapers/types.ts
# Константи в prokoleso.ts
grep -n "const BRAND_CATALOGS\|const ADDITIONAL\|const MAX_CATALOG\|const BASE_URL" backend-payload/content-automation/src/scrapers/prokoleso.ts
# Константи в config.ts
grep -n "export " backend-payload/content-automation/src/scrapers/config.ts
# Хто імпортує з prokoleso.ts
grep -rn "from.*prokoleso" backend-payload/content-automation/src/
```

#### B. Аналіз залежностей
- [ ] Які файли імпортують типи з prokoleso.ts (scheduler.ts, telegram-commands.ts)?
- [ ] Чи потрібно оновити ці імпорти на types.ts?
- [ ] Чи є різниця між типами (додаткові поля, інші назви)?

**Імпортери prokoleso.ts:** -
**Різниці в типах:** -

#### C. План рефакторингу
- [ ] Скласти список типів для видалення з prokoleso.ts
- [ ] Скласти список констант для видалення з prokoleso.ts
- [ ] Визначити порядок змін (спочатку типи, потім константи)

**Ціль:** Зрозуміти точний обсяг дублювання та план безпечного рефакторингу.

**Нотатки для перевикористання:** -

---

### 2.1 Визначити дублюючі типи в prokoleso.ts vs types.ts
- [ ] Скласти таблицю: тип | prokoleso.ts рядок | types.ts рядок | різниця
- [ ] Відмітити які типи ідентичні, які мають відмінності
- [ ] Для типів з відмінностями -- вирішити яку версію залишити (зазвичай types.ts)

**Файли:** `backend-payload/content-automation/src/scrapers/prokoleso.ts`, `backend-payload/content-automation/src/scrapers/types.ts`
**Нотатки:** За аудитом дублюються: ScrapedTireSize, EuLabel, ScrapedTire, ProcessingFlags, ExistingTireRecord, ScrapeOptions, ScrapeResult

---

### 2.2 Замінити локальні типи на імпорт з types.ts
- [ ] Додати `import { ScrapedTireSize, EuLabel, ScrapedTire, ... } from './types'` в prokoleso.ts
- [ ] Видалити локальні оголошення цих типів з prokoleso.ts
- [ ] Перевірити що TypeScript компіляція проходить без помилок
- [ ] Оновити імпорти в інших файлах, які імпортували типи з prokoleso.ts

**Файли:** `backend-payload/content-automation/src/scrapers/prokoleso.ts`
**Нотатки:** -

---

### 2.3 Визначити дублюючі константи/конфіг в prokoleso.ts vs config.ts
- [ ] Порівняти BRAND_CATALOGS, ADDITIONAL_MODEL_URLS, MAX_CATALOG_PAGES, BASE_URL
- [ ] Перевірити чи config.ts має покращену версію (adaptive delay, user-agent rotation)
- [ ] Визначити які константи можна імпортувати з config.ts

**Файли:** `backend-payload/content-automation/src/scrapers/prokoleso.ts`, `backend-payload/content-automation/src/scrapers/config.ts`
**Нотатки:** config.ts містить AdaptiveDelay, getRandomUserAgent() та sanity-checks, яких немає в prokoleso.ts

---

### 2.4 Замінити локальні константи на імпорт з config.ts
- [ ] Додати `import { BRAND_CATALOGS, ... } from './config'` в prokoleso.ts
- [ ] Видалити дублюючі оголошення з prokoleso.ts
- [ ] Перевірити що значення співпадають (або config.ts має кращу версію)
- [ ] Перевірити що скрейпер працює після рефакторингу

**Файли:** `backend-payload/content-automation/src/scrapers/prokoleso.ts`
**Нотатки:** -

---

### 2.5 Перевірка працездатності після рефакторингу
- [ ] Запустити TypeScript компіляцію: `cd backend-payload && npx tsc --noEmit` (або перевірити що наявні TS-помилки не нові)
- [ ] Запустити тести: `cd backend-payload && npm run test`
- [ ] Якщо доступно -- спробувати `npm run automation:scrape -- --dry-run`

**Файли:** -
**Нотатки:** Проект має pre-existing TS-помилки в content-automation (відомо з MEMORY.md)

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
   git commit -m "checklist(content-automation-fixes): phase-2 prokoleso deduplication completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
