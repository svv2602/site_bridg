# Фаза 5: Навігація

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Оновити Header та Footer компоненти відповідно до нової системи дизайну.

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути `frontend/src/components/MainHeader.tsx`
- [ ] Переглянути footer в `frontend/src/app/layout.tsx`
- [ ] Знайти TopBar компонент (якщо є окремий)

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
- [ ] Чи є окремі компоненти для TopBar, Footer?
- [ ] Які елементи навігації є?

**TopBar:** -
**Footer:** -
**Nav items:** -

#### C. Перевірка дизайну
- [ ] Вивчити `plan/result_audit/01-current-problems.md` — секція "Навігація"

**Референс-документ:** `plan/result_audit/01-current-problems.md`

**Нотатки для перевикористання:** -

---

### 5.1 Оновлення MainHeader — кольори

- [ ] Відкрити `frontend/src/components/MainHeader.tsx`
- [ ] Замінити zinc на stone:
  - `bg-zinc-900/95` → `bg-stone-900/95`
  - `border-zinc-800` → `border-stone-800`
  - `text-zinc-50` → `text-stone-50`
  - `text-zinc-400` → `text-stone-400`

**Файли:** `frontend/src/components/MainHeader.tsx`
**Нотатки:** -

---

### 5.2 Оновлення MainHeader — структура

- [ ] Переглянути чи потрібно показувати більше nav links на desktop
- [ ] Оцінити чи потрібен TopBar (контакти, language toggle)
- [ ] Якщо TopBar перевантажений — спростити або прибрати

**Файли:** `frontend/src/components/MainHeader.tsx`
**Нотатки:** -

---

### 5.3 Оновлення мобільного меню

- [ ] Оновити стилі dropdown меню:
  - Збільшити padding на touch targets
  - Змінити zinc → stone
  - Додати smooth transition для відкриття
- [ ] Перевірити, що всі пункти меню доступні

**Файли:** `frontend/src/components/MainHeader.tsx`
**Нотатки:** -

---

### 5.4 Оновлення Footer — кольори

- [ ] Знайти footer (в layout.tsx або окремий компонент)
- [ ] Замінити zinc на stone в усіх класах
- [ ] Оновити border та text кольори

**Файли:** `frontend/src/app/layout.tsx` або відповідний компонент
**Нотатки:** -

---

### 5.5 Оновлення Footer — типографіка

- [ ] Збільшити мінімальний розмір тексту до 14px
- [ ] Покращити контраст текстових посилань
- [ ] Оновити hover стани для links

**Файли:** footer компонент
**Нотатки:** -

---

### 5.6 Додати social icons (опціонально)

- [ ] Оцінити чи потрібні social icons в footer
- [ ] Якщо так — додати Facebook, Instagram, LinkedIn icons
- [ ] Використати Lucide icons

**Файли:** footer компонент
**Нотатки:** -

---

### 5.7 Перевірка та тестування

- [ ] Запустити `npm run build`
- [ ] Перевірити header на всіх сторінках
- [ ] Перевірити mobile menu відкриття/закриття
- [ ] Перевірити footer links

**Команди:**
```bash
cd frontend && npm run dev
```

**Файли:** -
**Нотатки:** -

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
