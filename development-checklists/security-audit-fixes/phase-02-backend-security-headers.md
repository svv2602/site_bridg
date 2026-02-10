# Фаза 2: P0 Blockers -- Security Headers на Backend

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Backend (Payload CMS) повинен повертати security headers для захисту від clickjacking, MIME-sniffing та розкриття стеку технологій. Видалити X-Powered-By.

**Джерело:** SECURITY_AUDIT HIGH-2, RELEASE_READINESS_REPORT P0-2

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити як security headers додані на frontend (next.config.ts)
- [ ] Знайти де в payload.config.ts можна додати middleware або headers
- [ ] Перевірити чи Payload CMS v3 підтримує custom middleware або serverURL конфігурацію

**Команди для пошуку:**
```bash
# Перевірити frontend headers як референс
grep -n "headers" frontend/next.config.ts
# Перевірити payload.config.ts структуру
grep -n "serverURL\|express\|middleware\|headers\|poweredByHeader" backend-payload/payload.config.ts
# Перевірити Payload CMS опції
grep -rn "poweredByHeader\|X-Powered-By" backend-payload/
```

#### B. Аналіз залежностей
- [ ] Чи потрібно додавати express middleware або це робиться через Payload config?
- [ ] Чи є в Payload CMS v3 вбудована опція для headers?

**Нові типи:** -
**Нові API-функції:** Можливо custom Next.js middleware для backend
**Нові компоненти:** -

#### C. Перевірка дизайну
- [ ] Порівняти список headers з frontend — backend має мати аналогічний набір

**Ціль:** Зрозуміти механізм додавання headers в Payload CMS v3 (Next.js-based).

**Нотатки для перевикористання:** -

---

### 2.1 Додати security headers в payload.config.ts
- [ ] Додати `X-Content-Type-Options: nosniff`
- [ ] Додати `X-Frame-Options: DENY`
- [ ] Додати `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Додати `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**Файли:** `backend-payload/payload.config.ts`
**Нотатки:** Payload CMS v3 побудований на Next.js — headers можна додати через next.config або custom middleware. Перевірити `backend-payload/next.config.mjs` для Next.js headers.

---

### 2.2 Видалити X-Powered-By
- [ ] Додати `poweredByHeader: false` в Next.js конфіг backend або відповідний Payload конфіг
- [ ] Переконатися що відповіді не містять `X-Powered-By: Next.js, Payload`

**Файли:** `backend-payload/payload.config.ts` або `backend-payload/next.config.mjs`
**Нотатки:** Payload CMS може додавати свій `X-Powered-By` окремо від Next.js

---

### 2.3 Тестування headers
- [ ] Протестувати curl -I що всі headers присутні:
  ```bash
  curl -I http://localhost:3001/api/tyres 2>&1 | grep -iE "x-content-type|x-frame|referrer-policy|permissions-policy|x-powered"
  ```
- [ ] Переконатися що `X-Powered-By` відсутній у відповіді

**Файли:** -
**Нотатки:** Backend повинен бути перезапущений після змін

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
   git commit -m "checklist(security-audit-fixes): phase-2 backend security headers completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
