import { type Technology } from "@/lib/data";
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
 * Повертає всі технології з Payload CMS.
 * При помилці повертає порожній масив — компоненти повинні обробити цей стан.
 */
export async function getTechnologies(): Promise<Technology[]> {
  try {
    const technologies = await getPayloadTechnologies();
    return technologies.map(transformPayloadTechnology);
  } catch (error) {
    console.error("Помилка завантаження технологій з CMS:", error);
    return [];
  }
}

/**
 * Returns a single technology by slug or null if not found.
 */
export async function getTechnologyBySlug(slug: string): Promise<Technology | null> {
  const technologies = await getTechnologies();
  return technologies.find((t) => t.slug === slug) ?? null;
}
