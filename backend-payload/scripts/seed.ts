/**
 * Seed script for Payload CMS
 *
 * Seeds bootstrap & reference data for development:
 *   - Users (admin + editor)
 *   - Technologies (Bridgestone proprietary tech reference)
 *   - Dealers (3 sample locations)
 *   - Seasonal content (homepage promotions)
 *   - Category pages (vehicle + season page configs)
 *   - Reviews (sample customer reviews, linked to existing tyres)
 *   - Holiday banners
 *   - Site settings
 *
 * Content from pipeline (tyres, articles, vehicle fitments) is NOT seeded here.
 */

import { getPayload } from 'payload';
import config from '../payload.config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to upload local image file to Payload Media
async function uploadLocalImage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  relativePath: string,
  altText: string,
): Promise<string | null> {
  try {
    const sourcePath = path.resolve(__dirname, '../../frontend/public', relativePath);
    if (!fs.existsSync(sourcePath)) {
      console.log(`      File not found: ${sourcePath}`);
      return null;
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = path.basename(sourcePath);
    const tempPath = path.join(tempDir, filename);
    fs.copyFileSync(sourcePath, tempPath);

    const media = await payload.create({
      collection: 'media',
      data: { alt: altText },
      filePath: tempPath,
    });

    fs.unlinkSync(tempPath);
    console.log(`      Uploaded: ${filename}`);
    return media.id;
  } catch (error) {
    console.error(`      Error uploading local image:`, error);
    return null;
  }
}

// ─── Data ────────────────────────────────────────────────────────────────────

const MOCK_TECHNOLOGIES = [
  {
    slug: 'nano-pro-tech',
    name: 'Nano Pro-Tech',
    description:
      'Технологія гумової суміші, що забезпечує оптимальний баланс між зчепленням та опором коченню.',
    icon: 'sparkles',
  },
  {
    slug: 'noise-reduction',
    name: 'Зниження шуму',
    description:
      'Спеціальний рисунок протектора та конструкція блока протектора для зменшення шуму в салоні.',
    icon: 'volume-x',
  },
  {
    slug: 'winter-compound',
    name: 'Зимова гума з кремнієвими добавками',
    description:
      'Суміш, яка залишається еластичною за низьких температур для кращого зчеплення на снігу та льоду.',
    icon: 'snowflake',
  },
  {
    slug: 'multi-cell',
    name: 'Multi-Cell Compound',
    description:
      'Мікропористий склад гуми для ефективного відведення води з плями контакту.',
    icon: 'grid-3x3',
  },
  {
    slug: 'run-flat',
    name: 'Run-Flat Technology',
    description:
      'Технологія, що дозволяє продовжувати рух на пробитій шині до 80 км при швидкості до 80 км/год.',
    icon: 'shield',
  },
  {
    slug: 'ecopia-compound',
    name: 'Ecopia Compound',
    description:
      'Екологічна гумова суміш з низьким опором коченню для економії пального та зменшення викидів CO2.',
    icon: 'leaf',
  },
  {
    slug: 'potenza-adrenalin',
    name: 'Potenza Adrenalin RE',
    description:
      'Високопродуктивна технологія для максимального зчеплення на сухій та мокрій дорозі.',
    icon: 'zap',
  },
  {
    slug: 'dueler-ht',
    name: 'Dueler H/T Technology',
    description:
      'Технологія для позашляхових шин з підвищеною міцністю боковини та стійкістю до пошкоджень.',
    icon: 'mountain',
  },
];

const MOCK_DEALERS = [
  {
    name: 'Bridgestone Київ Центр',
    type: 'official' as const,
    city: 'Київ',
    address: 'вул. Велика Васильківська, 100',
    latitude: 50.4301,
    longitude: 30.5134,
    phone: '+380 44 123 45 67',
    email: 'kyiv.center@bridgestone.org.ua',
    website: 'https://kyiv.bridgestone.org.ua',
    workingHours: 'Пн–Сб: 9:00–19:00, Нд: 10:00–16:00',
    services: ['tire-fitting', 'balancing', 'storage', 'alignment'],
  },
  {
    name: 'Партнер Bridgestone Львів',
    type: 'partner' as const,
    city: 'Львів',
    address: 'вул. Городоцька, 150',
    latitude: 49.8297,
    longitude: 24.0197,
    phone: '+380 32 567 89 01',
    workingHours: 'Пн–Пт: 9:00–18:00, Сб: 9:00–14:00',
    services: ['tire-fitting', 'balancing'],
  },
  {
    name: 'Автосервіс Черкаси',
    type: 'service' as const,
    city: 'Черкаси',
    address: 'бульвар Шевченка, 200',
    latitude: 49.4444,
    longitude: 32.0598,
    phone: '+380 47 345 67 89',
    workingHours: 'Пн–Сб: 8:00–19:00',
    services: ['tire-fitting', 'balancing', 'repair', 'storage'],
  },
];

const MOCK_SEASONAL_CONTENT = [
  {
    name: 'winter-2025-2026',
    isActive: true,
    featuredSeason: 'winter' as const,
    heroTitle: 'Зимові шини Bridgestone',
    heroSubtitle: 'Безпека на дорозі взимку',
    ctaText: 'Переглянути зимові моделі',
    ctaLink: '/passenger-tyres/winter',
    gradient: 'from-blue-900 to-slate-900',
    promoText: 'Знижки до 15% на зимові шини Blizzak до кінця лютого!',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2026-03-31'),
  },
  {
    name: 'summer-2026',
    isActive: true,
    featuredSeason: 'summer' as const,
    heroTitle: 'Літні шини Bridgestone',
    heroSubtitle: 'Максимальне зчеплення в теплу пору',
    ctaText: 'Переглянути літні моделі',
    ctaLink: '/passenger-tyres/summer',
    gradient: 'from-amber-800 to-stone-900',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-09-30'),
  },
];

const MOCK_REVIEWS = [
  { authorName: 'Олександр', authorCity: 'Київ', rating: 5, title: 'Відмінні шини для зими', content: 'Встановив на Camry, проїхав вже 10 000 км. Чудове зчеплення на мокрій дорозі та снігу. Рівень шуму мінімальний.', vehicleInfo: 'Toyota Camry 2021', usagePeriod: '6 місяців', pros: [{ text: 'Відмінне зчеплення' }, { text: 'Низький рівень шуму' }], cons: [{ text: 'Ціна вища за середню' }], isPublished: true },
  { authorName: 'Марина', authorCity: 'Львів', rating: 4, title: 'Хороший баланс ціна-якість', content: 'Шини тримають дорогу впевнено. На мокрому асфальті гальмування передбачуване. Знос рівномірний.', vehicleInfo: 'Volkswagen Golf 2020', usagePeriod: '1 рік', pros: [{ text: 'Стабільність на швидкості' }, { text: 'Рівномірний знос' }], cons: [{ text: 'Жорсткуваті на ямах' }], isPublished: true },
  { authorName: 'Віктор', authorCity: 'Одеса', rating: 5, title: 'Найкращі всесезонні шини', content: 'Їжджу цілий рік на одному комплекті. Навіть в легкий сніг почуваюся впевнено. Рекомендую для тих, хто не хоче міняти шини двічі на рік.', vehicleInfo: 'Mazda CX-5 2022', usagePeriod: '1.5 роки', pros: [{ text: 'Універсальність' }, { text: 'Комфорт' }, { text: 'Тихі' }], cons: [], isPublished: true },
  { authorName: 'Ірина', authorCity: 'Харків', rating: 4, title: 'Задоволена покупкою', content: 'Взяла за рекомендацією дилера. Шини м\'які, комфортні. На мокрій дорозі тримають добре.', vehicleInfo: 'Hyundai Tucson 2021', usagePeriod: '8 місяців', pros: [{ text: 'Комфорт' }, { text: 'Тиха робота' }], cons: [{ text: 'На гравію трохи ковзають' }], isPublished: true },
  { authorName: 'Дмитро', authorCity: 'Дніпро', rating: 5, title: 'Топові літні шини', content: 'Вже другий комплект Bridgestone на моєму авто. Попередні відходили 50 000 км. Ці також не розчаровують — чудове зчеплення і мінімальний шум.', vehicleInfo: 'BMW 3 Series 2020', usagePeriod: '2 роки', pros: [{ text: 'Довговічність' }, { text: 'Зчеплення' }, { text: 'Керованість' }], cons: [], isPublished: true },
  { authorName: 'Андрій', authorCity: 'Запоріжжя', rating: 3, title: 'Нормальні шини, але є нюанси', content: 'На сухому асфальті все чудово. На мокрому гальмівний шлях трохи довший ніж очікував. Загалом за свою ціну — нормальний варіант.', vehicleInfo: 'Skoda Octavia 2019', usagePeriod: '4 місяці', pros: [{ text: 'Ціна' }], cons: [{ text: 'Гальмування на мокрому' }], isPublished: true },
];

const CATEGORY_PAGES_DATA = [
  // Vehicle pages
  {
    slug: 'passenger-tyres',
    pageType: 'vehicle' as const,
    vehicleType: 'passenger' as const,
    seoTitle: 'Легкові шини Bridgestone | Каталог шин для легкових авто',
    seoDescription: 'Широкий вибір легкових шин Bridgestone для вашого автомобіля. Літні, зимові та всесезонні моделі з гарантією якості для комфортної та безпечної їзди.',
    title: 'Легкові шини Bridgestone',
    subtitle: 'технічний підбір для щоденних поїздок та далеких подорожей',
    heroDescription: 'Від міських маршрутів до траси — оберіть літні, зимові або всесезонні шини Bridgestone під ваш стиль водіння. Інформація подана в більш «технічному» стилі, узгодженому з пошуком шин.',
    heroImagePath: 'images/hero/hero-passenger.webp',
    heroImageAlt: 'Легкові шини Bridgestone',
    breadcrumbLabel: 'Шини для легкових авто',
    heroOverlay: {
      icon: 'car',
      iconBg: 'bg-blue-500/15',
      iconText: 'text-blue-500',
      title: 'Легкові шини Bridgestone',
      description: 'Комфорт та безпека для щоденних поїздок',
    },
    features: [
      { icon: 'car', title: 'Комфорт та керованість', description: 'Оптимальна жорсткість та форма протектора для комфортної їзди.', colorBg: 'bg-blue-500/15', colorText: 'text-blue-500' },
      { icon: 'shield', title: 'Безпека на мокрій дорозі', description: 'Глибокі дренажні канали для швидкого відведення води.', colorBg: 'bg-emerald-500/15', colorText: 'text-emerald-500' },
      { icon: 'zap', title: 'Економія палива', description: 'Знижений опір коченню завдяки спеціальним матеріалам.', colorBg: 'bg-amber-500/15', colorText: 'text-amber-500' },
      { icon: 'star', title: 'Довговічність', description: 'Міцна конструкція та стійкість до зносу на українських дорогах.', colorBg: 'bg-purple-500/15', colorText: 'text-purple-500' },
    ],
    seasonSectionDescription: 'Кожна модель розроблена з урахуванням специфіки експлуатації легкових авто у різних умовах.',
    seasonDescriptionSummer: 'Ідеальні для літніх подорожей містом та трасою, забезпечують комфорт та економію палива.',
    seasonDescriptionWinter: 'Надійне зчеплення на снігу, льоду та сльоті для безпеки в зимових умовах.',
    seasonDescriptionAllseason: 'Універсальні шини для цілорічної експлуатації в різних дорожніх умовах.',
    seasonInitialCount: 3,
    featuredTitle: 'Популярні моделі для легкових авто',
    featuredCount: 6,
    filterPopular: true,
    reviewsVehicleType: 'passenger' as const,
    reviewsTitle: 'Відгуки про легкові шини',
    reviewsLimit: 6,
    reviewsShowAllLink: true,
    ctaTitle: 'Потрібна допомога у виборі?',
    ctaDescription: 'Наші експерти допоможуть підібрати ідеальні шини для вашого автомобіля з урахуванням стилю водіння, умов експлуатації та бюджету.',
    ctaPrimaryLabel: 'Отримати консультацію',
    ctaPrimaryHref: '/contacts',
    ctaSecondaryLabel: 'Знайти дилера',
    ctaSecondaryHref: '/dealers',
  },
  {
    slug: 'suv-4x4-tyres',
    pageType: 'vehicle' as const,
    vehicleType: 'suv' as const,
    seoTitle: 'Шини для SUV та 4x4 Bridgestone | Каталог для позашляховиків',
    seoDescription: 'Шини Bridgestone для позашляховиків та кросоверів. Підвищена прохідність, надійне зчеплення на будь-якому покритті. Літні, зимові та всесезонні моделі.',
    title: 'Шини Bridgestone для SUV та 4x4',
    subtitle: 'технічний підбір для важчих авто, позашляховиків та кросоверів',
    heroDescription: 'Підкорюйте бездоріжжя, гірські серпантини чи міські бордюри — оберіть шини Bridgestone, розроблені для стабільності та зчеплення потужних автомобілів у різних умовах.',
    heroImagePath: 'images/hero/hero-suv.webp',
    heroImageAlt: 'Шини для SUV та 4x4 Bridgestone',
    breadcrumbLabel: 'Шини для SUV та 4x4',
    heroOverlay: {
      icon: 'mountain',
      iconBg: 'bg-orange-500/15',
      iconText: 'text-orange-500',
      title: 'SUV та 4x4 з Bridgestone',
      description: 'Надійність та прохідність для позашляховиків',
    },
    features: [
      { icon: 'car', title: 'Посилена конструкція', description: 'Каркас, розрахований на великі навантаження та складні дорожні умови.', colorBg: 'bg-blue-500/15', colorText: 'text-blue-500' },
      { icon: 'shield', title: 'Захист від пошкоджень', description: 'Технології захисту боковини та протектора від каміння та ударів.', colorBg: 'bg-emerald-500/15', colorText: 'text-emerald-500' },
      { icon: 'zap', title: 'Висока прохідність', description: 'Малюнок протектора, що забезпечує зчеплення на гравії, снігу та бруді.', colorBg: 'bg-amber-500/15', colorText: 'text-amber-500' },
      { icon: 'mountain', title: 'Стабільність на швидкості', description: 'Оптимізована форма плеча для стабільної поведінки на трасі.', colorBg: 'bg-orange-500/15', colorText: 'text-orange-500' },
    ],
    seasonSectionDescription: 'Кожна модель розроблена з урахуванням специфіки експлуатації SUV та 4x4 у різних умовах.',
    seasonDescriptionSummer: 'Ідеальні для літніх подорожей містом та трасою, забезпечують комфорт та економію палива.',
    seasonDescriptionWinter: 'Надійне зчеплення на снігу, льоду та сльоті для безпеки в зимових умовах.',
    seasonDescriptionAllseason: 'Універсальні шини для цілорічної експлуатації в різних дорожніх умовах.',
    seasonInitialCount: 2,
    featuredTitle: 'Популярні моделі для SUV',
    featuredCount: 6,
    filterPopular: false,
    reviewsVehicleType: 'suv' as const,
    reviewsTitle: 'Відгуки про шини для SUV',
    reviewsLimit: 3,
    reviewsShowAllLink: false,
    ctaTitle: 'Потрібна допомога у виборі?',
    ctaDescription: 'Наші експерти допоможуть підібрати ідеальні шини для вашого позашляховика з урахуванням стилю водіння, умов експлуатації та бюджету.',
    ctaPrimaryLabel: 'Отримати консультацію',
    ctaPrimaryHref: '/contacts',
    ctaSecondaryLabel: 'Знайти дилера',
    ctaSecondaryHref: '/dealers',
  },
  {
    slug: 'lcv-tyres',
    pageType: 'vehicle' as const,
    vehicleType: 'van' as const,
    seoTitle: 'Шини для комерційних авто (LCV)',
    seoDescription: 'Шини Bridgestone для легких комерційних авто: фургони, мікроавтобуси, вантажні мінівени. Літні, зимові та всесезонні шини з високою вантажопідйомністю.',
    title: 'Шини для комерційних авто',
    subtitle: 'надійні рішення для вантажних перевезень та бізнесу',
    heroDescription: 'Шини Bridgestone для фургонів, мікроавтобусів та легких вантажівок. Витримують інтенсивні навантаження, забезпечують економію та безпеку при щоденних комерційних перевезеннях.',
    heroImagePath: 'images/hero/hero-lcv.webp',
    heroImageAlt: 'Шини для комерційних авто Bridgestone',
    breadcrumbLabel: 'Шини для комерційних авто (LCV)',
    heroOverlay: {
      icon: 'truck',
      iconBg: 'bg-stone-500/15',
      iconText: 'text-stone-400',
      title: 'Комерційні шини Bridgestone',
      description: 'Для фургонів, мікроавтобусів та легких вантажівок',
    },
    features: [
      { icon: 'weight', title: 'Висока вантажопідйомність', description: 'Посилена конструкція для перевезення важких вантажів.', colorBg: 'bg-stone-500/15', colorText: 'text-stone-500' },
      { icon: 'shield', title: 'Стійкість до зносу', description: 'Спеціальна гумова суміш для інтенсивної експлуатації.', colorBg: 'bg-emerald-500/15', colorText: 'text-emerald-500' },
      { icon: 'zap', title: 'Економія палива', description: 'Знижений опір коченню для зменшення витрат на пальне.', colorBg: 'bg-amber-500/15', colorText: 'text-amber-500' },
      { icon: 'gauge', title: 'Безпека при повному завантаженні', description: 'Надійне гальмування та керованість з повним навантаженням.', colorBg: 'bg-cyan-500/15', colorText: 'text-cyan-500' },
    ],
    seasonSectionDescription: 'Кожна модель розроблена з урахуванням специфіки експлуатації комерційних авто у різних умовах.',
    seasonDescriptionSummer: 'Для інтенсивних перевезень у теплий сезон, оптимізовані для високого пробігу.',
    seasonDescriptionWinter: 'Надійне зчеплення на снігу та льоду для безпечних зимових доставок.',
    seasonDescriptionAllseason: 'Універсальні шини для цілорічної комерційної експлуатації.',
    seasonInitialCount: 2,
    featuredTitle: 'Популярні моделі для комерційних авто',
    featuredCount: 6,
    filterPopular: false,
    reviewsVehicleType: 'van' as const,
    reviewsTitle: 'Відгуки про комерційні шини',
    reviewsLimit: 3,
    reviewsShowAllLink: false,
    ctaTitle: 'Потрібна консультація для автопарку?',
    ctaDescription: 'Наші експерти допоможуть підібрати оптимальні шини для вашого комерційного транспорту з урахуванням типу перевезень та інтенсивності експлуатації.',
    ctaPrimaryLabel: 'Отримати консультацію',
    ctaPrimaryHref: '/contacts',
    ctaSecondaryLabel: 'Знайти дилера',
    ctaSecondaryHref: '/dealers',
  },
  // Season pages
  {
    slug: 'summer',
    pageType: 'season' as const,
    season: 'summer' as const,
    seoTitle: 'Літні шини Bridgestone | Шини для теплої пори року',
    seoDescription: 'Літні шини Bridgestone для легкових авто. Оптимальне зчеплення на сухій та мокрій дорозі, економія палива та комфорт у теплу пору року.',
    title: 'Літні шини Bridgestone',
    subtitle: 'оптимальні характеристики для теплої пори року',
    heroDescription: 'Літні шини розроблені для експлуатації при температурі вище +7°C. Спеціальна гумова суміш забезпечує оптимальну еластичність та зчеплення на сухому та мокрому асфальті.',
    heroImagePath: 'images/hero/hero-summer.webp',
    heroImageAlt: 'Літні шини Bridgestone',
    breadcrumbLabel: 'Літні шини',
    features: [
      { icon: 'thermometer', title: 'Для температур вище +7°C', description: 'Оптимальна еластичність гуми в теплу пору року.', colorBg: 'bg-red-500/15', colorText: 'text-red-500' },
      { icon: 'zap', title: 'Знижений опір коченню', description: 'Економія палива до 5% порівняно з всесезонними.', colorBg: 'bg-amber-500/15', colorText: 'text-amber-500' },
      { icon: 'shield', title: 'Відмінне гальмування', description: 'Скорочення гальмівного шляху на сухій дорозі.', colorBg: 'bg-emerald-500/15', colorText: 'text-emerald-500' },
      { icon: 'car', title: 'Тиха їзда', description: 'Оптимізований протектор для низького рівня шуму.', colorBg: 'bg-blue-500/15', colorText: 'text-blue-500' },
    ],
    ctaTitle: 'Потрібна допомога у виборі?',
    ctaDescription: 'Наші експерти допоможуть підібрати ідеальні літні шини для вашого автомобіля з урахуванням стилю водіння та умов експлуатації.',
    ctaPrimaryLabel: 'Отримати консультацію',
    ctaPrimaryHref: '/contacts',
    ctaSecondaryLabel: 'Знайти дилера',
    ctaSecondaryHref: '/dealers',
  },
  {
    slug: 'winter',
    pageType: 'season' as const,
    season: 'winter' as const,
    seoTitle: 'Зимові шини Bridgestone | Шини для снігу та льоду',
    seoDescription: 'Зимові шини Bridgestone для безпечної їзди взимку. Надійне зчеплення на снігу, льоду та сльоті, стабільність при низьких температурах.',
    title: 'Зимові шини Bridgestone',
    subtitle: 'безпека та контроль у зимових умовах',
    heroDescription: "Зимові шини обов'язкові при температурі нижче +7°C. Спеціальна м'яка гумова суміш та ламелі забезпечують зчеплення на снігу, льоду та мокрій дорозі.",
    heroImagePath: 'images/hero/hero-winter.webp',
    heroImageAlt: 'Зимові шини Bridgestone',
    breadcrumbLabel: 'Зимові шини',
    features: [
      { icon: 'snowflake', title: 'Позначка 3PMSF', description: 'Сертифіковані для суворих зимових умов.', colorBg: 'bg-sky-500/15', colorText: 'text-sky-500' },
      { icon: 'shield', title: 'Зчеплення на льоду', description: 'Мікро-ламелі для контролю на слизькій поверхні.', colorBg: 'bg-emerald-500/15', colorText: 'text-emerald-500' },
      { icon: 'thermometer', title: "М'яка гумова суміш", description: 'Зберігає еластичність при морозі до -40°C.', colorBg: 'bg-red-500/15', colorText: 'text-red-500' },
      { icon: 'car', title: 'Відведення сльоти', description: 'Глибокі канали для відведення снігу та води.', colorBg: 'bg-blue-500/15', colorText: 'text-blue-500' },
    ],
    ctaTitle: 'Потрібна допомога у виборі?',
    ctaDescription: 'Наші експерти допоможуть підібрати ідеальні зимові шини для вашого автомобіля з урахуванням стилю водіння та умов експлуатації.',
    ctaPrimaryLabel: 'Отримати консультацію',
    ctaPrimaryHref: '/contacts',
    ctaSecondaryLabel: 'Знайти дилера',
    ctaSecondaryHref: '/dealers',
  },
  {
    slug: 'allseason',
    pageType: 'season' as const,
    season: 'allseason' as const,
    seoTitle: 'Всесезонні шини Bridgestone | Цілорічне використання',
    seoDescription: 'Всесезонні шини Bridgestone для цілорічної експлуатації. Універсальне рішення для помірного клімату з балансом характеристик для літа та зими.',
    title: 'Всесезонні шини Bridgestone',
    subtitle: 'універсальне рішення на весь рік',
    heroDescription: "Всесезонні шини — компромісне рішення для регіонів з помірним кліматом. Підходять для цілорічної експлуатації без необхідності сезонної заміни.",
    heroImagePath: 'images/hero/hero-allseason.webp',
    heroImageAlt: 'Всесезонні шини Bridgestone',
    breadcrumbLabel: 'Всесезонні шини',
    features: [
      { icon: 'cloud', title: 'Цілорічна експлуатація', description: 'Не потребують сезонної заміни шин.', colorBg: 'bg-amber-500/15', colorText: 'text-amber-500' },
      { icon: 'shield', title: 'Позначка M+S', description: 'Підходять для легкої зими та літа.', colorBg: 'bg-emerald-500/15', colorText: 'text-emerald-500' },
      { icon: 'zap', title: 'Економія коштів', description: 'Один комплект замість двох сезонних.', colorBg: 'bg-purple-500/15', colorText: 'text-purple-500' },
      { icon: 'car', title: 'Збалансовані характеристики', description: 'Прийнятні показники в різних умовах.', colorBg: 'bg-blue-500/15', colorText: 'text-blue-500' },
    ],
    ctaTitle: 'Потрібна допомога у виборі?',
    ctaDescription: 'Наші експерти допоможуть підібрати ідеальні всесезонні шини для вашого автомобіля з урахуванням стилю водіння та умов експлуатації.',
    ctaPrimaryLabel: 'Отримати консультацію',
    ctaPrimaryHref: '/contacts',
    ctaSecondaryLabel: 'Знайти дилера',
    ctaSecondaryHref: '/dealers',
  },
];

const HOLIDAY_BANNERS = [
  {
    name: 'Новий рік',
    isActive: true,
    priority: 90,
    holidayMonth: '12',
    holidayDay: 31,
    showDaysBefore: 14,
    showDaysAfter: 3,
    displayOn: 'all-pages',
    emoji: '🎄',
    title: 'З Новим Роком!',
    subtitle: 'Bridgestone вітає з новорічними святами',
    link: '/shyny',
    linkText: 'Переглянути зимові шини',
    backgroundColor: 'bg-red-700',
    textColor: 'text-white',
  },
  {
    name: 'День Незалежності України',
    isActive: true,
    priority: 80,
    holidayMonth: '8',
    holidayDay: 24,
    showDaysBefore: 3,
    showDaysAfter: 1,
    displayOn: 'all-pages',
    emoji: '🇺🇦',
    title: 'З Днем Незалежності!',
    subtitle: 'Слава Україні!',
    backgroundColor: 'bg-blue-600',
    textColor: 'text-yellow-300',
  },
  {
    name: 'Міжнародний жіночий день',
    isActive: true,
    priority: 70,
    holidayMonth: '3',
    holidayDay: 8,
    showDaysBefore: 3,
    showDaysAfter: 1,
    displayOn: 'homepage',
    emoji: '🌷',
    title: 'Зі святом 8 Березня!',
    subtitle: 'Bridgestone вітає всіх жінок зі святом',
    backgroundColor: 'bg-pink-600',
    textColor: 'text-white',
  },
  {
    name: 'День Конституції',
    isActive: true,
    priority: 60,
    holidayMonth: '6',
    holidayDay: 28,
    showDaysBefore: 2,
    showDaysAfter: 1,
    displayOn: 'homepage',
    emoji: '📜',
    title: 'З Днем Конституції!',
    subtitle: 'Вітаємо з державним святом',
    backgroundColor: 'bg-blue-700',
    textColor: 'text-yellow-300',
  },
  {
    name: 'Сезон зміни шин (весна)',
    isActive: true,
    priority: 95,
    holidayMonth: '3',
    holidayDay: 15,
    showDaysBefore: 7,
    showDaysAfter: 14,
    displayOn: 'all-pages',
    emoji: '🔄',
    title: 'Час міняти шини на літні!',
    subtitle: 'Запишіться на шиномонтаж у найближчого дилера',
    link: '/dealers',
    linkText: 'Знайти дилера',
    backgroundColor: 'bg-emerald-600',
    textColor: 'text-white',
  },
  {
    name: 'Сезон зміни шин (осінь)',
    isActive: true,
    priority: 95,
    holidayMonth: '10',
    holidayDay: 15,
    showDaysBefore: 7,
    showDaysAfter: 14,
    displayOn: 'all-pages',
    emoji: '❄️',
    title: 'Час міняти шини на зимові!',
    subtitle: 'Оберіть зимові шини Bridgestone для безпеки',
    link: '/shyny?season=winter',
    linkText: 'Зимові шини',
    backgroundColor: 'bg-sky-700',
    textColor: 'text-white',
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting seed...\n');

  const payload = await getPayload({ config });
  const forceReseed = process.argv.includes('--force');

  // Check for existing data
  const existingTech = await payload.find({ collection: 'technologies', limit: 1 });
  if (existingTech.totalDocs > 0) {
    if (forceReseed) {
      console.log('🗑️  Force mode: Clearing seed data...');

      const collections = [
        'reviews',
        'category-pages',
        'seasonal-content',
        'holiday-banners',
        'dealers',
        'technologies',
        'media',
      ] as const;

      for (const collection of collections) {
        try {
          const items = await payload.find({ collection, limit: 1000 });
          for (const item of items.docs) {
            await payload.delete({ collection, id: item.id });
          }
          console.log(`   Deleted ${items.docs.length} ${collection}`);
        } catch {
          console.log(`   Skipped ${collection} (may not exist)`);
        }
      }
      console.log('');
    } else {
      console.log('⚠️  Database already has data. Skipping seed.');
      console.log('   Use --force flag to reseed.\n');
      process.exit(0);
    }
  }

  // Create users
  console.log('👤 Creating users...');
  const existingUsers = await payload.find({ collection: 'users', limit: 1 });
  if (existingUsers.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@bridgestone.org.ua',
        password: 'Admin123!',
        name: 'Адміністратор',
        role: 'admin',
      },
    });
    console.log('   ✅ Admin: admin@bridgestone.org.ua / Admin123!');

    await payload.create({
      collection: 'users',
      data: {
        email: 'editor@bridgestone.org.ua',
        password: 'Editor123!',
        name: 'Контент-менеджер',
        role: 'editor',
      },
    });
    console.log('   ✅ Editor: editor@bridgestone.org.ua / Editor123!');
    console.log('');
  } else {
    console.log('   ℹ️  Users already exist\n');
  }

  // Seed Technologies
  console.log('🔧 Seeding technologies...');
  for (const tech of MOCK_TECHNOLOGIES) {
    await payload.create({
      collection: 'technologies',
      data: tech,
    });
    console.log(`   ✅ ${tech.name}`);
  }
  console.log(`   Total: ${MOCK_TECHNOLOGIES.length} technologies\n`);

  // Seed Dealers
  console.log('🏪 Seeding dealers...');
  for (const dealer of MOCK_DEALERS) {
    await payload.create({
      collection: 'dealers',
      data: dealer,
    });
    console.log(`   ✅ ${dealer.name}`);
  }
  console.log(`   Total: ${MOCK_DEALERS.length} dealers\n`);

  // Seed Seasonal Content
  console.log('🗓️  Seeding seasonal content...');
  for (const content of MOCK_SEASONAL_CONTENT) {
    await payload.create({
      collection: 'seasonal-content',
      data: content,
    });
    console.log(`   ✅ ${content.name} (active: ${content.isActive})`);
  }
  console.log(`   Total: ${MOCK_SEASONAL_CONTENT.length} seasonal configs\n`);

  // Seed Reviews (linked to existing tyres if available)
  console.log('⭐ Seeding reviews...');
  const tyresResult = await payload.find({ collection: 'tyres', limit: 10 });
  const tyreIds = tyresResult.docs.map((t: { id: number }) => t.id);
  if (tyreIds.length > 0) {
    for (let i = 0; i < MOCK_REVIEWS.length; i++) {
      await payload.create({
        collection: 'reviews',
        data: { ...MOCK_REVIEWS[i], tyre: tyreIds[i % tyreIds.length] },
      });
    }
    console.log(`   ✅ ${MOCK_REVIEWS.length} reviews created`);
  } else {
    console.log('   ⚠️  No tyres in DB — skipping reviews (run scraper first, then reseed with --force)');
  }
  console.log('');

  // Seed Category Pages
  console.log('📄 Seeding category pages...');
  for (const page of CATEGORY_PAGES_DATA) {
    const { heroImagePath, heroOverlay, ...rest } = page as typeof page & { heroImagePath?: string; heroOverlay?: Record<string, string> };

    let heroImageId: string | null = null;
    if (heroImagePath) {
      heroImageId = await uploadLocalImage(payload, heroImagePath, rest.heroImageAlt || rest.title);
    }

    await payload.create({
      collection: 'category-pages',
      data: {
        ...rest,
        ...(heroImageId && { heroImage: heroImageId }),
        ...(heroOverlay && { heroOverlay }),
      },
    });
    console.log(`   ✅ ${rest.title} (${rest.slug})`);
  }
  console.log(`   Total: ${CATEGORY_PAGES_DATA.length} category pages\n`);

  // Seed Holiday Banners
  console.log('🎉 Seeding holiday banners...');
  for (const banner of HOLIDAY_BANNERS) {
    await payload.create({ collection: 'holiday-banners', data: banner });
    console.log(`   ✅ ${banner.name} (${banner.holidayDay}.${banner.holidayMonth})`);
  }
  console.log(`   Total: ${HOLIDAY_BANNERS.length} holiday banners\n`);

  // Seed Site Settings (global)
  console.log('⚙️  Seeding site settings...');
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      phoneDisplay: '0 800 123 456',
      phoneHref: 'tel:+380800123456',
      emailSupport: 'support@bridgestone.org.ua',
      emailPrivacy: 'privacy@bridgestone.org.ua',
      emailInfo: 'info@bridgestone.org.ua',
      city: 'Київ',
      addressFull: 'м. Київ, вул. Прикладна, 10',
      country: 'UA',
      facebook: 'https://www.facebook.com/BridgestoneUkraine',
      instagram: 'https://www.instagram.com/bridgestone_ukraine',
      telegram: 'https://t.me/bridgestone_ua',
      website: 'https://www.bridgestone.com',
      workingHours: 'Пн-Пт 9:00-18:00',
    },
  });
  console.log('   ✅ Site settings seeded\n');

  console.log('✨ Seed completed successfully!\n');
  console.log('Summary:');
  console.log(`   - 2 users (admin + editor)`);
  console.log(`   - ${MOCK_TECHNOLOGIES.length} technologies`);
  console.log(`   - ${MOCK_DEALERS.length} dealers`);
  console.log(`   - ${MOCK_SEASONAL_CONTENT.length} seasonal configs`);
  console.log(`   - ${MOCK_REVIEWS.length} reviews (if tyres exist)`);
  console.log(`   - ${CATEGORY_PAGES_DATA.length} category pages`);
  console.log(`   - ${HOLIDAY_BANNERS.length} holiday banners`);
  console.log(`   - 1 site settings global\n`);
  console.log('Admin panel:');
  console.log('   URL:    http://localhost:3001/admin');
  console.log('   Admin:  admin@bridgestone.org.ua / Admin123!');
  console.log('   Editor: editor@bridgestone.org.ua / Editor123!\n');

  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
