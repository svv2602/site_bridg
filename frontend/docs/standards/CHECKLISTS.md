# Чеклисты для Разработки

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Pre-Commit Checklist

Перед каждым коммитом проверьте:

### Код

- [ ] `npm run build` проходит без ошибок
- [ ] `npm run lint` не показывает ошибок
- [ ] Нет `console.log` в продакшн коде
- [ ] Нет закомментированного кода
- [ ] Типы TypeScript корректны (нет `any`)

### Цвета (КРИТИЧНО!)

- [ ] Нет zinc/gray/slate классов
- [ ] Нет HEX цветов (#...)
- [ ] Используется stone palette или semantic классы
- [ ] Проверена тёмная тема

```bash
# Проверка запрещённых цветов
grep -r "zinc-\|gray-\|slate-" src/
grep -rE "#[0-9a-fA-F]{3,6}" src/
```

### UI

- [ ] Кнопки не выходят за границы контейнера
- [ ] Текст не обрезается без `line-clamp`
- [ ] Изображения имеют `alt` атрибуты
- [ ] Формы имеют `label` для каждого input

### Адаптивность

- [ ] Проверено на мобильных (320px+)
- [ ] Проверено на планшетах (768px)
- [ ] Проверено на десктопе (1280px+)

---

## Code Review Checklist

При ревью PR проверьте:

### Архитектура

- [ ] Компонент в правильной директории
- [ ] Server/Client Components разделены корректно
- [ ] Нет дублирования кода
- [ ] Props типизированы через interface

### Производительность

- [ ] Изображения используют `next/image`
- [ ] Нет лишних re-renders
- [ ] `useMemo`/`useCallback` где нужно
- [ ] Данные загружаются на сервере где возможно

### Доступность

- [ ] Интерактивные элементы доступны с клавиатуры
- [ ] Контрастность текста достаточна (4.5:1)
- [ ] ARIA атрибуты где нужно
- [ ] Focus visible на интерактивных элементах

---

## Новый Компонент Checklist

При создании нового компонента:

### Структура

- [ ] Файл в правильной директории (`components/`, `components/ui/`)
- [ ] Имя в PascalCase
- [ ] Interface для props
- [ ] JSDoc комментарий

### Стили

- [ ] Использует Tailwind классы
- [ ] Stone palette для цветов
- [ ] Поддерживает `className` prop
- [ ] Работает в тёмной теме

### Экспорт

- [ ] Named export (не default)
- [ ] Добавлен в index.ts если в папке

### Пример Шаблона

```typescript
/**
 * Краткое описание компонента
 */
interface ComponentProps {
  /** Описание prop */
  title: string;
  className?: string;
}

export function Component({ title, className }: ComponentProps) {
  return (
    <div className={cn('базовые стили', className)}>
      {title}
    </div>
  );
}
```

---

## Новая Страница Checklist

При создании новой страницы:

### Файловая Структура

- [ ] `page.tsx` в правильной директории `app/`
- [ ] `loading.tsx` для состояния загрузки
- [ ] Динамические маршруты `[slug]` если нужно

### SEO

- [ ] `metadata` export с title и description
- [ ] OpenGraph теги
- [ ] `generateStaticParams` для динамических страниц

### Контент

- [ ] Breadcrumb навигация
- [ ] Заголовок h1
- [ ] Адаптивный layout
- [ ] Error state

### Пример

```typescript
// app/example/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Название — Bridgestone Україна',
  description: 'Описание страницы',
};

export default async function ExamplePage() {
  const data = await getData();

  return (
    <div>
      <Breadcrumb items={[...]} />
      <h1>Заголовок</h1>
      {/* Контент */}
    </div>
  );
}
```

---

## Performance Checklist

### Изображения

- [ ] Используется `next/image`
- [ ] Указан `sizes` для responsive
- [ ] `priority` только для above-the-fold
- [ ] WebP/AVIF форматы

### JavaScript

- [ ] Минимум client-side кода
- [ ] Динамические импорты для тяжёлых библиотек
- [ ] Нет unused imports

### CSS

- [ ] Нет unused Tailwind классов
- [ ] Используются CSS переменные
- [ ] Минимум кастомного CSS

### Data Fetching

- [ ] Данные загружаются на сервере
- [ ] Правильное кэширование
- [ ] Fallback на mock data

---

## Accessibility Checklist

### Семантика

- [ ] Правильная иерархия заголовков (h1 → h2 → h3)
- [ ] Семантические теги (`<nav>`, `<main>`, `<article>`)
- [ ] `<button>` для действий, `<a>` для навигации

### Формы

- [ ] Каждый input имеет label
- [ ] Required поля помечены
- [ ] Ошибки валидации читаемы screen reader

### Интерактивность

- [ ] Все элементы доступны с Tab
- [ ] Focus visible виден
- [ ] Escape закрывает модалки
- [ ] aria-expanded для раскрывающихся меню

### Цвета

- [ ] Контрастность минимум 4.5:1
- [ ] Информация не передаётся только цветом

---

## Security Checklist

### Input

- [ ] Валидация на клиенте и сервере
- [ ] Sanitization пользовательского ввода
- [ ] Нет `dangerouslySetInnerHTML` без sanitize

### API

- [ ] Нет sensitive данных в URL
- [ ] API keys только в env variables
- [ ] Rate limiting на API routes

### Данные

- [ ] Нет credentials в коде
- [ ] .env файлы в .gitignore
- [ ] HTTPS для всех запросов

---

## Quick Commands

```bash
# Проверка типов
npm run build

# Линтинг
npm run lint

# Поиск запрещённых цветов
grep -r "zinc-\|gray-\|slate-" src/

# Поиск console.log
grep -r "console.log" src/

# Поиск TODO
grep -r "TODO\|FIXME" src/

# Проверка unused exports
npx ts-prune
```

---

## Связанные Документы

- [Система Цветов](./COLOR_SYSTEM.md)
- [Структура Компонентов](./COMPONENT_STRUCTURE.md)
- [Accessibility](./ACCESSIBILITY.md)
- [Performance](./PERFORMANCE.md)
