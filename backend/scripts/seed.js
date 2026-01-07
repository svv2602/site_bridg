/**
 * Seed script to import mock data into Strapi
 * Run: node scripts/seed.js
 */

const STRAPI_URL = 'http://localhost:1337';

// Seed data
const technologies = [
  {
    slug: 'nano-pro-tech',
    name: 'Nano Pro-Tech',
    description: 'Технологія гумової суміші, що забезпечує оптимальний баланс між зчепленням та опором коченню.',
    publishedAt: new Date().toISOString(),
  },
  {
    slug: 'noise-reduction',
    name: 'Зниження шуму',
    description: 'Спеціальний рисунок протектора та конструкція блока протектора для зменшення шуму в салоні.',
    publishedAt: new Date().toISOString(),
  },
  {
    slug: 'winter-compound',
    name: 'Зимова гума з кремнієвими добавками',
    description: 'Суміш, яка залишається еластичною за низьких температур для кращого зчеплення на снігу та льоду.',
    publishedAt: new Date().toISOString(),
  },
];

const tyres = [
  {
    slug: 'turanza-t005',
    name: 'Bridgestone Turanza T005',
    season: 'summer',
    vehicleTypes: ['passenger'],
    isNew: false,
    isPopular: true,
    shortDescription: 'Літні шини для щоденних поїздок містом та трасою з відмінним зчепленням на мокрій дорозі.',
    euLabel: {
      wetGrip: 'A',
      fuelEfficiency: 'B',
      noiseDb: 71,
    },
    sizes: [
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: 91, speedIndex: 'V' },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: 94, speedIndex: 'W' },
    ],
    usage: {
      city: true,
      highway: true,
      offroad: false,
      winter: false,
    },
    publishedAt: new Date().toISOString(),
  },
  {
    slug: 'blizzak-lm005',
    name: 'Bridgestone Blizzak LM005',
    season: 'winter',
    vehicleTypes: ['passenger', 'suv'],
    isNew: false,
    isPopular: true,
    shortDescription: 'Зимові шини з фокусом на зчеплення на снігу та мокрому асфальті для безпечного руху взимку.',
    sizes: [
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: 91, speedIndex: 'T' },
      { width: 225, aspectRatio: 50, diameter: 17, loadIndex: 98, speedIndex: 'H' },
    ],
    usage: {
      city: true,
      highway: true,
      offroad: false,
      winter: true,
    },
    publishedAt: new Date().toISOString(),
  },
  {
    slug: 'dueler-at001',
    name: 'Bridgestone Dueler A/T 001',
    season: 'allseason',
    vehicleTypes: ['suv'],
    isNew: true,
    isPopular: false,
    shortDescription: 'Всесезонні шини для SUV з балансом між дорожнім комфортом та позашляховими можливостями.',
    sizes: [
      { width: 235, aspectRatio: 65, diameter: 17, loadIndex: 108, speedIndex: 'H' },
      { width: 265, aspectRatio: 70, diameter: 16, loadIndex: 112, speedIndex: 'S' },
    ],
    usage: {
      city: true,
      highway: true,
      offroad: true,
      winter: false,
    },
    publishedAt: new Date().toISOString(),
  },
];

const dealers = [
  {
    name: 'Bridgestone Київ Центр',
    type: 'official',
    city: 'Київ',
    address: 'вул. Хрещатик, 10',
    latitude: 50.4501,
    longitude: 30.5234,
    phone: '+380 44 123 45 67',
    website: 'https://bridgestone-kyiv.ua',
    workingHours: 'Пн–Сб: 9:00–19:00',
    publishedAt: new Date().toISOString(),
  },
  {
    name: 'Партнер Bridgestone Львів',
    type: 'partner',
    city: 'Львів',
    address: 'просп. Свободи, 25',
    latitude: 49.8397,
    longitude: 24.0297,
    phone: '+380 32 234 56 78',
    workingHours: 'Пн–Пт: 9:00–18:00',
    publishedAt: new Date().toISOString(),
  },
  {
    name: 'Сервіс Bridgestone Одеса',
    type: 'service',
    city: 'Одеса',
    address: 'вул. Дерибасівська, 15',
    latitude: 46.4825,
    longitude: 30.7233,
    phone: '+380 48 345 67 89',
    workingHours: 'Пн–Сб: 8:00–20:00',
    publishedAt: new Date().toISOString(),
  },
  {
    name: 'Bridgestone Харків',
    type: 'official',
    city: 'Харків',
    address: 'пл. Свободи, 5',
    latitude: 49.9935,
    longitude: 36.2304,
    phone: '+380 57 456 78 90',
    workingHours: 'Пн–Пт: 9:00–18:00, Сб: 10:00–15:00',
    publishedAt: new Date().toISOString(),
  },
];

