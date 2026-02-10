import type { Metadata } from "next";
import { NotFoundContent } from "@/components/NotFoundContent";

export const metadata: Metadata = {
  title: "Сторінку не знайдено",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <NotFoundContent
      suggestedLinks={[
        { href: "/", label: "На головну", icon: "home" },
        { href: "/tyre-search", label: "Пошук шин", icon: "search" },
      ]}
    />
  );
}
