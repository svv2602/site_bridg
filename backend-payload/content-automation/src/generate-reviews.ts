/**
 * Generate Reviews CLI
 *
 * Usage:
 *   npx tsx src/generate-reviews.ts --tyreId=123 --count=3
 *   npx tsx src/generate-reviews.ts --all --count=3
 *   npx tsx src/generate-reviews.ts --list
 *
 * Options:
 *   --tyreId=<number>  Tyre ID to generate reviews for
 *   --all              Generate reviews for all tyres
 *   --count=<number>   Number of reviews to generate (default: 3, max: 10)
 *   --list             List all tyres with review counts
 *   --dry-run          Generate but don't save to database
 */

import { fallbackLlm } from "./providers/fallback-llm.js";
import { getPayloadClient } from "./publishers/payload-client.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("GenerateReviews");

// Ukrainian first names (male and female)
const UKRAINIAN_NAMES = [
  "Олександр", "Андрій", "Сергій", "Володимир", "Максим", "Дмитро", "Іван", "Михайло",
  "Олексій", "Юрій", "Віктор", "Ігор", "Тарас", "Богдан", "Петро", "Роман",
  "Олена", "Наталія", "Оксана", "Ірина", "Марія", "Тетяна", "Катерина", "Анна",
  "Юлія", "Людмила", "Світлана", "Вікторія", "Ольга", "Галина", "Надія", "Лариса"
];

// Ukrainian cities
const UKRAINIAN_CITIES = [
  "Київ", "Львів", "Одеса", "Харків", "Дніпро", "Запоріжжя", "Вінниця",
  "Чернігів", "Полтава", "Херсон", "Миколаїв", "Суми", "Черкаси", "Кропивницький",
  "Рівне", "Луцьк", "Тернопіль", "Івано-Франківськ", "Ужгород", "Житомир",
  "Хмельницький", "Чернівці", "Кривий Ріг", "Маріуполь", "Біла Церква"
];

// Popular vehicles in Ukraine
const VEHICLES = {
  passenger: [
    "Toyota Camry 2022", "Volkswagen Passat 2021", "Skoda Octavia 2023",
    "Hyundai Sonata 2022", "Kia K5 2023", "Mazda 6 2021", "Honda Accord 2022",
    "Toyota Corolla 2023", "Volkswagen Golf 2022", "Skoda Superb 2021",
    "Hyundai Elantra 2023", "Kia Cerato 2022", "Mazda 3 2023", "Honda Civic 2022",
    "Peugeot 508 2022", "Renault Megane 2023", "Ford Focus 2021"
  ],
  suv: [
    "Toyota RAV4 2023", "Volkswagen Tiguan 2022", "Skoda Kodiaq 2023",
    "Hyundai Tucson 2023", "Kia Sportage 2023", "Mazda CX-5 2022", "Honda CR-V 2023",
    "Nissan X-Trail 2022", "Mitsubishi Outlander 2023", "Subaru Forester 2022",
    "Toyota Land Cruiser Prado 2022", "BMW X5 2021", "Mercedes GLE 2022",
    "Audi Q5 2023", "Volvo XC60 2022", "Lexus RX 2023"
  ],
  van: [
    "Volkswagen Transporter T6 2022", "Mercedes Sprinter 2023", "Renault Trafic 2022",
    "Ford Transit 2023", "Peugeot Expert 2022", "Citroën Jumpy 2023",
    "Fiat Ducato 2022", "Iveco Daily 2023", "Opel Vivaro 2022"
  ]
};

// Usage periods
const USAGE_PERIODS = [
  "3 місяці", "6 місяців", "1 рік", "1.5 роки", "2 роки", "2.5 роки", "3 роки"
];

interface ReviewData {
  tyre: number;
  authorName: string;
  authorCity: string;
  rating: number;
  title: string;
  content: string;
  pros: Array<{ text: string }>;
  cons: Array<{ text: string }>;
  vehicleInfo: string;
  usagePeriod: string;
  isPublished: boolean;
  isGenerated: boolean;
}

export interface TyreInfo {
  id: number;
  name: string;
  brand: string;
  season: string;
  vehicleTypes: string[];
  shortDescription?: string;
}

/**
 * Get random element from array
 */
function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate review rating with realistic distribution
 * Most reviews are 4-5, occasional 3
 */
function generateRating(): number {
  const rand = Math.random();
  if (rand < 0.45) return 5;       // 45% chance for 5
  if (rand < 0.85) return 4;       // 40% chance for 4
  return 3;                        // 15% chance for 3
}

/**
 * Get vehicle type for review based on tyre
 */
function getVehicleType(tyreVehicleTypes: string[]): string {
  if (tyreVehicleTypes.includes("van")) return "van";
  if (tyreVehicleTypes.includes("suv")) return "suv";
  return "passenger";
}

