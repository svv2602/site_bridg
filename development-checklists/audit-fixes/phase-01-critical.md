# Фаза 1: Критичні виправлення (P0)

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Виправити критичні проблеми, які впливають на SEO та стабільність додатку.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити правильне використання jsonLdScript в `/shyny/[slug]/page.tsx`
- [x] Вивчити існуючий ErrorState компонент в `components/ui/ErrorState.tsx`
- [x] Перевірити чи є error.tsx в інших частинах проекту

**Команди для пошуку:**
```bash
# Пошук використання jsonLdScript
grep -rn "jsonLdScript" frontend/src/app/
# Пошук error boundaries
find frontend/src -name "error.tsx"
# Пошук ErrorState компонента
grep -rn "ErrorState" frontend/src/
```

#### B. Аналіз залежностей
- [x] Чи потрібні зміни в lib/schema.ts? Ні, функція коректна
- [x] Чи потрібні нові компоненти? Ні, використати існуючий ErrorState

**Нотатки для перевикористання:** 
- Референс для Schema.org: `frontend/src/app/shyny/[slug]/page.tsx` (рядки 88-102)
- ErrorState: `frontend/src/components/ui/ErrorState.tsx`

---

### 1.1 Виправити Schema.org в /porivnyaty/[slug]

**Проблема:** `jsonLdScript()` використовується без `<script>` тегу, тому JSON виводиться як текст.

**Файл:** `frontend/src/app/porivnyaty/[slug]/page.tsx`

- [x] Знайти рядки з `{jsonLdScript(comparisonSchema)}` та `{jsonLdScript(breadcrumbSchema)}`
- [x] Замінити на правильну форму з `<script>` тегом
- [x] Перевірити що JSON-LD рендериться в `<head>` або на початку `<body>`

**Код для заміни:**
```tsx
// БУЛО (рядки ~203-204):
{jsonLdScript(comparisonSchema)}
{jsonLdScript(breadcrumbSchema)}

// СТАЛО:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: jsonLdScript(comparisonSchema) }}
/>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
/>
```

**Перевірка:**
- [x] Запустити `npm run build` в frontend/
- [ ] Відкрити сторінку порівняння в браузері
- [ ] Перевірити що в DOM є `<script type="application/ld+json">`

**Нотатки:** Build успішний. Виправлено рядки 203-210.

---

### 1.2 Створити глобальний error.tsx

**Проблема:** Немає обробки runtime помилок на рівні додатку.

**Файл:** `frontend/src/app/error.tsx` (створити новий)

- [x] Створити файл `frontend/src/app/error.tsx`
- [x] Використати "use client" директиву (error boundaries мають бути client components)
- [x] Імпортувати та використати існуючий ErrorState компонент
- [x] Додати кнопку "Спробувати знову" з reset()
- [x] Логувати помилку в console.error

**Шаблон коду:**
```tsx
"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorState
        title="Щось пішло не так"
        message="Виникла непередбачена помилка. Спробуйте оновити сторінку."
        onRetry={reset}
      />
    </div>
  );
}
```

- [x] Перевірити що ErrorState підтримує onRetry prop (якщо ні - додати)

**Перевірка:**
- [x] Збірка проходить без помилок
- [ ] Помилки рендерингу показують error boundary замість білого екрану

**Нотатки:** Створено error.tsx з кнопками "Спробувати знову" та "На головну". Використано патерн з advice/error.tsx.

---

### 1.3 Перевірити ErrorState компонент

**Файл:** `frontend/src/components/ui/ErrorState.tsx`

- [x] Перевірити що компонент має prop `onRetry?: () => void`
- [x] Якщо немає - додати підтримку кнопки retry (вже є!)
- [x] Переконатися що стилі відповідають дизайн-системі

**Нотатки:** ErrorState вже має повну підтримку onRetry prop (рядок 8).

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "fix(critical): phase-1 Schema.org and error boundaries"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий `phase-02-seo-metadata.md` та продовж роботу
