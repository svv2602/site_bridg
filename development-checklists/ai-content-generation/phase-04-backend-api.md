# Фаза 4: Backend API

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Створити API endpoints для генерації контенту, превью та публікації в Payload CMS.

## Передумови
- Завершена Фаза 1 (скрапер)
- Завершена Фаза 2 (архітектура провайдерів)
- Завершена Фаза 3 (генерація контенту)
- Payload CMS працює на localhost:3001

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити існуючі API routes в `backend-payload/src/app/api/`
- [ ] Вивчити патерни автентифікації
- [ ] Знайти приклади POST/GET endpoints

**Команди для пошуку:**
```bash
# Існуючі API routes
ls backend-payload/src/app/api/
# Патерни endpoints
find backend-payload/src/app/api -name "route.ts"
# Автентифікація
grep -r "getPayload\|payload.auth" backend-payload/src/app/api/
```

#### B. Аналіз залежностей
- [ ] Чи потрібна автентифікація для endpoints?
- [ ] Який формат запитів/відповідей?
- [ ] Чи потрібен rate limiting?

**Автентифікація:** Bearer token (Payload JWT)
**Формат:** JSON
**Rate limit:** 1 запит на генерацію в хвилину

#### C. Планування endpoints

| Method | Endpoint | Опис |
|--------|----------|------|
| POST | `/api/content-generation/generate` | Запустити генерацію контенту |
| GET | `/api/content-generation/preview/:modelSlug` | Отримати превью |
| POST | `/api/content-generation/publish` | Опублікувати контент |
| GET | `/api/content-generation/status/:modelSlug` | Статус генерації |

**Нотатки для перевикористання:** -

---

### 4.1 Створити структуру папок
- [ ] Створити папку `backend-payload/src/app/api/content-generation/`
- [ ] Створити файли для кожного endpoint
- [ ] Додати index.ts для експорту

**Файли:**
```
backend-payload/src/app/api/content-generation/
├── generate/route.ts
├── preview/[modelSlug]/route.ts
├── publish/route.ts
└── status/[modelSlug]/route.ts
```

---

### 4.2 Реалізувати POST /generate endpoint
- [ ] Приймати `{ modelSlug: string }` в body
- [ ] Перевіряти автентифікацію (admin role)
- [ ] Запускати скрапер для збору raw-даних
- [ ] Запускати AI процесор
- [ ] Зберігати результат
- [ ] Повертати статус та ID генерації

**Файли:** `backend-payload/src/app/api/content-generation/generate/route.ts`
**Request:**
```json
{ "modelSlug": "turanza-6" }
```
**Response:**
```json
{
  "success": true,
  "generationId": "gen_123",
  "modelSlug": "turanza-6",
  "status": "completed",
  "preview": { ... }
}
```

---

### 4.3 Реалізувати GET /preview/:modelSlug endpoint
- [ ] Отримувати modelSlug з URL
- [ ] Завантажувати згенерований контент з файлу
- [ ] Повертати JSON з контентом для превью
- [ ] Включати порівняння з поточним контентом

**Файли:** `backend-payload/src/app/api/content-generation/preview/[modelSlug]/route.ts`
**Response:**
```json
{
  "generated": {
    "shortDescription": "...",
    "fullDescription": "...",
    "keyBenefits": [...],
    "faqs": [...]
  },
  "current": {
    "shortDescription": "...",
    "fullDescription": "..."
  },
  "diff": {
    "hasChanges": true,
    "fields": ["fullDescription", "keyBenefits"]
  }
}
```

---

### 4.4 Реалізувати POST /publish endpoint
- [ ] Приймати `{ modelSlug: string, fields?: string[] }` в body
- [ ] Перевіряти автентифікацію (admin role)
- [ ] Завантажувати згенерований контент
- [ ] Конвертувати fullDescription в Lexical
- [ ] Оновлювати документ Tyre в Payload
- [ ] Логувати публікацію

**Файли:** `backend-payload/src/app/api/content-generation/publish/route.ts`
**Request:**
```json
{
  "modelSlug": "turanza-6",
  "fields": ["fullDescription", "keyBenefits", "faqs"]
}
```
**Response:**
```json
{
  "success": true,
  "modelSlug": "turanza-6",
  "updatedFields": ["fullDescription", "keyBenefits", "faqs"],
  "publishedAt": "2026-01-10T12:00:00Z"
}
```

---

### 4.5 Реалізувати GET /status/:modelSlug endpoint
- [ ] Перевіряти наявність raw-даних
- [ ] Перевіряти наявність згенерованого контенту
- [ ] Перевіряти чи опубліковано
- [ ] Повертати повний статус

**Файли:** `backend-payload/src/app/api/content-generation/status/[modelSlug]/route.ts`
**Response:**
```json
{
  "modelSlug": "turanza-6",
  "hasRawData": true,
  "hasGeneratedContent": true,
  "isPublished": false,
  "rawDataDate": "2026-01-10T10:00:00Z",
  "generatedDate": "2026-01-10T11:00:00Z",
  "currentContent": {
    "shortDescription": "...",
    "hasFullDescription": false
  }
}
```

---

### 4.6 Додати middleware для автентифікації
- [ ] Створити helper для перевірки Payload JWT
- [ ] Перевіряти роль користувача (admin)
- [ ] Повертати 401/403 при невалідному токені

**Файли:** `backend-payload/src/app/api/content-generation/auth.ts`
**Нотатки:** -

---

### 4.7 Тестування API
- [ ] Протестувати всі endpoints з Postman/curl
- [ ] Перевірити автентифікацію
- [ ] Перевірити обробку помилок
- [ ] Перевірити що дані коректно зберігаються/оновлюються

**Команди:**
```bash
# Тест генерації
curl -X POST http://localhost:3001/api/content-generation/generate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"modelSlug": "turanza-6"}'

# Тест превью
curl http://localhost:3001/api/content-generation/preview/turanza-6 \
  -H "Authorization: Bearer {token}"
```
**Нотатки:** -

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
   git commit -m "feat(content-automation): backend API for content generation"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 5
   - Додай запис в історію
6. Відкрий наступну фазу (phase-05-admin-ui.md)
