/**
 * Seed script for Payload CMS
 * Migrates mock data from frontend to Payload database
 */

import { getPayload } from 'payload';
import config from '../payload.config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to download image and upload to Payload Media
async function uploadImageFromUrl(
  payload: Awaited<ReturnType<typeof getPayload>>,
  imageUrl: string,
  filename: string
): Promise<string | null> {
  try {
    console.log(`      Downloading: ${filename}...`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.log(`      Failed to download image: ${response.status}`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const ext = imageUrl.includes('.png') ? '.png' : '.jpg';
    const tempPath = path.join(tempDir, `${filename}${ext}`);
    fs.writeFileSync(tempPath, buffer);

    const media = await payload.create({
      collection: 'media',
      data: {
        alt: filename.replace(/-/g, ' '),
      },
      filePath: tempPath,
    });

    // Clean up temp file
    fs.unlinkSync(tempPath);

    console.log(`      Uploaded: ${filename}`);
    return media.id;
  } catch (error) {
    console.error(`      Error uploading image ${filename}:`, error);
    return null;
  }
}

// Technologies - expanded
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

// Tyres - expanded to 20 models
const MOCK_TYRE_MODELS = [
  // Summer - Passenger
  {
    slug: 'turanza-t005',
    name: 'Bridgestone Turanza T005',
    season: 'summer' as const,
    vehicleTypes: ['passenger'] as const[],
    isNew: false,
    isPopular: true,
    isPublished: true,
    shortDescription:
      'Літні шини для щоденних поїздок містом та трасою з відмінним зчепленням на мокрій дорозі.',
    imageUrl: 'https://images.simpletire.com/images/q_auto/line-images/14283/14283-sidetread/bridgestone-turanza-t005.jpg',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'B', noiseDb: 71, noiseClass: 'B' },
    sizes: [
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: '91', speedIndex: 'V' },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: '94', speedIndex: 'W' },
      { width: 235, aspectRatio: 40, diameter: 18, loadIndex: '95', speedIndex: 'Y' },
      { width: 245, aspectRatio: 45, diameter: 18, loadIndex: '100', speedIndex: 'Y' },
    ],
    usage: { city: 90, highway: 85, offroad: 10, winter: 0 },
    technologies: ['nano-pro-tech', 'noise-reduction'],
    keyBenefits: ['Відмінне зчеплення на мокрій дорозі', 'Низький рівень шуму', 'Економія пального', 'Тривалий термін служби'],
  },
  {
    slug: 'turanza-t001',
    name: 'Bridgestone Turanza T001',
    season: 'summer' as const,
    vehicleTypes: ['passenger'] as const[],
    isNew: false,
    isPopular: false,
    isPublished: true,
    shortDescription:
      'Комфортні літні шини преміум-класу для седанів та хетчбеків з акцентом на тихий хід.',
    euLabel: { wetGrip: 'B', fuelEfficiency: 'C', noiseDb: 70, noiseClass: 'B' },
    sizes: [
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: '91', speedIndex: 'H' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: '91', speedIndex: 'V' },
      { width: 215, aspectRatio: 55, diameter: 16, loadIndex: '93', speedIndex: 'V' },
    ],
    usage: { city: 85, highway: 80, offroad: 5, winter: 0 },
    technologies: ['nano-pro-tech', 'noise-reduction'],
    keyBenefits: ['Комфортна їзда', 'Низький рівень шуму', 'Стабільність на мокрій дорозі', 'Економічність'],
  },
  {
    slug: 'turanza-er300',
    name: 'Bridgestone Turanza ER300',
    season: 'summer' as const,
    vehicleTypes: ['passenger'] as const[],
    isNew: false,
    isPopular: false,
    isPublished: true,
    shortDescription:
      'Універсальні літні шини для широкого спектру легкових автомобілів з хорошим балансом характеристик.',
    euLabel: { wetGrip: 'B', fuelEfficiency: 'C', noiseDb: 71, noiseClass: 'B' },
    sizes: [
      { width: 195, aspectRatio: 55, diameter: 16, loadIndex: '87', speedIndex: 'V' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: '91', speedIndex: 'V' },
      { width: 215, aspectRatio: 55, diameter: 17, loadIndex: '94', speedIndex: 'W' },
    ],
    usage: { city: 80, highway: 85, offroad: 10, winter: 0 },
    technologies: ['nano-pro-tech'],
    keyBenefits: ['Універсальність', 'Надійне зчеплення', 'Комфорт', 'Довговічність'],
  },
  // Summer - Sport
  {
    slug: 'potenza-sport',
    name: 'Bridgestone Potenza Sport',
    season: 'summer' as const,
    vehicleTypes: ['passenger', 'sport'] as const[],
    isNew: true,
    isPopular: true,
    isPublished: true,
    shortDescription:
      'Високопродуктивні літні шини для спортивних автомобілів з максимальним зчепленням.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'C', noiseDb: 72, noiseClass: 'B' },
    sizes: [
      { width: 245, aspectRatio: 35, diameter: 19, loadIndex: '93', speedIndex: 'Y' },
      { width: 255, aspectRatio: 35, diameter: 20, loadIndex: '97', speedIndex: 'Y' },
      { width: 275, aspectRatio: 30, diameter: 21, loadIndex: '98', speedIndex: 'Y' },
      { width: 285, aspectRatio: 35, diameter: 20, loadIndex: '104', speedIndex: 'Y' },
    ],
    usage: { city: 70, highway: 95, offroad: 5, winter: 0 },
    technologies: ['potenza-adrenalin'],
    keyBenefits: ['Максимальне зчеплення', 'Точне кермове управління', 'Стабільність на високих швидкостях', 'Спортивний дизайн'],
  },
  {
    slug: 'potenza-re050a',
    name: 'Bridgestone Potenza RE050A',
    season: 'summer' as const,
    vehicleTypes: ['passenger', 'sport'] as const[],
    isNew: false,
    isPopular: true,
    isPublished: true,
    shortDescription:
      'Легендарні спортивні шини OEM для преміум автомобілів та спорткарів.',
    imageUrl: 'https://images.simpletire.com/images/q_auto/line-images/1201/1201-sidetread/bridgestone-potenza-re050a.png',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'E', noiseDb: 73, noiseClass: 'B' },
    sizes: [
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: '91', speedIndex: 'Y' },
      { width: 245, aspectRatio: 40, diameter: 18, loadIndex: '97', speedIndex: 'Y' },
      { width: 255, aspectRatio: 40, diameter: 19, loadIndex: '100', speedIndex: 'Y' },
    ],
    usage: { city: 60, highway: 95, offroad: 5, winter: 0 },
    technologies: ['potenza-adrenalin'],
    keyBenefits: ['OEM якість', 'Високі швидкості', 'Преміум зчеплення', 'Відмінна керованість'],
  },
  {
    slug: 'potenza-s001',
    name: 'Bridgestone Potenza S001',
    season: 'summer' as const,
    vehicleTypes: ['passenger', 'sport'] as const[],
    isNew: false,
    isPopular: false,
    isPublished: true,
    shortDescription:
      'Ультра-високопродуктивні шини для вимогливих водіїв спортивних автомобілів.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'E', noiseDb: 74, noiseClass: 'B' },
    sizes: [
      { width: 235, aspectRatio: 35, diameter: 19, loadIndex: '91', speedIndex: 'Y' },
      { width: 265, aspectRatio: 35, diameter: 19, loadIndex: '98', speedIndex: 'Y' },
      { width: 295, aspectRatio: 30, diameter: 20, loadIndex: '101', speedIndex: 'Y' },
    ],
    usage: { city: 50, highway: 100, offroad: 0, winter: 0 },
    technologies: ['potenza-adrenalin'],
    keyBenefits: ['Трекові характеристики', 'Екстремальне зчеплення', 'Агресивний дизайн', 'Преміум клас'],
  },
  // Winter
  {
    slug: 'blizzak-lm005',
    name: 'Bridgestone Blizzak LM005',
    season: 'winter' as const,
    vehicleTypes: ['passenger', 'suv'] as const[],
    isNew: false,
    isPopular: true,
    isPublished: true,
    shortDescription:
      'Зимові шини з фокусом на зчеплення на снігу та мокрому асфальті для безпечного руху взимку.',
    imageUrl: 'https://images.simpletire.com/images/q_auto/line-images/17531/17531-sidetread/bridgestone-blizzak-lm005.png',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'C', noiseDb: 72, noiseClass: 'B' },
    sizes: [
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: '91', speedIndex: 'T' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: '94', speedIndex: 'H' },
      { width: 225, aspectRatio: 50, diameter: 17, loadIndex: '98', speedIndex: 'H' },
      { width: 235, aspectRatio: 55, diameter: 18, loadIndex: '100', speedIndex: 'V' },
    ],
    usage: { city: 80, highway: 75, offroad: 20, winter: 100 },
    technologies: ['winter-compound', 'multi-cell'],
    keyBenefits: ['Відмінне зчеплення на снігу', 'Коротка гальмівна відстань на льоду', 'Стабільність на мокрій дорозі', 'Комфортна їзда'],
  },
  {
    slug: 'blizzak-ws90',
    name: 'Bridgestone Blizzak WS90',
    season: 'winter' as const,
    vehicleTypes: ['passenger'] as const[],
    isNew: true,
    isPopular: true,
    isPublished: true,
    shortDescription:
      'Нове покоління зимових шин з покращеним зчепленням на льоду та подовженим терміном служби.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'C', noiseDb: 71, noiseClass: 'B' },
    sizes: [
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: '91', speedIndex: 'T' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: '94', speedIndex: 'T' },
      { width: 215, aspectRatio: 55, diameter: 17, loadIndex: '94', speedIndex: 'T' },
      { width: 225, aspectRatio: 45, diameter: 18, loadIndex: '95', speedIndex: 'T' },
    ],
    usage: { city: 85, highway: 70, offroad: 15, winter: 100 },
    technologies: ['winter-compound', 'multi-cell'],
    keyBenefits: ['Покращене зчеплення на льоду', 'Подовжений термін служби', 'Тихий хід', 'Економія пального'],
  },
  {
    slug: 'blizzak-dm-v3',
    name: 'Bridgestone Blizzak DM-V3',
    season: 'winter' as const,
    vehicleTypes: ['suv'] as const[],
    isNew: false,
    isPopular: true,
    isPublished: true,
    shortDescription:
      'Преміум зимові шини для SUV та кросоверів з максимальним зчепленням на снігу та льоду.',
    euLabel: { wetGrip: 'B', fuelEfficiency: 'C', noiseDb: 73, noiseClass: 'B' },
    sizes: [
      { width: 215, aspectRatio: 70, diameter: 16, loadIndex: '100', speedIndex: 'T' },
      { width: 225, aspectRatio: 65, diameter: 17, loadIndex: '102', speedIndex: 'T' },
      { width: 235, aspectRatio: 60, diameter: 18, loadIndex: '107', speedIndex: 'T' },
      { width: 265, aspectRatio: 50, diameter: 20, loadIndex: '107', speedIndex: 'T' },
    ],
    usage: { city: 70, highway: 70, offroad: 40, winter: 100 },
    technologies: ['winter-compound', 'multi-cell', 'dueler-ht'],
    keyBenefits: ['Для важких SUV', 'Відмінне зчеплення на снігу', 'Стабільність', 'Довговічність'],
  },
  {
    slug: 'blizzak-spike-02',
    name: 'Bridgestone Blizzak Spike-02',
    season: 'winter' as const,
    vehicleTypes: ['passenger', 'suv'] as const[],
    isNew: false,
    isPopular: false,
    isPublished: true,
    shortDescription:
      'Шиповані зимові шини для екстремальних зимових умов з максимальним зчепленням на льоду.',
    euLabel: { wetGrip: 'C', fuelEfficiency: 'E', noiseDb: 75, noiseClass: 'C' },
    sizes: [
      { width: 185, aspectRatio: 65, diameter: 15, loadIndex: '88', speedIndex: 'T' },
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: '91', speedIndex: 'T' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: '94', speedIndex: 'T' },
      { width: 215, aspectRatio: 55, diameter: 17, loadIndex: '98', speedIndex: 'T' },
    ],
    usage: { city: 60, highway: 50, offroad: 30, winter: 100 },
    technologies: ['winter-compound'],
    keyBenefits: ['Максимальне зчеплення на льоду', 'Для екстремальних умов', 'Шипована версія', 'Безпека'],
  },
  // Allseason
  {
    slug: 'weather-control-a005-evo',
    name: 'Bridgestone Weather Control A005 EVO',
    season: 'allseason' as const,
    vehicleTypes: ['passenger'] as const[],
    isNew: true,
    isPopular: true,
    isPublished: true,
    shortDescription:
      'Всесезонні шини нового покоління з сертифікацією 3PMSF для цілорічного використання.',
    imageUrl: 'https://images.simpletire.com/images/q_auto/line-images/5127/5127-sidetread/bridgestone-weather-control-a005-evo.png',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'B', noiseDb: 71, noiseClass: 'B' },
    sizes: [
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: '91', speedIndex: 'V' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: '94', speedIndex: 'V' },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: '94', speedIndex: 'V' },
      { width: 235, aspectRatio: 45, diameter: 18, loadIndex: '98', speedIndex: 'V' },
    ],
    usage: { city: 85, highway: 80, offroad: 20, winter: 70 },
    technologies: ['nano-pro-tech', 'winter-compound'],
    keyBenefits: ['Цілорічне використання', 'Сертифікація 3PMSF', 'Відмінне зчеплення', 'Економічність'],
  },
  // SUV
  {
    slug: 'dueler-at-002',
    name: 'Bridgestone Dueler A/T 002',
    season: 'allseason' as const,
    vehicleTypes: ['suv'] as const[],
    isNew: true,
    isPopular: false,
    isPublished: true,
    shortDescription:
      'Всесезонні шини для SUV з балансом між асфальтом та бездоріжжям.',
    euLabel: { wetGrip: 'B', fuelEfficiency: 'C', noiseDb: 73, noiseClass: 'B' },
    sizes: [
      { width: 235, aspectRatio: 70, diameter: 16, loadIndex: '106', speedIndex: 'H' },
      { width: 265, aspectRatio: 65, diameter: 17, loadIndex: '112', speedIndex: 'H' },
      { width: 275, aspectRatio: 55, diameter: 20, loadIndex: '117', speedIndex: 'T' },
    ],
    usage: { city: 60, highway: 70, offroad: 80, winter: 50 },
    technologies: ['dueler-ht'],
    keyBenefits: ['Прохідність на бездоріжжі', 'Комфорт на асфальті', 'Міцна конструкція', 'Всесезонне використання'],
  },
  {
    slug: 'dueler-at-001',
    name: 'Bridgestone Dueler A/T 001',
    season: 'allseason' as const,
    vehicleTypes: ['suv'] as const[],
    isNew: false,
    isPopular: false,
    isPublished: true,
    shortDescription:
      'Універсальні позашляхові шини для SUV з акцентом на комфорт та тривалий пробіг.',
    euLabel: { wetGrip: 'C', fuelEfficiency: 'C', noiseDb: 72, noiseClass: 'B' },
    sizes: [
      { width: 215, aspectRatio: 65, diameter: 16, loadIndex: '98', speedIndex: 'H' },
      { width: 235, aspectRatio: 60, diameter: 18, loadIndex: '107', speedIndex: 'V' },
      { width: 255, aspectRatio: 55, diameter: 19, loadIndex: '111', speedIndex: 'V' },
    ],
    usage: { city: 65, highway: 75, offroad: 70, winter: 40 },
    technologies: ['dueler-ht'],
    keyBenefits: ['Універсальність', 'Комфорт', 'Довговічність', 'Надійність'],
  },
  {
    slug: 'dueler-hp-sport',
    name: 'Bridgestone Dueler H/P Sport',
    season: 'summer' as const,
    vehicleTypes: ['suv'] as const[],
    isNew: false,
    isPopular: true,
    isPublished: true,
    shortDescription:
      'Спортивні літні шини для преміум SUV та кросоверів з високими швидкісними характеристиками.',
    imageUrl: 'https://images.simpletire.com/images/q_auto/line-images/1191/1191-sidetread/bridgestone-dueler-h-p-sport.png',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'C', noiseDb: 72, noiseClass: 'B' },
    sizes: [
      { width: 235, aspectRatio: 55, diameter: 19, loadIndex: '101', speedIndex: 'V' },
      { width: 255, aspectRatio: 50, diameter: 20, loadIndex: '109', speedIndex: 'Y' },
      { width: 275, aspectRatio: 45, diameter: 21, loadIndex: '110', speedIndex: 'Y' },
      { width: 285, aspectRatio: 45, diameter: 22, loadIndex: '114', speedIndex: 'H' },
    ],
    usage: { city: 75, highway: 90, offroad: 20, winter: 0 },
    technologies: ['potenza-adrenalin', 'dueler-ht'],
    keyBenefits: ['Спортивна керованість', 'Для преміум SUV', 'Високі швидкості', 'Комфорт'],
  },
  // Eco
  {
    slug: 'ecopia-ep150',
    name: 'Bridgestone Ecopia EP150',
    season: 'summer' as const,
    vehicleTypes: ['passenger'] as const[],
    isNew: false,
    isPopular: false,
    isPublished: true,
    shortDescription:
      'Економічні літні шини з низьким опором коченню для максимальної економії пального.',
    imageUrl: 'https://images.simpletire.com/images/q_auto/line-images/1172/1172-sidetread/bridgestone-ecopia-ep150.png',
    euLabel: { wetGrip: 'B', fuelEfficiency: 'A', noiseDb: 69, noiseClass: 'B' },
    sizes: [
      { width: 185, aspectRatio: 65, diameter: 15, loadIndex: '88', speedIndex: 'H' },
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: '91', speedIndex: 'H' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: '91', speedIndex: 'V' },
    ],
    usage: { city: 95, highway: 70, offroad: 5, winter: 0 },
    technologies: ['ecopia-compound', 'noise-reduction'],
    keyBenefits: ['Максимальна економія пального', 'Екологічність', 'Тихий хід', 'Доступна ціна'],
  },
  {
    slug: 'ecopia-ep300',
    name: 'Bridgestone Ecopia EP300',
    season: 'summer' as const,
    vehicleTypes: ['passenger'] as const[],
    isNew: false,
    isPopular: false,
    isPublished: true,
    shortDescription:
      'Покращені еко-шини з балансом економічності та комфорту для сучасних автомобілів.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'A', noiseDb: 70, noiseClass: 'B' },
    sizes: [
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: '91', speedIndex: 'V' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: '91', speedIndex: 'V' },
      { width: 215, aspectRatio: 55, diameter: 17, loadIndex: '94', speedIndex: 'V' },
      { width: 225, aspectRatio: 50, diameter: 17, loadIndex: '98', speedIndex: 'V' },
    ],
    usage: { city: 90, highway: 75, offroad: 10, winter: 0 },
    technologies: ['ecopia-compound', 'nano-pro-tech'],
    keyBenefits: ['Економія пального', 'Покращене зчеплення', 'Комфорт', 'Низький рівень шуму'],
  },
  // Run-Flat
  {
    slug: 'turanza-t005-rft',
    name: 'Bridgestone Turanza T005 DriveGuard',
    season: 'summer' as const,
    vehicleTypes: ['passenger'] as const[],
    isNew: false,
    isPopular: false,
    isPublished: true,
    shortDescription:
      'Run-Flat версія Turanza T005 для безпечного продовження руху після проколу.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'C', noiseDb: 72, noiseClass: 'B' },
    sizes: [
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: '94', speedIndex: 'W' },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: '94', speedIndex: 'Y' },
      { width: 225, aspectRatio: 50, diameter: 17, loadIndex: '98', speedIndex: 'Y' },
    ],
    usage: { city: 85, highway: 80, offroad: 10, winter: 0 },
    technologies: ['run-flat', 'nano-pro-tech'],
    keyBenefits: ['Рух після проколу', 'Безпека', 'Комфорт', 'Не потрібна запаска'],
  },
  // LCV
  {
    slug: 'duravis-r660',
    name: 'Bridgestone Duravis R660',
    season: 'summer' as const,
    vehicleTypes: ['van'] as const[],
    isNew: false,
    isPopular: true,
    isPublished: true,
    shortDescription:
      'Комерційні шини для фургонів та легких вантажівок з підвищеною вантажопідйомністю.',
    imageUrl: 'https://images.simpletire.com/images/q_auto/line-images/1938/1938-sidetread/bridgestone-duravis-r660.png',
    euLabel: { wetGrip: 'B', fuelEfficiency: 'B', noiseDb: 72, noiseClass: 'B' },
    sizes: [
      { width: 195, aspectRatio: 70, diameter: 15, loadIndex: '104', speedIndex: 'R' },
      { width: 205, aspectRatio: 65, diameter: 16, loadIndex: '107', speedIndex: 'T' },
      { width: 215, aspectRatio: 65, diameter: 16, loadIndex: '109', speedIndex: 'T' },
      { width: 225, aspectRatio: 65, diameter: 16, loadIndex: '112', speedIndex: 'R' },
    ],
    usage: { city: 85, highway: 90, offroad: 15, winter: 0 },
    technologies: ['dueler-ht'],
    keyBenefits: ['Висока вантажопідйомність', 'Довговічність', 'Економія пального', 'Для комерційного транспорту'],
  },
  {
    slug: 'blizzak-w995',
    name: 'Bridgestone Blizzak W995',
    season: 'winter' as const,
    vehicleTypes: ['van'] as const[],
    isNew: false,
    isPopular: false,
    isPublished: true,
    shortDescription:
      'Зимові комерційні шини для фургонів з відмінним зчепленням на снігу та льоду.',
    euLabel: { wetGrip: 'B', fuelEfficiency: 'C', noiseDb: 73, noiseClass: 'B' },
    sizes: [
      { width: 195, aspectRatio: 70, diameter: 15, loadIndex: '104', speedIndex: 'R' },
      { width: 205, aspectRatio: 65, diameter: 16, loadIndex: '107', speedIndex: 'T' },
      { width: 215, aspectRatio: 65, diameter: 16, loadIndex: '109', speedIndex: 'T' },
    ],
    usage: { city: 75, highway: 70, offroad: 20, winter: 100 },
    technologies: ['winter-compound', 'dueler-ht'],
    keyBenefits: ['Для фургонів', 'Зимове зчеплення', 'Вантажопідйомність', 'Надійність'],
  },
];

