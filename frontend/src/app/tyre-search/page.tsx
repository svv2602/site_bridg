import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui";
import { TyreSearchClient } from "./TyreSearchClient";

export const metadata: Metadata = {
  title: "Пошук шин Bridgestone — за розміром та за авто",
  description:
    "Онлайн‑пошук шин Bridgestone в Україні: підбір за типорозміром або за маркою, моделлю та роком випуску автомобіля.",
  alternates: {
    canonical: '/tyre-search',
  },
  openGraph: {
    title: "Пошук шин Bridgestone — за розміром та за авто | Bridgestone Україна",
    description: "Онлайн‑пошук шин Bridgestone в Україні: підбір за типорозміром або за маркою, моделлю та роком випуску автомобіля.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};

export default function Page() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero — server-rendered for SEO */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 text-left md:flex-row md:items-center md:justify-between">
            <div>
              <Breadcrumb
                className="hero-breadcrumb-adaptive mb-3"
                items={[
                  { label: "Головна", href: "/" },
                  { label: "Пошук шин" },
                ]}
              />
              <h1 className="hero-title-adaptive mb-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Технічний підбір шин
                <span className="hero-subtitle-adaptive block text-base font-normal md:text-lg">
                  за розміром або за вашим автомобілем
                </span>
              </h1>
              <p className="hero-text-adaptive max-w-xl text-sm md:text-base">
                Введіть параметри, а ми підберемо відповідні моделі шин Bridgestone з нашого каталогу.
              </p>
            </div>
            <div className="hidden gap-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-900/60 p-4 text-xs text-stone-600 dark:text-stone-300 shadow-lg md:flex md:flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Режим підбору
              </span>
              <p>
                Оберіть пошук за <span className="font-semibold">типорозміром</span> або
                <span className="font-semibold"> за авто</span>, заповніть поля й запустіть пошук.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive search — client component */}
      <Suspense fallback={<div className="min-h-[400px] bg-background" />}>
        <TyreSearchClient />
      </Suspense>
    </div>
  );
}