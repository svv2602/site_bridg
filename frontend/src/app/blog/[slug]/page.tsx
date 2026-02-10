import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { getArticleBySlug, getArticles } from "@/lib/api/articles";
import { generateArticleSchema, generateBreadcrumbSchema, jsonLdScript } from "@/lib/schema";
import { Breadcrumb } from "@/components/ui";
import { LexicalRenderer } from "@/components/LexicalRenderer";
import { ShareButtons } from "@/components/ShareButtons";
import { TableOfContents } from "@/components/TableOfContents";
import { SITE_URL } from "@/lib/constants";
import { pluralize } from "@/lib/utils/pluralize";

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
      title: "Стаття не знайдена — Блог Bridgestone",
    };
  }

  const title =
    article.seoTitle ?? `${article.title} — Блог Bridgestone Україна`;

  const description =
    article.seoDescription ??
    article.previewText ??
    "Корисні статті про шини Bridgestone в Україні.";

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'uk_UA',
      siteName: 'Bridgestone Україна',
      publishedTime: article.publishedAt,
      ...(article.updatedAt && { modifiedTime: article.updatedAt }),
      ...(article.tags?.[0] && { section: article.tags[0] }),
      images: article.featuredImage ? [{ url: article.featuredImage, alt: article.title }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const siteUrl = SITE_URL;
  const articleUrl = `${siteUrl}/blog/${article.slug}`;

  const articleSchema = generateArticleSchema(article);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Головна", url: `${siteUrl}/` },
    { name: "Блог", url: `${siteUrl}/blog` },
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
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          <Breadcrumb
            className="mb-4"
            variant="hero-dark"
            items={[
              { label: "Головна", href: "/" },
              { label: "Блог", href: "/blog" },
              { label: article.title },
            ]}
          />
          <Link
            href="/blog"
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
              {article.publishedAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString("uk-UA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </span>
              )}
              {article.readingTimeMinutes && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {pluralize(article.readingTimeMinutes, "хвилина", "хвилини", "хвилин")} читання
                </span>
              )}
              {article.tags && article.tags.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {article.tags.map((tag, i) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full px-2 py-1 hover:bg-white/10 hover:text-stone-200"
                    >
                      #{tag}{i < article.tags!.length - 1 ? "," : ""}
                    </Link>
                  ))}
                </span>
              )}
            </div>
            <ShareButtons
              title={article.title}
              url={articleUrl}
              variant="hero-dark"
              className="text-stone-400"
            />
          </div>
        </div>
      </section>

      {/* Featured image */}
      {(article.featuredImage || article.imageUrl) && (
        <div className="container mx-auto max-w-6xl px-4 pt-8 md:px-8">
          <div className="relative aspect-[2/1] max-h-[480px] overflow-hidden rounded-2xl">
            <Image
              src={article.featuredImage || article.imageUrl!}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
            />
          </div>
        </div>
      )}

      <section className="py-10">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_240px]">
            <article className="min-w-0 max-w-4xl">
              {article.content ? (
                <LexicalRenderer
                  content={article.content as Parameters<typeof LexicalRenderer>[0]['content']}
                  variant="article"
                />
              ) : (
                <div className="prose max-w-none">
                  <p className="text-stone-600 dark:text-stone-400">
                    {article.previewText}
                  </p>
                </div>
              )}
            </article>
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents containerSelector="article" />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related tags */}
      {article.tags && article.tags.length > 0 && (
        <section className="border-t border-border py-8">
          <div className="container mx-auto max-w-6xl px-4 md:px-8">
            <h3 className="mb-4 text-lg font-semibold">Схожі теми</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
