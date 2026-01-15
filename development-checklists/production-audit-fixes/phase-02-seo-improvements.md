# Фаза 2: SEO Improvements

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Покращити SEO сайту: canonical URLs, Open Graph images, meta descriptions для кращої індексації та відображення в пошуковиках.

---

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити як metadata налаштовані в layout.tsx
- [ ] Перевірити generateMetadata() на динамічних сторінках
- [ ] Знайти OG images якщо існують
- [ ] Перевірити поточні meta descriptions

**Команди для пошуку:**
```bash
# Metadata в layout
grep -n "metadata\|openGraph\|canonical" frontend/src/app/layout.tsx

# generateMetadata функції
grep -rn "generateMetadata" frontend/src/app/

# OG images
ls -la frontend/public/og* frontend/public/images/og* 2>/dev/null || echo "No OG images"

# Meta descriptions
grep -rn "description:" frontend/src/app/
```

#### B. Аналіз структури metadata
- [ ] Чи є базовий metadata в root layout?
- [ ] Чи перезаписують сторінки metadata правильно?
- [ ] Який формат OG images очікується (1200x630)?

**Root metadata location:** -
**OG image format:** 1200x630px recommended
**Current meta structure:** -

#### C. Планування OG image
- [ ] Визначити дизайн OG image (бренд, текст, кольори)
- [ ] Знайти брендові ресурси (логотип, кольори)

**OG image design:** Bridgestone logo + tagline на червоному/темному фоні

**Нотатки для перевикористання:** -

---

### 2.1 Додати canonical URLs

**Проблема:** Жодна сторінка не має canonical URL, що може призвести до duplicate content issues.

**Підзадачі:**
- [ ] Додати canonical URL в root layout.tsx як default
- [ ] Перевірити що динамічні сторінки генерують правильний canonical
- [ ] Перевірити canonical в HTML output

**Файли:** `frontend/src/app/layout.tsx`

**Код для layout.tsx metadata:**
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bridgestone.ua'),
  alternates: {
    canonical: '/',
  },
  // ... existing metadata
}
```

**Для динамічних сторінок (shyny/[slug]):**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    // ... existing
    alternates: {
      canonical: `/shyny/${params.slug}`,
    },
  }
}
```

**Нотатки:** -

---

### 2.2 Створити OG Image

**Проблема:** Відсутній og:image для social media sharing.

**Підзадачі:**
- [ ] Створити дизайн OG image 1200x630px
- [ ] Зберегти як `frontend/public/og-image.jpg` (або .png)
- [ ] Додати в root metadata
- [ ] Перевірити через Facebook/Twitter debugger (на production)

**Файли:**
- `frontend/public/og-image.jpg`
- `frontend/src/app/layout.tsx`

**Metadata update:**
```typescript
openGraph: {
  type: 'website',
  locale: 'uk_UA',
  siteName: 'Bridgestone Україна',
  images: [
    {
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Bridgestone Україна - Офіційний сайт',
    },
  ],
},
twitter: {
  card: 'summary_large_image',
  images: ['/og-image.jpg'],
},
```

**Дизайн OG image:**
- Фон: градієнт Bridgestone червоний (#E32526) → темний
- Лого: Bridgestone logo зліва
- Текст: "Шини Bridgestone" + "Офіційний сайт в Україні"
- Розмір: 1200x630px

**Нотатки:** Можна створити через Figma/Canva або програмно

---

### 2.3 Покращити meta description для Blog

**Проблема:** Meta description на /blog занадто короткий (97 символів, рекомендовано 120-160).

**Підзадачі:**
- [ ] Знайти metadata для /blog
- [ ] Розширити description до 120-160 символів
- [ ] Переконатись що включені ключові слова

**Файли:** `frontend/src/app/blog/page.tsx`

**Поточний description:** ~97 символів
**Новий description:**
```
Блог Bridgestone Україна: поради з вибору шин, огляди новинок, сезонні рекомендації, безпека на дорозі та експертні статті про автомобільні шини.
```
(~150 символів)

**Нотатки:** -

---

### 2.4 Покращити title для Blog

**Проблема:** Title на /blog занадто короткий (26 символів, рекомендовано 30-60).

**Підзадачі:**
- [ ] Знайти metadata для /blog
- [ ] Розширити title до 30-60 символів
- [ ] Включити бренд та ключові слова

**Файли:** `frontend/src/app/blog/page.tsx`

**Поточний title:** ~26 символів
**Новий title:**
```
Блог про шини та автомобілі | Bridgestone Україна
```
(~48 символів)

**Нотатки:** -

---

### 2.5 Додати structured data (JSON-LD)

**Проблема:** Відсутня structured data для rich snippets в Google.

**Підзадачі:**
- [ ] Додати Organization schema в root layout
- [ ] Додати BreadcrumbList schema на внутрішніх сторінках
- [ ] Додати Product schema на сторінках шин (опціонально)

**Файли:** `frontend/src/app/layout.tsx`

**Organization schema:**
```typescript
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Bridgestone Україна',
  url: 'https://bridgestone.ua',
  logo: 'https://bridgestone.ua/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    areaServed: 'UA',
    availableLanguage: 'Ukrainian',
  },
}

// В layout.tsx body:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
/>
```

**Нотатки:** -

---

### 2.6 Перевірка SEO виправлень

**Підзадачі:**
- [ ] Перевірити canonical URL в HTML source
- [ ] Перевірити og:image tag
- [ ] Перевірити meta descriptions через DevTools
- [ ] Валідувати structured data через Google Rich Results Test

**Команди перевірки:**
```bash
# Перевірити meta tags
curl -s http://localhost:3010 | grep -E "canonical|og:image|description"

# Перевірити blog meta
curl -s http://localhost:3010/blog | grep -E "title>|description"

# Перевірити JSON-LD
curl -s http://localhost:3010 | grep -o '<script type="application/ld+json">.*</script>'
```

**Результати тестування:** -

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
   git commit -m "checklist(production-audit): phase-2 SEO improvements completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Загальний прогрес: 15/24 (63%)
   - Додай запис в історію
6. Відкрий `phase-03-accessibility.md` та продовж роботу
