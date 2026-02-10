# Фаза 11: Forms & Validation

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Покращити валідацію форм, додати захист від спаму, GDPR consent, серверну валідацію.

## Задачі

### 11.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути contact form Zod schema
- [x] Переглянути API route валідацію
- [x] Перевірити QuickSearchForm validation logic

---

### 11.1 Contact form — reuse Zod schema server-side
- [x] API route НЕ перевикористовує Zod-схему з фронтенду
- [x] Тільки перевірка пустоти та базовий email regex
- [x] Перенести Zod schema в shared файл та використати на сервері

**Файли:**
- `frontend/src/app/api/contact/route.ts:194-209`
- `frontend/src/app/contacts/page.tsx` (Zod schema)
**Severity:** High | **Source:** Contacts #5

---

### 11.2 Contact form — CAPTCHA/honeypot
- [x] Timestamp-based bot detection тривіально обходиться
- [x] Додати honeypot field (hidden input)
- [x] Розглянути hCaptcha або Turnstile
- [x] При відсутності `_loadedAt` запит все ще приймається

**Файли:** `frontend/src/app/api/contact/route.ts:213-238`
**Severity:** High | **Source:** Contacts #3, #4

---

### 11.3 Contact form — GDPR consent checkbox
- [x] Додати обов'язковий чекбокс "Я погоджуюся на обробку персональних даних"
- [x] Посилання на /privacy
- [x] Блокувати submit без чекбоксу

**Файли:** `frontend/src/app/contacts/page.tsx:365-368`
**Severity:** Medium | **Source:** Contacts #11

---

### 11.4 Contact form — error handling
- [x] API route повертає `{ success: true }` навіть якщо збереження в Payload fails
- [x] Виправити обробку помилок збереження
- [x] Success state: додати auto-reset/timeout та focus management

**Файли:**
- `frontend/src/app/api/contact/route.ts:250-268`
- `frontend/src/app/contacts/page.tsx:235-249`
**Severity:** Medium | **Source:** Contacts #10, #12

---

### 11.5 QuickSearchForm — prevent empty submit
- [x] Кнопка «Знайти шини» активна без вибору параметрів
- [x] Блокувати submit до вибору хоча б width, profile, diameter
- [x] Те ж для car mode: блокувати без kitId

**Файли:**
- `frontend/src/components/QuickSearchForm.tsx:216-230,426-439,578-591`
**Severity:** Medium | **Source:** Homepage #5, TS-30, TS-31

---

### 11.6 Search API validation
- [x] `api/tyres/sizes`: `parseInt` без перевірки NaN
- [x] `api/tyres/search`: season не валідується, `as` cast
- [x] Додати proper validation для query параметрів

**Файли:**
- `frontend/src/app/api/tyres/sizes/route.ts:50-81`
- `frontend/src/app/api/tyres/search/route.ts:19,28-30`
**Severity:** Medium-Low | **Source:** TS-29, TS-23, TS-39, TB-4

---

### 11.7 Blog page parameter validation
- [x] Параметр `page` не валідується — NaN/від'ємні значення від `parseInt()`
- [x] Додати validation та fallback на page=1

**Файли:** `frontend/src/app/blog/page.tsx:30`
**Severity:** High | **Source:** BL-5

---

### 11.8 Blog search security
- [x] `searchQuery` не кодується через `encodeURIComponent()` — URL injection
- [x] `searchQuery` та `activeTag` рендеряться без обмеження довжини
- [x] Додати sanitization

**Файли:** `frontend/src/app/blog/page.tsx:131,164`
**Severity:** High | **Source:** BL-3, BL-4

---

### 11.9 Dealers search debounce
- [x] Кожен keypress ре-рендерить всі карточки
- [x] Додати debounce (300ms)
- [x] Додати `maxLength` на input

**Файли:** `frontend/src/app/dealers/components/DealerFilters.tsx:74-81`
**Severity:** Medium-Low | **Source:** D-21, D-22

---

### 11.10 Search filters — HTML5 validation messages
- [x] `required` без кастомного повідомлення українською
- [x] Додати `title` або custom validation message

**Файли:** `frontend/src/app/tyre-search/components/SearchFilters.tsx:77,108,139`
**Severity:** Low | **Source:** TS-32

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-11 forms & validation completed"
   ```
4. Онови PROGRESS.md
5. Відкрий наступну фазу
