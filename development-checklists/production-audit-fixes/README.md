# Production Audit Fixes - Bridgestone Ukraine

## Ціль
Виправити всі проблеми, виявлені під час production аудиту 2026-01-15, щоб сайт відповідав стандартам production-ready.

## Критерії успіху
- [ ] Всі High priority issues виправлені
- [ ] Core Web Vitals залишаються в зелених зонах
- [ ] Сайт проходить accessibility перевірку (WCAG AA)
- [ ] SEO елементи налаштовані (robots.txt, sitemap.xml, canonical)
- [ ] Security headers додані

## Фази роботи
1. **High Priority Fixes** - критичні проблеми для релізу
2. **SEO Improvements** - покращення індексації
3. **Accessibility Fixes** - відповідність WCAG AA
4. **Final Optimizations** - низькопріоритетні покращення

## Джерело вимог
- `/plan/result_audit/PRODUCTION_AUDIT_2026-01-15.md`
- `/plan/result_audit/audit-report-2026-01-15.json`

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── components/          # UI компоненти
├── app/                 # Сторінки та layouts
│   ├── layout.tsx       # Root layout - місце для skip-link
│   ├── sitemap.ts       # Якщо існує
│   └── robots.ts        # Якщо існує
└── lib/
    └── api/             # API-шар для CMS

frontend/
├── public/              # Статичні файли (robots.txt, og-images)
├── next.config.js       # Security headers
└── tailwind.config.ts   # Стилі
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Правила дизайну та стилів

### UI Standards:
Дотримуйся стандартів з `frontend/docs/standards/`:
- `COLOR_SYSTEM.md` - stone палітра, CSS змінні
- `BUTTON_STANDARDS.md` - варіанти кнопок
- `DARK_MODE.md` - hero-adaptive класи

### Критичні правила:
1. **Кольори**: Використовуй `stone-*`, НІКОЛИ `zinc-*` або `gray-*`
2. **Бейджі**: Явні кольори `bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200`
3. **Адаптивність**: Завжди надавай `dark:` варіанти

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
