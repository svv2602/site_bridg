import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Про Bridgestone | Офіційний представник в Україні",
  description: "Bridgestone — світовий лідер у виробництві шин. Понад 90 років інновацій та якості. Дізнайтеся про історію, цінності та технології компанії.",
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: "Про Bridgestone | Офіційний представник в Україні",
    description: "Bridgestone — світовий лідер у виробництві шин. Понад 90 років інновацій та якості.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Про Bridgestone Україна",
  description: "Офіційна сторінка про компанію Bridgestone в Україні",
  mainEntity: {
    "@type": "Organization",
    name: "Bridgestone",
    alternateName: "Bridgestone Corporation",
    url: "https://bridgestone.ua",
    logo: "https://bridgestone.ua/bridgestone-logo-white.svg",
    foundingDate: "1931",
    founder: {
      "@type": "Person",
      name: "Shojiro Ishibashi",
    },
    description: "Світовий лідер у виробництві шин з понад 90-річною історією інновацій",
    areaServed: "Worldwide",
    sameAs: [
      "https://www.bridgestone.com",
      "https://www.facebook.com/BridgestoneUkraine",
    ],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      {children}
    </>
  );
}
