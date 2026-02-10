import { NotFoundContent } from "@/components/NotFoundContent";

export default function ArticleNotFound() {
  return (
    <NotFoundContent
      title="Статтю не знайдено"
      description="На жаль, ця стаття не знайдена або була видалена."
      suggestedLinks={[
        { href: "/blog", label: "До блогу", icon: "back" },
        { href: "/", label: "На головну", icon: "home" },
      ]}
    />
  );
}
