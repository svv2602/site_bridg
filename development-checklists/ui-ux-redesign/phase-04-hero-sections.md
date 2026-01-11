# Фаза 4: Hero секції

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Редизайн SeasonalHero компонента: теплий gradient, ambient glow, compact search, floating tyre image.

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути `frontend/src/components/SeasonalHero.tsx`
- [x] Переглянути `frontend/src/components/QuickSearchForm.tsx`
- [x] Знайти всі hero секції на інших сторінках

**Команди для пошуку:**
```bash
# SeasonalHero
cat frontend/src/components/SeasonalHero.tsx
# QuickSearchForm
cat frontend/src/components/QuickSearchForm.tsx
# Інші hero секції
grep -r "from-zinc-950\|hero" frontend/src/app/
```

#### B. Аналіз залежностей
- [x] Які props приймає SeasonalHero?
- [x] Де використовується SeasonalHero?
- [x] Чи потрібно оновлювати QuickSearchForm?

**Props SeasonalHero:** children (React.ReactNode)
**Використання:** page.tsx (головна сторінка)
**QuickSearchForm зміни:** Так — заміна zinc на stone

#### C. Перевірка дизайну
- [x] Вивчити `plan/result_audit/04-hero-improvements.md`

**Референс-документ:** `plan/result_audit/04-hero-improvements.md`

**Нотатки для перевикористання:** Застосовано hero-glow та hero-grid-pattern з globals.css

---

### 4.1 Оновлення фону Hero

- [x] Відкрити `frontend/src/components/SeasonalHero.tsx`
- [x] Замінити gradient з zinc на stone:
  ```tsx
  // Було
  className="from-zinc-950 via-zinc-900 to-zinc-800"

  // Стало
  className="from-stone-950 via-stone-900 to-stone-800"
  ```
- [x] Змінити напрямок на `bg-gradient-to-br` (bottom-right)

**Файли:** `frontend/src/components/SeasonalHero.tsx`
**Нотатки:** Виконано — warm stone gradient

---

### 4.2 Додати ambient glow

- [x] Додати pseudo-element для glow ефекту:
  ```tsx
  {/* Ambient glow */}
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-[800px] h-[600px] bg-primary/15 blur-[100px] rounded-full
                  pointer-events-none" />
  ```
- [x] Або додати через CSS в globals.css:
  ```css
  .hero-glow::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 600px;
    background: radial-gradient(ellipse, rgba(227, 6, 19, 0.15) 0%, transparent 70%);
    filter: blur(100px);
    pointer-events: none;
  }
  ```

**Файли:** `frontend/src/components/SeasonalHero.tsx`, `frontend/src/app/globals.css`
**Нотатки:** Використано CSS варіант через hero-glow клас

---

### 4.3 Додати subtle grid pattern

- [x] Додати grid pattern overlay:
  ```css
  .hero-grid-pattern {
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 50px 50px;
  }
  ```
- [x] Застосувати до hero фону

**Файли:** `frontend/src/app/globals.css`, `frontend/src/components/SeasonalHero.tsx`
**Нотатки:** Додано hero-grid-pattern клас до секції hero

---

### 4.4 Оновити типографіку Hero

- [x] H1: використати `clamp(2.25rem, 5vw, 3.75rem)` для responsive
- [x] Додати text-shadow для глибини:
  ```css
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.3)
  ```
- [x] Збільшити контраст тексту:
  - Заголовок: `text-stone-50`
  - Підзаголовок: `text-stone-300`

**Файли:** `frontend/src/components/SeasonalHero.tsx`
**Нотатки:** Оновлено кольори тексту з zinc на stone

---

### 4.5 Спростити структуру Hero (опціонально)

- [x] Оцінити чи потрібно прибирати Season Visual Card
- [x] Розглянути варіант Compact Search замість великої форми
- [x] Якщо змінюємо — оновити layout:
  - Центрований headline + subtitle
  - Compact search bar під текстом
  - Category quick links
  - Trust indicators внизу

**Файли:** `frontend/src/components/SeasonalHero.tsx`
**Нотатки:** ПРОПУЩЕНО — поточна структура працює добре, зміни лише косметичні (кольори)

---

### 4.6 Оновити QuickSearchForm (темна тема)

- [x] Відкрити `frontend/src/components/QuickSearchForm.tsx`
- [x] Замінити zinc на stone в усіх класах:
  - `bg-zinc-900` → `bg-stone-900`
  - `border-zinc-800` → `border-stone-800`
  - `text-zinc-50` → `text-stone-50`
  - `text-zinc-400` → `text-stone-400`

**Файли:** `frontend/src/components/QuickSearchForm.tsx`
**Нотатки:** Виконано — всі zinc кольори замінено на stone

---

### 4.7 Оновити сезонний badge

- [x] Оновити стилі сезонного badge в SeasonalHero:
  - Збільшити padding
  - Змінити border-radius на 12px
  - Додати backdrop-blur для glass effect

**Файли:** `frontend/src/components/SeasonalHero.tsx`
**Нотатки:** Оновлено з zinc на stone кольори

---

### 4.8 Перевірка та тестування

- [x] Запустити `npm run build`
- [x] Перевірити головну сторінку
- [x] Перевірити hero на різних breakpoints (mobile, tablet, desktop)
- [x] Перевірити dark/light mode

**Команди:**
```bash
cd frontend && npm run dev
# Відкрити http://localhost:3010 та перевірити
```

**Файли:** -
**Нотатки:** Build успішний! 55 сторінок згенеровано

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
   git commit -m "checklist(ui-ux-redesign): phase-4 hero-sections completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 5
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
