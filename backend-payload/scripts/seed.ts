/**
 * Seed script for Payload CMS
 * Migrates mock data from frontend to Payload database
 */

import { getPayload } from 'payload';
import config from '../payload.config';

// Mock data from frontend
const MOCK_TECHNOLOGIES = [
  {
    slug: 'nano-pro-tech',
    name: 'Nano Pro-Tech',
    description:
      'Технологія гумової суміші, що забезпечує оптимальний баланс між зчепленням та опором коченню.',
  },
  {
    slug: 'noise-reduction',
    name: 'Зниження шуму',
    description:
      'Спеціальний рисунок протектора та конструкція блока протектора для зменшення шуму в салоні.',
  },
  {
    slug: 'winter-compound',
    name: 'Зимова гума з кремнієвими добавками',
    description:
      'Суміш, яка залишається еластичною за низьких температур для кращого зчеплення на снігу та льоду.',
  },
  {
    slug: 'multi-cell',
    name: 'Multi-Cell Compound',
    description:
      'Мікропористий склад гуми для ефективного відведення води з плями контакту.',
  },
];

const MOCK_TYRE_MODELS = [
  {
    slug: 'turanza-t005',
    name: 'Bridgestone Turanza T005',
    season: 'summer' as const,
    vehicleTypes: ['passenger'] as const[],
    isNew: false,
    isPopular: true,
    shortDescription:
      'Літні шини для щоденних поїздок містом та трасою з відмінним зчепленням на мокрій дорозі.',
    imageUrl: 'https://images.simpletire.com/images/q_auto/line-images/14283/14283-sidetread/bridgestone-turanza-t005.jpg',
    euLabel: {
      wetGrip: 'A',
      fuelEfficiency: 'B',
      noiseDb: 71,
      noiseClass: 'B',
    },
    sizes: [
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: '91', speedIndex: 'V' },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: '94', speedIndex: 'W' },
      { width: 235, aspectRatio: 40, diameter: 18, loadIndex: '95', speedIndex: 'Y' },
    ],
    usage: {
      city: 90,
      highway: 85,
      offroad: 10,
      winter: 0,
    },
    technologies: ['nano-pro-tech', 'noise-reduction'],
    keyBenefits: [
      'Відмінне зчеплення на мокрій дорозі',
      'Низький рівень шуму',
      'Економія пального',
      'Тривалий термін служби',
    ],
  },
  {
    slug: 'blizzak-lm005',
    name: 'Bridgestone Blizzak LM005',
    season: 'winter' as const,
    vehicleTypes: ['passenger', 'suv'] as const[],
    isNew: false,
    isPopular: true,
    shortDescription:
      'Зимові шини з фокусом на зчеплення на снігу та мокрому асфальті для безпечного руху взимку.',
    imageUrl: 'https://images.simpletire.com/images/q_auto/line-images/17531/17531-sidetread/bridgestone-blizzak-lm005.png',
    euLabel: {
      wetGrip: 'A',
      fuelEfficiency: 'C',
      noiseDb: 72,
      noiseClass: 'B',
    },
    sizes: [
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: '91', speedIndex: 'T' },
      { width: 225, aspectRatio: 50, diameter: 17, loadIndex: '98', speedIndex: 'H' },
      { width: 235, aspectRatio: 55, diameter: 18, loadIndex: '100', speedIndex: 'V' },
    ],
    usage: {
      city: 80,
      highway: 75,
      offroad: 20,
      winter: 100,
    },
    technologies: ['winter-compound', 'multi-cell'],
    keyBenefits: [
      'Відмінне зчеплення на снігу',
      'Коротка гальмівна відстань на льоду',
      'Стабільність на мокрій дорозі',
      'Комфортна їзда',
    ],
  },
  {
    slug: 'potenza-sport',
    name: 'Bridgestone Potenza Sport',
    season: 'summer' as const,
    vehicleTypes: ['passenger', 'sport'] as const[],
    isNew: true,
    isPopular: true,
    shortDescription:
      'Високопродуктивні літні шини для спортивних автомобілів з максимальним зчепленням.',
    euLabel: {
      wetGrip: 'A',
      fuelEfficiency: 'C',
      noiseDb: 72,
      noiseClass: 'B',
    },
    sizes: [
      { width: 245, aspectRatio: 35, diameter: 19, loadIndex: '93', speedIndex: 'Y' },
      { width: 255, aspectRatio: 35, diameter: 20, loadIndex: '97', speedIndex: 'Y' },
      { width: 275, aspectRatio: 30, diameter: 21, loadIndex: '98', speedIndex: 'Y' },
    ],
    usage: {
      city: 70,
      highway: 95,
      offroad: 5,
      winter: 0,
    },
    keyBenefits: [
      'Максимальне зчеплення на сухій дорозі',
      'Точне кермове управління',
      'Стабільність на високих швидкостях',
      'Спортивний дизайн',
    ],
  },
  {
    slug: 'dueler-at-002',
    name: 'Bridgestone Dueler A/T 002',
    season: 'allseason' as const,
    vehicleTypes: ['suv'] as const[],
    isNew: true,
    isPopular: false,
    shortDescription:
      'Всесезонні шини для SUV з балансом між асфальтом та бездоріжжям.',
    euLabel: {
      wetGrip: 'B',
      fuelEfficiency: 'C',
      noiseDb: 73,
      noiseClass: 'B',
    },
    sizes: [
      { width: 235, aspectRatio: 70, diameter: 16, loadIndex: '106', speedIndex: 'H' },
      { width: 265, aspectRatio: 65, diameter: 17, loadIndex: '112', speedIndex: 'H' },
      { width: 275, aspectRatio: 55, diameter: 20, loadIndex: '117', speedIndex: 'T' },
    ],
    usage: {
      city: 60,
      highway: 70,
      offroad: 80,
      winter: 50,
    },
    keyBenefits: [
      'Прохідність на бездоріжжі',
      'Комфорт на асфальті',
      'Міцна конструкція',
      'Всесезонне використання',
    ],
  },
];

