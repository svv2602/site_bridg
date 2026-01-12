import type { Metadata } from "next";
import Link from "next/link";
import { type Season } from "@/lib/data";
import { getTyreModels } from "@/lib/api/tyres";
import { TyreCardGrid } from "@/components/TyreCard";
import { SeasonCategoryCard } from "@/components/SeasonCategoryCard";
import { Breadcrumb } from "@/components/ui";
import { Car, Shield, Zap, Star } from "lucide-react";
import { groupBySeason } from "@/lib/utils/tyres";

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
  },
  {
    icon: Shield,
    title: "Безпека на мокрій дорозі",
    description: "Глибокі дренажні канали для швидкого відведення води.",
  },
  {
    icon: Zap,
    title: "Економія палива",
    description: "Знижений опір коченню завдяки спеціальним матеріалам.",
  },
  {
    icon: Star,
    title: "Довговічність",
    description: "Міцна конструкція та стійкість до зносу на українських дорогах.",
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
      <section className="hero-dark border-b border-hero-border py-8 md:py-12 hero-grid-pattern">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <Breadcrumb
                className="mb-2 text-hero-muted [&_a:hover]:text-hero-foreground [&_span]:text-hero-foreground"
                items={[
                  { label: "Головна", href: "/" },
                  { label: "Шини для легкових авто" },
                ]}
              />
              <h1 className="hero-title mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
                Легкові шини Bridgestone
                <span className="hero-subtitle mt-1 block text-base font-normal md:text-lg">
                  технічний підбір для щоденних поїздок та далеких подорожей
                </span>
              </h1>
              <p className="hero-text mb-6 max-w-xl text-sm md:text-base">
                Від міських маршрутів до траси — оберіть літні, зимові або всесезонні шини
                Bridgestone під ваш стиль водіння. Інформація подана в більш «технічному» стилі,
                узгодженому з пошуком шин.
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
                <Link href="/tyre-search" className="hero-btn-primary">
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
                  <Car className="h-40 w-40 text-white/10" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 border-t border-hero-border bg-black/50 backdrop-blur-sm p-6">
                  <h3 className="text-xl font-semibold text-hero-foreground">Легкові шини Bridgestone</h3>
                  <p className="text-sm text-hero-muted">
                    Демонстраційний візуал, який буде замінений на офіційні фото в фінальній версії.
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

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-10 text-white shadow-2xl">
            <h3 className="mb-4 text-3xl font-bold">Потрібна допомога у виборі?</h3>
            <p className="mb-8 text-lg opacity-90">
              Наші експерти допоможуть підібрати ідеальні шини для вашого автомобіля
              з урахуванням стилю водіння, умов експлуатації та бюджету.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contacts" className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-stone-100">
                Отримати консультацію
              </Link>
              <Link href="/dealers" className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10">
                Знайти дилера
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
