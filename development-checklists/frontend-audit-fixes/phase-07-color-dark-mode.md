# Фаза 7: Color System & Dark Mode

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити проблеми кольорової системи: контраст, dark mode, non-stone кольори, inconsistency.

## Задачі

### 7.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути `theme.css` — всі визначені кольори
- [x] Переглянути `globals.css` — CSS overrides для `text-primary`
- [x] Знайти всі non-stone кольори (emerald, amber, teal, blue, etc.)

---

### 7.1 VehicleTyreSelector light-mode styling
- [x] SelectField: видалити hardcoded dark стилі (`text-stone-100`, `bg-stone-800`)
- [x] Додати `dark:` варіанти для всіх елементів
- [x] VehicleTyreSelector/index.tsx: kit info блок — додати light mode стилі
- [x] SizeResults.tsx: всі компоненти — додати light mode стилі
- [x] **Зараз білий текст на білому фоні в light mode**

**Файли:**
- `frontend/src/components/VehicleTyreSelector/SelectField.tsx:61-88`
- `frontend/src/components/VehicleTyreSelector/index.tsx:110-137`
- `frontend/src/components/VehicleTyreSelector/SizeResults.tsx:62-301`
**Severity:** High | **Source:** TS-1, TS-2, TS-3

---

### 7.2 `hover:text-primary` contrast on sitemap
- [x] Замінити `hover:text-primary` на `hover:text-foreground` або `hover:text-stone-700 dark:hover:text-stone-300`
- [x] `text-primary` (#D7D9DC) контраст ~1.23:1 на stone-50

**Файли:** `frontend/src/app/karta-saitu/page.tsx:67`
**Severity:** High | **Source:** SM-3

---

### 7.3 Blog article dark mode fixes
- [x] Breadcrumb `text-muted-foreground` на always-dark hero — контраст ~2.5:1
- [x] ShareButtons `text-muted-foreground` + `hover:bg-stone-100` на темному hero
- [x] Замінити на light-safe кольори для dark hero контексту

**Файли:**
- `frontend/src/components/ui/Breadcrumb.tsx:17` (в контексті hero)
- `frontend/src/app/blog/[slug]/page.tsx:138-142`
**Severity:** High | **Source:** BA-3, BA-4

---

### 7.4 Non-stone accent colors review
- [x] About page: `teal-500`, `yellow-500`, `amber-500`, etc. (допустимо для семантики?)
- [x] Contacts page: `bg-green-500/15`, `bg-blue-500/15`, etc.
- [x] Technology page: `bg-purple-500/15`, benefits icons
- [x] Season badges: `emerald-*`, `blue-*`, `amber-*`
- [x] Прийняти рішення: дозволити для семантичних індикаторів або замінити

**Файли:**
- `frontend/src/app/about/page.tsx:8-38`
- `frontend/src/app/contacts/page.tsx:18,27,36,45`
- `frontend/src/app/technology/page.tsx:33-52,187`
**Severity:** Medium | **Source:** About #1, Contacts #6, T-14, T-15

---

### 7.5 `bg-graphite` dark mode
- [x] Blog CTA: `bg-graphite` зливається з фоном в dark mode
- [x] Dealers CTA: `bg-graphite` без dark-mode адаптації
- [x] Додати border або альтернативний фон для dark mode

**Файли:**
- `frontend/src/app/blog/page.tsx:241`
- `frontend/src/app/dealers/page.tsx:266-267`
**Severity:** Medium | **Source:** BL-10, D-2

---

### 7.6 InfoWindow dark mode (Google Maps)
- [x] Google Maps InfoWindow без dark mode стилів
- [x] Додати адаптацію або залишити з коментарем (обмеження Google Maps API)

**Файли:** `frontend/src/components/DealersMap.tsx:80-128`
**Severity:** Medium | **Source:** D-10

---

### 7.7 Inconsistent badge colors (dealers)
- [x] Partner badge: orange в карточці vs blue в карті
- [x] Уніфікувати кольори бейджів

**Файли:**
- `frontend/src/app/dealers/components/DealerList.tsx:89-90`
- `frontend/src/components/DealersMap.tsx:87`
**Severity:** Low | **Source:** D-8

---

### 7.8 Map marker colors
- [x] `blue-600`, `green-600` маркери — не з stone палітри
- [x] Замінити на stone-based або primary/accent кольори

**Файли:** `frontend/src/components/DealersMap.tsx:57-60`
**Severity:** Low | **Source:** D-9

---

### 7.9 CTA `opacity-90` contrast
- [x] Contacts CTA `opacity-90` знижує контраст
- [x] Видалити або замінити на solid color

**Файли:** `frontend/src/app/contacts/page.tsx:448`
**Severity:** Medium | **Source:** Contacts #13

---

### 7.10 Review hero non-stone colors
- [x] `amber-50`, `bg-white` замість stone палітри
- [x] Замінити на stone equivalents

**Файли:** `frontend/src/app/reviews/page.tsx:62`
**Severity:** Medium | **Source:** R-9

---

### 7.11 LexicalRenderer `text-primary` links
- [x] `text-primary` silver #D7D9DC на білому ~1.5:1
- [x] CSS overrides частково працюють, але переконатись що покривають всі випадки

**Файли:** `frontend/src/components/LexicalRenderer.tsx:120-129`
**Severity:** Low | **Source:** BA-19

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-7 color system & dark mode completed"
   ```
4. Онови PROGRESS.md
5. Відкрий наступну фазу
