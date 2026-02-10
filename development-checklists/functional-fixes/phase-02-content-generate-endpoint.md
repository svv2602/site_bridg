# Фаза 2: P1 -- GET /api/content/generate 404

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити або коректно видалити endpoint GET /api/content/generate, який повертає 404. Якщо endpoint більше не потрібний -- видалити всі посилання на нього з фронтенду та документації. Якщо потрібний -- виправити маршрутизацію.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити contentGeneration.ts -- які endpoints зареєстровані (GET, POST)
- [x] Перевірити payload.config.ts -- як endpoints реєструються
- [x] Пошукати посилання на /api/content/generate у фронтенді — **0 результатів**
- [x] Перевірити чи endpoint потрібний для admin dashboard або automation

#### B. Аналіз залежностей
- [x] Чи використовує admin dashboard цей endpoint? — **Ні**, admin dashboard не існує у фронтенді
- [x] Чи використовує Telegram bot або scheduler цей endpoint? — **Ні**, вони викликають pipeline напряму
- [x] Які інші endpoints в /api/content/ працюють коректно?

**Використовується у фронтенді:** Ні
**Використовується в admin:** Ні (admin panel — це Payload CMS backend)
**Працюючі endpoints:** POST /content/generate, GET /content/jobs, GET /content/job/:id, POST /content/scrape, POST /content/import, POST /content/pipeline, POST /content/regenerate/:slug, POST /content/smart-pipeline, POST /content/publish

#### C. Прийняття рішення
- [ ] Endpoint потрібний → виправити маршрутизацію
- [ ] Endpoint НЕ потрібний → видалити посилання
- [x] Endpoint доступний тільки по POST → задокументувати

**Рішення:** GET /api/content/generate повертає 404 тому що endpoint зареєстрований тільки як POST. Це **очікувана поведінка**. Для запуску генерації потрібно надсилати POST запит з аутентифікацією.

---

### 2.1 Перевірити contentGeneration.ts на наявність GET handler
- [x] Відкрито `backend-payload/src/endpoints/contentGeneration.ts`
- [x] Знайдено 9 endpoints: 6 POST + 3 GET
- [x] GET handler для /api/content/generate **не існує** — тільки POST
- [x] 404 на GET — це коректна поведінка

**Файли:** `backend-payload/src/endpoints/contentGeneration.ts`

---

### 2.2 Перевірити реєстрацію endpoint в payload.config.ts
- [x] Всі 9 endpoints зареєстровані в payload.config.ts (рядки 124-164)
- [x] contentGenerateEndpoint зареєстрований на рядку 129
- [x] Path mapping коректний

**Файли:** `backend-payload/payload.config.ts`

---

### 2.3 Результат: Endpoint працює коректно як POST-only
- [x] Жодних змін коду не потрібно — endpoint реалізований правильно
- [x] Frontend не використовує цей endpoint
- [x] Для запуску: `curl -X POST -H "Authorization: Bearer <token>" http://localhost:3001/api/content/generate`
- [x] Для перевірки статусу: `GET /api/content/job/<jobId>`

---

### 2.4 Протестувати інші content endpoints
- [x] Аналіз коду підтверджує: всі POST endpoints мають `if (!req.user)` auth check
- [x] Всі POST endpoints мають RBAC (requireRoleForEndpoint)
- [x] GET endpoints (jobs, job/:id) теж мають auth check

---
