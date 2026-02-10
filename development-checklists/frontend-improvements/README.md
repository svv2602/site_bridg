# Frontend Improvements: Виконуваний чекліст (Модулі 1-12)

## Ціль
Систематично покращити якість фронтенду сайту Bridgestone Ukraine, виправивши критичні баги, вразливості безпеки, проблеми продуктивності, UX/SEO недоліки та технічний борг — на основі аудиту 12 модулів.

## Критерії успіху
- [ ] Всі P0 (критичні) баги та вразливості безпеки виправлені
- [ ] `npm run build` та `npm run lint` проходять без помилок у frontend та backend
- [ ] Немає заборонених кольорів (`zinc-*`, `gray-*`, `slate-*`) у frontend/src
- [ ] Немає заборонених патернів (`bg-muted text-muted-foreground`, `hover:bg-muted`, `hover:bg-card`) у frontend/src
- [ ] Dark mode працює коректно на всіх сторінках
- [ ] Lighthouse Performance > 90 для головних сторінок
- [ ] Всі аналітичні події підключені до компонентів
- [ ] Тестове покриття > 60% для критичних модулів
- [ ] Sitemap містить всі сторінки (шини, статті, порівняння, сезонні)
- [ ] Structured data (JSON-LD) валідний на всіх сторінках

## Фази роботи
1. **Критичні виправлення безпеки** — XSS, витік PII, автентифікація API, критичні баги
2. **Оптимізація продуктивності** — SSR паралелізація, ISR, кешування, оптимізація запитів
3. **Покращення UX** — FOUC, мобільне меню, стани завантаження, форми, URL-стейт
4. **SEO та аналітика** — sitemap, canonical, structured data, analytics events, tracking
5. **Якість коду** — DRY, декомпозиція файлів, дизайн-система, типізація
6. **Тестування** — unit, integration, e2e тести, Storybook
7. **Нові можливості** — нові фічі, покращення, низькопріоритетні задачі

## Джерело вимог
12 аналітичних звітів аудиту фронтенду:
- `plan/prompt/prompts_analysis/report/01_homepage_layout_analysis_2026-02-09.md` — Модуль 1: Головна сторінка та макет
- `plan/prompt/prompts_analysis/report/02_tyre_catalog_analysis_2026-02-09.md` — Модуль 2: Каталог шин
- `plan/prompt/prompts_analysis/report/03_tyre_detail_analysis_2026-02-09.md` — Модуль 3: Деталі шини
- `plan/prompt/prompts_analysis/report/04_tyre_search_analysis_2026-02-09.md` — Модуль 4: Пошук шин
- `plan/prompt/prompts_analysis/report/05_vehicle_fitment_analysis_2026-02-09.md` — Модуль 5: Підбір за авто
- `plan/prompt/prompts_analysis/report/06_dealer_locator_analysis_2026-02-09.md` — Модуль 6: Пошук дилерів
- `plan/prompt/prompts_analysis/report/07_blog_articles_analysis_2026-02-09.md` — Модуль 7: Блог/Статті
- `plan/prompt/prompts_analysis/report/08_tyre_comparison_analysis_2026-02-09.md` — Модуль 8: Порівняння шин
- `plan/prompt/prompts_analysis/report/09_contact_form_analysis_2026-02-09.md` — Модуль 9: Контактна форма
- `plan/prompt/prompts_analysis/report/10_seo_structured_data_analysis_2026-02-09.md` — Модуль 10: SEO та структуровані дані
- `plan/prompt/prompts_analysis/report/11_analytics_tracking_analysis_2026-02-09.md` — Модуль 11: Аналітика та трекінг
- `plan/prompt/prompts_analysis/report/12_ui_components_analysis_2026-02-09.md` — Модуль 12: UI компоненти

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** — перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** — вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** — використовуй існуючі компоненти, хуки, утиліти

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

### ОБОВ'ЯЗКОВО: Перевіряй стандарти перед реалізацією UI

Повна документація: `frontend/docs/standards/INDEX.md`

Ключові файли стандартів:
- `COLOR_SYSTEM.md` — stone palette, заборонені патерни, CSS змінні
- `BUTTON_STANDARDS.md` — варіанти кнопок (Primary/Secondary/Ghost/Brand), стани, розміри
- `CARD_STYLING.md` — структура карток, hover ефекти, рівна висота
- `DARK_MODE.md` — hero-adaptive, hero-dark класи
- `CHECKLISTS.md` — pre-commit та code review чеклісти

