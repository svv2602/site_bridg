'use client';

import { useEffect } from 'react';

/**
 * Global Error Boundary
 *
 * This catches errors in the root layout, which regular error.tsx cannot catch.
 * Must render its own <html> and <body> tags since the root layout has errored.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console and potentially to error tracking service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="uk">
      <body className="bg-stone-50 text-stone-900">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
              <svg
                className="mx-auto h-16 w-16 text-red-500 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h1 className="text-2xl font-bold text-red-800 mb-2">
                Критична помилка
              </h1>
              <p className="text-red-600 mb-6">
                Виникла серйозна помилка в роботі сайту. Ми вже працюємо над її
                виправленням.
              </p>
              {process.env.NODE_ENV === 'development' && error.message && (
                <p className="text-sm text-red-500 mb-6 font-mono bg-red-100 p-2 rounded break-all">
                  {error.message}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Спробувати знову
                </button>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-red-300 px-6 py-3 font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  На головну
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
