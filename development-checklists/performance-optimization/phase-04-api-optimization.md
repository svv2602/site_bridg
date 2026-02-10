# Фаза 4: P2 -- API Optimization

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Оптимізувати API-запити шин: використовувати `depth=1` та `select` для листингових сторінок (каталог, категорії), залишити `depth=2` тільки для детальних сторінок `/shyny/[slug]`. Додати розумний `limit` для пагінації. Зменшити payload size для листингів.

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити payload.ts -- функції getTyres, getTyreBySlug
- [ ] Перевірити які поля потрібні для листинга (TyreCard) vs деталі (TyrePage)
- [ ] Перевірити поточні depth/limit значення за замовчуванням
- [ ] Заміряти час відповіді та розмір payload

**Команди для пошуку:**
```bash
# API функції
grep -n "getTyres\|getTyreBySlug\|depth\|limit" frontend/src/lib/api/payload.ts
# Використання getTyres (де потрібен листинг)
grep -rn "getTyres\b" frontend/src/
# Використання getTyreBySlug (де потрібні деталі)
grep -rn "getTyreBySlug" frontend/src/
# Які поля TyreCard використовує
grep -n "tyre\.\|item\." frontend/src/components/TyreCard.tsx
```

#### B. Аналіз залежностей
- [ ] Чи підтримує Payload API параметр `select`?
- [ ] Чи зламається пагінація при зміні limit?
- [ ] Які поля потрібні для фільтрації на стороні клієнта?

**Нові типи:** можливо TyreListItem (підмножина Tyre)
**Нові API-функції:** можливо getTyresForListing з depth=1
**Нові компоненти:** ні

#### C. Перевірка дизайну
- [ ] Листинг карток показує: назву, зображення, сезон, розміри, badges
- [ ] Деталі сторінки: все вище + technologies (повні об'єкти), FAQs, EU label

**Референс-файл:** `frontend/src/lib/api/payload.ts`

**Ціль:** Визначити мінімальний набір полів для листинга та максимальний для деталей.

**Нотатки для перевикористання:** -

---

### 4.1 Використати depth=1 + select для листингових запитів шин
- [ ] В payload.ts: створити окрему функцію або параметри для листинга
- [ ] Встановити `depth=1` для листингів (technologies як ID замість повних об'єктів)
- [ ] Додати `select` параметр для запиту тільки потрібних полів листинга:
  - name, slug, season, imageUrl, sizes, badges, euLabel (базові поля)
  - Виключити: fullDescription, faqs, relatedTyres
- [ ] Перевірити що TyreCard рендериться коректно з depth=1 даними

**Файли:** `frontend/src/lib/api/payload.ts`
**Аудит-джерело:** PERF-006

---

### 4.2 Залишити depth=2 для детальних сторінок /shyny/[slug]
- [ ] Переконатися що `getTyreBySlug` або запит для деталей використовує depth=2
- [ ] Перевірити що technologies завантажуються як повні об'єкти на деталях
- [ ] Перевірити що FAQs та relatedTyres завантажуються коректно

**Файли:** `frontend/src/lib/api/payload.ts`, `frontend/src/app/shyny/[slug]/page.tsx`
**Аудит-джерело:** PERF-006

---

### 4.3 Додати limit для пагінації каталогів
- [ ] Для категорійних сторінок (/passenger-tyres, /suv-4x4-tyres, /lcv-tyres): замість `limit=500` використати розумний limit (наприклад 50)
- [ ] Перевірити чи є пагінація на категорійних сторінках
- [ ] Якщо немає -- задокументувати що при зростанні каталогу потрібно додати
- [ ] Для сторінки /tyre-search залишити limit=500 (повний каталог потрібний для фільтрації)

**Файли:** `frontend/src/lib/api/payload.ts`
**Аудит-джерело:** PERF-006

**Нотатки:** Поточний каталог ~20-30 моделей. Оптимізація limit критична при масштабуванні до 100+ моделей.

---

### 4.4 Перевірити response time та payload size
- [ ] Заміряти response time `/api/tyres` з новими параметрами (depth=1, select)
- [ ] Порівняти payload size до і після оптимізації
- [ ] Задокументувати результати

**Команди:**
```bash
# До оптимізації (якщо backend запущений)
curl -s -w "\nTime: %{time_total}s\nSize: %{size_download} bytes\n" "http://localhost:3001/api/tyres?limit=500&depth=2" -o /dev/null
# Після оптимізації
curl -s -w "\nTime: %{time_total}s\nSize: %{size_download} bytes\n" "http://localhost:3001/api/tyres?limit=50&depth=1" -o /dev/null
```

**Нотатки:** -

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Виконай перевірки:
   ```bash
   # Перевірка depth/limit в коді
   grep -n "depth\|limit" frontend/src/lib/api/payload.ts
   # Build та lint
   cd frontend && npm run lint && npm run build
   ```
3. Зміни статус фази:
   - [x] Завершена
4. Заповни дату "Завершена: YYYY-MM-DD"
5. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(performance-optimization): phase-4 API optimization -- depth=1 for listings, select for minimal payload"
   ```
6. Онови PROGRESS.md:
   - Поточна фаза: 5
   - Додай запис в історію
7. Відкрий наступну фазу та продовж роботу
