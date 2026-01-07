"use client";

import { motion } from "framer-motion";
import { MOCK_TECHNOLOGIES, MOCK_TYRE_MODELS } from "@/lib/data";
import { Cpu, Shield, Zap, Droplets, Wind, Gauge, ChevronRight } from "lucide-react";

const techIcons: Record<string, React.ReactNode> = {
  "run-flat": <Shield className="h-6 w-6" />,
  "silica": <Droplets className="h-6 w-6" />,
  "noise-cancelling": <Wind className="h-6 w-6" />,
  "fuel-efficiency": <Gauge className="h-6 w-6" />,
  "default": <Cpu className="h-6 w-6" />,
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

export default function TechnologyPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid gap-10 lg:grid-cols-2"
          >
            <div className="text-zinc-50">
              <nav className="mb-2 text-xs text-zinc-400">
                <span className="cursor-pointer hover:text-zinc-100">Головна</span>
                <span className="mx-2">/</span>
                <span className="font-medium text-zinc-100">Технології та інновації</span>
              </nav>
              <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
                Технології Bridgestone
                <span className="mt-1 block text-base font-normal text-zinc-300 md:text-lg">
                  безпека, комфорт та ефективність у реальних дорожніх умовах
                </span>
              </h1>
              <p className="mb-6 max-w-xl text-sm text-zinc-300 md:text-base">
                Інженери Bridgestone працюють з гумовими сумішами, рисунком протектора та конструкцією каркаса,
                щоб шина поводилася стабільно від літньої спеки до зимових опадів. Сторінка оформлена у
                більш «технічному» стилі, узгодженому з пошуком шин.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="rounded-full bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white">
                  Дізнатися більше
                </button>
                <button className="rounded-full border border-zinc-500 bg-transparent px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
                  Всі технології
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-80 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-800 lg:h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="h-40 w-40 text-zinc-700" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 p-6">
                  <h3 className="text-xl font-semibold text-zinc-50">Технології у дії</h3>
                  <p className="text-sm text-zinc-300">
                    Демонстраційний візуал, який буде замінений на офіційні матеріали Bridgestone.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold">Ключові переваги</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies List */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-10 text-3xl font-bold">Технології Bridgestone</h2>
          <div className="space-y-8">
            {MOCK_TECHNOLOGIES.map((tech, idx) => {
              const tyres = MOCK_TYRE_MODELS.filter((m) =>
                tech.tyreSlugs?.includes(m.slug),
              );

              return (
                <motion.article
                  key={tech.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
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
                              <button className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                                Детальніше <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        {tyres.length > 3 && (
                          <div className="mt-6 text-center">
                            <button className="rounded-full border border-primary bg-transparent px-6 py-2 text-primary hover:bg-primary/10">
                              Показати ще {tyres.length - 3} моделей
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-8 flex flex-wrap gap-4">
                      <button className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark">
                        Детальніше про технологію
                      </button>
                      <button className="rounded-full border border-primary bg-transparent px-6 py-3 font-semibold text-primary hover:bg-primary/10">
                        Знайти шини з цією технологією
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
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
            <h3 className="mb-4 text-3xl font-bold">Зацікавили технології Bridgestone?</h3>
            <p className="mb-8 text-lg opacity-90">
              Отримайте детальну консультацію від наших експертів щодо технологій,
              які найкраще підходять для вашого авто та стилю водіння.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100">
                Замовити консультацію
              </button>
              <button className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10">
                Завантажити брошуру
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}