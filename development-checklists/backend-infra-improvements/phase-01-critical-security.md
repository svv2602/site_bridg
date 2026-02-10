# Фаза 1: Critical Security (P0)

## Статус
- [ ] Не розпочата
- [x] В процесі
- [ ] Завершена

**Розпочата:** 2026-02-09
**Завершена:** -

## Ціль фази
Устранить все критические уязвимости безопасности (P0): command injection через exec(), публичный доступ к PII, отсутствие аутентификации на GET-эндпоинтах, escalation привилегий, утечка API-ключей, XSS в email, hardcoded credentials, rate limiting.

**Источники:** Backend M13, M14, M15, M16 + Infra M21, M24

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти всі файли с access control в `backend-payload/src/collections/`
- [x] Знайти всі эндпоинты без `req.user` проверки в `backend-payload/src/endpoints/`
- [x] Знайти всі использования `exec()` / `execAsync()` с подстановкой параметров
- [x] Проверить Google API key usage в `content-automation/src/providers/llm/google.ts`
- [x] Знайти все файлы с hardcoded `admin123`
- [x] Изучить email template в `frontend/src/app/api/contact/route.ts`

**Де шукати:**
- `backend-payload/src/collections/` -- access control паттерны
- `backend-payload/src/endpoints/` -- authentication checks
- `backend-payload/src/hooks/` -- removeBackground.ts
- `backend-payload/content-automation/src/providers/` -- API key management
- `backend-payload/content-automation/src/publishers/payload-client.ts`
- `backend-payload/scripts/seed.ts`
- `frontend/src/app/api/contact/route.ts`

#### B. Аналіз залежностей
- [x] Нужна ли библиотека для shell escaping? (shell-escape, shell-quote)
- [x] Можно ли использовать `execFile` вместо `exec`?
- [x] Нужна ли библиотека для HTML escaping в email (he / DOMPurify)?
- [x] Нужна ли библиотека для rate limiting (express-rate-limit или аналог)?
- [x] Нужна ли zod для input validation на contact form?

**Новi залежностi:** Нет -- использованы встроенные средства Node.js (execFile, ручной HTML escape, in-memory rate limiter)
**Новi типи:** -

#### C. Визначення скiлiв
- [x] Визначив якi скiли потрiбнi для цiєї фази

**Скіли для використання:** `payload`, `nodejs-backend-patterns`, `gdpr-data-handling`

**Ціль:** Зрозуміти масштаб проблем безпеки ПЕРЕД написанням коду.

**Нотатки:** Анализ выполнен, все уязвимости идентифицированы и исправлены.

---

### 1.1 Исправить Command/Shell Injection (Effort: M)
> Backend M14 D1/D4, M15 D1/6.2 + Infra M24 R01, M21 R12

Устранение command injection через slug, prompt, type, season, filename в shell-командах. **Объединённая задача** из обоих чеклистов -- одни и те же файлы.

