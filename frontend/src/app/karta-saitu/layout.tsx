import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Карта сайту | Bridgestone Україна",
  description: "Карта сайту Bridgestone Україна. Швидкий доступ до всіх розділів офіційного сайту.",
  alternates: {
    canonical: '/karta-saitu',
  },
};

export default function SitemapPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
