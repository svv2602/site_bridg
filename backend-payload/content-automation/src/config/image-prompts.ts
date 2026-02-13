/**
 * Shared Image Prompt Templates
 *
 * Single source of truth for image generation prompts used across:
 * - article-images.ts (content automation)
 * - imageRegeneration.ts (admin endpoint)
 * - regenerate-image.ts (CLI tool)
 *
 * Design goals:
 * - Photorealistic, natural look (not HDR/oversaturated)
 * - Diverse compositions: vehicles, tires, people, workshops, atmospheric
 * - Muted, editorial magazine aesthetic
 */

export type ImageType = 'hero' | 'content' | 'product' | 'lifestyle';

/** Article type alias to avoid importing from db module */
type HeroArticleType =
  | 'test-summary'
  | 'comparison'
  | 'seasonal-guide'
  | 'model-review'
  | 'technology'
  | 'tips';

/**
 * Composition focus — determines the main subject of the hero image.
 * Each article gets a focus based on its topic hash, ensuring variety across articles.
 */
type CompositionFocus =
  | 'vehicle-scene'
  | 'tire-closeup'
  | 'people-auto'
  | 'workshop'
  | 'atmospheric'
  | 'detail-macro';

/**
 * Negative prompt to avoid common AI image artifacts
 */
export const NEGATIVE_PROMPT = `blurry, low quality, distorted, deformed, disfigured, bad anatomy,
watermark, text, logo, signature, cropped, out of frame, worst quality, low resolution,
jpeg artifacts, pixelated, noise, grain, overexposed, underexposed, oversaturated,
cartoon, anime, illustration, 3d render, cgi, artificial looking, plastic looking,
duplicate, clone, extra limbs, missing parts, floating objects, unnatural proportions,
HDR, oversharpened, neon colors, lens flare, chromatic aberration`;

/**
 * Season context descriptions for hero images — soft, natural tones
 */
export const HERO_SEASON_CONTEXTS: Record<string, string> = {
  summer: `warm afternoon light, dry asphalt road, clear sky with gentle clouds,
green trees in soft focus background, natural warm tones, gentle shadows`,
  winter: `light snow on road shoulders, cool morning atmosphere, muted blue-grey tones,
bare trees with frost, overcast sky with soft even light, tire tracks in thin snow`,
  allseason: `changeable weather, partly cloudy sky, damp road with subtle reflections,
mild natural light, neutral colour palette, transitional season atmosphere`,
};

/**
 * Season context descriptions for lifestyle images
 */
export const LIFESTYLE_SEASON_CONTEXTS: Record<string, string> = {
  summer: `family road trip, scenic highway, pleasant sunny day,
relaxed atmosphere, natural warm tones, luggage on roof rack`,
  winter: `winter family journey, snow-dusted landscape,
confident driving in cold conditions, cozy feeling, holiday travel`,
  allseason: `everyday driving, suburban neighbourhood,
mixed weather showing adaptability, daily routine, practical life`,
};

/**
 * Image size presets per type
 */
export const IMAGE_SIZES: Record<ImageType, { width: number; height: number; aspect: string }> = {
  hero: { width: 1792, height: 1024, aspect: '16:9' },
  content: { width: 1024, height: 1024, aspect: '1:1' },
  product: { width: 1024, height: 1024, aspect: '1:1' },
  lifestyle: { width: 1024, height: 1024, aspect: '1:1' },
};

// ============ DIVERSITY SYSTEM ============

/** Simple string hash for deterministic selection */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash);
}

/** Pick an item from a pool using a hash seed */
function pickFromPool<T>(pool: T[], seed: number, offset: number = 0): T {
  return pool[(seed + offset) % pool.length];
}

// ============ COMPOSITION ELEMENTS ============

const COMPOSITION_FOCUSES: CompositionFocus[] = [
  'vehicle-scene',
  'tire-closeup',
  'people-auto',
  'workshop',
  'atmospheric',
  'detail-macro',
];

