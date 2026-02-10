"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Article page error:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="bg-background text-foreground min-h-[60vh] flex items-center justify-center">
      <div className="container mx-auto max-w-lg px-4 text-center">
        <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-10">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
            Помилка завантаження статті
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-6">
            Не вдалося завантажити цю статтю. Спробуйте оновити сторінку або поверніться до блогу.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <p className="text-sm text-red-500 dark:text-red-400 mb-6 font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded break-all">
              {error.message}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Спробувати знову
            </button>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-red-300 dark:border-red-700 px-6 py-3 font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              До блогу
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
