# Фаза 5: UX та Loading States (P2)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Покращити UX додаванням loading states, Suspense, та error boundaries.

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити LoadingSkeleton компонент
- [ ] Вивчити EmptyState компонент
- [ ] Вивчити ErrorState компонент
- [ ] Перевірити як реалізовано loading в tyre-search

**Команди для пошуку:**
```bash
# Пошук loading компонентів
ls frontend/src/components/ui/
# Пошук Suspense
grep -rn "Suspense" frontend/src/
# Пошук loading.tsx
find frontend/src/app -name "loading.tsx"
```

#### B. Сторінки без loading states
- `/advice/page.tsx` - список статей
- `/technology/page.tsx` - технології
- `/dealers/page.tsx` - частково є

**Нотатки для перевикористання:**
- `components/ui/LoadingSkeleton.tsx`
- `components/ui/EmptyState.tsx`
- `tyre-search/new-page.tsx` - референс для loading

---

### 5.1 Створити loading.tsx для /advice

**Файл:** `frontend/src/app/advice/loading.tsx` (створити)

- [ ] Створити файл loading.tsx
- [ ] Використати LoadingSkeleton для карток статей
- [ ] Зберегти структуру grid як на основній сторінці

**Код:**
```tsx
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Hero skeleton */}
      <div className="mb-8">
        <LoadingSkeleton className="h-8 w-64 mb-4" />
        <LoadingSkeleton className="h-4 w-96" />
      </div>
      
      {/* Articles grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border p-4">
            <LoadingSkeleton className="h-40 w-full mb-4" />
            <LoadingSkeleton className="h-6 w-3/4 mb-2" />
            <LoadingSkeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Нотатки:** -

---

### 5.2 Створити loading.tsx для /technology

**Файл:** `frontend/src/app/technology/loading.tsx` (створити)

- [ ] Створити файл loading.tsx
- [ ] Skeleton для benefits секції
- [ ] Skeleton для технологій карток

**Нотатки:** -

---

### 5.3 Покращити error state для dealers

**Файл:** `frontend/src/app/dealers/page.tsx`

- [ ] Знайти обробку помилок API
- [ ] Замінити console.error на видиме повідомлення
- [ ] Використати ErrorState компонент

**Код:**
```tsx
const [error, setError] = useState<string | null>(null);

// В catch блоці:
setError("Не вдалося завантажити список дилерів");

// В рендері:
{error && (
  <ErrorState
    title="Помилка завантаження"
    message={error}
    onRetry={() => { setError(null); fetchDealers(); }}
  />
)}
```

**Нотатки:** -

---

### 5.4 Додати loading state для QuickSearchForm

**Файл:** `frontend/src/components/QuickSearchForm.tsx`

- [ ] Додати loading стан для кнопки "Знайти шини"
- [ ] Показувати Loader2 spinner під час редіректу

**Код:**
```tsx
const [isSearching, setIsSearching] = useState(false);

const handleSearch = () => {
  setIsSearching(true);
  router.push(`/tyre-search?${params}`);
};

<button disabled={isSearching}>
  {isSearching ? (
    <>
      <Loader2 className="animate-spin h-4 w-4 mr-2" />
      Пошук...
    </>
  ) : (
    "Знайти шини"
  )}
</button>
```

**Нотатки:** -

---

### 5.5 Перевірити всі loading/error states

- [ ] Відкрити /advice з повільним з'єднанням (DevTools Network throttling)
- [ ] Перевірити що skeleton показується
- [ ] Симулювати помилку API та перевірити error state

**Нотатки:** -

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази на [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(ux): phase-5 loading states and error handling"
   ```
5. Онови PROGRESS.md
6. Відкрий `phase-06-i18n.md`
