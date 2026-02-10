"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageContentProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  backLink?: { href: string; label: string };
  /** Use "h2" when this component renders inside a layout that already has an h1 */
  headingLevel?: "h1" | "h2";
}

export function ErrorPageContent({
  error,
  reset,
  title = "Щось пішло не так",
  description = "Виникла помилка при завантаженні сторінки. Спробуйте оновити сторінку або поверніться на головну.",
  backLink = { href: "/", label: "На головну" },
  headingLevel = "h1",
}: ErrorPageContentProps) {
  const Heading = headingLevel;
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-16" role="alert">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <Heading className="mb-3 text-2xl font-bold text-foreground">{title}</Heading>
        <p className="mb-6 text-stone-500 dark:text-stone-400">{description}</p>
        {process.env.NODE_ENV === "development" && error?.message && (
          <pre className="mb-6 max-h-32 overflow-auto rounded-lg bg-stone-100 p-4 text-left text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            {error.message}
          </pre>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-text transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Спробувати ще раз
          </button>
          <Link
            href={backLink.href}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {backLink.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
