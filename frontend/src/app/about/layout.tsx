import type { Metadata } from "next";
import { generateOrganizationSchema } from "@/lib/schema";

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
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Про Bridgestone — офіційний представник в Україні',
      },
    ],
  },
};

const orgSchema = generateOrganizationSchema();
const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Про Bridgestone Україна",
  description: "Офіційна сторінка про компанію Bridgestone в Україні",
  mainEntity: {
    ...orgSchema,
    "@type": "Organization",
    foundingDate: "1931",
    founder: {
      "@type": "Person",
      name: "Shojiro Ishibashi",
    },
    areaServed: "Worldwide",
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
