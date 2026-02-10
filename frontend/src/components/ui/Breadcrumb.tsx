import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  /** Use "hero-dark" when Breadcrumb is placed on an always-dark hero section */
  variant?: "default" | "hero-dark";
}

export function Breadcrumb({ items, className = "", variant = "default" }: BreadcrumbProps) {
  const isHeroDark = variant === "hero-dark";

  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-xs ${isHeroDark ? "text-stone-400" : "text-muted-foreground"} ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={`transition-colors ${isHeroDark ? "hover:text-white" : "hover:text-foreground"}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? `font-medium ${isHeroDark ? "text-stone-200" : "text-foreground"}` : ""}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="mx-1">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
