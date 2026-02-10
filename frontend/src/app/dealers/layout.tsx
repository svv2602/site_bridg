import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Де купити шини Bridgestone — офіційні дилери в Україні",
  description:
    "Пошук офіційних дилерів та сервісних партнерів Bridgestone в Україні: фільтр за містом, адресою та типом точки. Карта дилерів та контакти.",
  alternates: {
    canonical: '/dealers',
  },
  openGraph: {
    title: "Де купити шини Bridgestone — офіційні дилери в Україні",
    description: "Пошук офіційних дилерів та сервісних партнерів Bridgestone в Україні. Карта дилерів та контакти.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};

export default function DealersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
