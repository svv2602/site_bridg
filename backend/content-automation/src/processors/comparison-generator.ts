/**
 * Comparison Page Generator
 *
 * Generates comparison pages for 2-3 tyre models.
 * Creates comparison table, verdict via LLM, and SEO content.
 */

import { generateContent } from "./llm-generator.js";
import { SYSTEM_PROMPTS } from "../config/prompts.js";
import { ENV } from "../config/env.js";

// Types
export interface TyreForComparison {
  name: string;
  slug: string;
  season: "summer" | "winter" | "allseason";
  vehicleTypes: string[];
  euLabel?: {
    fuelEfficiency: string;
    wetGrip: string;
    noiseDb: number;
  };
  technologies?: string[];
  sizes?: string[];
}

export interface ComparisonRow {
  attribute: string;
  attributeKey: string;
  values: {
    tyreSlug: string;
    value: string;
    isWinner?: boolean;
  }[];
}

export interface ComparisonPage {
  slug: string;
  title: string;
  tyres: TyreForComparison[];
  comparisonTable: ComparisonRow[];
  verdict: string;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
}

export interface ComparisonGenerationResult {
  success: boolean;
  comparison?: ComparisonPage;
  error?: string;
}

// Attribute definitions for comparison
const COMPARISON_ATTRIBUTES = [
  { key: "season", label: "Сезон", priority: 1 },
  { key: "vehicleTypes", label: "Тип авто", priority: 2 },
  { key: "fuelEfficiency", label: "Паливна ефективність", priority: 3 },
  { key: "wetGrip", label: "Зчеплення на мокрій дорозі", priority: 4 },
  { key: "noiseDb", label: "Рівень шуму", priority: 5 },
  { key: "technologies", label: "Технології", priority: 6 },
  { key: "sizes", label: "Доступні розміри", priority: 7 },
];

// Season labels
const SEASON_LABELS: Record<string, string> = {
  summer: "Літня",
  winter: "Зимова",
  allseason: "Всесезонна",
};

// Vehicle type labels
const VEHICLE_LABELS: Record<string, string> = {
  passenger: "Легкові",
  suv: "SUV/Кросовери",
  lcv: "Легкі вантажівки",
  sport: "Спортивні",
};

/**
 * Generate comparison slug from tyre slugs
 */
export function generateComparisonSlug(tyres: TyreForComparison[]): string {
  return tyres.map((t) => t.slug).join("-vs-");
}

/**
 * Extract attribute value from tyre
 */
function getAttributeValue(tyre: TyreForComparison, key: string): string {
  switch (key) {
    case "season":
      return SEASON_LABELS[tyre.season] || tyre.season;
    case "vehicleTypes":
      return tyre.vehicleTypes.map((v) => VEHICLE_LABELS[v] || v).join(", ");
    case "fuelEfficiency":
      return tyre.euLabel?.fuelEfficiency || "—";
    case "wetGrip":
      return tyre.euLabel?.wetGrip || "—";
    case "noiseDb":
      return tyre.euLabel?.noiseDb ? `${tyre.euLabel.noiseDb} дБ` : "—";
    case "technologies":
      return tyre.technologies?.join(", ") || "—";
    case "sizes":
      return tyre.sizes?.length
        ? `${tyre.sizes.length} розмір${tyre.sizes.length > 4 ? "ів" : tyre.sizes.length > 1 ? "и" : ""}`
        : "—";
    default:
      return "—";
  }
}

/**
 * Determine winner for attribute
 */
function determineWinner(
  attribute: string,
  values: { tyreSlug: string; value: string }[]
): string | null {
  // EU Label ratings - lower letter is better (A > B > C...)
  if (["fuelEfficiency", "wetGrip"].includes(attribute)) {
    const validValues = values.filter((v) => v.value !== "—");
    if (validValues.length < 2) return null;

    const sorted = [...validValues].sort((a, b) =>
      a.value.localeCompare(b.value)
    );
    // Only mark winner if there's a clear difference
    if (sorted[0].value !== sorted[1].value) {
      return sorted[0].tyreSlug;
    }
    return null;
  }

  // Noise - lower is better
  if (attribute === "noiseDb") {
    const validValues = values.filter(
      (v) => v.value !== "—" && v.value.includes("дБ")
    );
    if (validValues.length < 2) return null;

    const sorted = [...validValues].sort((a, b) => {
      const aNum = parseInt(a.value);
      const bNum = parseInt(b.value);
      return aNum - bNum;
    });
    // Only mark winner if there's a clear difference (2+ dB)
    const diff =
      parseInt(sorted[1].value) - parseInt(sorted[0].value);
    if (diff >= 2) {
      return sorted[0].tyreSlug;
    }
    return null;
  }

  // Technologies - more is better
  if (attribute === "technologies") {
    const validValues = values.filter((v) => v.value !== "—");
    if (validValues.length < 2) return null;

    const sorted = [...validValues].sort((a, b) => {
      const aCount = a.value.split(",").length;
      const bCount = b.value.split(",").length;
      return bCount - aCount;
    });
    // Only mark winner if there's a difference
    const aCount = sorted[0].value.split(",").length;
    const bCount = sorted[1].value.split(",").length;
    if (aCount > bCount) {
      return sorted[0].tyreSlug;
    }
    return null;
  }

  return null;
}

/**
 * Build comparison table
 */
