import type { Metadata } from "next";
import Link from "next/link";
import { Cpu, Shield, Zap, Droplets, Wind, Gauge, ChevronRight } from "lucide-react";
import { getTechnologies } from "@/lib/api/technologies";
import { getTyreModels } from "@/lib/api/tyres";
import { Breadcrumb } from "@/components/ui";

export const metadata: Metadata = {
  title: "Технології Bridgestone — інновації для безпеки та комфорту",
  description: "Дізнайтеся про технології Bridgestone: Run-Flat, Nano Pro-Tech, зниження шуму та інші інновації для безпеки, комфорту та ефективності.",
  openGraph: {
    title: "Технології Bridgestone — інновації для безпеки та комфорту",
    description: "Дізнайтеся про технології Bridgestone: Run-Flat, Nano Pro-Tech та інші інновації.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};

const techIcons: Record<string, React.ReactNode> = {
  "run-flat": <Shield className="h-6 w-6" aria-hidden="true" />,
  "silica": <Droplets className="h-6 w-6" aria-hidden="true" />,
  "noise-cancelling": <Wind className="h-6 w-6" aria-hidden="true" />,
  "fuel-efficiency": <Gauge className="h-6 w-6" aria-hidden="true" />,
  "default": <Cpu className="h-6 w-6" aria-hidden="true" />,
};

const benefits = [
  {
    icon: Shield,
    title: "Підвищена безпека",
    description: "Технології, що забезпечують стабільність на мокрій дорозі та зменшують гальмівний шлях.",
  },
  {
    icon: Zap,
    title: "Енергоефективність",
    description: "Зниження опору кочення для економії палива та зменшення викидів CO₂.",
  },
  {
    icon: Wind,
    title: "Комфорт водіння",
    description: "Інновації для зниження шуму та вібрацій, що покращують комфорт у салоні.",
  },
  {
    icon: Droplets,
    title: "Довговічність",
    description: "Міцні матеріали та конструкції, що продовжують термін служби шини.",
  },
];

export default async function TechnologyPage() {
  const [technologies, tyreModels] = await Promise.all([
    getTechnologies(),
    getTyreModels(),
  ]);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Технології Bridgestone",
    description: "Інноваційні технології шин Bridgestone для безпеки, комфорту та ефективності",
    numberOfItems: technologies.length,
    itemListElement: technologies.map((tech, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "TechArticle",
        name: tech.name,
        description: tech.description,
        about: {
          "@type": "Thing",
          name: "Автомобільні шини",
        },
      },
    })),
  };

  return (
    <div className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {/* Hero */}
      <section className="hero-dark border-b border-hero-border py-8 md:py-12 hero-grid-pattern">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <Breadcrumb
                className="mb-2 text-hero-muted [&_a:hover]:text-hero-foreground [&_span]:text-hero-foreground"
                items={[
                  { label: "Головна", href: "/" },
                  { label: "Технології та інновації" },
                ]}
              />
              <h1 className="hero-title mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
                Технології Bridgestone
                <span className="hero-subtitle mt-1 block text-base font-normal md:text-lg">
                  безпека, комфорт та ефективність у реальних дорожніх умовах
                </span>
              </h1>
              <p className="hero-text mb-6 max-w-xl text-sm md:text-base">
                Інженери Bridgestone працюють з гумовими сумішами, рисунком протектора та конструкцією каркаса,
                щоб шина поводилася стабільно від літньої спеки до зимових опадів.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#technologies"
                  className="hero-btn-primary"
                >
                  Дізнатися більше
                </a>
                <Link
                  href="/passenger-tyres"
                  className="hero-btn-secondary"
                >
                  Переглянути шини
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="hero-card relative h-80 overflow-hidden lg:h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="h-40 w-40 text-white/10" aria-hidden="true" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 border-t border-hero-border bg-black/50 backdrop-blur-sm p-6">
                  <h3 className="text-xl font-semibold text-hero-foreground">Технології у дії</h3>
                  <p className="text-sm text-hero-muted">
                    {technologies.length} унікальних технологій для різних умов експлуатації.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold">Ключові переваги</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <benefit.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies List */}
      <section id="technologies" className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-10 text-3xl font-bold">Технології Bridgestone</h2>
          {technologies.length === 0 ? (
            <div className="text-center py-12">
              <Cpu className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
              <p className="text-muted-foreground">Інформація про технології завантажується</p>
            </div>
          ) : (
            <div className="space-y-8">
              {technologies.map((tech) => {
                const tyres = tyreModels.filter((m) =>
                  tech.tyreSlugs?.includes(m.slug) || m.technologies?.includes(tech.slug),
                );

                return (
                  <article
                    key={tech.slug}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
                  >
                    <div className="p-8">
                      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full bg-primary/10 p-3">
                            {techIcons[tech.slug] || techIcons.default}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">{tech.name}</h3>
                            <p className="text-sm uppercase tracking-wide text-primary">
                              Технологія Bridgestone
                            </p>
                          </div>
                        </div>
                        {tyres.length > 0 && (
                          <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                            Використовується в {tyres.length} моделях
                          </div>
                        )}
                      </div>

                      <p className="mb-8 text-lg text-muted-foreground">{tech.description}</p>

                      {tyres.length > 0 && (
                        <div className="rounded-xl border border-border bg-background p-6">
                          <h4 className="mb-4 text-xl font-bold">Моделі з цією технологією</h4>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {tyres.slice(0, 3).map((tyre) => (
                              <div
                                key={tyre.slug}
                                className="rounded-xl border border-border bg-card p-4"
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <h5 className="font-bold">{tyre.name}</h5>
                                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                    {tyre.season === "summer"
                                      ? "Літо"
                                      : tyre.season === "winter"
                                        ? "Зима"
                                        : "Всесезон"}
                                  </span>
                                </div>
                                <p className="mb-3 text-sm text-muted-foreground">
                                  {tyre.shortDescription}
                                </p>
                                <Link
                                  href={`/shyny/${tyre.slug}`}
                                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                >
                                  Детальніше <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                              </div>
                            ))}
                          </div>
                          {tyres.length > 3 && (
                            <div className="mt-6 text-center">
                              <Link
                                href={`/passenger-tyres?technology=${tech.slug}`}
                                className="rounded-full border border-primary bg-transparent px-6 py-2 text-primary hover:bg-primary/10"
                              >
                                Показати ще {tyres.length - 3} моделей
                              </Link>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-8 flex flex-wrap gap-4">
                        <Link
                          href={`/passenger-tyres?technology=${tech.slug}`}
                          className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
                        >
                          Знайти шини з цією технологією
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-10 text-white shadow-2xl">
            <h3 className="mb-4 text-3xl font-bold">Зацікавили технології Bridgestone?</h3>
            <p className="mb-8 text-lg opacity-90">
              Отримайте детальну консультацію від наших експертів щодо технологій,
              які найкраще підходять для вашого авто та стилю водіння.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contacts"
                className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-stone-100"
              >
                Замовити консультацію
              </Link>
              <Link
                href="/passenger-tyres"
                className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10"
              >
                Переглянути каталог
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
