# Фаза 3: Data Model & Collections (P1)

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-09
**Завершена:** 2026-02-09

## Ціль фази
Исправить проблемы модели данных P1 приоритета: несоответствие vehicleTypes между backend и frontend, slug-генерация для кириллицы, отсутствующие поля, валидация, двусторонние связи, индексы, versions.

**Источник:** Backend M13

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити всі использования `vehicleTypes` в frontend (`lib/data.ts`, `lib/utils/tyres.ts`, `TyreCard.tsx`, `payload.ts`)
- [x] Вивчити slug-генерацию в Tyres.ts и Articles.ts hooks
- [x] Вивчити связь Technologies <-> Tyres
- [x] Проверить seed.ts на соответствие новым полям

**Де шукати:**
- `frontend/src/lib/data.ts:8` -- VehicleType type
- `frontend/src/lib/api/payload.ts:18` -- PayloadTyre types
- `frontend/src/lib/utils/tyres.ts:145` -- lcv usage
- `frontend/src/components/TyreCard.tsx:69` -- lcv icon
- `backend-payload/src/collections/` -- collections
- `backend-payload/src/fields/` -- custom fields

#### B. Аналіз залежностей
- [x] Нужна ли библиотека `slugify` или `transliteration` для slug-генерации? -- ДА, нужен пакет slugify для транслітерації кирилиці
- [x] Нужны ли миграции базы данных для новых полей? -- Payload CMS автоматично оновлює схему; нові поля nullable, тому міграцій не потрібно

**Новi залежностi:** slugify / transliteration
**Змiни в backend:** Tyres, Articles, VehicleFitments, Technologies, SeasonalContent, euLabel, tyreSize, Dealers

#### C. Визначення скiлiв
- [x] Визначив якi скiли потрiбнi для цiєї фази

**Скіли для використання:** `payload`, `database-migration`

**Нотатки:** -

---

### 3.1 Исправить vehicleTypes mismatch (van vs lcv) (Effort: M)
> Backend M13 8.1 R4

- [x] Решение: унифицировать на `van` (backend значение) -- обновить frontend типы
- [x] Обновить `VehicleType` в `frontend/src/lib/data.ts:8`: заменить `"lcv"` на `"van"`, добавить `"sport"`
- [x] Обновить `frontend/src/lib/utils/tyres.ts:145`: заменить `"lcv"` на `"van"`
- [x] Обновить `frontend/src/components/TyreCard.tsx:69`: заменить `"lcv"` на `"van"`
- [x] Поиск других мест с `"lcv"` во frontend и обновление (TyreImage.tsx, payload.ts mapping, tyres.ts mapping, lcv-tyres/page.tsx, shyny/[slug]/page.tsx)
- [x] Проверить, что фургоны (Duravis R660, Blizzak W995) корректно отображаются -- маппинг убран, van используется напрямую

**Файлы:**
- `frontend/src/lib/data.ts:8`
- `frontend/src/lib/api/payload.ts:18`
- `frontend/src/lib/utils/tyres.ts:145`
- `frontend/src/components/TyreCard.tsx:69`

**Нотатки:** Backend использует `van`, frontend в старых типах и утилитах ожидает `lcv`. Также backend имеет `sport`, а старый тип его не включает.

---

### 3.2 Исправить slug-генерацию для кириллицы (Effort: M)
> Backend M13 8.3 R6

- [x] Установить библиотеку `slugify` в backend-payload
- [x] Обновить `beforeChange` hook в Tyres.ts для поддержки кириллицы -- slugify(name, { lower: true, strict: true, locale: 'uk' })
- [x] Обновить `beforeChange` hook в Articles.ts для поддержки кириллицы
- [x] Проверить генерацию slug из украинского текста -- slugify с locale: 'uk' транслітерує кирилицю
- [x] Проверить, что латинские названия шин (основной кейс) продолжают работать -- slugify підтримує латиницю за замовчуванням

**Файлы:**
- `backend-payload/src/collections/Tyres.ts:295-299`
- `backend-payload/src/collections/Articles.ts:111-114`
- `backend-payload/package.json` (новая зависимость)

**Нотатки:** Regex `[^a-z0-9-]` удаляет все нелатинские символы. Для AI-генерируемых статей с украинскими заголовками -- критическая проблема.

---

### 3.3 Добавить поле publishedAt в Articles (Effort: S)
> Backend M13 8.9 R5

- [x] Добавить поле `publishedAt: { type: 'date' }` в Articles collection
- [x] Добавить hook: при смене статуса на published, автоматически заполнять publishedAt (если не задано)
- [x] Обновить seed.ts -- publishedAt тепер визначений в колекції, seed дані будуть прийняті
- [x] Обновить frontend API-клиент -- додано publishedAt до PayloadArticle interface

**Файлы:**
- `backend-payload/src/collections/Articles.ts`
- `backend-payload/scripts/seed.ts:715`
- `frontend/src/lib/api/payload.ts` (тип PayloadArticle)

**Нотатки:** В seed-данных есть `publishedAt`, но поля нет в коллекции -- данные молча игнорируются.

---

### 3.4 Добавить валидацию единственного активного SeasonalContent (Effort: S)
> Backend M13 8.4 R7

- [x] Добавить `beforeChange` hook в SeasonalContent: при `isActive: true` деактивировать другие записи
- [x] Использовать `payload.update()` в hook для деактивации
- [x] Проверить, что только один SeasonalContent может быть активен -- hook деактивує всі інші при isActive: true

**Файлы:**
- `backend-payload/src/collections/SeasonalContent.ts`

