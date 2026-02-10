# Фаза 6: Error & Loading States

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Стандартизувати error boundaries та loading skeletons: DRY, Sentry, консистентність, відповідність реальному layout.

## Задачі

### 6.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути `shyny/[slug]/error.tsx` та `blog/[slug]/error.tsx` — єдині з Sentry
- [x] Переглянути `LoadingSkeleton` компонент в `components/ui/`
- [x] Переглянути CategoryPage layout для matching skeleton

**Команди для пошуку:**
```bash
grep -rn "Sentry\|captureException" frontend/src/app/
ls frontend/src/app/*/error.tsx frontend/src/app/*/loading.tsx
grep -rn "LoadingSkeleton\|HeroSkeleton" frontend/src/components/
```

---

### 6.1 Add Sentry to all error boundaries (7 files)
- [x] Додати `import * as Sentry from '@sentry/nextjs'` та `Sentry.captureException(error)` в:
  - [x] `app/error.tsx` (root)
  - [x] `global-error.tsx`
  - [x] `passenger-tyres/error.tsx`
  - [x] `suv-4x4-tyres/error.tsx`
  - [x] `lcv-tyres/error.tsx`
  - [x] `technology/error.tsx`
  - [x] `blog/error.tsx`
- [x] `shyny/[slug]/error.tsx` та `blog/[slug]/error.tsx` — вже мають Sentry

**Файли:** 7 error.tsx файлів
**Severity:** High | **Source:** ER-5, Summary #11

---

### 6.2 Extract `ErrorPageContent` shared component
- [x] Створити `components/ErrorPageContent.tsx` з параметрами:
  - `title: string`
  - `description: string`
  - `backLink: { href: string; label: string }`
  - `onRetry: () => void`
- [x] Включити `role="alert"`, Sentry, env guard для error.message
- [x] Замінити дублікований JSX в 7 error файлах
- [x] Зберегти `global-error.tsx` окремим (без доступу до layout)
- [x] Зберегти `blog/error.tsx` з іншим дизайном (або уніфікувати)

**Файли:**
- Новий: `frontend/src/components/ErrorPageContent.tsx`
- Рефакторинг: 7 error.tsx файлів (~350 рядків дублів)
**Severity:** High | **Source:** ER-4, Summary #8, #17

---

### 6.3 Standardize error.tsx buttons
- [x] Root `error.tsx` використовує `<Button variant="danger">`, решта — raw `<button>`
- [x] Уніфікувати: або всі через `<Button>`, або inline з однаковими стилями
- [x] Додати `focus-visible:ring` на кнопки

**Файли:** Всі error.tsx
**Severity:** Medium | **Source:** ER-6

---

### 6.4 Fix `global-error.tsx` dark mode
- [x] Додати dark mode стилі (зараз hardcoded `bg-stone-50 text-stone-900`)
- [x] Перевірити `data-theme` на `<html>` елементі

**Файли:** `frontend/src/app/global-error.tsx:25-28`
**Severity:** Medium | **Source:** ER-7

---

### 6.5 Fix `shyny/[slug]/error.tsx` back link
- [x] Зараз веде на `/passenger-tyres`, але сторінка для ВСІХ категорій
- [x] Змінити на `/` або визначити категорію динамічно

**Файли:** `frontend/src/app/shyny/[slug]/error.tsx:45`
**Severity:** Medium | **Source:** ER-10

---

### 6.6 Extract `CategoryLoading` shared component
- [x] Створити `components/CategoryLoading.tsx` на основі `lcv-tyres/loading.tsx` (найточніший)
- [x] Re-export з `passenger-tyres/loading.tsx`
- [x] Re-export з `suv-4x4-tyres/loading.tsx`
- [x] Re-export з `lcv-tyres/loading.tsx`
- [x] Зараз passenger + suv — 100% дублікати, lcv — інший (але точніший)

**Файли:**
- Новий: `frontend/src/components/CategoryLoading.tsx`
- `frontend/src/app/passenger-tyres/loading.tsx`
- `frontend/src/app/suv-4x4-tyres/loading.tsx`
- `frontend/src/app/lcv-tyres/loading.tsx`
**Severity:** High | **Source:** LD-4, LD-5, LD-8

---

### 6.7 Fix loading skeleton mismatches
- [x] Root `loading.tsx`: додати QuickSearchForm area в hero skeleton
- [x] `blog/[slug]/loading.tsx`: вирівняти max-width з реальним layout
- [x] `shyny/[slug]/loading.tsx`: використовувати `hero-adaptive` замість gradient (якщо реальна сторінка так)

**Файли:**
- `frontend/src/app/loading.tsx`
- `frontend/src/app/blog/[slug]/loading.tsx`
- `frontend/src/app/shyny/[slug]/loading.tsx:5`
**Severity:** Medium | **Source:** LD-11, LD-12, BA-11

---

### 6.8 Remove dead `HeroSkeleton` component
- [x] `HeroSkeleton` в `LoadingSkeleton.tsx:63-77` експортований але ніде не використовується
- [x] Видалити або переробити для використання в loading файлах

**Файли:** `frontend/src/components/ui/LoadingSkeleton.tsx:63-77`
**Severity:** Medium | **Source:** LD-9

---

### 6.9 Standardize `animate-pulse` placement
- [x] Замінити індивідуальний `animate-pulse` на parent wrapper де можливо
- [x] Особливо `blog/loading.tsx` з 14+ індивідуальними анімаціями

**Файли:** `frontend/src/app/blog/loading.tsx`, інші
**Severity:** Low | **Source:** LD-17, LD-18

---

### 6.10 Standardize loading function names
- [x] Уніфікувати: `Loading` або `[PageName]Loading` всюди
- [x] Зараз: `HomeLoading`, `Loading`, `BlogLoading`, `ArticleLoading`, `TyreDetailLoading`, `TyreSearchLoading`, `DealersLoading`

**Файли:** Всі 10 loading.tsx
**Severity:** Low | **Source:** LD-14

---

### 6.11 Extract `NotFoundLayout` shared component
- [x] Створити shared компонент для 404 сторінок
- [x] Зменшити ~85% дублювання між 3 файлами
- [x] Параметри: title, description, suggested links

**Файли:**
- `frontend/src/app/not-found.tsx`
- `frontend/src/app/shyny/[slug]/not-found.tsx`
- `frontend/src/app/blog/[slug]/not-found.tsx`
**Severity:** High | **Source:** NF-3

---

### 6.12 Create missing `not-found.tsx` files
- [x] Створити `porivnyaty/[slug]/not-found.tsx` (використовує `notFound()` але fallback на generic)
- [x] Створити `passenger-tyres/[season]/not-found.tsx`

**Файли:** Нові файли
**Severity:** Critical | **Source:** NF-2

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-6 error & loading states completed"
   ```
4. Онови PROGRESS.md
5. Відкрий наступну фазу