const MOCK_DEALERS = [
  {
    name: 'Bridgestone Київ Центр',
    type: 'official' as const,
    city: 'Київ',
    address: 'вул. Прикладна, 10',
    latitude: 50.4501,
    longitude: 30.5234,
    phone: '+380 44 000 00 00',
    website: 'https://example-bridgestone-kyiv.ua',
    workingHours: 'Пн–Сб: 9:00–19:00',
    services: ['tire-fitting', 'balancing', 'storage'],
  },
  {
    name: 'Партнер Bridgestone Львів',
    type: 'partner' as const,
    city: 'Львів',
    address: 'просп. Свободи, 25',
    latitude: 49.8397,
    longitude: 24.0297,
    phone: '+380 32 000 00 00',
    workingHours: 'Пн–Пт: 9:00–18:00',
    services: ['tire-fitting'],
  },
  {
    name: 'Автосервіс Одеса',
    type: 'service' as const,
    city: 'Одеса',
    address: 'вул. Дерибасівська, 1',
    latitude: 46.4825,
    longitude: 30.7233,
    phone: '+380 48 000 00 00',
    workingHours: 'Пн–Сб: 8:00–20:00',
    services: ['tire-fitting', 'balancing', 'repair'],
  },
  {
    name: 'Bridgestone Харків',
    type: 'official' as const,
    city: 'Харків',
    address: 'вул. Сумська, 100',
    latitude: 49.9935,
    longitude: 36.2304,
    phone: '+380 57 000 00 00',
    website: 'https://example-bridgestone-kharkiv.ua',
    workingHours: 'Пн–Сб: 9:00–19:00',
    services: ['tire-fitting', 'balancing', 'storage', 'alignment'],
  },
  {
    name: 'Партнер Bridgestone Дніпро',
    type: 'partner' as const,
    city: 'Дніпро',
    address: 'просп. Яворницького, 50',
    latitude: 48.4647,
    longitude: 35.0462,
    phone: '+380 56 000 00 00',
    workingHours: 'Пн–Пт: 9:00–18:00, Сб: 10:00–15:00',
    services: ['tire-fitting'],
  },
];

