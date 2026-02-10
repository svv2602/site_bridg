import type { Metadata } from "next";
import { PHONE_SCHEMA, SITE_URL, LOGO_URL_WHITE, ADDRESS_CITY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Контакти | Bridgestone Україна",
  description: "Зв'яжіться з офіційним представником Bridgestone в Україні. Телефон гарячої лінії, email, форма зворотного зв'язку.",
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
      telephone: PHONE_SCHEMA,
      contactType: "customer service",
      availableLanguage: "Ukrainian",
      areaServed: "UA",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: ADDRESS_CITY,
      addressCountry: "UA",
    },
  },
};

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
