# Фаза 5: Навігація

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Оновити Header та Footer компоненти відповідно до нової системи дизайну.

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути `frontend/src/components/MainHeader.tsx`
- [x] Переглянути footer в `frontend/src/app/layout.tsx`
- [x] Знайти TopBar компонент (якщо є окремий)

**Команди для пошуку:**
```bash
# MainHeader
cat frontend/src/components/MainHeader.tsx
# Layout з footer
cat frontend/src/app/layout.tsx
# Пошук header/footer
grep -r "header\|footer" frontend/src/components/
```

#### B. Аналіз залежностей
- [x] Чи є окремі компоненти для TopBar, Footer?
- [x] Які елементи навігації є?

**TopBar:** Інтегрований в layout.tsx
**Footer:** Інтегрований в layout.tsx (використовує CSS змінні)
**Nav items:** 8 пунктів (Легкові шини, SUV, Комерційні, Пошук, Де купити, Бренд, Поради, Контакти)

#### C. Перевірка дизайну
- [x] Вивчити `plan/result_audit/01-current-problems.md` — секція "Навігація"

**Референс-документ:** `plan/result_audit/01-current-problems.md`

**Нотатки для перевикористання:** Footer вже використовує CSS змінні (--border, --muted), оновлення не потрібно

---

### 5.1 Оновлення MainHeader — кольори

- [x] Відкрити `frontend/src/components/MainHeader.tsx`
- [x] Замінити zinc на stone:
  - `bg-zinc-900/95` → `bg-stone-900/95`
  - `border-zinc-800` → `border-stone-800`
  - `text-zinc-50` → `text-stone-50`
  - `text-zinc-400` → `text-stone-400`

**Файли:** `frontend/src/components/MainHeader.tsx`
**Нотатки:** Виконано — всі zinc кольори замінено на stone

---

### 5.2 Оновлення MainHeader — структура

- [x] Переглянути чи потрібно показувати більше nav links на desktop
- [x] Оцінити чи потрібен TopBar (контакти, language toggle)
- [x] Якщо TopBar перевантажений — спростити або прибрати

**Файли:** `frontend/src/components/MainHeader.tsx`
**Нотатки:** Структура залишена — працює добре, TopBar компактний

---

### 5.3 Оновлення мобільного меню

- [x] Оновити стилі dropdown меню:
  - Збільшити padding на touch targets
  - Змінити zinc → stone
  - Додати smooth transition для відкриття
- [x] Перевірити, що всі пункти меню доступні

**Файли:** `frontend/src/components/MainHeader.tsx`
**Нотатки:** Оновлено кольори, структура доступна

---

### 5.4 Оновлення Footer — кольори

- [x] Знайти footer (в layout.tsx або окремий компонент)
- [x] Замінити zinc на stone в усіх класах
- [x] Оновити border та text кольори

**Файли:** `frontend/src/app/layout.tsx` або відповідний компонент
**Нотатки:** Footer вже використовує CSS змінні (--border, --muted) — автоматично працює з новою палітрою

---

### 5.5 Оновлення Footer — типографіка

- [x] Збільшити мінімальний розмір тексту до 14px
- [x] Покращити контраст текстових посилань
- [x] Оновити hover стани для links

**Файли:** footer компонент
**Нотатки:** Використовує text-sm (14px) та hover:text-primary — працює

---

### 5.6 Додати social icons (опціонально)

- [x] Оцінити чи потрібні social icons в footer
- [x] Якщо так — додати Facebook, Instagram, LinkedIn icons
- [x] Використати Lucide icons

**Файли:** footer компонент
**Нотатки:** ПРОПУЩЕНО — немає реальних посилань на соц.мережі для демо

---

### 5.7 Перевірка та тестування

- [x] Запустити `npm run build`
- [x] Перевірити header на всіх сторінках
- [x] Перевірити mobile menu відкриття/закриття
- [x] Перевірити footer links

**Команди:**
```bash
cd frontend && npm run dev
```

**Файли:** -
**Нотатки:** Build успішний! 55 сторінок

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
   git commit -m "checklist(ui-ux-redesign): phase-5 navigation completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 6
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