// Dealers - expanded to 15 locations
const MOCK_DEALERS = [
  // Official dealers
  {
    name: 'Bridgestone Київ Центр',
    type: 'official' as const,
    city: 'Київ',
    address: 'вул. Велика Васильківська, 100',
    latitude: 50.4301,
    longitude: 30.5134,
    phone: '+380 44 123 45 67',
    email: 'kyiv.center@bridgestone.ua',
    website: 'https://kyiv.bridgestone.ua',
    workingHours: 'Пн–Сб: 9:00–19:00, Нд: 10:00–16:00',
    services: ['tire-fitting', 'balancing', 'storage', 'alignment'],
  },
  {
    name: 'Bridgestone Київ Лівобережна',
    type: 'official' as const,
    city: 'Київ',
    address: 'просп. Броварський, 25',
    latitude: 50.4587,
    longitude: 30.6234,
    phone: '+380 44 234 56 78',
    email: 'kyiv.livo@bridgestone.ua',
    workingHours: 'Пн–Сб: 8:00–20:00',
    services: ['tire-fitting', 'balancing', 'storage', 'alignment', 'repair'],
  },
  {
    name: 'Bridgestone Харків',
    type: 'official' as const,
    city: 'Харків',
    address: 'вул. Сумська, 100',
    latitude: 49.9935,
    longitude: 36.2304,
    phone: '+380 57 345 67 89',
    email: 'kharkiv@bridgestone.ua',
    website: 'https://kharkiv.bridgestone.ua',
    workingHours: 'Пн–Сб: 9:00–19:00',
    services: ['tire-fitting', 'balancing', 'storage', 'alignment'],
  },
  {
    name: 'Bridgestone Дніпро',
    type: 'official' as const,
    city: 'Дніпро',
    address: 'просп. Дмитра Яворницького, 75',
    latitude: 48.4647,
    longitude: 35.0462,
    phone: '+380 56 456 78 90',
    email: 'dnipro@bridgestone.ua',
    workingHours: 'Пн–Сб: 9:00–18:00',
    services: ['tire-fitting', 'balancing', 'storage'],
  },
  // Partners
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
    name: 'Партнер Bridgestone Одеса',
    type: 'partner' as const,
    city: 'Одеса',
    address: 'вул. Фонтанська дорога, 20',
    latitude: 46.4525,
    longitude: 30.7533,
    phone: '+380 48 678 90 12',
    workingHours: 'Пн–Сб: 8:00–19:00',
    services: ['tire-fitting', 'balancing', 'repair'],
  },
  {
    name: 'Партнер Bridgestone Запоріжжя',
    type: 'partner' as const,
    city: 'Запоріжжя',
    address: 'просп. Соборний, 85',
    latitude: 47.8388,
    longitude: 35.1396,
    phone: '+380 61 789 01 23',
    workingHours: 'Пн–Пт: 9:00–18:00',
    services: ['tire-fitting', 'balancing'],
  },
  {
    name: 'Партнер Bridgestone Вінниця',
    type: 'partner' as const,
    city: 'Вінниця',
    address: 'вул. Соборна, 45',
    latitude: 49.2331,
    longitude: 28.4682,
    phone: '+380 43 890 12 34',
    workingHours: 'Пн–Пт: 9:00–18:00, Сб: 10:00–15:00',
    services: ['tire-fitting', 'balancing', 'storage'],
  },
  {
    name: 'Партнер Bridgestone Полтава',
    type: 'partner' as const,
    city: 'Полтава',
    address: 'вул. Європейська, 30',
    latitude: 49.5883,
    longitude: 34.5514,
    phone: '+380 53 901 23 45',
    workingHours: 'Пн–Пт: 9:00–18:00',
    services: ['tire-fitting', 'balancing'],
  },
  {
    name: 'Партнер Bridgestone Чернівці',
    type: 'partner' as const,
    city: 'Чернівці',
    address: 'вул. Головна, 120',
    latitude: 48.2920,
    longitude: 25.9358,
    phone: '+380 37 012 34 56',
    workingHours: 'Пн–Пт: 9:00–17:00',
    services: ['tire-fitting'],
  },
  // Service centers
  {
    name: 'Автосервіс Миколаїв',
    type: 'service' as const,
    city: 'Миколаїв',
    address: 'вул. Велика Морська, 55',
    latitude: 46.9659,
    longitude: 32.0003,
    phone: '+380 51 123 45 67',
    workingHours: 'Пн–Сб: 8:00–18:00',
    services: ['tire-fitting', 'balancing', 'repair'],
  },
  {
    name: 'Автосервіс Івано-Франківськ',
    type: 'service' as const,
    city: 'Івано-Франківськ',
    address: 'вул. Незалежності, 80',
    latitude: 48.9226,
    longitude: 24.7111,
    phone: '+380 34 234 56 78',
    workingHours: 'Пн–Пт: 9:00–18:00',
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
  {
    name: 'Автосервіс Суми',
    type: 'service' as const,
    city: 'Суми',
    address: 'вул. Соборна, 15',
    latitude: 50.9077,
    longitude: 34.7981,
    phone: '+380 54 456 78 90',
    workingHours: 'Пн–Пт: 9:00–18:00',
    services: ['tire-fitting', 'balancing'],
  },
  {
    name: 'Автосервіс Рівне',
    type: 'service' as const,
    city: 'Рівне',
    address: 'вул. Соборна, 75',
    latitude: 50.6199,
    longitude: 26.2516,
    phone: '+380 36 567 89 01',
    workingHours: 'Пн–Пт: 8:00–17:00',
    services: ['tire-fitting'],
  },
];

