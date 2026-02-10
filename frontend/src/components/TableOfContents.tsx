"use client";

import { useEffect, useState, useCallback, useRef, useSyncExternalStore } from "react";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  /** CSS selector for the article container where headings are found */
  containerSelector?: string;
  className?: string;
}

function extractHeadings(containerSelector: string): TocItem[] {
  const container = document.querySelector(containerSelector);
  if (!container) return [];

  const headings = container.querySelectorAll("h2, h3");
  const tocItems: TocItem[] = [];

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }
    tocItems.push({
      id: heading.id,
      text: heading.textContent || "",
      level: heading.tagName === "H2" ? 2 : 3,
    });
  });

  return tocItems;
}

/**
 * Hook to subscribe to heading changes in a container via MutationObserver.
 * Uses useSyncExternalStore to avoid synchronous setState in effects.
 */
function useHeadings(containerSelector: string): TocItem[] {
  const itemsRef = useRef<TocItem[]>([]);
  const listenersRef = useRef<Set<() => void>>(new Set());

  const subscribe = useCallback(
    (listener: () => void) => {
      listenersRef.current.add(listener);

      // Set up MutationObserver for DOM changes
      const container = document.querySelector(containerSelector);
      if (container) {
        // Read initial headings
        itemsRef.current = extractHeadings(containerSelector);
        listener();

        const observer = new MutationObserver(() => {
          itemsRef.current = extractHeadings(containerSelector);
          listenersRef.current.forEach((l) => l());
        });
        observer.observe(container, { childList: true, subtree: true });

        return () => {
          observer.disconnect();
          listenersRef.current.delete(listener);
        };
      }

      return () => {
        listenersRef.current.delete(listener);
      };
    },
    [containerSelector],
  );

  const getSnapshot = useCallback(() => itemsRef.current, []);
  const getServerSnapshot = useCallback(() => [] as TocItem[], []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Auto-generated Table of Contents from h2/h3 headings in an article.
 * Uses IntersectionObserver to highlight the currently visible section.
 * Sticky on desktop, collapsible on mobile.
 */
export function TableOfContents({
  containerSelector = "article",
  className = "",
}: TableOfContentsProps) {
  const items = useHeadings(containerSelector);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track which heading is currently in view
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const intersecting = entries.find((entry) => entry.isIntersecting);
      if (intersecting) {
        setActiveId(intersecting.target.id);
      }
    },
    [],
  );

  useEffect(() => {
    if (items.length === 0) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "-80px 0px -70% 0px",
      threshold: 0,
    });

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [items, handleObserver]);

  if (items.length < 2) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      setIsOpen(false);
    }
  };

  return (
    <nav
      className={`rounded-xl border border-border bg-card p-4 ${className}`}
      aria-label="Зміст статті"
    >
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left md:hidden"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <List className="h-4 w-4" />
          Зміст
        </span>
        <span
          className={`text-xs text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          &#9662;
        </span>
      </button>

      {/* Desktop always visible, mobile toggleable */}
      <div className={`${isOpen ? "block" : "hidden"} md:block`}>
        <div className="mb-3 hidden items-center gap-2 text-sm font-semibold md:flex">
          <List className="h-4 w-4" />
          Зміст
        </div>
        <ul className="mt-2 space-y-1 md:mt-0">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  item.level === 3 ? "pl-6" : ""
                } ${
                  activeId === item.id
                    ? "bg-stone-200 font-medium text-stone-900 dark:bg-stone-700 dark:text-stone-100"
                    : "text-muted-foreground hover:bg-stone-100 hover:text-foreground dark:hover:bg-stone-800"
                }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