const MOCK_ARTICLES = [
  {
    slug: 'how-to-choose-tyres',
    title: 'Як обрати шини для міста та траси',
    subtitle: 'Основні критерії вибору шин під ваш стиль водіння',
    previewText:
      'Розбираємо, на що звертати увагу при виборі шин: сезонність, індекси, розмір та тип вашого автомобіля.',
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
    readingTimeMinutes: 5,
    tags: ['тиск', 'безпечна експлуатація', 'економія'],
    publishedAt: new Date('2024-03-10'),
  },
];

const MOCK_VEHICLE_FITMENTS = [
  { make: 'Toyota', model: 'Corolla', year: 2020, sizes: [{ width: 195, aspectRatio: 65, diameter: 15 }, { width: 205, aspectRatio: 55, diameter: 16 }] },
  { make: 'Toyota', model: 'Corolla', year: 2021, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Toyota', model: 'Camry', year: 2020, sizes: [{ width: 215, aspectRatio: 55, diameter: 17 }, { width: 235, aspectRatio: 45, diameter: 18 }] },
  { make: 'Toyota', model: 'RAV4', year: 2021, sizes: [{ width: 225, aspectRatio: 65, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 19 }] },
  { make: 'Volkswagen', model: 'Tiguan', year: 2020, sizes: [{ width: 215, aspectRatio: 65, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 18 }] },
  { make: 'Volkswagen', model: 'Golf', year: 2021, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Volkswagen', model: 'Passat', year: 2020, sizes: [{ width: 215, aspectRatio: 55, diameter: 17 }, { width: 235, aspectRatio: 45, diameter: 18 }] },
  { make: 'BMW', model: '3 Series', year: 2021, sizes: [{ width: 225, aspectRatio: 45, diameter: 18 }, { width: 255, aspectRatio: 35, diameter: 19 }] },
  { make: 'BMW', model: '5 Series', year: 2020, sizes: [{ width: 245, aspectRatio: 45, diameter: 18 }, { width: 275, aspectRatio: 35, diameter: 20 }] },
  { make: 'BMW', model: 'X5', year: 2021, sizes: [{ width: 265, aspectRatio: 50, diameter: 19 }, { width: 275, aspectRatio: 45, diameter: 21 }] },
  { make: 'Mercedes-Benz', model: 'C-Class', year: 2021, sizes: [{ width: 225, aspectRatio: 45, diameter: 18 }, { width: 245, aspectRatio: 40, diameter: 19 }] },
  { make: 'Mercedes-Benz', model: 'E-Class', year: 2020, sizes: [{ width: 245, aspectRatio: 45, diameter: 18 }, { width: 275, aspectRatio: 35, diameter: 20 }] },
  { make: 'Audi', model: 'A4', year: 2021, sizes: [{ width: 225, aspectRatio: 50, diameter: 17 }, { width: 245, aspectRatio: 40, diameter: 18 }] },
  { make: 'Audi', model: 'Q5', year: 2020, sizes: [{ width: 235, aspectRatio: 60, diameter: 18 }, { width: 255, aspectRatio: 45, diameter: 20 }] },
  { make: 'Skoda', model: 'Octavia', year: 2021, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Skoda', model: 'Kodiaq', year: 2020, sizes: [{ width: 215, aspectRatio: 65, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 19 }] },
  { make: 'Honda', model: 'Civic', year: 2021, sizes: [{ width: 215, aspectRatio: 55, diameter: 16 }, { width: 235, aspectRatio: 40, diameter: 18 }] },
  { make: 'Honda', model: 'CR-V', year: 2020, sizes: [{ width: 225, aspectRatio: 65, diameter: 17 }, { width: 235, aspectRatio: 60, diameter: 18 }] },
  { make: 'Hyundai', model: 'Tucson', year: 2021, sizes: [{ width: 225, aspectRatio: 60, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 19 }] },
  { make: 'Hyundai', model: 'Elantra', year: 2020, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Kia', model: 'Sportage', year: 2021, sizes: [{ width: 225, aspectRatio: 60, diameter: 17 }, { width: 235, aspectRatio: 55, diameter: 19 }] },
  { make: 'Kia', model: 'Ceed', year: 2020, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Mazda', model: 'CX-5', year: 2021, sizes: [{ width: 225, aspectRatio: 55, diameter: 19 }, { width: 225, aspectRatio: 65, diameter: 17 }] },
  { make: 'Mazda', model: '3', year: 2020, sizes: [{ width: 205, aspectRatio: 60, diameter: 16 }, { width: 215, aspectRatio: 45, diameter: 18 }] },
  { make: 'Nissan', model: 'Qashqai', year: 2021, sizes: [{ width: 215, aspectRatio: 65, diameter: 17 }, { width: 225, aspectRatio: 55, diameter: 19 }] },
  { make: 'Ford', model: 'Focus', year: 2020, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 215, aspectRatio: 50, diameter: 17 }] },
  { make: 'Ford', model: 'Kuga', year: 2021, sizes: [{ width: 225, aspectRatio: 55, diameter: 18 }, { width: 235, aspectRatio: 50, diameter: 19 }] },
  { make: 'Renault', model: 'Duster', year: 2020, sizes: [{ width: 215, aspectRatio: 65, diameter: 16 }, { width: 215, aspectRatio: 60, diameter: 17 }] },
  { make: 'Renault', model: 'Megane', year: 2021, sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }, { width: 225, aspectRatio: 45, diameter: 17 }] },
  { make: 'Peugeot', model: '3008', year: 2021, sizes: [{ width: 215, aspectRatio: 65, diameter: 17 }, { width: 225, aspectRatio: 55, diameter: 18 }] },
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
      const collections = ['vehicle-fitments', 'articles', 'dealers', 'tyres', 'technologies'] as const;
      for (const collection of collections) {
        const items = await payload.find({ collection, limit: 1000 });
        for (const item of items.docs) {
          await payload.delete({ collection, id: item.id });
        }
        console.log(`   Deleted ${items.docs.length} ${collection}`);
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
  console.log('');

  // Seed Tyres
  console.log('🚗 Seeding tyres...');
  for (const tyre of MOCK_TYRE_MODELS) {
    const techIds = tyre.technologies?.map(slug => technologyMap[slug]).filter(Boolean) || [];

    await payload.create({
      collection: 'tyres',
      data: {
        slug: tyre.slug,
        name: tyre.name,
        season: tyre.season,
        vehicleTypes: tyre.vehicleTypes,
        isNew: tyre.isNew || false,
        isPopular: tyre.isPopular || false,
        shortDescription: tyre.shortDescription,
        euLabel: tyre.euLabel,
        sizes: tyre.sizes,
        usage: tyre.usage,
        technologies: techIds,
        keyBenefits: tyre.keyBenefits?.map(benefit => ({ benefit })),
      },
    });
    console.log(`   ✅ ${tyre.name}`);
  }
  console.log('');

  // Seed Dealers
  console.log('🏪 Seeding dealers...');
  for (const dealer of MOCK_DEALERS) {
    await payload.create({
      collection: 'dealers',
      data: dealer,
    });
    console.log(`   ✅ ${dealer.name}`);
  }
  console.log('');

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
        readingTimeMinutes: article.readingTimeMinutes,
        tags: article.tags?.map(tag => ({ tag })),
        publishedAt: article.publishedAt,
      },
    });
    console.log(`   ✅ ${article.title}`);
  }
  console.log('');

  // Seed Vehicle Fitments
  console.log('🚙 Seeding vehicle fitments...');
  for (const fitment of MOCK_VEHICLE_FITMENTS) {
    await payload.create({
      collection: 'vehicle-fitments',
      data: {
        make: fitment.make,
        model: fitment.model,
        year: fitment.year,
        recommendedSizes: fitment.sizes,
      },
    });
  }
  console.log(`   ✅ ${MOCK_VEHICLE_FITMENTS.length} vehicle fitments created\n`);

  console.log('✨ Seed completed successfully!\n');
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
