# UI/UX Редизайн сайту Bridgestone Ukraine

## Ціль
Трансформувати дизайн сайту з "холодного технічного каталогу" в "преміальний досвід бренду", підвищивши візуальну привабливість, сучасність та довіру до бренду.

## Критерії успіху
- [ ] Колірна схема змінена з холодної (zinc) на теплу (stone)
- [ ] Типографіка оновлена з покращеною читабельністю
- [ ] Border-radius збільшено до сучасних значень (16-24px)
- [ ] Тіні додано з теплим відтінком для глибини
- [ ] Hero секція редизайнена з floating tyre image
- [ ] Компоненти оновлено (кнопки, картки, badges)
- [ ] Анімації додано (entrance, hover, micro-interactions)
- [ ] Dark mode відполіровано з правильними контрастами
- [ ] Сайт проходить build без помилок
- [ ] Візуальна оцінка сучасності 8.5+/10

## Фази роботи
1. **Підготовка** — налаштування Tailwind, нова колірна палітра, шрифти
2. **Система дизайну** — CSS змінні, тіні, spacing, border-radius
3. **Базові компоненти** — кнопки, inputs, badges, картки
4. **Hero секції** — редизайн SeasonalHero, compact search
5. **Навігація** — Header, Footer, mobile menu
6. **Сторінки каталогу** — passenger-tyres, suv-4x4, lcv
7. **Картки товарів** — TyreCard, EuLabelBadge
8. **Анімації** — Framer Motion, transitions, micro-interactions
9. **Dark Mode** — контрасти, glass effects
10. **Фіналізація** — тестування, polish, документація

## Джерело вимог
- `plan/result_audit/00-SUMMARY.md` — загальний огляд
- `plan/result_audit/01-current-problems.md` — проблеми
- `plan/result_audit/02-redesign-concept.md` — концепція
- `plan/result_audit/03-recommendations.md` — рекомендації
- `plan/result_audit/04-hero-improvements.md` — hero секція
- `plan/result_audit/05-references.md` — референси

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** — перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** — вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** — використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── components/          # UI компоненти (MainHeader, ThemeToggle, AnimatedMain)
│   ├── SeasonalHero.tsx # Hero секція
│   ├── TyreCard.tsx     # Картка шини
│   ├── QuickSearchForm.tsx # Форма пошуку
│   └── ui/              # Базові UI компоненти
├── app/                 # Сторінки
│   ├── globals.css      # Глобальні стилі, CSS змінні
│   └── layout.tsx       # Root layout
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

### НОВА Tailwind палітра (stone замість zinc):

| Елемент | Старі класи | Нові класи |
|---------|-------------|------------|
| Hero фон | `from-zinc-950 via-zinc-900` | `from-stone-950 via-stone-900` |
| Картка dark | `bg-zinc-900/95` | `bg-stone-900/95` |
| Бордер dark | `border-zinc-800` | `border-stone-800` |
| Текст muted | `text-zinc-400` | `text-stone-400` |
| Input dark | `bg-zinc-900` | `bg-stone-900` |

### Нові значення border-radius:

| Елемент | Старе | Нове |
|---------|-------|------|
| Badge | `rounded-md` (6px) | `rounded-lg` (12px) |
| Card | `rounded-2xl` (16px) | `rounded-xl` (20px) |
| Modal | `rounded-2xl` (16px) | `rounded-2xl` (24px) |

### Нові тіні (з теплим відтінком):
```css
shadow-sm:  0 1px 2px rgba(28, 25, 23, 0.05)
shadow:     0 2px 8px rgba(28, 25, 23, 0.08)
shadow-md:  0 4px 16px rgba(28, 25, 23, 0.1)
shadow-lg:  0 8px 32px rgba(28, 25, 23, 0.12)
```

## Правила інтеграції з CMS/API

### Поточний стан:
- Дані зберігаються в `lib/data.ts` як mock
- API-шар підготовлений в `lib/api/`
- Функції повертають mock-дані, але готові до заміни

### При редизайні:
- НЕ змінюй структуру даних
- НЕ змінюй API функції
- ТІЛЬКИ візуальні зміни компонентів

## Правила SEO

### Зберігати:
- [ ] `generateMetadata()` без змін
- [ ] `generateStaticParams()` без змін
- [ ] Семантичну структуру HTML

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
