/**
 * Шаблон Server Component с Data Fetching
 *
 * Server Components — по умолчанию в Next.js App Router.
 * Используйте для:
 * - Загрузки данных (async/await)
 * - SEO-критичного контента
 * - Статических страниц
 *
 * @example
 * // Скопируйте этот файл и адаптируйте под вашу страницу
 */

// ============================================================================
// IMPORTS
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { ChevronRight } from 'lucide-react';

import { Breadcrumb } from '@/components/ui/Breadcrumb';

import { getTyreModels } from '@/lib/api/tyres';

import type { TyreModel } from '@/lib/data';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Заголовок сторінки | Bridgestone Україна',
  description: 'SEO опис сторінки (до 160 символів)',
  openGraph: {
    title: 'Заголовок для соцмереж',
    description: 'Опис для соцмереж',
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ============================================================================
// DATA FETCHING
// ============================================================================

async function getData(slug: string): Promise<TyreModel | null> {
  // Загрузка данных на сервере
  // Кэшируется Next.js по умолчанию
  const tyres = await getTyreModels();
  return tyres.find((t) => t.slug === slug) || null;
}

// ============================================================================
// STATIC PARAMS (для SSG)
// ============================================================================

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const tyres = await getTyreModels();
  return tyres.map((tyre) => ({
    slug: tyre.slug,
  }));
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function ExamplePage({ params }: PageProps) {
  const { slug } = await params;

  // Загрузка данных
  const data = await getData(slug);

  // 404 если данные не найдены
  if (!data) {
    notFound();
  }

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Головна', href: '/' },
    { label: 'Шини', href: '/shyny' },
    { label: data.name }, // Текущая страница без href
  ];

  return (
    <div className="bg-background">
      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="hero-dark py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <Breadcrumb items={breadcrumbItems} />

          <h1 className="mt-6 text-3xl font-bold md:text-4xl lg:text-5xl">
            {data.name}
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Короткий опис сторінки або продукту
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-800">
              {data.image && (
                <Image
                  src={data.image.url}
                  alt={data.name}
                  fill
                  className="object-contain p-8"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Характеристики
                </h2>
                <div className="mt-4 space-y-3">
                  {/* Характеристики */}
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Сезон</span>
                    <span className="font-medium">{data.season}</span>
                  </div>
                  {/* Добавьте другие характеристики */}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dealers"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3
                             font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  Де купити
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* RELATED CONTENT (Optional) */}
      {/* ================================================================== */}
      <section className="border-t border-border py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="text-2xl font-bold text-foreground">
            Схожі моделі
          </h2>
          {/* Грід з карточками */}
        </div>
      </section>
    </div>
  );
}
