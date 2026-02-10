# Фаза 9: Code Quality & DRY

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Видалити мертвий код, усунути дублювання, виправити типи, покращити maintainability.

## Задачі

### 9.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти мертвий код (невикористані імпорти, компоненти)
- [x] Знайти дублювання типів, функцій, даних
- [x] Переглянути pattern inconsistencies

---

### 9.1 Remove dead `DealersClientPage.tsx`
- [x] 380 рядків мертвого legacy-компоненту
- [x] Перевірити що ніде не імпортується
- [x] Видалити файл

**Файли:** `frontend/src/components/DealersClientPage.tsx`
**Severity:** Medium | **Source:** D-5, D-37

---

### 9.2 Remove dead code and unused imports
- [x] `not-found.tsx`: невикористаний `ArrowLeft` import
- [x] `contacts/page.tsx`: невикористаний `Loader2` import
- [x] `dealers/page.tsx`: невикористаний `Phone` import
- [x] `SizeResults.tsx`: dead function `getAxleLabel`
- [x] `blog/[slug]/page.tsx`: empty string classNames (framer-motion remnants)
- [x] `about/page.tsx`: empty string classNames

**Файли:**
- `frontend/src/app/not-found.tsx:2`
- `frontend/src/app/contacts/page.tsx:6`
- `frontend/src/app/dealers/page.tsx:8`
- `frontend/src/components/VehicleTyreSelector/SizeResults.tsx:17-25`
- `frontend/src/app/about/page.tsx:90-93,215-218`
**Severity:** Low-Medium | **Source:** NF-7, Contacts #15, D-40, TS-41/28

---

### 9.3 Fix type duplication
- [x] `FilteredDealer` тип в 2 файлах — створити shared тип
- [x] `UserPosition` інтерфейс в 2 файлах — створити shared
- [x] `Review` тип в ReviewCard.tsx — перенести в shared types
- [x] `buildRouteUrl` дублюється в 2 файлах — створити shared utility

**Файли:**
- `frontend/src/app/dealers/page.tsx:30-33`
- `frontend/src/app/dealers/components/DealerList.tsx:15-18`
- `frontend/src/app/dealers/components/DealerFilters.tsx:20-23`
- `frontend/src/components/ReviewCard.tsx:3-21`
**Severity:** Medium | **Source:** D-35, D-36, D-38, R-15

---

### 9.4 Fix `VehicleType` mismatch
- [x] Frontend: `"passenger" | "suv" | "lcv"` in `lib/data.ts:8`
- [x] Backend: `"passenger" | "suv" | "van" | "sport"` in `Tyres.ts:120-125`
- [x] Після fix van→lcv в Phase 1, потрібно задокументувати або додати `sport` mapping

**Файли:**
- `frontend/src/lib/data.ts:8`
- `backend-payload/src/collections/Tyres.ts:120-125`
**Severity:** Medium | **Source:** W-9, A-10

---

### 9.5 Hardcoded phone number → constants
- [x] Замінити hardcoded `+380800123456` на `PHONE_HREF` з `lib/constants.ts`
- [x] Homepage: `page.tsx:457`
- [x] About: `page.tsx:234`
- [x] Contacts: page
- [x] Dealers CTA: `page.tsx:275`

**Файли:**
- `frontend/src/app/page.tsx:457`
- `frontend/src/app/about/page.tsx:234`
- `frontend/src/app/dealers/page.tsx:275`
**Severity:** Low | **Source:** Homepage #16, About #6, D-34

---

### 9.6 Hardcoded `bridgestone.ua` → env variable
- [x] JSON-LD в layout: замінити hardcoded URL на `siteUrl` змінну
- [x] Dealers breadcrumb URL: аналогічно

**Файли:**
- `frontend/src/app/layout.tsx:85,105`
- `frontend/src/app/dealers/page.tsx:165-166`
**Severity:** Low | **Source:** Homepage #19, D-43

---

