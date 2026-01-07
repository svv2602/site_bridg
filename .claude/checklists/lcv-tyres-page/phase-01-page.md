# Фаза 1: Створення сторінки

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Створити сторінку каталогу LCV шин за патерном passenger-tyres.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз

#### A. Референс сторінка
- [ ] Переглянути `frontend/src/app/passenger-tyres/page.tsx`
- [ ] Визначити які частини потрібно змінити (тексти, фільтр vehicleType)

**Зміни:**
- vehicleTypes filter: `"passenger"` → `"lcv"`
- Тексти: "легкових авто" → "легких комерційних авто"
- Features: адаптувати під LCV (вантажопідйомність, довговічність)

---

### 1.1 Створити сторінку
- [ ] Створити `frontend/src/app/lcv-tyres/page.tsx`
- [ ] Скопіювати структуру з passenger-tyres
- [ ] Змінити фільтр на `vehicleTypes.includes("lcv")`
- [ ] Адаптувати тексти

**Файли:** `frontend/src/app/lcv-tyres/page.tsx`

---

### 1.2 Features блок
- [ ] Змінити features на релевантні для LCV:
  - Вантажопідйомність
  - Стійкість до зносу
  - Економія пального
  - Безпека при повному завантаженні

**Файли:** `frontend/src/app/lcv-tyres/page.tsx`

---

### 1.3 SEO Metadata
- [ ] Додати metadata з title та description
- [ ] Хлібні крихти: Головна / Шини для легких комерційних авто

**Файли:** `frontend/src/app/lcv-tyres/page.tsx`

---

## При завершенні фази

1. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(lcv): phase-1 page created"
   ```
2. Відкрий phase-02-navigation.md