const articles = [
  {
    slug: 'how-to-choose-tyres',
    title: 'Як обрати шини для міста та траси',
    subtitle: 'Основні критерії вибору шин під ваш стиль водіння',
    previewText: 'Розбираємо, на що звертати увагу при виборі шин: сезонність, індекси, розмір та тип вашого автомобіля.',
    body: '## Вступ\n\nВибір правильних шин — це питання безпеки та комфорту. У цій статті ми розглянемо основні критерії.\n\n## Сезонність\n\nЛітні, зимові чи всесезонні? Все залежить від вашого регіону та стилю водіння.\n\n## Розмір\n\nЗавжди перевіряйте рекомендації виробника вашого авто.',
    readingTimeMinutes: 4,
    tags: ['вибір шин', 'поради'],
    seoTitle: 'Як обрати шини — поради від Bridgestone',
    seoDescription: 'Дізнайтеся як правильно обрати шини для вашого автомобіля. Поради експертів Bridgestone.',
    publishedAt: new Date().toISOString(),
  },
  {
    slug: 'how-to-read-markings',
    title: 'Як читати маркування шин',
    subtitle: 'Пояснюємо значення основних позначень на боковині шини',
    previewText: 'Що означають індекси навантаження, швидкості, дата виробництва та інші маркування — простою мовою.',
    body: '## Основне маркування\n\nНа боковині кожної шини ви знайдете маркування виду 205/55 R16 91V.\n\n### Розшифровка:\n- **205** — ширина шини в мм\n- **55** — висота профілю у %\n- **R16** — радіальна конструкція, діаметр 16 дюймів\n- **91** — індекс навантаження\n- **V** — індекс швидкості',
    readingTimeMinutes: 6,
    tags: ['маркування', 'безпечна експлуатація'],
    seoTitle: 'Маркування шин — повний гід',
    seoDescription: 'Як читати маркування шин: індекси, розміри, дата виробництва. Повний гід від Bridgestone.',
    publishedAt: new Date().toISOString(),
  },
  {
    slug: 'winter-tyre-tips',
    title: 'Підготовка до зими: коли міняти шини',
    subtitle: 'Правила безпечної експлуатації в холодну пору',
    previewText: 'Коли переходити на зимові шини, як їх зберігати та на що звертати увагу при виборі.',
    body: '## Коли міняти шини?\n\nОптимальний час — коли середньодобова температура опускається нижче +7°C.\n\n## Зберігання\n\nЗберігайте шини в прохолодному, сухому місці, подалі від прямих сонячних променів.',
    readingTimeMinutes: 5,
    tags: ['зима', 'безпека', 'поради'],
    publishedAt: new Date().toISOString(),
  },
];

async function createEntry(endpoint, data) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`  ✗ Error creating ${endpoint}:`, error.error?.message || response.statusText);
      return null;
    }

    const result = await response.json();
    console.log(`  ✓ Created ${endpoint}: ${data.name || data.title || data.slug}`);
    return result.data;
  } catch (error) {
    console.error(`  ✗ Error creating ${endpoint}:`, error.message);
    return null;
  }
}

async function seed() {
  console.log('\n🌱 Seeding Strapi database...\n');

  // Create technologies first
  console.log('📦 Creating Technologies...');
  const createdTechnologies = {};
  for (const tech of technologies) {
    const created = await createEntry('technologies', tech);
    if (created) {
      createdTechnologies[tech.slug] = created.id;
    }
  }

  // Create tyres
  console.log('\n🛞 Creating Tyres...');
  for (const tyre of tyres) {
    await createEntry('tyres', tyre);
  }

  // Create dealers
  console.log('\n📍 Creating Dealers...');
  for (const dealer of dealers) {
    await createEntry('dealers', dealer);
  }

  // Create articles
  console.log('\n📝 Creating Articles...');
  for (const article of articles) {
    await createEntry('articles', article);
  }

  console.log('\n✅ Seeding completed!\n');
  console.log('Summary:');
  console.log(`  - Technologies: ${technologies.length}`);
  console.log(`  - Tyres: ${tyres.length}`);
  console.log(`  - Dealers: ${dealers.length}`);
  console.log(`  - Articles: ${articles.length}`);
  console.log('\n🔗 View in admin: http://localhost:1337/admin\n');
}

seed().catch(console.error);
