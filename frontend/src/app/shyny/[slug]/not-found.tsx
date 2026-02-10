import { NotFoundContent } from "@/components/NotFoundContent";

export default function TyreNotFound() {
  return (
    <NotFoundContent
      title="Шину не знайдено"
      description="На жаль, ця модель шини не знайдена в нашому каталозі."
      suggestedLinks={[
        { href: "/tyre-search", label: "Пошук шин", icon: "search" },
        { href: "/", label: "На головну", icon: "home" },
      ]}
    />
  );
}
