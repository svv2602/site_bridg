# Фаза 3: P0 Blockers -- CSP та Hardcoded Credentials

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Посилити Content-Security-Policy (прибрати 'unsafe-eval', по можливості замінити 'unsafe-inline' на nonce). Видалити hardcoded fallback пароль 'admin123' з payload-client.ts.

**Джерело:** SECURITY_AUDIT HIGH-3, RELEASE_READINESS_REPORT P0-3, P0-4

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити поточну CSP конфігурацію в frontend/next.config.ts (рядок 42)
- [ ] Перевірити чи Next.js 16 підтримує nonce-based CSP
- [ ] Знайти де використовується 'unsafe-eval' (Google Maps SDK, next/image, інше)
- [ ] Вивчити payload-client.ts — знайти hardcoded credentials (рядки 95-96)

**Команди для пошуку:**
```bash
# Поточна CSP
grep -n "script-src\|unsafe-eval\|unsafe-inline" frontend/next.config.ts
# Де використовується eval в залежностях
grep -rn "eval\|Function(" frontend/src/ --include="*.ts" --include="*.tsx" | head -20
# Hardcoded credentials
grep -n "admin123\|password.*=.*'" backend-payload/content-automation/src/publishers/payload-client.ts
```

#### B. Аналіз залежностей
- [ ] Чи зламається next/image без unsafe-eval?
- [ ] Чи зламається Google Maps без unsafe-eval?
- [ ] Чи потрібна зміна в middleware.ts для nonce-based CSP?

**Нові типи:** -
**Нові API-функції:** -
**Нові компоненти:** -

#### C. Перевірка сумісності
- [ ] Протестувати сайт без unsafe-eval — перевірити консоль на CSP errors

**Ціль:** Визначити чи можна безпечно прибрати unsafe-eval без зламу функціоналу.

**Нотатки для перевикористання:** -

---

### 3.1 Видалити 'unsafe-eval' з CSP
- [ ] Прибрати `'unsafe-eval'` з `script-src` в frontend/next.config.ts (рядок 42)
- [ ] Запустити сайт і перевірити роботу:
  - next/image завантажує зображення
  - Google Maps відображається на /dealers
  - Сторінки рендеряться без помилок в консолі
- [ ] Якщо є CSP помилки — задокументувати які саме та оцінити альтернативи

**Файли:** `frontend/next.config.ts`
**Нотатки:** Якщо unsafe-eval необхідний для Google Maps SDK — задокументувати це як known limitation з коментарем в коді

---

### 3.2 Оцінити nonce-based підхід для 'unsafe-inline'
- [ ] Дослідити підтримку nonce в Next.js 16 App Router
- [ ] Якщо підтримується — створити plan для міграції (можна реалізувати пізніше)
- [ ] Якщо не підтримується — задокументувати як known limitation

**Файли:** `frontend/next.config.ts`, можливо `frontend/src/middleware.ts`
**Нотатки:** Nonce-based CSP складніший в реалізації з Next.js — може бути окремою задачею

---

### 3.3 Видалити hardcoded fallback пароль
- [ ] В `payload-client.ts` (рядки 95-96) замінити fallback 'admin123' на throw Error
- [ ] Замінити: `process.env.PAYLOAD_ADMIN_PASSWORD || 'admin123'` на перевірку:
  ```typescript
  const password = process.env.PAYLOAD_ADMIN_PASSWORD;
  if (!password) {
    throw new Error('PAYLOAD_ADMIN_PASSWORD environment variable is required');
  }
  ```
- [ ] Аналогічно перевірити fallback для PAYLOAD_ADMIN_EMAIL
- [ ] Переконатися що .env має правильне значення PAYLOAD_ADMIN_PASSWORD

**Файли:** `backend-payload/content-automation/src/publishers/payload-client.ts`
**Нотатки:** Перевірити що PAYLOAD_ADMIN_PASSWORD задано в .env перед видаленням fallback

---

### 3.4 Тестування
- [ ] Перевірити що сайт працює без unsafe-eval (або задокументувати чому потрібен)
- [ ] Перевірити що content-automation не стартує без PAYLOAD_ADMIN_PASSWORD

**Файли:** -
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
   git commit -m "checklist(security-audit-fixes): phase-3 CSP hardening and credentials cleanup completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 4
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
