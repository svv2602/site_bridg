# Фаза 7: Footer та соцмережі

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

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
- [ ] Перевірити чи є Footer компонент
- [ ] Вивчити layout.tsx для поточного footer
- [ ] Перевірити чи є посилання на соцмережі
- [ ] Перевірити юридичні сторінки

**Команди для пошуку:**
```bash
# Footer в layout
grep -n "footer\|Footer" frontend/src/app/layout.tsx

# Існуючий footer компонент
ls frontend/src/components/ | grep -i footer

# Юридичні сторінки
ls frontend/src/app/ | grep -E "privacy|terms|sitemap"
```

#### B. Аналіз залежностей
- [ ] Чи є акаунти Bridgestone UA в соцмережах?
- [ ] Чи потрібен Instagram feed API?
- [ ] Чи потрібні юридичні сторінки?

**Соцмережі Bridgestone UA:**
- Facebook: ?
- Instagram: ?
- YouTube: ?

**Нові сторінки:** /privacy, /terms (якщо немає)

#### C. Перевірка дизайну
- [ ] Скільки колонок у footer?
- [ ] Чи потрібен newsletter signup?
- [ ] Колір footer (dark або light)?

**Layout:** 4-5 колонок на desktop
**Фон:** Dark (stone-900)

**Нотатки для перевикористання:** -

---

### 7.1 Створення Footer компонента

- [ ] Створити `frontend/src/components/Footer.tsx`
- [ ] Імплементувати multi-column layout
- [ ] Додати лого та копірайт
- [ ] Стилізувати для dark background

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

- [ ] Імпортувати Footer в `layout.tsx`
- [ ] Додати після `{children}`
- [ ] Перевірити що footer на всіх сторінках
- [ ] Перевірити sticky footer (займає всю висоту)

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

- [ ] Знайти офіційні сторінки Bridgestone UA в соцмережах
- [ ] Додати правильні URL
- [ ] Перевірити що посилання відкриваються в новій вкладці
- [ ] Додати aria-labels

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

- [ ] Створити `/privacy` сторінку
- [ ] Створити `/terms` сторінку
- [ ] Додати базовий контент (placeholder)
- [ ] Додати в sitemap

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

- [ ] Оцінити необхідність Instagram feed
- [ ] Якщо потрібен: налаштувати Instagram API
- [ ] Створити компонент для показу останніх постів
- [ ] Додати в footer або окрему секцію

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

- [ ] Перевірити footer на mobile (stack layout)
- [ ] Перевірити footer на tablet
- [ ] Перевірити accessibility (screen reader)
- [ ] Перевірити що всі посилання працюють

**Файли:** -

**Mobile layout:**
- На mobile колонки стають вертикальним списком
- Соцмережі по центру
- Копірайт внизу

**Test checklist:**
- [ ] Всі посилання кликабельні
- [ ] Hover states працюють
- [ ] Dark mode виглядає добре
- [ ] Соцмережі відкриваються в новій вкладці

**Нотатки:** -

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

- [ ] Всі нові компоненти додані в проект
- [ ] Всі тести проходять (`npm run build`)
- [ ] Сайт працює на localhost
- [ ] Mobile версія перевірена
- [ ] Dark mode працює
- [ ] Accessibility перевірена
- [ ] Зроблено final commit

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
