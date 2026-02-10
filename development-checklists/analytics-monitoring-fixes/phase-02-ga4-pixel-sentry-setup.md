# Фаза 2: P1 -- Налаштування GA4, Meta Pixel, Sentry

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Задокументувати процес налаштування GA4 property та Meta Pixel, додати env-змінні в .env.example, налаштувати SENTRY_DSN.

## Задачі

### 2.0 Аналіз
- [x] Перевірити frontend/.env.example — вже містив GA4, Meta Pixel, Sentry
- [x] Перевірити backend/.env.example — не містив SENTRY_DSN
- [x] Вивчити Analytics.tsx — коректна ініціалізація GA4 та Meta Pixel з consent
- [x] Вивчити sentry.ts на бекенді — dynamic require, graceful degradation

---

### 2.1 Документувати GA4 setup
- [x] Додано інструкції в frontend/.env.example

---

### 2.2 Документувати Meta Pixel setup
- [x] Додано інструкції в frontend/.env.example

---

### 2.3 Додати GA4 та Meta Pixel env-змінні
- [x] frontend/.env.example оновлено з пустими значеннями та інструкціями
- [x] Значення залишено порожніми — реальні ID додаються при налаштуванні

---

### 2.4 @sentry/node на backend
- [x] Backend sentry.ts вже використовує dynamic require — не потрібна hard dependency
- [x] Інструкція "npm install @sentry/node" задокументована в sentry.ts

---

### 2.5 Налаштувати SENTRY_DSN env-змінні
- [x] frontend/.env.example: NEXT_PUBLIC_SENTRY_DSN вже був, додано інструкцію
- [x] backend/.env.example: додано SENTRY_DSN з інструкцією

---
