import { NotFoundContent } from "@/components/NotFoundContent";

export default function SeasonNotFound() {
  return (
    <NotFoundContent
      title="Категорію не знайдено"
      description="На жаль, ця категорія шин не знайдена."
      suggestedLinks={[
        { href: "/passenger-tyres", label: "Легкові шини", icon: "back" },
        { href: "/tyre-search", label: "Пошук шин", icon: "search" },
      ]}
    />
  );
}
