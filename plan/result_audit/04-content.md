# Аудит группы "Контент"

## Проанализированные страницы

| Страница | Файл | Тип |
|----------|------|-----|
| /advice | `frontend/src/app/advice/page.tsx` | Client Component |
| /advice/[slug] | `frontend/src/app/advice/[slug]/page.tsx` | Server Component |
| /technology | `frontend/src/app/technology/page.tsx` | Client Component |
| /about | `frontend/src/app/about/page.tsx` | Client Component |

---

## 1. /advice (Список статей)

### 1.1 Функциональность

| Критерий | Статус | Описание |
|----------|--------|----------|
| Рендеринг компонентов | OK | Все компоненты рендерятся корректно |
| Обработка ошибок | FAIL | Нет try-catch для данных, отсутствует error boundary |
| API вызовы | PARTIAL | Использует `MOCK_ARTICLES` напрямую, нет вызовов API |

**Проблемы:**
- Использует mock-данные напрямую (`import { MOCK_ARTICLES } from "@/lib/data"`), хотя есть API слой в `lib/api/articles.ts`
- Категории статей — хардкод (const categories), не связаны с реальной структурой данных
- Кнопки "Популярні статті", "Всі категорії", "Сортувати за датою", "Фільтр" не функциональны (нет onClick handlers)
- Нет пагинации для статей

### 1.2 UX/UI

| Критерий | Статус | Описание |
|----------|--------|----------|
| Loading states | FAIL | Нет loading состояния (instant mock data) |
| Empty states | FAIL | Нет обработки пустого списка статей |
| Error states | FAIL | Нет отображения ошибок |
| Responsive design | OK | Grid адаптируется (md:grid-cols-2, lg:grid-cols-3/4) |

**Проблемы:**
- Кнопка "Читати статтю" — обычная `<button>`, нет ссылки на `/advice/[slug]`
- CTA секция "Задати питання", "База знань" — нефункциональные кнопки

### 1.3 i18n (Hardcoded текст)

```
- "Головна", "Корисна інформація та поради" (breadcrumb)
- "Корисна інформація та поради щодо шин Bridgestone" (h1)
- "Популярні статті", "Всі категорії" (кнопки)
- "Оберіть категорію" (заголовок)
- "статей" (счетчик в категориях)
- "Перейти" (в категориях)
- "Останні статті" (заголовок)
- "Сортувати за датою", "Фільтр" (кнопки)
- "Стаття" (badge)
- "хвилин читання" (время чтения)
- "Читати статтю" (кнопка)
- "Не знайшли потрібну інформацію?" (CTA)
- "Задати питання", "База знань" (кнопки CTA)
```

### 1.4 Accessibility

| Критерий | Статус | Описание |
|----------|--------|----------|
| ARIA labels | FAIL | Нет aria-label на кнопках и интерактивных элементах |
| Keyboard navigation | PARTIAL | Кнопки фокусируются, но не работают |
| Screen reader | FAIL | Нет semantic landmarks, отсутствуют alt для иконок |
| Focus visible | PARTIAL | Стили hover есть, focus-visible не определен |

**Проблемы:**
- Breadcrumb использует `<span>` вместо `<nav aria-label="breadcrumb">` с `<ol>`
- Категории — div вместо кнопок/ссылок с aria-labels
- Статьи используют `<article>`, что хорошо, но `<button>` вместо `<a href>`

---

## 2. /advice/[slug] (Страница статьи)

### 2.1 Функциональность

| Критерий | Статус | Описание |
|----------|--------|----------|
| Рендеринг компонентов | OK | Все компоненты рендерятся |
| Обработка ошибок | OK | `notFound()` вызывается при отсутствии статьи |
| API вызовы | OK | Использует `getArticleBySlug()` с fallback на mock |
| SSG | OK | `generateStaticParams()` генерирует пути |
| SEO | OK | Schema.org (Article, BreadcrumbList), метаданные |

**Сильные стороны:**
- Server Component — правильный паттерн для SSG
- `generateMetadata` с fallback значениями
- Schema.org structured data (Article, BreadcrumbList)
- Breadcrumb использует `<Link>` для навигации

**Проблемы:**
- `@ts-expect-error` для seoTitle/seoDescription — недоработка типов
- Полный текст статьи не рендерится (placeholder text)
- Нет секции "Связанные статьи" / "Читайте также"

### 2.2 UX/UI

| Критерий | Статус | Описание |
|----------|--------|----------|
| Loading states | PARTIAL | Next.js SSG, нет явного loading.tsx |
| Empty states | OK | `notFound()` для несуществующих статей |
| Error states | PARTIAL | Нет global error.tsx для /advice |
| Responsive design | OK | max-w-4xl, адаптивные padding |

