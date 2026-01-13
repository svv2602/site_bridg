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
