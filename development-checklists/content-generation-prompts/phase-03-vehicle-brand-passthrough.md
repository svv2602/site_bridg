# Фаза 3: Передача vehicleTypes та brand у генератори

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити втрату даних у `generateFullTyreContent()`. Зараз `vehicleTypes` та `brand` з `firstSource` (RawTyreContent) НЕ передаються в `TireDescriptionInput`, тому промпт не отримує тип авто і бренд. Це погіршує якість згенерованого тексту — промпт не знає, для яких машин ця шина, і не може правильно брендувати текст (Bridgestone vs Firestone).

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Прочитати `RawTyreContent` тип — які поля доступні (шукати в `types/content.ts`)
- [x] Прочитати `index.ts:130-143` — побудова `descriptionInput` з `firstSource`
- [x] Прочитати `index.ts:156-168` — побудова SEO input (вже передає `brand`)
- [x] Прочитати `index.ts:173-179` — побудова FAQ input (НЕ передає `vehicleTypes`)
- [x] Перевірити які поля scrapers записують у raw content

---

### 3.1 Додати `vehicleTypes` та `brand` у description input
- [x] У `index.ts:130-143`, додати `vehicleTypes: firstSource.vehicleTypes`
- [x] У `index.ts:130-143`, додати `brand: firstSource.brand`
- [x] Перевірити що `TireDescriptionInput` вже має ці поля (якщо ні — додати)

**Файли:** `backend-payload/content-automation/src/processors/content/index.ts`

---

### 3.2 Додати `vehicleTypes` у FAQ input
- [x] У `index.ts:173-179`, додати `vehicleTypes: firstSource.vehicleTypes`
- [x] Перевірити що `TireFAQInput` вже має поле `vehicleTypes` (так, рядок 25)

**Файли:** `backend-payload/content-automation/src/processors/content/index.ts`

---

### 3.3 Додати `vehicleTypes` у SEO input
- [x] У `index.ts:156-168`, додати `vehicleTypes: firstSource.vehicleTypes`
- [x] Перевірити що `TireSEOInput` вже має поле `vehicleTypes` (так, рядок 23)

**Файли:** `backend-payload/content-automation/src/processors/content/index.ts`

---

### 3.4 Перевірка та тестування
- [x] Запустити тестову генерацію та перевірити що промпт містить тип авто
- [x] Перевірити що бренд-специфічний system prompt використовується для Firestone моделей
- [x] Запустити тести: `cd backend-payload && npm run test`

**Нотатки:** Всі 377 тестів пройшли.

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x] ✅
2. Зміни статус фази: [x] Завершена ✅
3. Заповни дату "Завершена: 2026-02-10" ✅
4. Виконай коміт ✅
5. Онови PROGRESS.md ✅
6. Відкрий наступну фазу ✅