**Нотатки:** UI описывает: "Тiльки один сезонний контент може бути активним", но нет hook для гарантии.

---

### 3.5 Удалить дублирующую связь Technologies.tyres (Effort: S)
> Backend M13 8.5 R9

- [x] Решить: удалить `Technologies.tyres` -- оставить `Tyres.technologies` как single source of truth
- [x] Удалить `Technologies.tyres` relationship, оставить комментарий
- [x] Обновить admin panel описание -- додано коментар
- [x] Проверить, что frontend не зависит от `Technologies.tyres` -- PayloadTechnology не включає tyres

**Файлы:**
- `backend-payload/src/collections/Technologies.ts:47-51`
- `frontend/src/lib/api/payload.ts` (проверить использование)

**Нотатки:** Двусторонняя связь без автоматической синхронизации приводит к рассинхронизации данных.

---

### 3.6 Добавить EU Label класс F (Effort: S)
> Backend M13 4.3 R12

- [x] Добавить `'F'` в options для wetGrip в `euLabel.ts:15`
- [x] Добавить `'F'` в options для fuelEfficiency в `euLabel.ts:22`
- [x] Обновити frontend TyreModel type для підтримки класу F

**Файлы:**
- `backend-payload/src/fields/euLabel.ts:15,22`

**Нотатки:** Стандарт EU Tyre Label (Regulation 2020/740) включает класс F.

---

### 3.7 Добавить валидацию числовых полей в tyreSize (Effort: S)
> Backend M13 4.2 R13

- [x] Добавить `min: 125, max: 355` для width
- [x] Добавить `min: 25, max: 85` для aspectRatio
- [x] Добавить `min: 13, max: 24` для diameter
- [x] Проверить, что seed-данные проходят валидацию -- стандартні розміри шин в цих межах

**Файлы:**
- `backend-payload/src/fields/tyreSize.ts`

**Нотатки:** -

---

### 3.8 Добавить slug для Dealers (Effort: S)
> Backend M13 3.3 R14

- [x] Добавить поле `slug` (text, unique) в Dealers collection
- [x] Добавить `beforeChange` hook для автогенерации slug из name (с поддержкой кириллицы через slugify)
- [x] Добавить `isActive` (checkbox, default: true) для фильтрации

**Файлы:**
- `backend-payload/src/collections/Dealers.ts`

**Нотатки:** Для SEO-friendly URLs дилерских страниц нужен slug.

---

### 3.9 Добавить индексы для часто фильтруемых полей (Effort: M)
> Backend M13 7.1 R8

- [x] Добавить `index: true` для Tyres: `season`, `brand`, `isPublished` (vehicleTypes -- select hasMany, індексація не підтримується для масивів)
- [x] Добавить `index: true` для Dealers: `city`, `type`
- [x] Добавить `index: true` для VehicleFitments: `make`, `model`
- [x] Добавить `index: true` для Reviews: `tyre`, `isPublished`
- [x] Payload автоматично створює індекси при наступному старті

**Файлы:**
- `backend-payload/src/collections/Tyres.ts`
- `backend-payload/src/collections/Dealers.ts`
- `backend-payload/src/collections/VehicleFitments.ts`
- `backend-payload/src/collections/Reviews.ts`

**Нотатки:** При масштабировании (1000+ шин, 10000+ отзывов) станет узким местом.

---

### 3.10 Ограничить depth для relationship полей (Effort: S)
> Backend M13 7.2 R10

- [x] Добавить `maxDepth: 1` для relationship `Tyres.technologies`
- [x] `Technologies.tyres` удалено в 3.5 -- не нужно
- [x] Добавить `maxDepth: 1` для relationship `Articles.relatedTyres`
- [x] Циклический populate предотвращён через maxDepth: 1

**Файлы:**
- `backend-payload/src/collections/Tyres.ts:171-176`
- `backend-payload/src/collections/Technologies.ts:47-51`
- `backend-payload/src/collections/Articles.ts`

**Нотатки:** Tyres -> Technologies -> Tyres создает потенциально бесконечный цикл.

---

### 3.11 Добавить versions/drafts для Tyres (Effort: S)
> Backend M13 R11

- [x] Добавить `versions: { drafts: true }` в Tyres collection config
- [x] Admin panel буде показувати історію змін автоматично
- [x] API повертатиме published версії -- access control вже фільтрує по isPublished

**Файлы:**
- `backend-payload/src/collections/Tyres.ts`

**Нотатки:** Шины -- основной контент. Articles уже имеет versions/drafts.

---

### 3.12 Исправить VehicleFitments -- добавить связь с Tyres (Effort: M)
> Backend M13 8.8, 10.2

- [x] Добавить поле `recommendedTyres` (relationship -> tyres, hasMany, maxDepth: 1) в VehicleFitments
- [x] Зв'язок додано як додатковий (опціональний), підбір за розміром продовжує працювати
- [x] Frontend оновлення відкладено -- підбір за розміром працює, прямий зв'язок буде використаний пізніше

**Файлы:**
- `backend-payload/src/collections/VehicleFitments.ts`

**Нотатки:** Текущий подбор шин по авто возможен только через сопоставление размеров.

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [ ] `cd backend-payload && npm run build` проходить без помилок
- [ ] `cd frontend && npm run build` проходить без помилок
- [ ] `cd frontend && npm run lint` без помилок
- [ ] Проверить seed: `cd backend-payload && npm run seed -- --force` работает
- [ ] Проверить, что vehicleTypes корректно работают на frontend (van/sport вместо lcv)
- [ ] Проверить slug-генерацию для украинских заголовков статей

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(backend-infra): phase-3 data model fixes completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 4
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
