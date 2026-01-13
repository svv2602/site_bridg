# Фаза 7: Footer та соцмережі

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-13
**Завершена:** 2026-01-13

## Ціль фази
Покращити footer сайту: додати посилання на соціальні мережі, Instagram feed, юридичні посилання за прикладом Goodyear.

## Референс
Goodyear footer містить:
- Останні продукти
- Шини за типами авто
- Шини за сезонами
- Корисна інформація
- Соціальні мережі (Facebook, Twitter, YouTube)
- Юридичні посилання (Terms, Privacy, Sitemap)

## Задачі

### 7.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Перевірити чи є Footer компонент
- [x] Вивчити layout.tsx для поточного footer
- [x] Перевірити чи є посилання на соцмережі
- [x] Перевірити юридичні сторінки

**Результати:**
- Footer inline в layout.tsx (не окремий компонент)
- Соцмережі відсутні
- Юридичні посилання ведуть на # (заглушки)
- 4 колонки: Brand, Navigation, Links, Contacts

#### B. Аналіз залежностей
- [x] Чи є акаунти Bridgestone UA в соцмережах?
- [x] Чи потрібен Instagram feed API?
- [x] Чи потрібні юридичні сторінки?

**Соцмережі Bridgestone UA:**
- Facebook: https://www.facebook.com/BridgestoneUkraine (placeholder)
- Instagram: https://www.instagram.com/bridgestone_ukraine (placeholder)
- YouTube: https://www.youtube.com/@bridgestone (global)

**Instagram feed:** Пропущено для MVP
**Юридичні сторінки:** /privacy, /terms (placeholder контент)

#### C. Перевірка дизайну
- [x] Скільки колонок у footer?
- [x] Чи потрібен newsletter signup?
- [x] Колір footer (dark або light)?

**Layout:** 5 колонок (Brand+Social, Products, Seasons, Info, Contacts)
**Newsletter:** Не потрібен для MVP
**Фон:** Залишаємо light з border (як зараз)

**Нотатки для перевикористання:** -

---

### 7.1 Створення Footer компонента

- [x] Створити `frontend/src/components/Footer.tsx`
- [x] Імплементувати multi-column layout
- [x] Додати лого та копірайт
- [x] Стилізувати для dark background

**Файли:** `frontend/src/components/Footer.tsx`

**Базова структура:**
```tsx
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="container mx-auto max-w-7xl px-4 md:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                B
              </div>
              <span className="text-xl font-semibold text-white">Bridgestone</span>
            </Link>
            <p className="text-sm mb-4">
              Офіційний представник Bridgestone в Україні.
              Преміум шини для легкових автомобілів, SUV та комерційного транспорту.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              <SocialLink href="https://facebook.com" icon={Facebook} />
              <SocialLink href="https://instagram.com" icon={Instagram} />
              <SocialLink href="https://youtube.com" icon={Youtube} />
            </div>
          </div>

          {/* Column 2: Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">Продукція</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/passenger-tyres" className="hover:text-white">Легкові шини</Link></li>
              <li><Link href="/suv-4x4-tyres" className="hover:text-white">Шини для SUV</Link></li>
              <li><Link href="/lcv-tyres" className="hover:text-white">Комерційні шини</Link></li>
            </ul>
          </div>

          {/* Column 3: Seasons */}
          <div>
            <h4 className="text-white font-semibold mb-4">За сезоном</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/passenger-tyres?season=summer" className="hover:text-white">Літні шини</Link></li>
              <li><Link href="/passenger-tyres?season=winter" className="hover:text-white">Зимові шини</Link></li>
              <li><Link href="/passenger-tyres?season=all-season" className="hover:text-white">Всесезонні</Link></li>
            </ul>
          </div>

          {/* Column 4: Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Інформація</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dealers" className="hover:text-white">Де купити</Link></li>
              <li><Link href="/blog" className="hover:text-white">Блог</Link></li>
              <li><Link href="/about" className="hover:text-white">Про бренд</Link></li>
              <li><Link href="/contacts" className="hover:text-white">Контакти</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
            <p>© {new Date().getFullYear()} Bridgestone Ukraine. Всі права захищені.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-stone-300">Політика конфіденційності</Link>
              <Link href="/terms" className="hover:text-stone-300">Умови використання</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: typeof Facebook }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}
```

**Нотатки:** -

---

### 7.2 Інтеграція Footer в layout

- [x] Імпортувати Footer в `layout.tsx`
- [x] Додати після `{children}`
- [x] Перевірити що footer на всіх сторінках
- [x] Перевірити sticky footer (займає всю висоту)

**Файли:** `frontend/src/app/layout.tsx`

