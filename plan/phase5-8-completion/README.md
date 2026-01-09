# Phase 5-8 Completion: Frontend, Backend, Admin, Tech Debt

## Ціль
Завершити всі невиконані задачі з Phase 5-8 content automation checklist після міграції на Payload CMS.

## Критерії успіху
- [ ] FAQ секція з Schema.org на сторінках шин
- [ ] Test Results секція на сторінках шин
- [ ] Seasonal Hero на головній сторінці
- [ ] Логотипи джерел тестів (ADAC, AutoBild, TyreReviews, TCS)
- [ ] Telegram bot commands (/run, /status, /stats)
- [ ] Cron scheduler для автоматизації
- [ ] Admin Dashboard для моніторингу
- [ ] Unit та integration тести

## Фази роботи
1. **Frontend: FAQ + Test Results** - компоненти та інтеграція на сторінці шини
2. **Frontend: Seasonal + Logos** - SeasonalHero та логотипи джерел
3. **Backend: Telegram + Cron** - команди бота та планувальник
4. **Admin: Dashboard** - сторінка моніторингу автоматизації
5. **Tech Debt: Tests + Types** - тести та типи

## Джерело вимог
- `/plan/content-automation-phase2/phase-05-frontend.md`
- `/plan/content-automation-phase2/phase-06-backend.md`
- `/plan/content-automation-phase2/phase-07-admin.md`
- `/plan/content-automation-phase2/phase-08-tech-debt.md`

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── components/          # UI компоненти (Badge, EuLabelBadge, FuelCalculator)
│   └── ui/              # Базові UI компоненти
├── app/                 # Сторінки
│   ├── page.tsx         # Головна - патерн hero + секції
│   ├── shyny/[slug]/    # Сторінка шини - референс для FAQ/TestResults
│   └── advice/          # Статті
└── lib/
    ├── data.ts          # Типи даних
    └── api/
        └── payload.ts   # Payload CMS client

backend-payload/
├── src/
│   ├── collections/     # Payload collections
│   ├── automation/      # Content automation
│   └── app/api/         # API routes
└── content-automation/  # Standalone automation
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
| Hero секція | `bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12` |
| Картка | `rounded-2xl border border-border bg-card p-6 shadow-sm` |
| Темна картка | `rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 text-zinc-50` |
| Primary кнопка | `rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white` |
| Secondary кнопка | `rounded-full border border-border bg-transparent px-6 py-3` |
| Accordion item | `border border-border rounded-lg overflow-hidden` |
| Badge | `px-3 py-1 rounded-lg text-sm font-medium` |

### Seasonal градієнти:
- Spring: `from-orange-500 to-yellow-500`
- Autumn: `from-blue-500 to-cyan-400`
- Default: `from-zinc-800 to-zinc-900`

## Правила інтеграції з Payload CMS

### Поточний стан:
- Backend: Payload CMS на порту 3001
- API: `/api/tyres`, `/api/articles`, `/api/dealers`
- Automation API: `/api/automation/run`, `/api/automation/stats`
- Frontend client: `lib/api/payload.ts`

### При додаванні нових даних:
1. Перевір що поле існує в Payload collection
2. Додай тип в `lib/data.ts`
3. Оновій API функції в `lib/api/payload.ts`
4. Використовуй API-функції в компонентах

## Правила SEO

### Для кожної сторінки:
- [ ] `generateMetadata()` з title та description
- [ ] Для динамічних роутів - `generateStaticParams()`
- [ ] Schema.org structured data (FAQPage, Product)

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
