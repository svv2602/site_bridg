# Фаза 2: CSS Design Tokens & Typography

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити невизначені CSS токени, проблеми контрасту в дизайн-системі та мертві typography класи. Системний підхід — один fix вирішує проблему на багатьох сторінках.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути всі визначені токени в `theme.css` `@theme inline`
- [x] Знайти всі використання `text-destructive`, `text-primary-foreground`, `bg-muted` в loading files
- [x] Переглянути `prose.css` та визначити чи покриває потреби

#### B. Аналіз залежностей
- [x] Чи потрібен `@tailwindcss/typography` або достатньо розширити `prose.css`? → prose.css достатньо, має повне dark mode покриття
- [x] Скільки файлів використовують `prose-stone` та `dark:prose-invert`? → 4 файли

---

### 2.1 Define `--color-destructive` alias
- [x] Додати `--color-destructive: var(--error)` в `@theme inline` блок `theme.css`
- [x] АБО замінити всі `text-destructive` → `text-error` по codebase
- [x] Перевірити `blog/error.tsx:17`

**Рішення:** Додано `--destructive` та `--color-destructive` токени в theme.css + замінено `text-destructive` → `text-error` у blog/error.tsx

---

### 2.2 Define `--color-skeleton` token
- [x] Додати в `theme.css` light: `--skeleton: var(--stone-200)`, dark: `--skeleton: var(--graphite)`
- [x] Зареєструвати в `@theme inline`: `--color-skeleton: var(--skeleton);`
- [x] Замінити всі `bg-muted` в loading файлах на `bg-skeleton`
- [ ] Замінити `bg-stone-200 dark:bg-white/10` в hero скелетонах на `bg-skeleton` (не замінено — hero скелетони мають спеціальний контраст для dark hero)

**Рішення:** Створено skeleton token, замінено bg-muted→bg-skeleton в 11 файлах (всі loading.tsx + LoadingSkeleton.tsx)

---

### 2.3 Fix `prose-stone` / `dark:prose-invert` dead classes
- [x] Визначити стратегію: встановити `@tailwindcss/typography` АБО видалити мертві класи → видаляємо, prose.css покриває dark mode
- [x] Якщо видаляємо — перевірити що `prose.css` покриває dark mode для blog articles
- [x] Замінити `prose-stone dark:prose-invert` у всіх файлах → `prose` only
- [x] Перевірити: `LexicalRenderer.tsx:184`, `blog/[slug]/page.tsx:157`, `privacy/page.tsx:14`, `terms/page.tsx:14`

---

### 2.4 Fix `text-primary` contrast on interactive elements
- [x] На technology page: перевірено — globals.css вже має CSS override для `a.text-primary`, `span.text-primary`, `p.text-primary`
- [x] Перевірити `technology/page.tsx:192,230,241` — всі покриті override
- [x] Перевірити що CSS override `a.text-primary` в globals.css працює для всіх link контекстів — підтверджено
- [x] Розглянути розширення override — вже покриває button, span, p, div контексти

---

### 2.5 Fix `text-muted-foreground` dark mode contrast
- [x] Аудит: знайти всі `text-muted-foreground` де контраст < 4.5:1 в dark mode
- [x] Root cause fix: змінено `--muted-foreground` в dark theme з `var(--text-muted)` (#6F7378, ~4.0:1) на `#8B8F94` (~5.96:1)
- [x] Це автоматично виправляє всі 20+ місць по codebase

**Рішення:** Виправлено root cause в theme.css замість заміни у 20+ файлах

---

### 2.6 Fix `text-muted` (without `-foreground`) misuse
- [x] В DealerList.tsx: `text-muted` це bg token, не text — замінено на `text-stone-500 dark:text-stone-400`
- [x] Перевірити 4 місця: `DealerList.tsx:67,122,136,152`

---

### 2.7 Fix `text-muted` (stone-500) low contrast
- [x] Blog listing: `text-muted` контраст ~3.4:1 на білому — нижче WCAG AA
- [x] Замінено на `text-stone-600 dark:text-stone-400`

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-2 CSS design tokens & typography completed"
   ```
4. Онови PROGRESS.md
5. Відкрий наступну фазу
