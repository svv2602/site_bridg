import Link from "next/link";
import { Truck, Shield, Zap, ChevronRight, Weight, Gauge } from "lucide-react";
import { getTyreModels } from "@/lib/api/tyres";
import { CategoryPage, type CategoryPageConfig } from "@/components/CategoryPage";

const config: CategoryPageConfig = {
  slug: "lcv-tyres",
  vehicleType: "lcv",

  title: "Шини для комерційних авто",
  subtitle: "надійні рішення для вантажних перевезень та бізнесу",
  heroDescription:
    "Шини Bridgestone для фургонів, мікроавтобусів та легких вантажівок. Витримують інтенсивні навантаження, забезпечують економію та безпеку при щоденних комерційних перевезеннях.",
  features: [
    {
      icon: Weight,
      title: "Висока вантажопідйомність",
      description: "Посилена конструкція для перевезення важких вантажів.",
      color: { bg: "bg-stone-500/15", text: "text-stone-500" },
    },
    {
      icon: Shield,
      title: "Стійкість до зносу",
      description: "Спеціальна гумова суміш для інтенсивної експлуатації.",
      color: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
    },
    {
      icon: Zap,
      title: "Економія палива",
      description: "Знижений опір коченню для зменшення витрат на пальне.",
      color: { bg: "bg-amber-500/15", text: "text-amber-500" },
    },
    {
      icon: Gauge,
      title: "Безпека при повному завантаженні",
      description: "Надійне гальмування та керованість з повним навантаженням.",
      color: { bg: "bg-cyan-500/15", text: "text-cyan-500" },
    },
  ],
  heroImageSrc: "/images/hero/hero-lcv.webp",
  heroImageAlt: "Шини для комерційних авто Bridgestone",
  heroOverlayIcon: Truck,
  heroOverlayIconBg: "bg-stone-500/15",
  heroOverlayIconText: "text-stone-400",
  heroOverlayTitle: "Комерційні шини Bridgestone",
  heroOverlayDescription: "Для фургонів, мікроавтобусів та легких вантажівок",

  breadcrumbLabel: "Шини для комерційних авто (LCV)",

  seasonSectionDescription:
    "Кожна модель розроблена з урахуванням специфіки експлуатації комерційних авто у різних умовах.",
  seasonDescriptions: {
    summer: "Для інтенсивних перевезень у теплий сезон, оптимізовані для високого пробігу.",
    winter: "Надійне зчеплення на снігу та льоду для безпечних зимових доставок.",
    allseason: "Універсальні шини для цілорічної комерційної експлуатації.",
  },
  seasonInitialCount: 2,

  featuredTitle: "Популярні моделі для комерційних авто",
  featuredCount: 6,

  reviewsVehicleType: "van",
  reviewsTitle: "Відгуки про комерційні шини",
  reviewsLimit: 3,

  ctaTitle: "Потрібна консультація для автопарку?",
  ctaDescription:
    "Наші експерти допоможуть підібрати оптимальні шини для вашого комерційного транспорту з урахуванням типу перевезень та інтенсивності експлуатації.",
  ctaPrimaryLabel: "Отримати консультацію",
  ctaPrimaryHref: "/contacts",
  ctaSecondaryLabel: "Знайти дилера",
  ctaSecondaryHref: "/dealers",
};

export default async function LcvTyresPage() {
  const allTyres = await getTyreModels();
  const lcvTyres = allTyres.filter((m) =>
    m.vehicleTypes.includes("lcv"),
  );

  // If no LCV tyres available, show empty state instead of template
  if (lcvTyres.length === 0) {
    return (
      <div className="bg-background text-foreground">
        <section className="py-16">
          <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
            <Truck className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Шини LCV незабаром з&apos;являться</h3>
            <p className="text-muted-foreground mb-6">
              Наразі каталог комерційних шин оновлюється. Зверніться до наших консультантів для підбору.
            </p>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-text hover:bg-primary-hover"
            >
              Зв&apos;язатися з нами
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return <CategoryPage config={config} tyres={lcvTyres} />;
}
