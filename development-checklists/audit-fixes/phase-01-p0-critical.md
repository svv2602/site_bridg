# Фаза 1: P0 Critical — Критичні виправлення

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-10
**Завершена:** 2026-01-10

## Ціль фази
Виправити критичні проблеми, які блокують базову функціональність сайту:
- Зробити всі кнопки та посилання функціональними
- Підключити API замість mock-даних
- Реалізувати функціональність форм
- Виправити security проблеми в адмінці

---

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти приклади функціональних кнопок з href/onClick
- [x] Вивчити як працює tyre-search форма (вона частково функціональна)
- [x] Перевірити API функції в `lib/api/`

#### B. Аналіз залежностей
- [x] Перевірити наявні API функції: `getArticles`, `getDealers`, `getTechnologies`
- [x] Перевірити роутинг: куди мають вести кнопки

#### C. Security аналіз
- [x] Знайти де зберігаються credentials в middleware.ts
- [x] Перевірити .env.example для правильних env vars

---

### 1.1 Головна сторінка — функціональні кнопки

**Джерело:** `plan/result_audit/01-home.md`

#### Кнопки категорій шин
- [x] "Перейти" в категорії "Літні шини" → Link to `/passenger-tyres?season=summer`
- [x] "Перейти" в категорії "Зимові шини" → Link to `/passenger-tyres?season=winter`
- [x] "Перейти" в категорії "Всесезонні шини" → Link to `/passenger-tyres?season=allseason`

#### Кнопки популярних шин
- [x] "Детальніше" для кожної шини → Link to `/shyny/{slug}`

#### Кнопки статей
- [x] "Читати статтю" для кожної статті → Link to `/advice/{slug}`

#### CTA кнопки
- [x] "Знайти дилера" → Link to `/dealers`
- [x] "Отримати консультацію" → Link to `/contacts`
- [x] "Зателефонувати" → `<a href="tel:0800123456">`

**Файли:** `frontend/src/app/page.tsx`

---

### 1.2 QuickSearchForm — реальний пошук

**Джерело:** `plan/result_audit/01-home.md`

- [x] Додати handler для форми "За розміром"
- [x] При submit перенаправляти на `/tyre-search?width=X&height=Y&diameter=Z&season=S`
- [x] Додати handler для форми "За авто"
- [x] При submit перенаправляти на `/tyre-search?make=X&model=Y&year=Z`
- [x] Видалити placeholder текст "Пізніше пошук буде підключено..."

**Файли:** `frontend/src/components/QuickSearchForm.tsx`

---

### 1.3 Контактна форма — submit handler

**Джерело:** `plan/result_audit/05-dealers-contacts.md`

- [x] Створити API endpoint `/api/contact` для обробки форми
- [x] Додати onSubmit handler в форму
- [x] Додати state для loading/success/error
- [x] Показувати feedback користувачу після submit
- [x] Валідація полів (email, required fields)

**Файли:**
- `frontend/src/app/contacts/page.tsx`
- `frontend/src/app/api/contact/route.ts` (новий)

---

### 1.4 /advice — підключити API замість mock

**Джерело:** `plan/result_audit/04-content.md`

- [x] Змінити import з `MOCK_ARTICLES` на `getArticles()` з `lib/api/articles.ts`
- [x] Конвертувати в Server Component (async)
- [x] Зробити кнопку "Читати статтю" як Link на `/advice/{slug}`
- [x] Зробити категорії функціональними (фільтрація або окремі сторінки)

**Файли:** `frontend/src/app/advice/page.tsx`

---

### 1.5 /technology — підключити API замість mock

**Джерело:** `plan/result_audit/04-content.md`

- [x] Змінити import з `MOCK_TECHNOLOGIES` на API функцію
- [x] Конвертувати в Server Component (async)
- [x] Зробити кнопки "Дізнатися більше", "Детальніше" функціональними
- [x] Зв'язати технології з реальними моделями шин

**Файли:** `frontend/src/app/technology/page.tsx`
**Новий файл:** `frontend/src/lib/api/technologies.ts`

---

### 1.6 /dealers — використати API шар

**Джерело:** `plan/result_audit/05-dealers-contacts.md`

- [x] Змінити import з `MOCK_DEALERS` на `getDealers()` з `lib/api/dealers.ts`
- [x] Використати useEffect для завантаження даних
- [x] Зробити кнопку "Побудувати маршрут" функціональною (Google Maps directions)
- [x] Зробити кнопку "Зателефонувати" як `<a href="tel:...">`
- [x] Зробити кнопку "Заповнити форму" як Link на `/contacts`
- [x] Додати loading state під час завантаження

**Файли:** `frontend/src/app/dealers/page.tsx`

---

### 1.7 Security — прибрати default credentials

**Джерело:** `plan/result_audit/06-admin.md`

- [x] Видалити hardcoded credentials з middleware.ts
- [x] Зробити credentials обов'язковими через env vars
- [x] Додати перевірку наявності env vars при старті

**Файли:** `frontend/src/middleware.ts`

---

### 1.8 /about — функціональні кнопки

**Джерело:** `plan/result_audit/04-content.md`

- [x] "Дізнатися більше" → anchor link to #mission section
- [x] "Зв'язатися з нами" → Link to `/contacts`
- [x] "Знайти дилера" → Link to `/dealers`
- [x] "Зателефонувати" → `<a href="tel:...">`
- [x] Виправлено Timeline layout для mobile (використано flex-col для малих екранів)

**Файли:** `frontend/src/app/about/page.tsx`

---

## Підсумок виконаних змін

### Змінені файли:
1. `frontend/src/app/page.tsx` - функціональні кнопки з Links
2. `frontend/src/components/QuickSearchForm.tsx` - робочий пошук з router.push
3. `frontend/src/app/contacts/page.tsx` - форма з submit handler та станами
4. `frontend/src/app/api/contact/route.ts` - **новий** API endpoint
5. `frontend/src/app/advice/page.tsx` - Server Component з API
6. `frontend/src/app/technology/page.tsx` - Server Component з API
7. `frontend/src/lib/api/technologies.ts` - **новий** API layer для технологій
8. `frontend/src/app/dealers/page.tsx` - Client Component з useEffect та API
9. `frontend/src/middleware.ts` - security fix (no default credentials)
10. `frontend/src/app/about/page.tsx` - функціональні кнопки та mobile fix

### Виправлено проблем: 8 P0 критичних
