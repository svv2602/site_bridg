# Фаза 1: P0 — Security & Critical Bugs

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити всі Critical security та broken feature баги. Ці проблеми становлять безпосередню загрозу безпеці, GDPR-комплаєнсу та функціональності сайту.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути access control патерни в інших колекціях Payload
- [x] Переглянути `transformPayloadTyre` та `transformPayloadArticle` маппінг
- [x] Перевірити як `jsonLdScript` генерує JSON-LD

**Команди для пошуку:**
```bash
# Access control патерни
grep -n "read:" backend-payload/src/collections/*.ts
# Transform functions
grep -n "transformPayload" frontend/src/lib/api/payload.ts
# JSON-LD generation
grep -n "jsonLdScript\|dangerouslySetInnerHTML.*script" frontend/src/lib/schema.ts
```

#### B. Аналіз залежностей
- [x] Які колекції мають `read: () => true`?
- [x] Де використовується `error.message` без env guard?
- [x] Де `dangerouslySetInnerHTML` для JSON-LD?

**Нотатки для перевикористання:** 10 колекцій мали `read: () => true`, лише Users та AuditLog мали обмеження. `--color-primary-text` вже визначений в theme.css.

---

### 1.1 ContactSubmissions `read: () => true` — GDPR violation
- [x] Змінити `read: () => true` на `read: ({ req }) => !!req.user` в `ContactSubmissions.ts`
- [x] Перевірити що admin panel продовжує працювати
- [x] Перевірити що публічний `GET /api/contact-submissions` повертає 401

**Файли:** `backend-payload/src/collections/ContactSubmissions.ts:25`
**Severity:** Critical | **Source:** A-B4, Summary #1
**Нотатки:** GDPR — публічний доступ до персональних даних (ім'я, телефон, email)

---

### 1.2 Reviews `read: () => true` — leaks unpublished
- [x] Змінити `read: () => true` на access control з фільтром `isPublished`
- [x] Додати `read` access: публічні запити бачать лише `isPublished: true`, авторизовані — всі
- [x] Перевірити що публічний API повертає тільки опубліковані відгуки

**Файли:** `backend-payload/src/collections/Reviews.ts:22`
**Severity:** Critical | **Source:** D-R2, BACKEND #22
**Приклад fix:**
```typescript
read: ({ req }) => {
  if (req.user) return true
  return { isPublished: { equals: true } }
}
```

---

### 1.3 vehicleType `van` → `lcv` mapping — LCV page empty
- [x] Додати маппінг в `transformPayloadTyre`: `vehicleTypes.map(v => v === 'van' ? 'lcv' : v)`
- [x] Перевірити що `/lcv-tyres` тепер показує шини
- [x] Перевірити що інші vehicleType не зачеплені

**Файли:** `frontend/src/lib/api/payload.ts:532`
**Severity:** Critical | **Source:** B-L1, BACKEND #2
**Нотатки:** Сторінка LCV ПОВНІСТЮ порожня через цей баг

---

### 1.4 `error.message` exposed in production (4 files)
- [x] Обгорнути `error.message` в `process.env.NODE_ENV === 'development'` guard в `passenger-tyres/error.tsx`
- [x] Обгорнути в `suv-4x4-tyres/error.tsx`
- [x] Обгорнути в `lcv-tyres/error.tsx`
- [x] Обгорнути в `technology/error.tsx`

**Файли:**
- `frontend/src/app/passenger-tyres/error.tsx:24`
- `frontend/src/app/suv-4x4-tyres/error.tsx:24`
- `frontend/src/app/lcv-tyres/error.tsx:24`
- `frontend/src/app/technology/error.tsx:27`
**Severity:** Critical | **Source:** ER-1, Summary #4, #12

---

### 1.5 `text-primary-foreground` undefined — invisible text
- [x] Визначити `--color-primary-foreground: var(--stone-900)` в `theme.css` `@theme inline` блоці
- [x] АБО замінити всі `text-primary-foreground` на `text-primary-text` (вже визначений)
- [x] Перевірити 3 місця в `/reviews` та 3 місця в `/porivnyaty`

**Файли:**
- `frontend/src/app/styles/theme.css` — додати token
- `frontend/src/app/reviews/page.tsx:150,172,224`
- `frontend/src/app/porivnyaty/page.tsx:122,233`
- `frontend/src/app/porivnyaty/[slug]/page.tsx:376`
**Severity:** Critical | **Source:** C-C1, D-R1, Summary #2, #5
**Рішення:** Замінено `text-primary-foreground` → `text-primary-text` (вже визначений в theme.css)

---

### 1.6 JSON-LD `</script>` XSS escaping
- [x] В `lib/schema.ts` `jsonLdScript()` додати escaping: `.replace(/<\/script/gi, '<\\/script')`
- [x] Перевірити всі місця з `dangerouslySetInnerHTML` для JSON-LD
- [x] Перевірити CategoryPage, technology, dealers, blog/[slug], porivnyaty/[slug]

**Файли:** `frontend/src/lib/schema.ts:265-267`
**Severity:** Medium (XSS vector) | **Source:** B-B11, T-13, C-14, Summary #6
**Нотатки:** Дані від CMS можуть містити `</script>` в назвах

---

### 1.7 Dealers.website URL validation (backend)
- [x] Додати `validate` функцію для поля `website` в Dealers collection
- [x] Валідація: тільки `http://` або `https://` протоколи
- [x] Перевірити що `javascript:` URLs відхиляються

**Файли:** `backend-payload/src/collections/Dealers.ts`
**Severity:** High | **Source:** C-DB1, BACKEND #8
**Нотатки:** На фронтенді `dealer.website` рендериться в `<a href>` без валідації

---

### 1.8 Dealers.website frontend sanitization
- [x] Додати перевірку протоколу перед рендерингом `<a href={dealer.website}>`
- [x] Дозволяти тільки `http:` та `https:` URL

**Файли:** `frontend/src/app/dealers/components/DealerList.tsx:138-144`
**Severity:** High | **Source:** C-D30

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-1 P0 security & critical bugs completed"
   ```
5. Онови PROGRESS.md
6. Відкрий наступну фазу та продовж роботу