// Articles - expanded
const MOCK_ARTICLES = [
  {
    slug: 'how-to-choose-tyres',
    title: 'Як обрати шини для міста та траси',
    subtitle: 'Основні критерії вибору шин під ваш стиль водіння',
    previewText:
      'Розбираємо, на що звертати увагу при виборі шин: сезонність, індекси, розмір та тип вашого автомобіля.',
    body: '<h2>Визначте сезонність</h2><p>Перший крок — обрати між літніми, зимовими та всесезонними шинами. Для українського клімату з чіткою зміною сезонів рекомендуємо мати два комплекти: літній та зимовий. Всесезонні шини — компромісний варіант для регіонів з м\'яким кліматом.</p><h2>Розмір має значення</h2><p>Перевірте рекомендований розмір у інструкції до автомобіля або на наклейці в дверному отворі. Маркування виглядає як <strong>205/55 R16 91V</strong>, де 205 — ширина в мм, 55 — висота профілю у %, R16 — діаметр диска, 91 — індекс навантаження, V — індекс швидкості.</p><h2>Індекси навантаження та швидкості</h2><p>Індекс навантаження визначає максимальну вагу на одну шину. Індекс швидкості — максимальну допустиму швидкість. Обирайте шини з індексами не нижчими за рекомендовані виробником автомобіля.</p><h2>Стиль водіння</h2><p>Для міста обирайте шини з акцентом на комфорт та зносостійкість — наприклад, лінійку Bridgestone Turanza. Для активного водіння та трас — шини з покращеним зчепленням, як Potenza. Для позашляхових умов — Dueler.</p><h2>EU Label</h2><p>Зверніть увагу на етикетку ЄС: клас зчеплення на мокрій дорозі (A — найкращий), паливна ефективність та рівень шуму. Ці показники допоможуть порівняти моделі між собою.</p>',
    readingTimeMinutes: 4,
    tags: ['вибір шин', 'поради'],
    publishedAt: new Date('2024-01-15'),
  },
  {
    slug: 'how-to-read-markings',
    title: 'Як читати маркування шин',
    subtitle: 'Пояснюємо значення основних позначень на боковині шини',
    previewText:
      'Що означають індекси навантаження, швидкості, дата виробництва та інші маркування — простою мовою.',
    body: '<h2>Основне маркування</h2><p>На боковині кожної шини нанесено маркування, наприклад: <strong>205/55 R16 91V</strong>. Розшифруємо кожен елемент:</p><ul><li><strong>205</strong> — ширина шини в міліметрах</li><li><strong>55</strong> — висота профілю у відсотках від ширини</li><li><strong>R</strong> — радіальна конструкція</li><li><strong>16</strong> — посадковий діаметр диска в дюймах</li><li><strong>91</strong> — індекс навантаження (615 кг на шину)</li><li><strong>V</strong> — індекс швидкості (до 240 км/год)</li></ul><h2>Дата виробництва</h2><p>Чотиризначний код у овальній рамці (наприклад, <strong>2523</strong>) означає тиждень та рік виробництва: 25-й тиждень 2023 року. Не рекомендується використовувати шини старші 5-6 років, навіть якщо протектор не зношений.</p><h2>Додаткові позначення</h2><p><strong>M+S</strong> (Mud and Snow) — шина призначена для бруду та снігу. <strong>3PMSF</strong> (сніжинка в горі) — сертифікована для зимових умов. <strong>XL</strong> або <strong>Extra Load</strong> — посилена конструкція для більшого навантаження.</p><h2>Run-Flat позначення</h2><p>Шини з технологією Run-Flat позначаються по-різному залежно від виробника: RFT (Bridgestone), ROF, SSR, ZP. Такі шини дозволяють проїхати до 80 км на швидкості до 80 км/год після проколу.</p>',
    readingTimeMinutes: 6,
    tags: ['маркування', 'безпечна експлуатація'],
    publishedAt: new Date('2024-02-20'),
  },
  {
    slug: 'winter-tyre-guide',
    title: 'Повний гід по зимових шинах',
    subtitle: 'Все що потрібно знати про зимові шини в Україні',
    previewText:
      'Коли міняти шини, як обрати правильний розмір та що таке шиповані шини — відповідаємо на всі питання.',
    body: '<h2>Коли міняти на зимові шини?</h2><p>Загальне правило — переходити на зимові шини коли середньодобова температура стабільно опускається нижче +7°C. В Україні це зазвичай кінець жовтня — початок листопада. Не чекайте першого снігу: при низьких температурах літня гума втрачає еластичність та зчеплення.</p><h2>Шиповані чи фрикційні?</h2><p>В Україні шипи не заборонені, але більшість водіїв обирають фрикційні (нешиповані) зимові шини. Вони тихіші, не пошкоджують асфальт та забезпечують чудове зчеплення на снігу та льоду завдяки спеціальному малюнку протектора та ламелям.</p><h2>Як обрати розмір?</h2><p>Для зими можна обрати шини на один розмір вужче за літні — вони краще прорізають сніг. Наприклад, якщо літній розмір 215/55 R17, зимовий може бути 205/60 R16 на менших дисках. Перевірте допустимі розміри у документації автомобіля.</p><h2>Bridgestone Blizzak</h2><p>Лінійка Blizzak від Bridgestone — одна з найпопулярніших зимових шин у світі. Технологія Multi-Cell Compound забезпечує мікроскопічні канали, які відводять воду з поверхні льоду, створюючи ефект присмоктування. Blizzak LM005 — флагманська модель для легкових автомобілів.</p><h2>Правила експлуатації</h2><p>Зимові шини мають глибший протектор (8-10 мм проти 7-8 мм у літніх). Мінімально допустима глибина — 4 мм. Перевіряйте тиск частіше взимку: при зниженні температури на 10°C тиск падає приблизно на 0.1 бар.</p>',
    readingTimeMinutes: 8,
    tags: ['зимові шини', 'безпека', 'поради'],
    publishedAt: new Date('2024-10-01'),
  },
  {
    slug: 'tyre-pressure-importance',
    title: 'Чому важливий тиск у шинах',
    subtitle: 'Вплив тиску на безпеку та економію',
    previewText:
      'Неправильний тиск може збільшити витрату пального на 5% та скоротити термін служби шин вдвічі.',
    body: '<h2>Вплив на безпеку</h2><p>Недостатній тиск збільшує площу контакту шини з дорогою, що призводить до перегріву та підвищеного ризику руйнування каркаса на високій швидкості. Надмірний тиск зменшує площу контакту, погіршуючи зчеплення та подовжуючи гальмівний шлях.</p><h2>Вплив на витрату пального</h2><p>Шини з тиском нижче норми на 0.5 бар збільшують витрату пального на 2-3%. При зниженні на 1 бар — до 5%. Для середнього водія це може означати додаткових 200-500 грн витрат на пальне щомісяця.</p><h2>Вплив на знос шин</h2><p>Низький тиск спричиняє прискорений знос країв протектора, високий — центральної частини. Обидва варіанти скорочують термін служби шин на 25-50%. Рівномірний знос досягається тільки при правильному тиску.</p><h2>Як перевіряти тиск</h2><p>Перевіряйте тиск щонайменше раз на місяць та перед довгими поїздками. Вимірюйте тиск на <strong>холодних</strong> шинах — після стоянки не менше 3 годин. Рекомендований тиск вказано на наклейці в дверному отворі або в інструкції до автомобіля.</p><h2>Системи контролю тиску (TPMS)</h2><p>Сучасні автомобілі обладнані системою TPMS, яка попереджає про зниження тиску. Але не покладайтеся тільки на неї — система спрацьовує при значному відхиленні (зазвичай -25%). Регулярна ручна перевірка залишається важливою.</p>',
    readingTimeMinutes: 5,
    tags: ['тиск', 'безпечна експлуатація', 'економія'],
    publishedAt: new Date('2024-03-10'),
  },
  {
    slug: 'when-to-change-tyres',
    title: 'Коли потрібно міняти шини: 5 ознак зношеності',
    subtitle: 'Як визначити що час купувати нові шини',
    previewText:
      'Перевіряємо глибину протектора, вік шин, ознаки нерівномірного зносу та інші важливі індикатори.',
    body: '<h2>1. Глибина протектора</h2><p>Мінімально допустима глибина протектора в Україні — <strong>1.6 мм</strong> для літніх шин. Для зимових рекомендується мінімум 4 мм. Перевірити можна за допомогою монети або спеціального вимірювача глибини. Багато шин мають індикатори зносу (TWI) — виступи в канавках протектора.</p><h2>2. Вік шин</h2><p>Навіть при достатній глибині протектора шини старші 5-6 років втрачають свої властивості через старіння гуми. Дату виробництва можна знайти на боковині (чотиризначний код у овалі). Максимальний рекомендований термін використання — 10 років.</p><h2>3. Нерівномірний знос</h2><p>Якщо шина зношується більше з одного боку або посередині — це ознака проблем з розвалом-сходженням або неправильним тиском. Нерівномірний знос погіршує керованість та може бути небезпечним. Зверніться до СТО для діагностики.</p><h2>4. Тріщини та пошкодження</h2><p>Оглядайте шини на наявність тріщин на боковині, грижів (випуклостей), порізів та сторонніх предметів у протекторі. Будь-яке видиме пошкодження каркаса — привід для негайної заміни.</p><h2>5. Вібрація при русі</h2><p>Якщо ви відчуваєте незвичну вібрацію на кермі або в кузові — це може свідчити про деформацію шини, порушення балансування або пошкодження внутрішньої структури. Не ігноруйте цей симптом.</p>',
    readingTimeMinutes: 5,
    tags: ['знос шин', 'безпека', 'поради'],
    publishedAt: new Date('2024-04-05'),
  },
  {
    slug: 'run-flat-technology-explained',
    title: 'Run-Flat технологія: плюси та мінуси',
    subtitle: 'Чи варто обирати шини з підсиленою боковиною',
    previewText:
      'Розбираємо як працює Run-Flat, для яких авто підходить та чи варто переплачувати за цю технологію.',
    body: '<h2>Як працює Run-Flat?</h2><p>Шини Run-Flat мають підсилену боковину, яка витримує вагу автомобіля навіть при повній втраті тиску. Це дозволяє продовжити рух на швидкості до 80 км/год на відстань до 80 км — достатньо, щоб дістатися до найближчої СТО.</p><h2>Переваги</h2><ul><li><strong>Безпека</strong> — немає потреби зупинятися на узбіччі для заміни колеса</li><li><strong>Зручність</strong> — не потрібно возити запасне колесо та домкрат</li><li><strong>Економія місця</strong> — звільняється простір у багажнику</li><li><strong>Стабільність</strong> — автомобіль зберігає керованість при проколі</li></ul><h2>Недоліки</h2><ul><li><strong>Жорсткіший хід</strong> — підсилена боковина передає більше вібрацій</li><li><strong>Вища ціна</strong> — на 20-30% дорожче за звичайні шини</li><li><strong>Обмежений вибір</strong> — менше доступних моделей та розмірів</li><li><strong>Не підлягають ремонту</strong> — після проколу шину часто потрібно замінити</li></ul><h2>Для яких авто підходить?</h2><p>Run-Flat найчастіше встановлюються на автомобілі BMW, MINI та деякі моделі Mercedes-Benz. Для використання Run-Flat автомобіль повинен мати систему контролю тиску (TPMS), оскільки водій може не відчути прокол.</p><h2>Bridgestone DriveGuard</h2><p>Bridgestone DriveGuard — одна з найпопулярніших Run-Flat шин, сумісна з більшістю автомобілів (не тільки тими, що виходять з конвеєра з Run-Flat). Вона поєднує безпеку Run-Flat з комфортом звичайних шин.</p>',
    readingTimeMinutes: 7,
    tags: ['технології', 'Run-Flat', 'вибір шин'],
    publishedAt: new Date('2024-05-12'),
  },
  {
    slug: 'summer-vs-allseason',
    title: 'Літні чи всесезонні шини: що обрати?',
    subtitle: 'Порівнюємо характеристики для українського клімату',
    previewText:
      'Аналізуємо переваги та недоліки обох типів шин та допомагаємо зробити правильний вибір.',
    body: '<h2>Літні шини: максимум влітку</h2><p>Літні шини оптимізовані для температур вище +7°C. Їх гумова суміш забезпечує найкраще зчеплення на сухому та мокрому асфальті в теплу пору року. Вони мають менший опір кочення, що зменшує витрату пального, та зношуються повільніше ніж всесезонні.</p><h2>Всесезонні шини: компроміс</h2><p>Всесезонні шини — це спроба об\'єднати властивості літніх та зимових шин. Вони мають маркування M+S та часто 3PMSF (сніжинка). Їх гумова суміш зберігає еластичність у ширшому діапазоні температур, але не досягає максимуму ні влітку, ні взимку.</p><h2>Порівняння для українського клімату</h2><table><tr><th>Характеристика</th><th>Літні</th><th>Всесезонні</th></tr><tr><td>Зчеплення влітку</td><td>Відмінне</td><td>Добре</td></tr><tr><td>Зчеплення взимку</td><td>Небезпечне</td><td>Прийнятне</td></tr><tr><td>Знос</td><td>Повільний</td><td>Швидший</td></tr><tr><td>Шум</td><td>Тихі</td><td>Гучніші</td></tr><tr><td>Витрата пального</td><td>Менше</td><td>Більше</td></tr></table><h2>Кому підходять всесезонні?</h2><p>Всесезонні шини — розумний вибір якщо ви живете в регіоні з м\'яким кліматом, проїжджаєте менше 15 000 км на рік та не їздите по заміських трасах взимку. Для більшості українських водіїв два комплекти — безпечніший вибір.</p><h2>Наша рекомендація</h2><p>Bridgestone Turanza T005 — преміальна літня шина з відмінним зчепленням на мокрій дорозі (клас A по EU Label). Для всесезонного варіанту — Bridgestone Turanza All Season 6, яка поєднує літній комфорт з зимовою безпекою.</p>',
    readingTimeMinutes: 6,
    tags: ['літні шини', 'всесезонні шини', 'порівняння'],
    publishedAt: new Date('2024-06-01'),
  },
  {
    slug: 'eu-tyre-label-guide',
    title: 'Етикетка ЄС: як читати та на що звертати увагу',
    subtitle: 'Розшифровуємо європейську маркування шин',
    previewText:
      'Що означають класи A-E для зчеплення на мокрій дорозі, економії пального та рівня шуму.',
    body: '<h2>Три показники етикетки</h2><p>З 2012 року всі шини, що продаються в ЄС, повинні мати стандартизовану етикетку з трьома показниками: паливна ефективність, зчеплення на мокрій дорозі та зовнішній шум. Це дозволяє легко порівнювати шини різних виробників.</p><h2>Паливна ефективність (A-E)</h2><p>Цей показник відображає опір кочення. Клас <strong>A</strong> — найефективніший, <strong>E</strong> — найменш ефективний. Різниця між класами A та E може становити до 7.5% витрати пального. Для середнього автомобіля це близько 0.5 л/100 км.</p><h2>Зчеплення на мокрій дорозі (A-E)</h2><p>Найважливіший показник безпеки. Клас <strong>A</strong> забезпечує найкоротший гальмівний шлях на мокрій дорозі. Різниця між A та E — до 18 метрів при гальмуванні з 80 км/год. Рекомендуємо обирати шини з класом не нижче B.</p><h2>Зовнішній шум (dB)</h2><p>Показник вимірюється в децибелах та має три рівні. Одна хвиля — тихі шини (до 70 дБ), дві хвилі — середні (70-74 дБ), три хвилі — гучні (понад 74 дБ). Тихіші шини покращують комфорт та зменшують шумове забруднення.</p><h2>Нова етикетка 2021+</h2><p>Оновлена етикетка додатково містить QR-код для доступу до детальної інформації та піктограми для зчеплення на снігу (3PMSF) та льоду (Ice Grip). Це допомагає обирати зимові шини.</p>',
    readingTimeMinutes: 4,
    tags: ['EU Label', 'маркування', 'вибір шин'],
    publishedAt: new Date('2024-07-20'),
  },
  {
    slug: 'tyre-storage-tips',
    title: 'Як правильно зберігати шини',
    subtitle: 'Поради для збереження шин між сезонами',
    previewText:
      'Правильне зберігання може подовжити термін служби шин на роки. Розказуємо про основні правила.',
    body: '<h2>Підготовка до зберігання</h2><p>Перед зберіганням очистіть шини від бруду та каміння в протекторі. Огляньте кожну шину на пошкодження та позначте їх положення (ПЛ, ПП, ЗЛ, ЗП) — це допоможе при наступному монтажі ротувати шини для рівномірного зносу.</p><h2>Умови зберігання</h2><p>Ідеальне місце — сухе, темне, прохолодне приміщення (15-25°C). Уникайте прямого сонячного світла, джерел тепла та озону (електромотори, генератори). Не зберігайте шини поруч з бензином, маслами та хімічними речовинами.</p><h2>Як зберігати: з дисками чи без</h2><ul><li><strong>Шини на дисках</strong> — зберігайте горизонтально (стопкою) або підвішеними на гаках. Не ставте вертикально.</li><li><strong>Шини без дисків</strong> — зберігайте тільки вертикально, повертаючи раз на місяць на 90°. Не підвішуйте та не складайте стопкою.</li></ul><h2>Тиск при зберіганні</h2><p>Якщо шини зберігаються на дисках, знизьте тиск до 1.0-1.5 бар. Це зменшує навантаження на каркас. Перед встановленням не забудьте довести тиск до рекомендованого значення.</p><h2>Професійне сезонне зберігання</h2><p>Багато дилерів Bridgestone пропонують послугу сезонного зберігання шин. Це зручний варіант якщо у вас немає підходящого приміщення. Шини зберігаються в оптимальних умовах та проходять огляд перед встановленням.</p>',
    readingTimeMinutes: 5,
    tags: ['зберігання', 'догляд', 'поради'],
    publishedAt: new Date('2024-09-15'),
  },
  {
    slug: 'suv-tyre-selection',
    title: 'Шини для SUV: особливості вибору',
    subtitle: 'На що звернути увагу власникам кросоверів',
    previewText:
      'SUV потребують особливих шин. Розбираємо відмінності від легкових та критерії вибору.',
    body: '<h2>Чим відрізняються шини для SUV?</h2><p>SUV та кросовери важчі за легкові автомобілі та мають вищий центр ваги. Тому шини для SUV мають підсилений каркас, вищий індекс навантаження та спеціальну гумову суміш, розраховану на більшу вагу. Використання легкових шин на SUV може бути небезпечним.</p><h2>Типи шин для SUV</h2><ul><li><strong>H/T (Highway Terrain)</strong> — для переважно асфальтових доріг. Комфортні, тихі, з хорошим зчепленням на мокрій дорозі. Ідеальні для міських кросоверів.</li><li><strong>A/T (All Terrain)</strong> — для змішаних умов. Агресивніший протектор для легкого бездоріжжя, але гучніші на асфальті.</li><li><strong>M/T (Mud Terrain)</strong> — для серйозного бездоріжжя. Не рекомендуються для щоденної їзди по місту.</li></ul><h2>Індекс навантаження</h2><p>Для SUV критично обирати шини з правильним індексом навантаження. Помножте індекс на 4 — результат повинен перевищувати повну масу автомобіля з пасажирами та багажем. Наприклад, індекс 104 = 900 кг × 4 = 3600 кг.</p><h2>Bridgestone Dueler</h2><p>Лінійка Dueler від Bridgestone спеціально розроблена для SUV та кросоверів. Dueler H/P Sport — для спортивних SUV, Dueler A/T 001 — універсальний варіант для будь-яких доріг, Dueler H/L 33 — для комфортної міської їзди.</p><h2>Ротація шин на SUV</h2><p>Через більшу вагу шини SUV зношуються швидше. Ротуйте шини кожні 8 000 - 10 000 км для рівномірного зносу. Для повнопривідних автомобілів це особливо важливо, оскільки різниця в діаметрі шин може пошкодити трансмісію.</p>',
    readingTimeMinutes: 6,
    tags: ['SUV', 'вибір шин', 'кросовери'],
    publishedAt: new Date('2024-11-10'),
  },
];

