# UI/UX Consistency Fixes

## Ціль
Усунути всі порушення дизайн-системи, виявлені UI/UX аудитом: заборонені кольори (`bg-muted`, `bg-primary/10`, `border-border` на кнопках), відсутність metadata на ключових сторінках, відсутність hero-adaptive класів, відсутність error/loading states, масове використання `text-muted-foreground` на badge-ах та іконках.

## Критерії успіху
- [ ] 0 вхождень `bg-muted` в інтерактивних елементах
- [ ] 0 вхождень `bg-primary/10 text-primary`
- [ ] Metadata (title + description) на всіх 19 сторінках
- [ ] `hero-adaptive` або `hero-dark` на всіх hero-секціях
- [ ] `error.tsx` на маршрутах /contacts, /dealers, /reviews, /porivnyaty
- [ ] `loading.tsx` на маршрутах з data-fetching
- [ ] Badge-і та іконки використовують явні stone-кольори замість `text-muted-foreground`
- [ ] `border-border` на кнопках замінено на `border-stone-300 dark:border-stone-600`
- [ ] Уніфікований `border-radius` для карток
- [ ] `npm run lint` проходить без помилок
- [ ] `npm run build` проходить успішно

## Фази роботи
1. **P1 -- Заборонені кольори та інтерактивні елементи** - bg-muted, bg-primary/10, border-border на кнопках, text-muted
2. **P1 -- Metadata на ключових сторінках** - додати metadata на 5 сторінок без нього
3. **P1 -- Hero секції без hero-adaptive** - додати hero-adaptive на /reviews та /porivnyaty
4. **P2 -- Error та Loading States** - створити error.tsx та loading.tsx для ключових маршрутів
5. **P2 -- text-muted-foreground аудит (170+ місць)** - замінити на badge-ах та іконках
6. **P3 -- Border-radius, text-stone-500, ThemeToggle** - мінорні покращення консистентності

## Джерело вимог
- `/plan/prompt/AUDIT_AI_AGENT/report/UI_UX_AUDIT.md`
- `/plan/prompt/AUDIT_AI_AGENT/report/RELEASE_READINESS_REPORT.md` (пункти 19-21, 39-41, 59-60)
- Стандарти: `frontend/docs/standards/COLOR_SYSTEM.md`, `BUTTON_STANDARDS.md`, `DARK_MODE.md`, `CARD_STYLING.md`

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── components/          # UI компоненти (MainHeader, ThemeToggle, AnimatedMain)
├── app/                 # Сторінки - референс для нових сторінок
│   ├── page.tsx         # Головна - патерн hero + секції
│   ├── tyre-search/     # Форми пошуку - патерн табів
│   ├── dealers/         # Списки з фільтрами
│   └── shyny/[slug]/    # Динамічні сторінки
└── lib/
    ├── data.ts          # Типи даних та mock-дані
    └── api/             # API-шар для CMS інтеграції
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Правила дизайну та стилів

### Tailwind CSS патерни проекту:

| Елемент | Класи |
|---------|-------|
| Hero секція | `hero-adaptive` або `hero-dark` класи |
| Картка | `rounded-2xl border border-border bg-card p-6 shadow-sm` |
| Primary кнопка | `rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white` |
| Secondary кнопка | `rounded-full border border-stone-300 dark:border-stone-600 bg-transparent px-6 py-3` |
| Badge | `bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200` |
| Іконки (secondary) | `text-stone-500 dark:text-stone-400` |

### Заборонені комбінації:
- `bg-muted` (замінити на `bg-stone-200 dark:bg-stone-700`)
- `bg-primary/10 text-primary` (замінити на `bg-stone-200 text-stone-900 dark:bg-stone-700 dark:text-stone-100`)
- `border-border` на кнопках (замінити на `border-stone-300 dark:border-stone-600`)
- `text-muted` без `-foreground` (замінити на `text-stone-500 dark:text-stone-400`)

## Правила SEO

### Для кожної сторінки:
- [ ] `export const metadata` або `generateMetadata()` з title та description
- [ ] Title і description унікальні та українською мовою
- [ ] Для client-компонентів -- відокремити metadata в server wrapper

### Формат metadata:
```tsx
export const metadata: Metadata = {
  title: 'Назва сторінки | Bridgestone Україна',
  description: 'Опис сторінки українською мовою, 150-160 символів',
}
```

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
