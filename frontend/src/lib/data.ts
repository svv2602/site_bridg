// Структура даних та мок‑дані для прототипу сайту Bridgestone Україна

export type Season = "summer" | "winter" | "allseason";

export type VehicleType = "passenger" | "suv" | "lcv";

export interface TyreSize {
  width: number;
  aspectRatio: number;
  diameter: number;
  loadIndex?: number;
  speedIndex?: string;
}

export type BadgeType = "winner" | "recommended" | "top3" | "best_category" | "eco";
export type BadgeSource = "adac" | "autobild" | "tyrereviews" | "tcs" | "eu_label";

export interface TyreBadge {
  type: BadgeType;
  source: BadgeSource;
  year: number;
  testType: Season;
  label: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface TestResult {
  source: 'adac' | 'autobild' | 'tyrereviews' | 'tcs';
  testType: 'summer' | 'winter' | 'allseason';
  year: number;
  testedSize: string;
  position: number;
  totalTested: number;
  rating: string;
  ratingNumeric: number;
  articleSlug?: string;
}

export interface TyreModel {
  slug: string;
  name: string;
  season: Season;
  vehicleTypes: VehicleType[];
  isNew?: boolean;
  isPopular?: boolean;
  shortDescription: string;
  fullDescription?: unknown; // Lexical rich text JSON
  imageUrl?: string; // URL to tire product image
  euLabel?: {
    wetGrip?: "A" | "B" | "C" | "D" | "E";
    fuelEfficiency?: "A" | "B" | "C" | "D" | "E";
    noiseDb?: number;
  };
  sizes: TyreSize[];
  usage: {
    city?: boolean;
    highway?: boolean;
    offroad?: boolean;
    winter?: boolean;
  };
  technologies?: string[]; // technology slugs
  badges?: TyreBadge[]; // test result badges
  keyBenefits?: string[];
  faqs?: FAQ[];
  testResults?: TestResult[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface VehicleFitment {
  make: string;
  model: string;
  bodyType?: string;
  yearFrom: number;
  yearTo?: number;
  recommendedSizes: TyreSize[];
}

export type DealerType = "official" | "partner" | "service";

export interface Dealer {
  id: string;
  name: string;
  type: DealerType;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  workingHours?: string;
}

export interface Article {
  slug: string;
  title: string;
  subtitle?: string;
  previewText: string;
  content?: unknown; // Lexical rich text content from CMS
  readingTimeMinutes?: number;
  publishedAt?: string; // ISO date
  tags?: string[];
}

export interface Technology {
  slug: string;
  name: string;
  description: string;
  tyreSlugs?: string[];
  icon?: string;
}

// Мок‑дані для прототипу (синхронізовані з seed.ts)

export const MOCK_TYRE_MODELS: TyreModel[] = [
  {
    slug: "turanza-t005",
    name: "Bridgestone Turanza T005",
    season: "summer",
    vehicleTypes: ["passenger"],
    isPopular: true,
    shortDescription:
      "Літні шини для щоденних поїздок містом та трасою з відмінним зчепленням на мокрій дорозі.",
    imageUrl: "https://images.simpletire.com/images/q_auto/line-images/14283/14283-sidetread/bridgestone-turanza-t005.jpg",
    euLabel: {
      wetGrip: "A",
      fuelEfficiency: "B",
      noiseDb: 71,
    },
    sizes: [
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: 91, speedIndex: "V" },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: 94, speedIndex: "W" },
      { width: 235, aspectRatio: 40, diameter: 18, loadIndex: 95, speedIndex: "Y" },
    ],
    usage: {
      city: true,
      highway: true,
    },
    technologies: ["nano-pro-tech", "noise-reduction"],
    keyBenefits: ["Відмінне зчеплення на мокрій дорозі", "Низький рівень шуму", "Економія пального", "Тривалий термін служби"],
  },
  {
    slug: "blizzak-lm005",
    name: "Bridgestone Blizzak LM005",
    season: "winter",
    vehicleTypes: ["passenger", "suv"],
    isPopular: true,
    shortDescription:
      "Зимові шини з фокусом на зчеплення на снігу та мокрому асфальті для безпечного руху взимку.",
    imageUrl: "https://images.simpletire.com/images/q_auto/line-images/17531/17531-sidetread/bridgestone-blizzak-lm005.png",
    euLabel: {
      wetGrip: "A",
      fuelEfficiency: "C",
      noiseDb: 72,
    },
    sizes: [
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: 91, speedIndex: "T" },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: 94, speedIndex: "H" },
      { width: 225, aspectRatio: 50, diameter: 17, loadIndex: 98, speedIndex: "H" },
    ],
    usage: {
      city: true,
      highway: true,
      winter: true,
    },
    technologies: ["winter-compound", "multi-cell"],
    keyBenefits: ["Відмінне зчеплення на снігу", "Коротка гальмівна відстань на льоду", "Стабільність на мокрій дорозі", "Комфортна їзда"],
  },
  {
    slug: "potenza-sport",
    name: "Bridgestone Potenza Sport",
    season: "summer",
    vehicleTypes: ["passenger", "suv"],
    isNew: true,
    isPopular: true,
    shortDescription:
      "Високопродуктивні літні шини для спортивних автомобілів з максимальним зчепленням.",
    euLabel: {
      wetGrip: "A",
      fuelEfficiency: "C",
      noiseDb: 72,
    },
    sizes: [
      { width: 245, aspectRatio: 35, diameter: 19, loadIndex: 93, speedIndex: "Y" },
      { width: 255, aspectRatio: 35, diameter: 20, loadIndex: 97, speedIndex: "Y" },
    ],
    usage: {
      city: true,
      highway: true,
    },
    technologies: ["potenza-adrenalin"],
    keyBenefits: ["Максимальне зчеплення", "Точне кермове управління", "Стабільність на високих швидкостях", "Спортивний дизайн"],
  },
  {
    slug: "weather-control-a005-evo",
    name: "Bridgestone Weather Control A005 EVO",
    season: "allseason",
    vehicleTypes: ["passenger"],
    isNew: true,
    isPopular: true,
    shortDescription:
      "Всесезонні шини нового покоління з сертифікацією 3PMSF для цілорічного використання.",
    euLabel: {
      wetGrip: "A",
      fuelEfficiency: "B",
      noiseDb: 71,
    },
    sizes: [
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: 91, speedIndex: "V" },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: 94, speedIndex: "V" },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: 94, speedIndex: "V" },
    ],
    usage: {
      city: true,
      highway: true,
      winter: true,
    },
    technologies: ["nano-pro-tech", "winter-compound"],
    keyBenefits: ["Цілорічне використання", "Сертифікація 3PMSF", "Відмінне зчеплення", "Економічність"],
  },
  {
    slug: "dueler-hp-sport",
    name: "Bridgestone Dueler H/P Sport",
    season: "summer",
    vehicleTypes: ["suv"],
    isPopular: true,
    shortDescription:
      "Спортивні літні шини для преміум SUV та кросоверів з високими швидкісними характеристиками.",
    euLabel: {
      wetGrip: "A",
      fuelEfficiency: "C",
      noiseDb: 72,
    },
    sizes: [
      { width: 235, aspectRatio: 55, diameter: 19, loadIndex: 101, speedIndex: "V" },
      { width: 255, aspectRatio: 50, diameter: 20, loadIndex: 109, speedIndex: "Y" },
    ],
    usage: {
      city: true,
      highway: true,
      offroad: true,
    },
    technologies: ["potenza-adrenalin", "dueler-ht"],
    keyBenefits: ["Спортивна керованість", "Для преміум SUV", "Високі швидкості", "Комфорт"],
  },
  {
    slug: "blizzak-dm-v3",
    name: "Bridgestone Blizzak DM-V3",
    season: "winter",
    vehicleTypes: ["suv"],
    isPopular: true,
    shortDescription:
      "Преміум зимові шини для SUV та кросоверів з максимальним зчепленням на снігу та льоду.",
    euLabel: {
      wetGrip: "B",
      fuelEfficiency: "C",
      noiseDb: 73,
    },
    sizes: [
      { width: 215, aspectRatio: 70, diameter: 16, loadIndex: 100, speedIndex: "T" },
      { width: 225, aspectRatio: 65, diameter: 17, loadIndex: 102, speedIndex: "T" },
      { width: 235, aspectRatio: 60, diameter: 18, loadIndex: 107, speedIndex: "T" },
    ],
    usage: {
      city: true,
      highway: true,
      offroad: true,
      winter: true,
    },
    technologies: ["winter-compound", "multi-cell", "dueler-ht"],
    keyBenefits: ["Для важких SUV", "Відмінне зчеплення на снігу", "Стабільність", "Довговічність"],
  },
];

