# Фаза 8: Анімації

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Покращити анімації та micro-interactions: entrance animations, hover effects, transitions.

## Задачі

### 8.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути використання Framer Motion в проекті
- [ ] Знайти `AnimatedSection.tsx` або подібні компоненти
- [ ] Переглянути keyframes в globals.css

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
- [ ] Які компоненти використовують Framer Motion?
- [ ] Чи є lib/motion.ts з presets?

**Компоненти з motion:** -
**Motion presets:** -

#### C. Перевірка дизайну
- [ ] Вивчити `plan/result_audit/02-redesign-concept.md` — Motion Design

**Референс-документ:** `plan/result_audit/02-redesign-concept.md`

**Нотатки для перевикористання:** -

---

### 8.1 Створити motion presets

- [ ] Створити `frontend/src/lib/motion.ts` з presets:
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
**Нотатки:** -

---

### 8.2 Оновити entrance animations

- [ ] Застосувати fadeInUp до основних секцій
- [ ] Додати stagger для списків карток:
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
**Нотатки:** -

---

### 8.3 Покращити button micro-interactions

- [ ] Додати scale feedback для кнопок:
  ```tsx
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="btn-primary"
  >
    Кнопка
  </motion.button>
  ```
- [ ] Або через CSS:
  ```css
  .btn-primary:active {
    transform: scale(0.98);
  }
  ```

**Файли:** globals.css або відповідні компоненти
**Нотатки:** -

---

### 8.4 Оновити card hover animations

- [ ] Зменшити scale ефект для images (110% → 105%)
- [ ] Додати translateY для карток:
  ```css
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(28, 25, 23, 0.12);
  }
  ```
- [ ] Забезпечити smooth transition (300ms)

**Файли:** `frontend/src/components/TyreCard.tsx`, globals.css
**Нотатки:** -

---

### 8.5 Додати loading animations

- [ ] Оновити LoadingSkeleton.tsx (якщо є)
- [ ] Додати pulse animation:
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
**Нотатки:** -

---

### 8.6 Оновити transition durations

- [ ] Переглянути всі `duration-*` класи
- [ ] Стандартизувати:
  - Instant (colors): 150ms
  - Fast (hovers): 200ms
  - Normal (transitions): 300ms
  - Slow (page elements): 500ms

**Файли:** компоненти з transitions
**Нотатки:** -

---

### 8.7 Перевірити reduced-motion

- [ ] Переконатися, що є стилі для reduced motion:
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
**Нотатки:** -

---

### 8.8 Перевірка та тестування

- [ ] Запустити `npm run build`
- [ ] Перевірити entrance animations при завантаженні сторінок
- [ ] Перевірити hover ефекти на картках та кнопках
- [ ] Перевірити performance (60fps)
- [ ] Перевірити з reduced-motion setting

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
   git commit -m "checklist(ui-ux-redesign): phase-8 animations completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 9
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
