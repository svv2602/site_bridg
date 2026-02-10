# Фаза 4: P2 -- Web Vitals, Structured Logging, Frontend Health

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати трекінг Core Web Vitals (LCP, CLS, INP), замінити console.log на structured logger в contact route, додати frontend /api/health endpoint, задокументувати налаштування зовнішнього моніторингу.

**Джерело:** ANALYTICS_MONITORING_AUDIT M1, M3, M6, RELEASE_READINESS_REPORT P2-42..44

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Перевірити чи Sentry BrowserTracing вже збирає Web Vitals (tracesSampleRate)
- [ ] Вивчити contact/route.ts — які console.log замінити
- [ ] Перевірити чи є бекенд health endpoint як референс для frontend

**Команди для пошуку:**
```bash
# Sentry BrowserTracing
grep -n "BrowserTracing\|tracesSampleRate\|webVitals\|web-vitals" frontend/sentry.client.config.ts
# Console.log в contact route
grep -n "console.log\|console.error" frontend/src/app/api/contact/route.ts
# Backend health endpoint як референс
grep -rn "health\|status.*ok\|healthy" backend-payload/src/endpoints/health.ts | head -10
```

#### B. Аналіз залежностей
- [ ] Чи встановлена бібліотека `web-vitals`? (`grep "web-vitals" frontend/package.json`)
- [ ] Чи є structured logger на фронтенді або тільки на бекенді?

**Нові типи:** -
**Нові API-функції:** Frontend /api/health route
**Нові компоненти:** Можливо WebVitalsReporter

**Ціль:** Зрозуміти поточний стан моніторингу та визначити що додати.

**Нотатки для перевикористання:** Backend health endpoint (backend-payload/src/endpoints/health.ts) як референс

---

### 4.1 Додати Web Vitals трекінг
- [ ] Перевірити чи Sentry вже збирає Web Vitals через BrowserTracing
- [ ] Якщо ні — додати reportWebVitals через `web-vitals` бібліотеку або Sentry
- [ ] Варіант 1: Sentry BrowserTracing (якщо вже налаштований — достатньо)
- [ ] Варіант 2: web-vitals + відправка в GA4:
  ```tsx
  import { onLCP, onCLS, onINP } from 'web-vitals';
  onLCP(metric => gtag('event', metric.name, { value: metric.value }));
  onCLS(metric => gtag('event', metric.name, { value: metric.value }));
  onINP(metric => gtag('event', metric.name, { value: metric.value }));
  ```

**Файли:** `frontend/src/components/Analytics.tsx` або окремий `WebVitals.tsx`
**Нотатки:** Якщо Sentry BrowserTracing вже збирає CWV — можна пропустити цю задачу і тільки задокументувати

---

### 4.2 Замінити console.log на structured logging в contact route
- [ ] Замінити `console.log('Contact form submission:', {...})` на структуровану відповідь
- [ ] Замінити `console.error(...)` на структуроване логування з context
- [ ] Варіант: JSON.stringify з полями `{ level, message, timestamp, data }`
- [ ] Або створити простий logger utility для frontend API routes

**Файли:** `frontend/src/app/api/contact/route.ts`
**Нотатки:** Не потрібен повний logger як на бекенді — достатньо JSON-формату для production logs

---

### 4.3 Додати frontend /api/health endpoint
- [ ] Створити `frontend/src/app/api/health/route.ts`
- [ ] Повертати JSON:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-02-10T12:00:00.000Z",
    "service": "frontend"
  }
  ```
- [ ] Додати `Cache-Control: no-cache, no-store` header
- [ ] Перевірити що endpoint працює: `curl http://localhost:3010/api/health`

**Файли:** `frontend/src/app/api/health/route.ts`
**Нотатки:** Простий endpoint для зовнішнього моніторингу (UptimeRobot, BetterUptime)

---

### 4.4 Задокументувати налаштування зовнішнього моніторингу
- [ ] Додати коментар в health endpoint файл з рекомендаціями:
  - UptimeRobot (безкоштовний, 5-хв інтервал)
  - BetterUptime
  - Або простий cron + curl скрипт
- [ ] Вказати які endpoints моніторити:
  - Frontend: `https://bridgestone.ua/api/health`
  - Backend: `https://api.bridgestone.ua/api/health`

**Файли:** `frontend/src/app/api/health/route.ts`
**Нотатки:** Документація як коментарі в коді — не потрібен окремий файл

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
   git commit -m "checklist(analytics-monitoring-fixes): phase-4 Web Vitals, logging, health endpoint completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 5
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
