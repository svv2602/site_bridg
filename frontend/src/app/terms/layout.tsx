import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Умови використання | Bridgestone Україна",
  description: "Умови використання офіційного сайту Bridgestone Україна. Правила користування сервісами та інформацією на сайті.",
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
