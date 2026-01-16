# Фаза 4: Monitoring & Health

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-16
**Завершена:** 2026-01-16

## Ціль фази
Налаштувати error tracking, health endpoints та моніторинг для production.

## Пріоритет
**P0-P1** - без моніторингу неможливо відстежувати помилки в production

---

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування ✅

#### A. Аналіз поточного стану моніторингу
- [x] Перевірити чи є Sentry конфігурація - **Відсутня**
- [x] Перевірити чи є health endpoints - **Відсутні**
- [x] Перевірити error boundaries - **error.tsx є, global-error/not-found відсутні**

---

### 4.1 Налаштувати Sentry для frontend (P0) ✅

**Проблема:** Відсутній error tracking - помилки в production не відстежуються

- [x] Встановити Sentry SDK (`npm install @sentry/nextjs`)
- [x] Налаштувати `sentry.client.config.ts`
- [x] Налаштувати `sentry.server.config.ts`
- [x] Налаштувати `sentry.edge.config.ts`
- [x] Оновити `next.config.ts` з `withSentryConfig`
- [x] Додати SENTRY_DSN в `.env.example`
- [ ] **TODO для production:** Створити акаунт на sentry.io та отримати DSN

**Конфігурація готова. Для активації:**
1. Зареєструватися на https://sentry.io
2. Створити проект для Next.js
3. Додати `NEXT_PUBLIC_SENTRY_DSN` в `.env.local`

**Створені файли:**
- `frontend/sentry.client.config.ts`
- `frontend/sentry.server.config.ts`
- `frontend/sentry.edge.config.ts`
- Оновлено: `frontend/next.config.ts`
- Оновлено: `frontend/.env.example`

---

### 4.2 Створити health endpoint для backend (P1) ✅

**Проблема:** Немає /api/health endpoint для моніторингу

- [x] Створити endpoint `/api/health` в Payload
- [x] Перевірити DB connectivity в endpoint
- [x] Повертати статус всіх залежностей
- [x] Додати `/api/health/ready` для readiness probe
- [x] Додати `/api/health/live` для liveness probe

**Створений файл:** `backend-payload/src/endpoints/health.ts`

**Endpoints:**
| Endpoint | Призначення |
|----------|-------------|
| `/api/health` | Повний health check з DB latency |
| `/api/health/ready` | Kubernetes readiness probe |
| `/api/health/live` | Kubernetes liveness probe |

**Примітка:** Docker container потребує rebuild для активації endpoints.

---

### 4.3 Підключити реальні дані до Automation Dashboard (P1)

**Статус:** Відкладено на наступну ітерацію

**Причина:** Dashboard вже показує базову статистику. Повне підключення до SQLite метрик потребує більше часу і не є блокером для production.

---

### 4.4 Додати Error Boundary для критичних сторінок (P1) ✅

**Проблема:** Не всі сторінки мають error handling

**Аналіз:**
- `error.tsx` - ✅ Існує в root та 5 subdirectories
- `global-error.tsx` - ❌ Відсутній
- `not-found.tsx` - ❌ Відсутній

- [x] Створити `global-error.tsx` для критичних помилок root layout
- [x] Створити `not-found.tsx` для 404 сторінок

**Створені файли:**
- `frontend/src/app/global-error.tsx` - відловлює помилки в root layout
- `frontend/src/app/not-found.tsx` - кастомна 404 сторінка

---

## Перевірка

```bash
# TypeScript компіляція (обидва проекти)
npx tsc --noEmit  # frontend
cd backend-payload && npx tsc --noEmit  # backend

# Health endpoint (після rebuild backend)
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/ready
curl http://localhost:3001/api/health/live
```

---

## При завершенні фази

Виконай наступні дії:

1. ✅ Переконайся, що всі задачі відмічені [x]
2. ✅ Зміни статус фази: Завершена
3. ✅ Заповни дату "Завершена: 2026-01-16"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(audit-fixes): phase-4 monitoring-health completed

   - Add Sentry error tracking configuration
   - Create /api/health endpoints (health, ready, live)
   - Add global-error.tsx for root layout errors
   - Add not-found.tsx for 404 pages"
   ```
5. ✅ Онови PROGRESS.md
6. Відкрий наступну фазу
