# Аудит группы "Сравнение шин" (Comparison)

**Дата аудита:** 2026-01-10
**Страницы:**
- `/porivnyaty` — `frontend/src/app/porivnyaty/page.tsx`
- `/porivnyaty/[slug]` — `frontend/src/app/porivnyaty/[slug]/page.tsx`

---

## 1. Функциональность

### 1.1 Рендеринг компонентов

| Компонент | Статус | Комментарий |
|-----------|--------|-------------|
| Страница выбора шин (`/porivnyaty`) | OK | Рендерится корректно как client component |
| Страница сравнения (`/porivnyaty/[slug]`) | OK | Server component с SSR |
| Сетка шин с фильтрами | OK | Фильтрация по сезону и поиску работает |
| Sticky bar выбранных шин | OK | Показывается при выборе >= 1 шины |
| Таблица сравнения | OK | Динамически адаптируется под 2-3 шины |
| Schema.org разметка | OK | Article + BreadcrumbList |

### 1.2 Обработка ошибок

| Сценарий | Статус | Комментарий |
|----------|--------|-------------|
| API недоступен | WARN | `getTyreModels()` логирует ошибку, возвращает mock данные — fallback есть |
| Невалидный slug | OK | `notFound()` вызывается при < 2 найденных шин |
| Пустой результат фильтрации | OK | Показывается сообщение "Шини не знайдено" |

### 1.3 API вызовы

| Аспект | Статус | Комментарий |
|--------|--------|-------------|
| Data fetching | OK | Использует `getTyreModels()` из `@/lib/api/tyres` |
| Caching | WARN | На странице выбора (`"use client"`) данные загружаются каждый раз при монтировании |
| SSR/SSG | OK | Страница сравнения использует `generateStaticParams()` для pre-generation |

**Рекомендации по функциональности:**
1. Рассмотреть использование SWR/React Query для кэширования на странице выбора
2. Добавить error boundary для более graceful error handling

---

## 2. UX/UI

### 2.1 Loading States

| Страница | Статус | Комментарий |
|----------|--------|-------------|
| `/porivnyaty` | OK | Skeleton loading с 8 placeholder карточками |
| `/porivnyaty/[slug]` | WARN | Нет loading.tsx — при client-side navigation может быть "мигание" |

### 2.2 Empty States

| Сценарий | Статус | Комментарий |
|----------|--------|-------------|
| Нет шин по фильтру | OK | "Шини не знайдено. Спробуйте змінити фільтри." |
| Нет выбранных шин | OK | Sticky bar не показывается |

### 2.3 Error States

| Сценарий | Статус | Комментарий |
|----------|--------|-------------|
| API error | PARTIAL | Fallback на mock данные без UI уведомления |
| Invalid comparison URL | OK | Показывается 404 через `notFound()` |

**Рекомендация:** Добавить toast/alert при использовании fallback данных, чтобы пользователь знал, что данные могут быть неактуальными.

### 2.4 Responsive Design

| Breakpoint | Статус | Комментарий |
|------------|--------|-------------|
| Mobile (< md) | OK | Сетка 2 колонки, фильтры stack вертикально |
| Tablet (md) | OK | Сетка 3 колонки |
| Desktop (lg+) | OK | Сетка 4 колонки |
| Таблица сравнения | OK | `overflow-x-auto` для горизонтального скролла |

### 2.5 Интерактивность

| Элемент | Статус | Комментарий |
|---------|--------|-------------|
| Выбор шины | OK | Визуальная индикация (ring, checkmark) |
| Лимит 3 шины | OK | Disabled state с opacity-50 |
| Удаление из сравнения | OK | Кнопка X в sticky bar |
| Hover states | OK | Есть на карточках и кнопках |

---

## 3. i18n (Интернационализация)

### 3.1 Hardcoded текст

**Страница `/porivnyaty` (page.tsx):**

| Строка | Текст | Статус |
|--------|-------|--------|
| 77 | "Порівняння шин" | HARDCODED |
| 79-82 | "Оберіть 2-3 моделі шин для порівняння..." | HARDCODED |
| 92 | "Обрано ({count}/3):" | HARDCODED |
| 104 | `aria-label={Видалити ${tyre.name}}` | HARDCODED |
| 116 | "Порівняти" | HARDCODED |
| 134 | "Пошук за назвою..." | HARDCODED |
| 153 | "Всі" | HARDCODED |
| 194-196 | "Шини не знайдено..." | HARDCODED |
| 254 | "Популярні порівняння" | HARDCODED |
| 256-271 | Данные популярных сравнений | HARDCODED |

**Страница `/porivnyaty/[slug]` (page.tsx):**

| Строка | Текст | Статус |
|--------|-------|--------|
| 11-15 | seasonLabels | HARDCODED |
| 18-23 | vehicleLabels | HARDCODED |
| 26-34 | comparisonAttributes labels | HARDCODED |
| 47 | "дБ" | HARDCODED |
| 144 | "Порівняння шин — Bridgestone Україна" | HARDCODED |
| 151-153 | Meta description template | HARDCODED |
| 156-176 | Schema.org strings | HARDCODED |
| 197-202 | Breadcrumb items | HARDCODED |
| 219 | "Всі порівняння" | HARDCODED |
| 226-227 | Header subtitle | HARDCODED |
| 270 | "Порівняння характеристик" | HARDCODED |
| 276 | "Характеристика" | HARDCODED |
| 328 | "Висновок" | HARDCODED |
| 330-335 | Verdict text | HARDCODED |
| 343-348 | CTA section | HARDCODED |
| 353 | "Знайти дилера" | HARDCODED |
| 358 | "Порівняти інші моделі" | HARDCODED |

