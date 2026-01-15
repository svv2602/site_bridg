import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Карта сайту | Bridgestone Україна',
  description: 'Карта сайту Bridgestone Україна - всі сторінки',
};

const sitemapSections = [
  {
    title: 'Головні сторінки',
    links: [
      { href: '/', label: 'Головна' },
      { href: '/about', label: 'Про бренд Bridgestone' },
      { href: '/contacts', label: 'Контакти' },
    ],
  },
  {
    title: 'Каталог шин',
    links: [
      { href: '/passenger-tyres', label: 'Шини для легкових авто' },
      { href: '/suv-4x4-tyres', label: 'Шини для SUV та 4x4' },
      { href: '/lcv-tyres', label: 'Комерційні шини' },
      { href: '/tyre-search', label: 'Пошук шин' },
    ],
  },
  {
    title: 'За сезоном',
    links: [
      { href: '/passenger-tyres/summer', label: 'Літні шини' },
      { href: '/passenger-tyres/winter', label: 'Зимові шини' },
      { href: '/passenger-tyres/all-season', label: 'Всесезонні шини' },
    ],
  },
  {
    title: 'Інформація',
    links: [
      { href: '/dealers', label: 'Де купити (дилери)' },
      { href: '/blog', label: 'Блог' },
      { href: '/technology', label: 'Технології Bridgestone' },
    ],
  },
  {
    title: 'Юридична інформація',
    links: [
      { href: '/privacy', label: 'Політика конфіденційності' },
      { href: '/terms', label: 'Умови використання' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="bg-background py-12">
      <div className="container mx-auto max-w-4xl px-4 md:px-8">
        <h1 className="mb-8 text-3xl font-bold md:text-4xl">Карта сайту</h1>

        <div className="grid gap-8 md:grid-cols-2">
          {sitemapSections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-4 text-lg font-semibold">{section.title}</h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