export const MOCK_VEHICLE_FITMENTS: VehicleFitment[] = [
  {
    make: "Toyota",
    model: "Corolla",
    bodyType: "sedan",
    yearFrom: 2020,
    yearTo: 2023,
    recommendedSizes: [
      { width: 195, aspectRatio: 65, diameter: 15 },
      { width: 205, aspectRatio: 55, diameter: 16 },
    ],
  },
  {
    make: "Toyota",
    model: "Camry",
    bodyType: "sedan",
    yearFrom: 2020,
    yearTo: 2022,
    recommendedSizes: [
      { width: 215, aspectRatio: 55, diameter: 17 },
      { width: 235, aspectRatio: 45, diameter: 18 },
    ],
  },
  {
    make: "Toyota",
    model: "RAV4",
    bodyType: "suv",
    yearFrom: 2020,
    yearTo: 2022,
    recommendedSizes: [
      { width: 225, aspectRatio: 65, diameter: 17 },
      { width: 235, aspectRatio: 55, diameter: 19 },
    ],
  },
  {
    make: "Volkswagen",
    model: "Tiguan",
    bodyType: "suv",
    yearFrom: 2020,
    yearTo: 2021,
    recommendedSizes: [
      { width: 215, aspectRatio: 65, diameter: 17 },
      { width: 235, aspectRatio: 55, diameter: 18 },
    ],
  },
  {
    make: "Volkswagen",
    model: "Golf",
    bodyType: "hatchback",
    yearFrom: 2020,
    yearTo: 2021,
    recommendedSizes: [
      { width: 205, aspectRatio: 55, diameter: 16 },
      { width: 225, aspectRatio: 45, diameter: 17 },
    ],
  },
  {
    make: "Hyundai",
    model: "Tucson",
    bodyType: "suv",
    yearFrom: 2021,
    yearTo: 2022,
    recommendedSizes: [
      { width: 225, aspectRatio: 60, diameter: 17 },
      { width: 235, aspectRatio: 55, diameter: 19 },
    ],
  },
  {
    make: "Kia",
    model: "Sportage",
    bodyType: "suv",
    yearFrom: 2021,
    yearTo: 2022,
    recommendedSizes: [
      { width: 225, aspectRatio: 60, diameter: 17 },
      { width: 235, aspectRatio: 55, diameter: 19 },
    ],
  },
  {
    make: "BMW",
    model: "3 Series",
    bodyType: "sedan",
    yearFrom: 2020,
    yearTo: 2021,
    recommendedSizes: [
      { width: 225, aspectRatio: 45, diameter: 18 },
      { width: 255, aspectRatio: 35, diameter: 19 },
    ],
  },
  {
    make: "Mercedes-Benz",
    model: "C-Class",
    bodyType: "sedan",
    yearFrom: 2021,
    recommendedSizes: [
      { width: 225, aspectRatio: 45, diameter: 18 },
      { width: 245, aspectRatio: 40, diameter: 19 },
    ],
  },
  {
    make: "Skoda",
    model: "Octavia",
    bodyType: "sedan",
    yearFrom: 2020,
    yearTo: 2021,
    recommendedSizes: [
      { width: 205, aspectRatio: 55, diameter: 16 },
      { width: 225, aspectRatio: 45, diameter: 17 },
    ],
  },
];