// Vehicle fitments
const MOCK_VEHICLE_FITMENTS = [
  // Toyota
  { make: 'Toyota', model: 'Corolla', year: 2020, sizes: [{ width: 195, aspectRatio: 65, diameter: 15 }, { width: 205, aspectRatio: 55, diameter: 16 }] },
  { make: 'Toyota', model: 'Corolla', year: 2021, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Toyota', model: 'Corolla', year: 2022, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Toyota', model: 'Corolla', year: 2023, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 40, diameter: 18 }] },
  { make: 'Toyota', model: 'Camry', year: 2020, sizes: [{ width: 215, aspectRatio: 55, diameter: 17 }, { width: 235, aspectRatio: 45, diameter: 18 }] },
  { make: 'Toyota', model: 'Camry', year: 2021, sizes: [{ width: 215, aspectRatio: 55, diameter: 17 }, { width: 235, aspectRatio: 45, diameter: 18 }] },
  { make: 'Toyota', model: 'Camry', year: 2022, sizes: [{ width: 235, aspectRatio: 45, diameter: 18 }, { width: 245, aspectRatio: 40, diameter: 19 }] },
  { make: 'Toyota', model: 'RAV4', year: 2020, sizes: [{ width: 225, aspectRatio: 65, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 19 }] },
  { make: 'Toyota', model: 'RAV4', year: 2021, sizes: [{ width: 225, aspectRatio: 65, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 19 }] },
  { make: 'Toyota', model: 'RAV4', year: 2022, sizes: [{ width: 225, aspectRatio: 60, diameter: 18 }, { width: 235, aspectRatio: 55, diameter: 19 }] },
  // Volkswagen
  { make: 'Volkswagen', model: 'Tiguan', year: 2020, sizes: [{ width: 215, aspectRatio: 65, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 18 }] },
  { make: 'Volkswagen', model: 'Tiguan', year: 2021, sizes: [{ width: 215, aspectRatio: 65, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 18 }] },
  { make: 'Volkswagen', model: 'Golf', year: 2020, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Volkswagen', model: 'Golf', year: 2021, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Volkswagen', model: 'Passat', year: 2020, sizes: [{ width: 215, aspectRatio: 55, diameter: 17 }, { width: 235, aspectRatio: 45, diameter: 18 }] },
  { make: 'Volkswagen', model: 'Passat', year: 2021, sizes: [{ width: 215, aspectRatio: 55, diameter: 17 }, { width: 235, aspectRatio: 45, diameter: 18 }] },
  // BMW
  { make: 'BMW', model: '3 Series', year: 2020, sizes: [{ width: 225, aspectRatio: 45, diameter: 18 }, { width: 255, aspectRatio: 35, diameter: 19 }] },
  { make: 'BMW', model: '3 Series', year: 2021, sizes: [{ width: 225, aspectRatio: 45, diameter: 18 }, { width: 255, aspectRatio: 35, diameter: 19 }] },
  { make: 'BMW', model: '5 Series', year: 2020, sizes: [{ width: 245, aspectRatio: 45, diameter: 18 }, { width: 275, aspectRatio: 35, diameter: 20 }] },
  { make: 'BMW', model: 'X5', year: 2021, sizes: [{ width: 265, aspectRatio: 50, diameter: 19 }, { width: 275, aspectRatio: 45, diameter: 21 }] },
  // Mercedes-Benz
  { make: 'Mercedes-Benz', model: 'C-Class', year: 2021, sizes: [{ width: 225, aspectRatio: 45, diameter: 18 }, { width: 245, aspectRatio: 40, diameter: 19 }] },
  { make: 'Mercedes-Benz', model: 'E-Class', year: 2020, sizes: [{ width: 245, aspectRatio: 45, diameter: 18 }, { width: 275, aspectRatio: 35, diameter: 20 }] },
  { make: 'Mercedes-Benz', model: 'GLC', year: 2021, sizes: [{ width: 235, aspectRatio: 60, diameter: 18 }, { width: 255, aspectRatio: 45, diameter: 20 }] },
  // Audi
  { make: 'Audi', model: 'A4', year: 2021, sizes: [{ width: 225, aspectRatio: 50, diameter: 17 }, { width: 245, aspectRatio: 40, diameter: 18 }] },
  { make: 'Audi', model: 'Q5', year: 2020, sizes: [{ width: 235, aspectRatio: 60, diameter: 18 }, { width: 255, aspectRatio: 45, diameter: 20 }] },
  { make: 'Audi', model: 'A6', year: 2021, sizes: [{ width: 225, aspectRatio: 55, diameter: 17 }, { width: 245, aspectRatio: 45, diameter: 18 }] },
  // Skoda
  { make: 'Skoda', model: 'Octavia', year: 2020, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Skoda', model: 'Octavia', year: 2021, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Skoda', model: 'Kodiaq', year: 2020, sizes: [{ width: 215, aspectRatio: 65, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 19 }] },
  { make: 'Skoda', model: 'Superb', year: 2021, sizes: [{ width: 215, aspectRatio: 55, diameter: 17 }, { width: 235, aspectRatio: 45, diameter: 18 }] },
  // Honda
  { make: 'Honda', model: 'Civic', year: 2021, sizes: [{ width: 215, aspectRatio: 55, diameter: 16 }, { width: 235, aspectRatio: 40, diameter: 18 }] },
  { make: 'Honda', model: 'CR-V', year: 2020, sizes: [{ width: 225, aspectRatio: 65, diameter: 17 }, { width: 235, aspectRatio: 60, diameter: 18 }] },
  { make: 'Honda', model: 'Accord', year: 2021, sizes: [{ width: 225, aspectRatio: 50, diameter: 17 }, { width: 235, aspectRatio: 45, diameter: 18 }] },
  // Hyundai
  { make: 'Hyundai', model: 'Tucson', year: 2021, sizes: [{ width: 225, aspectRatio: 60, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 19 }] },
  { make: 'Hyundai', model: 'Tucson', year: 2022, sizes: [{ width: 235, aspectRatio: 55, diameter: 18 }, { width: 235, aspectRatio: 50, diameter: 19 }] },
  { make: 'Hyundai', model: 'Elantra', year: 2020, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Hyundai', model: 'Santa Fe', year: 2021, sizes: [{ width: 235, aspectRatio: 60, diameter: 18 }, { width: 255, aspectRatio: 45, diameter: 20 }] },
  // Kia
  { make: 'Kia', model: 'Sportage', year: 2021, sizes: [{ width: 225, aspectRatio: 60, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 19 }] },
  { make: 'Kia', model: 'Sportage', year: 2022, sizes: [{ width: 235, aspectRatio: 55, diameter: 18 }, { width: 255, aspectRatio: 45, diameter: 19 }] },
  { make: 'Kia', model: 'Ceed', year: 2020, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Kia', model: 'Sorento', year: 2021, sizes: [{ width: 235, aspectRatio: 65, diameter: 17 }, { width: 255, aspectRatio: 50, diameter: 20 }] },
  // Mazda
  { make: 'Mazda', model: 'CX-5', year: 2021, sizes: [{ width: 225, aspectRatio: 55, diameter: 19 }, { width: 225, aspectRatio: 65, diameter: 17 }] },
  { make: 'Mazda', model: '3', year: 2020, sizes: [{ width: 205, aspectRatio: 60, diameter: 16 }, { width: 215, aspectRatio: 45, diameter: 18 }] },
  { make: 'Mazda', model: '6', year: 2021, sizes: [{ width: 225, aspectRatio: 45, diameter: 19 }, { width: 225, aspectRatio: 55, diameter: 17 }] },
  // Nissan
  { make: 'Nissan', model: 'Qashqai', year: 2021, sizes: [{ width: 215, aspectRatio: 65, diameter: 17 }, { width: 225, aspectRatio: 55, diameter: 19 }] },
  { make: 'Nissan', model: 'X-Trail', year: 2021, sizes: [{ width: 225, aspectRatio: 65, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 19 }] },
  // Ford
  { make: 'Ford', model: 'Focus', year: 2020, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 215, aspectRatio: 50, diameter: 17 }] },
  { make: 'Ford', model: 'Kuga', year: 2021, sizes: [{ width: 225, aspectRatio: 55, diameter: 18 }, { width: 235, aspectRatio: 50, diameter: 19 }] },
  // Renault
  { make: 'Renault', model: 'Duster', year: 2020, sizes: [{ width: 215, aspectRatio: 65, diameter: 16 }, { width: 215, aspectRatio: 60, diameter: 17 }] },
  { make: 'Renault', model: 'Megane', year: 2021, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  // Peugeot
  { make: 'Peugeot', model: '3008', year: 2021, sizes: [{ width: 215, aspectRatio: 65, diameter: 17 }, { width: 225, aspectRatio: 55, diameter: 18 }] },
  { make: 'Peugeot', model: '5008', year: 2021, sizes: [{ width: 225, aspectRatio: 55, diameter: 18 }, { width: 235, aspectRatio: 50, diameter: 19 }] },
];

