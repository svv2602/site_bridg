import Link from "next/link";
import { type TyreModel, type Season } from "@/lib/data";
import { getTyreModels } from "@/lib/api/tyres";
import { TyreImage } from "@/components/TyreImage";
import { Breadcrumb } from "@/components/ui";
import { Truck, Shield, Zap, ChevronRight, Weight, Gauge } from "lucide-react";
import { seasonLabels, SeasonIcons, groupBySeason } from "@/lib/utils/tyres";

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

export default async function LcvTyresPage() {
  const allTyres = await getTyreModels();
  const lcvTyres = allTyres.filter((m) =>
    m.vehicleTypes.includes("lcv"),
  );
  const bySeason = groupBySeason(lcvTyres);

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="hero-dark border-b border-hero-border py-8 md:py-12 hero-grid-pattern">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <Breadcrumb
                className="mb-2 text-hero-muted [&_a:hover]:text-hero-foreground [&_span]:text-hero-foreground"
                items={[
                  { label: "Головна", href: "/" },
                  { label: "Шини для комерційних авто" },
                ]}
              />
              <h1 className="hero-title mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
                Шини для комерційних авто
                <span className="hero-subtitle mt-1 block text-base font-normal md:text-lg">
                  надійні рішення для вантажних перевезень та бізнесу
                </span>
              </h1>
              <p className="hero-text mb-6 max-w-xl text-sm md:text-base">
                Шини Bridgestone для фургонів, мікроавтобусів та легких вантажівок.
                Витримують інтенсивні навантаження, забезпечують економію та безпеку
                при щоденних комерційних перевезеннях.
              </p>
              <ul className="mb-8 space-y-3 text-sm text-hero-foreground">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-hero-accent p-1.5">
                      <feat.icon className="h-4 w-4 text-hero-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{feat.title}</p>
                      <p className="text-xs text-hero-muted md:text-sm">{feat.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/tyre-search"
                  className="hero-btn-primary"
                >
                  Підібрати шини
                </Link>
                <Link href="#catalog" className="hero-btn-secondary">
                  Переглянути каталог
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="hero-card relative h-80 overflow-hidden lg:h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Truck className="h-40 w-40 text-white/10" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 border-t border-hero-border bg-black/50 backdrop-blur-sm p-6">
                  <h3 className="text-xl font-semibold text-hero-foreground">Комерційні шини Bridgestone</h3>
                  <p className="text-sm text-hero-muted">
                    Для фургонів, мікроавтобусів та легких вантажівок.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Season Tabs */}
      <section id="catalog" className="py-12">
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
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
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
                  <div
                    key={season}
                    className="rounded-2xl border border-border bg-card p-6 shadow-lg"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          {(() => {
                            const Icon = SeasonIcons[season];
                            return <Icon className="h-5 w-5" aria-hidden="true" />;
                          })()}
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
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
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
                    {items.length > 2 && (
                      <p className="mt-4 text-center text-sm text-muted-foreground">
                        та ще {items.length - 2} моделей
                      </p>
                    )}
                  </div>
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
              {lcvTyres.slice(0, 6).map((model) => (
                <div
                  key={model.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all hover:shadow-2xl"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
                    <TyreImage
                      imageUrl={model.imageUrl}
                      name={model.name}
                      vehicleType="lcv"
                    />
                    <div className={`absolute top-4 left-4 badge-${model.season} rounded-lg px-3 py-1.5 text-xs font-semibold shadow-lg`}>
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
                    <p className="mb-4 text-sm text-muted-foreground flex-1 line-clamp-2">
                      {model.shortDescription}
                    </p>
                    {model.euLabel && (
                      <div className="mb-4 flex gap-2 text-xs">
                        <span className="rounded bg-green-100 dark:bg-green-900 px-2 py-1">
                          Зчеплення: {model.euLabel.wetGrip}
                        </span>
                        <span className="rounded bg-blue-100 dark:bg-blue-900 px-2 py-1">
                          Паливо: {model.euLabel.fuelEfficiency}
                        </span>
                      </div>
                    )}
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
                        className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 text-center"
                      >
                        Знайти дилера
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-10 text-white shadow-2xl">
            <h3 className="mb-4 text-3xl font-bold">Потрібна консультація для автопарку?</h3>
            <p className="mb-8 text-lg opacity-90">
              Наші експерти допоможуть підібрати оптимальні шини для вашого комерційного
              транспорту з урахуванням типу перевезень та інтенсивності експлуатації.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contacts"
                className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-stone-100"
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
          </div>
        </div>
      </section>
    </div>
  );
}