const VEHICLES = [
  'modern SUV (BMW X5 style)',
  'family sedan (Volkswagen Passat style)',
  'compact crossover (Toyota RAV4 style)',
  'estate car (Volvo V60 style)',
  'city hatchback (Volkswagen Golf style)',
  'family minivan (Volkswagen Multivan style)',
];

const CAMERA_ANGLES = [
  '3/4 front angle showing wheel and tyre',
  'low angle from near tyre level',
  'side profile with softly blurred background',
  'rear 3/4 angle with road visible ahead',
  'eye-level straight-on perspective',
];

const TIMES_OF_DAY = [
  'late afternoon with long soft shadows',
  'overcast day with even diffused light',
  'early morning with gentle mist',
  'midday with soft cloud cover',
  'blue hour with quiet twilight tones',
];

const LOCATIONS = [
  'winding mountain road with valley views',
  'coastal road with sea in background',
  'quiet city street with buildings',
  'tree-lined country road',
  'clean suburban road with houses',
  'rural highway through open fields',
];

// ============ PEOPLE & SETTING ELEMENTS ============

const PEOPLE_SCENES = [
  'a man (35-45) checking tyre pressure with a gauge, kneeling beside the car',
  'a woman (30-40) standing confidently beside her car, hand on the door, looking at the road ahead',
  'a couple loading luggage into the boot, preparing for a long drive',
  'a father with a child (8-10) walking towards their parked car in a residential area',
  'a professional mechanic (40s) in clean overalls explaining something to a customer near a lifted car',
  'a young woman (25-35) getting into her car in a parking garage, keys in hand',
];

const WORKSHOP_SCENES = [
  'modern tyre service centre, a mechanic mounting a tyre on a balancing machine, clean well-lit workshop',
  'row of new tyres neatly stacked on shelves in a tidy tyre shop, warm interior lighting',
  'mechanic using a torque wrench on wheel bolts, car on a lift, professional garage environment',
  'seasonal tyre changeover scene: winter and summer tyres laid out side by side on clean workshop floor',
  'tyre fitting bay with pneumatic tools, a freshly mounted wheel being lowered onto the hub',
  'customer reception area of a tyre centre, display rack with tyres, clean and modern interior',
];

const TIRE_CLOSEUP_SCENES = [
  'close-up of a tyre tread on wet asphalt, water droplets in the grooves, shallow depth of field',
  'macro view of tyre sidewall markings and rubber texture, soft directional light revealing detail',
  'new tyre tread pattern from above at a slight angle, crisp detail on sipes and channels',
  'tyre and alloy wheel detail on a parked car, focused on the sidewall and rim junction',
  'two different tyre treads placed side by side on a clean surface, showing pattern differences',
  'close-up of tyre contact patch on damp road, showing how tread displaces water',
];

const ATMOSPHERIC_SCENES = [
  'empty winding road disappearing into morning fog, tyre marks faintly visible on damp asphalt',
  'rain-wet highway at dusk, tail lights reflected in puddles, moody and calm atmosphere',
  'snow-dusted road through a quiet forest, single set of tyre tracks leading into the distance',
  'aerial view of a road cutting through autumn countryside, warm muted earth tones',
  'close view of road surface texture with raindrops, a car approaching in soft background blur',
  'panoramic mountain road with a single car small in the frame, vast landscape dominating',
];

const DETAIL_MACRO_SCENES = [
  'macro shot of rubber compound texture on a tyre surface, showing the fine grain and material quality',
  'water being channelled through tyre grooves during rain, captured at close range with soft background',
  'frost crystals forming on a tyre sidewall on a cold morning, delicate and detailed',
  'road surface texture meeting tyre edge, shallow depth of field, abstract automotive detail',
  'brake disc and calliper visible through alloy wheel spokes, with tyre sidewall in foreground',
  'puddle splash around a rolling tyre, frozen mid-motion, showing water displacement',
];

// ============ VEHICLE SCENE TEMPLATES (per article type) ============

