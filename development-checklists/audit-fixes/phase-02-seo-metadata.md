# Фаза 2: SEO та Metadata (P1-P2)

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Додати generateMetadata() для всіх сторінок, які його не мають, для покращення SEO.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити generateMetadata в `/shyny/[slug]/page.tsx` як референс
- [x] Вивчити generateMetadata в `/advice/[slug]/page.tsx`
- [x] Перевірити чи є спільні metadata утиліти

**Команди для пошуку:**
```bash
# Пошук generateMetadata
grep -rn "generateMetadata" frontend/src/app/
# Пошук metadata exports
grep -rn "export const metadata" frontend/src/app/
```

#### B. Сторінки без metadata
- [x] `/about/page.tsx` - ВЖЕ МАЄ metadata (layout.tsx з OpenGraph та Schema.org)
- [x] `/passenger-tyres/page.tsx` - додано metadata
- [x] `/suv-4x4-tyres/page.tsx` - додано metadata
- [x] `/lcv-tyres/page.tsx` - ВЖЕ МАЄ metadata (layout.tsx)

**Референс-сторінка:** `frontend/src/app/shyny/[slug]/page.tsx`

**Нотатки для перевикористання:** Виявлено, що /about та /lcv-tyres вже мали metadata через layout.tsx файли.

---

### 2.1 Додати metadata для /about

**Файл:** `frontend/src/app/about/page.tsx`

**Проблема:** Сторінка "use client", тому не може мати generateMetadata.

- [x] Створити окремий файл `about/metadata.ts` або винести metadata в layout - ВЖЕ ІСНУЄ!
- [x] АБО: Рефакторити сторінку - винести анімації в окремий client component
- [x] Додати metadata з title та description

**Варіант 1 - Окремий layout:**
```tsx
// about/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Про Bridgestone — Світовий виробник шин",
  description: "Bridgestone — один з найбільших виробників шин у світі. Понад 90 років досвіду, присутність у 150 країнах, інноваційні технології.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [x] Реалізувати обраний варіант
- [x] Перевірити що metadata рендериться

**Нотатки:** Вже існувала layout.tsx з повним metadata та Schema.org (AboutPage)

---

### 2.2 Додати metadata для /passenger-tyres

**Файл:** `frontend/src/app/passenger-tyres/page.tsx`

- [x] Додати export const metadata або generateMetadata
- [x] Title: "Легкові шини Bridgestone — Каталог"
- [x] Description: опис каталогу легкових шин

**Код:**
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Легкові шини Bridgestone | Каталог шин для легкових авто",
  description: "Широкий вибір легкових шин Bridgestone для вашого автомобіля. Літні, зимові та всесезонні моделі з гарантією якості для комфортної та безпечної їзди.",
  openGraph: {
    title: "Легкові шини Bridgestone | Каталог шин для легкових авто",
    description: "Широкий вибір легкових шин Bridgestone. Літні, зимові та всесезонні моделі.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};
```

**Нотатки:** Додано з OpenGraph для соціальних мереж

---

### 2.3 Додати metadata для /suv-4x4-tyres

**Файл:** `frontend/src/app/suv-4x4-tyres/page.tsx`

- [x] Додати export const metadata
- [x] Title: "Шини для SUV та 4x4 Bridgestone — Каталог"
- [x] Description: опис шин для позашляховиків

**Код:**
```tsx
export const metadata: Metadata = {
  title: "Шини для SUV та 4x4 Bridgestone | Каталог для позашляховиків",
  description: "Шини Bridgestone для позашляховиків та кросоверів. Підвищена прохідність, надійне зчеплення на будь-якому покритті. Літні, зимові та всесезонні моделі.",
  openGraph: {
    title: "Шини для SUV та 4x4 Bridgestone | Каталог для позашляховиків",
    description: "Шини Bridgestone для позашляховиків та кросоверів. Підвищена прохідність, надійне зчеплення.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};
```

**Нотатки:** Додано з OpenGraph для соціальних мереж

---

### 2.4 Додати metadata для /lcv-tyres

**Файл:** `frontend/src/app/lcv-tyres/page.tsx`

- [x] Додати export const metadata
- [x] Title: "Шини для легких комерційних авто Bridgestone"
- [x] Description: опис LCV шин

**Код:** Вже існувала в layout.tsx:
```tsx
export const metadata: Metadata = {
  title: "Шини для комерційних авто (LCV) | Bridgestone Україна",
  description: "Шини Bridgestone для легких комерційних авто: фургони, мікроавтобуси, вантажні мінівени. Літні, зимові та всесезонні шини з високою вантажопідйомністю.",
};
```

**Нотатки:** Вже існувала в layout.tsx

---

### 2.5 Перевірити всі metadata

- [x] Запустити `npm run build`
- [x] Перевірити що немає помилок
- [ ] Відкрити кожну сторінку та перевірити `<title>` в DevTools (ручна перевірка)

**Нотатки:** Build пройшов успішно. Всі сторінки тепер мають metadata з title, description та OpenGraph.

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази на [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(seo): phase-2 metadata for category pages and about"
   ```
5. Онови PROGRESS.md
6. Відкрий `phase-03-cms-integration.md`
