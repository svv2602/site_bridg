# Виправлення за результатами аудиту

## Ціль
Виправити всі проблеми, знайдені під час аудиту сайту Bridgestone Ukraine (2026-01-10).
Підвищити оцінку проекту з 6/10 до 9/10.

## Критерії успіху
- [ ] Всі кнопки та посилання функціональні
- [ ] API інтеграція замість mock-даних на всіх сторінках
- [ ] Форми працюють (пошук, контакти)
- [ ] Loading/Error/Empty states на всіх сторінках
- [ ] Accessibility відповідає WCAG 2.1 AA
- [ ] Код без дублювання (DRY)
- [ ] SEO metadata на всіх сторінках
- [ ] Security виправлення в адмінці

## Фази роботи

| Фаза | Назва | Опис | Пріоритет |
|------|-------|------|-----------|
| 1 | P0 Critical | Кнопки, API, форми, security | Критичний |
| 2 | P1 States | Loading, Error, Empty states | Високий |
| 3 | P1 Accessibility | ARIA, keyboard, screen reader | Високий |
| 4 | P2 Refactoring | DRY, shared components | Середній |
| 5 | P2 SEO | Metadata, Schema.org | Середній |
| 6 | P3 Improvements | i18n, animations, extras | Низький |

## Джерело вимог
- `plan/result_audit/00-SUMMARY.md` — зведений звіт
- `plan/result_audit/01-home.md` — головна сторінка
- `plan/result_audit/02-tyre-catalog.md` — каталог шин
- `plan/result_audit/03-comparison.md` — порівняння
- `plan/result_audit/04-content.md` — контент
- `plan/result_audit/05-dealers-contacts.md` — дилери та контакти
- `plan/result_audit/06-admin.md` — адмінка

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** — перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** — вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** — використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── components/          # UI компоненти
├── app/                 # Сторінки
│   ├── page.tsx         # Головна
│   ├── tyre-search/     # Форми пошуку
│   ├── dealers/         # Списки з фільтрами
│   └── shyny/[slug]/    # Динамічні сторінки
└── lib/
    ├── data.ts          # Типи та mock-дані
    └── api/             # API-шар
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
| Primary кнопка | `rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white` |
| Input/Select | `rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm` |

## Правила інтеграції з CMS/API

### Поточний стан:
- Дані в `lib/data.ts` як mock
- API-шар в `lib/api/`
- Деякі сторінки використовують mock напряму (ПРОБЛЕМА)

### При виправленні:
1. Використовуй API-функції з `lib/api/`
2. НЕ імпортуй mock напряму
3. API функції мають fallback на mock

## Статистика проблем

| Пріоритет | Кількість |
|-----------|-----------|
| P0 (Критичні) | 8 |
| P1 (Важливі) | 15 |
| P2 (Середні) | 12 |
| P3 (Покращення) | 10 |
| **Всього** | **45** |

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
