import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Політика конфіденційності | Bridgestone Україна",
  description: "Політика конфіденційності та захисту персональних даних офіційного сайту Bridgestone Україна.",
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
