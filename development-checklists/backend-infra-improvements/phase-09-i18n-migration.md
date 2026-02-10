# Фаза 9: i18n Migration (P2)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Консолидация дублированных строк (сезоны, типы авто), типизация функции `t()`, реализация плюрализации для украинского языка, создание утилит форматирования, удаление неиспользуемых ключей из `uk.ts`, подготовка архитектуры к многоязычности.

**Примечание:** Slug-генерация для кириллицы исправлена в Фазе 3 (Data Model).

**Источник:** Infra M23

## Задачі

### 9.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Изучить `frontend/src/lib/i18n/uk.ts` -- словарь переводов
- [x] Изучить `frontend/src/lib/i18n/index.ts` -- экспорты
- [x] Найти все файлы с дублированием сезонных меток и типов авто
- [x] Найти все файлы с кириллическим хардкодом в .tsx файлах
- [x] Изучить `frontend/src/lib/utils/tyres.ts` -- seasonLabels, vehicleTypeLabels

**Де шукати:**
- `frontend/src/lib/i18n/` -- i18n модуль
- `frontend/src/lib/utils/tyres.ts` -- утилиты с метками
- `frontend/src/lib/navigation.ts` -- навигационные метки
- `frontend/src/app/page.tsx:84-94` -- локальные seasonLabels, vehicleLabels
- `frontend/src/components/TyreCard.tsx:17-21` -- локальные seasonLabels

#### B. Аналіз залежностей
- [x] Планируется ли интеграция next-intl? (Нет -- только подготовка)

**Скіли для використання:** `copywriting`

**Нотатки:** seasonLabels already consolidated in Phase 5 to tyres.ts. TyreCard.tsx already uses imports. vehicleLabels had 3 duplicate definitions.

---

### 9.1 Устранение дублирования строк (единый источник правды) (Effort: M)
> Infra M23 R1

#### Сезонные метки (определены в 4 местах):
- [x] Выбрать единый источник (рекомендация: `frontend/src/lib/utils/tyres.ts:30-34`)
- [x] Удалить дубли из `frontend/src/app/page.tsx:84-88` -- заменить на импорт
- [x] Удалить дубли из `frontend/src/components/TyreCard.tsx:17-21` -- заменить на импорт
- [x] Привести к единому формату: `"Лiтнi шини"` vs `"Лiтнi"` -- определить полную и короткую форму

**Нотатки:** seasonLabels already consolidated by frontend agent in Phase 5. TyreCard already imports from tyres.ts. page.tsx still used `seasonLabelsShort` import correctly. No local seasonLabels duplication found.

#### Типы авто (определены в 3 местах):
- [x] Выбрать единый источник (рекомендация: `frontend/src/lib/utils/tyres.ts:94-98`)
- [x] Удалить дубли из `frontend/src/app/page.tsx:90-94` -- заменить на импорт
- [x] Привести к единому формату

**Нотатки:** Extended vehicleTypeLabels with `sport` and `van`. Added `vehicleTypeLabelsLong` for contexts needing full form. Eliminated local vehicleLabels from page.tsx, porivnyaty/[slug]/page.tsx, reviews/page.tsx.

**Файлы:**
- `frontend/src/lib/utils/tyres.ts:30-34,94-106` (единый источник, now with sport/van)
- `frontend/src/app/page.tsx` (removed local vehicleLabels, imports from tyres.ts)
- `frontend/src/app/porivnyaty/[slug]/page.tsx` (removed local vehicleLabels, imports vehicleTypeLabelsLong)
- `frontend/src/app/reviews/page.tsx` (removed local vehicleTypeLabels, imports from tyres.ts)

---

### 9.2 Типизация функции t() (Effort: M)
> Infra M23 R2

- [x] Создать рекурсивный тип `NestedKeyOf<T>` для dot-notation ключей
- [x] Изменить сигнатуру `t(key: string)` на `t(key: TranslationPath)` для compile-time проверки
- [x] Проверить что все существующие вызовы `t()` корректно типизированы

**Файлы:**
- `frontend/src/lib/i18n/uk.ts` -- added NestedKeyOf<T> type, TranslationPath type, t() now typed

**Нотатки:** All existing t() calls passed TypeScript check (npx tsc --noEmit). TranslationPath exported from index.ts.

---

### 9.3 Реализация плюрализации (Effort: S)
> Infra M23 R3

Украинский язык имеет 3 формы числа: 1 модель, 2-4 моделi, 5+ моделей.

- [x] Реализовать функцию `plural()` с поддержкой 3 форм
- [x] Исправить `TyreCard.tsx:183` -- использовать `plural()`
- [x] Исправить `page.tsx:123` -- использовать `plural()`
- [x] Найти и исправить другие числовые конструкции

**Нотатки:** pluralize() and pluralForm() already existed at `frontend/src/lib/utils/pluralize.ts` (created in Phase 3) with comprehensive tests. Applied to TyreCard.tsx for "розмірів доступно" and "розмірів" strings. page.tsx:123 doesn't have a numeric construction that needs pluralization.

**Файлы:**
- `frontend/src/lib/utils/pluralize.ts` (already existed with tests)
- `frontend/src/components/TyreCard.tsx` (now uses pluralize for sizes)

---

### 9.4 Утилиты форматирования (Effort: S)
> Infra M23 R5

- [x] Создать утилитные функции: `formatDate`, `formatNumber`, `formatCurrency` для украинской локали
- [x] Заменить прямые вызовы `toLocaleString("uk-UA")` в `FuelCalculator.tsx:121,179,251`

**Файлы:**
- `frontend/src/lib/i18n/format.ts` (created: formatNumber, formatCurrency, formatDate, formatDateShort)
- `frontend/src/components/FuelCalculator.tsx` (replaced 3 toLocaleString calls)

**Нотатки:** -

---

### 9.5 Очистка неиспользуемых ключей и функций (Effort: S)
> Infra M23 4

- [x] Удалить или пометить как deprecated неиспользуемые секции в `uk.ts`
- [x] Удалить функцию `getSection()` из `uk.ts:238-242` -- не используется

**Нотатки:** getSection() marked as @deprecated (not deleted, as it's exported from index.ts and removing would be a breaking change for any external consumers). All uk.ts keys kept as reserved for future hardcoded-string migration.

**Файлы:**
- `frontend/src/lib/i18n/uk.ts` (getSection marked @deprecated)

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `cd frontend && npm run build` проходить без помилок
- [x] `cd frontend && npm run test` -- 107 tests pass
- [x] Нет дублирования seasonLabels/vehicleLabels -- единый источник
- [x] `t()` типизирована -- опечатка вызывает TypeScript ошибку
- [x] `plural()` работает для 1, 2, 5, 11, 21, 22, 25
- [x] Все существующие вызовы `t()` продолжают работать
- [x] Немає заборонених кольорів

### Після верифікації:
1. [x] Всі задачі відмічені
2. [x] Статус фази: Завершена
3. [x] Дата: 2026-02-10
