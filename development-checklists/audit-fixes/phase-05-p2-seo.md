# Фаза 5: P2 SEO — Metadata та Schema.org

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Покращити SEO на всіх сторінках:
- Додати metadata для сторінок без неї
- Додати Schema.org розмітку
- Перевірити Open Graph теги

---

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз поточного стану SEO
- [ ] Перевірити які сторінки мають metadata
- [ ] Перевірити які сторінки мають Schema.org
- [ ] Вивчити приклад з shyny/[slug] (найкращий)

**Команди для пошуку:**
```bash
# Пошук generateMetadata
grep -rn "generateMetadata" frontend/src/app/
# Пошук Schema.org
grep -rn "application/ld\+json" frontend/src/app/
# Пошук OpenGraph
grep -rn "openGraph" frontend/src/app/
```

#### B. Поточний стан

| Сторінка | Metadata | Schema.org | OpenGraph |
|----------|----------|------------|-----------|
| /shyny/[slug] | OK | OK | ? |
| /advice/[slug] | OK | OK | ? |
| /porivnyaty/[slug] | OK | OK | ? |
| /advice | Ні | Ні | Ні |
| /technology | Ні | Ні | Ні |
| /contacts | Ні | Ні | Ні |
| /about | ? | Ні | Ні |
| / (головна) | ? | Ні | Ні |

**Нотатки для перевикористання:** -

---

### 5.1 /advice — додати metadata

- [ ] Конвертувати в Server Component (якщо ще ні)
- [ ] Додати `export const metadata` або `generateMetadata`
- [ ] Додати title, description
- [ ] Додати OpenGraph теги

**Файл:** `frontend/src/app/advice/page.tsx`

**Приклад:**
```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Корисні поради | Bridgestone Україна',
  description: 'Поради щодо вибору та експлуатації шин Bridgestone. Дізнайтеся як обрати правильні шини для вашого автомобіля.',
  openGraph: {
    title: 'Корисні поради | Bridgestone Україна',
    description: 'Поради щодо вибору та експлуатації шин Bridgestone',
    type: 'website',
    locale: 'uk_UA',
    siteName: 'Bridgestone Україна',
  },
};
```

---

### 5.2 /technology — додати metadata та Schema.org

- [ ] Додати metadata (title, description, OpenGraph)
- [ ] Додати Schema.org TechArticle або ItemList

**Файл:** `frontend/src/app/technology/page.tsx`

**Приклад Schema.org:**
```tsx
const schemaData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Технології Bridgestone",
  "description": "Інноваційні технології шин Bridgestone",
  "itemListElement": technologies.map((tech, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "TechArticle",
      "name": tech.name,
      "description": tech.description,
    }
  }))
};
```

---

### 5.3 /contacts — додати metadata та Schema.org

- [ ] Додати metadata (title, description, OpenGraph)
- [ ] Додати Schema.org ContactPage
- [ ] Додати Schema.org Organization з контактними даними

**Файл:** `frontend/src/app/contacts/page.tsx`

**Приклад:**
```tsx
export const metadata: Metadata = {
  title: "Контакти | Bridgestone Україна",
  description: "Зв'яжіться з офіційним представником Bridgestone в Україні. Телефон, email, форма зворотнього зв'язку.",
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Контакти Bridgestone Україна",
  "mainEntity": {
    "@type": "Organization",
    "name": "Bridgestone Україна",
    "url": "https://bridgestone.ua",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+380-800-123-456",
      "contactType": "customer service",
      "availableLanguage": "Ukrainian"
    }
  }
};
```

---

### 5.4 /about — додати/оновити metadata

- [ ] Перевірити наявність metadata
- [ ] Додати/оновити title, description, OpenGraph
- [ ] Додати Schema.org Organization з AboutPage

**Файл:** `frontend/src/app/about/page.tsx`

---

### 5.5 Головна сторінка — Schema.org Organization

**Джерело:** `plan/result_audit/01-home.md`

- [ ] Додати Schema.org Organization
- [ ] Додати Schema.org WebSite з SearchAction
- [ ] Перевірити OpenGraph теги

**Приклад:**
```tsx
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Bridgestone Україна",
  "url": "https://bridgestone.ua",
  "logo": "https://bridgestone.ua/logo.png",
  "sameAs": [
    "https://www.facebook.com/BridgestoneUkraine",
    "https://www.instagram.com/bridgestone_ukraine"
  ]
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Bridgestone Україна",
  "url": "https://bridgestone.ua",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://bridgestone.ua/tyre-search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};
```

---

### 5.6 /dealers — перевірити Schema.org

- [ ] Перевірити наявність Schema.org
- [ ] Оновити LocalBusiness schema якщо потрібно
- [ ] Додати OpenGraph якщо відсутній

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(seo): phase-5 P2 metadata and Schema.org"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 6
   - Додай запис в історію
6. Відкрий `phase-06-p3-improvements.md` та продовж роботу