const VEHICLE_SCENE_TEMPLATES: Record<HeroArticleType, string[]> = {
  'test-summary': [
    '{vehicle} cornering on a test track, {weather}, {angle}, {timeOfDay}, tyre marks on asphalt, testing equipment at trackside',
    '{vehicle} braking on a wet test surface, {weather}, {angle}, {timeOfDay}, water mist from tyres, measurement cones in background',
    '{vehicle} on a handling course, {weather}, {angle}, {timeOfDay}, orange cones visible, controlled testing environment',
    '{vehicle} driving through a slalom on a closed circuit, {weather}, {angle}, {timeOfDay}, professional test setting',
  ],
  comparison: [
    'two cars side by side on a road — {vehicle} and a different sedan — {weather}, {angle}, {timeOfDay}, editorial comparison composition',
    '{vehicle} on a road that transitions from dry to damp surface, {weather}, {angle}, {timeOfDay}, showing versatility',
    'close-up of two different tyre treads side by side on wet ground, {weather}, {timeOfDay}, detail comparison shot',
    '{vehicle} and another car parked facing each other at {location}, {weather}, {angle}, {timeOfDay}, calm comparison scene',
  ],
  'seasonal-guide': [
    '{vehicle} driving through seasonal weather on {location}, {weather}, {angle}, {timeOfDay}, weather is the main element',
    '{vehicle} with visible tyre tracks on a seasonal road, {weather}, {angle}, {timeOfDay}, {location}, atmospheric scene',
    '{vehicle} parked with seasonal equipment nearby, {weather}, {angle}, {timeOfDay}, practical preparation mood',
    'wide landscape with {vehicle} small in the frame on {location}, {weather}, {timeOfDay}, nature dominates the scene',
  ],
  'model-review': [
    '{vehicle} with shallow depth of field on tyre and wheel detail, {weather}, {angle}, {timeOfDay}, {location}, product showcase',
    'environmental portrait of {vehicle} emphasising sidewall and tread, {weather}, {angle}, {timeOfDay}, natural outdoor light',
    '{vehicle} at {location}, {weather}, {angle}, {timeOfDay}, soft rim lighting on tyre profile, understated premium feel',
    'detail shot of {vehicle} wheel and tyre with road texture, {weather}, {angle}, {timeOfDay}, close-range product photography',
  ],
  technology: [
    '{vehicle} on a modern road at {timeOfDay}, {weather}, {angle}, clean cool-toned colour palette, focus on wheels, innovation theme',
    '{vehicle} driving through {location}, {weather}, {angle}, {timeOfDay}, sleek understated engineering atmosphere',
    '{vehicle} on a damp highway with soft headlight reflections, {weather}, {angle}, {timeOfDay}, modern driving feel',
    '{vehicle} on a rain-slicked road, {weather}, {angle}, {timeOfDay}, water spray from tyres, advanced grip demonstrated',
  ],
  tips: [
    '{vehicle} in an everyday parking area, {weather}, {angle}, {timeOfDay}, driver checking tyre condition, practical scene',
    '{vehicle} parked in a driveway with tyre care tools nearby, {weather}, {angle}, {timeOfDay}, relatable maintenance scene',
    '{vehicle} at a petrol station or tyre service, {weather}, {angle}, {timeOfDay}, practical automotive care setting',
    '{vehicle} on a quiet residential street, {weather}, {angle}, {timeOfDay}, safe everyday driving context',
  ],
};

// ============ HERO PROMPT GENERATOR ============

/**
 * Generate a hero image prompt with diverse compositions.
 *
 * The system cycles through 6 composition focuses:
 *   vehicle-scene, tire-closeup, people-auto, workshop, atmospheric, detail-macro
 *
 * This ensures that across a batch of articles, hero images vary significantly
 * in subject matter — not just cars on roads.
 *
 * Overloads:
 *   generateHeroPrompt(topic)
 *   generateHeroPrompt(topic, season)
 *   generateHeroPrompt(topic, { season, articleType })
 */
