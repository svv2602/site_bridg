"use client";

import { motion } from "framer-motion";
import { MOCK_ARTICLES } from "@/lib/data";
import { BookOpen, Clock, Tag, ArrowRight, Search, Filter } from "lucide-react";

const categories = [
  { label: "Вибір шин", count: 12, icon: Search },
  { label: "Експлуатація", count: 8, icon: BookOpen },
  { label: "Технічне обслуговування", count: 5, icon: Filter },
  { label: "Безпека", count: 7, icon: Tag },
];

export default function AdvicePage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-left text-zinc-50"
          >
            <nav className="mb-2 text-xs text-zinc-400">
              <span className="cursor-pointer hover:text-zinc-100">Головна</span>
              <span className="mx-2">/</span>
              <span className="font-medium text-zinc-100">Корисна інформація та поради</span>
            </nav>
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
              <button className="rounded-full bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white">
                Популярні статті
              </button>
              <button className="rounded-full border border-zinc-500 bg-transparent px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
                Всі категорії
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-8 text-3xl font-bold text-center">Оберіть категорію</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-lg hover:border-primary/30"
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <cat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{cat.label}</h3>
                <p className="text-sm text-muted-foreground">{cat.count} статей</p>
                <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Перейти <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Останні статті</h2>
            <div className="flex gap-2">
              <button className="rounded-full border border-border px-4 py-2 text-sm hover:bg-card">
                Сортувати за датою
              </button>
              <button className="rounded-full bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark">
                Фільтр
              </button>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_ARTICLES.map((article, idx) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary/40" />
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
                  <button className="group/btn mt-auto inline-flex items-center justify-between rounded-full border border-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white">
                    <span>Читати статтю</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-10 text-white shadow-2xl"
          >
            <h3 className="mb-4 text-3xl font-bold">Не знайшли потрібну інформацію?</h3>
            <p className="mb-8 text-lg opacity-90">
              Задайте питання нашим експертам або перегляньте повну базу знань у розділі допомоги.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100">
                Задати питання
              </button>
              <button className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10">
                База знань
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}