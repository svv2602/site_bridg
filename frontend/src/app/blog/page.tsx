import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, Search, X } from "lucide-react";
import { getArticles, getArticleTags } from "@/lib/api/articles";
import { Breadcrumb } from "@/components/ui";

export const metadata: Metadata = {
  title: "Блог — Bridgestone Україна",
  description: "Статті, поради, огляди та новини про шини Bridgestone. Корисна інформація для українських водіїв.",
  openGraph: {
    title: "Блог — Bridgestone Україна",
    description: "Статті, поради, огляди та новини про шини Bridgestone. Корисна інформація для українських водіїв.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};

interface BlogPageProps {
  searchParams: Promise<{ tag?: string; search?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const activeTag = params.tag;
  const searchQuery = params.search;

  const [articles, allTags] = await Promise.all([
    getArticles({ tag: activeTag, search: searchQuery }),
    getArticleTags(),
  ]);

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="hero-dark border-b border-hero-border py-8 md:py-12 hero-grid-pattern">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-4xl text-left">
            <Breadcrumb
              className="mb-2 text-hero-muted [&_a:hover]:text-hero-foreground [&_span]:text-hero-foreground"
              items={[
                { label: "Головна", href: "/" },
                { label: "Блог" },
              ]}
            />
            <h1 className="hero-title mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Блог Bridgestone Україна
              <span className="hero-subtitle mt-1 block text-base font-normal md:text-lg">
                статті, поради, огляди та новини
              </span>
            </h1>
            <p className="hero-text mb-6 max-w-2xl text-sm md:text-base">
              Корисна інформація для водіїв: як обрати шини, результати тестів,
              технології Bridgestone та поради щодо експлуатації.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Tags */}
      <section className="border-b border-border bg-card py-6">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          {/* Search */}
          <form action="/blog" method="GET" className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Пошук статей..."
                className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {activeTag && <input type="hidden" name="tag" value={activeTag} />}
            </div>
          </form>

          {/* Active filters */}
          {(activeTag || searchQuery) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Фільтри:</span>
              {searchQuery && (
                <Link
                  href={activeTag ? `/blog?tag=${activeTag}` : "/blog"}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                >
                  Пошук: &quot;{searchQuery}&quot;
                  <X className="h-3 w-3" />
                </Link>
              )}
              {activeTag && (
                <Link
                  href={searchQuery ? `/blog?search=${searchQuery}` : "/blog"}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                >
                  #{activeTag}
                  <X className="h-3 w-3" />
                </Link>
              )}
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Скинути все
              </Link>
            </div>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                href={searchQuery ? `/blog?search=${searchQuery}` : "/blog"}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  !activeTag
                    ? "bg-primary text-primary-text"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Усі
              </Link>
              {allTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}${searchQuery ? `&search=${searchQuery}` : ""}`}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    activeTag === tag
                      ? "bg-primary text-primary-text"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {activeTag ? `Статті з тегом #${activeTag}` : searchQuery ? `Результати пошуку` : "Усі статті"}
            </h2>
            <span className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
              {articles.length} {articles.length === 1 ? "стаття" : articles.length < 5 ? "статті" : "статей"}
            </span>
          </div>

          {articles.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="mb-2 text-lg font-medium">Статей не знайдено</p>
              <p className="mb-6 text-muted-foreground">
                {searchQuery
                  ? `За запитом "${searchQuery}" нічого не знайдено`
                  : activeTag
                    ? `Статей з тегом #${activeTag} поки немає`
                    : "Статті поки відсутні"}
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary-hover"
              >
                Переглянути всі статті
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <article
                  key={article.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/40" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-2 text-xs text-muted">
                      <Clock className="h-3 w-3" />
                      <span>{article.readingTimeMinutes} хвилин читання</span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold transition-all group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
                      {article.title}
                    </h3>
                    {article.subtitle && (
                      <p className="mb-4 text-sm text-muted-foreground">{article.subtitle}</p>
                    )}
                    <p className="mb-6 flex-1 text-sm text-foreground/80">
                      {article.previewText}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {article.tags?.slice(0, 3).map((tag) => (
                        <Link
                          key={tag}
                          href={`/blog?tag=${encodeURIComponent(tag)}`}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="group/btn mt-auto inline-flex items-center justify-center rounded-full border border-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-text"
                    >
                      Читати статтю
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
          <div className="rounded-3xl bg-graphite p-10 text-white shadow-2xl">
            <h3 className="mb-4 text-3xl font-bold">Не знайшли потрібну інформацію?</h3>
            <p className="mb-8 text-lg opacity-90">
              Задайте питання нашим експертам або знайдіть найближчого дилера.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contacts"
                className="rounded-full bg-white px-8 py-3 font-semibold text-graphite hover:bg-stone-100"
              >
                Задати питання
              </Link>
              <Link
                href="/dealers"
                className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10"
              >
                Знайти дилера
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
