# Фаза 4: P2 -- Уніфікація Browser Automation і Scheduler

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Оцінити та (за можливості) мігрувати ProKoleso scraper з Puppeteer на Playwright для уніфікації browser-движків. Переконатися що scheduler працює автоматично (через Payload-integrated scheduler, systemd timer або cron).

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити Puppeteer API, що використовується в prokoleso.ts (launch, newPage, goto, evaluate, $, $$, waitForSelector, etc.)
- [ ] Вивчити як Playwright використовується в інших скрейперах (adac.ts, autobild.ts, tyrereviews.ts)
- [ ] Перевірити Playwright API сумісність з Puppeteer API для кожного методу
- [ ] Вивчити scheduler.ts -- як запускаються задачі, є чи cron-розклад
- [ ] Перевірити backend-payload/src/scheduler/ -- Payload-integrated scheduler

**Команди для пошуку:**
```bash
# Puppeteer API використання в prokoleso.ts
grep -n "puppeteer\|browser\.\|page\.\|launch\|newPage\|goto\|evaluate\|\$\$\|waitFor" backend-payload/content-automation/src/scrapers/prokoleso.ts
# Playwright API в інших скрейперах
grep -n "chromium\|browser\.\|page\.\|launch\|newPage\|goto\|evaluate" backend-payload/content-automation/src/scrapers/adac.ts
# Scheduler
ls -la backend-payload/src/scheduler/ 2>/dev/null
grep -rn "cron\|schedule\|timer" backend-payload/src/scheduler/
# Deprecated cron.ts
head -20 backend-payload/content-automation/src/cron.ts
```

#### B. Аналіз залежностей
- [ ] Чи можна видалити puppeteer з package.json після міграції?
- [ ] Playwright вже в залежностях? (перевірити package.json)
- [ ] Скільки часу потребує міграція (оцінка складності)?

**Puppeteer залежності:** -
**Playwright залежності:** -
**Складність міграції:** -

#### C. Оцінка ризиків міграції
- [ ] Чи є Puppeteer-специфічний функціонал без аналогу в Playwright?
- [ ] page.evaluate() -- однаковий синтаксис?
- [ ] Обробка помилок, timeout-и -- чи є різниця?

**Ціль:** Приняти обґрунтоване рішення: мігрувати зараз або задокументувати як TODO.

**Нотатки для перевикористання:** -

---

### 4.1 Оцінити можливість міграції ProKoleso з Puppeteer на Playwright
- [ ] Скласти таблицю відповідності API: Puppeteer метод -> Playwright аналог
- [ ] Визначити breaking changes (якщо є)
- [ ] Прийняти рішення: мігрувати / відкласти
- [ ] Якщо рішення "відкласти" -- створити TODO коментар в prokoleso.ts з обґрунтуванням

**Файли:** `backend-payload/content-automation/src/scrapers/prokoleso.ts`
**Нотатки:** Аудит: M-1. Обидва движки в одному проекті -- подвійні залежності.

---

### 4.2 Виконати міграцію (якщо прийнято рішення мігрувати)
- [ ] Замінити `import puppeteer from 'puppeteer'` на `import { chromium } from 'playwright'`
- [ ] Оновити `browser = await puppeteer.launch(...)` на `browser = await chromium.launch(...)`
- [ ] Оновити `page.$()` на `page.locator()` або `page.$()` (Playwright підтримує обидва)
- [ ] Оновити `page.$$()` та `page.$eval()` відповідно
- [ ] Перевірити `page.evaluate()` -- зазвичай працює однаково
- [ ] Оновити обробку помилок та timeout-и
- [ ] Прибрати puppeteer з package.json (якщо більше не використовується)

**Файли:** `backend-payload/content-automation/src/scrapers/prokoleso.ts`, `backend-payload/package.json`
**Нотатки:** Якщо міграція складна -- пропустити цю задачу та задокументувати.

---

### 4.3 Перевірити Payload-integrated scheduler
- [ ] Перевірити наявність `backend-payload/src/scheduler/` директорії
- [ ] Вивчити як задачі реєструються (cron expressions, handlers)
- [ ] Перевірити чи scheduler запускається автоматично при старті Payload CMS
- [ ] Перевірити timezone: Europe/Kyiv

**Файли:** `backend-payload/src/scheduler/`, `backend-payload/content-automation/src/scheduler.ts`
**Нотатки:** Аудит: M-2. cron.ts помічено як deprecated. scheduler.ts -- тільки CLI.

---

### 4.4 Налаштувати автоматичний запуск задач
- [ ] Якщо Payload scheduler працює -- переконатися що задачі зареєстровані:
  - Weekly automation (неділя 03:00)
  - Smart articles (середа 05:00)
- [ ] Якщо Payload scheduler НЕ працює -- налаштувати альтернативу:
  - Варіант A: systemd timer
  - Варіант B: crontab entry
  - Варіант C: docker-compose cron service
- [ ] Переконатися що timezone Europe/Kyiv

**Файли:** -
**Нотатки:** Поточно задачі запускаються тільки вручну через Telegram bot або admin API.

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
   git commit -m "checklist(content-automation-fixes): phase-4 browser and scheduler unification completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 5
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
