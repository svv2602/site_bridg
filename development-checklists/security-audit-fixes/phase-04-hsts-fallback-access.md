# Фаза 4: P2 -- HSTS, Fallback Secret, Access Control

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Розкоментувати HSTS header (для production), усунути fallback secret в payload.config.ts, додати явні access rules для ContactSubmissions та Media, мінімізувати health endpoint.

**Джерело:** SECURITY_AUDIT MEDIUM-1..5, RELEASE_READINESS_REPORT P2-24..27

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити поточний HSTS коментар в frontend/next.config.ts (рядки 53-58)
- [x] Вивчити fallback secret в payload.config.ts (рядок 167) та перевірку NODE_ENV (рядки 80-83)
- [x] Вивчити access rules ContactSubmissions.ts (рядки 24-27)
- [x] Вивчити access rules Media.ts (рядки 160-163)
- [x] Вивчити health endpoint (рядки 43-49)

#### B. Аналіз залежностей
- [x] Чи є інші колекції з неповними access rules? — ContactSubmissions та Media єдині з неповними
- [x] Чи використовує monitoring health endpoint поле version/environment? — Зроблено доступним тільки для auth users

---

### 4.1 Підготувати HSTS для production
- [x] HSTS header тепер умовно включається: spread `...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: '...' }] : [])`
- [x] В dev-середовищі не включається; в production автоматично активний

**Файли:** `frontend/next.config.ts`

---

### 4.2 Усунути fallback secret в payload.config.ts
- [x] Fallback secret подовжено та зроблено більш явним: `'dev-only-secret-change-me-in-production-min-32-chars'`
- [x] Існуюча перевірка NODE_ENV (рядки 80-87) вже throws якщо PAYLOAD_SECRET відсутній або < 32 chars в production
- [x] DATABASE_URI перевірка також вже на місці

**Файли:** `backend-payload/payload.config.ts`

---

### 4.3 Додати явні access rules для ContactSubmissions
- [x] Додано `update: ({ req }) => !!req.user` — тільки аутентифіковані
- [x] Додано `delete: ({ req }) => req.user?.role === 'admin'` — тільки admin

**Файли:** `backend-payload/src/collections/ContactSubmissions.ts`

---

### 4.4 Додати явні access rules для Media
- [x] Додано `create: ({ req }) => !!req.user` — тільки аутентифіковані
- [x] Додано `delete: ({ req }) => req.user?.role === 'admin'` — тільки admin

**Файли:** `backend-payload/src/collections/Media.ts`

---

### 4.5 Мінімізувати health endpoint
- [x] Поля `version` та `environment` тепер доступні тільки для аутентифікованих запитів (req.user)
- [x] Публічна відповідь містить: status, timestamp, latency, checks
- [x] Аутентифікована відповідь додатково містить: version, environment

**Файли:** `backend-payload/src/endpoints/health.ts`

---
