import { NotFoundContent } from "@/components/NotFoundContent";

export default function ComparisonNotFound() {
  return (
    <NotFoundContent
      title="Порівняння не знайдено"
      description="На жаль, ця сторінка порівняння не існує."
      suggestedLinks={[
        { href: "/porivnyaty", label: "Порівняння шин", icon: "back" },
        { href: "/tyre-search", label: "Пошук шин", icon: "search" },
      ]}
    />
  );
}
