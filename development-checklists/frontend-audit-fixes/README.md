# Frontend Audit Fixes

## Ціль
Виправити всі проблеми, виявлені комплексним аудитом фронтенду (2026-02-10). Загалом 416 issues на ~28 сторінках + 19 файлах error/loading states.

## Критерії успіху
- [ ] Всі 16 Critical issues виправлено
- [ ] Всі 68 High issues виправлено
- [ ] Всі 158 Medium issues виправлено або задокументовано як won't fix
- [ ] 144 Low + 30 Info issues розглянуто
- [ ] `npm run build` проходить без помилок
- [ ] `npm run lint` проходить без помилок
- [ ] Lighthouse Accessibility score >= 90 на всіх сторінках
- [ ] Жодних GDPR-порушень (access control на колекціях)

## Фази роботи

| # | Фаза | Опис | Пріоритет | Обсяг |
|---|------|------|-----------|-------|
| 01 | P0: Security & Critical Bugs | GDPR, access control, XSS, зламані фічі | P0 | ~1h |
| 02 | CSS Design Tokens & Typography | Невизначені токени, контраст, typography plugin | P1 | ~2h |
| 03 | Accessibility (A11y) | ARIA, landmarks, focus, screen readers | P1 | ~4h |
| 04 | API & Data Layer | Маппінг даних, CORS, серверна фільтрація | P1 | ~4h |
| 05 | SEO & Metadata | JSON-LD, metadata, canonical, OpenGraph | P1 | ~3h |
| 06 | Error & Loading States | DRY, Sentry, skeleton відповідність | P1-P2 | ~3h |
| 07 | Color System & Dark Mode | Контраст, dark mode, палітра | P2 | ~3h |
| 08 | Layout & Responsive | Адаптивність, touch targets, skeleton layout | P2 | ~2h |
| 09 | Code Quality & DRY | Дедуплікація, мертвий код, типи | P2 | ~3h |
| 10 | Performance | SSR, кешування, оптимізація зображень | P2 | ~3h |
| 11 | Forms & Validation | Валідація, CAPTCHA, GDPR consent | P2 | ~2h |
| 12 | Navigation & UX | URL state, мобільна карта, sitemap | P2 | ~2h |
| 13 | Backend Improvements | Rate limiting, валідація, API endpoints | P2 | ~6h |

## Джерело вимог
- `plan/prompt/Audit_frontend/report/2026-02-10_SUMMARY.md` — фінальний звіт
- `plan/prompt/Audit_frontend/report/2026-02-10_group-{A..F}_*.md` — деталі по групах
- `plan/prompt/Audit_frontend/report/BACKEND_ISSUES.md` — backend issues

## Розподіл issues за серйозністю

```
Critical  16  (3.8%)   — Phase 01-02
High      68  (16.3%)  — Phase 01-06
Medium    158 (38.0%)  — Phase 03-13
Low       144 (34.6%)  — Phase 07-13
Info      30  (7.2%)   — Phase 09-13
```

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── components/          # UI компоненти (MainHeader, ThemeToggle, AnimatedMain)
├── app/                 # Сторінки
│   ├── styles/theme.css # Design tokens (@theme inline)
│   ├── styles/globals.css # CSS overrides
│   └── styles/prose.css # Typography styles
└── lib/
    ├── data.ts          # Типи даних
    ├── schema.ts        # JSON-LD helpers
    └── api/             # API-шар (payload.ts, tyres.ts, reviews.ts, articles.ts, dealers.ts)
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
| Hero секція | `hero-adaptive` або `hero-dark` class |
| Картка | `rounded-2xl border border-border bg-card p-6 shadow-sm` |
| Primary кнопка | `rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white` |
| Бейджі | `bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200` |
| Палітра | stone-* ONLY (НІКОЛИ zinc-* або gray-*) |
| Dark mode | Завжди `dark:` варіанти |

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
