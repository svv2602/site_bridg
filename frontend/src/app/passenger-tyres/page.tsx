import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { type Season } from "@/lib/data";
import { getTyreModels } from "@/lib/api/tyres";
import { TyreCardGrid } from "@/components/TyreCard";
import { SeasonCategoryCard } from "@/components/SeasonCategoryCard";
import { Breadcrumb } from "@/components/ui";
import { Car, Shield, Zap, Star } from "lucide-react";
import { groupBySeason } from "@/lib/utils/tyres";
import { ReviewsSection } from "@/components/ReviewsSection";

export const metadata: Metadata = {
  title: "Легкові шини Bridgestone | Каталог шин для легкових авто",
  description: "Широкий вибір легкових шин Bridgestone для вашого автомобіля. Літні, зимові та всесезонні моделі з гарантією якості для комфортної та безпечної їзди.",
  openGraph: {
    title: "Легкові шини Bridgestone | Каталог шин для легкових авто",
    description: "Широкий вибір легкових шин Bridgestone. Літні, зимові та всесезонні моделі.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};

const features = [
  {
    icon: Car,
    title: "Комфорт та керованість",
    description: "Оптимальна жорсткість та форма протектора для комфортної їзди.",
    color: { bg: "bg-blue-500/15", text: "text-blue-500" },
  },
  {
    icon: Shield,
    title: "Безпека на мокрій дорозі",
    description: "Глибокі дренажні канали для швидкого відведення води.",
    color: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
  },
  {
    icon: Zap,
    title: "Економія палива",
    description: "Знижений опір коченню завдяки спеціальним матеріалам.",
    color: { bg: "bg-amber-500/15", text: "text-amber-500" },
  },
  {
    icon: Star,
    title: "Довговічність",
    description: "Міцна конструкція та стійкість до зносу на українських дорогах.",
    color: { bg: "bg-purple-500/15", text: "text-purple-500" },
  },
];

export default async function PassengerTyresPage() {
  const allTyres = await getTyreModels();
  const passengerTyres = allTyres.filter((m) =>
    m.vehicleTypes.includes("passenger"),
  );
  const bySeason = groupBySeason(passengerTyres);

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
                  { label: "Шини для легкових авто" },
                ]}
              />
              <h1 className="hero-title-adaptive mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
                Легкові шини Bridgestone
                <span className="hero-subtitle-adaptive mt-1 block text-base font-normal md:text-lg">
                  технічний підбір для щоденних поїздок та далеких подорожей
                </span>
              </h1>
              <p className="hero-text-adaptive mb-6 max-w-xl text-sm md:text-base">
                Від міських маршрутів до траси — оберіть літні, зимові або всесезонні шини
                Bridgestone під ваш стиль водіння. Інформація подана в більш «технічному» стилі,
                узгодженому з пошуком шин.
              </p>
              <ul className="mb-8 space-y-3 text-sm">
                {features.map((feat, idx) => (
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
                  src="/images/hero/hero-passenger.webp"
                  alt="Легкові шини Bridgestone"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-full bg-blue-500/15 p-2">
                      <Car className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Легкові шини Bridgestone</h3>
                  </div>
                  <p className="text-sm text-white/80">
                    Комфорт та безпека для щоденних поїздок
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
              Кожна модель розроблена з урахуванням специфіки експлуатації легкових авто у різних умовах.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {(["summer", "winter", "allseason"] as Season[]).map((season) => {
              const items = bySeason[season];
              if (!items.length) return null;

              const descriptions: Record<Season, string> = {
                summer: "Ідеальні для літніх подорожей містом та трасою, забезпечують комфорт та економію палива.",
                winter: "Надійне зчеплення на снігу, льоду та сльоті для безпеки в зимових умовах.",
                allseason: "Універсальні шини для цілорічної експлуатації в різних дорожніх умовах.",
              };

              return (
                <SeasonCategoryCard
                  key={season}
                  season={season}
                  items={items}
                  initialCount={3}
                  description={descriptions[season]}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Models */}
      <section className="py-12 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-8 text-3xl font-bold text-center">Популярні моделі для легкових авто</h2>
          <TyreCardGrid
            tyres={passengerTyres.filter(m => m.isPopular).slice(0, 6)}
            variant="featured"
          />
        </div>
      </section>

      {/* Reviews */}
      <div className="border-t border-border">
        <ReviewsSection
          vehicleType="passenger"
          limit={6}
          title="Відгуки про легкові шини"
          showTyreName
          showAllLink
        />
      </div>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div className="rounded-3xl bg-graphite p-10 text-white shadow-2xl">
            <h3 className="mb-4 text-3xl font-bold">Потрібна допомога у виборі?</h3>
            <p className="mb-8 text-lg opacity-90">
              Наші експерти допоможуть підібрати ідеальні шини для вашого автомобіля
              з урахуванням стилю водіння, умов експлуатації та бюджету.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contacts" className="rounded-full bg-white px-8 py-3 font-semibold text-graphite transition-colors hover:bg-stone-100">
                Отримати консультацію
              </Link>
              <Link href="/dealers" className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10">
                Знайти дилера
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