export function generateHeroPrompt(
  topic: string,
  seasonOrOptions?: string | { season?: string; articleType?: string },
): string {
  const season = typeof seasonOrOptions === 'string'
    ? seasonOrOptions
    : seasonOrOptions?.season;
  const articleType = (
    typeof seasonOrOptions === 'object' ? seasonOrOptions?.articleType : undefined
  ) as HeroArticleType | undefined;

  const weather = season && HERO_SEASON_CONTEXTS[season]
    ? HERO_SEASON_CONTEXTS[season]
    : 'soft natural daylight, neutral tones';

  // Deterministic seed from topic
  const seed = hashString(topic);

  // Pick composition focus — this determines the overall type of image
  const focus = pickFromPool(COMPOSITION_FOCUSES, seed, 0);

  // Build scene based on focus
  const scene = buildScene(focus, seed, weather, articleType);

  return `Editorial automotive photography, ${topic}.

Scene: ${scene}.

Technical: Shot on a full-frame camera, 35-85mm lens range, natural depth of field.
Balanced exposure, accurate white balance, gentle post-processing.
Rule of thirds composition, widescreen framing.

Style: Authentic editorial magazine photography. Looks like a real photograph
taken by a professional photographer for an automotive publication.
Muted, natural colour palette — no oversaturation, no HDR look.
Soft tonal transitions, film-like quality, subtle colour grading.

Lighting: Natural ambient light, soft shadows, no harsh contrasts.
No lens flare, no neon, no artificial colour casts.

Requirements: Must look like a real photograph, not AI-generated.
No text, no logos, no watermarks. Clean composition, understated elegance.`;
}

/**
 * Build scene description based on composition focus
 */
function buildScene(
  focus: CompositionFocus,
  seed: number,
  weather: string,
  articleType?: HeroArticleType,
): string {
  switch (focus) {
    case 'vehicle-scene': {
      const vehicle = pickFromPool(VEHICLES, seed, 1);
      const angle = pickFromPool(CAMERA_ANGLES, seed, 2);
      const timeOfDay = pickFromPool(TIMES_OF_DAY, seed, 3);
      const location = pickFromPool(LOCATIONS, seed, 4);

      const type = articleType || 'seasonal-guide';
      const templates = VEHICLE_SCENE_TEMPLATES[type] || VEHICLE_SCENE_TEMPLATES['seasonal-guide'];
      const template = pickFromPool(templates, seed, 5);

      return template
        .replace(/\{vehicle\}/g, vehicle)
        .replace(/\{angle\}/g, angle)
        .replace(/\{timeOfDay\}/g, timeOfDay)
        .replace(/\{location\}/g, location)
        .replace(/\{weather\}/g, weather);
    }

    case 'tire-closeup': {
      const scene = pickFromPool(TIRE_CLOSEUP_SCENES, seed, 1);
      return `${scene}, ${weather}`;
    }

    case 'people-auto': {
      const scene = pickFromPool(PEOPLE_SCENES, seed, 1);
      const vehicle = pickFromPool(VEHICLES, seed, 2);
      const timeOfDay = pickFromPool(TIMES_OF_DAY, seed, 3);
      return `${scene}, near a ${vehicle}, ${timeOfDay}, ${weather}`;
    }

    case 'workshop': {
      const scene = pickFromPool(WORKSHOP_SCENES, seed, 1);
      return `${scene}, ${weather}`;
    }

    case 'atmospheric': {
      const scene = pickFromPool(ATMOSPHERIC_SCENES, seed, 1);
      return `${scene}, ${weather}`;
    }

    case 'detail-macro': {
      const scene = pickFromPool(DETAIL_MACRO_SCENES, seed, 1);
      return `${scene}, ${weather}`;
    }

    default:
      return `automotive tyre on a quiet road, ${weather}`;
  }
}

// ============ CONTENT PROMPT ============

/**
 * Generate a content image prompt — softer editorial style
 */
