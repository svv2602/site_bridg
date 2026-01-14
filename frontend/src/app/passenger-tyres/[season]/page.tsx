import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { type Season } from "@/lib/data";
import { getTyreModels } from "@/lib/api/tyres";
import { TyreCardGrid } from "@/components/TyreCard";
import { Breadcrumb } from "@/components/ui";
import { Sun, Snowflake, Cloud, Shield, Zap, Thermometer, Car } from "lucide-react";
import { seasonLabels, SeasonIcons, seasonTextColors, seasonBgLight } from "@/lib/utils/tyres";

// Hero images for each season
const seasonHeroImages: Record<Season, string> = {
  summer: "/images/hero/hero-summer.jpg",
  winter: "/images/hero/hero-winter.jpg",
  allseason: "/images/hero/hero-allseason.jpg",
};

// URL slug to internal season mapping
const slugToSeason: Record<string, Season> = {
  summer: "summer",
  winter: "winter",
  "all-season": "allseason",
};

// Reverse mapping for generateStaticParams
const seasonToSlug: Record<Season, string> = {
  summer: "summer",
  winter: "winter",
  allseason: "all-season",
};

// Season-specific metadata
const seasonMeta: Record<
  Season,
  {
    title: string;
    description: string;
    h1: string;
    subtitle: string;
    heroText: string;
    features: { icon: typeof Sun; title: string; description: string }[];
  }
> = {
  summer: {
    title: "Літні шини Bridgestone | Шини для теплої пори року",
    description:
      "Літні шини Bridgestone для легкових авто. Оптимальне зчеплення на сухій та мокрій дорозі, економія палива та комфорт у теплу пору року.",
    h1: "Літні шини Bridgestone",
    subtitle: "оптимальні характеристики для теплої пори року",
    heroText:
      "Літні шини розроблені для експлуатації при температурі вище +7°C. Спеціальна гумова суміш забезпечує оптимальну еластичність та зчеплення на сухому та мокрому асфальті.",
    features: [
      {
        icon: Thermometer,
        title: "Для температур вище +7°C",
        description: "Оптимальна еластичність гуми в теплу пору року.",
        color: { bg: "bg-red-500/15", text: "text-red-500" },
      },
      {
        icon: Zap,
        title: "Знижений опір коченню",
        description: "Економія палива до 5% порівняно з всесезонними.",
        color: { bg: "bg-amber-500/15", text: "text-amber-500" },
      },
      {
        icon: Shield,
        title: "Відмінне гальмування",
        description: "Скорочення гальмівного шляху на сухій дорозі.",
        color: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
      },
      {
        icon: Car,
        title: "Тиха їзда",
        description: "Оптимізований протектор для низького рівня шуму.",
        color: { bg: "bg-blue-500/15", text: "text-blue-500" },
      },
    ],
  },
  winter: {
    title: "Зимові шини Bridgestone | Шини для снігу та льоду",
    description:
      "Зимові шини Bridgestone для безпечної їзди взимку. Надійне зчеплення на снігу, льоду та сльоті, стабільність при низьких температурах.",
    h1: "Зимові шини Bridgestone",
    subtitle: "безпека та контроль у зимових умовах",
    heroText:
      "Зимові шини обов'язкові при температурі нижче +7°C. Спеціальна м'яка гумова суміш та ламелі забезпечують зчеплення на снігу, льоду та мокрій дорозі.",
    features: [
      {
        icon: Snowflake,
        title: "Позначка 3PMSF",
        description: "Сертифіковані для суворих зимових умов.",
        color: { bg: "bg-sky-500/15", text: "text-sky-500" },
      },
      {
        icon: Shield,
        title: "Зчеплення на льоду",
        description: "Мікро-ламелі для контролю на слизькій поверхні.",
        color: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
      },
      {
        icon: Thermometer,
        title: "М'яка гумова суміш",
        description: "Зберігає еластичність при морозі до -40°C.",
        color: { bg: "bg-red-500/15", text: "text-red-500" },
      },
      {
        icon: Car,
        title: "Відведення сльоти",
        description: "Глибокі канали для відведення снігу та води.",
        color: { bg: "bg-blue-500/15", text: "text-blue-500" },
      },
    ],
  },
  allseason: {
    title: "Всесезонні шини Bridgestone | Цілорічне використання",
    description:
      "Всесезонні шини Bridgestone для цілорічної експлуатації. Універсальне рішення для помірного клімату з балансом характеристик для літа та зими.",
    h1: "Всесезонні шини Bridgestone",
    subtitle: "універсальне рішення на весь рік",
    heroText:
      "Всесезонні шини — компромісне рішення для регіонів з помірним кліматом. Підходять для цілорічної експлуатації без необхідності сезонної заміни.",
    features: [
      {
        icon: Cloud,
        title: "Цілорічна експлуатація",
        description: "Не потребують сезонної заміни шин.",
        color: { bg: "bg-amber-500/15", text: "text-amber-500" },
      },
      {
        icon: Shield,
        title: "Позначка M+S",
        description: "Підходять для легкої зими та літа.",
        color: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
      },
      {
        icon: Zap,
        title: "Економія коштів",
        description: "Один комплект замість двох сезонних.",
        color: { bg: "bg-purple-500/15", text: "text-purple-500" },
      },
      {
        icon: Car,
        title: "Збалансовані характеристики",
        description: "Прийнятні показники в різних умовах.",
        color: { bg: "bg-blue-500/15", text: "text-blue-500" },
      },
    ],
  },
};

