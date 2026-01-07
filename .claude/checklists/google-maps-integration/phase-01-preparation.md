# Фаза 1: Підготовка

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Налаштувати Google Maps API, встановити залежності, підготувати env змінні.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути `frontend/src/app/dealers/page.tsx` — поточна реалізація
- [ ] Переглянути `frontend/src/lib/data.ts` — тип Dealer
- [ ] Переглянути `frontend/src/lib/api/dealers.ts` — API функції

**Команди для аналізу:**
```bash
cat frontend/src/app/dealers/page.tsx | head -100
grep -n "interface Dealer" frontend/src/lib/data.ts
cat frontend/src/lib/api/dealers.ts
```

#### B. Аналіз залежностей
- [ ] Перевірити чи є latitude/longitude в типі Dealer
- [ ] Визначити який пакет використовувати (@react-google-maps/api vs react-leaflet)

**Рішення щодо пакету:** -

#### C. Перевірка дизайну
- [ ] Переглянути placeholder карти в dealers/page.tsx
- [ ] Визначити розміри та стилі для карти

**Розміри карти:** -

**Нотатки для перевикористання:** -

---

### 1.1 Встановлення залежностей
- [ ] Встановити `@react-google-maps/api`
- [ ] Перевірити сумісність з React 19

**Команда:**
```bash
cd frontend && npm install @react-google-maps/api
```

**Файли:** `frontend/package.json`
**Нотатки:** -

---

### 1.2 Налаштування env змінних
- [ ] Створити `.env.local` якщо не існує
- [ ] Додати `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] Додати приклад в `.env.example`

**Файли:** `frontend/.env.local`, `frontend/.env.example`
**Нотатки:** API ключ отримати з Google Cloud Console

---

### 1.3 Створення компонента-обгортки для карти
- [ ] Створити `frontend/src/components/DealersMap.tsx`
- [ ] Експортувати базовий компонент з LoadScript

**Файли:** `frontend/src/components/DealersMap.tsx`
**Нотатки:** -

---

## При завершенні фази

1. Убедись, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(google-maps): phase-1 preparation completed"
   ```
5. Онови PROGRESS.md
6. Відкрий phase-02-basic-map.md
