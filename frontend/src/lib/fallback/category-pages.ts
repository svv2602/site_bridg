/**
 * Fallback data for category pages when CMS is unavailable.
 * Also ensures Tailwind picks up dynamic class names from static imports.
 */
import { Car, Shield, Zap, Star, Mountain, Truck, Weight, Gauge, Snowflake, Thermometer, Cloud } from "lucide-react";
import type { CategoryPageConfig } from "@/components/CategoryPage";
import type { Season } from "@/lib/data";

// Vehicle category page configs (fallback)
export const fallbackVehicleConfigs: Record<string, CategoryPageConfig> = {
  "passenger-tyres": {
    slug: "passenger-tyres",
    vehicleType: "passenger",
    title: "Легкові шини Bridgestone",
    subtitle: "технічний підбір для щоденних поїздок та далеких подорожей",
    heroDescription: "Від міських маршрутів до траси — оберіть літні, зимові або всесезонні шини Bridgestone під ваш стиль водіння. Інформація подана в більш «технічному» стилі, узгодженому з пошуком шин.",
    features: [
      { icon: Car, title: "Комфорт та керованість", description: "Оптимальна жорсткість та форма протектора для комфортної їзди.", color: { bg: "bg-blue-500/15", text: "text-blue-500" } },
      { icon: Shield, title: "Безпека на мокрій дорозі", description: "Глибокі дренажні канали для швидкого відведення води.", color: { bg: "bg-emerald-500/15", text: "text-emerald-500" } },
      { icon: Zap, title: "Економія палива", description: "Знижений опір коченню завдяки спеціальним матеріалам.", color: { bg: "bg-amber-500/15", text: "text-amber-500" } },
      { icon: Star, title: "Довговічність", description: "Міцна конструкція та стійкість до зносу на українських дорогах.", color: { bg: "bg-purple-500/15", text: "text-purple-500" } },
    ],
    heroImageSrc: "/images/hero/hero-passenger.webp",
    heroImageAlt: "Легкові шини Bridgestone",
    heroOverlayIcon: Car,
    heroOverlayIconBg: "bg-blue-500/15",
    heroOverlayIconText: "text-blue-500",
    heroOverlayTitle: "Легкові шини Bridgestone",
    heroOverlayDescription: "Комфорт та безпека для щоденних поїздок",
    breadcrumbLabel: "Шини для легкових авто",
    seasonSectionDescription: "Кожна модель розроблена з урахуванням специфіки експлуатації легкових авто у різних умовах.",
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
    ctaDescription: "Наші експерти допоможуть підібрати ідеальні шини для вашого автомобіля з урахуванням стилю водіння, умов експлуатації та бюджету.",
    ctaPrimaryLabel: "Отримати консультацію",
    ctaPrimaryHref: "/contacts",
    ctaSecondaryLabel: "Знайти дилера",
    ctaSecondaryHref: "/dealers",
  },
  "suv-4x4-tyres": {
    slug: "suv-4x4-tyres",
    vehicleType: "suv",
    title: "Шини Bridgestone для SUV та 4x4",
    subtitle: "технічний підбір для важчих авто, позашляховиків та кросоверів",
    heroDescription: "Підкорюйте бездоріжжя, гірські серпантини чи міські бордюри — оберіть шини Bridgestone, розроблені для стабільності та зчеплення потужних автомобілів у різних умовах.",
    features: [
      { icon: Car, title: "Посилена конструкція", description: "Каркас, розрахований на великі навантаження та складні дорожні умови.", color: { bg: "bg-blue-500/15", text: "text-blue-500" } },
      { icon: Shield, title: "Захист від пошкоджень", description: "Технології захисту боковини та протектора від каміння та ударів.", color: { bg: "bg-emerald-500/15", text: "text-emerald-500" } },
      { icon: Zap, title: "Висока прохідність", description: "Малюнок протектора, що забезпечує зчеплення на гравії, снігу та бруді.", color: { bg: "bg-amber-500/15", text: "text-amber-500" } },
      { icon: Mountain, title: "Стабільність на швидкості", description: "Оптимізована форма плеча для стабільної поведінки на трасі.", color: { bg: "bg-orange-500/15", text: "text-orange-500" } },
    ],
    heroImageSrc: "/images/hero/hero-suv.webp",
    heroImageAlt: "Шини для SUV та 4x4 Bridgestone",
    heroOverlayIcon: Mountain,
    heroOverlayIconBg: "bg-orange-500/15",
    heroOverlayIconText: "text-orange-500",
    heroOverlayTitle: "SUV та 4x4 з Bridgestone",
    heroOverlayDescription: "Надійність та прохідність для позашляховиків",
    breadcrumbLabel: "Шини для SUV та 4x4",
    seasonSectionDescription: "Кожна модель розроблена з урахуванням специфіки експлуатації SUV та 4x4 у різних умовах.",
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
    ctaDescription: "Наші експерти допоможуть підібрати ідеальні шини для вашого позашляховика з урахуванням стилю водіння, умов експлуатації та бюджету.",
    ctaPrimaryLabel: "Отримати консультацію",
    ctaPrimaryHref: "/contacts",
    ctaSecondaryLabel: "Знайти дилера",
    ctaSecondaryHref: "/dealers",
  },
  "lcv-tyres": {
    slug: "lcv-tyres",
    vehicleType: "lcv",
    title: "Шини для комерційних авто",
    subtitle: "надійні рішення для вантажних перевезень та бізнесу",
    heroDescription: "Шини Bridgestone для фургонів, мікроавтобусів та легких вантажівок. Витримують інтенсивні навантаження, забезпечують економію та безпеку при щоденних комерційних перевезеннях.",
    features: [
      { icon: Weight, title: "Висока вантажопідйомність", description: "Посилена конструкція для перевезення важких вантажів.", color: { bg: "bg-stone-500/15", text: "text-stone-500" } },
      { icon: Shield, title: "Стійкість до зносу", description: "Спеціальна гумова суміш для інтенсивної експлуатації.", color: { bg: "bg-emerald-500/15", text: "text-emerald-500" } },
      { icon: Zap, title: "Економія палива", description: "Знижений опір коченню для зменшення витрат на пальне.", color: { bg: "bg-amber-500/15", text: "text-amber-500" } },
      { icon: Gauge, title: "Безпека при повному завантаженні", description: "Надійне гальмування та керованість з повним навантаженням.", color: { bg: "bg-cyan-500/15", text: "text-cyan-500" } },
    ],
    heroImageSrc: "/images/hero/hero-lcv.webp",
    heroImageAlt: "Шини для комерційних авто Bridgestone",
    heroOverlayIcon: Truck,
    heroOverlayIconBg: "bg-stone-500/15",
    heroOverlayIconText: "text-stone-400",
    heroOverlayTitle: "Комерційні шини Bridgestone",
    heroOverlayDescription: "Для фургонів, мікроавтобусів та легких вантажівок",
    breadcrumbLabel: "Шини для комерційних авто (LCV)",
    seasonSectionDescription: "Кожна модель розроблена з урахуванням специфіки експлуатації комерційних авто у різних умовах.",
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
    ctaDescription: "Наші експерти допоможуть підібрати оптимальні шини для вашого комерційного транспорту з урахуванням типу перевезень та інтенсивності експлуатації.",
    ctaPrimaryLabel: "Отримати консультацію",
    ctaPrimaryHref: "/contacts",
    ctaSecondaryLabel: "Знайти дилера",
    ctaSecondaryHref: "/dealers",
  },
};

