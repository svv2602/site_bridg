import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { getArticleBySlug, getArticles } from "@/lib/api/articles";
import { generateArticleSchema, generateBreadcrumbSchema, jsonLdScript } from "@/lib/schema";
import { Breadcrumb } from "@/components/ui";
import { LexicalRenderer } from "@/components/LexicalRenderer";
import ShareButtons from "@/components/ShareButtons";
import { getSiteUrl } from "@/lib/utils/tyres";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
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
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

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
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/advice/${article.slug}`;

  const articleSchema = generateArticleSchema(article);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Головна", url: `${siteUrl}/` },
    { name: "Поради", url: `${siteUrl}/advice` },
    { name: article.title, url: articleUrl },
  ]);

  return (
    <div className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
      />
      <section className="border-b border-border bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 py-8 md:py-12">
        <div className="container mx-auto max-w-4xl px-4 md:px-8">
          <Breadcrumb
            className="mb-4"
            items={[
              { label: "Головна", href: "/" },
              { label: "Поради", href: "/advice" },
              { label: article.title },
            ]}
          />
          <Link
            href="/advice"
            className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-stone-200 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            До всіх статей
          </Link>
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-stone-50 md:text-4xl">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="mb-3 text-sm text-stone-300 md:text-base">
              {article.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
            <div className="flex flex-wrap items-center gap-3">
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
            <ShareButtons
              title={article.title}
              url={articleUrl}
              className="text-stone-400"
            />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto max-w-4xl px-4 md:px-8">
          <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary">
            {article.content ? (
              <LexicalRenderer content={article.content as Parameters<typeof LexicalRenderer>[0]['content']} />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {article.previewText}
                </p>
                <p className="mt-6 text-[13px] text-muted-foreground">
                  Повний текст статті буде підтягуватися з CMS.
                </p>
              </>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}