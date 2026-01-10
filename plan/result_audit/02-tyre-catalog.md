# Аудит: Каталог шин

**Дата аудиту:** 2026-01-10
**Група сторiнок:** Каталог шин (passenger-tyres, suv-4x4-tyres, lcv-tyres, tyre-search, shyny/[slug])

---

## Страница: /passenger-tyres

- **Файл:** `/home/snisar/RubyProjects/site_Bridgestone/frontend/src/app/passenger-tyres/page.tsx`
- **Статус:** Требует внимания

### Функциональность
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Компоненты рендерятся | OK | Все компоненты корректно рендерятся |
| Обработка ошибок | Проблема | Нет обработки ошибок при `getTyreModels()` - если API недоступно, страница упадет |
| API вызовы | OK | Использует `getTyreModels()` с fallback на mock данные |

### UX/UI
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Loading states | Проблема | Нет loading skeleton/spinner во время загрузки данных (async server component) |
| Empty states | Частично | Сезонные карточки скрываются при пустом массиве (`if (!items.length) return null`), но нет сообщения если все пустые |
| Error states | Проблема | Нет обработки ошибок - страница упадет при сбое API |
| Responsive design | OK | Адаптивная сетка `md:grid-cols-3`, хорошая мобильная версия |

### i18n
| Проблема | Строка | Рекомендация |
|----------|--------|--------------|
| Hardcoded text | "Головна", "Шини для легкових авто", "Літні шини" и т.д. | Вынести в i18n систему |
| Hardcoded text | "моделей", "Детальніше" | Вынести в i18n систему |

### Accessibility
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| ARIA | Проблема | Breadcrumb не использует `<nav aria-label="Breadcrumb">` и `aria-current="page"` |
| Keyboard | OK | Все ссылки доступны с клавиатуры |
| Screen reader | Проблема | Иконки сезонов без `aria-label`, декоративные иконки без `aria-hidden` |

### Проблемы
1. Breadcrumb использует `<span>` вместо `<Link>` для "Головна"
2. Нет `try-catch` вокруг `getTyreModels()` на уровне страницы
3. Unused import `TyreCard` (импортируется но не используется напрямую)
4. Функция `formatSize` дублируется в нескольких файлах

### Рекомендации
1. Добавить error boundary или try-catch с fallback UI
2. Добавить Suspense с loading skeleton для лучшего UX
3. Вынести `seasonLabels`, `seasonIcons`, `groupBySeason` в shared utilities
4. Добавить семантическую разметку breadcrumbs

---

## Страница: /suv-4x4-tyres

- **Файл:** `/home/snisar/RubyProjects/site_Bridgestone/frontend/src/app/suv-4x4-tyres/page.tsx`
- **Статус:** Требует внимания

### Функциональность
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Компоненты рендерятся | OK | Все компоненты корректно рендерятся |
| Обработка ошибок | Проблема | Аналогично passenger-tyres - нет обработки ошибок |
| API вызовы | OK | Фильтрация по `vehicleTypes.includes("suv")` |

### UX/UI
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Loading states | Проблема | Нет loading state |
| Empty states | Частично | Карточки скрываются если пустые |
| Error states | Проблема | Нет error state |
| Responsive design | OK | Аналогично passenger-tyres |

### i18n
- Аналогичные проблемы с hardcoded текстом

### Accessibility
- Аналогичные проблемы с ARIA и screen reader

### Проблемы
1. **Дублирование кода** - ~90% кода идентичен passenger-tyres
2. Разные иконки сезонов (Zap/Shield/Mountain вместо Sun/Snowflake/Cloud) - непоследовательный UI
3. `suvTyres.slice(0, 6)` в Featured Models не фильтрует по `isPopular` (в отличие от passenger-tyres)

### Рекомендации
1. **Критично:** Создать общий компонент `TyreCatalogPage` с props для vehicle type
2. Унифицировать иконки сезонов во всех компонентах
3. Использовать одинаковую логику фильтрации featured models

---

## Страница: /lcv-tyres

- **Файл:** `/home/snisar/RubyProjects/site_Bridgestone/frontend/src/app/lcv-tyres/page.tsx`
- **Статус:** OK

### Функциональность
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Компоненты рендерятся | OK | Все компоненты корректно рендерятся |
| Обработка ошибок | Проблема | Нет try-catch на верхнем уровне |
| API вызовы | OK | Фильтрация по `vehicleTypes.includes("lcv")` |

