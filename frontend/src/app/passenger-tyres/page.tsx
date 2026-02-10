import type { Metadata } from "next";
import { Car, Shield, Zap, Star } from "lucide-react";
import { getTyreModels } from "@/lib/api/tyres";
import { CategoryPage, type CategoryPageConfig } from "@/components/CategoryPage";

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

const config: CategoryPageConfig = {
  slug: "passenger-tyres",
  vehicleType: "passenger",

  title: "Легкові шини Bridgestone",
  subtitle: "технічний підбір для щоденних поїздок та далеких подорожей",
  heroDescription:
    "Від міських маршрутів до траси — оберіть літні, зимові або всесезонні шини Bridgestone під ваш стиль водіння. Інформація подана в більш «технічному» стилі, узгодженому з пошуком шин.",
  features: [
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
  ],
  heroImageSrc: "/images/hero/hero-passenger.webp",
  heroImageAlt: "Легкові шини Bridgestone",
  heroOverlayIcon: Car,
  heroOverlayIconBg: "bg-blue-500/15",
  heroOverlayIconText: "text-blue-500",
  heroOverlayTitle: "Легкові шини Bridgestone",
  heroOverlayDescription: "Комфорт та безпека для щоденних поїздок",

  breadcrumbLabel: "Шини для легкових авто",

  seasonSectionDescription:
    "Кожна модель розроблена з урахуванням специфіки експлуатації легкових авто у різних умовах.",
  seasonDescriptions: {
    summer: "Ідеальні для літніх подорожей містом та трасою, забезпечують комфорт та економію палива.",
    winter: "Надійне зчеплення на снігу, льоду та сльоті для безпеки в зимових умовах.",
    allseason: "Універсальні шини для цілорічної експлуатації в різних дорожніх умовах.",
  },
  seasonInitialCount: 3,

  featuredTitle: "Популярні моделі для легкових авто",
  featuredCount: 6,
  filterPopular: true,

  reviewsVehicleType: "passenger",
  reviewsTitle: "Відгуки про легкові шини",
  reviewsLimit: 6,
  reviewsShowAllLink: true,

  ctaTitle: "Потрібна допомога у виборі?",
  ctaDescription:
    "Наші експерти допоможуть підібрати ідеальні шини для вашого автомобіля з урахуванням стилю водіння, умов експлуатації та бюджету.",
  ctaPrimaryLabel: "Отримати консультацію",
  ctaPrimaryHref: "/contacts",
  ctaSecondaryLabel: "Знайти дилера",
  ctaSecondaryHref: "/dealers",
};

export default async function PassengerTyresPage() {
  const allTyres = await getTyreModels();
  const passengerTyres = allTyres.filter((m) =>
    m.vehicleTypes.includes("passenger"),
  );

  return <CategoryPage config={config} tyres={passengerTyres} />;
}
