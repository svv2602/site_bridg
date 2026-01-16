import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

/**
 * 404 Not Found Page
 *
 * Displayed when a user navigates to a page that doesn't exist.
 */
export default function NotFound() {
  return (
    <div className="bg-background text-foreground min-h-[60vh] flex items-center justify-center">
      <div className="container mx-auto max-w-lg px-4 text-center">
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-card p-10">
          {/* 404 Icon */}
          <div className="relative mx-auto mb-6 h-32 w-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl font-bold text-stone-200 dark:text-stone-700">
                404
              </span>
            </div>
            <Search className="absolute bottom-0 right-0 h-12 w-12 text-primary" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Сторінку не знайдено</h1>
          <p className="text-muted-foreground mb-6">
            На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-text hover:bg-primary-hover transition-colors"
            >
              <Home className="h-4 w-4" />
              На головну
            </Link>
            <Link
              href="/shyny"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 dark:border-stone-600 px-6 py-3 font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              Каталог шин
            </Link>
          </div>

          {/* Helpful links */}
          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700">
            <p className="text-sm text-muted-foreground mb-3">
              Можливо, ви шукали:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/passenger-tyres"
                className="text-sm text-primary hover:underline"
              >
                Легкові шини
              </Link>
              <span className="text-stone-300 dark:text-stone-600">•</span>
              <Link
                href="/dealers"
                className="text-sm text-primary hover:underline"
              >
                Дилери
              </Link>
              <span className="text-stone-300 dark:text-stone-600">•</span>
              <Link
                href="/blog"
                className="text-sm text-primary hover:underline"
              >
                Блог
              </Link>
              <span className="text-stone-300 dark:text-stone-600">•</span>
              <Link
                href="/contacts"
                className="text-sm text-primary hover:underline"
              >
                Контакти
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
