import type { Metadata } from "next";

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
    url: "https://bridgestone.ua",
    logo: "https://bridgestone.ua/bridgestone-logo-white.svg",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+380-800-123-456",
      contactType: "customer service",
      availableLanguage: "Ukrainian",
      areaServed: "UA",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Київ",
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