interface PageProps {
  params: Promise<{ season: string }>;
}

export async function generateStaticParams() {
  return Object.keys(slugToSeason).map((season) => ({
    season,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { season: slug } = await params;
  const season = slugToSeason[slug];

  if (!season) {
    return { title: "Сторінку не знайдено" };
  }

  const meta = seasonMeta[season];

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      locale: "uk_UA",
      siteName: "Bridgestone Україна",
    },
  };
}

export default async function SeasonTyresPage({ params }: PageProps) {
  const { season: slug } = await params;
  const season = slugToSeason[slug];

  if (!season) {
    notFound();
  }

  const meta = seasonMeta[season];
  const Icon = SeasonIcons[season];

  // Get tyres filtered by season and vehicle type
  const allTyres = await getTyreModels();
  const seasonTyres = allTyres.filter(
    (m) => m.season === season && m.vehicleTypes.includes("passenger")
  );

  // Separate popular and regular tyres
  const popularTyres = seasonTyres.filter((m) => m.isPopular);
  const otherTyres = seasonTyres.filter((m) => !m.isPopular);

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <Breadcrumb
                className="hero-breadcrumb-adaptive mb-2"
                items={[
                  { label: "Головна", href: "/" },
                  { label: "Легкові шини", href: "/passenger-tyres" },
                  { label: seasonLabels[season] },
                ]}
              />
              <h1 className="hero-title-adaptive mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
                {meta.h1}
                <span className="hero-subtitle-adaptive mt-1 block text-base font-normal md:text-lg">
                  {meta.subtitle}
                </span>
              </h1>
              <p className="hero-text-adaptive mb-6 max-w-xl text-sm md:text-base">{meta.heroText}</p>
              <ul className="mb-8 space-y-3 text-sm">
                {meta.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`mt-1 rounded-full ${feat.color.bg} p-1.5`}>
                      <feat.icon className={`h-4 w-4 ${feat.color.text}`} />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 dark:text-white">{feat.title}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 md:text-sm">{feat.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/tyre-search" className="hero-btn-primary-adaptive">
                  Підібрати шини
                </Link>
                <Link href="#catalog" className="hero-btn-secondary-adaptive">
                  Переглянути каталог
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="hero-card-adaptive relative h-80 overflow-hidden lg:h-full">
                <Image
                  src={seasonHeroImages[season]}
                  alt={meta.h1}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`rounded-full ${seasonBgLight[season]} p-2`}>
                      <Icon className={`h-5 w-5 ${seasonTextColors[season]}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{meta.h1}</h3>
                  </div>
                  <p className="text-sm text-white/80">
                    {seasonTyres.length} моделей у каталозі
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          {popularTyres.length > 0 && (
            <>
              <div className="mb-8">
                <h2 className="mb-2 text-2xl font-bold">Популярні моделі</h2>
                <p className="text-muted-foreground">
                  Найбільш затребувані {seasonLabels[season].toLowerCase()} серед наших клієнтів.
                </p>
              </div>
              <TyreCardGrid tyres={popularTyres} variant="featured" />
            </>
          )}

          {otherTyres.length > 0 && (
            <div className={popularTyres.length > 0 ? "mt-16" : ""}>
              <div className="mb-8">
                <h2 className="mb-2 text-2xl font-bold">
                  {popularTyres.length > 0 ? "Інші моделі" : "Всі моделі"}
                </h2>
                <p className="text-muted-foreground">
                  {popularTyres.length > 0
                    ? `Додаткові ${seasonLabels[season].toLowerCase()} для різних потреб.`
                    : `Всі доступні ${seasonLabels[season].toLowerCase()} у каталозі.`}
                </p>
              </div>
              <TyreCardGrid tyres={otherTyres} />
            </div>
          )}

          {seasonTyres.length === 0 && (
            <div className="py-16 text-center">
              <Icon className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
              <h2 className="mb-2 text-xl font-semibold">Моделі не знайдено</h2>
              <p className="mb-6 text-muted-foreground">
                На жаль, {seasonLabels[season].toLowerCase()} для легкових авто наразі відсутні в
                каталозі.
              </p>
              <Link href="/passenger-tyres" className="text-primary hover:underline">
                Переглянути всі легкові шини
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Related Seasons */}
      <section className="border-t border-border bg-card py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold">Інші сезони</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {(["summer", "winter", "allseason"] as Season[])
              .filter((s) => s !== season)
              .map((s) => {
                const SIcon = SeasonIcons[s];
                return (
                  <Link
                    key={s}
                    href={`/passenger-tyres/${seasonToSlug[s]}`}
                    className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className={`rounded-full ${seasonBgLight[s]} p-3`}>
                      <SIcon className={`h-6 w-6 ${seasonTextColors[s]}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{seasonLabels[s]}</h3>
                      <p className="text-sm text-muted-foreground">Переглянути каталог</p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div className="rounded-3xl bg-graphite p-10 text-white shadow-2xl">
            <h3 className="mb-4 text-3xl font-bold">Потрібна допомога у виборі?</h3>
            <p className="mb-8 text-lg opacity-90">
              Наші експерти допоможуть підібрати ідеальні {seasonLabels[season].toLowerCase()} для
              вашого автомобіля з урахуванням стилю водіння та умов експлуатації.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contacts"
                className="rounded-full bg-white px-8 py-3 font-semibold text-graphite hover:bg-stone-100"
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
