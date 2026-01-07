"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MOCK_TYRE_MODELS, type TyreModel, type Season } from "@/lib/data";
import { Truck, Shield, Zap, Sun, Snowflake, Cloud, ChevronRight, Weight, Gauge } from "lucide-react";

const seasonLabels: Record<Season, string> = {
  summer: "Літні шини",
  winter: "Зимові шини",
  allseason: "Всесезонні шини",
};

const seasonIcons: Record<Season, React.ReactNode> = {
  summer: <Sun className="h-5 w-5" />,
  winter: <Snowflake className="h-5 w-5" />,
  allseason: <Cloud className="h-5 w-5" />,
};

function groupBySeason(models: TyreModel[]) {
  return models.reduce(
    (acc, model) => {
      acc[model.season].push(model);
      return acc;
    },
    {
      summer: [] as TyreModel[],
      winter: [] as TyreModel[],
      allseason: [] as TyreModel[],
    },
  );
}

const features = [
  {
    icon: Weight,
    title: "Висока вантажопідйомність",
    description: "Посилена конструкція для перевезення важких вантажів.",
  },
  {
    icon: Shield,
    title: "Стійкість до зносу",
    description: "Спеціальна гумова суміш для інтенсивної експлуатації.",
  },
  {
    icon: Zap,
    title: "Економія палива",
    description: "Знижений опір коченню для зменшення витрат на пальне.",
  },
  {
    icon: Gauge,
    title: "Безпека при повному завантаженні",
    description: "Надійне гальмування та керованість з повним навантаженням.",
  },
];

// Note: Metadata is defined in layout.tsx for client components
// title: "Шини для комерційних авто (LCV) | Bridgestone Україна"
// description: "Шини Bridgestone для легких комерційних авто..."

export default function LcvTyresPage() {
  const lcvTyres = MOCK_TYRE_MODELS.filter((m) =>
    m.vehicleTypes.includes("lcv"),
  );
  const bySeason = groupBySeason(lcvTyres);

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
                <Link href="/" className="cursor-pointer hover:text-zinc-100">Головна</Link>
                <span className="mx-2">/</span>
                <span className="font-medium text-zinc-100">Шини для комерційних авто</span>
              </nav>
              <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
                Шини для комерційних авто
                <span className="mt-1 block text-base font-normal text-zinc-300 md:text-lg">
                  надійні рішення для вантажних перевезень та бізнесу
                </span>
              </h1>
              <p className="mb-6 max-w-xl text-sm text-zinc-300 md:text-base">
                Шини Bridgestone для фургонів, мікроавтобусів та легких вантажівок.
                Витримують інтенсивні навантаження, забезпечують економію та безпеку
                при щоденних комерційних перевезеннях.
              </p>
              <ul className="mb-8 space-y-3 text-sm text-zinc-200">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-zinc-800 p-1.5">
                      <feat.icon className="h-4 w-4 text-zinc-200" />
                    </div>
                    <div>
                      <p className="font-medium">{feat.title}</p>
                      <p className="text-xs text-zinc-400 md:text-sm">{feat.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/tyre-search"
                  className="rounded-full bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white"
                >
                  Підібрати шини
                </Link>
                <button className="rounded-full border border-zinc-500 bg-transparent px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
                  Переглянути каталог
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-80 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-800 lg:h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Truck className="h-40 w-40 text-zinc-700" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 p-6">
                  <h3 className="text-xl font-semibold text-zinc-50">Комерційні шини Bridgestone</h3>
                  <p className="text-sm text-zinc-300">
                    Для фургонів, мікроавтобусів та легких вантажівок.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Season Tabs */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">Оберіть сезонність</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Кожна модель розроблена з урахуванням специфіки експлуатації комерційних авто у різних умовах.
            </p>
          </div>

          {lcvTyres.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Шини LCV незабаром з&apos;являться</h3>
              <p className="text-muted-foreground mb-6">
                Наразі каталог комерційних шин оновлюється. Зверніться до наших консультантів для підбору.
              </p>
              <Link
                href="/contacts"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Зв&apos;язатися з нами
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3">
              {(["summer", "winter", "allseason"] as Season[]).map((season) => {
                const items = bySeason[season];
                if (!items.length) return null;

                return (
                  <motion.div
                    key={season}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-lg"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          {seasonIcons[season]}
                        </div>
                        <h3 className="text-xl font-bold">{seasonLabels[season]}</h3>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {items.length} моделей
                      </span>
                    </div>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {season === "summer"
                        ? "Для інтенсивних перевезень у теплий сезон, оптимізовані для високого пробігу."
                        : season === "winter"
                          ? "Надійне зчеплення на снігу та льоду для безпечних зимових доставок."
                          : "Універсальні шини для цілорічної комерційної експлуатації."}
                    </p>
                    <div className="space-y-4">
                      {items.slice(0, 2).map((model) => (
                        <div
                          key={model.slug}
                          className="rounded-xl border border-border bg-background p-4"
                        >
                          <h4 className="font-semibold">{model.name}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {model.shortDescription}
                          </p>
                          <Link
                            href={`/shyny/${model.slug}`}
                            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                          >
                            Детальніше <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                    <button className="mt-6 w-full rounded-full border border-border py-2.5 text-sm font-semibold hover:bg-card">
                      Переглянути всі моделі
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Models */}
      {lcvTyres.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-card to-background">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <h2 className="mb-8 text-3xl font-bold text-center">Популярні моделі для комерційних авто</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {lcvTyres.slice(0, 6).map((model, idx) => (
                <motion.div
                  key={model.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all hover:shadow-2xl"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Truck className="h-20 w-20 text-primary/40" />
                    </div>
                    <div className="absolute top-4 left-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white">
                      {seasonLabels[model.season]}
                    </div>
                    <div className="absolute top-4 right-4 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                      LCV
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-2 text-xl font-bold group-hover:text-primary transition-colors">
                      {model.name}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground flex-1">
                      {model.shortDescription}
                    </p>
                    <div className="mb-6">
                      <p className="mb-2 text-sm font-medium">Доступні розміри:</p>
                      <div className="flex flex-wrap gap-2">
                        {model.sizes.slice(0, 3).map((size, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-border bg-background px-3 py-1 text-xs"
                          >
                            {size.width}/{size.aspectRatio}R{size.diameter}
                          </span>
                        ))}
                        {model.sizes.length > 3 && (
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                            +{model.sizes.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <Link
                        href={`/shyny/${model.slug}`}
                        className="flex-1 rounded-full border border-primary bg-transparent py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 text-center"
                      >
                        Детальніше
                      </Link>
                      <Link
                        href="/dealers"
                        className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark text-center"
                      >
                        Знайти дилера
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-10 text-white shadow-2xl"
          >
            <h3 className="mb-4 text-3xl font-bold">Потрібна консультація для автопарку?</h3>
            <p className="mb-8 text-lg opacity-90">
              Наші експерти допоможуть підібрати оптимальні шини для вашого комерційного
              транспорту з урахуванням типу перевезень та інтенсивності експлуатації.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contacts"
                className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100"
              >
                Отримати консультацію
              </Link>
              <Link
                href="/dealers"
                className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10"
              >
                Знайти дилера
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
