import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Порівняння шин | Bridgestone Україна",
  description: "Порівняйте характеристики шин Bridgestone. Оберіть найкращі шини для вашого автомобіля та стилю водіння.",
  alternates: {
    canonical: '/porivnyaty',
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
