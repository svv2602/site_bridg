/**
 * Шаблон страницы App Router
 *
 * Файл: app/example/page.tsx
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Breadcrumb } from '@/components/ui/Breadcrumb';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Назва сторінки — Bridgestone Україна',
  description: 'Опис сторінки для SEO (150-160 символів)',
  openGraph: {
    title: 'Назва сторінки — Bridgestone Україна',
    description: 'Опис сторінки для соціальних мереж',
    type: 'website',
    locale: 'uk_UA',
    siteName: 'Bridgestone Україна',
  },
};

// ============================================================================
// DATA FETCHING (для динамических страниц)
// ============================================================================

// Для статической генерации динамических роутов
// export async function generateStaticParams() {
//   const items = await getItems();
//   return items.map(item => ({ slug: item.slug }));
// }

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function ExamplePage() {
  // Data fetching (выполняется на сервере)
  // const data = await getData();

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="hero-dark border-b border-hero-border py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          {/* Breadcrumb */}
          <Breadcrumb
            className="mb-3 text-hero-muted"
            items={[
              { label: 'Головна', href: '/' },
              { label: 'Назва сторінки' },
            ]}
          />

          {/* Page Title */}
          <h1 className="hero-title text-3xl font-semibold tracking-tight md:text-4xl">
            Заголовок сторінки
            <span className="hero-subtitle mt-1 block text-base font-normal md:text-lg">
              Підзаголовок або короткий опис
            </span>
          </h1>

          {/* Hero Description */}
          <p className="hero-text mt-4 max-w-2xl text-sm md:text-base">
            Детальніший опис сторінки. Що користувач тут знайде
            та яку проблему вирішує ця сторінка.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          {/* Section Header */}
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Заголовок секції
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Опис секції
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Карточки или другой контент */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold">Карточка 1</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Описание карточки
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section (опционально) */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="rounded-3xl bg-primary p-10 text-white">
            <h2 className="text-2xl font-bold md:text-3xl">
              Заклик до дії
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Короткий опис того, що користувач отримає
            </p>
            <Link
              href="/tyre-search"
              className="mt-6 inline-flex items-center gap-2 rounded-full
                         bg-white px-6 py-3 font-semibold text-primary
                         transition-transform hover:scale-105"
            >
              Кнопка дії
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
