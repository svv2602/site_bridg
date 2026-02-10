import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { AnimatedMain } from "@/components/AnimatedMain";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MainHeader } from "@/components/MainHeader";
import { Footer } from "@/components/Footer";
import { CookiesBanner } from "@/components/CookiesBanner";
import { Analytics } from "@/components/Analytics";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, LOGO_URL_WHITE, PHONE_SCHEMA, PHONE_DISPLAY, SOCIAL_LINKS } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bridgestone Україна — офіційний сайт шин",
    template: "%s | Bridgestone Україна",
  },
  description:
    "Офіційний сайт шин Bridgestone для кінцевих споживачів в Україні. Пошук шин за розміром, за авто, карта дилерів, поради та технології.",
  alternates: {
    canonical: '/',
    languages: {
      'uk': '/',
      'x-default': '/',
    },
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    title: "Bridgestone Україна — офіційний сайт шин",
    description: "Офіційний сайт шин Bridgestone для кінцевих споживачів в Україні. Літні, зимові та всесезонні шини преміум-класу.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
    url: SITE_URL,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bridgestone Україна — офіційний сайт шин',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bridgestone Україна — офіційний сайт шин",
    description: "Офіційний сайт шин Bridgestone для кінцевих споживачів в Україні.",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "Bridgestone Ukraine",
  url: SITE_URL,
  logo: `${SITE_URL}${LOGO_URL_WHITE}`,
  description: SITE_DESCRIPTION,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: PHONE_SCHEMA,
    contactType: "customer service",
    availableLanguage: "Ukrainian",
    areaServed: "UA",
  },
  sameAs: [
    SOCIAL_LINKS.website,
    SOCIAL_LINKS.facebook,
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: "Офіційний сайт шин Bridgestone в Україні",
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/tyre-search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

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
        {/* Skip to main content link for keyboard accessibility (WCAG 2.4.1) */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-text focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Перейти до основного вмісту
        </a>
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
                <Link href="/dealers" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <MapPin className="h-3 w-3" />
                  <span>Знайти дилера поруч</span>
                </Link>
                <div className="hidden items-center gap-1.5 sm:flex text-muted">
                  <Phone className="h-3 w-3" />
                  <span>Гаряча лінія: {PHONE_DISPLAY}</span>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Main header */}
          <MainHeader />

          <AnimatedMain>{children}</AnimatedMain>

          {/* Footer */}
          <Footer />

          {/* Cookies Consent Banner */}
          <CookiesBanner />

          {/* Analytics (GA4 + Meta Pixel) - loads after consent */}
          <Analytics />
        </div>
      </body>
    </html>
  );
}
