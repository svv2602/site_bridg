import Link from "next/link";
import { BookOpen, Home, ArrowLeft } from "lucide-react";

/**
 * 404 page for article not found.
 * Shown when getArticleBySlug() returns null and notFound() is called.
 */
export default function ArticleNotFound() {
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
            <BookOpen className="absolute bottom-0 right-0 h-12 w-12 text-primary" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Стаття не знайдена</h1>
          <p className="text-muted-foreground mb-6">
            На жаль, статтю з такою адресою не знайдено.
            Можливо, вона була видалена або посилання застаріло.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-text hover:bg-primary-hover transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Усі статті
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 dark:border-stone-600 px-6 py-3 font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              На головну
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700">
            <p className="text-sm text-muted-foreground mb-3">
              Можливо, вас зацікавить:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/blog"
                className="text-sm text-primary hover:underline"
              >
                Блог
              </Link>
              <span className="text-stone-300 dark:text-stone-600">&#8226;</span>
              <Link
                href="/passenger-tyres"
                className="text-sm text-primary hover:underline"
              >
                Каталог шин
              </Link>
              <span className="text-stone-300 dark:text-stone-600">&#8226;</span>
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
