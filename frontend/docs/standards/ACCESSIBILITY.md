# Доступность (Accessibility)

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Основные Принципы WCAG 2.1

1. **Воспринимаемость** — контент доступен для восприятия
2. **Управляемость** — интерфейс управляется с клавиатуры
3. **Понятность** — контент и интерфейс понятны
4. **Надёжность** — контент работает с разными технологиями

---

## Семантический HTML

### Правильная Иерархия Заголовков

```typescript
// ПРАВИЛЬНО
<h1>Легкові шини Bridgestone</h1>
<section>
  <h2>Літні шини</h2>
  <article>
    <h3>Turanza T005</h3>
  </article>
</section>

// НЕПРАВИЛЬНО — пропущен h2
<h1>Заголовок</h1>
<h3>Подзаголовок</h3>
```

### Семантические Теги

```typescript
<header>
  <nav aria-label="Головна навігація">
    {/* Навигация */}
  </nav>
</header>

<main>
  <article>
    <h1>Заголовок статьи</h1>
    <p>Контент...</p>
  </article>
</main>

<footer>
  {/* Футер */}
</footer>
```

---

## Keyboard Navigation

### Tab Order

```typescript
// Интерактивные элементы должны быть доступны через Tab
<button>Кнопка 1</button>
<a href="/page">Ссылка</a>
<input type="text" />
<button>Кнопка 2</button>

// tabIndex для кастомных элементов
<div role="button" tabIndex={0} onClick={handleClick}>
  Кликабельный div
</div>
```

### Focus Visible

```typescript
// ОБЯЗАТЕЛЬНО — видимый focus
<button className="rounded-full bg-primary px-4 py-2
                   focus:outline-none focus:ring-2
                   focus:ring-primary/50 focus:ring-offset-2">
  Кнопка
</button>

// Для ссылок
<a href="/page" className="hover:underline focus:underline
                          focus:outline-none focus:ring-2 focus:ring-primary">
  Ссылка
</a>
```

### Escape для Модалок/Меню

```typescript
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  if (open) {
    document.addEventListener('keydown', handleEscape);
  }

  return () => document.removeEventListener('keydown', handleEscape);
}, [open]);
```

---

## ARIA Атрибуты

### Кнопки с Иконками

```typescript
// ОБЯЗАТЕЛЬНО aria-label для icon buttons
<button aria-label="Відкрити меню">
  <Menu className="h-5 w-5" />
</button>

<button aria-label="Закрити">
  <X className="h-5 w-5" />
</button>

<button aria-label="Пошук">
  <Search className="h-5 w-5" />
</button>
```

### Раскрывающиеся Меню

```typescript
<button
  aria-expanded={isOpen}
  aria-controls="menu-dropdown"
  aria-haspopup="true"
  onClick={() => setIsOpen(!isOpen)}
>
  Меню
</button>

{isOpen && (
  <div id="menu-dropdown" role="menu">
    <a role="menuitem" href="/page1">Пункт 1</a>
    <a role="menuitem" href="/page2">Пункт 2</a>
  </div>
)}
```

### Табы

```typescript
<div role="tablist" aria-label="Спосіб пошуку шин">
  <button
    role="tab"
    id="size-tab"
    aria-selected={activeTab === 'size'}
    aria-controls="size-panel"
    tabIndex={activeTab === 'size' ? 0 : -1}
  >
    За розміром
  </button>
  <button
    role="tab"
    id="car-tab"
    aria-selected={activeTab === 'car'}
    aria-controls="car-panel"
    tabIndex={activeTab === 'car' ? 0 : -1}
  >
    За авто
  </button>
</div>

<div
  role="tabpanel"
  id="size-panel"
  aria-labelledby="size-tab"
  hidden={activeTab !== 'size'}
>
  {/* Контент */}
</div>
```

---

## Изображения

### Alt Текст

```typescript
// ПРАВИЛЬНО — описательный alt
<Image
  src="/tyres/turanza.jpg"
  alt="Шина Bridgestone Turanza T005 — літня модель"
/>

// ПРАВИЛЬНО — декоративное изображение
<Image src="/pattern.svg" alt="" aria-hidden="true" />

// НЕПРАВИЛЬНО
<Image src="/tyres/turanza.jpg" alt="image" />
<Image src="/tyres/turanza.jpg" alt="фото" />
```

---

## Формы

### Labels

```typescript
// ПРАВИЛЬНО — связанный label
<div>
  <label htmlFor="width" className="block text-sm font-medium">
    Ширина
  </label>
  <select id="width" name="width">
    <option value="">Оберіть</option>
  </select>
</div>

// ПРАВИЛЬНО — визуально скрытый label
<label htmlFor="search" className="sr-only">
  Пошук шин
</label>
<input id="search" type="text" placeholder="Пошук..." />
```

### Ошибки Валидации

```typescript
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? 'email-error' : undefined}
  />
  {error && (
    <p id="email-error" role="alert" className="text-red-500 text-sm">
      {error}
    </p>
  )}
</div>
```

### Required Поля

```typescript
<label htmlFor="name">
  Ім'я <span aria-hidden="true" className="text-red-500">*</span>
  <span className="sr-only">(обов'язкове)</span>
</label>
<input id="name" required aria-required="true" />
```

---

## Контрастность

### Минимальные Требования (WCAG AA)

- **Обычный текст:** 4.5:1
- **Крупный текст (≥18px или ≥14px bold):** 3:1
- **UI компоненты:** 3:1

### Проверенные Пары

```typescript
// Гарантированный контраст
bg-primary + text-white              // 4.5:1+
bg-stone-900 + text-stone-100        // 4.5:1+
bg-card + text-card-foreground       // 4.5:1+
bg-muted + text-foreground           // 4.5:1+
```

### Инструменты Проверки

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools → Elements → Styles → Color Contrast

---

## Screen Readers

### sr-only Класс

```typescript
// Текст только для screen readers
<span className="sr-only">Завантаження...</span>

// Пример: иконка с текстом для SR
<button>
  <Search className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">Пошук</span>
</button>
```

### Live Regions

```typescript
// Анонсирование изменений
<div aria-live="polite" aria-atomic="true">
  {message && <p>{message}</p>}
</div>

// Для важных уведомлений
<div role="alert" aria-live="assertive">
  {error && <p className="text-red-500">{error}</p>}
</div>
```

---

## Чеклист

### Структура

- [ ] Правильная иерархия h1 → h2 → h3
- [ ] Семантические теги (nav, main, article)
- [ ] Один h1 на страницу

### Клавиатура

- [ ] Все элементы доступны через Tab
- [ ] Focus visible виден
- [ ] Escape закрывает модалки/меню
- [ ] Enter/Space активирует кнопки

### ARIA

- [ ] aria-label для icon buttons
- [ ] aria-expanded для меню
- [ ] aria-invalid для ошибок форм
- [ ] role для кастомных компонентов

### Формы

- [ ] Каждый input имеет label
- [ ] Ошибки связаны через aria-describedby
- [ ] Required поля помечены

### Изображения

- [ ] Описательный alt текст
- [ ] alt="" для декоративных изображений

### Цвета

- [ ] Контрастность минимум 4.5:1
- [ ] Информация не только цветом

---

## Связанные Документы

- [Система Цветов](./COLOR_SYSTEM.md)
- [Кнопки](./BUTTON_STANDARDS.md)
- [Формы](./FORMS_VALIDATION.md)
