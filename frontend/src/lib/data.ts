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

export interface TyreModel {
  slug: string;
  name: string;
  season: Season;
  vehicleTypes: VehicleType[];
  isNew?: boolean;
  isPopular?: boolean;
  shortDescription: string;
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

// Мок‑дані для прототипу

export const MOCK_TYRE_MODELS: TyreModel[] = [
  {
    slug: "turanza-t005",
    name: "Bridgestone Turanza T005",
    season: "summer",
    vehicleTypes: ["passenger"],
    isPopular: true,
    shortDescription:
      "Літні шини для щоденних поїздок містом та трасою з відмінним зчепленням на мокрій дорозі.",
    euLabel: {
      wetGrip: "A",
      fuelEfficiency: "B",
      noiseDb: 71,
    },
    sizes: [
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: 91, speedIndex: "V" },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: 94, speedIndex: "W" },
    ],
    usage: {
      city: true,
      highway: true,
    },
    technologies: ["nano-pro-tech", "noise-reduction"],
  },
  {
    slug: "blizzak-lm005",
    name: "Bridgestone Blizzak LM005",
    season: "winter",
    vehicleTypes: ["passenger", "suv"],
    isPopular: true,
    shortDescription:
      "Зимові шини з фокусом на зчеплення на снігу та мокрому асфальті для безпечного руху взимку.",
    sizes: [
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: 91, speedIndex: "T" },
      { width: 225, aspectRatio: 50, diameter: 17, loadIndex: 98, speedIndex: "H" },
    ],
    usage: {
      city: true,
      highway: true,
      winter: true,
    },
    technologies: ["winter-compound", "multi-cell"],
  },
];

export const MOCK_VEHICLE_FITMENTS: VehicleFitment[] = [
  {
    make: "Toyota",
    model: "Corolla",
    bodyType: "sedan",
    yearFrom: 2015,
    recommendedSizes: [
      { width: 195, aspectRatio: 65, diameter: 15 },
      { width: 205, aspectRatio: 55, diameter: 16 },
    ],
  },
  {
    make: "Volkswagen",
    model: "Tiguan",
    bodyType: "suv",
    yearFrom: 2018,
    recommendedSizes: [{ width: 215, aspectRatio: 65, diameter: 17 }],
  },
];

export const MOCK_DEALERS: Dealer[] = [
  {
    id: "kyiv-center-1",
    name: "Bridgestone Київ Центр",
    type: "official",
    city: "Київ",
    address: "вул. Прикладна, 10",
    latitude: 50.4501,
    longitude: 30.5234,
    phone: "+380 44 000 00 00",
    website: "https://example-bridgestone-kyiv.ua",
    workingHours: "Пн–Сб: 9:00–19:00",
  },
  {
    id: "lviv-partner-1",
    name: "Партнер Bridgestone Львів",
    type: "partner",
    city: "Львів",
    address: "просп. Свободи, 25",
    phone: "+380 32 000 00 00",
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
    tags: ["вибір шин", "поради"],
  },
  {
    slug: "how-to-read-markings",
    title: "Як читати маркування шин",
    subtitle: "Пояснюємо значення основних позначень на боковині шини",
    previewText:
      "Що означають індекси навантаження, швидкості, дата виробництва та інші маркування — простою мовою.",
    readingTimeMinutes: 6,
    tags: ["маркування", "безпечна експлуатація"],
  },
];

export const MOCK_TECHNOLOGIES: Technology[] = [
  {
    slug: "nano-pro-tech",
    name: "Nano Pro-Tech",
    description:
      "Технологія гумової суміші, що забезпечує оптимальний баланс між зчепленням та опором коченню.",
    tyreSlugs: ["turanza-t005"],
  },
  {
    slug: "noise-reduction",
    name: "Зниження шуму",
    description:
      "Спеціальний рисунок протектора та конструкція блока протектора для зменшення шуму в салоні.",
    tyreSlugs: ["turanza-t005"],
  },
  {
    slug: "winter-compound",
    name: "Зимова гума з кремнієвими добавками",
    description:
      "Суміш, яка залишається еластичною за низьких температур для кращого зчеплення на снігу та льоду.",
    tyreSlugs: ["blizzak-lm005"],
  },
];