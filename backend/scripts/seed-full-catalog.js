/**
 * Full Bridgestone Tire Catalog Seed Script
 * Data compiled from official Bridgestone sources and public databases
 *
 * Run: STRAPI_TOKEN=your_token node scripts/seed-full-catalog.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN environment variable is required');
  console.log('Usage: STRAPI_TOKEN=your_token node scripts/seed-full-catalog.js');
  process.exit(1);
}

// ============================================================================
// TECHNOLOGIES
// ============================================================================
const technologies = [
  {
    slug: 'nano-pro-tech',
    name: 'NanoPro-Tech',
    description: 'Технологія полімерної суміші на молекулярному рівні, що забезпечує оптимальний баланс між зчепленням на мокрій дорозі, зносостійкістю та низьким опором коченню. Покращує паливну ефективність без втрати безпеки.',
  },
  {
    slug: 'b-silent',
    name: 'B-Silent',
    description: 'Шумопоглинаюча піна на внутрішній поверхні шини значно знижує рівень шуму в салоні автомобіля. Ідеально підходить для преміум-автомобілів та електромобілів.',
  },
  {
    slug: 'enliten',
    name: 'ENLITEN',
    description: 'Революційна технологія легкої конструкції шини, що зменшує вагу до 20% без втрати міцності. Знижує опір коченню та покращує паливну ефективність.',
  },
  {
    slug: 'multicell-compound',
    name: 'Multi-Cell Compound',
    description: 'Мікропориста гумова суміш для зимових шин з мільйонами мікропор, які поглинають воду з поверхні льоду, забезпечуючи надійне зчеплення в найскладніших зимових умовах.',
  },
  {
    slug: '3d-sipe',
    name: '3D Sipe Technology',
    description: 'Тривимірні ламелі в блоках протектора забезпечують додаткові кромки зчеплення на снігу та льоду, зберігаючи жорсткість блока для стабільного керування.',
  },
  {
    slug: 'pulse-groove',
    name: 'Pulse Groove',
    description: 'Інноваційний дизайн канавок протектора для ефективного відведення води та зниження ризику аквапланування на високих швидкостях.',
  },
  {
    slug: 'cooling-fin',
    name: 'Cooling Fin',
    description: 'Спеціальні ребра охолодження в плечовій зоні шини, що знижують температуру під час тривалої їзди на високих швидкостях.',
  },
  {
    slug: 'run-flat',
    name: 'Run-Flat (RFT)',
    description: 'Технологія посилених бокових стінок дозволяє продовжувати рух до 80 км зі швидкістю до 80 км/год навіть після повної втрати тиску.',
  },
];

// ============================================================================
// TIRE MODELS - PASSENGER SUMMER
// ============================================================================
const summerPassengerTires = [
  {
    slug: 'turanza-6',
    name: 'Bridgestone Turanza 6',
    season: 'summer',
    vehicleTypes: ['passenger'],
    isNew: true,
    isPopular: true,
    shortDescription: 'Преміальна літня шина нового покоління з технологією ENLITEN для максимального комфорту та паливної ефективності.',
    fullDescription: 'Turanza 6 — це найновіша розробка Bridgestone у сегменті преміальних туринг-шин. Завдяки технології ENLITEN шина на 10% легша за попередника, що забезпечує кращу паливну ефективність та менше навантаження на підвіску. Оптимізований профіль протектора гарантує відмінне зчеплення на мокрій дорозі та низький рівень шуму.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'A', noiseDb: 69 },
    sizes: [
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: 91, speedIndex: 'V' },
      { width: 205, aspectRatio: 55, diameter: 17, loadIndex: 91, speedIndex: 'W' },
      { width: 215, aspectRatio: 55, diameter: 17, loadIndex: 94, speedIndex: 'W' },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: 91, speedIndex: 'Y' },
      { width: 225, aspectRatio: 45, diameter: 18, loadIndex: 95, speedIndex: 'Y' },
      { width: 235, aspectRatio: 45, diameter: 18, loadIndex: 98, speedIndex: 'Y' },
      { width: 245, aspectRatio: 40, diameter: 18, loadIndex: 97, speedIndex: 'Y' },
      { width: 245, aspectRatio: 45, diameter: 19, loadIndex: 102, speedIndex: 'Y' },
      { width: 255, aspectRatio: 35, diameter: 19, loadIndex: 96, speedIndex: 'Y' },
      { width: 255, aspectRatio: 40, diameter: 20, loadIndex: 101, speedIndex: 'Y' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: false },
    technologies: ['enliten', 'nano-pro-tech', 'pulse-groove'],
  },
  {
    slug: 'turanza-t005',
    name: 'Bridgestone Turanza T005',
    season: 'summer',
    vehicleTypes: ['passenger'],
    isNew: false,
    isPopular: true,
    shortDescription: 'Преміальна літня шина з відмінним зчепленням на мокрій дорозі. EU Label Grade A за зчеплення.',
    fullDescription: 'Turanza T005 — бестселер серед преміальних літніх шин Bridgestone. Розроблена та виготовлена в Європі, шина забезпечує видатні показники на мокрій дорозі та тривалий термін служби. Технологія NanoPro-Tech оптимізує молекулярну структуру гуми для ідеального балансу характеристик.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'B', noiseDb: 71 },
    sizes: [
      { width: 185, aspectRatio: 65, diameter: 15, loadIndex: 88, speedIndex: 'H' },
      { width: 195, aspectRatio: 55, diameter: 16, loadIndex: 87, speedIndex: 'V' },
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: 91, speedIndex: 'V' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: 91, speedIndex: 'V' },
      { width: 205, aspectRatio: 55, diameter: 17, loadIndex: 91, speedIndex: 'W' },
      { width: 205, aspectRatio: 60, diameter: 16, loadIndex: 92, speedIndex: 'V' },
      { width: 215, aspectRatio: 50, diameter: 17, loadIndex: 91, speedIndex: 'W' },
      { width: 215, aspectRatio: 55, diameter: 16, loadIndex: 93, speedIndex: 'V' },
      { width: 215, aspectRatio: 55, diameter: 17, loadIndex: 94, speedIndex: 'W' },
      { width: 225, aspectRatio: 40, diameter: 18, loadIndex: 92, speedIndex: 'Y' },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: 91, speedIndex: 'W' },
      { width: 225, aspectRatio: 45, diameter: 18, loadIndex: 95, speedIndex: 'Y' },
      { width: 225, aspectRatio: 50, diameter: 17, loadIndex: 94, speedIndex: 'W' },
      { width: 235, aspectRatio: 45, diameter: 17, loadIndex: 94, speedIndex: 'W' },
      { width: 235, aspectRatio: 55, diameter: 17, loadIndex: 103, speedIndex: 'Y' },
      { width: 245, aspectRatio: 40, diameter: 18, loadIndex: 97, speedIndex: 'Y' },
      { width: 245, aspectRatio: 45, diameter: 18, loadIndex: 100, speedIndex: 'Y' },
      { width: 255, aspectRatio: 35, diameter: 19, loadIndex: 96, speedIndex: 'Y' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: false },
    technologies: ['nano-pro-tech', 'pulse-groove'],
  },
  {
    slug: 'potenza-sport',
    name: 'Bridgestone Potenza Sport',
    season: 'summer',
    vehicleTypes: ['passenger'],
    isNew: false,
    isPopular: true,
    shortDescription: 'Ультрависокопродуктивна літня шина для спортивних автомобілів та потужних седанів.',
    fullDescription: 'Potenza Sport — це шина для водіїв, які цінують максимальну продуктивність. Розроблена спільно з командами автоспорту, вона забезпечує виняткове зчеплення в поворотах та стабільність на високих швидкостях. Асиметричний малюнок протектора оптимізований для сухих та мокрих умов.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'C', noiseDb: 72 },
    sizes: [
      { width: 225, aspectRatio: 40, diameter: 18, loadIndex: 92, speedIndex: 'Y' },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: 94, speedIndex: 'Y' },
      { width: 235, aspectRatio: 35, diameter: 19, loadIndex: 91, speedIndex: 'Y' },
      { width: 235, aspectRatio: 40, diameter: 18, loadIndex: 95, speedIndex: 'Y' },
      { width: 245, aspectRatio: 35, diameter: 18, loadIndex: 92, speedIndex: 'Y' },
      { width: 245, aspectRatio: 35, diameter: 19, loadIndex: 93, speedIndex: 'Y' },
      { width: 245, aspectRatio: 40, diameter: 18, loadIndex: 97, speedIndex: 'Y' },
      { width: 255, aspectRatio: 30, diameter: 19, loadIndex: 91, speedIndex: 'Y' },
      { width: 255, aspectRatio: 35, diameter: 18, loadIndex: 94, speedIndex: 'Y' },
      { width: 255, aspectRatio: 35, diameter: 19, loadIndex: 96, speedIndex: 'Y' },
      { width: 265, aspectRatio: 30, diameter: 20, loadIndex: 94, speedIndex: 'Y' },
      { width: 265, aspectRatio: 35, diameter: 18, loadIndex: 97, speedIndex: 'Y' },
      { width: 275, aspectRatio: 30, diameter: 19, loadIndex: 96, speedIndex: 'Y' },
      { width: 275, aspectRatio: 35, diameter: 19, loadIndex: 100, speedIndex: 'Y' },
      { width: 285, aspectRatio: 30, diameter: 20, loadIndex: 99, speedIndex: 'Y' },
      { width: 295, aspectRatio: 30, diameter: 20, loadIndex: 101, speedIndex: 'Y' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: false },
    technologies: ['nano-pro-tech', 'cooling-fin'],
  },
  {
    slug: 'ecopia-ep150',
    name: 'Bridgestone Ecopia EP150',
    season: 'summer',
    vehicleTypes: ['passenger'],
    isNew: false,
    isPopular: false,
    shortDescription: 'Економічна літня шина з низьким опором коченню для зменшення витрати палива.',
    fullDescription: 'Ecopia EP150 — ідеальний вибір для економних водіїв. Знижений на 15% опір коченню порівняно з попередником забезпечує економію палива до 3%. При цьому шина зберігає надійне зчеплення на мокрій дорозі завдяки технології NanoPro-Tech.',
    euLabel: { wetGrip: 'B', fuelEfficiency: 'A', noiseDb: 70 },
    sizes: [
      { width: 175, aspectRatio: 65, diameter: 14, loadIndex: 82, speedIndex: 'T' },
      { width: 185, aspectRatio: 55, diameter: 15, loadIndex: 82, speedIndex: 'H' },
      { width: 185, aspectRatio: 60, diameter: 15, loadIndex: 84, speedIndex: 'H' },
      { width: 185, aspectRatio: 65, diameter: 15, loadIndex: 88, speedIndex: 'H' },
      { width: 195, aspectRatio: 55, diameter: 15, loadIndex: 85, speedIndex: 'H' },
      { width: 195, aspectRatio: 55, diameter: 16, loadIndex: 87, speedIndex: 'V' },
      { width: 195, aspectRatio: 60, diameter: 15, loadIndex: 88, speedIndex: 'H' },
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: 91, speedIndex: 'H' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: 91, speedIndex: 'V' },
      { width: 205, aspectRatio: 60, diameter: 16, loadIndex: 92, speedIndex: 'H' },
      { width: 205, aspectRatio: 65, diameter: 16, loadIndex: 95, speedIndex: 'H' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: false },
    technologies: ['nano-pro-tech'],
  },
];

// ============================================================================
// TIRE MODELS - PASSENGER WINTER
// ============================================================================
const winterPassengerTires = [
  {
    slug: 'blizzak-lm005',
    name: 'Bridgestone Blizzak LM005',
    season: 'winter',
    vehicleTypes: ['passenger', 'suv'],
    isNew: false,
    isPopular: true,
    shortDescription: 'Преміальна зимова шина з найвищим рейтингом зчеплення на мокрій дорозі серед зимових шин.',
    fullDescription: 'Blizzak LM005 — це новий стандарт безпеки взимку. Єдина зимова шина з рейтингом A за зчеплення на мокрій дорозі забезпечує впевнене гальмування в будь-яких умовах. Направлений малюнок протектора ефективно відводить воду та сніг, а спеціальна зимова суміш зберігає еластичність при екстремально низьких температурах.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'C', noiseDb: 72 },
    sizes: [
      { width: 185, aspectRatio: 55, diameter: 15, loadIndex: 82, speedIndex: 'T' },
      { width: 185, aspectRatio: 60, diameter: 15, loadIndex: 84, speedIndex: 'T' },
      { width: 185, aspectRatio: 65, diameter: 15, loadIndex: 88, speedIndex: 'T' },
      { width: 195, aspectRatio: 55, diameter: 16, loadIndex: 87, speedIndex: 'H' },
      { width: 195, aspectRatio: 60, diameter: 15, loadIndex: 88, speedIndex: 'T' },
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: 91, speedIndex: 'T' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: 91, speedIndex: 'H' },
      { width: 205, aspectRatio: 55, diameter: 17, loadIndex: 95, speedIndex: 'V' },
      { width: 205, aspectRatio: 60, diameter: 16, loadIndex: 92, speedIndex: 'H' },
      { width: 215, aspectRatio: 50, diameter: 17, loadIndex: 95, speedIndex: 'V' },
      { width: 215, aspectRatio: 55, diameter: 16, loadIndex: 93, speedIndex: 'H' },
      { width: 215, aspectRatio: 55, diameter: 17, loadIndex: 98, speedIndex: 'V' },
      { width: 225, aspectRatio: 40, diameter: 18, loadIndex: 92, speedIndex: 'V' },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: 91, speedIndex: 'V' },
      { width: 225, aspectRatio: 45, diameter: 18, loadIndex: 95, speedIndex: 'V' },
      { width: 225, aspectRatio: 50, diameter: 17, loadIndex: 94, speedIndex: 'H' },
      { width: 235, aspectRatio: 45, diameter: 18, loadIndex: 98, speedIndex: 'V' },
      { width: 235, aspectRatio: 55, diameter: 17, loadIndex: 103, speedIndex: 'V' },
      { width: 245, aspectRatio: 40, diameter: 18, loadIndex: 97, speedIndex: 'V' },
      { width: 245, aspectRatio: 45, diameter: 18, loadIndex: 100, speedIndex: 'V' },
      { width: 255, aspectRatio: 35, diameter: 19, loadIndex: 96, speedIndex: 'V' },
      { width: 255, aspectRatio: 40, diameter: 19, loadIndex: 100, speedIndex: 'V' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: true },
    technologies: ['nano-pro-tech', 'multicell-compound', '3d-sipe'],
  },
  {
    slug: 'blizzak-lm005-driveguard',
    name: 'Bridgestone Blizzak LM005 DriveGuard',
    season: 'winter',
    vehicleTypes: ['passenger'],
    isNew: true,
    isPopular: false,
    shortDescription: 'Зимова шина Run-Flat з технологією DriveGuard для безпечного продовження руху після проколу.',
    fullDescription: 'Поєднання переваг преміальної зимової шини Blizzak LM005 з технологією Run-Flat. Посилені бічні стінки дозволяють продовжувати рух до 80 км після повної втрати тиску. Ідеальне рішення для автомобілів без запасного колеса.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'C', noiseDb: 73 },
    sizes: [
      { width: 195, aspectRatio: 55, diameter: 16, loadIndex: 87, speedIndex: 'H' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: 94, speedIndex: 'H' },
      { width: 205, aspectRatio: 60, diameter: 16, loadIndex: 96, speedIndex: 'H' },
      { width: 215, aspectRatio: 55, diameter: 16, loadIndex: 97, speedIndex: 'H' },
      { width: 215, aspectRatio: 55, diameter: 17, loadIndex: 98, speedIndex: 'V' },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: 94, speedIndex: 'V' },
      { width: 225, aspectRatio: 50, diameter: 17, loadIndex: 98, speedIndex: 'V' },
      { width: 225, aspectRatio: 55, diameter: 17, loadIndex: 101, speedIndex: 'V' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: true },
    technologies: ['run-flat', 'multicell-compound', '3d-sipe'],
  },
];

// ============================================================================
// TIRE MODELS - ALL-SEASON
// ============================================================================
const allseasonTires = [
  {
    slug: 'weather-control-a005-evo',
    name: 'Bridgestone Weather Control A005 EVO',
    season: 'allseason',
    vehicleTypes: ['passenger'],
    isNew: true,
    isPopular: true,
    shortDescription: 'Преміальна всесезонна шина з сертифікацією 3PMSF для впевненої їзди цілий рік.',
    fullDescription: 'Weather Control A005 EVO — це рішення для водіїв, які хочуть одну шину на всі сезони без компромісів. Маркування 3PMSF (сніжинка) підтверджує її здатність впоратися з зимовими умовами, а рейтинг A за зчеплення на мокрій дорозі гарантує безпеку влітку.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'B', noiseDb: 71 },
    sizes: [
      { width: 185, aspectRatio: 55, diameter: 15, loadIndex: 82, speedIndex: 'V' },
      { width: 185, aspectRatio: 60, diameter: 15, loadIndex: 88, speedIndex: 'V' },
      { width: 185, aspectRatio: 65, diameter: 15, loadIndex: 88, speedIndex: 'V' },
      { width: 195, aspectRatio: 55, diameter: 16, loadIndex: 87, speedIndex: 'V' },
      { width: 195, aspectRatio: 65, diameter: 15, loadIndex: 91, speedIndex: 'V' },
      { width: 205, aspectRatio: 55, diameter: 16, loadIndex: 91, speedIndex: 'V' },
      { width: 205, aspectRatio: 55, diameter: 17, loadIndex: 95, speedIndex: 'V' },
      { width: 205, aspectRatio: 60, diameter: 16, loadIndex: 96, speedIndex: 'V' },
      { width: 215, aspectRatio: 45, diameter: 17, loadIndex: 91, speedIndex: 'W' },
      { width: 215, aspectRatio: 50, diameter: 17, loadIndex: 95, speedIndex: 'W' },
      { width: 215, aspectRatio: 55, diameter: 16, loadIndex: 93, speedIndex: 'V' },
      { width: 215, aspectRatio: 55, diameter: 17, loadIndex: 98, speedIndex: 'W' },
      { width: 225, aspectRatio: 40, diameter: 18, loadIndex: 92, speedIndex: 'Y' },
      { width: 225, aspectRatio: 45, diameter: 17, loadIndex: 94, speedIndex: 'W' },
      { width: 225, aspectRatio: 45, diameter: 18, loadIndex: 95, speedIndex: 'Y' },
      { width: 225, aspectRatio: 50, diameter: 17, loadIndex: 98, speedIndex: 'W' },
      { width: 235, aspectRatio: 45, diameter: 17, loadIndex: 97, speedIndex: 'W' },
      { width: 235, aspectRatio: 55, diameter: 17, loadIndex: 103, speedIndex: 'W' },
      { width: 245, aspectRatio: 40, diameter: 18, loadIndex: 97, speedIndex: 'Y' },
      { width: 245, aspectRatio: 45, diameter: 18, loadIndex: 100, speedIndex: 'Y' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: true },
    technologies: ['nano-pro-tech', '3d-sipe'],
  },
];

// ============================================================================
// TIRE MODELS - SUV
// ============================================================================
const suvTires = [
  {
    slug: 'dueler-at-001',
    name: 'Bridgestone Dueler A/T 001',
    season: 'allseason',
    vehicleTypes: ['suv'],
    isNew: false,
    isPopular: true,
    shortDescription: 'Універсальна всесезонна шина для SUV з балансом між дорожнім комфортом та позашляховими можливостями.',
    fullDescription: 'Dueler A/T 001 — ідеальний компроміс для власників SUV, які поєднують міську їзду з виїздами на природу. Агресивний малюнок протектора забезпечує прохідність на бездоріжжі, а оптимізований профіль гарантує тишу та комфорт на асфальті.',
    euLabel: { wetGrip: 'C', fuelEfficiency: 'C', noiseDb: 72 },
    sizes: [
      { width: 195, aspectRatio: 80, diameter: 15, loadIndex: 96, speedIndex: 'T' },
      { width: 205, aspectRatio: 80, diameter: 16, loadIndex: 104, speedIndex: 'T' },
      { width: 215, aspectRatio: 65, diameter: 16, loadIndex: 98, speedIndex: 'T' },
      { width: 215, aspectRatio: 70, diameter: 16, loadIndex: 100, speedIndex: 'T' },
      { width: 225, aspectRatio: 60, diameter: 18, loadIndex: 100, speedIndex: 'H' },
      { width: 225, aspectRatio: 65, diameter: 17, loadIndex: 102, speedIndex: 'H' },
      { width: 225, aspectRatio: 70, diameter: 16, loadIndex: 103, speedIndex: 'T' },
      { width: 235, aspectRatio: 55, diameter: 18, loadIndex: 100, speedIndex: 'V' },
      { width: 235, aspectRatio: 60, diameter: 16, loadIndex: 100, speedIndex: 'H' },
      { width: 235, aspectRatio: 60, diameter: 18, loadIndex: 107, speedIndex: 'V' },
      { width: 235, aspectRatio: 65, diameter: 17, loadIndex: 108, speedIndex: 'H' },
      { width: 235, aspectRatio: 70, diameter: 16, loadIndex: 106, speedIndex: 'T' },
      { width: 245, aspectRatio: 65, diameter: 17, loadIndex: 111, speedIndex: 'H' },
      { width: 245, aspectRatio: 70, diameter: 16, loadIndex: 111, speedIndex: 'T' },
      { width: 255, aspectRatio: 55, diameter: 18, loadIndex: 109, speedIndex: 'V' },
      { width: 255, aspectRatio: 60, diameter: 18, loadIndex: 112, speedIndex: 'H' },
      { width: 255, aspectRatio: 65, diameter: 17, loadIndex: 110, speedIndex: 'T' },
      { width: 255, aspectRatio: 70, diameter: 18, loadIndex: 113, speedIndex: 'S' },
      { width: 265, aspectRatio: 60, diameter: 18, loadIndex: 110, speedIndex: 'T' },
      { width: 265, aspectRatio: 65, diameter: 17, loadIndex: 112, speedIndex: 'T' },
      { width: 265, aspectRatio: 70, diameter: 16, loadIndex: 112, speedIndex: 'S' },
      { width: 275, aspectRatio: 65, diameter: 17, loadIndex: 115, speedIndex: 'T' },
      { width: 275, aspectRatio: 70, diameter: 16, loadIndex: 114, speedIndex: 'S' },
    ],
    usage: { city: true, highway: true, offroad: true, winter: false },
    technologies: [],
  },
  {
    slug: 'dueler-hp-sport',
    name: 'Bridgestone Dueler H/P Sport',
    season: 'summer',
    vehicleTypes: ['suv'],
    isNew: false,
    isPopular: true,
    shortDescription: 'Високопродуктивна літня шина для спортивних SUV та преміальних кросоверів.',
    fullDescription: 'Dueler H/P Sport поєднує спортивний характер з комфортом преміального SUV. Асиметричний малюнок протектора оптимізований для високошвидкісних маневрів, а посилена конструкція витримує навантаження важких автомобілів.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'C', noiseDb: 73 },
    sizes: [
      { width: 215, aspectRatio: 60, diameter: 17, loadIndex: 96, speedIndex: 'H' },
      { width: 215, aspectRatio: 65, diameter: 16, loadIndex: 98, speedIndex: 'H' },
      { width: 225, aspectRatio: 55, diameter: 18, loadIndex: 98, speedIndex: 'V' },
      { width: 225, aspectRatio: 60, diameter: 17, loadIndex: 99, speedIndex: 'V' },
      { width: 235, aspectRatio: 45, diameter: 19, loadIndex: 95, speedIndex: 'V' },
      { width: 235, aspectRatio: 50, diameter: 18, loadIndex: 97, speedIndex: 'V' },
      { width: 235, aspectRatio: 55, diameter: 17, loadIndex: 99, speedIndex: 'V' },
      { width: 235, aspectRatio: 55, diameter: 19, loadIndex: 101, speedIndex: 'V' },
      { width: 235, aspectRatio: 60, diameter: 18, loadIndex: 103, speedIndex: 'V' },
      { width: 245, aspectRatio: 45, diameter: 20, loadIndex: 99, speedIndex: 'V' },
      { width: 255, aspectRatio: 40, diameter: 20, loadIndex: 97, speedIndex: 'Y' },
      { width: 255, aspectRatio: 45, diameter: 19, loadIndex: 100, speedIndex: 'V' },
      { width: 255, aspectRatio: 45, diameter: 20, loadIndex: 101, speedIndex: 'W' },
      { width: 255, aspectRatio: 50, diameter: 19, loadIndex: 103, speedIndex: 'V' },
      { width: 255, aspectRatio: 50, diameter: 20, loadIndex: 109, speedIndex: 'V' },
      { width: 255, aspectRatio: 55, diameter: 18, loadIndex: 109, speedIndex: 'Y' },
      { width: 265, aspectRatio: 45, diameter: 20, loadIndex: 104, speedIndex: 'Y' },
      { width: 265, aspectRatio: 50, diameter: 19, loadIndex: 110, speedIndex: 'Y' },
      { width: 275, aspectRatio: 40, diameter: 20, loadIndex: 106, speedIndex: 'Y' },
      { width: 275, aspectRatio: 45, diameter: 19, loadIndex: 108, speedIndex: 'Y' },
      { width: 275, aspectRatio: 45, diameter: 20, loadIndex: 110, speedIndex: 'Y' },
      { width: 285, aspectRatio: 35, diameter: 21, loadIndex: 105, speedIndex: 'Y' },
      { width: 285, aspectRatio: 45, diameter: 19, loadIndex: 111, speedIndex: 'W' },
      { width: 295, aspectRatio: 35, diameter: 21, loadIndex: 107, speedIndex: 'Y' },
      { width: 315, aspectRatio: 35, diameter: 20, loadIndex: 110, speedIndex: 'Y' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: false },
    technologies: ['nano-pro-tech'],
  },
  {
    slug: 'alenza-001',
    name: 'Bridgestone Alenza 001',
    season: 'summer',
    vehicleTypes: ['suv'],
    isNew: false,
    isPopular: true,
    shortDescription: 'Преміальна літня шина для люксових SUV з фокусом на комфорт та низький рівень шуму.',
    fullDescription: 'Alenza 001 створена для найвибагливіших власників преміальних SUV. Інноваційний дизайн протектора мінімізує шум, а технологія B-Silent в окремих розмірах забезпечує тишу на рівні представницьких седанів. Ідеальне поєднання комфорту та безпеки.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'B', noiseDb: 70 },
    sizes: [
      { width: 235, aspectRatio: 55, diameter: 18, loadIndex: 100, speedIndex: 'V' },
      { width: 235, aspectRatio: 55, diameter: 19, loadIndex: 101, speedIndex: 'V' },
      { width: 235, aspectRatio: 60, diameter: 18, loadIndex: 107, speedIndex: 'V' },
      { width: 245, aspectRatio: 45, diameter: 20, loadIndex: 99, speedIndex: 'W' },
      { width: 255, aspectRatio: 45, diameter: 20, loadIndex: 101, speedIndex: 'W' },
      { width: 255, aspectRatio: 50, diameter: 19, loadIndex: 107, speedIndex: 'W' },
      { width: 255, aspectRatio: 50, diameter: 20, loadIndex: 109, speedIndex: 'V' },
      { width: 255, aspectRatio: 55, diameter: 18, loadIndex: 109, speedIndex: 'V' },
      { width: 265, aspectRatio: 45, diameter: 20, loadIndex: 104, speedIndex: 'Y' },
      { width: 265, aspectRatio: 50, diameter: 19, loadIndex: 110, speedIndex: 'Y' },
      { width: 275, aspectRatio: 40, diameter: 20, loadIndex: 106, speedIndex: 'Y' },
      { width: 275, aspectRatio: 45, diameter: 20, loadIndex: 110, speedIndex: 'Y' },
      { width: 275, aspectRatio: 50, diameter: 20, loadIndex: 113, speedIndex: 'W' },
      { width: 285, aspectRatio: 40, diameter: 21, loadIndex: 109, speedIndex: 'Y' },
      { width: 285, aspectRatio: 45, diameter: 19, loadIndex: 111, speedIndex: 'W' },
      { width: 285, aspectRatio: 45, diameter: 21, loadIndex: 113, speedIndex: 'Y' },
      { width: 295, aspectRatio: 35, diameter: 21, loadIndex: 107, speedIndex: 'Y' },
      { width: 295, aspectRatio: 40, diameter: 21, loadIndex: 111, speedIndex: 'Y' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: false },
    technologies: ['nano-pro-tech', 'b-silent', 'enliten'],
  },
  {
    slug: 'blizzak-dm-v3',
    name: 'Bridgestone Blizzak DM-V3',
    season: 'winter',
    vehicleTypes: ['suv'],
    isNew: false,
    isPopular: true,
    shortDescription: 'Преміальна зимова шина для SUV з покращеним зчепленням на снігу та льоду.',
    fullDescription: 'Blizzak DM-V3 — це зимова шина, розроблена спеціально для SUV та кросоверів. Вдосконалена технологія Multi-Cell Compound забезпечує впевнене зчеплення на льоду, а агресивний направлений малюнок ефективно справляється з глибоким снігом.',
    euLabel: { wetGrip: 'B', fuelEfficiency: 'C', noiseDb: 73 },
    sizes: [
      { width: 215, aspectRatio: 65, diameter: 16, loadIndex: 98, speedIndex: 'T' },
      { width: 215, aspectRatio: 70, diameter: 16, loadIndex: 100, speedIndex: 'T' },
      { width: 225, aspectRatio: 55, diameter: 18, loadIndex: 98, speedIndex: 'T' },
      { width: 225, aspectRatio: 60, diameter: 17, loadIndex: 99, speedIndex: 'T' },
      { width: 225, aspectRatio: 65, diameter: 17, loadIndex: 102, speedIndex: 'T' },
      { width: 235, aspectRatio: 55, diameter: 17, loadIndex: 99, speedIndex: 'T' },
      { width: 235, aspectRatio: 55, diameter: 18, loadIndex: 100, speedIndex: 'T' },
      { width: 235, aspectRatio: 55, diameter: 19, loadIndex: 105, speedIndex: 'T' },
      { width: 235, aspectRatio: 60, diameter: 18, loadIndex: 107, speedIndex: 'T' },
      { width: 235, aspectRatio: 65, diameter: 17, loadIndex: 108, speedIndex: 'T' },
      { width: 245, aspectRatio: 50, diameter: 20, loadIndex: 102, speedIndex: 'T' },
      { width: 245, aspectRatio: 55, diameter: 19, loadIndex: 103, speedIndex: 'T' },
      { width: 255, aspectRatio: 45, diameter: 20, loadIndex: 101, speedIndex: 'T' },
      { width: 255, aspectRatio: 50, diameter: 19, loadIndex: 107, speedIndex: 'T' },
      { width: 255, aspectRatio: 50, diameter: 20, loadIndex: 109, speedIndex: 'T' },
      { width: 255, aspectRatio: 55, diameter: 18, loadIndex: 109, speedIndex: 'T' },
      { width: 265, aspectRatio: 45, diameter: 20, loadIndex: 108, speedIndex: 'T' },
      { width: 265, aspectRatio: 50, diameter: 19, loadIndex: 110, speedIndex: 'T' },
      { width: 265, aspectRatio: 60, diameter: 18, loadIndex: 110, speedIndex: 'T' },
      { width: 275, aspectRatio: 40, diameter: 20, loadIndex: 106, speedIndex: 'T' },
      { width: 275, aspectRatio: 45, diameter: 20, loadIndex: 110, speedIndex: 'T' },
      { width: 275, aspectRatio: 50, diameter: 20, loadIndex: 113, speedIndex: 'T' },
      { width: 285, aspectRatio: 45, diameter: 22, loadIndex: 110, speedIndex: 'T' },
      { width: 285, aspectRatio: 50, diameter: 20, loadIndex: 112, speedIndex: 'T' },
    ],
    usage: { city: true, highway: true, offroad: true, winter: true },
    technologies: ['multicell-compound', '3d-sipe'],
  },
];

// ============================================================================
// TIRE MODELS - LCV (Light Commercial Vehicles)
// ============================================================================
const lcvTires = [
  {
    slug: 'duravis-van',
    name: 'Bridgestone Duravis Van',
    season: 'summer',
    vehicleTypes: ['lcv'],
    isNew: true,
    isPopular: true,
    shortDescription: 'Нова преміальна шина для мікроавтобусів та фургонів з рекордним пробігом та паливною ефективністю.',
    fullDescription: 'Duravis Van — це нове покоління комерційних шин Bridgestone. На 21% нижчий опір коченню порівняно з попередником (R660) забезпечує відчутну економію палива. Рейтинг A за зчеплення на мокрій дорозі гарантує безпеку навіть з повним завантаженням.',
    euLabel: { wetGrip: 'A', fuelEfficiency: 'B', noiseDb: 70 },
    sizes: [
      { width: 195, aspectRatio: 60, diameter: 16, loadIndex: 99, speedIndex: 'H' },
      { width: 195, aspectRatio: 65, diameter: 16, loadIndex: 104, speedIndex: 'T' },
      { width: 195, aspectRatio: 70, diameter: 15, loadIndex: 104, speedIndex: 'R' },
      { width: 195, aspectRatio: 75, diameter: 16, loadIndex: 107, speedIndex: 'R' },
      { width: 205, aspectRatio: 65, diameter: 16, loadIndex: 107, speedIndex: 'T' },
      { width: 205, aspectRatio: 75, diameter: 16, loadIndex: 110, speedIndex: 'R' },
      { width: 215, aspectRatio: 60, diameter: 16, loadIndex: 103, speedIndex: 'T' },
      { width: 215, aspectRatio: 65, diameter: 16, loadIndex: 109, speedIndex: 'T' },
      { width: 215, aspectRatio: 70, diameter: 15, loadIndex: 109, speedIndex: 'R' },
      { width: 215, aspectRatio: 75, diameter: 16, loadIndex: 116, speedIndex: 'R' },
      { width: 225, aspectRatio: 65, diameter: 16, loadIndex: 112, speedIndex: 'R' },
      { width: 225, aspectRatio: 70, diameter: 15, loadIndex: 112, speedIndex: 'R' },
      { width: 235, aspectRatio: 60, diameter: 17, loadIndex: 117, speedIndex: 'R' },
      { width: 235, aspectRatio: 65, diameter: 16, loadIndex: 115, speedIndex: 'R' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: false },
    technologies: ['enliten'],
  },
  {
    slug: 'duravis-r660',
    name: 'Bridgestone Duravis R660',
    season: 'summer',
    vehicleTypes: ['lcv'],
    isNew: false,
    isPopular: true,
    shortDescription: 'Надійна літня шина для фургонів та мікроавтобусів з тривалим терміном служби.',
    fullDescription: 'Duravis R660 — перевірений часом вибір для комерційних перевезень. Зносостійка гумова суміш забезпечує тривалий пробіг, а чотири поздовжні канавки ефективно відводять воду для безпечного гальмування на мокрій дорозі.',
    euLabel: { wetGrip: 'B', fuelEfficiency: 'C', noiseDb: 72 },
    sizes: [
      { width: 175, aspectRatio: 65, diameter: 14, loadIndex: 90, speedIndex: 'T' },
      { width: 185, aspectRatio: 75, diameter: 16, loadIndex: 104, speedIndex: 'R' },
      { width: 195, aspectRatio: 60, diameter: 16, loadIndex: 99, speedIndex: 'H' },
      { width: 195, aspectRatio: 65, diameter: 16, loadIndex: 104, speedIndex: 'R' },
      { width: 195, aspectRatio: 70, diameter: 15, loadIndex: 104, speedIndex: 'R' },
      { width: 195, aspectRatio: 75, diameter: 16, loadIndex: 107, speedIndex: 'R' },
      { width: 205, aspectRatio: 65, diameter: 16, loadIndex: 107, speedIndex: 'T' },
      { width: 205, aspectRatio: 70, diameter: 15, loadIndex: 106, speedIndex: 'R' },
      { width: 205, aspectRatio: 75, diameter: 16, loadIndex: 110, speedIndex: 'R' },
      { width: 215, aspectRatio: 60, diameter: 16, loadIndex: 103, speedIndex: 'T' },
      { width: 215, aspectRatio: 65, diameter: 16, loadIndex: 109, speedIndex: 'T' },
      { width: 215, aspectRatio: 70, diameter: 15, loadIndex: 109, speedIndex: 'R' },
      { width: 215, aspectRatio: 75, diameter: 16, loadIndex: 116, speedIndex: 'R' },
      { width: 225, aspectRatio: 65, diameter: 16, loadIndex: 112, speedIndex: 'R' },
      { width: 225, aspectRatio: 70, diameter: 15, loadIndex: 112, speedIndex: 'R' },
      { width: 225, aspectRatio: 75, diameter: 16, loadIndex: 118, speedIndex: 'R' },
      { width: 235, aspectRatio: 65, diameter: 16, loadIndex: 115, speedIndex: 'R' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: false },
    technologies: [],
  },
  {
    slug: 'blizzak-w995',
    name: 'Bridgestone Blizzak W995',
    season: 'winter',
    vehicleTypes: ['lcv'],
    isNew: false,
    isPopular: false,
    shortDescription: 'Зимова шина для комерційних автомобілів з впевненим зчепленням на снігу та льоду.',
    fullDescription: 'Blizzak W995 — спеціалізована зимова шина для фургонів та мікроавтобусів. Направлений V-подібний малюнок ефективно відводить сніг та воду, а зимова гумова суміш зберігає еластичність при низьких температурах. Маркування 3PMSF підтверджує зимові властивості.',
    euLabel: { wetGrip: 'B', fuelEfficiency: 'C', noiseDb: 73 },
    sizes: [
      { width: 195, aspectRatio: 65, diameter: 16, loadIndex: 104, speedIndex: 'R' },
      { width: 195, aspectRatio: 70, diameter: 15, loadIndex: 104, speedIndex: 'R' },
      { width: 195, aspectRatio: 75, diameter: 16, loadIndex: 107, speedIndex: 'R' },
      { width: 205, aspectRatio: 65, diameter: 16, loadIndex: 107, speedIndex: 'T' },
      { width: 205, aspectRatio: 75, diameter: 16, loadIndex: 110, speedIndex: 'R' },
      { width: 215, aspectRatio: 65, diameter: 16, loadIndex: 109, speedIndex: 'T' },
      { width: 215, aspectRatio: 75, diameter: 16, loadIndex: 116, speedIndex: 'R' },
      { width: 225, aspectRatio: 65, diameter: 16, loadIndex: 112, speedIndex: 'R' },
      { width: 225, aspectRatio: 70, diameter: 15, loadIndex: 112, speedIndex: 'R' },
      { width: 235, aspectRatio: 65, diameter: 16, loadIndex: 115, speedIndex: 'R' },
    ],
    usage: { city: true, highway: true, offroad: false, winter: true },
    technologies: ['multicell-compound'],
  },
];

// ============================================================================
// COMBINE ALL TIRES
// ============================================================================
const allTires = [
  ...summerPassengerTires,
  ...winterPassengerTires,
  ...allseasonTires,
  ...suvTires,
  ...lcvTires,
];

// ============================================================================
// API FUNCTIONS
// ============================================================================
async function createEntry(endpoint, data) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({ data: { ...data, publishedAt: new Date().toISOString() } }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`  ✗ Error creating ${endpoint}:`, error.error?.message || response.statusText);
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`  ✗ Error creating ${endpoint}:`, error.message);
    return null;
  }
}

async function clearCollection(endpoint) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/${endpoint}?pagination[limit]=1000`, {
      headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` },
    });

    if (!response.ok) return;

    const { data } = await response.json();

    for (const item of data) {
      await fetch(`${STRAPI_URL}/api/${endpoint}/${item.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` },
      });
    }

    console.log(`  Cleared ${data.length} items from ${endpoint}`);
  } catch (error) {
    console.error(`  Error clearing ${endpoint}:`, error.message);
  }
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function seed() {
  console.log('\n🌱 Seeding Bridgestone Full Catalog...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await clearCollection('technologies');
  await clearCollection('tyres');

  // Create technologies
  console.log('\n📦 Creating Technologies...');
  const techMap = {};
  for (const tech of technologies) {
    const created = await createEntry('technologies', tech);
    if (created) {
      techMap[tech.slug] = created.id;
      console.log(`  ✓ ${tech.name}`);
    }
  }

  // Create tires
  console.log('\n🛞 Creating Tires...');
  let created = 0;
  let totalSizes = 0;

  for (const tyre of allTires) {
    const tyreData = {
      slug: tyre.slug,
      name: tyre.name,
      season: tyre.season,
      vehicleTypes: tyre.vehicleTypes,
      isNew: tyre.isNew,
      isPopular: tyre.isPopular,
      shortDescription: tyre.shortDescription,
      fullDescription: tyre.fullDescription,
      euLabel: tyre.euLabel,
      sizes: tyre.sizes,
      usage: tyre.usage,
    };

    const result = await createEntry('tyres', tyreData);
    if (result) {
      created++;
      totalSizes += tyre.sizes.length;
      const seasonEmoji = tyre.season === 'summer' ? '☀️' : tyre.season === 'winter' ? '❄️' : '🌤️';
      console.log(`  ✓ ${seasonEmoji} ${tyre.name} (${tyre.sizes.length} sizes)`);
    }
  }

  // Summary
  console.log('\n✅ Seeding completed!\n');
  console.log('Summary:');
  console.log(`  - Technologies: ${technologies.length}`);
  console.log(`  - Tyre Models: ${created}`);
  console.log(`  - Total Sizes: ${totalSizes}`);
  console.log(`\n🔗 View in admin: ${STRAPI_URL}/admin\n`);
}

seed().catch(console.error);
