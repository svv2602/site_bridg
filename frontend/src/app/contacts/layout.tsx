import type { Metadata } from "next";
import { SITE_URL, LOGO_URL_WHITE, getSiteSettingsWithDefaults } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Контакти | Bridgestone Україна",
  description: "Зв'яжіться з офіційним представником Bridgestone в Україні. Email, форма зворотного зв'язку.",
  alternates: {
    canonical: '/contacts',
  },
  openGraph: {
    title: "Контакти | Bridgestone Україна",
    description: "Зв'яжіться з офіційним представником Bridgestone в Україні.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};

export default async function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettingsWithDefaults();

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Контакти Bridgestone Україна",
    description: "Офіційна контактна сторінка Bridgestone в Україні",
    mainEntity: {
      "@type": "Organization",
      name: "Bridgestone Україна",
      url: SITE_URL,
      logo: `${SITE_URL}${LOGO_URL_WHITE}`,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: "Ukrainian",
        areaServed: "UA",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: settings.city,
        addressCountry: settings.country,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      {children}
    </>
  );
}
