# Фаза 1: Підготовка

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Підготувати інфраструктуру для редизайну: оновити Tailwind конфігурацію, додати нові кольори, налаштувати шрифти.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути `frontend/tailwind.config.ts` — поточна конфігурація
- [x] Переглянути `frontend/src/app/globals.css` — CSS змінні
- [x] Переглянути `frontend/src/app/layout.tsx` — підключення шрифтів
- [x] Переглянути `frontend/package.json` — встановлені залежності

**Команди для пошуку:**
```bash
# Поточна Tailwind конфігурація
cat frontend/tailwind.config.ts
# CSS змінні
head -100 frontend/src/app/globals.css
# Layout з шрифтами
cat frontend/src/app/layout.tsx
```

#### B. Аналіз залежностей
- [x] Чи потрібно оновлювати Tailwind?
- [x] Чи потрібні додаткові пакети для шрифтів?
- [x] Чи є конфлікти з поточними стилями?

**Нові залежності:** Не потрібні — Tailwind v4 вже встановлено
**Конфлікти:** tailwind.config.ts НЕ існує — Tailwind v4 використовує CSS-first config через @theme inline

#### C. Перевірка дизайну
- [x] Вивчити `plan/result_audit/03-recommendations.md` — рекомендовані кольори
- [x] Вивчити `plan/result_audit/02-redesign-concept.md` — типографіка

**Референс-документ:** `plan/result_audit/03-recommendations.md`

**Ціль:** Зрозуміти поточний стан конфігурації ПЕРЕД внесенням змін.

**Нотатки для перевикористання:** Tailwind v4 — конфігурація через globals.css з @theme inline

---

### 1.1 Оновлення Tailwind конфігурації — кольори

- [x] Відкрити `frontend/tailwind.config.ts`
- [x] Додати stone палітру як основну:
  ```typescript
  colors: {
    background: {
      DEFAULT: '#fafaf9',  // stone-50
      dark: '#0c0a09',     // stone-950
    },
    foreground: {
      DEFAULT: '#1c1917',  // stone-900
      dark: '#fafaf9',     // stone-50
    },
    card: {
      DEFAULT: '#ffffff',
      dark: '#292524',     // stone-800
    },
    border: {
      DEFAULT: '#e7e5e4',  // stone-200
      dark: '#44403c',     // stone-700
    },
  }
  ```
- [x] Зберегти файл

**Файли:** `frontend/src/app/globals.css` (Tailwind v4 — CSS-first)
**Нотатки:** Додано повну stone палітру (50-950) та accent кольори в globals.css

---

### 1.2 Оновлення Tailwind — border-radius

- [x] Додати нові значення border-radius в Tailwind config:
  ```typescript
  borderRadius: {
    'none': '0',
    'sm': '6px',
    DEFAULT: '12px',
    'md': '16px',
    'lg': '20px',
    'xl': '24px',
    '2xl': '32px',
    'full': '9999px',
  }
  ```
- [x] Перевірити, що старі значення не зламають існуючий код

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Додано CSS змінні --radius-sm до --radius-2xl та оновлено @theme inline

---

### 1.3 Оновлення Tailwind — тіні

- [x] Додати нові box-shadow значення з теплим відтінком:
  ```typescript
  boxShadow: {
    'sm': '0 1px 2px rgba(28, 25, 23, 0.05)',
    DEFAULT: '0 2px 8px rgba(28, 25, 23, 0.08)',
    'md': '0 4px 16px rgba(28, 25, 23, 0.1)',
    'lg': '0 8px 32px rgba(28, 25, 23, 0.12)',
    'xl': '0 16px 48px rgba(28, 25, 23, 0.15)',
    '2xl': '0 24px 64px rgba(28, 25, 23, 0.18)',
    'glow': '0 0 40px rgba(227, 6, 19, 0.3)',
    'glow-lg': '0 0 60px rgba(227, 6, 19, 0.4)',
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Додано повну shadow систему з теплим stone відтінком (RGB 28,25,23) + glow ефекти

---

### 1.4 Оновлення CSS змінних

- [x] Відкрити `frontend/src/app/globals.css`
- [x] Замінити zinc на stone в `:root`:
  ```css
  :root {
    --background: #fafaf9;
    --foreground: #1c1917;
    --card: #ffffff;
    --card-foreground: #1c1917;
    --border: #e7e5e4;
    --muted: #78716c;
    --muted-foreground: #57534e;
  }
  ```
- [x] Оновити dark theme змінні:
  ```css
  [data-theme="dark"] {
    --background: #0c0a09;
    --foreground: #fafaf9;
    --card: #292524;
    --card-foreground: #fafaf9;
    --border: #44403c;
    --muted: #a8a29e;
    --muted-foreground: #d6d3d1;
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Виконано — light та dark теми оновлені з теплими stone кольорами

---

### 1.5 Налаштування шрифтів (опціонально)

- [x] Оцінити чи потрібно міняти Geist на Inter
- [ ] Якщо так — оновити `layout.tsx`:
  ```typescript
  import { Inter } from 'next/font/google'

  const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-inter',
  })
  ```
- [x] Якщо ні — залишити Geist (він теж сучасний)

**Файли:** `frontend/src/app/layout.tsx`
**Нотатки:** РІШЕННЯ: Залишаємо Geist — сучасний шрифт від Vercel, добре виглядає, не потребує заміни

---

### 1.6 Перевірка build

- [x] Запустити `npm run build` в frontend/
- [x] Перевірити, що немає помилок
- [x] Запустити `npm run dev` та візуально перевірити

**Команди:**
```bash
cd frontend && npm run build
```

**Файли:** -
**Нотатки:** Build успішний! 55 сторінок згенеровано без помилок

---

### 1.7 Документування змін

- [x] Оновити коментарі в globals.css щодо нової палітри
- [x] Додати /* REDESIGN 2026 */ маркери для нових стилів

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Додано коментарі: "REDESIGN 2026: Warm Stone Palette" та інші маркери

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
   git commit -m "checklist(ui-ux-redesign): phase-1 preparation completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