// Seasonal content
const MOCK_SEASONAL_CONTENT = [
  {
    name: 'winter-2025',
    isActive: true,
    featuredSeason: 'winter' as const,
    heroTitle: 'Зимові шини Bridgestone',
    heroSubtitle: 'Безпека на дорозі взимку',
    ctaText: 'Переглянути зимові моделі',
    ctaLink: '/passenger-tyres?season=winter',
    gradient: 'from-blue-900 to-slate-900',
    promoText: 'Знижки до 15% на зимові шини Blizzak до кінця січня!',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2025-03-31'),
  },
  {
    name: 'summer-2025',
    isActive: false,
    featuredSeason: 'summer' as const,
    heroTitle: 'Літні шини Bridgestone',
    heroSubtitle: 'Максимальне зчеплення в теплу пору',
    ctaText: 'Переглянути літні моделі',
    ctaLink: '/passenger-tyres?season=summer',
    gradient: 'from-amber-800 to-stone-900',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2025-09-30'),
  },
];

async function seed() {
  console.log('🌱 Starting seed...\n');

  const payload = await getPayload({ config });
  const forceReseed = process.argv.includes('--force');

  // Check for existing data
  const existingTyres = await payload.find({ collection: 'tyres', limit: 1 });
  if (existingTyres.totalDocs > 0) {
    if (forceReseed) {
      console.log('🗑️  Force mode: Clearing existing data...');

      // Delete in reverse order of dependencies
      const collections = [
        'seasonal-content',
        'contact-submissions',
        'vehicle-fitments',
        'articles',
        'dealers',
        'tyres',
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

  // Create admin user if not exists
  console.log('👤 Creating admin user...');
  const existingUsers = await payload.find({ collection: 'users', limit: 1 });
  if (existingUsers.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@bridgestone.ua',
        password: 'admin123',
        role: 'admin',
      },
    });
    console.log('   ✅ Admin user created: admin@bridgestone.ua / admin123\n');
  } else {
    console.log('   ℹ️  Admin user already exists\n');
  }

  // Seed Technologies
  console.log('🔧 Seeding technologies...');
  const technologyMap: Record<string, string> = {};
  for (const tech of MOCK_TECHNOLOGIES) {
    const created = await payload.create({
      collection: 'technologies',
      data: tech,
    });
    technologyMap[tech.slug] = created.id;
    console.log(`   ✅ ${tech.name}`);
  }
  console.log(`   Total: ${MOCK_TECHNOLOGIES.length} technologies\n`);

  // Seed Tyres
  console.log('🚗 Seeding tyres...');
  for (const tyre of MOCK_TYRE_MODELS) {
    const techIds = tyre.technologies?.map(slug => technologyMap[slug]).filter(Boolean) || [];

    // Upload image if URL provided
    let imageId: string | null = null;
    if (tyre.imageUrl) {
      imageId = await uploadImageFromUrl(payload, tyre.imageUrl, tyre.slug);
    }

    await payload.create({
      collection: 'tyres',
      data: {
        slug: tyre.slug,
        name: tyre.name,
        season: tyre.season,
        vehicleTypes: tyre.vehicleTypes,
        isNew: tyre.isNew || false,
        isPopular: tyre.isPopular || false,
        isPublished: tyre.isPublished || true,
        shortDescription: tyre.shortDescription,
        euLabel: tyre.euLabel,
        sizes: tyre.sizes,
        usage: tyre.usage,
        technologies: techIds,
        keyBenefits: tyre.keyBenefits?.map(benefit => ({ benefit })),
        ...(imageId && { image: imageId }),
      },
    });
    console.log(`   ✅ ${tyre.name}${imageId ? ' (with image)' : ''}`);
  }
  console.log(`   Total: ${MOCK_TYRE_MODELS.length} tyres\n`);

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

  // Seed Articles
  console.log('📰 Seeding articles...');
  for (const article of MOCK_ARTICLES) {
    await payload.create({
      collection: 'articles',
      data: {
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        previewText: article.previewText,
        body: article.body,
        readingTimeMinutes: article.readingTimeMinutes,
        tags: article.tags?.map(tag => ({ tag })),
        publishedAt: article.publishedAt,
      },
    });
    console.log(`   ✅ ${article.title}`);
  }
  console.log(`   Total: ${MOCK_ARTICLES.length} articles\n`);

  // Seed Vehicle Fitments
  console.log('🚙 Seeding vehicle fitments...');
  for (const fitment of MOCK_VEHICLE_FITMENTS) {
    await payload.create({
      collection: 'vehicle-fitments',
      data: {
        make: fitment.make,
        model: fitment.model,
        yearFrom: fitment.year,
        yearTo: fitment.year,
        recommendedSizes: fitment.sizes,
      },
    });
  }
  console.log(`   ✅ ${MOCK_VEHICLE_FITMENTS.length} vehicle fitments created\n`);

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

  // Seed Reviews
  console.log('⭐ Seeding reviews...');
  const tyresResult = await payload.find({ collection: 'tyres', limit: 10 });
  const tyreIds = tyresResult.docs.map((t: { id: number }) => t.id);
  if (tyreIds.length > 0) {
    const MOCK_REVIEWS = [
      { tyre: tyreIds[0], authorName: 'Олександр', authorCity: 'Київ', rating: 5, title: 'Відмінні шини для зими', content: 'Встановив на Camry, проїхав вже 10 000 км. Чудове зчеплення на мокрій дорозі та снігу. Рівень шуму мінімальний.', vehicleInfo: 'Toyota Camry 2021', usagePeriod: '6 місяців', pros: [{ text: 'Відмінне зчеплення' }, { text: 'Низький рівень шуму' }], cons: [{ text: 'Ціна вища за середню' }], isPublished: true },
      { tyre: tyreIds[1 % tyreIds.length], authorName: 'Марина', authorCity: 'Львів', rating: 4, title: 'Хороший баланс ціна-якість', content: 'Шини тримають дорогу впевнено. На мокрому асфальті гальмування передбачуване. Знос рівномірний.', vehicleInfo: 'Volkswagen Golf 2020', usagePeriod: '1 рік', pros: [{ text: 'Стабільність на швидкості' }, { text: 'Рівномірний знос' }], cons: [{ text: 'Жорсткуваті на ямах' }], isPublished: true },
      { tyre: tyreIds[2 % tyreIds.length], authorName: 'Віктор', authorCity: 'Одеса', rating: 5, title: 'Найкращі всесезонні шини', content: 'Їжджу цілий рік на одному комплекті. Навіть в легкий сніг почуваюся впевнено. Рекомендую для тих, хто не хоче міняти шини двічі на рік.', vehicleInfo: 'Mazda CX-5 2022', usagePeriod: '1.5 роки', pros: [{ text: 'Універсальність' }, { text: 'Комфорт' }, { text: 'Тихі' }], cons: [], isPublished: true },
      { tyre: tyreIds[0], authorName: 'Ірина', authorCity: 'Харків', rating: 4, title: 'Задоволена покупкою', content: 'Взяла за рекомендацією дилера. Шини м\'які, комфортні. На мокрій дорозі тримають добре.', vehicleInfo: 'Hyundai Tucson 2021', usagePeriod: '8 місяців', pros: [{ text: 'Комфорт' }, { text: 'Тиха робота' }], cons: [{ text: 'На гравію трохи ковзають' }], isPublished: true },
      { tyre: tyreIds[3 % tyreIds.length], authorName: 'Дмитро', authorCity: 'Дніпро', rating: 5, title: 'Топові літні шини', content: 'Вже другий комплект Bridgestone на моєму авто. Попередні відходили 50 000 км. Ці також не розчаровують — чудове зчеплення і мінімальний шум.', vehicleInfo: 'BMW 3 Series 2020', usagePeriod: '2 роки', pros: [{ text: 'Довговічність' }, { text: 'Зчеплення' }, { text: 'Керованість' }], cons: [], isPublished: true },
      { tyre: tyreIds[1 % tyreIds.length], authorName: 'Андрій', authorCity: 'Запоріжжя', rating: 3, title: 'Нормальні шини, але є нюанси', content: 'На сухому асфальті все чудово. На мокрому гальмівний шлях трохи довший ніж очікував. Загалом за свою ціну — нормальний варіант.', vehicleInfo: 'Skoda Octavia 2019', usagePeriod: '4 місяці', pros: [{ text: 'Ціна' }], cons: [{ text: 'Гальмування на мокрому' }], isPublished: true },
    ];

    for (const review of MOCK_REVIEWS) {
      await payload.create({ collection: 'reviews', data: review });
    }
    console.log(`   ✅ ${MOCK_REVIEWS.length} reviews created`);
  } else {
    console.log('   ⚠️ No tyres found, skipping reviews');
  }
  console.log();

  console.log('✨ Seed completed successfully!\n');
  console.log('Summary:');
  console.log(`   - ${MOCK_TECHNOLOGIES.length} technologies`);
  console.log(`   - ${MOCK_TYRE_MODELS.length} tyres`);
  console.log(`   - ${MOCK_DEALERS.length} dealers`);
  console.log(`   - ${MOCK_ARTICLES.length} articles`);
  console.log(`   - ${MOCK_VEHICLE_FITMENTS.length} vehicle fitments`);
  console.log(`   - ${MOCK_SEASONAL_CONTENT.length} seasonal configs`);
  console.log(`   - 6 reviews\n`);
  console.log('You can now log in to the admin panel:');
  console.log('   URL: http://localhost:3001/admin');
  console.log('   Email: admin@bridgestone.ua');
  console.log('   Password: admin123\n');

  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
