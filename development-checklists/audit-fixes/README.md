# Виправлення проблем аудиту Bridgestone Ukraine

## Ціль
Виправити всі проблеми, знайдені під час аудиту приложения (2026-01-11).
Результати аудиту: `/plan/result_audit/`

## Критерії успіху
- [ ] Всі P0 проблеми виправлені (Schema.org, error.tsx)
- [ ] Всі P1 проблеми виправлені (metadata, CMS інтеграція)
- [ ] Основні P2 проблеми виправлені (a11y, loading states)
- [ ] Збірка проходить без помилок (`npm run build`)
- [ ] ESLint не показує нових помилок

## Фази роботи
1. **Критичні виправлення** - Schema.org, error boundaries (P0)
2. **SEO та Metadata** - generateMetadata для всіх сторінок (P1-P2)
3. **Інтеграція з CMS** - QuickSearchForm, featured content (P1)
4. **Accessibility** - ARIA атрибути, keyboard navigation (P2)
5. **UX та Loading States** - Suspense, error states (P2)
6. **i18n міграція** - Переведення hardcoded текстів на t() (P3)

## Джерело вимог
- `/plan/result_audit/00-SUMMARY.md` - зведена таблиця проблем
- `/plan/result_audit/01-home.md` - `/plan/result_audit/06-admin.md` - детальні звіти

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── components/          # UI компоненти
│   └── ui/              # LoadingSkeleton, ErrorState, EmptyState
├── app/                 # Сторінки
│   ├── shyny/[slug]/    # Приклад правильного Schema.org
│   └── error.tsx        # (потрібно створити)
└── lib/
    ├── i18n/            # Система локализації t()
    ├── api/             # API функції
    └── schema.ts        # Schema.org генератори
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Правила Schema.org

### Правильне використання jsonLdScript:
```tsx
// ПРАВИЛЬНО:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: jsonLdScript(schema) }}
/>

// НЕПРАВИЛЬНО (не працює):
{jsonLdScript(schema)}
```

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