**Проблемы:**
- Нет изображения статьи (в отличие от списка)
- Отсутствует social sharing

### 2.3 i18n (Hardcoded текст)

```
- "Стаття не знайдена — Поради Bridgestone" (404 title)
- "корисні поради щодо шин Bridgestone" (SEO suffix)
- "Корисні поради щодо вибору та експлуатації шин..." (default description)
- "Головна", "Поради" (breadcrumb)
- "До всіх статей" (back link)
- "хвилин читання" (время)
- "Повний текст статті..." (placeholder)
- Hardcoded URL "https://bridgestone.ua" в schema
```

### 2.4 Accessibility

| Критерий | Статус | Описание |
|----------|--------|----------|
| ARIA labels | PARTIAL | Breadcrumb семантичный, но без aria-label |
| Keyboard navigation | OK | Link элементы работают |
| Screen reader | PARTIAL | `<article>`, `<nav>` есть, prose стили |
| Focus visible | OK | Link стили с hover |

---

## 3. /technology (Технологии)

### 3.1 Функциональность

| Критерий | Статус | Описание |
|----------|--------|----------|
| Рендеринг компонентов | OK | Все компоненты рендерятся |
| Обработка ошибок | FAIL | Нет обработки ошибок |
| API вызовы | FAIL | Использует `MOCK_TECHNOLOGIES` и `MOCK_TYRE_MODELS` напрямую |

**Проблемы:**
- Не использует API слой (хотя есть `getPayloadTechnologies()`)
- Кнопки "Дізнатися більше", "Всі технології", "Детальніше", "Знайти шини..." нефункциональны
- Связь технологий с шинами через `tyreSlugs` — хрупкая логика
- Кнопка "Показати ще N моделей" не работает

### 3.2 UX/UI

| Критерий | Статус | Описание |
|----------|--------|----------|
| Loading states | FAIL | Нет loading состояния |
| Empty states | FAIL | Нет обработки пустых данных |
| Error states | FAIL | Нет отображения ошибок |
| Responsive design | OK | Grid адаптируется, hero с 2 колонками на lg |

**Проблемы:**
- Hero визуал — placeholder (icon Cpu вместо реального изображения)
- Анимации на каждом элементе могут вызывать performance issues при большом количестве технологий

### 3.3 i18n (Hardcoded текст)

```
- "Головна", "Технології та інновації" (breadcrumb)
- "Технології Bridgestone" (h1, section title)
- "безпека, комфорт та ефективність..." (subtitle)
- Описание в hero секции
- "Дізнатися більше", "Всі технології" (кнопки hero)
- "Ключові переваги" (заголовок)
- benefits[] array — все title/description
- "Технологія Bridgestone" (badge)
- "Використовується в N моделях" (счетчик)
- "Літо", "Зима", "Всесезон" (сезоны)
- "Моделі з цією технологією" (заголовок)
- "Детальніше" (ссылка)
- "Показати ще N моделей" (кнопка)
- "Детальніше про технологію", "Знайти шини з цією технологією"
- CTA секция — все тексты
- "Замовити консультацію", "Завантажити брошуру"
```

### 3.4 Accessibility

| Критерий | Статус | Описание |
|----------|--------|----------|
| ARIA labels | FAIL | Нет aria-label на кнопках и элементах |
| Keyboard navigation | PARTIAL | Кнопки фокусируются, но не работают |
| Screen reader | PARTIAL | `<article>` используется, но нет landmarks |
| Focus visible | PARTIAL | hover стили есть, focus-visible не определен |

**Проблемы:**
- Breadcrumb — `<span>` вместо семантической разметки
- techIcons — нет alt текста для иконок
- Кнопки внутри карточек моделей — нет href

---

## 4. /about (О бренде)

### 4.1 Функциональность

| Критерий | Статус | Описание |
|----------|--------|----------|
| Рендеринг компонентов | OK | Все компоненты рендерятся |
| Обработка ошибок | N/A | Нет динамических данных |
| API вызовы | N/A | Статическая страница |

**Проблемы:**
- Полностью статическая страница с hardcoded данными
- Кнопки "Дізнатися більше", "Зв'язатися з нами", "Знайти дилера", "Зателефонувати" нефункциональны
- Контент должен управляться через CMS

### 4.2 UX/UI

| Критерий | Статус | Описание |
|----------|--------|----------|
| Loading states | N/A | Статическая страница |
| Empty states | N/A | Нет динамических данных |
| Error states | N/A | Нет динамических данных |
| Responsive design | OK | Grid адаптируется, timeline на десктопе |

**Проблемы:**
- Timeline истории — на мобильных визуально сломан (alternating flex-row/flex-row-reverse)
- Hero использует `bg-[url('/grid.svg')]` — проверить наличие файла
- Stats секция не имеет интерактивности

