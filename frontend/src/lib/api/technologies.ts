import { MOCK_TECHNOLOGIES, type Technology } from "@/lib/data";
import { getPayloadTechnologies, type PayloadTechnology } from "./payload";

/**
 * Transform Payload technology to frontend Technology type
 */
function transformPayloadTechnology(tech: PayloadTechnology): Technology {
  return {
    slug: tech.slug,
    name: tech.name,
    description: tech.description || "",
    tyreSlugs: [], // Will be populated from tyres with this technology
  };
}

/**
 * Returns all technologies. Tries Payload CMS first, falls back to mock data.
 */
export async function getTechnologies(): Promise<Technology[]> {
  try {
    const technologies = await getPayloadTechnologies();
    if (technologies.length > 0) {
      return technologies.map(transformPayloadTechnology);
    }
  } catch (error) {
    console.warn("Payload CMS unavailable for technologies, using mock data:", error);
  }
  return MOCK_TECHNOLOGIES;
}

/**
 * Returns a single technology by slug or null if not found.
 */
export async function getTechnologyBySlug(slug: string): Promise<Technology | null> {
  const technologies = await getTechnologies();
  return technologies.find((t) => t.slug === slug) ?? null;
}