### 9.7 Sitemap synchronization
- [x] Додати відсутні сторінки в карту сайту: `/reviews`, `/porivnyaty`, `/suv-4x4-tyres`
- [x] Синхронізувати `sitemapSections` з `sitemap.ts` та Footer

**Файли:** `frontend/src/app/karta-saitu/page.tsx:9-50`
**Severity:** High | **Source:** SM-4

---

### 9.8 Fix `about/page.tsx` "use client" removal
- [x] Сторінка помічена `"use client"` але не має клієнтської логіки
- [x] Видалити `"use client"` — зробити Server Component

**Файли:** `frontend/src/app/about/page.tsx:1`
**Severity:** Medium | **Source:** About #5

---

### 9.9 Move inline data to separate files
- [x] About: `stats`, `values`, timeline — винести в data файл
- [x] Homepage: `tyreCategories`, `features` — аналогічно
- [x] Karta-saitu: `sitemapSections` — аналогічно (або DRY з Footer)

**Файли:**
- `frontend/src/app/about/page.tsx:7-39`
- `frontend/src/app/page.tsx:32-84`
- `frontend/src/app/karta-saitu/page.tsx:9-50`
**Severity:** Low | **Source:** About #12, Homepage #18, SM-10

---

### 9.10 Remove redundant layout.tsx files
- [x] `privacy/layout.tsx` — повертає лише `{children}`, надлишковий
- [x] `terms/layout.tsx` — аналогічно
- [x] Перенести canonical в page.tsx перед видаленням

**Файли:**
- `frontend/src/app/privacy/layout.tsx`
- `frontend/src/app/terms/layout.tsx`
**Severity:** Low | **Source:** Privacy #8, Terms #8

---

### 9.11 Fix comparison page issues
- [x] `datePublished: new Date().toISOString()` — змінюється при кожному рендері
- [x] `text-primary-text` І `text-primary-foreground` на одній сторінці — inconsistency
- [x] Hardcoded slugs в «Популярні порівняння» — може зламатись при видаленні моделей

**Файли:**
- `frontend/src/app/porivnyaty/[slug]/page.tsx:156-177`
- `frontend/src/app/porivnyaty/page.tsx:270-299`
**Severity:** Low-Medium | **Source:** C-15, C-16, C-17

---

### 9.12 Fix AnimatedCard/AnimatedCardX duplication
- [x] `AnimatedCard` та `AnimatedCardX` дублюють IntersectionObserver логіку
- [x] Об'єднати або створити shared hook

**Файли:** `frontend/src/components/AnimatedSection.tsx`
**Severity:** Low | **Source:** Homepage #17

---

### 9.13 Fix Lexical/prose conflicts
- [x] `list-disc`/`list-decimal` конфліктують з `prose.css` `list-style: none`
- [x] Вирішити специфічність або оновити prose.css

**Файли:** `frontend/src/components/LexicalRenderer.tsx:156-166`
**Severity:** Medium | **Source:** BA-12

---

### 9.14 Consistent encoding in not-found
- [x] `&bull;` vs `&#8226;` — уніфікувати кодування

**Файли:**
- `frontend/src/app/not-found.tsx:58`
- `frontend/src/app/blog/[slug]/not-found.tsx:56`
**Severity:** Low | **Source:** NF-12

---

### 9.15 Fix blog `readingTimeMinutes` handling
- [x] Може бути `undefined` — відобразиться як «undefined хвилин»
- [x] Додати fallback або приховати якщо undefined
- [x] Fix Ukrainian pluralization: «1 хвилин» → «1 хвилина»

**Файли:** `frontend/src/app/blog/page.tsx:192`
**Severity:** Low | **Source:** BL-20, BL-21

---

### 9.16 Fix Ukrainian pluralization
- [x] Blog counter: 21 стаття → показує «статей»
- [x] Створити utility для Ukrainian pluralization або використати існуючу

**Файли:** `frontend/src/app/blog/page.tsx:154`
**Severity:** Medium | **Source:** BL-9

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-9 code quality completed"
   ```
4. Онови PROGRESS.md
5. Відкрий наступну фазу