### UX/UI
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Loading states | Проблема | Нет loading state |
| Empty states | **OK** | Отличная обработка! Показывает информативное сообщение с CTA при пустом каталоге |
| Error states | Проблема | Нет error state |
| Responsive design | OK | Хорошая адаптивность |

### i18n
- Аналогичные проблемы с hardcoded текстом

### Accessibility
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| ARIA | Частично | Breadcrumb "Головна" - реальный Link с hover state |
| Keyboard | OK | Все интерактивные элементы доступны |
| Screen reader | Проблема | Иконки без aria-label |

### Проблемы
1. Дублирование кода
2. Unused import `TyreCardGrid` (не используется)
3. Ручная верстка карточек вместо использования `TyreCard` компонента

### Рекомендации
1. Использовать `TyreCardGrid` компонент для единообразия
2. Это **лучший пример** empty state - использовать как образец для других страниц

---

## Страница: /tyre-search

- **Файл:** `/home/snisar/RubyProjects/site_Bridgestone/frontend/src/app/tyre-search/page.tsx` (wrapper)
- **Основной файл:** `/home/snisar/RubyProjects/site_Bridgestone/frontend/src/app/tyre-search/new-page.tsx`
- **Статус:** OK

### Функциональность
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Компоненты рендерятся | OK | Все рендерится корректно |
| Обработка ошибок | OK | `try-catch` в `handleSizeSearch`, `.catch(console.error)` в useEffect |
| API вызовы | OK | Каскадные селекты с динамической загрузкой |

### UX/UI
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Loading states | **Отлично** | Loader2 спиннер в каждом селекте и кнопке поиска |
| Empty states | **Отлично** | Информативное сообщение с иконкой и CTA "Зверніться до дилера" |
| Error states | Частично | `console.error` но нет UI feedback для пользователя при ошибке загрузки размеров |
| Responsive design | OK | Grid layout адаптируется под экран |

### i18n
| Проблема | Строка | Рекомендация |
|----------|--------|--------------|
| Hardcoded text | "Оберіть ширину", "Шукаємо..." и т.д. | Вынести в i18n |
| Hardcoded text | "мм", "%" в селектах | Вынести в i18n |

### Accessibility
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| ARIA | Частично | Нет `aria-live` для результатов поиска |
| Keyboard | OK | Табы переключаются кнопками, форма работает |
| Screen reader | Проблема | Табы не используют `role="tablist"`, `role="tab"`, `aria-selected` |

### Проблемы
1. Tab switching не использует семантические ARIA роли для tabs
2. Нет debounce на API вызовы при смене селектов
3. Информационный блок "У продакшн-версії..." должен быть убран в production

### Рекомендации
1. Добавить proper ARIA tablist pattern
2. Добавить `aria-live="polite"` для зоны результатов
3. Показывать toast/alert при ошибке загрузки опций селектов
4. Убрать development-only текст

---

## Страница: /shyny/[slug]

- **Файл:** `/home/snisar/RubyProjects/site_Bridgestone/frontend/src/app/shyny/[slug]/page.tsx`
- **Статус:** OK

### Функциональность
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Компоненты рендерятся | OK | Все секции рендерятся условно |
| Обработка ошибок | **Отлично** | `notFound()` при отсутствии модели |
| API вызовы | OK | `generateStaticParams()` для SSG, `generateMetadata()` для SEO |

### UX/UI
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Loading states | N/A | Static page, не требуется |
| Empty states | **Отлично** | Условный рендеринг секций (`model.faqs && model.faqs.length > 0`) |
| Error states | **Отлично** | Корректный `notFound()` |
| Responsive design | OK | Grid layout `lg:grid-cols-3` |

### i18n
| Проблема | Строка | Рекомендация |
|----------|--------|--------------|
| Hardcoded text | "Літні шини", "Зимові шини", etc | Вынести в shared constants/i18n |
| Hardcoded text | "Детальніше", "Знайти дилера" | Вынести в i18n |

### Accessibility
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| ARIA | OK | Breadcrumb использует nav и Links |
| Keyboard | OK | Все элементы доступны |
| Screen reader | Частично | Изображение имеет alt, но некоторые декоративные иконки без aria-hidden |

