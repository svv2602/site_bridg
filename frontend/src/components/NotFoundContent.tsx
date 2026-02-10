import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

interface SuggestedLink {
  href: string;
  label: string;
  icon: "home" | "search" | "back";
}

const iconMap = {
  home: Home,
  search: Search,
  back: ArrowLeft,
};

interface NotFoundContentProps {
  title?: string;
  description?: string;
  suggestedLinks?: SuggestedLink[];
}

export function NotFoundContent({
  title = "Сторінку не знайдено",
  description = "На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.",
  suggestedLinks = [
    { href: "/", label: "На головну", icon: "home" },
    { href: "/tyre-search", label: "Пошук шин", icon: "search" },
  ],
}: NotFoundContentProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16" role="alert">
      <div className="max-w-md text-center">
        <p className="mb-4 text-7xl font-bold text-primary">404</p>
        <h1 className="mb-3 text-2xl font-bold text-foreground">{title}</h1>
        <p className="mb-8 text-muted-foreground">{description}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {suggestedLinks.map((link) => {
            const Icon = iconMap[link.icon];
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
