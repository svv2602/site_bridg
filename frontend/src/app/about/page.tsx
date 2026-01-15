"use client";

import Link from "next/link";
import { Globe, Award, Shield, Users, Target, Zap, Phone } from "lucide-react";
import { Breadcrumb } from "@/components/ui";

const stats = [
  { label: "Країн присутності", value: "150+", icon: Globe, color: { bg: "bg-teal-500/15", text: "text-teal-500" } },
  { label: "Років на ринку", value: "90+", icon: Award, color: { bg: "bg-yellow-500/15", text: "text-yellow-500" } },
  { label: "Дослідницьких центрів", value: "12", icon: Zap, color: { bg: "bg-amber-500/15", text: "text-amber-500" } },
  { label: "Сертифікатів якості", value: "ISO 9001", icon: Shield, color: { bg: "bg-emerald-500/15", text: "text-emerald-500" } },
];

const values = [
  {
    icon: Shield,
    title: "Безпека",
    description: "Пріоритет номер один у кожній шині Bridgestone.",
    color: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
  },
  {
    icon: Target,
    title: "Точність",
    description: "Інженерна точність та контроль якості на всіх етапах.",
    color: { bg: "bg-orange-500/15", text: "text-orange-500" },
  },
  {
    icon: Users,
    title: "Клієнтоорієнтованість",
    description: "Розуміння потреб водіїв та пропозиція оптимальних рішень.",
    color: { bg: "bg-pink-500/15", text: "text-pink-500" },
  },
  {
    icon: Globe,
    title: "Екологічність",
    description: "Інновації для зменшення впливу на довкілля.",
    color: { bg: "bg-teal-500/15", text: "text-teal-500" },
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="hero-adaptive relative overflow-hidden py-12 md:py-16">
        <div className="container relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-4xl text-left animate-fade-in">
            <Breadcrumb
              className="hero-breadcrumb-adaptive mb-2"
              items={[
                { label: "Головна", href: "/" },
                { label: "Про бренд Bridgestone" },
              ]}
            />
            <h1 className="hero-title-adaptive mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
              Bridgestone — світовий виробник шин
              <span className="hero-subtitle-adaptive mt-1 block text-base font-normal md:text-lg">
                технічний лідер з глобальною присутністю у більш ніж 150 країнах світу
              </span>
            </h1>
            <p className="hero-text-adaptive mb-6 max-w-2xl text-sm md:text-base">
              Від перших заводів у Японії до сучасних дослідницьких центрів у різних регіонах —
              Bridgestone поєднує інженерний досвід, інновації та суворі стандарти якості,
              щоб забезпечувати безпеку і комфорт мільйонам водіїв.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#mission"
                className="hero-btn-primary-adaptive"
              >
                Дізнатися більше
              </a>
              <Link
                href="/contacts"
                className="hero-btn-secondary-adaptive"
              >
                Зв&apos;язатися з нами
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                
                
                
                className="group rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex rounded-full ${stat.color.bg} p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color.text}`} aria-hidden="true" />
                </div>
                <div className="text-3xl font-bold text-secondary">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section id="mission" className="py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">Наша місія</h2>
              <p className="mb-6 text-lg text-muted-foreground">
                «Служити суспільству з максимальною якістю» — це не просто слова.
                Це принцип, який лежить в основі кожної шини, кожного технологічного
                рішення та кожного контакту з клієнтом.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-orange-500/15 p-2">
                    <Target className="h-5 w-5 text-orange-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Інновації для безпеки</h4>
                    <p className="text-sm text-muted-foreground">
                      Ми постійно вдосконалюємо технології, щоб зробити рух безпечнішим
                      на будь‑якій дорозі та в будь‑яку погоду.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-teal-500/15 p-2">
                    <Globe className="h-5 w-5 text-teal-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Відповідальність перед планетою</h4>
                    <p className="text-sm text-muted-foreground">
                      Розробляємо екологічні матеріали та процеси, щоб зменшити вплив
                      на довкілля протягом усього життєвого циклу продукції.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div >
              <h2 className="mb-6 text-3xl font-bold">Наші цінності</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {values.map((value) => (
                  <div
                    key={value.title}
                    className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    <div className={`mb-3 inline-flex rounded-full ${value.color.bg} p-2`}>
                      <value.icon className={`h-5 w-5 ${value.color.text}`} aria-hidden="true" />
                    </div>
                    <h4 className="mb-2 font-semibold">{value.title}</h4>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <h2 className="mb-4 text-3xl font-bold">Історія, яка формує майбутнє</h2>
            <p className="mb-10 text-lg text-muted-foreground">
              За понад 90 років Bridgestone пройшов шлях від невеликої японської мануфактури
              до одного з найбільших виробників шин у світі. Кожен етап нашого розвитку
              був присвячений одній меті — створювати найнадійніші шини для водіїв усіх
              континентів.
            </p>
            <div className="relative">
              {/* Timeline line: left on mobile, center on desktop */}
              <div className="absolute left-5 top-0 h-full w-0.5 bg-brand/30 lg:left-1/2 lg:-translate-x-1/2" />
              <div className="relative grid gap-8">
                {[
                  { year: "1931", event: "Заснування компанії в місті Куробе, Японія." },
                  { year: "1960", event: "Початок міжнародної експансії та відкриття перших заводів за межами Японії." },
                  { year: "1988", event: "Придбання Firestone та зміцнення позицій на американському ринку." },
                  { year: "2000‑ні", event: "Активний розвиток екологічних технологій та запуск лінійки «енергоефективних» шин." },
                  { year: "Сьогодні", event: "Bridgestone — глобальний лідер з представництвом у понад 150 країнах, включаючи Україну." },
                ].map((item, idx) => (
                  <div
                    key={item.year}
                    className={`flex items-start lg:items-center ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                  >
                    {/* Desktop: empty spacer for alternating layout */}
                    <div className="hidden lg:block lg:w-1/2" />
                    {/* Year badge: pill shape that adapts to content */}
                    <div className="relative z-10 flex-shrink-0 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-lg lg:mx-4">
                      {item.year}
                    </div>
                    {/* Event card: with left margin on mobile */}
                    <div className="ml-4 flex-1 lg:ml-0 lg:w-1/2">
                      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <p className="font-medium">{item.event}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div
            
            
            
            className="rounded-3xl bg-graphite p-10 text-white shadow-2xl"
          >
            <h3 className="mb-4 text-3xl font-bold">Готові дізнатися більше?</h3>
            <p className="mb-8 text-lg opacity-90">
              Отримайте професійну консультацію щодо підбору шин або знайдіть найближчого
              офіційного дилера Bridgestone в Україні.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/dealers"
                className="rounded-full bg-white px-8 py-3 font-semibold text-graphite transition-colors hover:bg-stone-100"
              >
                Знайти дилера
              </Link>
              <a
                href="tel:+380800123456"
                className="inline-flex items-center gap-2 rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Зателефонувати
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
