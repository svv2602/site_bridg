import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, Tag, ArrowRight, Search, Filter } from "lucide-react";
import { getArticles } from "@/lib/api/articles";
import { Breadcrumb } from "@/components/ui";

export const metadata: Metadata = {
  title: "Корисна інформація та поради — Bridgestone Україна",
  description: "Технічні статті та практичні рекомендації щодо вибору та експлуатації шин Bridgestone для реальних умов в Україні.",
  openGraph: {
    title: "Корисна інформація та поради — Bridgestone Україна",
    description: "Технічні статті та практичні рекомендації щодо вибору та експлуатації шин Bridgestone для реальних умов в Україні.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};

const categories = [
  { label: "Вибір шин", count: 12, icon: Search, slug: "vybir-shyn" },
  { label: "Експлуатація", count: 8, icon: BookOpen, slug: "ekspluatatsiya" },
  { label: "Технічне обслуговування", count: 5, icon: Filter, slug: "tekhnichne-obsluhovuvannya" },
  { label: "Безпека", count: 7, icon: Tag, slug: "bezpeka" },
];

export default async function AdvicePage() {
  const articles = await getArticles();

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-4xl text-left text-zinc-50">
            <Breadcrumb
              className="mb-2"
              items={[
                { label: "Головна", href: "/" },
                { label: "Корисна інформація та поради" },
              ]}
            />
            <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Корисна інформація та поради щодо шин Bridgestone
              <span className="mt-1 block text-base font-normal text-zinc-300 md:text-lg">
                технічні статті та практичні рекомендації для реальних умов експлуатації в Україні
              </span>
            </h1>
            <p className="mb-6 max-w-2xl text-sm text-zinc-300 md:text-base">
              У цьому розділі зібрані матеріали, які допоможуть обрати шини, правильно їх експлуатувати та
              обслуговувати. Стиль оформлення узгоджений з технічними сторінками пошуку шин і дилерів.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#articles"
                className="rounded-full bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white"
              >
                Популярні статті
              </a>
              <a
                href="#categories"
                className="rounded-full border border-zinc-500 bg-transparent px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
              >
                Всі категорії
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-8 text-3xl font-bold text-center">Оберіть категорію</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={`/advice?category=${cat.slug}`}
                className="group rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-lg hover:border-primary/30"
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <cat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{cat.label}</h3>
                <p className="text-sm text-muted-foreground">{cat.count} статей</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Перейти <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section id="articles" className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Останні статті</h2>
            <div className="flex gap-2">
              <span className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
                {articles.length} статей
              </span>
            </div>
          </div>
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
              <p className="text-muted-foreground">Статті поки відсутні</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <article
                  key={article.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/40" aria-hidden="true" />
                    </div>
                    <div className="absolute top-4 left-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white">
                      Стаття
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-2 text-xs text-muted">
                      <Clock className="h-3 w-3" />
                      <span>{article.readingTimeMinutes} хвилин читання</span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.subtitle && (
                      <p className="mb-4 text-sm text-muted-foreground">{article.subtitle}</p>
                    )}
                    <p className="mb-6 text-sm text-foreground/80 flex-1">
                      {article.previewText}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {article.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/advice/${article.slug}`}
                      className="group/btn mt-auto inline-flex items-center justify-between rounded-full border border-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white"
                    >
                      <span>Читати статтю</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-10 text-white shadow-2xl">
            <h3 className="mb-4 text-3xl font-bold">Не знайшли потрібну інформацію?</h3>
            <p className="mb-8 text-lg opacity-90">
              Задайте питання нашим експертам або перегляньте повну базу знань у розділі допомоги.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contacts"
                className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100"
              >
                Задати питання
              </Link>
              <Link
                href="/faq"
                className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10"
              >
                База знань
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