/**
 * Build prompt for review generation
 */
function buildReviewPrompt(tyre: TyreInfo, count: number): string {
  const seasonUkr = {
    summer: "літня",
    winter: "зимова",
    allseason: "всесезонна"
  }[tyre.season] || tyre.season;

  const vehicleType = getVehicleType(tyre.vehicleTypes as string[]);
  const vehicleExamples = VEHICLES[vehicleType as keyof typeof VEHICLES] || VEHICLES.passenger;

  return `Ти - експерт з написання відгуків про автомобільні шини українською мовою.

Згенеруй ${count} реалістичних відгуків від різних українських покупців про шину "${tyre.name}" від ${tyre.brand === "bridgestone" ? "Bridgestone" : "Firestone"}.

Інформація про шину:
- Назва: ${tyre.name}
- Бренд: ${tyre.brand === "bridgestone" ? "Bridgestone" : "Firestone"}
- Сезон: ${seasonUkr}
- Тип авто: ${tyre.vehicleTypes.join(", ")}
${tyre.shortDescription ? `- Опис: ${tyre.shortDescription}` : ""}

Вимоги до відгуків:
1. Кожен відгук має бути унікальним і відображати особистий досвід
2. Використовуй різні імена з цього списку: ${UKRAINIAN_NAMES.slice(0, 10).join(", ")}...
3. Використовуй різні міста з цього списку: ${UKRAINIAN_CITIES.slice(0, 10).join(", ")}...
4. Використовуй реалістичні автомобілі: ${vehicleExamples.slice(0, 5).join(", ")}...
5. Оцінки: переважно 4-5 зірок, рідко 3
6. Стиль: природний, як реальні відгуки на сайтах
7. Довжина тексту: 50-150 слів
8. 2-4 переваги та 1-2 недоліки (можуть бути незначними)

Поверни JSON масив об'єктів з такою структурою:
[
  {
    "authorName": "Ім'я",
    "authorCity": "Місто",
    "rating": 5,
    "title": "Короткий заголовок (5-10 слів)",
    "content": "Повний текст відгуку (50-150 слів)...",
    "pros": ["Перевага 1", "Перевага 2", "Перевага 3"],
    "cons": ["Недолік 1"],
    "vehicleInfo": "Марка Модель Рік",
    "usagePeriod": "X місяців/років"
  }
]

КРИТИЧНО ВАЖЛИВО:
- Поверни САМЕ ${count} відгуків у вигляді JSON масиву
- Формат: [ {...}, {...}, {...} ] (масив з ${count} об'єктами)
- Без markdown, без пояснень, тільки валідний JSON масив`;
}

export interface GeneratedReview {
  authorName: string;
  authorCity: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  vehicleInfo: string;
  usagePeriod: string;
}

/**
 * Build prompt for single review generation
 */
function buildSingleReviewPrompt(tyre: TyreInfo, reviewIndex: number): string {
  const seasonUkr = {
    summer: "літня",
    winter: "зимова",
    allseason: "всесезонна"
  }[tyre.season] || tyre.season;

  const vehicleType = getVehicleType(tyre.vehicleTypes as string[]);
  const vehicleExamples = VEHICLES[vehicleType as keyof typeof VEHICLES] || VEHICLES.passenger;

  // Vary rating based on review index
  const suggestedRating = reviewIndex === 0 ? "5 (відмінно)" :
                          reviewIndex === 1 ? "4 або 5" :
                          "3, 4 або 5 (з реалістичними зауваженнями)";

  return `Ти - експерт з написання відгуків про автомобільні шини українською мовою.

Згенеруй ОДИН реалістичний відгук від українського покупця про шину "${tyre.name}" від ${tyre.brand === "bridgestone" ? "Bridgestone" : "Firestone"}.

Інформація про шину:
- Назва: ${tyre.name}
- Бренд: ${tyre.brand === "bridgestone" ? "Bridgestone" : "Firestone"}
- Сезон: ${seasonUkr}
- Тип авто: ${tyre.vehicleTypes.join(", ")}
${tyre.shortDescription ? `- Опис: ${tyre.shortDescription}` : ""}

Вимоги:
1. Унікальний відгук з особистим досвідом
2. Ім'я: обери випадкове з (${UKRAINIAN_NAMES.slice(reviewIndex * 4, reviewIndex * 4 + 4).join(", ")})
3. Місто: обери випадкове з (${UKRAINIAN_CITIES.slice(reviewIndex * 3, reviewIndex * 3 + 3).join(", ")})
4. Автомобіль: обери з (${vehicleExamples.slice(reviewIndex * 2, reviewIndex * 2 + 3).join(", ")})
5. Оцінка: ${suggestedRating}
6. Довжина тексту: 50-150 слів
7. 2-4 переваги та 1-2 недоліки

Поверни JSON об'єкт:
{
  "authorName": "Ім'я",
  "authorCity": "Місто",
  "rating": число 1-5,
  "title": "Короткий заголовок (5-10 слів)",
  "content": "Повний текст відгуку...",
  "pros": ["Перевага 1", "Перевага 2"],
  "cons": ["Недолік 1"],
  "vehicleInfo": "Марка Модель Рік",
  "usagePeriod": "X місяців"
}

Поверни ТІЛЬКИ JSON об'єкт, без markdown та пояснень.`;
}

