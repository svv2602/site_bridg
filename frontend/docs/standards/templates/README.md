# Шаблоны Компонентов

Используйте эти шаблоны как starting point для новых компонентов и страниц.

## Содержание

- **[component-template.tsx](./component-template.tsx)** — Client Component с состоянием
- **[page-template.tsx](./page-template.tsx)** — Server Component страница App Router

## Использование

### Новый Компонент

1. Скопируйте `component-template.tsx`
2. Переименуйте файл и компонент
3. Удалите `"use client"` если не нужен client-side
4. Заполните props interface
5. Реализуйте логику и render

### Новая Страница

1. Создайте директорию в `app/`
2. Скопируйте `page-template.tsx` в `page.tsx`
3. Заполните metadata
4. Добавьте data fetching
5. Реализуйте контент

## Чеклист Нового Компонента

- [ ] JSDoc комментарий
- [ ] TypeScript interface для props
- [ ] `className` prop для кастомизации
- [ ] `cn()` для объединения классов
- [ ] Stone palette для цветов
- [ ] Named export (не default)

## Чеклист Новой Страницы

- [ ] Metadata с title и description
- [ ] Breadcrumb навигация
- [ ] Семантический h1
- [ ] Responsive layout
- [ ] Loading state (loading.tsx)
