import Link from 'next/link';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';

const productLinks = [
  { href: '/passenger-tyres', label: 'Легкові шини' },
  { href: '/suv-4x4-tyres', label: 'Шини для SUV' },
  { href: '/lcv-tyres', label: 'Комерційні шини' },
  { href: '/tyre-search', label: 'Пошук шин' },
];

const seasonLinks = [
  { href: '/passenger-tyres/summer', label: 'Літні шини' },
  { href: '/passenger-tyres/winter', label: 'Зимові шини' },
  { href: '/passenger-tyres/all-season', label: 'Всесезонні шини' },
];

const infoLinks = [
  { href: '/dealers', label: 'Де купити' },
  { href: '/blog', label: 'Блог' },
  { href: '/about', label: 'Про бренд' },
  { href: '/contacts', label: 'Контакти' },
  { href: '/technology', label: 'Технології' },
];

const socialLinks = [
  {
    href: 'https://www.facebook.com/BridgestoneUkraine',
    label: 'Bridgestone у Facebook',
    icon: Facebook,
  },
  {
    href: 'https://www.instagram.com/bridgestone_ukraine',
    label: 'Bridgestone в Instagram',
    icon: Instagram,
  },
  {
    href: 'https://www.youtube.com/@bridgestone',
    label: 'Bridgestone на YouTube',
    icon: Youtube,
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-stone-50 dark:bg-stone-900">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Brand & Social */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
                B
              </div>
              <div>
                <h3 className="text-lg font-bold">Bridgestone <span className="text-[#FF6600]">&</span> Firestone</h3>
                <p className="text-xs text-muted-foreground">Офіційний представник в Україні</p>
              </div>
            </Link>
            <p className="mb-6 text-sm text-muted-foreground">
              Офіційний представник Bridgestone та Firestone в Україні. Шини преміум та оптимальної
              цінової категорії для легкових авто, SUV та комерційного транспорту.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="rounded-full bg-stone-200 p-2.5 text-stone-600 transition-colors hover:bg-primary hover:text-white dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-primary"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Products */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Продукція
            </h4>
            <ul className="space-y-2 text-sm">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Seasons */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              За сезоном
            </h4>
            <ul className="space-y-2 text-sm">
              {seasonLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-wide">
              Інформація
            </h4>
            <ul className="space-y-2 text-sm">
              {infoLinks.slice(0, 3).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contacts */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Контакти
            </h4>
            <address className="not-italic text-sm text-muted-foreground">
              <div className="mb-4 flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Гаряча лінія:</p>
                  <a
                    href="tel:+380800123456"
                    className="text-lg font-bold text-foreground hover:text-primary"
                  >
                    0 800 123 456
                  </a>
                </div>
              </div>

              <div className="mb-4 flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Email:</p>
                  <a
                    href="mailto:support@bridgestone.ua"
                    className="text-foreground hover:text-primary"
                  >
                    support@bridgestone.ua
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Графік роботи:</p>
                  <p>Пн-Пт 9:00-18:00</p>
                </div>
              </div>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
            <p>
              &copy; {new Date().getFullYear()} Bridgestone Ukraine. Усі права захищені.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/privacy" className="hover:text-primary">
                Політика конфіденційності
              </Link>
              <Link href="/terms" className="hover:text-primary">
                Умови використання
              </Link>
              <Link href="/sitemap" className="hover:text-primary">
                Карта сайту
              </Link>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground/60">
            Цей сайт є демонстраційним макетом та не належить компанії Bridgestone.
          </p>
        </div>
      </div>
    </footer>
  );
}
