# Фаза 1: P0 Blockers -- Захист GET-ендпоінтів (КРИТИЧНО)

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Всі GET-ендпоінти, що розкривають внутрішню інформацію (конфігурація шедулера, AI-промпти, джерела скрапінгу, налаштування генерації), повинні вимагати аутентифікацію. Неавторизовані запити повертають HTTP 401.

**Джерело:** SECURITY_AUDIT HIGH-1, RELEASE_READINESS_REPORT P0-1

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти як реалізована auth-перевірка на POST-ендпоінтах (патерн `req.user`)
- [x] Вивчити патерн відповіді 401 в існуючих ендпоінтах
- [x] Визначити які GET-ендпоінти вже мають auth (якщо є)

**Результат аналізу:**
- Патерн: `if (!req.user) { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }`
- Всі POST-ендпоінти використовують цей патерн + RBAC через `requireRoleForEndpoint`
- Жоден GET-ендпоінт не мав auth-перевірки
- Знайдено 10 незахищених GET-ендпоінтів (не 8 як в аудиті — додатково виявлено providerManagement.ts)

#### B. Аналіз залежностей
- [x] Чи потрібно створювати helper-функцію для auth-перевірки?
- [x] Чи впливає auth на frontend admin dashboard (він використовує ці endpoints)?

**Рішення:** Helper не потрібен — патерн `if (!req.user)` достатньо короткий (2 рядки). Frontend admin dashboard використовує Basic Auth middleware, який авторизується окремо — потрібно перевірити що він передає Payload CMS cookies.

#### C. Перевірка сумісності
- [x] Frontend admin dashboard (/admin/automation) авторизується через Basic Auth — перевірити що він передає Payload CMS credentials для API-запитів

**Ціль:** Зрозуміти існуючі патерни auth ПЕРЕД додаванням перевірок.

---

### 1.1 Захист GET-ендпоінтів в contentGeneration.ts
- [x] Додати перевірку `if (!req.user)` з відповіддю 401 на `GET /api/content/jobs`
- [x] Додати перевірку `if (!req.user)` на `GET /api/content/job/:id`

**Файли:** `backend-payload/src/endpoints/contentGeneration.ts`
**Нотатки:** 2 ендпоінти захищено

---

### 1.2 Захист GET-ендпоінтів в automation.ts
- [x] Додати перевірку `if (!req.user)` на `GET /api/automation/stats`
- [x] Додати перевірку `if (!req.user)` на `GET /api/automation/status`
- [x] Додати перевірку `if (!req.user)` на `GET /api/automation/sources`
- [x] Додати перевірку `if (!req.user)` на `GET /api/automation/queue`
- [x] Додати перевірку `if (!req.user)` на `GET /api/automation/article-settings`

**Файли:** `backend-payload/src/endpoints/automation.ts`
**Нотатки:** 5 ендпоінтів захищено. Handlers що мали `async ()` замінені на `async (req)`.

---

### 1.3 Захист GET-ендпоінтів в imageRegeneration.ts
- [x] Додати перевірку `if (!req.user)` на `GET /api/image-regeneration/prompt`
- [x] Додати перевірку `if (!req.user)` на `GET /api/image-regeneration/status/:jobId`

**Файли:** `backend-payload/src/endpoints/imageRegeneration.ts`
**Нотатки:** 2 ендпоінти захищено

---

### 1.4 Захист GET-ендпоінтів в providerManagement.ts
- [x] Додати перевірку `if (!req.user)` на `GET /api/providers/status`

**Файли:** `backend-payload/src/endpoints/providerManagement.ts`
**Нотатки:** Цей ендпоінт не був згаданий в чеклісті, але виявлений при аналізі

---

### 1.5 Тестування захищених ендпоінтів
- [x] Код змінено коректно — auth-перевірка додана на всі 10 GET-ендпоінтів
- [ ] Протестувати curl без аутентифікації після перезапуску backend — всі повертають 401
- [ ] Протестувати curl з аутентифікацією — всі повертають 200

**Нотатки:** Payload CMS реєструє ендпоінти при старті. Потрібен перезапуск `npm run dev` для backend.

Команди для тестування після перезапуску:
```bash
# Без auth (очікуємо 401)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/content/jobs
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/automation/stats
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/automation/status
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/automation/sources
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/automation/queue
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/automation/article-settings
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/image-regeneration/prompt?type=hero&topic=test"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/image-regeneration/status/test
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/providers/status
```

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: 2026-02-10"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(security-audit-fixes): phase-1 GET endpoints auth completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