function buildComparisonTable(tyres: TyreForComparison[]): ComparisonRow[] {
  return COMPARISON_ATTRIBUTES.map((attr) => {
    const values = tyres.map((tyre) => ({
      tyreSlug: tyre.slug,
      value: getAttributeValue(tyre, attr.key),
    }));

    const winnerSlug = determineWinner(attr.key, values);

    return {
      attribute: attr.label,
      attributeKey: attr.key,
      values: values.map((v) => ({
        ...v,
        isWinner: winnerSlug === v.tyreSlug,
      })),
    };
  });
}

/**
 * Generate verdict prompt
 */
function generateVerdictPrompt(
  tyres: TyreForComparison[],
  table: ComparisonRow[]
): string {
  const tyreNames = tyres
    .map((t) => `Bridgestone ${t.name}`)
    .join(" vs ");

  const tableText = table
    .map((row) => {
      const values = row.values
        .map(
          (v) =>
            `${tyres.find((t) => t.slug === v.tyreSlug)?.name}: ${v.value}${v.isWinner ? " (краще)" : ""}`
        )
        .join(", ");
      return `- ${row.attribute}: ${values}`;
    })
    .join("\n");

  return `Напиши короткий висновок (2-3 абзаци) порівняння шин: ${tyreNames}

ДАНІ ПОРІВНЯННЯ:
${tableText}

ВИМОГИ:
- Українською мовою
- Об'єктивно, без маркетингових перебільшень
- Вкажи для кого краще підходить кожна модель
- Не вигадуй дані яких немає
- Завершуй рекомендацією для водія`;
}

/**
 * Parse verdict from LLM response
 */
function parseVerdict(response: string): string {
  // Remove any JSON formatting if present
  const cleaned = response.replace(/```[a-z]*\n?/g, "").trim();
  return cleaned;
}

/**
 * Generate comparison page
 */
export async function generateComparison(
  tyres: TyreForComparison[]
): Promise<ComparisonGenerationResult> {
  if (tyres.length < 2 || tyres.length > 3) {
    return {
      success: false,
      error: "Comparison requires 2-3 tyres",
    };
  }

  const slug = generateComparisonSlug(tyres);
  const title = tyres.map((t) => `Bridgestone ${t.name}`).join(" vs ");
  const comparisonTable = buildComparisonTable(tyres);

  // Generate verdict via LLM
  let verdict =
    "Обидві моделі є якісними шинами від Bridgestone. Вибір залежить від ваших потреб та стилю водіння.";

  if (ENV.ANTHROPIC_API_KEY) {
    try {
      const prompt = generateVerdictPrompt(tyres, comparisonTable);
      const response = await generateContent(prompt, {
        maxTokens: 800,
        temperature: 0.7,
        systemPrompt: SYSTEM_PROMPTS.tireDescription,
      });
      verdict = parseVerdict(response);
    } catch (error) {
      console.error("Failed to generate verdict:", error);
      // Use default verdict
    }
  }

  // Generate SEO
  const tyreNames = tyres.map((t) => t.name).join(" vs ");
  const seoTitle = `${tyreNames} - Порівняння шин Bridgestone | Bridgestone Україна`;
  const seoDescription = `Детальне порівняння ${tyreNames}. EU-маркування, технології, характеристики. Який варіант обрати для вашого автомобіля?`;

  const comparison: ComparisonPage = {
    slug,
    title,
    tyres,
    comparisonTable,
    verdict,
    seoTitle,
    seoDescription,
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    comparison,
  };
}

/**
 * Generate Schema.org structured data for comparison
 */
export function generateComparisonSchema(comparison: ComparisonPage): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: comparison.title,
    description: comparison.seoDescription,
    datePublished: comparison.createdAt,
    author: {
      "@type": "Organization",
      name: "Bridgestone Україна",
    },
    about: comparison.tyres.map((tyre) => ({
      "@type": "Product",
      name: `Bridgestone ${tyre.name}`,
      brand: {
        "@type": "Brand",
        name: "Bridgestone",
      },
      category: "Автомобільні шини",
    })),
  };
}

// Test
async function main() {
  console.log("Testing Comparison Generator...\n");

  const testTyres: TyreForComparison[] = [
    {
      name: "Turanza 6",
      slug: "turanza-6",
      season: "summer",
      vehicleTypes: ["passenger", "suv"],
      euLabel: { fuelEfficiency: "A", wetGrip: "A", noiseDb: 70 },
      technologies: ["ENLITEN", "B-Silent"],
      sizes: ["205/55R16", "225/45R17", "225/40R18"],
    },
    {
      name: "Potenza Sport",
      slug: "potenza-sport",
      season: "summer",
      vehicleTypes: ["passenger", "sport"],
      euLabel: { fuelEfficiency: "B", wetGrip: "A", noiseDb: 72 },
      technologies: ["POTENZA"],
      sizes: ["225/40R18", "235/35R19", "245/35R20"],
    },
  ];

  console.log(`Comparing: ${testTyres.map((t) => t.name).join(" vs ")}`);

  const result = await generateComparison(testTyres);

  if (result.success && result.comparison) {
    console.log("\n✅ Comparison generated:");
    console.log(`Slug: ${result.comparison.slug}`);
    console.log(`Title: ${result.comparison.title}`);
    console.log("\nComparison Table:");
    for (const row of result.comparison.comparisonTable) {
      const values = row.values
        .map((v) => `${v.value}${v.isWinner ? "*" : ""}`)
        .join(" | ");
      console.log(`  ${row.attribute}: ${values}`);
    }
    console.log(`\nVerdict:\n${result.comparison.verdict}`);
    console.log(`\nSEO Title: ${result.comparison.seoTitle}`);
  } else {
    console.error("❌ Failed:", result.error);
  }
}

main();
