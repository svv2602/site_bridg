import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Пошук шин | Bridgestone Україна",
  description: "Знайдіть ідеальні шини Bridgestone для вашого автомобіля. Пошук за розміром або за маркою та моделлю авто.",
  alternates: {
    canonical: '/tyre-search',
  },
};

export default function TyreSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