export const MOCK_DEALERS: Dealer[] = [
  {
    id: "kyiv-center-1",
    name: "Bridgestone Київ Центр",
    type: "official",
    city: "Київ",
    address: "вул. Велика Васильківська, 100",
    latitude: 50.4301,
    longitude: 30.5134,
    phone: "+380 44 123 45 67",
    website: "https://kyiv.bridgestone.ua",
    workingHours: "Пн–Сб: 9:00–19:00, Нд: 10:00–16:00",
  },
  {
    id: "kyiv-livo-1",
    name: "Bridgestone Київ Лівобережна",
    type: "official",
    city: "Київ",
    address: "просп. Броварський, 25",
    latitude: 50.4587,
    longitude: 30.6234,
    phone: "+380 44 234 56 78",
    workingHours: "Пн–Сб: 8:00–20:00",
  },
  {
    id: "kharkiv-1",
    name: "Bridgestone Харків",
    type: "official",
    city: "Харків",
    address: "вул. Сумська, 100",
    latitude: 49.9935,
    longitude: 36.2304,
    phone: "+380 57 345 67 89",
    workingHours: "Пн–Сб: 9:00–19:00",
  },
  {
    id: "lviv-partner-1",
    name: "Партнер Bridgestone Львів",
    type: "partner",
    city: "Львів",
    address: "вул. Городоцька, 150",
    latitude: 49.8297,
    longitude: 24.0197,
    phone: "+380 32 567 89 01",
    workingHours: "Пн–Пт: 9:00–18:00, Сб: 9:00–14:00",
  },
  {
    id: "odesa-partner-1",
    name: "Партнер Bridgestone Одеса",
    type: "partner",
    city: "Одеса",
    address: "вул. Фонтанська дорога, 20",
    latitude: 46.4525,
    longitude: 30.7533,
    phone: "+380 48 678 90 12",
    workingHours: "Пн–Сб: 8:00–19:00",
  },
];

