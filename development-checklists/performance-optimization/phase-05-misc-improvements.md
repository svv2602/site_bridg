# Фаза 5: P3 -- Preconnect, Dealer API, Sentry

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати preconnect для Google Maps API, оптимізувати getDealerById (прямий запит замість завантаження всіх дилерів), виправити deprecated Sentry API в next.config.ts.

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Перевірити layout.tsx -- які link preconnect вже є
- [ ] Вивчити dealers.ts -- getDealerById реалізацію
- [ ] Вивчити next.config.ts -- Sentry конфігурацію

**Команди для пошуку:**
```bash
# Preconnect в layout
grep -n "preconnect\|dns-prefetch" frontend/src/app/layout.tsx
# Dealer API
cat frontend/src/lib/api/dealers.ts
# Sentry config
grep -n "sentry\|Sentry\|disableLogger\|automaticVercel" frontend/next.config.ts
```

#### B. Аналіз залежностей
- [ ] Чи підтримує Payload API прямий запит `dealers/:id`?
- [ ] Яка версія @sentry/nextjs встановлена?

**Нові типи:** ні
**Нові API-функції:** оновити getDealerById
**Нові компоненти:** ні

#### C. Перевірка дизайну
- [ ] Preconnect не впливає на візуал
- [ ] getDealerById має повертати той самий тип Dealer

**Референс:** Payload REST API documentation

**Ціль:** Мінорні покращення продуктивності та maintenance.

**Нотатки для перевикористання:** -

---

### 5.1 Додати preconnect для Google Maps API в layout.tsx
- [ ] Відкрити `frontend/src/app/layout.tsx`
- [ ] Додати в `<head>`:
  ```tsx
  <link rel="preconnect" href="https://maps.googleapis.com" />
  <link rel="dns-prefetch" href="https://maps.googleapis.com" />
  ```
- [ ] Перевірити що не дублюється з існуючими preconnect

**Файли:** `frontend/src/app/layout.tsx`
**Аудит-джерело:** PERF-008

---

### 5.2 Оптимізувати getDealerById -- прямий запит по ID
- [ ] Відкрити `frontend/src/lib/api/dealers.ts`
- [ ] Замінити поточну реалізацію (завантаження всіх дилерів + find):
  ```tsx
  // БУЛО
  const all = await getDealers();
  const dealer = all.find((d) => d.id === id);

  // СТАЛО
  const res = await fetch(`${PAYLOAD_URL}/api/dealers/${id}`);
  ```
- [ ] Обробити 404 (dealer не знайдений)
- [ ] Додати error handling та fallback на старий метод якщо потрібно
- [ ] Перевірити що сторінка дилера рендериться коректно

**Файли:** `frontend/src/lib/api/dealers.ts`
**Аудит-джерело:** PERF-009

---

### 5.3 Оновити deprecated Sentry API в next.config.ts
- [ ] Відкрити `frontend/next.config.ts`
- [ ] Замінити `disableLogger: true` на `webpack: { treeshake: { removeDebugLogging: true } }` (або аналогічний новий API)
- [ ] Замінити `automaticVercelMonitors` на `webpack: { automaticVercelMonitors: ... }` (або видалити якщо не потрібно)
- [ ] Перевірити Sentry docs для актуальних налаштувань @sentry/nextjs v10
- [ ] Перевірити що build проходить без deprecation warnings

**Файли:** `frontend/next.config.ts`
**Аудит-джерело:** PERF-010

**Нотатки:** Перевірити актуальну документацію Sentry для @sentry/nextjs v10.34+

---

### 5.4 Перевірити що getDealerById працює з Payload API
- [ ] Запустити backend (якщо не запущений)
- [ ] Перевірити `curl http://localhost:3001/api/dealers/{id}` -- повертає дилера
- [ ] Перевірити сторінку дилера в браузері (якщо є деталі дилера)

**Нотатки:** Якщо Payload API не підтримує `dealers/:id` напряму -- використати `dealers?where[id][equals]={id}` як альтернативу.

---

### 5.5 Фінальна верифікація всіх оптимізацій
- [ ] `npm run build` проходить без помилок та deprecation warnings
- [ ] `npm run lint` проходить
- [ ] First Load JS -- задокументувати фінальний розмір
- [ ] Порівняти з початковим (зафіксованим в фазі 2)

**Команда:**
```bash
cd frontend && npm run build 2>&1 | grep "First Load\|Route\|warning"
```

**Нотатки:** -

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Виконай перевірки:
   ```bash
   # Preconnect перевірка
   grep -n "preconnect" frontend/src/app/layout.tsx
   # Dealer API перевірка
   grep -n "getDealerById" frontend/src/lib/api/dealers.ts
   # Sentry warnings
   cd frontend && npm run build 2>&1 | grep -i "deprecated\|warning"
   # Build та lint
   cd frontend && npm run lint
   ```
3. Зміни статус фази:
   - [x] Завершена
4. Заповни дату "Завершена: YYYY-MM-DD"
5. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(performance-optimization): phase-5 preconnect, getDealerById direct query, Sentry deprecations fixed"
   ```
6. Онови PROGRESS.md:
   - Загальний прогрес: 28/28 (100%)
   - Додай запис в історію: "Всі фази завершені"
7. Онови README.md -- відміть критерії успіху
