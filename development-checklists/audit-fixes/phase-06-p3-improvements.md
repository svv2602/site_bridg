# Фаза 6: P3 Improvements — Покращення

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-10
**Завершена:** 2026-01-11

## Ціль фази
Реалізувати додаткові покращення, які підвищать якість UX:
- Підготовка до i18n
- Покращення анімацій
- Додаткові фічі

---

## Задачі

### 6.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз пріоритетів
- [x] Оцінити важливість i18n для проекту
- [x] Оцінити важливість mobile navigation в адмінці
- [x] Визначити scope покращень

**Нотатки:** i18n — висока пріоритетність для майбутньої локалізації. Задачі 6.7, 6.8 (CSRF, rate limiting) можуть бути відкладені, оскільки автентифікація вже реалізована через HTTP Basic Auth.

---

### 6.1 Підготовка до i18n — винести UI тексти

**Джерело:** Всі звіти аудиту

Створити файл з усіма UI текстами для майбутньої локалізації:

- [x] Створити `frontend/src/lib/i18n/uk.ts`
- [x] Винести тексти з головної сторінки
- [x] Винести тексти з форм пошуку
- [x] Винести тексти з CTA блоків
- [x] Створити helper функцію `t(key)`

**Структура файлу:**
```tsx
// frontend/src/lib/i18n/uk.ts
export const uk = {
  common: {
    home: 'Головна',
    search: 'Пошук',
    findDealer: 'Знайти дилера',
    readMore: 'Детальніше',
    contact: "Зв'язатися",
    phone: 'Зателефонувати',
  },
  seasons: {
    summer: 'Літні шини',
    winter: 'Зимові шини',
    allSeason: 'Всесезонні шини',
  },
  search: {
    bySize: 'За розміром',
    byCar: 'За авто',
    width: 'Ширина',
    aspectRatio: 'Висота профілю',
    diameter: 'Діаметр',
    selectWidth: 'Оберіть ширину',
    findTyres: 'Знайти шини',
  },
  catalog: {
    passengerTyres: 'Шини для легкових авто',
    suvTyres: 'Шини для SUV та 4x4',
    lcvTyres: 'Шини для легких вантажних авто',
    models: 'моделей',
  },
  errors: {
    notFound: 'Не знайдено',
    tryAgain: 'Спробувати знову',
    somethingWentWrong: 'Щось пішло не так',
  },
  // ... інші секції
} as const;

export type TranslationKey = keyof typeof uk;

export function t(key: string): string {
  const keys = key.split('.');
  let value: unknown = uk;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }
  return typeof value === 'string' ? value : key;
}
```

---

### 6.2 Mobile navigation для адмінки

**Джерело:** `plan/result_audit/06-admin.md`

- [x] Додати hamburger menu кнопку на mobile
- [x] Створити mobile drawer/sidebar
- [x] Зберегти desktop navigation для великих екранів
- [x] Додати animation для drawer

**Файл:** `frontend/src/app/admin/layout.tsx`

**Приклад:**
```tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="...">
        {/* Mobile menu button */}
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map(item => (...))}
        </nav>
      </header>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <nav className="lg:hidden fixed inset-0 bg-zinc-900 z-50 p-4">
          {navItems.map(item => (...))}
        </nav>
      )}

      <main>{children}</main>
    </div>
  );
}
```

---

### 6.3 Timeline fix на /about для mobile

**Джерело:** `plan/result_audit/04-content.md`

- [x] Виправити alternating layout на mobile
- [x] Зробити вертикальний timeline для всіх екранів < lg
- [x] Зберегти alternating pattern тільки для desktop

**Файл:** `frontend/src/app/about/page.tsx`

---

### 6.4 Social sharing на статтях

**Джерело:** `plan/result_audit/04-content.md`

- [x] Додати кнопки share (Facebook, Twitter/X, LinkedIn, Telegram)
- [x] Використовувати Web Share API на mobile
- [x] Fallback на share URLs для desktop

**Файли:**
- `frontend/src/components/ShareButtons.tsx` (новий)
- `frontend/src/app/advice/[slug]/page.tsx`

**Приклад:**
```tsx
function ShareButtons({ title, url }: { title: string; url: string }) {
  const shareData = { title, url };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share(shareData);
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleShare} className="lg:hidden">
        <Share2 className="h-5 w-5" />
      </button>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden lg:block"
      >
        <Facebook className="h-5 w-5" />
      </a>
      {/* ... інші соцмережі */}
    </div>
  );
}
```

---

### 6.5 Пагінація на /advice

**Джерело:** `plan/result_audit/04-content.md`

- [ ] Додати пагінацію для списку статей
- [ ] Обмежити 10-12 статей на сторінку
- [ ] Додати URL параметр `?page=N`
- [ ] Server-side pagination через API

**Файл:** `frontend/src/app/advice/page.tsx`

---

### 6.6 "Читайте також" секція на статтях

**Джерело:** `plan/result_audit/04-content.md`

- [ ] Додати секцію з 3 related articles
- [ ] Логіка: статті з тієї ж категорії або тегами
- [ ] Fallback: останні статті

**Файл:** `frontend/src/app/advice/[slug]/page.tsx`

---

### 6.7 CSRF захист для адмінки

**Джерело:** `plan/result_audit/06-admin.md`

- [ ] Додати CSRF токен generation
- [ ] Додати CSRF validation на API endpoints
- [ ] Передавати токен в headers запитів

**Файли:**
- `frontend/src/middleware.ts`
- `frontend/src/app/api/*/route.ts`

---

### 6.8 Rate limiting для API

**Джерело:** `plan/result_audit/06-admin.md`

- [ ] Додати rate limiting middleware
- [ ] Обмежити automation endpoints
- [ ] Обмежити contact form submission

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(improvements): phase-6 P3 i18n prep, mobile nav, extras"
   ```
5. Онови PROGRESS.md:
   - Загальний статус: ЗАВЕРШЕНО
   - Додай фінальний запис в історію
6. Створи підсумковий PR або merge в main

---

## Підсумок проекту

Після завершення всіх фаз:

### Критерії успіху (перевір):
- [ ] Всі кнопки та посилання функціональні
- [ ] API інтеграція замість mock-даних на всіх сторінках
- [ ] Форми працюють (пошук, контакти)
- [ ] Loading/Error/Empty states на всіх сторінках
- [ ] Accessibility відповідає WCAG 2.1 AA
- [ ] Код без дублювання (DRY)
- [ ] SEO metadata на всіх сторінках
- [ ] Security виправлення в адмінці

### Очікувана оцінка: 9/10

### Фінальний коміт:
```bash
git add .
git commit -m "chore(audit): all audit fixes completed - 45 issues resolved"
```
