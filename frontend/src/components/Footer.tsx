import Link from 'next/link';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { getSiteSettingsWithDefaults } from '@/lib/constants';

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
    color: 'text-[#1877F2]',
  },
  {
    href: 'https://www.instagram.com/bridgestone_ukraine',
    label: 'Bridgestone в Instagram',
    icon: Instagram,
    color: 'text-[#E4405F]',
  },
  {
    href: 'https://www.youtube.com/@bridgestone',
    label: 'Bridgestone на YouTube',
    icon: Youtube,
    color: 'text-[#FF0000]',
  },
];

export async function Footer() {
  const settings = await getSiteSettingsWithDefaults();
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
                <div className="heading-3 text-lg font-bold">Bridgestone <span className="text-[#FF6600]">&</span> Firestone</div>
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
                  className="flex items-center justify-center rounded-full bg-stone-200 p-3 min-w-11 min-h-11 transition-colors hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700"
                >
                  <social.icon className={`h-5 w-5 ${social.color}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Products */}
          <div>
            <div className="heading-4 mb-4 text-sm font-semibold uppercase tracking-wide">
              Продукція
            </div>
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
            <div className="heading-4 mb-4 text-sm font-semibold uppercase tracking-wide">
              За сезоном
            </div>
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

            <div className="heading-4 mb-4 mt-6 text-sm font-semibold uppercase tracking-wide">
              Інформація
            </div>
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
            <div className="heading-4 mb-4 text-sm font-semibold uppercase tracking-wide">
              Контакти
            </div>
            <address className="not-italic text-sm text-muted-foreground">
              <div className="mb-4 flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Гаряча лінія:</p>
                  <a
                    href={settings.phoneHref}
                    className="text-lg font-bold text-foreground hover:text-primary"
                  >
                    {settings.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="mb-4 flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Email:</p>
                  <a
                    href={`mailto:${settings.emailSupport}`}
                    className="text-foreground hover:text-primary"
                  >
                    {settings.emailSupport}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Графік роботи:</p>
                  <p>{settings.workingHours}</p>
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
              <Link href="/karta-saitu" className="hover:text-primary">
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
