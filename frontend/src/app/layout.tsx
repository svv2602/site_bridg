import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { MapPin, Phone, ChevronRight } from "lucide-react";
import { AnimatedMain } from "@/components/AnimatedMain";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MainHeader } from "@/components/MainHeader";
import { CookiesBanner } from "@/components/CookiesBanner";
import { Analytics } from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bridgestone Україна — офіційний сайт шин",
  description:
    "Офіційний сайт шин Bridgestone для кінцевих споживачів в Україні. Пошук шин за розміром, за авто, карта дилерів, поради та технології.",
  openGraph: {
    title: "Bridgestone Україна — офіційний сайт шин",
    description: "Офіційний сайт шин Bridgestone для кінцевих споживачів в Україні.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
    url: "https://bridgestone.ua",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bridgestone Україна",
  alternateName: "Bridgestone Ukraine",
  url: "https://bridgestone.ua",
  logo: "https://bridgestone.ua/bridgestone-logo-white.svg",
  description: "Офіційний представник Bridgestone в Україні. Шини для легкових авто, SUV та комерційного транспорту.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+380-800-123-456",
    contactType: "customer service",
    availableLanguage: "Ukrainian",
    areaServed: "UA",
  },
  sameAs: [
    "https://www.bridgestone.com",
    "https://www.facebook.com/BridgestoneUkraine",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Bridgestone Україна",
  url: "https://bridgestone.ua",
  description: "Офіційний сайт шин Bridgestone в Україні",
  publisher: {
    "@type": "Organization",
    name: "Bridgestone Україна",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://bridgestone.ua/tyre-search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const mainNav = [
  { href: "/passenger-tyres", label: "Легкові шини", icon: "🚗" },
  { href: "/suv-4x4-tyres", label: "Шини для SUV", icon: "🚙" },
  { href: "/lcv-tyres", label: "Комерційні шини", icon: "🚐" },
  { href: "/tyre-search", label: "Пошук шин", icon: "🔍" },
  { href: "/dealers", label: "Де купити", icon: "📍" },
  { href: "/about", label: "Бренд", icon: "🌟" },
  { href: "/blog", label: "Блог", icon: "📚" },
  { href: "/contacts", label: "Контакти", icon: "📞" },
];

const footerLinks = [
  { label: "Політика конфіденційності", href: "#" },
  { label: "Умови використання", href: "#" },
  { label: "Карта сайту", href: "#" },
  { label: "Повернення та гарантія", href: "#" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <div className="flex min-h-screen flex-col">
          {/* Top bar */}
          <div className="border-b border-border bg-card text-xs">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:px-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  <span>Знайти дилера поруч</span>
                </div>
                <div className="hidden items-center gap-1.5 sm:flex text-muted">
                  <Phone className="h-3 w-3" />
                  <span>Гаряча лінія: 0 800 123 456</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <div className="flex items-center gap-2">
                  <Link href="#" className="hover:text-primary">
                    UA
                  </Link>
                  <span className="text-muted">|</span>
                  <Link href="#" className="hover:text-primary">
                    EN
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main header */}
          <MainHeader />

          <AnimatedMain>{children}</AnimatedMain>

          {/* Footer */}
          <footer className="border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
              <div className="grid gap-8 md:grid-cols-4">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
                      B
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Bridgestone</h3>
                      <p className="text-xs text-muted">Україна</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted">
                    Офіційний сайт шин Bridgestone для кінцевих споживачів в Україні.
                    Пошук шин, каталог, дилери, поради.
                  </p>
                </div>

                <div>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                    Навігація
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {mainNav.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2 text-muted hover:text-primary"
                        >
                          <ChevronRight className="h-3 w-3" />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                    Корисні посилання
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {footerLinks.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-muted hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                    Контакти
                  </h4>
                  <address className="not-italic text-sm text-muted">
                    <p className="mb-2">Гаряча лінія:</p>
                    <p className="text-lg font-bold text-primary">
                      0 800 123 456
                    </p>
                    <p className="mt-4">Пн‑Пт 9:00–18:00</p>
                    <p className="mt-2">support@bridgestone.ua</p>
                  </address>
                </div>
              </div>

              <div className="mt-12 border-t border-border pt-8 text-center text-xs text-muted">
                <p>
                  © {new Date().getFullYear()} Bridgestone. Усі права захищені.
                  Сайт створено для кінцевих споживачів в Україні.
                </p>
                <p className="mt-2">
                  Цей сайт є демонстраційним макетом та не належить компанії
                  Bridgestone.
                </p>
              </div>
            </div>
          </footer>

          {/* Cookies Consent Banner */}
          <CookiesBanner />

          {/* Analytics (GA4 + Meta Pixel) - loads after consent */}
          <Analytics />
        </div>
      </body>
    </html>
  );
}
