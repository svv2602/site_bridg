# Фаза 2: Security Critical

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-16
**Завершена:** 2026-01-16

## Ціль фази
Закрити всі критичні security vulnerabilities перед production deployment.

## Пріоритет
**P0 (BLOCKER)** - security issues блокують реліз

---

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз поточних security issues
- [x] Знайти всі hardcoded credentials в коді
- [x] Знайти всі dangerouslySetInnerHTML без санітизації
- [x] Перевірити CORS конфігурацію

**Команди для пошуку:**
```bash
# Hardcoded credentials
grep -rn "bridgestone123\|default-secret\|change-me" backend-payload/src/ --include="*.ts"

# dangerouslySetInnerHTML
grep -rn "dangerouslySetInnerHTML" frontend/src/ --include="*.tsx"

# CORS config
grep -rn "cors\|origin" backend-payload/ --include="*.ts"
```

#### B. Перевірка .env файлів
- [x] .env файли в .gitignore?
- [x] .env.example існує з placeholder значеннями?
- [x] Production secrets НЕ в коді?

---

### 2.1 Видалити hardcoded database credentials (P0) ✅

**Проблема:** Hardcoded password `bridgestone123` в коді

**Локація:** `backend-payload/src/import/vehicles-db.ts`

- [x] Знайти файл з hardcoded credentials
- [x] Замінити на process.env.DATABASE_PASSWORD
- [x] Додати DATABASE_PASSWORD в .env.example
- [x] Перевірити що імпорт все ще працює

**Виправлення:**
- Створено функцію `getDbConfig()` з валідацією
- В production режимі VEHICLES_DB_USER і VEHICLES_DB_PASSWORD обов'язкові
- Видалено fallback значення для credentials

**Файли:** `backend-payload/src/import/vehicles-db.ts`

---

### 2.2 Видалити hardcoded PAYLOAD_SECRET (P0) ✅

**Проблема:** Fallback secret `default-secret-change-me` в payload.config.ts

**Локація:** `backend-payload/payload.config.ts`

- [x] Знайти fallback secret в конфігурації
- [x] Видалити fallback, зробити env variable обов'язковим в production
- [x] Перевірити що сервер не стартує без PAYLOAD_SECRET в production
- [x] Згенерувати новий production secret (мін. 32 символи)

**Виправлення:**
- Додано валідацію на старті: якщо NODE_ENV=production і PAYLOAD_SECRET < 32 символи - кидається помилка
- Аналогічна валідація для DATABASE_URI
- Fallback залишено тільки для development режиму

**Файли:** `backend-payload/payload.config.ts`

---

### 2.3 Виправити XSS vulnerability (P0) ✅

**Проблема:** `dangerouslySetInnerHTML` без HTML санітизації

**Локації:**
- `frontend/src/components/LexicalRenderer.tsx`

- [x] Встановити DOMPurify: `npm install isomorphic-dompurify`
- [x] Імпортувати та використати DOMPurify
- [x] Перевірити всі місця з dangerouslySetInnerHTML
- [x] Для JSON-LD schemas - санітизація не потрібна (controlled data)

**Виправлення:**
- Встановлено `isomorphic-dompurify` для SSR-сумісності
- Всі HTML-стрічки санітизуються через DOMPurify.sanitize() перед рендерингом
- Налаштовані дозволені теги (iframe) та атрибути для embedded content

**Файли:** `frontend/src/components/LexicalRenderer.tsx`

---

### 2.4 Обмежити CORS origins (P1) ✅

**Проблема:** CORS приймає запити з будь-якого origin

**Локація:** `backend-payload/payload.config.ts`

- [x] Знайти CORS конфігурацію
- [x] Обмежити origins до дозволених доменів
- [x] Додати production domain в список
- [x] Перевірити що frontend все ще працює

**Виправлення:**
- В production режимі з встановленим FRONTEND_URL виключаються localhost origins
- Додано підтримку FRONTEND_URL env variable для production
- PAYLOAD_PUBLIC_SERVER_URL додано до дозволених origins для admin panel

**Файли:** `backend-payload/payload.config.ts`, `backend-payload/.env.example`

---

### 2.5 Увімкнути CSRF protection (P1) ✅

**Проблема:** CSRF protection не явно налаштований

- [x] Перевірити поточну CSRF конфігурацію в Payload
- [x] Увімкнути якщо вимкнено
- [x] Перевірити що Admin Panel працює з CSRF

**Виправлення:**
- Додано `csrf: []` - пустий масив вмикає CSRF захист для всіх origins
- Додано `cookiePrefix: 'bridgestone'` для кращої ізоляції cookies

**Документація:** https://payloadcms.com/docs/production/preventing-csrf

**Файли:** `backend-payload/payload.config.ts`

---

## При завершенні фази

Виконай наступні дії:

1. ✅ Переконайся, що всі задачі відмічені [x]
2. ✅ Зміни статус фази: Завершена
3. ✅ Заповни дату "Завершена: 2026-01-16"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(audit-fixes): phase-2 security-critical completed

   - Remove hardcoded credentials
   - Add DOMPurify for XSS prevention
   - Restrict CORS origins
   - Enable CSRF protection"
   ```
5. ✅ Онови PROGRESS.md
6. Відкрий наступну фазу
