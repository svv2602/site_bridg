# Стандарты Разработки Frontend — Bridgestone Україна

**Версия:** 1.0
**Дата создания:** 2026-01-11
**Статус:** Активный

---

## Введение

Этот документ содержит стандарты и руководства по разработке фронтенд части сайта Bridgestone Україна. Цель стандартов — обеспечить единообразие кода, упростить поддержку и улучшить качество приложения.

## Основные Принципы

1. **Унификация** — единый стиль кода во всём проекте
2. **Переиспользование** — компоненты и утилиты должны быть переиспользуемыми
3. **Доступность (a11y)** — все компоненты соответствуют WCAG 2.1 AA
4. **Локализация** — UI на украинском, код и комментарии на английском
5. **Тёплая тема** — stone palette вместо холодных zinc/gray
6. **Типизация** — строгая типизация с TypeScript
7. **Производительность** — оптимизация Core Web Vitals

---

## Технологический стек

| Технология | Версия | Описание |
|------------|--------|----------|
| Next.js | 16 | App Router, React 19, Server Components |
| TypeScript | 5.x | Строгий режим |
| Tailwind CSS | 4.0 | CSS variables, @theme директива |
| Payload CMS | 3.x | Headless CMS с PostgreSQL |
| Lucide React | — | Иконки |
| Framer Motion | — | Анимации |

---

## Содержание Стандартов

### Структура и Организация

- **[Структура Компонентов](./COMPONENT_STRUCTURE.md)**
  - Архитектура компонентов, шаблоны и best practices
  - Организация файлов и папок, примеры кода

- **[Организация Импортов](./IMPORT_ORGANIZATION.md)**
  - Порядок импортов, группировка зависимостей, алиасы

### Стилизация

- **[Система Цветов](./COLOR_SYSTEM.md)**
  - Stone palette, CSS переменные, тёмная тема
  - **ЗАПРЕТ hardcoded цветов**, правила контрастности

- **[Отступы и Spacing](./SPACING_GUIDE.md)**
  - Tailwind spacing conventions, responsive spacing

- **[Типографика](./TYPOGRAPHY.md)**
  - Шрифты (Geist), размеры, line-height, иерархия

- **[Стиль Кода](./CODE_STYLE.md)**
  - Naming conventions, форматирование, комментарии

### TypeScript

- **[TypeScript Стандарты](./TYPESCRIPT_STANDARDS.md)**
  - Типизация компонентов, интерфейсы vs типы
  - Generics, utility types, запрет `any`

### UI Компоненты

- **[Карточки](./CARD_STYLING.md)**
  - TyreCard, статистические карточки, hover-эффекты

- **[Кнопки](./BUTTON_STANDARDS.md)**
  - Primary, secondary, ghost варианты
  - Размеры, состояния, адаптивность

- **[Состояния Загрузки](./LOADING_STATES.md)**
  - Skeleton компоненты, spinners, прогресс

- **[Формы и Валидация](./FORMS_VALIDATION.md)**
  - Input, Select, паттерны валидации

### API и Данные

- **[API Интеграция](./API_INTEGRATION.md)**
  - Payload CMS API, fetch паттерны
  - Fallback на mock data, кэширование

- **[Управление Состоянием](./STATE_MANAGEMENT.md)**
  - useState, URL state, Server Components

### Обработка Ошибок

- **[Error Handling](./ERROR_HANDLING.md)**
  - Error boundaries, API ошибки
  - Пользовательские сообщения об ошибках

### Производительность

- **[Performance](./PERFORMANCE.md)**
  - React оптимизации (memo, useCallback)
  - Image optimization, lazy loading

### Адаптивность и Темы

- **[Responsive Layout](./RESPONSIVE_LAYOUT.md)**
  - Брейкпоинты, mobile-first, overflow prevention

- **[Тёмная Тема](./DARK_MODE.md)**
  - CSS переменные, переключение тем
  - Контрастность в обеих темах

### Доступность

- **[Accessibility](./ACCESSIBILITY.md)**
  - ARIA атрибуты, keyboard navigation
  - Screen reader support, WCAG 2.1 AA

### Чеклисты

- **[Чеклисты для Разработки](./CHECKLISTS.md)**
  - Pre-commit checklist
  - Code review checklist
  - Performance checklist

---

## Шаблоны Компонентов

В директории [templates/](./templates/) находятся готовые шаблоны:

- **[component-template.tsx](./templates/component-template.tsx)** — Стандартный компонент
- **[page-template.tsx](./templates/page-template.tsx)** — Шаблон страницы App Router
- **[server-component.tsx](./templates/server-component.tsx)** — Server Component с data fetching

Используйте эти шаблоны как starting point для новых компонентов.

---

## Быстрый Старт

### Для новых разработчиков:

1. Прочитайте [Структуру Компонентов](./COMPONENT_STRUCTURE.md)
2. Изучите [Систему Цветов](./COLOR_SYSTEM.md) — stone palette обязателен
3. Ознакомьтесь с [API Интеграцией](./API_INTEGRATION.md)
4. Используйте [Чеклисты](./CHECKLISTS.md) при разработке

### Перед коммитом:

1. Проверьте [Pre-commit Checklist](./CHECKLISTS.md#pre-commit-checklist)
2. Запустите `npm run lint` и `npm run build`
3. Убедитесь, что нет hardcoded цветов (zinc, gray, hex)
4. Проверьте адаптивность на мобильных

---

## Инструменты

### ESLint

```bash
npm run lint
```

### TypeScript

```bash
npm run build  # Включает проверку типов
```

### Форматирование

Prettier настроен в проекте:
```bash
npx prettier --write "src/**/*.{ts,tsx}"
```

---

## Связанные Документы

- [CLAUDE.md](../../../CLAUDE.md) — Инструкции для Claude Code
- [README.md](../../README.md) — Документация проекта

---

## История Изменений

**v1.0 (2026-01-11)** — Первая версия стандартов
- Создано 20 документов на основе аудита UI/UX
- Адаптировано для Next.js 16 + Tailwind CSS v4
- Stone palette вместо zinc/gray
- Интеграция с Payload CMS

---

**Помните:** Стандарты существуют для улучшения качества кода. Следование им делает код более понятным и поддерживаемым!
