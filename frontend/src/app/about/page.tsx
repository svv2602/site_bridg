import Link from "next/link";
import { Globe, Target } from "lucide-react";
import { Breadcrumb } from "@/components/ui";
import { getSiteSettingsWithDefaults } from "@/lib/constants";
import { stats, values, timelineEvents } from "./data";

export default async function AboutPage() {
  const settings = await getSiteSettingsWithDefaults();
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
            {stats.map((stat) => (
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
              <div className="heading-2 mb-6 text-3xl font-bold">Наша місія</div>
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
                    <div className="heading-4 font-semibold">Інновації для безпеки</div>
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
                    <div className="heading-4 font-semibold">Відповідальність перед планетою</div>
                    <p className="text-sm text-muted-foreground">
                      Розробляємо екологічні матеріали та процеси, щоб зменшити вплив
                      на довкілля протягом усього життєвого циклу продукції.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="heading-2 mb-6 text-3xl font-bold">Наші цінності</div>
              <div className="grid gap-4 sm:grid-cols-2">
                {values.map((value) => (
                  <div
                    key={value.title}
                    className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    <div className={`mb-3 inline-flex rounded-full ${value.color.bg} p-2`}>
                      <value.icon className={`h-5 w-5 ${value.color.text}`} aria-hidden="true" />
                    </div>
                    <div className="heading-4 mb-2 font-semibold">{value.title}</div>
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
            <div className="heading-2 mb-4 text-3xl font-bold">Історія, яка формує майбутнє</div>
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
                {timelineEvents.map((item, idx) => (
                  <div
                    key={item.year}
                    className={`relative flex items-start lg:items-center ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                  >
                    {/* Desktop: empty spacer for alternating layout */}
                    <div className="hidden lg:block lg:w-[calc(50%-2rem)]" />
                    {/* Year badge: absolutely centered on timeline line for desktop */}
                    <div className="relative z-10 flex-shrink-0 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-lg lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                      {item.year}
                    </div>
                    {/* Event card: with left margin on mobile */}
                    <div className="ml-4 flex-1 lg:ml-0 lg:w-[calc(50%-2rem)]">
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
            className="rounded-3xl bg-graphite p-10 text-white shadow-2xl dark:ring-1 dark:ring-stone-700"
          >
            <div className="heading-3 mb-4 text-3xl font-bold">Готові дізнатися більше?</div>
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
