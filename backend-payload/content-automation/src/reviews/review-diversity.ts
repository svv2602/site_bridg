/**
 * Combinatorial diversity selector for review generation.
 *
 * Picks a unique combination of persona, writing style, seasonal opening,
 * and property accent for each review to maximize variety.
 */

import {
  AUTHOR_PERSONAS,
  WRITING_STYLES,
  REVIEW_OPENING_WINTER,
  REVIEW_OPENING_SUMMER,
  REVIEW_OPENING_ALLSEASON,
  REVIEW_ACCENTS,
  type AuthorPersona,
  type WritingStyle,
} from "./review-dictionaries.js";

export interface DiversityParams {
  persona: AuthorPersona;
  writingStyle: WritingStyle;
  openingContext: string;
  propertyAccent: string;
  accentProperty: string;
  accentPolarity: "+1" | "-1";
  gender: "male" | "female";
}

/** Property labels for prompt injection */
const PROPERTY_LABELS: Record<number, string> = {
  0: "керованість на сухому",
  1: "керованість на мокрому",
  2: "шумність",
  3: "ціна/якість",
  4: "снігова керованість",
  5: "крижана керованість",
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Select diversity parameters for a single review.
 *
 * @param season - tyre season: "summer" | "winter" | "allseason"
 * @param reviewIndex - index of current review in batch (0-based)
 * @param totalCount - total reviews being generated
 */
export function selectDiversityParams(
  season: string,
  reviewIndex: number,
  totalCount: number,
): DiversityParams {
  // Pick persona — rotate through list, then random for overflow
  const persona = reviewIndex < AUTHOR_PERSONAS.length
    ? AUTHOR_PERSONAS[reviewIndex % AUTHOR_PERSONAS.length]
    : randomFrom(AUTHOR_PERSONAS);

  // Pick writing style — rotate, avoiding repetition in small batches
  const style = reviewIndex < WRITING_STYLES.length
    ? WRITING_STYLES[reviewIndex % WRITING_STYLES.length]
    : randomFrom(WRITING_STYLES);

  // Pick season-appropriate opening
  const openings = season === "winter" ? REVIEW_OPENING_WINTER
    : season === "allseason" ? REVIEW_OPENING_ALLSEASON
    : REVIEW_OPENING_SUMMER;
  const openingContext = randomFrom(openings);

  // Pick property accent — for summer only 0-3, for winter 0-5
  const maxProperty = season === "summer" ? 3 : 5;
  const propertyIndex = reviewIndex % (maxProperty + 1);

  // Polarity: mostly positive, ~20% negative for realism
  const polarity: "+1" | "-1" = Math.random() < 0.8 ? "+1" : "-1";

  const accentPhrases = REVIEW_ACCENTS[propertyIndex]?.[polarity] || [];
  const propertyAccent = accentPhrases.length > 0
    ? randomFrom(accentPhrases)
    : "";

  return {
    persona,
    writingStyle: style,
    openingContext,
    propertyAccent,
    accentProperty: PROPERTY_LABELS[propertyIndex] || "",
    accentPolarity: polarity,
    gender: persona.gender,
  };
}
