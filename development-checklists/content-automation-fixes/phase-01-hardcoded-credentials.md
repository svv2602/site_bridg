# Фаза 1: P1 -- Hardcoded Credentials і ANTHROPIC_API_KEY

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Усунути security-ризики: прибрати hardcoded пароль `admin123` з коду, зробити env-змінні обов'язковими, привести validation ANTHROPIC_API_KEY у відповідність до реально використовуваних провайдерів.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти всі місця використання hardcoded credentials в codebase
- [x] Вивчити поточну логіку `validateEnv()` в env.ts
- [x] Визначити які env-змінні реально required, а які optional

**Команди для пошуку:**
```bash
# Пошук hardcoded credentials
grep -rn "admin123" backend-payload/
# Пошук fallback значень для паролів/email
grep -rn "PAYLOAD_ADMIN" backend-payload/content-automation/
# Пошук validateEnv
grep -rn "validateEnv" backend-payload/content-automation/src/config/
# Пошук ANTHROPIC_API_KEY використання
grep -rn "ANTHROPIC_API_KEY" backend-payload/
```

#### B. Аналіз залежностей
- [x] Чи потрібно оновити seed скрипт, який може використовувати ті ж credentials?
- [x] Чи використовують інші файли fallback credentials з payload-client.ts?

**Залежні файли:** -
**Вплив на pipeline:** payload-client.ts використовується для публікації в CMS

#### C. Перевірка .env.example
- [x] Перевірити наявний .env.example та його повноту

**Референс:** `backend-payload/content-automation/src/config/env.ts`

**Ціль:** Зрозуміти повну картину використання credentials ПЕРЕД внесенням змін.

**Нотатки для перевикористання:** -

---

### 1.1 Прибрати hardcoded 'admin123' fallback з payload-client.ts
- [x] Відкрити `payload-client.ts` (рядки 95-96)
- [x] Замінити fallback `"admin123"` та `"admin@bridgestone.ua"` на throw Error
- [x] Перевірити що помилка зрозуміла (повідомлення вказує на потрібні env-змінні)
- **Виконано в security-audit-fixes phase 3**

**Файли:** `backend-payload/content-automation/src/publishers/payload-client.ts`
**Нотатки:** Аудит: H-1, Release Report: P0-4

---

### 1.2 Перевірити наявність ANTHROPIC_API_KEY в .env
- [x] Перевірити `backend-payload/.env` на наявність ANTHROPIC_API_KEY — закоментований, optional
- [x] Є інші провайдери (OpenAI, Google AI, DeepSeek) — ANTHROPIC не обов'язковий

**Файли:** `backend-payload/.env`
**Нотатки:** Аудит: H-2. В .env є OpenAI, Google AI, DeepSeek ключі. Anthropic -- priority: 1, але fallback працює.

---

### 1.3 Оновити validation в env.ts
- [x] Змінено required з `["ANTHROPIC_API_KEY"]` на "хоча б один LLM API key"
- [x] validateEnv() перевіряє наявність хоча б одного з 6 LLM провайдерів
- [x] Зрозуміле повідомлення при відсутності всіх ключів

**Файли:** `backend-payload/content-automation/src/config/env.ts`
**Нотатки:** Поточна логіка: ANTHROPIC_API_KEY єдиний required key. Але система працює через fallback-провайдерів.

---

### 1.4 Додати ANTHROPIC_API_KEY та PAYLOAD_ADMIN_* в .env.example
- [x] .env.example вже існував — оновлено
- [x] LLM API keys тепер всі показані як optional (з коментарем "at least one required")
- [x] Додано PAYLOAD_ADMIN_EMAIL та PAYLOAD_ADMIN_PASSWORD
- [x] GOOGLE_API_KEY виправлено на GOOGLE_AI_API_KEY

**Файли:** `backend-payload/.env.example`
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
   git commit -m "checklist(content-automation-fixes): phase-1 hardcoded credentials completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