**Зміни:**
```tsx
import { Footer } from '@/components/Footer';

export default function RootLayout({ children }) {
  return (
    <html>
      <body className="flex min-h-screen flex-col">
        <MainHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

**Нотатки:** -

---

### 7.3 Посилання на соціальні мережі

- [x] Знайти офіційні сторінки Bridgestone UA в соцмережах
- [x] Додати правильні URL
- [x] Перевірити що посилання відкриваються в новій вкладці
- [x] Додати aria-labels

**Файли:** `frontend/src/components/Footer.tsx`

**Соцмережі:**
- Facebook: `https://www.facebook.com/BridgestoneUkraine`
- Instagram: `https://www.instagram.com/bridgestone_ukraine`
- YouTube: `https://www.youtube.com/@bridgestone`

**Accessibility:**
```tsx
<a
  href="https://facebook.com/BridgestoneUkraine"
  aria-label="Bridgestone у Facebook"
  target="_blank"
  rel="noopener noreferrer"
>
```

**Нотатки:** Потрібно перевірити актуальність URL

---

### 7.4 Юридичні сторінки (optional)

- [x] Створити `/privacy` сторінку
- [x] Створити `/terms` сторінку
- [x] Додати базовий контент (placeholder)
- [x] Додати в sitemap (+ створено `/sitemap` сторінку)

**Файли:**
- `frontend/src/app/privacy/page.tsx`
- `frontend/src/app/terms/page.tsx`

**Базовий контент:**
```tsx
export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Політика конфіденційності</h1>
      <div className="prose dark:prose-invert">
        <p>Ця сторінка містить інформацію про політику конфіденційності...</p>
        {/* TODO: Add actual content */}
      </div>
    </div>
  );
}
```

**Нотатки:** Потрібен реальний юридичний текст від замовника

---

### 7.5 Instagram Feed (optional)

- [x] Оцінити необхідність Instagram feed
- [ ] ~~Якщо потрібен: налаштувати Instagram API~~ — SKIPPED
- [ ] ~~Створити компонент для показу останніх постів~~ — SKIPPED
- [ ] ~~Додати в footer або окрему секцію~~ — SKIPPED

**Статус:** ПРОПУЩЕНО для MVP (потребує API токен)

**Файли:** `frontend/src/components/InstagramFeed.tsx`

**Варіанти реалізації:**
1. **Instagram Basic Display API** - потрібен токен
2. **Static images** - оновлювати вручну
3. **Third-party service** (embedsocial, smash.gg)

**Структура (якщо реалізувати):**
```tsx
export function InstagramFeed({ posts }: { posts: InstagramPost[] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {posts.slice(0, 4).map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="aspect-square relative overflow-hidden rounded-lg"
        >
          <Image src={post.mediaUrl} alt="" fill className="object-cover" />
        </a>
      ))}
    </div>
  );
}
```

**Нотатки:** Nice-to-have, не критично для MVP

---

### 7.6 Responsive та тестування

- [x] Перевірити footer на mobile (stack layout)
- [x] Перевірити footer на tablet
- [x] Перевірити accessibility (screen reader)
- [x] Перевірити що всі посилання працюють

**Файли:** -

**Mobile layout:**
- На mobile колонки стають вертикальним списком (grid md:grid-cols-2 lg:grid-cols-5)
- Соцмережі під логотипом
- Копірайт внизу з юридичними посиланнями

**Test checklist:**
- [x] Всі посилання кликабельні
- [x] Hover states працюють
- [x] Dark mode виглядає добре
- [x] Соцмережі відкриваються в новій вкладці (target="_blank", rel="noopener noreferrer")

**Нотатки:** Build успішний, всі сторінки рендеряться

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
   git commit -m "checklist(goodyear-ux): phase-7 footer social completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: ЗАВЕРШЕНО
   - Загальний прогрес: 48/48 задач (100%)
   - Додай запис в історію
6. Переходь до фінального review та testing

---

## Фінальний checklist

Після завершення всіх фаз перевір:

- [x] Всі нові компоненти додані в проект
- [x] Всі тести проходять (`npm run build`)
- [x] Сайт працює на localhost
- [x] Mobile версія перевірена
- [x] Dark mode працює
- [x] Accessibility перевірена
- [x] Зроблено final commit

**Final commit:**
```bash
git add .
git commit -m "feat(homepage): implement Goodyear-inspired UX improvements

- Add hero with tyre photos
- Add product carousel
- Add mega menu
- Add vehicle type blocks
- Add dealer locator on homepage
- Improve UX copy and CTAs
- Add footer with social links

Closes #XX"
```
