# Фаза 2: SEO та Metadata (P1-P2)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати generateMetadata() для всіх сторінок, які його не мають, для покращення SEO.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити generateMetadata в `/shyny/[slug]/page.tsx` як референс
- [ ] Вивчити generateMetadata в `/advice/[slug]/page.tsx`
- [ ] Перевірити чи є спільні metadata утиліти

**Команди для пошуку:**
```bash
# Пошук generateMetadata
grep -rn "generateMetadata" frontend/src/app/
# Пошук metadata exports
grep -rn "export const metadata" frontend/src/app/
```

#### B. Сторінки без metadata
- [ ] `/about/page.tsx` - КРИТИЧНО, немає metadata
- [ ] `/passenger-tyres/page.tsx` - немає generateMetadata
- [ ] `/suv-4x4-tyres/page.tsx` - немає generateMetadata  
- [ ] `/lcv-tyres/page.tsx` - немає generateMetadata

**Референс-сторінка:** `frontend/src/app/shyny/[slug]/page.tsx`

**Нотатки для перевикористання:** -

---

### 2.1 Додати metadata для /about

**Файл:** `frontend/src/app/about/page.tsx`

**Проблема:** Сторінка "use client", тому не може мати generateMetadata.

- [ ] Створити окремий файл `about/metadata.ts` або винести metadata в layout
- [ ] АБО: Рефакторити сторінку - винести анімації в окремий client component
- [ ] Додати metadata з title та description

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

- [ ] Реалізувати обраний варіант
- [ ] Перевірити що metadata рендериться

**Нотатки:** -

---

### 2.2 Додати metadata для /passenger-tyres

**Файл:** `frontend/src/app/passenger-tyres/page.tsx`

- [ ] Додати export const metadata або generateMetadata
- [ ] Title: "Легкові шини Bridgestone — Каталог"
- [ ] Description: опис каталогу легкових шин

**Код:**
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Легкові шини Bridgestone — Каталог літніх, зимових та всесезонних шин",
  description: "Широкий вибір легкових шин Bridgestone для вашого автомобіля. Літні, зимові та всесезонні моделі з гарантією якості.",
};
```

**Нотатки:** -

---

### 2.3 Додати metadata для /suv-4x4-tyres

**Файл:** `frontend/src/app/suv-4x4-tyres/page.tsx`

- [ ] Додати export const metadata
- [ ] Title: "Шини для SUV та 4x4 Bridgestone — Каталог"
- [ ] Description: опис шин для позашляховиків

**Код:**
```tsx
export const metadata: Metadata = {
  title: "Шини для SUV та 4x4 Bridgestone — Каталог",
  description: "Шини Bridgestone для позашляховиків та кросоверів. Підвищена прохідність, надійне зчеплення на будь-якому покритті.",
};
```

**Нотатки:** -

---

### 2.4 Додати metadata для /lcv-tyres

**Файл:** `frontend/src/app/lcv-tyres/page.tsx`

- [ ] Додати export const metadata
- [ ] Title: "Шини для легких комерційних авто Bridgestone"
- [ ] Description: опис LCV шин

**Код:**
```tsx
export const metadata: Metadata = {
  title: "Шини для легких комерційних авто (LCV) Bridgestone",
  description: "Комерційні шини Bridgestone для мікроавтобусів та вантажних фургонів. Підвищена вантажопідйомність та довговічність.",
};
```

**Нотатки:** -

---

### 2.5 Перевірити всі metadata

- [ ] Запустити `npm run build`
- [ ] Перевірити що немає помилок
- [ ] Відкрити кожну сторінку та перевірити `<title>` в DevTools

**Нотатки:** -

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