/**
 * Generate reviews using LLM (one at a time for reliability)
 */
export async function generateReviewsWithLLM(tyre: TyreInfo, count: number): Promise<GeneratedReview[]> {
  logger.info(`Generating ${count} reviews for ${tyre.name}...`);

  const reviews: GeneratedReview[] = [];

  for (let i = 0; i < count; i++) {
    const prompt = buildSingleReviewPrompt(tyre, i);

    try {
      const result = await fallbackLlm.generateJSON<GeneratedReview>(prompt, {
        temperature: 0.9,
        maxTokens: 1000,
        taskType: "content-generation",
      });

      let review = result.data;

      // Handle if result is an array with single item
      if (Array.isArray(review)) {
        review = review[0] as GeneratedReview;
      }

      if (review && review.authorName && review.content) {
        reviews.push(review);
        logger.info(`  Generated review ${i + 1}/${count}: ${review.title} by ${review.authorName}`);
      }

      // Small delay between requests
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      logger.error(`Error generating review ${i + 1}: ${error}`);
    }
  }

  return reviews;
}

/**
 * Convert generated review to ReviewData format
 */
export function convertToReviewData(tyreId: number, review: GeneratedReview): ReviewData {
  return {
    tyre: tyreId,
    authorName: review.authorName,
    authorCity: review.authorCity,
    rating: Math.min(5, Math.max(1, review.rating)),
    title: review.title,
    content: review.content,
    pros: review.pros.map(text => ({ text })),
    cons: review.cons.map(text => ({ text })),
    vehicleInfo: review.vehicleInfo,
    usagePeriod: review.usagePeriod,
    isPublished: true,
    isGenerated: true,
  };
}

/**
 * Save reviews to Payload CMS
 */
