import type { Metadata } from "next";
import { Car, Shield, Zap, Mountain } from "lucide-react";
import { getPayloadTyres, transformPayloadTyre } from "@/lib/api/payload";
import type { TyreModel } from "@/lib/data";
import { CategoryPage, type CategoryPageConfig } from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Шини для SUV та 4x4 Bridgestone | Каталог для позашляховиків",
  description: "Шини Bridgestone для позашляховиків та кросоверів. Підвищена прохідність, надійне зчеплення на будь-якому покритті. Літні, зимові та всесезонні моделі.",
  alternates: {
    canonical: '/suv-4x4-tyres',
  },
  openGraph: {
    title: "Шини для SUV та 4x4 Bridgestone | Каталог для позашляховиків",
    description: "Шини Bridgestone для позашляховиків та кросоверів. Підвищена прохідність, надійне зчеплення.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};

const config: CategoryPageConfig = {
  slug: "suv-4x4-tyres",
  vehicleType: "suv",

  title: "Шини Bridgestone для SUV та 4x4",
  subtitle: "технічний підбір для важчих авто, позашляховиків та кросоверів",
  heroDescription:
    "Підкорюйте бездоріжжя, гірські серпантини чи міські бордюри — оберіть шини Bridgestone, розроблені для стабільності та зчеплення потужних автомобілів у різних умовах.",
  features: [
    {
      icon: Car,
      title: "Посилена конструкція",
      description: "Каркас, розрахований на великі навантаження та складні дорожні умови.",
      color: { bg: "bg-blue-500/15", text: "text-blue-500" },
    },
    {
      icon: Shield,
      title: "Захист від пошкоджень",
      description: "Технології захисту боковини та протектора від каміння та ударів.",
      color: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
    },
    {
      icon: Zap,
      title: "Висока прохідність",
      description: "Малюнок протектора, що забезпечує зчеплення на гравії, снігу та бруді.",
      color: { bg: "bg-amber-500/15", text: "text-amber-500" },
    },
    {
      icon: Mountain,
      title: "Стабільність на швидкості",
      description: "Оптимізована форма плеча для стабільної поведінки на трасі.",
      color: { bg: "bg-orange-500/15", text: "text-orange-500" },
    },
  ],
  heroImageSrc: "/images/hero/hero-suv.webp",
  heroImageAlt: "Шини для SUV та 4x4 Bridgestone",
  heroOverlayIcon: Mountain,
  heroOverlayIconBg: "bg-orange-500/15",
  heroOverlayIconText: "text-orange-500",
  heroOverlayTitle: "SUV та 4x4 з Bridgestone",
  heroOverlayDescription: "Надійність та прохідність для позашляховиків",

  breadcrumbLabel: "Шини для SUV та 4x4",

  seasonSectionDescription:
    "Кожна модель розроблена з урахуванням специфіки експлуатації SUV та 4x4 у різних умовах.",
  seasonDescriptions: {
    summer: "Ідеальні для літніх подорожей містом та трасою, забезпечують комфорт та економію палива.",
    winter: "Надійне зчеплення на снігу, льоду та сльоті для безпеки в зимових умовах.",
    allseason: "Універсальні шини для цілорічної експлуатації в різних дорожніх умовах.",
  },
  seasonInitialCount: 2,

  featuredTitle: "Популярні моделі для SUV",
  featuredCount: 6,

  reviewsVehicleType: "suv",
  reviewsTitle: "Відгуки про шини для SUV",
  reviewsLimit: 3,

  ctaTitle: "Потрібна допомога у виборі?",
  ctaDescription:
    "Наші експерти допоможуть підібрати ідеальні шини для вашого позашляховика з урахуванням стилю водіння, умов експлуатації та бюджету.",
  ctaPrimaryLabel: "Отримати консультацію",
  ctaPrimaryHref: "/contacts",
  ctaSecondaryLabel: "Знайти дилера",
  ctaSecondaryHref: "/dealers",
};

export default async function SuvTyresPage() {
  const payloadTyres = await getPayloadTyres({ vehicleType: 'suv' });
  const suvTyres = payloadTyres.map(t => transformPayloadTyre(t) as TyreModel);

  return <CategoryPage config={config} tyres={suvTyres} />;
}