### Критичні правила (порушення = баг):
- **Stone palette ONLY** — НІКОЛИ `zinc-*`, `gray-*`, `slate-*`
- **Primary кнопка** — `bg-primary text-primary-text hover:bg-primary-hover` (silver)
- **Secondary кнопка** — явні stone кольори: `border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700`
- **Badges** — `bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200` (НІКОЛИ `bg-muted text-muted-foreground`)
- **Hero секції** — клас `hero-adaptive` (змінюється з темою) або `hero-dark` (завжди темний)
- **CTA блоки** — `bg-graphite` з білими кнопками (завжди темні)
- **Картки** — `border border-border bg-card`, грід з `hover:-translate-y-1` потребує `pt-2`

### Заборонені патерни:
```
hover:bg-muted, hover:bg-card          → hover:bg-stone-100 dark:hover:bg-stone-700
border-border (для кнопок)             → border-stone-300 dark:border-stone-600
bg-muted text-muted-foreground         → bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200
zinc-*, gray-*, slate-*                → stone-*
```

## Доступні скіли для підвищення якості

### Frontend UI
| Задача | Скіл | Коли використовувати |
|--------|-------|---------------------|
| Нова сторінка/компонент | `frontend-design` | Дизайн з високою якістю |
| Tailwind патерни | `tailwind-patterns` | Картки, навігація, форми, кнопки |
| Адаптивність | `responsive-design` | Container queries, fluid typography, mobile-first |
| Зображення | `responsive-images` | srcset, lazy loading, AVIF/WebP |
| Форми | `react-hook-form-zod` | Валідовані форми з Zod |
| Доступність | `accessibility` | WCAG 2.1 AA, ARIA, focus management |
| Кольори | `color-palette` | Генерація палітри, перевірка контрастності |

### Next.js / React
| Задача | Скіл |
|--------|-------|
| App Router, RSC, metadata | `next-best-practices` |
| Кешування, PPR, use cache | `next-cache-components` |
| State management | `react-state-management` |

### Backend / CMS
| Задача | Скіл |
|--------|-------|
| Payload collections, hooks, access | `payload` |
| REST/GraphQL API дизайн | `api-design-principles` |
| Node.js сервіс | `nodejs-backend-patterns` |
| SQL оптимізація | `sql-optimization-patterns` |
| DB міграції | `database-migration` |

### SEO & Маркетинг
| Задача | Скіл |
|--------|-------|
| Meta теги, OG, Twitter Cards | `seo-meta` |
| Schema.org / JSON-LD розмітка | `schema-markup` |
| SEO аудит | `seo-audit` |
| Копірайтинг (UA) | `copywriting` |

### Якість / DevOps
| Задача | Скіл |
|--------|-------|
| Unit тести | `vitest` |
| E2E тести (Playwright) | `e2e-testing-patterns` |
| Складний дебагінг | `deep-debug` |
| CI/CD GitHub Actions | `github-actions-templates` |
| Аудит залежностей | `dependency-audit` |

## Правила інтеграції з CMS/API

### Payload CMS (backend-payload/)
- Collections: `src/collections/` — Tyres, Dealers, Articles, Technologies, Media
- Endpoints: `src/endpoints/` — кастомні REST endpoints
- Config: `payload.config.ts` — реєстрація collections, plugins
- При роботі з CMS використовуй скіл `payload`

### При додаванні нової collection (backend):
1. Створи файл в `backend-payload/src/collections/`
2. Зареєструй в `payload.config.ts`
3. Додай access control (roles: admin/editor)
4. Додай API endpoint якщо потрібно custom logic
5. Перевір hooks (beforeChange, afterChange)

### При додаванні frontend інтеграції:
1. Додай/онови тип в `frontend/src/lib/data.ts`
2. Додай API-функцію в `frontend/src/lib/api/payload.ts`
3. Використовуй API-функцію в компонентах (не mock напряму)
4. Передбач fallback на mock-дані якщо CMS недоступний

### Чекліст:
- [ ] Тип додано/оновлено в lib/data.ts?
- [ ] API-функція створена в lib/api/payload.ts?
- [ ] Компонент використовує API, а не mock напряму?
- [ ] Fallback на mock-дані передбачено?
- [ ] (Backend) Collection зареєстрована в payload.config.ts?
- [ ] (Backend) Access control налаштовано?

## Правила SEO

Використовуй скіли `seo-meta` та `schema-markup` для SEO-задач.

### Для кожної сторінки:
- [ ] `generateMetadata()` з title та description (скіл `seo-meta`)
- [ ] OpenGraph та Twitter Cards теги
- [ ] Для динамічних роутів — `generateStaticParams()`
- [ ] Хлібні крихти з BreadcrumbList JSON-LD (скіл `schema-markup`)
- [ ] Структурована розмітка якщо доречно (Product, FAQ, Article)

### Формат URL:
- Сторінки шин: `/shyny/{slug}`
- Статті: `/advice/{slug}`
- Каталоги: `/passenger-tyres`, `/suv-4x4-tyres`

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