async function saveReviews(reviews: ReviewData[]): Promise<number[]> {
  const client = getPayloadClient();
  await client.authenticate();

  const baseUrl = process.env.PAYLOAD_URL || "http://localhost:3001";
  const createdIds: number[] = [];

  for (const review of reviews) {
    try {
      const response = await fetch(`${baseUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${(client as any).token}`,
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Failed to create review: ${response.status} ${errorText}`);
        continue;
      }

      const result = await response.json();
      createdIds.push(result.doc?.id || result.id);
      logger.info(`  Created review: ${review.title} (ID: ${result.doc?.id || result.id})`);
    } catch (error) {
      logger.error(`Error creating review: ${error}`);
    }
  }

  return createdIds;
}

/**
 * Get tyre by ID
 */
async function getTyreById(id: number): Promise<TyreInfo | null> {
  const baseUrl = process.env.PAYLOAD_URL || "http://localhost:3001";

  try {
    const response = await fetch(`${baseUrl}/api/tyres/${id}`);
    if (!response.ok) return null;

    const tyre = await response.json();
    return {
      id: tyre.id,
      name: tyre.name,
      brand: tyre.brand,
      season: tyre.season,
      vehicleTypes: tyre.vehicleTypes || [],
      shortDescription: tyre.shortDescription,
    };
  } catch {
    return null;
  }
}

/**
 * Get all tyres
 */
async function getAllTyres(): Promise<TyreInfo[]> {
  const baseUrl = process.env.PAYLOAD_URL || "http://localhost:3001";

  try {
    const response = await fetch(`${baseUrl}/api/tyres?limit=200`);
    if (!response.ok) return [];

    const data = await response.json();
    return data.docs.map((tyre: any) => ({
      id: tyre.id,
      name: tyre.name,
      brand: tyre.brand,
      season: tyre.season,
      vehicleTypes: tyre.vehicleTypes || [],
      shortDescription: tyre.shortDescription,
    }));
  } catch {
    return [];
  }
}

/**
 * Get review count for tyre
 */
async function getReviewCount(tyreId: number): Promise<number> {
  const baseUrl = process.env.PAYLOAD_URL || "http://localhost:3001";

  try {
    const response = await fetch(`${baseUrl}/api/reviews?where[tyre][equals]=${tyreId}&limit=0`);
    if (!response.ok) return 0;

    const data = await response.json();
    return data.totalDocs || 0;
  } catch {
    return 0;
  }
}

/**
 * List all tyres with review counts
 */
async function listTyresWithReviews() {
  console.log("\n📋 Tyres with Review Counts:\n");

  const tyres = await getAllTyres();

  for (const tyre of tyres) {
    const reviewCount = await getReviewCount(tyre.id);
    const status = reviewCount === 0 ? "❌" : reviewCount < 3 ? "⚠️" : "✅";
    console.log(`${status} [${tyre.id}] ${tyre.name} (${tyre.brand}) - ${reviewCount} reviews`);
  }

  console.log(`\nTotal tyres: ${tyres.length}`);
}

/**
 * Generate reviews for a single tyre
 */
async function generateForTyre(tyreId: number, count: number, dryRun: boolean): Promise<number[]> {
  const tyre = await getTyreById(tyreId);

  if (!tyre) {
    console.error(`❌ Tyre ID ${tyreId} not found`);
    return [];
  }

  console.log(`\n🎯 Generating ${count} reviews for: ${tyre.name}`);
  console.log("=".repeat(50));

  // Generate reviews using LLM
  const generatedReviews = await generateReviewsWithLLM(tyre, count);

  console.log(`\n✅ Generated ${generatedReviews.length} reviews:`);
  for (const review of generatedReviews) {
    console.log(`  - ${review.title} (${review.rating}⭐) by ${review.authorName}, ${review.authorCity}`);
  }

  if (dryRun) {
    console.log("\n⚠️  Dry run - not saving to database");
    console.log("\nGenerated reviews JSON:");
    console.log(JSON.stringify(generatedReviews, null, 2));
    return [];
  }

  // Convert and save
  const reviewsData = generatedReviews.map(r => convertToReviewData(tyre.id, r));
  const createdIds = await saveReviews(reviewsData);

  console.log(`\n✅ Created ${createdIds.length} reviews in database`);
  console.log(`Created review IDs: [${createdIds.join(", ")}]`);

  return createdIds;
}

/**
 * Generate reviews for all tyres
 */
async function generateForAllTyres(count: number, dryRun: boolean) {
  const tyres = await getAllTyres();

  console.log(`\n🚀 Generating ${count} reviews for ${tyres.length} tyres...\n`);

  let totalCreated = 0;
  const allIds: number[] = [];

  for (const tyre of tyres) {
    // Check existing review count
    const existingCount = await getReviewCount(tyre.id);
    if (existingCount >= count) {
      console.log(`⏭️  Skipping ${tyre.name} - already has ${existingCount} reviews`);
      continue;
    }

    const toGenerate = count - existingCount;
    const createdIds = await generateForTyre(tyre.id, toGenerate, dryRun);
    totalCreated += createdIds.length;
    allIds.push(...createdIds);

    // Small delay between tyres
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n🎉 Total reviews created: ${totalCreated}`);
  if (allIds.length > 0) {
    console.log(`Created review IDs: [${allIds.join(", ")}]`);
  }
}

// CLI
const args = process.argv.slice(2);

const getArg = (name: string): string | undefined => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : undefined;
};

if (args.includes("--help") || args.length === 0) {
  console.log(`
Generate Reviews CLI

Usage:
  npx tsx src/generate-reviews.ts --tyreId=123 --count=3
  npx tsx src/generate-reviews.ts --all --count=3
  npx tsx src/generate-reviews.ts --list

Options:
  --tyreId=<number>  Tyre ID to generate reviews for
  --all              Generate reviews for all tyres (skips tyres with enough reviews)
  --count=<number>   Number of reviews to generate (default: 3, max: 10)
  --list             List all tyres with review counts
  --dry-run          Generate but don't save to database
  --help             Show this help

Examples:
  # Generate 3 reviews for tyre ID 5
  npx tsx src/generate-reviews.ts --tyreId=5 --count=3

  # Generate 3 reviews for all tyres
  npx tsx src/generate-reviews.ts --all --count=3

  # Preview generation without saving
  npx tsx src/generate-reviews.ts --tyreId=5 --count=2 --dry-run

  # List all tyres with review counts
  npx tsx src/generate-reviews.ts --list
`);
} else if (args.includes("--list")) {
  listTyresWithReviews().catch(console.error);
} else if (args.includes("--all")) {
  const count = Math.min(10, Math.max(1, parseInt(getArg("count") || "3", 10)));
  const dryRun = args.includes("--dry-run");
  generateForAllTyres(count, dryRun).catch(console.error);
} else {
  const tyreId = parseInt(getArg("tyreId") || "0", 10);
  if (!tyreId) {
    console.error("❌ Error: --tyreId is required");
    process.exit(1);
  }

  const count = Math.min(10, Math.max(1, parseInt(getArg("count") || "3", 10)));
  const dryRun = args.includes("--dry-run");

  generateForTyre(tyreId, count, dryRun).catch(console.error);
}
