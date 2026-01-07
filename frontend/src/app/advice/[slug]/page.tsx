import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { getArticleBySlug, getArticles } from "@/lib/api/articles";

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata(
  { params }: ArticlePageProps,
): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Стаття не знайдена — Поради Bridgestone",
    };
  }

  const title =
    // @ts-expect-error: seoTitle/seoDescription закладені в CMS‑моделі, але відсутні в мок‑даних
    article.seoTitle ?? `${article.title} — корисні поради щодо шин Bridgestone`;

  return {
    title,
    description:
      // @ts-expect-error: seoDescription закладене в CMS‑моделі, але відсутнє в мок‑даних
      article.seoDescription ??
      article.previewText ??
      "Корисні поради щодо вибору та експлуатації шин Bridgestone в Україні.",
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12">
        <div className="container mx-auto max-w-4xl px-4 md:px-8">
          <nav className="mb-4 text-xs text-zinc-400">
            <Link href="/" className="hover:text-zinc-100">
              Головна
            </Link>
            <span className="mx-2">/</span>
            <Link href="/advice" className="hover:text-zinc-100">
              Поради
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-zinc-100">
              {article.title}
            </span>
          </nav>
          <Link
            href="/advice"
            className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-zinc-200 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            До всіх статей
          </Link>
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="mb-3 text-sm text-zinc-300 md:text-base">
              {article.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            {article.readingTimeMinutes && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readingTimeMinutes} хвилин читання
              </span>
            )}
            {article.tags && article.tags.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {article.tags.join(", ")}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto max-w-4xl px-4 md:px-8">
          <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary">
            <p className="text-sm text-muted-foreground">
              {article.previewText}
            </p>
            <p className="mt-6 text-[13px] text-muted-foreground">
              Повний текст статті, структуровані підзаголовки та ілюстрації
              будуть підтягуватися з headless CMS відповідно до моделі контенту
              Article (див. CMS_CONTENT_MODEL.md). У цьому прототипі
              використовується короткий текст‑тизер.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}