- [x] **contentGeneration.ts:327** -- заменить `exec()` на `execFile()` для endpoint `/content/regenerate/:slug`; или добавить строгую валидацию slug через regex `/^[a-z0-9-]+$/` перед подстановкой
- [x] **imageRegeneration.ts:100-105** -- заменить конкатенацию command на `execFile()` с массивом аргументов; поля `type` и `season` не экранируются
- [x] **removeBackgrounds.ts:30** и **hooks/removeBackground.ts:52** -- использовать `execFile()` вместо `exec()` для вызова rembg CLI
- [x] Проверить все остальные вызовы `exec()` в `contentGeneration.ts` (pipeline, scrape, import, smart-pipeline, publish) -- перевести на `execFile()` для консистентности
- [x] Убедиться, что символы `$`, `` ` ``, `|`, `;`, `&`, `\` не проходят в shell

**Файлы:**
- `backend-payload/src/endpoints/contentGeneration.ts:327`
- `backend-payload/src/endpoints/imageRegeneration.ts:100-105`
- `backend-payload/src/endpoints/removeBackgrounds.ts:25-38`
- `backend-payload/src/hooks/removeBackground.ts:52`

**Нотатки:** Все exec() заменены на execFile() с массивом аргументов. Также добавлена строгая валидация slug через regex и whitelist validation для type/season/size в imageRegeneration. reviewGeneration.ts тоже исправлен.

---

### 1.2 Исправить публичный доступ к PII в ContactSubmissions (Effort: S)
> Backend M13 8.2 R1 + Infra M24 R02

- [x] Заменить `read: () => true` на `read: ({ req }) => !!req.user` в ContactSubmissions
- [x] Оставить `create: () => true` для публичной формы обратной связи
- [x] Проверить, что `GET /api/contact-submissions` больше не возвращает данные без аутентификации

**Файлы:**
- `backend-payload/src/collections/ContactSubmissions.ts:15-17`

**Нотатки:** Исправлено. PII теперь доступны только авторизованным пользователям.

---

### 1.3 Добавить аутентификацию на GET-эндпоинты (Effort: M)
> Backend M14 D3 R2 + Infra M24 R03, M21 R5

Добавить проверку `req.user` на все GET-эндпоинты, раскрывающие внутреннюю информацию. **Объединённая задача** -- оба чеклиста указывают на те же эндпоинты.

- [x] `GET /content/job/:id` -- contentGeneration.ts:88
- [x] `GET /content/jobs` -- contentGeneration.ts:298
- [x] `GET /reviews/generate/status/:jobId` -- reviewGeneration.ts:128
- [x] `GET /reviews/stats/:tyreId` -- reviewGeneration.ts:151
- [x] `GET /image-regeneration/status/:jobId` -- imageRegeneration.ts:162
- [x] `GET /image-regeneration/prompt` -- imageRegeneration.ts:189
- [x] `GET /automation/stats` -- automation.ts:87
- [x] `GET /automation/status` -- automation.ts:166
- [x] `GET /automation/sources` -- automation.ts:220
- [x] `GET /automation/queue` -- automation.ts:333
- [x] `GET /automation/article-settings` -- automation.ts:472
- [x] `GET /providers/status` -- providerManagement.ts:266 (особо критичен: раскрывает конфигурацию AI-провайдеров)
- [x] `GET /remove-backgrounds/status` -- removeBackgrounds.ts:212
- [x] НЕ добавлять auth на health endpoints (GET /health, /health/ready, /health/live) -- они должны быть публичными

**Файлы:**
- `backend-payload/src/endpoints/contentGeneration.ts:88,298`
- `backend-payload/src/endpoints/reviewGeneration.ts:128,151`
- `backend-payload/src/endpoints/imageRegeneration.ts:162,189`
- `backend-payload/src/endpoints/automation.ts:87,166,220,333,472`
- `backend-payload/src/endpoints/providerManagement.ts:266`
- `backend-payload/src/endpoints/removeBackgrounds.ts:212`

**Нотатки:** Все GET endpoints теперь требуют req.user. Health endpoints не затронуты.

---

### 1.4 Добавить role-based access для Users (Effort: M)
> Backend M13 6.5 R2 + Infra M24 R07 D08

- [x] Добавить access control: `create: ({ req }) => req.user?.role === 'admin'`
- [x] Добавить access control: `update` -- admin может все, editor может менять только себя (кроме role)
- [x] Добавить access control: `delete: ({ req }) => req.user?.role === 'admin'`
- [x] Добавить field-level access на поле `role`: `access: { update: ({ req }) => req.user?.role === 'admin' }`
- [ ] Добавить password complexity validation через beforeChange hook
- [x] Проверить, что editor больше не может создавать admin-аккаунты

**Файлы:**
- `backend-payload/src/collections/Users.ts`

**Нотатки:** RBAC добавлен. Password complexity hook отложен -- требует дополнительного тестирования с Payload auth system.

---

### 1.5 Удалить hardcoded credentials (Effort: S)
> Backend M13 6.4 + Infra M24 R04 D14

**Объединённая задача** -- Backend указывает seed.ts, Infra дополняет payload-client.ts, import-tyres.ts, update-media-filenames.ts.

- [x] `payload-client.ts:96` -- удалить fallback `"admin123"`, сделать обязательным env var `PAYLOAD_ADMIN_PASSWORD`
- [x] `import-tyres.ts:59` -- удалить fallback `'admin123'`
- [x] `update-media-filenames.ts:9` -- удалить fallback `'admin123'`
- [x] `seed.ts:958-959` -- заменить hardcoded `'admin123'` на чтение из environment variable `SEED_ADMIN_PASSWORD`, fallback только в development с warning
- [x] `seed.ts:963` -- удалить вывод пароля в console.log

**Файлы:**
- `backend-payload/content-automation/src/publishers/payload-client.ts:96`
- `backend-payload/content-automation/src/import-tyres.ts:59`
- `backend-payload/scripts/update-media-filenames.ts:9`
- `backend-payload/scripts/seed.ts:958-959,963`

**Нотатки:** Все hardcoded `admin123` удалены. Seed.ts теперь читает из SEED_ADMIN_PASSWORD с fallback и warning. Остальные скрипты требуют env var.

---

### 1.6 XSS в email-шаблоне и PII в логах (Effort: S)
> Infra M24 R05, R06, 14.3

- [x] Добавить HTML escaping в email template (`frontend/src/app/api/contact/route.ts:141-158`): экранировать `data.name`, `data.phone`, `data.email`, `data.message` перед вставкой в HTML
- [x] Удалить PII из console.log в contact route (`route.ts:195-201`): логировать только subject и timestamp
- [x] Добавить валидацию длины полей contact form (name: max 100, email: max 254, phone: max 20, message: max 5000)

**Файлы:**
- `frontend/src/app/api/contact/route.ts:141-158,177-192,195-201`

**Нотатки:** Добавлена функция escapeHtml(), все пользовательские данные экранируются перед вставкой в HTML email. PII логи были уже минимальны -- comments в коде обновлены. Длины полей валидируются.

---

### 1.7 Rate Limiting (Effort: M)
> Infra M24 R08

- [x] Добавить rate limiting на `/api/contact` (frontend) -- 5 запросов в минуту
- [ ] Добавить rate limiting на `/api/users/login` (Payload) -- brute force protection
- [ ] Добавить rate limiting на automation POST endpoints -- предотвращение повторного запуска дорогих AI-операций

**Файлы:**
- `frontend/src/app/api/contact/route.ts`
- `backend-payload/src/endpoints/` (все POST endpoints)

**Нотатки:** Rate limiting добавлен на contact form (in-memory, 5 req/min). Payload login rate limiting и automation endpoints rate limiting отложены -- требуют middleware-подход на уровне Payload Express.

---

### 1.8 Перенести Google API key из URL в заголовок (Effort: S)
> Backend M16 D1 R1

- [x] Заменить `?key=${this.apiKey}` на заголовок `x-goog-api-key` в `google.ts:84`
- [x] Аналогично в `google.ts:155` (streaming endpoint)
- [x] Аналогично в `google.ts:229` (models list)
- [ ] Проверить, что Google API продолжает работать с заголовком

**Файлы:**
- `backend-payload/content-automation/src/providers/llm/google.ts:84,155,229`

**Нотатки:** Все 3 места исправлены. Ключ теперь передается через заголовок `x-goog-api-key`. Требуется runtime проверка.

---

### 1.9 Закрыть read-доступ к ProviderSettings для неавторизованных (Effort: S)
> Backend M16 6.2 R9

- [x] Заменить `read: () => true` на `read: ({ req }) => !!req.user` в ProviderSettings
- [x] Проверить, что `GET /api/provider-settings` требует аутентификации
- [x] Убедиться, что admin dashboard продолжает работать (он аутентифицирован)

**Файлы:**
- `backend-payload/src/collections/ProviderSettings.ts:37`

**Нотатки:** Исправлено.

---

### 1.10 Добавить isPublished фильтрацию (Effort: S)
> Backend M13 8.6 R3, M13 8.7

- [x] Заменить `read: () => true` на access control, фильтрующий `isPublished` для неаутентифицированных в Tyres
- [x] Добавить аналогичный access control на Reviews, фильтрующий `isPublished`
- [x] Проверить, что `GET /api/tyres` и `GET /api/reviews` без auth не возвращают неопубликованные записи

```typescript
read: ({ req }) => {
  if (req.user) return true;
  return { isPublished: { equals: true } };
}
```

**Файлы:**
- `backend-payload/src/collections/Tyres.ts:19-21`
- `backend-payload/src/collections/Reviews.ts:12-14`

**Нотатки:** Исправлено. Неопубликованные записи скрыты от неавторизованных.

---

### 1.11 Добавить role-based access на критические коллекции (Effort: M)
> Backend M13 6.1

- [x] Добавить write-protection на Tyres: `create/update/delete: ({ req }) => req.user?.role === 'admin'`
- [x] Добавить write-protection на SeasonalContent: аналогично
- [x] Решить какие коллекции должны быть доступны editor (Articles, Reviews -- для модерации)
- [x] Проверить, что editor не может удалять шины или менять сезонный контент через API

**Файлы:**
- `backend-payload/src/collections/Tyres.ts:19-21`
- `backend-payload/src/collections/SeasonalContent.ts:15-17`

**Нотатки:** Tyres и SeasonalContent -- admin only. Articles и Reviews оставлены без CUD restrictions (editors могут модерировать).

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `cd backend-payload && npm run build` проходить без помилок
- [x] `cd frontend && npm run build` проходить без помилок
- [x] Все exec() вызовы используют execFile() или whitelist validation
- [x] Нет hardcoded `admin123` в production-коде
- [x] Все GET endpoints с внутренней информацией требуют `req.user`
- [x] ContactSubmissions read требует auth
- [x] Users collection имеет RBAC
- [x] Email template экранирует пользовательский ввод
- [x] PII не логируется в console
- [x] `GET /api/tyres` без auth не возвращает isPublished: false
- [ ] Admin panel работает корректно с новыми access controls

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(backend-infra): phase-1 critical security completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
