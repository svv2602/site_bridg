# Фаза 2: Система дизайну

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Створити уніфіковану систему дизайну: spacing, типографіка, container, базові утиліти.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути поточні spacing значення в компонентах
- [ ] Знайти всі використання `max-w-7xl` (container)
- [ ] Знайти всі використання `py-12`, `py-16` (section padding)

**Команди для пошуку:**
```bash
# Container використання
grep -r "max-w-7xl" frontend/src/
# Section padding
grep -r "py-12\|py-16\|py-20" frontend/src/app/
# Font sizes
grep -r "text-4xl\|text-5xl\|text-3xl" frontend/src/
```

#### B. Аналіз залежностей
- [ ] Які компоненти використовують container?
- [ ] Які секції потребують оновлення padding?

**Компоненти з container:** -
**Секції для оновлення:** -

#### C. Перевірка дизайну
- [ ] Вивчити `plan/result_audit/03-recommendations.md` — spacing система

**Референс-документ:** `plan/result_audit/03-recommendations.md` (секція "Сітка та відступи")

**Нотатки для перевикористання:** -

---

### 2.1 Оновлення container

- [ ] Збільшити max-width з 1280px до 1440px
- [ ] Оновити padding:
  - Mobile: 24px (px-6)
  - Tablet: 48px (md:px-12)
  - Desktop: 64px (lg:px-16)
- [ ] Створити утиліту `.container-redesign` в globals.css:
  ```css
  .container-redesign {
    width: 100%;
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  @media (min-width: 768px) {
    .container-redesign {
      padding-left: 3rem;
      padding-right: 3rem;
    }
  }

  @media (min-width: 1024px) {
    .container-redesign {
      padding-left: 4rem;
      padding-right: 4rem;
    }
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** -

---

### 2.2 Оновлення section spacing

- [ ] Створити класи для section rhythm:
  ```css
  .section-spacing {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  @media (min-width: 768px) {
    .section-spacing {
      padding-top: 4rem;
      padding-bottom: 4rem;
    }
  }

  @media (min-width: 1024px) {
    .section-spacing {
      padding-top: 5rem;
      padding-bottom: 5rem;
    }
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** -

---

### 2.3 Типографічна шкала

- [ ] Додати CSS змінні для типографіки:
  ```css
  :root {
    /* Font sizes */
    --text-xs: 0.875rem;    /* 14px - мінімум */
    --text-sm: 1rem;        /* 16px */
    --text-base: 1.125rem;  /* 18px */
    --text-lg: 1.25rem;     /* 20px */
    --text-xl: 1.5rem;      /* 24px */
    --text-2xl: 1.875rem;   /* 30px */
    --text-3xl: 2.25rem;    /* 36px */
    --text-4xl: 3rem;       /* 48px */
    --text-5xl: 3.75rem;    /* 60px */

    /* Line heights */
    --leading-tight: 1.2;
    --leading-snug: 1.35;
    --leading-normal: 1.6;
    --leading-relaxed: 1.75;
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** -

---

### 2.4 Heading стилі

- [ ] Оновити heading стилі в globals.css:
  ```css
  h1 {
    font-size: clamp(2.25rem, 5vw, 3.75rem);
    font-weight: 800;
    line-height: var(--leading-tight);
    letter-spacing: -0.02em;
  }

  h2 {
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-weight: 700;
    line-height: var(--leading-snug);
  }

  h3 {
    font-size: clamp(1.25rem, 2vw, 1.5rem);
    font-weight: 600;
    line-height: var(--leading-snug);
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** -

---

### 2.5 Transition утиліти

- [ ] Додати transition утиліти:
  ```css
  .transition-fast {
    transition: all 0.15s ease-out;
  }

  .transition-normal {
    transition: all 0.3s ease-out;
  }

  .transition-slow {
    transition: all 0.5s ease-out;
  }

  .transition-spring {
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** -

---

### 2.6 Hover утиліти

- [ ] Оновити `.hover-lift`:
  ```css
  .hover-lift {
    transition: all 0.3s ease-out;
  }

  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(28, 25, 23, 0.12);
  }
  ```
- [ ] Додати `.hover-glow`:
  ```css
  .hover-glow {
    transition: all 0.3s ease-out;
  }

  .hover-glow:hover {
    box-shadow: 0 0 40px rgba(227, 6, 19, 0.3);
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** -

---

### 2.7 Glass morphism утиліти

- [ ] Додати glass effect класи:
  ```css
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-dark {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** -

---

### 2.8 Перевірка та тестування

- [ ] Запустити `npm run build`
- [ ] Перевірити, що всі нові класи компілюються
- [ ] Візуально перевірити, що існуючий UI не зламався

**Команди:**
```bash
cd frontend && npm run build && npm run dev
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
   git commit -m "checklist(ui-ux-redesign): phase-2 design-system completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