### SEO
| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Schema.org | **Отлично** | ProductSchema, BreadcrumbSchema, FAQSchema |
| Meta tags | **Отлично** | Динамические title и description |
| Static generation | **Отлично** | `generateStaticParams()` для ISR |

### Проблемы
1. Hardcoded domain "https://bridgestone.ua/" в schema - должен быть из env
2. Breadcrumb всегда ведет на `/passenger-tyres`, даже для SUV/LCV шин
3. Fallback изображение (Car/Truck icon) хорошо, но можно добавить skeleton

### Рекомендации
1. Динамически формировать breadcrumb URL на основе `vehicleTypes`
2. Вынести base URL в env переменную
3. Добавить `aria-hidden="true"` к декоративным иконкам

---

## Общие рекомендации для группы

### Критические улучшения

1. **Унификация кода**
   - Создать общий компонент `TyreCatalogPageTemplate` для passenger/suv/lcv страниц
   - Вынести `seasonLabels`, `seasonIcons`, `groupBySeason`, `formatSize` в `/lib/utils/tyres.ts`
   - Текущее дублирование ~85% кода между страницами

2. **Error Handling**
   - Добавить Error Boundary компонент для catalog страниц
   - Показывать user-friendly ошибки вместо crash
   - Пример pattern:
   ```tsx
   try {
     const tyres = await getTyreModels();
   } catch {
     return <CatalogErrorFallback />;
   }
   ```

3. **Loading States**
   - Добавить Suspense boundaries с loading skeletons
   - Для async server components использовать Next.js loading.tsx convention

### UX улучшения

4. **Empty States** (взять пример с lcv-tyres)
   - Показывать информативное сообщение когда категория пуста
   - Добавлять CTA для связи или альтернативные действия

5. **Accessibility**
   - Добавить proper ARIA roles для tab interface в tyre-search
   - Использовать `aria-live` для динамических результатов
   - Добавить `aria-hidden="true"` к декоративным иконкам
   - Semantic breadcrumbs с `aria-label` и `aria-current`

### i18n подготовка

6. **Извлечь все строки**
   - Создать `/lib/i18n/uk.ts` с всеми UI строками
   - Заменить hardcoded текст на ключи
   - Подготовить структуру для будущей мультиязычности

### Код quality

7. **Cleanup**
   - Удалить unused imports (TyreCard в passenger-tyres, TyreCardGrid в lcv-tyres)
   - Убрать development-only текст ("У продакшн-версії...")
   - Вынести domain URL в environment variable

8. **Консистентность**
   - Использовать одинаковые иконки для сезонов во всех компонентах (Sun/Snowflake/Cloud)
   - Использовать одинаковую логику фильтрации для featured models

### Приоритеты

| Приоритет | Задача | Влияние |
|-----------|--------|---------|
| P0 | Error handling на catalog страницах | Stability |
| P0 | Унификация кода в общий компонент | Maintainability |
| P1 | Loading states | UX |
| P1 | Accessibility fixes | Compliance |
| P2 | i18n подготовка | Scalability |
| P2 | Cleanup unused code | Code quality |

---

## Компоненты (проверенные)

| Компонент | Статус | Примечание |
|-----------|--------|------------|
| TyreCard.tsx | OK | Хорошо структурирован, badge logic корректен |
| TyreImage.tsx | OK | Fallback на иконку работает |
| VehicleTyreSelector.tsx | OK | Отличные loading states, error handling |
| FAQSection.tsx | OK | Accessible accordion с aria-expanded |
| LexicalRenderer.tsx | OK | Корректный рендеринг Lexical JSON |
| KeyBenefits.tsx | OK | Простой и чистый компонент |
| EuLabelBadge.tsx | OK | Хорошая цветовая дифференциация |
| TestResultsSection.tsx | OK | Условный рендеринг при пустых данных |

---

## Резюме

**Общий статус:** Требует внимания

**Плюсы:**
- Хороший responsive design
- Качественный SEO на странице модели (Schema.org)
- Отличные loading states в tyre-search
- Хорошая обработка empty states в lcv-tyres и shyny/[slug]
- Переиспользуемые компоненты хорошо структурированы

**Минусы:**
- Значительное дублирование кода между catalog страницами (~85%)
- Отсутствие error handling на server components
- Hardcoded текст препятствует i18n
- Accessibility issues (tabs, breadcrumbs, aria-labels)

**Оценка готовности к production:** 7/10

Рекомендуется устранить P0 задачи перед production deployment.