export function generateContentPrompt(topic: string, context?: string): string {
  const seed = hashString(topic + (context || ''));
  const focus = pickFromPool(COMPOSITION_FOCUSES, seed, 7);

  // For content images, build a mini-scene based on focus too
  let sceneHint: string;
  switch (focus) {
    case 'tire-closeup':
      sceneHint = 'Close-up detail of a tyre tread or sidewall in context.';
      break;
    case 'people-auto':
      sceneHint = 'A person naturally interacting with a vehicle — checking tyres, driving, or preparing for a trip.';
      break;
    case 'workshop':
      sceneHint = 'A tidy tyre workshop or service centre scene.';
      break;
    case 'atmospheric':
      sceneHint = 'An atmospheric road or driving scene setting the mood.';
      break;
    case 'detail-macro':
      sceneHint = 'A macro or detail shot of automotive/tyre elements.';
      break;
    default:
      sceneHint = 'A vehicle in an everyday real-world setting.';
  }

  return `Editorial photography for an automotive article about ${topic}.

Context: ${context || 'tyre and automotive safety'}.
Scene: ${sceneHint}

Composition: Clean frame with a clear focal point. Real-world setting.
Technical: Full-frame camera, 24-70mm lens, balanced exposure, natural white balance.
Style: Documentary editorial feel, authentic and relatable, muted natural colours.
Lighting: Natural daylight, soft shadows, even illumination.

Requirements: Photorealistic, like a real photograph. No text, no watermarks.
Natural colour palette, no oversaturation. Publication-ready quality.`;
}

// ============ PRODUCT PROMPT ============

/**
 * Generate a product image prompt — clean studio photography
 */
export function generateProductPrompt(topic: string): string {
  return `Product photography of ${topic} automotive tyre.

Setup: Professional studio, seamless dark grey backdrop.
Single tyre at a slight angle (15-20 degrees) showing tread and sidewall.

Lighting: Three-point setup — large softbox as key light, reflector fill,
strip softbox behind for subtle edge definition. Soft, controlled, no hot spots.

Focus: Sharp detail on tread grooves, sipes, and shoulder blocks.
Sidewall markings visible but not overly emphasised.

Technical: 100mm lens, f/8 for full depth of field. Clean, precise framing.

Style: Clean commercial product photography with understated premium feel.
Realistic representation of black rubber — true-to-life tones, not overly contrasty.

Requirements: Photorealistic studio shot, no text, no watermarks.
Accurate colour, subtle shadows, professional but not flashy.`;
}

// ============ LIFESTYLE PROMPT ============

/**
 * Generate a lifestyle image prompt — authentic documentary style
 */
export function generateLifestylePrompt(topic: string, season?: string): string {
  const scene = season && LIFESTYLE_SEASON_CONTEXTS[season]
    ? LIFESTYLE_SEASON_CONTEXTS[season]
    : 'everyday driving, relatable daily situations';

  return `Lifestyle photography capturing ${scene}.

Story: Authentic moments of everyday driving — families, couples, or individuals
in genuine situations with their vehicles. Not posed or promotional.
Tyre and vehicle reliability is implied, not highlighted.

Subjects: Relatable people (30-50 years old) in natural poses,
genuine expressions, candid documentary approach.

Vehicle: Everyday family car or crossover, lived-in but well-kept condition.

Environment: ${scene}. Real locations, natural backgrounds.

Technical: 35-50mm lens, natural depth of field, candid framing.
Balanced exposure, accurate skin tones, gentle post-processing.

Lighting: Natural available light, soft and flattering.
No artificial colour casts, no dramatic lighting effects.

Mood: Warm but restrained, positive, relatable, trustworthy.

Requirements: Must look like a real candid photograph, not AI-generated.
No text, no watermarks. Muted natural colours, editorial magazine quality.`;
}

// ============ UNIFIED ENTRY POINT ============

/**
 * Generate prompt by image type
 */
export function generatePromptByType(
  type: ImageType,
  topic: string,
  options?: { season?: string; context?: string; articleType?: string }
): string {
  switch (type) {
    case 'hero':
      return generateHeroPrompt(topic, { season: options?.season, articleType: options?.articleType });
    case 'content':
      return generateContentPrompt(topic, options?.context);
    case 'product':
      return generateProductPrompt(topic);
    case 'lifestyle':
      return generateLifestylePrompt(topic, options?.season);
    default:
      return generateContentPrompt(topic, options?.context);
  }
}