// Season page metadata (fallback)
export interface SeasonMeta {
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  heroText: string;
  heroImageSrc: string;
  features: { icon: typeof Car; title: string; description: string; color: { bg: string; text: string } }[];
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
}

export const fallbackSeasonMeta: Record<Season, SeasonMeta> = {
  summer: {
    title: "Літні шини Bridgestone | Шини для теплої пори року",
    description: "Літні шини Bridgestone для легкових авто. Оптимальне зчеплення на сухій та мокрій дорозі, економія палива та комфорт у теплу пору року.",
    h1: "Літні шини Bridgestone",
    subtitle: "оптимальні характеристики для теплої пори року",
    heroText: "Літні шини розроблені для експлуатації при температурі вище +7°C. Спеціальна гумова суміш забезпечує оптимальну еластичність та зчеплення на сухому та мокрому асфальті.",
    heroImageSrc: "/images/hero/hero-summer.webp",
    features: [
      { icon: Thermometer, title: "Для температур вище +7°C", description: "Оптимальна еластичність гуми в теплу пору року.", color: { bg: "bg-red-500/15", text: "text-red-500" } },
      { icon: Zap, title: "Знижений опір коченню", description: "Економія палива до 5% порівняно з всесезонними.", color: { bg: "bg-amber-500/15", text: "text-amber-500" } },
      { icon: Shield, title: "Відмінне гальмування", description: "Скорочення гальмівного шляху на сухій дорозі.", color: { bg: "bg-emerald-500/15", text: "text-emerald-500" } },
      { icon: Car, title: "Тиха їзда", description: "Оптимізований протектор для низького рівня шуму.", color: { bg: "bg-blue-500/15", text: "text-blue-500" } },
    ],
    ctaTitle: "Потрібна допомога у виборі?",
    ctaDescription: "Наші експерти допоможуть підібрати ідеальні літні шини для вашого автомобіля з урахуванням стилю водіння та умов експлуатації.",
    ctaPrimaryLabel: "Отримати консультацію",
    ctaPrimaryHref: "/contacts",
    ctaSecondaryLabel: "Знайти дилера",
    ctaSecondaryHref: "/dealers",
  },
  winter: {
    title: "Зимові шини Bridgestone | Шини для снігу та льоду",
    description: "Зимові шини Bridgestone для безпечної їзди взимку. Надійне зчеплення на снігу, льоду та сльоті, стабільність при низьких температурах.",
    h1: "Зимові шини Bridgestone",
    subtitle: "безпека та контроль у зимових умовах",
    heroText: "Зимові шини обов'язкові при температурі нижче +7°C. Спеціальна м'яка гумова суміш та ламелі забезпечують зчеплення на снігу, льоду та мокрій дорозі.",
    heroImageSrc: "/images/hero/hero-winter.webp",
    features: [
      { icon: Snowflake, title: "Позначка 3PMSF", description: "Сертифіковані для суворих зимових умов.", color: { bg: "bg-sky-500/15", text: "text-sky-500" } },
      { icon: Shield, title: "Зчеплення на льоду", description: "Мікро-ламелі для контролю на слизькій поверхні.", color: { bg: "bg-emerald-500/15", text: "text-emerald-500" } },
      { icon: Thermometer, title: "М'яка гумова суміш", description: "Зберігає еластичність при морозі до -40°C.", color: { bg: "bg-red-500/15", text: "text-red-500" } },
      { icon: Car, title: "Відведення сльоти", description: "Глибокі канали для відведення снігу та води.", color: { bg: "bg-blue-500/15", text: "text-blue-500" } },
    ],
    ctaTitle: "Потрібна допомога у виборі?",
    ctaDescription: "Наші експерти допоможуть підібрати ідеальні зимові шини для вашого автомобіля з урахуванням стилю водіння та умов експлуатації.",
    ctaPrimaryLabel: "Отримати консультацію",
    ctaPrimaryHref: "/contacts",
    ctaSecondaryLabel: "Знайти дилера",
    ctaSecondaryHref: "/dealers",
  },
  allseason: {
    title: "Всесезонні шини Bridgestone | Цілорічне використання",
    description: "Всесезонні шини Bridgestone для цілорічної експлуатації. Універсальне рішення для помірного клімату з балансом характеристик для літа та зими.",
    h1: "Всесезонні шини Bridgestone",
    subtitle: "універсальне рішення на весь рік",
    heroText: "Всесезонні шини — компромісне рішення для регіонів з помірним кліматом. Підходять для цілорічної експлуатації без необхідності сезонної заміни.",
    heroImageSrc: "/images/hero/hero-allseason.webp",
    features: [
      { icon: Cloud, title: "Цілорічна експлуатація", description: "Не потребують сезонної заміни шин.", color: { bg: "bg-amber-500/15", text: "text-amber-500" } },
      { icon: Shield, title: "Позначка M+S", description: "Підходять для легкої зими та літа.", color: { bg: "bg-emerald-500/15", text: "text-emerald-500" } },
      { icon: Zap, title: "Економія коштів", description: "Один комплект замість двох сезонних.", color: { bg: "bg-purple-500/15", text: "text-purple-500" } },
      { icon: Car, title: "Збалансовані характеристики", description: "Прийнятні показники в різних умовах.", color: { bg: "bg-blue-500/15", text: "text-blue-500" } },
    ],
    ctaTitle: "Потрібна допомога у виборі?",
    ctaDescription: "Наші експерти допоможуть підібрати ідеальні всесезонні шини для вашого автомобіля з урахуванням стилю водіння та умов експлуатації.",
    ctaPrimaryLabel: "Отримати консультацію",
    ctaPrimaryHref: "/contacts",
    ctaSecondaryLabel: "Знайти дилера",
    ctaSecondaryHref: "/dealers",
  },
};

// SEO fallback data
export const fallbackSeo: Record<string, { title: string; description: string }> = {
  "passenger-tyres": {
    title: "Легкові шини Bridgestone | Каталог шин для легкових авто",
    description: "Широкий вибір легкових шин Bridgestone для вашого автомобіля. Літні, зимові та всесезонні моделі з гарантією якості для комфортної та безпечної їзди.",
  },
  "suv-4x4-tyres": {
    title: "Шини для SUV та 4x4 Bridgestone | Каталог для позашляховиків",
    description: "Шини Bridgestone для позашляховиків та кросоверів. Підвищена прохідність, надійне зчеплення на будь-якому покритті. Літні, зимові та всесезонні моделі.",
  },
  "lcv-tyres": {
    title: "Шини для комерційних авто (LCV)",
    description: "Шини Bridgestone для легких комерційних авто: фургони, мікроавтобуси, вантажні мінівени. Літні, зимові та всесезонні шини з високою вантажопідйомністю.",
  },
};
