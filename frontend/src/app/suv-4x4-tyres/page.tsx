"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MOCK_TYRE_MODELS, type TyreModel, type Season } from "@/lib/data";
import { Car, Shield, Zap, Mountain, Filter, ChevronRight } from "lucide-react";

const seasonLabels: Record<Season, string> = {
  summer: "Літні шини",
  winter: "Зимові шини",
  allseason: "Всесезонні шини",
};

const seasonIcons: Record<Season, React.ReactNode> = {
  summer: <Zap className="h-5 w-5" />,
  winter: <Shield className="h-5 w-5" />,
  allseason: <Mountain className="h-5 w-5" />,
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
    icon: Car,
    title: "Посилена конструкція",
    description: "Каркас, розрахований на великі навантаження та складні дорожні умови.",
  },
  {
    icon: Shield,
    title: "Захист від пошкоджень",
    description: "Технології захисту боковини та протектора від каміння та ударів.",
  },
  {
    icon: Zap,
    title: "Висока прохідність",
    description: "Малюнок протектора, що забезпечує зчеплення на гравії, снігу та бруді.",
  },
  {
    icon: Mountain,
    title: "Стабільність на швидкості",
    description: "Оптимізована форма плеча для стабільної поведінки на трасі.",
  },
];

export default function SuvTyresPage() {
  const suvTyres = MOCK_TYRE_MODELS.filter((m) =>
    m.vehicleTypes.includes("suv"),
  );
  const bySeason = groupBySeason(suvTyres);

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
                <span className="font-medium text-zinc-100">Шини для SUV та 4x4</span>
              </nav>
              <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
                Шини Bridgestone для SUV та 4x4
                <span className="mt-1 block text-base font-normal text-zinc-300 md:text-lg">
                  технічний підбір для важчих авто, позашляховиків та кросоверів
                </span>
              </h1>
              <p className="mb-6 max-w-xl text-sm text-zinc-300 md:text-base">
                Підкорюйте бездоріжжя, гірські серпантини чи міські бордюри — оберіть шини Bridgestone,
                розроблені для стабільності та зчеплення потужних автомобілів у різних умовах.
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
                <button className="rounded-full bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white">
                  Підібрати шини
                </button>
                <button className="rounded-full border border-zinc-500 bg-transparent px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
                  Переглянути каталог
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-80 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-800 lg:h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="h-40 w-40 text-zinc-700" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 p-6">
                  <h3 className="text-xl font-semibold text-zinc-50">SUV та 4x4 з Bridgestone</h3>
                  <p className="text-sm text-zinc-300">
                    Демонстраційний візуал, який буде замінений на офіційні фото в фінальній версії.
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
              Кожна модель розроблена з урахуванням специфіки експлуатації SUV та 4x4 у різних умовах.
            </p>
          </div>
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
                      ? "Ідеальні для літніх подорожей містом та трасою, забезпечують комфорт та економію палива."
                      : season === "winter"
                        ? "Надійне зчеплення на снігу, льоду та сльоті для безпеки в зимових умовах."
                        : "Універсальні шини для цілорічної експлуатації в різних дорожніх умовах."}
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
        </div>
      </section>

      {/* Featured Models */}
      <section className="py-12 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-8 text-3xl font-bold text-center">Популярні моделі для SUV</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {suvTyres.slice(0, 6).map((model, idx) => (
              <motion.div
                key={model.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all hover:shadow-2xl"
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="h-20 w-20 text-primary/40" />
                  </div>
                  <div className="absolute top-4 left-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white">
                    {seasonLabels[model.season]}
                  </div>
                  <div className="absolute top-4 right-4 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    SUV / 4x4
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

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-10 text-white shadow-2xl"
          >
            <h3 className="mb-4 text-3xl font-bold">Потрібна допомога у виборі?</h3>
            <p className="mb-8 text-lg opacity-90">
              Наші експерти допоможуть підібрати ідеальні шини для вашого позашляховика
              з урахуванням стилю водіння, умов експлуатації та бюджету.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100">
                Отримати консультацію
              </button>
              <button className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10">
                Зателефонувати
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}