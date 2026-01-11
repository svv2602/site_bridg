# Фаза 8: Анімації

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Покращити анімації та micro-interactions: entrance animations, hover effects, transitions.

## Задачі

### 8.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути використання Framer Motion в проекті
- [x] Знайти `AnimatedSection.tsx` або подібні компоненти
- [x] Переглянути keyframes в globals.css

**Команди для пошуку:**
```bash
# Framer Motion
grep -r "motion\." frontend/src/
# AnimatedSection
cat frontend/src/components/AnimatedSection.tsx 2>/dev/null || echo "Not found"
# Keyframes
grep -A5 "@keyframes" frontend/src/app/globals.css
```

#### B. Аналіз залежностей
- [x] Які компоненти використовують Framer Motion?
- [x] Чи є lib/motion.ts з presets?

**Компоненти з motion:** SeasonalHero, AnimatedSection, VehicleTyreSelector, CookiesBanner, about, dealers, contacts
**Motion presets:** Вже є keyframes в globals.css (fadeIn, slideInLeft, slideInRight, pulse, float)

#### C. Перевірка дизайну
- [x] Вивчити `plan/result_audit/02-redesign-concept.md` — Motion Design

**Референс-документ:** `plan/result_audit/02-redesign-concept.md`

**Нотатки для перевикористання:** Анімації вже реалізовані через Framer Motion + CSS keyframes

---

### 8.1 Створити motion presets

- [x] Створити `frontend/src/lib/motion.ts` з presets:
  ```typescript
  export const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
  }

  export const fadeInLeft = {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
  }

  export const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  export const scaleOnHover = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }
  ```

**Файли:** `frontend/src/lib/motion.ts`
**Нотатки:** SKIP — вже є keyframes в globals.css + AnimatedSection.tsx

---

### 8.2 Оновити entrance animations

- [x] Застосувати fadeInUp до основних секцій
- [x] Додати stagger для списків карток:
  ```tsx
  <motion.div variants={staggerContainer} initial="initial" animate="animate">
    {items.map((item, i) => (
      <motion.div key={i} variants={fadeInUp}>
        <TyreCard {...item} />
      </motion.div>
    ))}
  </motion.div>
  ```

**Файли:** сторінки з grid карток
**Нотатки:** Вже реалізовано через AnimatedSection + motion.div

---

### 8.3 Покращити button micro-interactions

- [x] Додати scale feedback для кнопок:
  ```tsx
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="btn-primary"
  >
    Кнопка
  </motion.button>
  ```
- [x] Або через CSS:
  ```css
  .btn-primary:active {
    transform: scale(0.98);
  }
  ```

**Файли:** globals.css або відповідні компоненти
**Нотатки:** Вже реалізовано в Phase 3 для btn-primary/secondary/ghost

---

### 8.4 Оновити card hover animations

- [x] Зменшити scale ефект для images (110% → 105%)
- [x] Додати translateY для карток:
  ```css
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(28, 25, 23, 0.12);
  }
  ```
- [x] Забезпечити smooth transition (300ms)

**Файли:** `frontend/src/components/TyreCard.tsx`, globals.css
**Нотатки:** Реалізовано в Phase 7: hover:-translate-y-1, scale-105, duration-300

---

### 8.5 Додати loading animations

- [x] Оновити LoadingSkeleton.tsx (якщо є)
- [x] Додати pulse animation:
  ```css
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .skeleton {
    animation: pulse 2s ease-in-out infinite;
    background: linear-gradient(90deg, var(--muted) 0%, var(--border) 50%, var(--muted) 100%);
    background-size: 200% 100%;
  }
  ```

**Файли:** `frontend/src/components/ui/LoadingSkeleton.tsx`, globals.css
**Нотатки:** Оновлено zinc→stone, pulse keyframe вже є в globals.css

---

### 8.6 Оновити transition durations

- [x] Переглянути всі `duration-*` класи
- [x] Стандартизувати:
  - Instant (colors): 150ms
  - Fast (hovers): 200ms
  - Normal (transitions): 300ms
  - Slow (page elements): 500ms

**Файли:** компоненти з transitions
**Нотатки:** duration-300 для карток та основних transitions, duration-500 для hero elements

---

### 8.7 Перевірити reduced-motion

- [x] Переконатися, що є стилі для reduced motion:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Вже реалізовано в globals.css + підтримка Framer Motion

---

### 8.8 Перевірка та тестування

- [x] Запустити `npm run build`
- [x] Перевірити entrance animations при завантаженні сторінок
- [x] Перевірити hover ефекти на картках та кнопках
- [x] Перевірити performance (60fps)
- [x] Перевірити з reduced-motion setting

**Команди:**
```bash
cd frontend && npm run dev
```

**Файли:** -
**Нотатки:** Build успішний! Анімації працюють

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
   git commit -m "checklist(ui-ux-redesign): phase-8 animations completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 9
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
