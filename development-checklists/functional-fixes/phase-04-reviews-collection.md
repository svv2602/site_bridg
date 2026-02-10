# Фаза 4: P3 -- Колекція Reviews

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Наповнити колекцію Reviews тестовими відгуками. Переконатися що сторінка /reviews відображає дані з CMS.

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити структуру колекції Reviews в Payload CMS
- [ ] Вивчити сторінку /reviews на фронтенді -- як відображаються відгуки
- [ ] Перевірити API endpoint /api/reviews -- формат відповіді
- [ ] Перевірити seed.ts -- чи є seeding для Reviews
- [ ] Перевірити чи є mock-дані для Reviews в data.ts

**Команди для пошуку:**
```bash
# Структура колекції Reviews
cat backend-payload/src/collections/Reviews.ts
# Сторінка відгуків
cat frontend/src/app/reviews/page.tsx
# API endpoint
curl -s http://localhost:3001/api/reviews | head -50
# Seed
grep -n "review\|Review" backend-payload/scripts/seed.ts
# Mock-дані
grep -n "review\|Review\|MOCK_REVIEW" frontend/src/lib/data.ts
# API функції для reviews
grep -rn "review\|Review" frontend/src/lib/api/
```

#### B. Аналіз залежностей
- [ ] Які поля є в Reviews (автор, текст, рейтинг, шина, дата)?
- [ ] Чи пов'язані Reviews з Tyres (зв'язок через relation)?
- [ ] Чи є компонент ReviewCard або подібний?

**Поля Reviews:** -
**Зв'язок з Tyres:** -
**Компоненти:** -

#### C. Планування контенту
- [ ] Скільки відгуків створити (мінімум 5-10)?
- [ ] Для яких шин створити відгуки?
- [ ] Який формат: тільки текст або текст + рейтинг + фото?

**Ціль:** Зрозуміти структуру Reviews та спланувати тестовий контент.

**Нотатки для перевикористання:** -

---

### 4.1 Перевірити структуру колекції Reviews
- [ ] Відкрити `backend-payload/src/collections/Reviews.ts`
- [ ] Задокументувати поля: slug, author/name, text/content, rating, tyre (relation), date, status
- [ ] Перевірити чи є поле status (draft/published)
- [ ] Перевірити чи є модерація (admin approval)

**Файли:** `backend-payload/src/collections/Reviews.ts`
**Нотатки:** -

---

### 4.2 Заповнити тестовими відгуками
- [ ] Вибрати спосіб:
  - Варіант A: Через адмін-панель (http://localhost:3001/admin -> Reviews)
  - Варіант B: Оновити seed скрипт та запустити `npm run seed -- --force`
  - Варіант C: Через API:
    ```bash
    curl -X POST http://localhost:3001/api/reviews \
      -H "Content-Type: application/json" \
      -d '{"author": "...", "text": "...", "rating": 5}'
    ```
- [ ] Створити мінімум 5 відгуків з різними рейтингами (3-5 зірок)
- [ ] Прив'язати частину відгуків до конкретних шин (якщо є relation)
- [ ] Переконатися що відгуки мають статус "published" (якщо є модерація)

**Файли:** `backend-payload/scripts/seed.ts` (якщо варіант B)
**Нотатки:** Аудит: LOW-001. `GET /api/reviews` -> `totalDocs: 0`

---

### 4.3 Перевірити відображення на /reviews
- [ ] Перевірити API:
  ```bash
  curl -s http://localhost:3001/api/reviews | python3 -m json.tool | head -30
  ```
  -> totalDocs > 0
- [ ] Відкрити http://localhost:3010/reviews в браузері
- [ ] Переконатися що відгуки відображаються (не порожня сторінка)
- [ ] Перевірити рейтинг, ім'я автора, текст відгуку

**Файли:** -
**Нотатки:** -

---

### 4.4 Перевірити секції відгуків на сторінках шин (опціонально)
- [ ] Перевірити чи є секція відгуків на /shyny/[slug]
- [ ] Якщо є -- переконатися що відгуки прив'язані до конкретної шини відображаються
- [ ] Якщо немає -- це задача для іншого чеклісту (UI/UX)

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`
**Нотатки:** Опціонально. Головна мета -- /reviews працює.

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
   git commit -m "checklist(functional-fixes): phase-4 reviews collection completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: завершено
   - Додай запис в історію
6. Всі фази завершено! Онови README.md -- відміть критерії успіху.
