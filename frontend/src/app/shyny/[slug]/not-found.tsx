import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";

/**
 * 404 page for tyre model not found.
 * Shown when getTyreModelBySlug() returns null and notFound() is called.
 */
export default function TyreNotFound() {
  return (
    <div className="bg-background text-foreground min-h-[60vh] flex items-center justify-center">
      <div className="container mx-auto max-w-lg px-4 text-center">
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-card p-10">
          <div className="relative mx-auto mb-6 h-32 w-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl font-bold text-stone-200 dark:text-stone-700">
                404
              </span>
            </div>
            <Search className="absolute bottom-0 right-0 h-12 w-12 text-primary" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Модель шини не знайдена</h1>
          <p className="text-muted-foreground mb-6">
            На жаль, шину з такою назвою не знайдено в нашому каталозі.
            Можливо, вона була видалена або назва змінилася.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/passenger-tyres"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-text hover:bg-primary-hover transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Каталог шин
            </Link>
            <Link
              href="/tyre-search"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 dark:border-stone-600 px-6 py-3 font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              Пошук шин
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700">
            <p className="text-sm text-muted-foreground mb-3">
              Або поверніться на головну сторінку:
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Home className="h-4 w-4" />
              Головна сторінка
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