**Вывод:** Весь UI текст hardcoded на украинском языке. Это соответствует требованиям проекта (Ukrainian only), но затрудняет будущую локализацию.

**Рекомендация:** При планировании мультиязычности создать файл переводов и использовать next-intl или подобную библиотеку.

---

## 4. Accessibility (A11y)

### 4.1 ARIA атрибуты

| Элемент | Статус | Комментарий |
|---------|--------|-------------|
| Кнопка удаления шины | OK | `aria-label={Видалити ${tyre.name}}` |
| Карточки шин (buttons) | WARN | Нет `aria-pressed` для toggle state |
| Кнопки фильтров | WARN | Нет `aria-pressed` для активного фильтра |
| Search input | WARN | Нет `aria-label`, только `placeholder` |
| Таблица сравнения | WARN | Нет `scope` атрибутов на `<th>` |

### 4.2 Keyboard Navigation

| Аспект | Статус | Комментарий |
|--------|--------|-------------|
| Tab order | OK | Естественный порядок, все интерактивные элементы достижимы |
| Enter/Space на карточках | OK | `<button>` элементы работают из коробки |
| Focus visible | PARTIAL | Есть `focus:ring-2` на input, но не на всех кнопках |

### 4.3 Screen Reader

| Аспект | Статус | Комментарий |
|--------|--------|-------------|
| Heading hierarchy | OK | h1 -> h2 -> h3 структура корректна |
| Image alt text | OK | `alt={tyre.name}` |
| Dynamic content | WARN | Изменение количества выбранных шин не анонсируется (нет `aria-live`) |
| Winner indication | WARN | Checkmark без текстовой альтернативы для скрин ридера |

### 4.4 Цветовой контраст

| Элемент | Статус | Комментарий |
|---------|--------|-------------|
| Текст на темном фоне | OK | Белый на zinc-900 |
| Disabled state | WARN | `opacity-50` может не соответствовать WCAG AA |
| Season badges | OK | Достаточный контраст |

---

## 5. Производительность

| Аспект | Статус | Комментарий |
|--------|--------|-------------|
| Image optimization | OK | Использует Next.js `<Image>` с `fill` и `object-contain` |
| Bundle splitting | OK | Разделение на client/server компоненты |
| Memoization | OK | `useMemo` для `filteredTyres` |
| Re-renders | OK | State локализован, минимальные лишние ре-рендеры |

---

## 6. SEO

| Аспект | Статус | Комментарий |
|--------|--------|-------------|
| generateMetadata | OK | Динамические title/description |
| generateStaticParams | OK | Pre-generation страниц сравнения |
| Schema.org | OK | Article + BreadcrumbList разметка |
| Semantic HTML | OK | Корректное использование section, header, table |

---

## 7. Код качество

### 7.1 TypeScript

| Аспект | Статус | Комментарий |
|--------|--------|-------------|
| Type safety | OK | Типы из `@/lib/data` используются корректно |
| Type assertions | OK | `as TyreModel[]` после filter(Boolean) |
| Nullable handling | OK | Optional chaining для euLabel, technologies |

### 7.2 Дублирование кода

| Проблема | Статус | Комментарий |
|----------|--------|-------------|
| `seasonLabels` | WARN | Дублируется в обоих файлах с небольшими различиями |
| `seasonColors` | OK | Только в page.tsx для selection UI |

### 7.3 Рекомендации по рефакторингу

1. **Вынести `seasonLabels`** в общий файл констант
2. **Создать компонент `TyreCard`** для переиспользования между страницами
3. **Добавить loading.tsx** для страницы сравнения

---

## 8. Сводная таблица проблем

| Приоритет | Проблема | Файл | Рекомендация |
|-----------|----------|------|--------------|
| HIGH | Нет aria-pressed на toggle кнопках | page.tsx | Добавить `aria-pressed={selected}` |
| HIGH | Нет aria-label на search input | page.tsx | Добавить `aria-label="Пошук шин"` |
| MEDIUM | Нет aria-live для selection count | page.tsx | Обернуть счетчик в `aria-live="polite"` |
| MEDIUM | Нет scope на th в таблице | [slug]/page.tsx | Добавить `scope="col"/"row"` |
| MEDIUM | Winner checkmark без alt | [slug]/page.tsx | Добавить `aria-label="Краще значення"` |
| LOW | Дублирование seasonLabels | Оба файла | Вынести в shared constants |
| LOW | Нет loading.tsx | [slug]/ | Создать loading.tsx |
| LOW | Hardcoded популярные сравнения | page.tsx | Перенести в CMS или конфиг |

---

## 9. Заключение

**Общая оценка:** 7.5/10

**Сильные стороны:**
- Хорошая функциональность с fallback на mock данные
- Адекватные loading и empty states
- Responsive design реализован корректно
- SSG с generateStaticParams для SEO
- Schema.org разметка

**Области для улучшения:**
- Accessibility требует доработки (aria атрибуты)
- Некоторое дублирование кода
- Hardcoded данные популярных сравнений
- Отсутствует loading.tsx для страницы сравнения

**Приоритетные действия:**
1. Исправить a11y проблемы (aria-pressed, aria-label, scope)
2. Добавить aria-live для динамического контента
3. Создать shared constants для повторяющихся данных
