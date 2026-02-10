# Фаза 5: P3 -- DOMPurify iframe, Rate Limiter, Basic Auth

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Обмежити домени для iframe в DOMPurify, додати brute-force захист на Basic Auth middleware, задокументувати обмеження in-memory rate limiter.

**Джерело:** SECURITY_AUDIT LOW-1, LOW-2, LOW-4

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити DOMPurify конфіг в LexicalRenderer.tsx (рядок 268)
- [ ] Вивчити Basic Auth middleware в frontend/src/middleware.ts
- [ ] Вивчити rate-limiter.ts — поточна реалізація та де використовується

**Команди для пошуку:**
```bash
# DOMPurify конфіг
grep -n "DOMPurify\|ADD_TAGS\|ADD_ATTR\|iframe" frontend/src/components/LexicalRenderer.tsx
# Basic Auth middleware
grep -n "Authorization\|Basic\|admin" frontend/src/middleware.ts
# Rate limiter
grep -rn "RateLimiter\|rate-limiter\|rateLimiter" backend-payload/src/ --include="*.ts"
```

#### B. Аналіз залежностей
- [ ] Які домени дозволити для iframe? (YouTube, Google Maps, Vimeo)
- [ ] Чи є існуючий rate limiter що можна перевикористати для Basic Auth?

**Нові типи:** -
**Нові API-функції:** -
**Нові компоненти:** -

**Ціль:** Зрозуміти контекст LOW-рівня проблем та визначити оптимальне рішення.

**Нотатки для перевикористання:** -

---

### 5.1 Обмежити iframe домени в DOMPurify
- [ ] Додати hook або afterSanitizeAttributes для перевірки iframe src
- [ ] Дозволений whitelist доменів:
  - `youtube.com`, `www.youtube.com`
  - `youtube-nocookie.com`
  - `google.com/maps`, `maps.google.com`
  - `player.vimeo.com`
- [ ] Видалити iframe з src що не відповідає whitelist

**Файли:** `frontend/src/components/LexicalRenderer.tsx`
**Нотатки:** DOMPurify підтримує `ALLOWED_URI_REGEXP` та hooks для кастомної валідації

---

### 5.2 Додати brute-force захист на Basic Auth
- [ ] Додати простий in-memory counter для невдалих спроб Basic Auth
- [ ] Блокувати IP після 10 невдалих спроб на 15 хвилин
- [ ] Можна перевикористати патерн з `backend-payload/src/lib/rate-limiter.ts`

**Файли:** `frontend/src/middleware.ts`
**Нотатки:** Basic Auth захищає тільки /admin/automation dashboard на фронтенді, не CMS адмін-панель. Вплив обмежений.

---

### 5.3 Задокументувати обмеження in-memory rate limiter
- [ ] Додати JSDoc коментар в rate-limiter.ts про обмеження multi-instance deployment
- [ ] Описати рекомендацію міграції на Redis для horizontal scaling
- [ ] Додати TODO коментар для майбутнього рефакторингу

**Файли:** `backend-payload/src/lib/rate-limiter.ts`
**Нотатки:** Для поточного single-instance deployment це не є проблемою

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
   git commit -m "checklist(security-audit-fixes): phase-5 DOMPurify, rate limiter, Basic Auth completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: завершено
   - Додай запис в історію
6. Перевір всі критерії успіху в README.md