### 4.3 i18n (Hardcoded текст)

```
- "Головна", "Про бренд Bridgestone" (breadcrumb)
- "Bridgestone — світовий виробник шин" (h1)
- "технічний лідер з глобальною присутністю..." (subtitle)
- Весь текст в hero описании
- "Дізнатися більше", "Зв'язатися з нами" (кнопки)
- stats[] array — label/value
- values[] array — title/description
- "Наша місія" section — весь текст
- "Наші цінності" section
- "Інновації для безпеки", "Відповідальність перед планетою" и описания
- "Історія, яка формує майбутнє" — весь timeline
- CTA секция
- "Знайти дилера", "Зателефонувати"
```

**Количество hardcoded текстов:** ~50+ строк

### 4.4 Accessibility

| Критерий | Статус | Описание |
|----------|--------|----------|
| ARIA labels | FAIL | Нет aria-label на кнопках и элементах |
| Keyboard navigation | PARTIAL | Кнопки фокусируются, но не работают |
| Screen reader | PARTIAL | Нет landmarks, timeline не читаем |
| Focus visible | PARTIAL | hover стили есть |

**Проблемы:**
- Timeline использует визуальную верстку без semantic HTML (`<ol>`, `<li>`, `role="list"`)
- Breadcrumb — span вместо nav
- Stats числа не имеют связи с labels для screen reader

---

## Общие проблемы группы "Контент"

### Критические проблемы

1. **Отсутствие API интеграции на /advice и /technology**
   - Страницы используют mock-данные напрямую, хотя API слой уже реализован
   - Нужно перевести на Server Components с fetch из Payload CMS

2. **Нефункциональные кнопки**
   - ~15 кнопок без onClick handlers или href
   - Критично для UX — пользователь кликает и ничего не происходит

3. **Отсутствие loading/error states**
   - Нет `loading.tsx` и `error.tsx` файлов в директориях
   - При ошибке API пользователь видит белый экран

4. **100% hardcoded i18n**
   - Все тексты захардкожены в компонентах
   - Невозможно редактировать контент без деплоя
   - Подготовка к мультиязычности требует полного рефакторинга

### Средние проблемы

5. **Accessibility нарушения**
   - Breadcrumbs без семантической разметки (WCAG 2.1 violation)
   - Отсутствие aria-labels на интерактивных элементах
   - Timeline недоступен для screen readers

6. **SEO неполнота**
   - /advice и /technology — Client Components, нет SEO метаданных
   - Только /advice/[slug] имеет Schema.org

7. **Mobile UX**
   - Timeline на /about сломан на мобильных устройствах
   - Category hover эффекты недоступны на touch devices

### Рекомендации

#### Высокий приоритет

1. **Конвертировать в Server Components:**
   ```
   /advice/page.tsx → Server Component + getArticles()
   /technology/page.tsx → Server Component + getPayloadTechnologies()
   ```

2. **Добавить loading/error:**
   ```
   /advice/loading.tsx
   /advice/error.tsx
   /technology/loading.tsx
   /technology/error.tsx
   ```

3. **Сделать кнопки функциональными:**
   - "Читати статтю" → `<Link href={`/advice/${article.slug}`}>`
   - Категории → фильтрация или отдельные страницы
   - CTA → модальные окна или страницы контактов

#### Средний приоритет

4. **i18n система:**
   - Создать `lib/i18n/uk.ts` с переводами
   - Использовать next-intl или аналог
   - Перенести контент /about в CMS

5. **Accessibility фиксы:**
   - Breadcrumbs: `<nav aria-label="breadcrumb"><ol>...</ol></nav>`
   - Timeline: `<ol role="list" aria-label="Історія Bridgestone">`
   - Добавить focus-visible стили

6. **SEO:**
   - generateMetadata для /advice и /technology
   - Schema.org для технологий (HowTo или TechArticle)

#### Низкий приоритет

7. **UX улучшения:**
   - Пагинация на /advice
   - Фильтрация статей по категориям
   - Related articles на странице статьи
   - Social sharing
   - "Читайте также" секция

---

## Сводка оценок

| Страница | Функциональность | UX/UI | i18n | A11y | Общая |
|----------|------------------|-------|------|------|-------|
| /advice | 4/10 | 5/10 | 2/10 | 3/10 | 3.5/10 |
| /advice/[slug] | 8/10 | 7/10 | 3/10 | 6/10 | 6/10 |
| /technology | 4/10 | 5/10 | 2/10 | 3/10 | 3.5/10 |
| /about | 6/10 | 6/10 | 1/10 | 3/10 | 4/10 |

**Средняя оценка группы: 4.25/10**

Страница /advice/[slug] реализована лучше всего благодаря использованию Server Components, API слоя и Schema.org. Остальные страницы требуют существенной доработки для production использования.
