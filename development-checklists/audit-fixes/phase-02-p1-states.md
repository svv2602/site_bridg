# Фаза 2: P1 States — Loading, Error, Empty States

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати правильну обробку станів на всіх сторінках:
- Loading states з skeleton loaders
- Error states з retry механізмом
- Empty states з інформативними повідомленнями

---

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Знайти приклади хороших loading states (tyre-search, DealersMap)
- [ ] Знайти приклади empty states (lcv-tyres — еталон)
- [ ] Вивчити як працює Suspense в Next.js App Router

**Команди для пошуку:**
```bash
# Пошук Loader2 (spinner)
grep -rn "Loader2" frontend/src/
# Пошук loading.tsx файлів
find frontend/src/app -name "loading.tsx"
# Пошук error.tsx файлів
find frontend/src/app -name "error.tsx"
```

#### B. Патерни для використання
- [ ] Створити shared компонент `LoadingSkeleton`
- [ ] Створити shared компонент `ErrorState`
- [ ] Створити shared компонент `EmptyState`

**Референс:** `frontend/src/app/lcv-tyres/page.tsx` — найкращий empty state

**Нотатки для перевикористання:** -

---

### 2.1 Створити shared компоненти для states

- [ ] Створити `frontend/src/components/ui/LoadingSkeleton.tsx`
- [ ] Створити `frontend/src/components/ui/ErrorState.tsx`
- [ ] Створити `frontend/src/components/ui/EmptyState.tsx`

**Приклад LoadingSkeleton:**
```tsx
export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6">
          <div className="h-48 rounded-xl bg-muted" />
          <div className="mt-4 h-4 w-3/4 rounded bg-muted" />
          <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
```

**Приклад EmptyState:**
```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-12 text-center">
      {icon && <div className="mx-auto mb-4 h-12 w-12 text-muted">{icon}</div>}
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
      {action && (
        <Link href={action.href} className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-white">
          {action.label}
        </Link>
      )}
    </div>
  );
}
```

---

### 2.2 Головна сторінка — loading/empty states

**Джерело:** `plan/result_audit/01-home.md`

- [ ] Додати loading state для featuredTyres секції
- [ ] Додати loading state для articles секції
- [ ] Додати empty state якщо немає популярних шин
- [ ] Додати empty state якщо немає статей

**Файли:** `frontend/src/app/page.tsx`

---

### 2.3 Каталог шин — loading/error states

**Джерело:** `plan/result_audit/02-tyre-catalog.md`

- [ ] Створити `frontend/src/app/passenger-tyres/loading.tsx`
- [ ] Створити `frontend/src/app/passenger-tyres/error.tsx`
- [ ] Створити `frontend/src/app/suv-4x4-tyres/loading.tsx`
- [ ] Створити `frontend/src/app/suv-4x4-tyres/error.tsx`
- [ ] Створити `frontend/src/app/lcv-tyres/loading.tsx`
- [ ] Створити `frontend/src/app/lcv-tyres/error.tsx`
- [ ] Додати try-catch на рівні сторінок для API calls

**Приклад loading.tsx:**
```tsx
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 h-8 w-64 animate-pulse rounded bg-muted" />
      <LoadingSkeleton count={6} />
    </div>
  );
}
```

**Приклад error.tsx:**
```tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold">Щось пішло не так</h2>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-full bg-primary px-6 py-2 text-white"
      >
        Спробувати знову
      </button>
    </div>
  );
}
```

---

### 2.4 /advice — loading/error/empty states

**Джерело:** `plan/result_audit/04-content.md`

- [ ] Створити `frontend/src/app/advice/loading.tsx`
- [ ] Створити `frontend/src/app/advice/error.tsx`
- [ ] Додати empty state якщо немає статей
- [ ] Додати empty state для порожніх результатів фільтрації

**Файли:**
- `frontend/src/app/advice/loading.tsx` (новий)
- `frontend/src/app/advice/error.tsx` (новий)
- `frontend/src/app/advice/page.tsx`

---

### 2.5 /technology — loading/error states

**Джерело:** `plan/result_audit/04-content.md`

- [ ] Створити `frontend/src/app/technology/loading.tsx`
- [ ] Створити `frontend/src/app/technology/error.tsx`
- [ ] Додати empty state якщо немає технологій

**Файли:**
- `frontend/src/app/technology/loading.tsx` (новий)
- `frontend/src/app/technology/error.tsx` (новий)

---

### 2.6 /contacts — form states

**Джерело:** `plan/result_audit/05-dealers-contacts.md`

- [ ] Додати loading state при submit форми (spinner на кнопці)
- [ ] Додати success state після успішного submit (зелене повідомлення)
- [ ] Додати error state при помилці (червоне повідомлення)
- [ ] Додати validation feedback для полів

**Файли:** `frontend/src/app/contacts/page.tsx`

**Приклад form states:**
```tsx
{status === 'loading' && (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>Надсилаємо...</span>
  </div>
)}

{status === 'success' && (
  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
    <CheckCircle className="mr-2 inline h-5 w-5" />
    Дякуємо! Ваше повідомлення надіслано.
  </div>
)}

{status === 'error' && (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
    <AlertCircle className="mr-2 inline h-5 w-5" />
    {error}
  </div>
)}
```

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(ux): phase-2 P1 loading/error/empty states"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Додай запис в історію
6. Відкрий `phase-03-p1-accessibility.md` та продовж роботу