export const MOCK_ARTICLES: Article[] = [
  {
    slug: "how-to-choose-tyres",
    title: "Як обрати шини для міста та траси",
    subtitle: "Основні критерії вибору шин під ваш стиль водіння",
    previewText:
      "Розбираємо, на що звертати увагу при виборі шин: сезонність, індекси, розмір та тип вашого автомобіля.",
    readingTimeMinutes: 4,
    publishedAt: "2024-01-15",
    tags: ["вибір шин", "поради"],
  },
  {
    slug: "how-to-read-markings",
    title: "Як читати маркування шин",
    subtitle: "Пояснюємо значення основних позначень на боковині шини",
    previewText:
      "Що означають індекси навантаження, швидкості, дата виробництва та інші маркування — простою мовою.",
    readingTimeMinutes: 6,
    publishedAt: "2024-02-20",
    tags: ["маркування", "безпечна експлуатація"],
  },
  {
    slug: "winter-tyre-guide",
    title: "Повний гід по зимових шинах",
    subtitle: "Все що потрібно знати про зимові шини в Україні",
    previewText:
      "Коли міняти шини, як обрати правильний розмір та що таке шиповані шини — відповідаємо на всі питання.",
    readingTimeMinutes: 8,
    publishedAt: "2024-10-01",
    tags: ["зимові шини", "безпека", "поради"],
  },
  {
    slug: "tyre-pressure-importance",
    title: "Чому важливий тиск у шинах",
    subtitle: "Вплив тиску на безпеку та економію",
    previewText:
      "Неправильний тиск може збільшити витрату пального на 5% та скоротити термін служби шин вдвічі.",
    readingTimeMinutes: 5,
    publishedAt: "2024-03-10",
    tags: ["тиск", "безпечна експлуатація", "економія"],
  },
];

export const MOCK_TECHNOLOGIES: Technology[] = [
  {
    slug: "nano-pro-tech",
    name: "Nano Pro-Tech",
    description:
      "Технологія гумової суміші, що забезпечує оптимальний баланс між зчепленням та опором коченню.",
    tyreSlugs: ["turanza-t005", "weather-control-a005-evo"],
    icon: "sparkles",
  },
  {
    slug: "noise-reduction",
    name: "Зниження шуму",
    description:
      "Спеціальний рисунок протектора та конструкція блока протектора для зменшення шуму в салоні.",
    tyreSlugs: ["turanza-t005"],
    icon: "volume-x",
  },
  {
    slug: "winter-compound",
    name: "Зимова гума з кремнієвими добавками",
    description:
      "Суміш, яка залишається еластичною за низьких температур для кращого зчеплення на снігу та льоду.",
    tyreSlugs: ["blizzak-lm005", "blizzak-dm-v3", "weather-control-a005-evo"],
    icon: "snowflake",
  },
  {
    slug: "multi-cell",
    name: "Multi-Cell Compound",
    description:
      "Мікропористий склад гуми для ефективного відведення води з плями контакту.",
    tyreSlugs: ["blizzak-lm005", "blizzak-dm-v3"],
    icon: "grid-3x3",
  },
  {
    slug: "potenza-adrenalin",
    name: "Potenza Adrenalin RE",
    description:
      "Високопродуктивна технологія для максимального зчеплення на сухій та мокрій дорозі.",
    tyreSlugs: ["potenza-sport", "dueler-hp-sport"],
    icon: "zap",
  },
  {
    slug: "dueler-ht",
    name: "Dueler H/T Technology",
    description:
      "Технологія для позашляхових шин з підвищеною міцністю боковини та стійкістю до пошкоджень.",
    tyreSlugs: ["dueler-hp-sport", "blizzak-dm-v3"],
    icon: "mountain",
  },
];
