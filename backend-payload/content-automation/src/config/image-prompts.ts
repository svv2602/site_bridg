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
 * - Variety on regeneration via entropy seed
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
 * Negative prompt for providers that support it (Replicate/Flux).
 * DALL-E 3 ignores this parameter — key avoidance instructions are
 * embedded directly into prompt text via INLINE_AVOID.
 */
export const NEGATIVE_PROMPT = `blurry, low quality, distorted, deformed, disfigured, bad anatomy,
watermark, text, logo, signature, cropped, out of frame, worst quality, low resolution,
jpeg artifacts, pixelated, noise, overexposed, underexposed, oversaturated,
cartoon, anime, illustration, 3d render, cgi, artificial looking, plastic looking,
duplicate, clone, extra limbs, missing parts, floating objects, unnatural proportions,
HDR, oversharpened, neon colors, lens flare, chromatic aberration, vibrant colors, 8k ultra detailed`;

/**
 * Compact avoidance block embedded directly into prompt text.
 * Works with DALL-E 3 which ignores the negativePrompt parameter.
 */
const INLINE_AVOID = `AVOID: text, watermarks, logos, neon colors, HDR, oversaturation, plastic texture, illustration style, 3D render.`;

/**
 * Season context descriptions for hero images — soft, natural tones
 */
export const HERO_SEASON_CONTEXTS: Record<string, string> = {
  summer: `warm afternoon light, dry asphalt, clear sky with gentle clouds, green foliage in soft focus, warm tones`,
  winter: `light snow on road shoulders, cool morning, muted blue-grey tones, bare frosted trees, soft even light`,
  allseason: `changeable weather, partly cloudy, damp road with subtle reflections, neutral palette, transitional season`,
};

/**
 * Season color mood — explicit color temperature guidance
 */
const SEASON_COLOR_MOODS: Record<string, string> = {
  summer: 'Warm color temperature (5500-6500K), golden undertones, high key lighting',
  winter: 'Cool color temperature (7000-8000K), blue-silver undertones, low key lighting',
  allseason: 'Neutral color temperature (5000-5500K), balanced tones, medium key lighting',
};

/**
 * Season context descriptions for lifestyle images
 */
export const LIFESTYLE_SEASON_CONTEXTS: Record<string, string> = {
  summer: `family road trip, scenic highway, pleasant sunny day, relaxed atmosphere, warm tones`,
  winter: `winter family journey, snow-dusted landscape, confident cold-weather driving, cozy feeling`,
  allseason: `everyday driving, suburban neighbourhood, mixed weather, daily routine`,
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

/**
 * String hash with optional entropy for variety on regeneration.
 * Without entropy: deterministic (same topic → same selections across a batch).
 * With entropy: different results each time (for manual regeneration).
 */
function hashString(str: string, entropy: number = 0): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash + entropy);
}

/** Pick an item from a pool using a hash seed */
function pickFromPool<T>(pool: T[], seed: number, offset: number = 0): T {
  return pool[(seed + offset) % pool.length];
}

// ============ TIRE LINE AWARENESS ============

/**
 * Bridgestone tire line hints — adds context-aware mood and setting
 * when the topic mentions a specific product line.
 */
const TIRE_LINE_HINTS: Record<string, { mood: string; setting: string }> = {
  turanza: {
    mood: 'premium comfort, refined quiet ride, luxury touring',
    setting: 'smooth highway, elegant urban boulevard, long-distance travel',
  },
  blizzak: {
    mood: 'winter confidence, ice and snow mastery, safety in harsh conditions',
    setting: 'snow-covered mountain pass, icy morning road, frost-coated landscape',
  },
  potenza: {
    mood: 'sport performance, dynamic handling, high-speed precision',
    setting: 'winding mountain road, racing circuit, aggressive cornering',
  },
  dueler: {
    mood: 'SUV adventure, off-road capability, rugged reliability',
    setting: 'unpaved trail, forest path, scenic mountain viewpoint',
  },
  ecopia: {
    mood: 'eco-friendly efficiency, low rolling resistance, green driving',
    setting: 'quiet suburban street, city commute, tree-lined avenue',
  },
  duravis: {
    mood: 'commercial durability, heavy-load endurance, fleet reliability',
    setting: 'urban delivery route, warehouse district, industrial road',
  },
  alenza: {
    mood: 'premium SUV luxury, refined on-road comfort, all-terrain elegance',
    setting: 'scenic coastal road, upscale suburban area, premium resort driveway',
  },
  weather: {
    mood: 'all-weather adaptability, year-round confidence, versatile grip',
    setting: 'road transitioning from wet to dry, mixed conditions, changeable sky',
  },
};

/** Extract tire line hint from topic if mentioned */
function getTireLineHint(topic: string): { mood: string; setting: string } | null {
  const lowerTopic = topic.toLowerCase();
  for (const [line, hint] of Object.entries(TIRE_LINE_HINTS)) {
    if (lowerTopic.includes(line)) {
      return hint;
    }
  }
  return null;
}

// ============ PHOTOGRAPHY STYLE PRESETS ============

/**
 * Compact photography style presets.
 * Each preset simulates a different "photographer's eye".
 */
interface PhotographyStyle {
  name: string;
  prompt: string;
}

const PHOTOGRAPHY_STYLES: PhotographyStyle[] = [
  {
    name: 'kodak-portra-400',
    prompt: 'Canon EOS R5, 85mm f/1.8, f/2.8, ISO 400. Kodak Portra 400 colors — warm skin tones, desaturated, soft pastels. Subtle film grain, matte finish.',
  },
  {
    name: 'fuji-pro-400h',
    prompt: 'Nikon Z8, 35mm f/1.4, f/4, ISO 200. Fuji Pro 400H colors — cool-neutral, clean highlights, green-shifted shadows. Fine grain, soft transitions.',
  },
  {
    name: 'kodak-ektar-100',
    prompt: 'Sony A7IV, 24-70mm f/2.8, f/5.6, ISO 100. Kodak Ektar 100 colors — rich but natural, warm midtones, deep blacks. Ultra-fine grain, sharp.',
  },
  {
    name: 'digital-documentary',
    prompt: 'Canon EOS R6, 50mm f/1.2, f/2.8, ISO 800, natural light only. Documentary grading — no color casts, accurate colors. No filters, low saturation.',
  },
  {
    name: 'cinematic-natural',
    prompt: 'Sony A7III, 85mm f/1.4, f/2, ISO 400. Cinematic grading — teal shadows, warm highlights, restrained palette. Matte, subtle vignette.',
  },
  {
    name: 'leica-reportage',
    prompt: 'Leica Q3, 28mm f/1.7, f/4, ISO 320, wide perspective. Classic Leica rendering — desaturated, honest tones. Subtle grain, documentary feel.',
  },
  {
    name: 'hasselblad-medium-format',
    prompt: 'Hasselblad X2D, 80mm f/1.9, f/4, ISO 100. Medium format look — exceptional detail, creamy bokeh, natural colors. Smooth tonal rolloff.',
  },
  {
    name: 'fuji-x-pro',
    prompt: 'Fujifilm X-Pro3, 56mm f/1.2, f/2, ISO 400. Classic Chrome simulation — muted colors, strong highlights, subdued shadows. Rangefinder aesthetic.',
  },
];

/** Pick a photography style based on seed */
function pickPhotographyStyle(seed: number, offset: number = 10): PhotographyStyle {
  return pickFromPool(PHOTOGRAPHY_STYLES, seed, offset);
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
  'compact crossover (Hyundai Tucson style)',
  'family SUV (Kia Sportage style)',
  'practical liftback (Skoda Octavia style)',
  'rugged pickup truck (Toyota Hilux style)',
  'sporty sedan (BMW 3 Series style)',
  'premium SUV (Mercedes GLC style)',
];

const CAMERA_ANGLES = [
  '3/4 front angle showing wheel and tyre',
  'low angle from near tyre level',
  'side profile with softly blurred background',
  'rear 3/4 angle with road visible ahead',
  'eye-level straight-on perspective',
  'high angle looking down at front wheel area',
  'dynamic tracking shot with slight motion blur in background',
];

const TIMES_OF_DAY = [
  'late afternoon with long soft shadows',
  'overcast day with even diffused light',
  'early morning with gentle mist',
  'midday with soft cloud cover',
  'blue hour with quiet twilight tones',
  'golden hour with warm directional light',
];

const LOCATIONS = [
  'winding mountain road with valley views',
  'coastal road with sea in background',
  'quiet city street with buildings',
  'tree-lined country road',
  'clean suburban road with houses',
  'rural highway through open fields',
  'Ukrainian countryside road through sunflower fields',
  'modern Kyiv boulevard with chestnut trees',
  'Carpathian mountain road with pine forests',
  'Black Sea coastal highway near Odesa',
  'scenic road through autumn birch forest',
  'alpine pass road with panoramic views',
];

// ============ PEOPLE & SETTING ELEMENTS ============

const PEOPLE_SCENES = [
  'a man (35-45) checking tyre pressure with a gauge, kneeling beside the car',
  'a woman (30-40) standing confidently beside her car, hand on the door, looking at the road ahead',
  'a couple loading luggage into the boot, preparing for a long drive',
  'a father with a child (8-10) walking towards their parked car in a residential area',
  'a professional mechanic (40s) in clean overalls explaining something to a customer near a lifted car',
  'a young woman (25-35) getting into her car in a parking garage, keys in hand',
  'a man (30-40) inspecting tyre tread depth with a coin, crouched by the front wheel',
  'a mother securing a child seat in the back, car parked in a suburban driveway',
  'a young couple arriving at a scenic overlook, stepping out of their crossover',
  'an experienced driver (50s) wiping headlights before a winter journey, practical preparation',
];

const WORKSHOP_SCENES = [
  'modern tyre service centre, a mechanic mounting a tyre on a balancing machine, clean well-lit workshop',
  'row of new tyres neatly stacked on shelves in a tidy tyre shop, warm interior lighting',
  'mechanic using a torque wrench on wheel bolts, car on a lift, professional garage environment',
  'seasonal tyre changeover scene: winter and summer tyres laid out side by side on clean workshop floor',
  'tyre fitting bay with pneumatic tools, a freshly mounted wheel being lowered onto the hub',
  'customer reception area of a tyre centre, display rack with tyres, clean and modern interior',
  'mechanic performing wheel alignment with laser equipment, technical precision',
  'tyre storage rack in a seasonal depot, labelled sets waiting for changeover',
];

const TIRE_CLOSEUP_SCENES = [
  'close-up of a tyre tread on wet asphalt, water droplets in the grooves, shallow depth of field',
  'macro view of tyre sidewall markings and rubber texture, soft directional light revealing detail',
  'new tyre tread pattern from above at a slight angle, crisp detail on sipes and channels',
  'tyre and alloy wheel detail on a parked car, focused on the sidewall and rim junction',
  'two different tyre treads placed side by side on a clean surface, showing pattern differences',
  'close-up of tyre contact patch on damp road, showing how tread displaces water',
  'rubber compound texture in warm raking light, showing material quality and engineering',
  'winter tyre sipes opening under load on icy surface, close-range technical detail',
];

const ATMOSPHERIC_SCENES = [
  'empty winding road disappearing into morning fog, tyre marks faintly visible on damp asphalt',
  'rain-wet highway at dusk, tail lights reflected in puddles, moody and calm atmosphere',
  'snow-dusted road through a quiet forest, single set of tyre tracks leading into the distance',
  'aerial view of a road cutting through autumn countryside, warm muted earth tones',
  'close view of road surface texture with raindrops, a car approaching in soft background blur',
  'panoramic mountain road with a single car small in the frame, vast landscape dominating',
  'Carpathian mountain road with low clouds, a car emerging through mist, epic scale',
  'sunflower fields lining a straight Ukrainian road, a car disappearing into the distance',
];

const DETAIL_MACRO_SCENES = [
  'macro shot of rubber compound texture on a tyre surface, showing the fine grain and material quality',
  'water being channelled through tyre grooves during rain, captured at close range with soft background',
  'frost crystals forming on a tyre sidewall on a cold morning, delicate and detailed',
  'road surface texture meeting tyre edge, shallow depth of field, abstract automotive detail',
  'brake disc and calliper visible through alloy wheel spokes, with tyre sidewall in foreground',
  'puddle splash around a rolling tyre, frozen mid-motion, showing water displacement',
  'tyre valve cap and sidewall detail in warm directional light, minimalist composition',
  'fresh tyre marks on wet asphalt seen from above, geometric tread pattern imprint',
];

// ============ LIFESTYLE SCENES ============

const LIFESTYLE_SCENES = [
  'young family loading stroller and bags into SUV trunk for a weekend getaway',
  'woman checking her phone for directions, leaning on car door in a scenic area',
  'man washing his car on a Saturday morning in suburban driveway',
  'couple arriving at a trailhead, hiking boots visible, car parked at a forest edge',
  'parent picking up child from school, warm greeting near the car',
  'friends loading camping gear into a crossover, morning departure excitement',
  'a driver refuelling at a modern petrol station, relaxed long-distance journey',
  'couple admiring a mountain view from beside their parked car, travel mood',
];

// ============ PRODUCT SETUP VARIETY ============

const PRODUCT_SETUPS = [
  {
    backdrop: 'seamless dark grey backdrop',
    pose: 'single tyre at 15-20° angle showing tread and sidewall',
    lighting: 'three-point setup — large softbox key, reflector fill, strip softbox rim',
  },
  {
    backdrop: 'gradient white-to-light-grey backdrop',
    pose: 'tyre standing upright, front-facing tread view with slight tilt',
    lighting: 'large overhead softbox, two side reflectors for even fill',
  },
  {
    backdrop: 'dark matte surface with subtle reflection',
    pose: 'tyre laid at 45° showing tread pattern and shoulder blocks',
    lighting: 'single large window light from left, dark flag on right for contrast',
  },
  {
    backdrop: 'industrial concrete backdrop with subtle texture',
    pose: 'tyre mounted on stylish alloy wheel, 3/4 front view',
    lighting: 'beauty dish key light slightly above, strip softbox edge accent',
  },
  {
    backdrop: 'clean black sweep with controlled spill',
    pose: 'tyre at dramatic low angle, emphasising sidewall and tread depth',
    lighting: 'backlit rim light for edge definition, soft frontal fill',
  },
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
 * Overloads:
 *   generateHeroPrompt(topic)
 *   generateHeroPrompt(topic, season)
 *   generateHeroPrompt(topic, { season, articleType, entropy })
 */
export function generateHeroPrompt(
  topic: string,
  seasonOrOptions?: string | { season?: string; articleType?: string; entropy?: number },
): string {
  const season = typeof seasonOrOptions === 'string'
    ? seasonOrOptions
    : seasonOrOptions?.season;
  const articleType = (
    typeof seasonOrOptions === 'object' ? seasonOrOptions?.articleType : undefined
  ) as HeroArticleType | undefined;
  const entropy = typeof seasonOrOptions === 'object' ? seasonOrOptions?.entropy ?? 0 : 0;

  const weather = season && HERO_SEASON_CONTEXTS[season]
    ? HERO_SEASON_CONTEXTS[season]
    : 'soft natural daylight, neutral tones';

  const colorMood = season && SEASON_COLOR_MOODS[season]
    ? SEASON_COLOR_MOODS[season]
    : 'Neutral color temperature, balanced tones';

  const seed = hashString(topic, entropy);

  const focus = pickFromPool(COMPOSITION_FOCUSES, seed, 0);
  const style = pickPhotographyStyle(seed, 10);
  const scene = buildScene(focus, seed, weather, articleType);
  const tireHint = getTireLineHint(topic);

  let prompt = `Editorial automotive photography, ${topic}.

Scene: ${scene}.${tireHint ? `\nMood: ${tireHint.mood}.` : ''}

${style.prompt}
${colorMood}. Rule of thirds, widescreen framing.

Real editorial magazine photograph by a professional automotive photographer.
Natural ambient light, soft shadows, film-like tonal transitions.
${INLINE_AVOID}`;

  return prompt;
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
export function generateContentPrompt(
  topic: string,
  context?: string,
  options?: { entropy?: number },
): string {
  const entropy = options?.entropy ?? 0;
  const seed = hashString(topic + (context || ''), entropy);
  const focus = pickFromPool(COMPOSITION_FOCUSES, seed, 7);

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

  const style = pickPhotographyStyle(seed, 11);
  const tireHint = getTireLineHint(topic);

  return `Editorial photography for an automotive article about ${topic}.

Context: ${context || 'tyre and automotive safety'}.
Scene: ${sceneHint}${tireHint ? ` Setting: ${tireHint.setting}.` : ''}

${style.prompt}
Documentary editorial feel, authentic and relatable.
Natural daylight, soft shadows, even illumination.
${INLINE_AVOID}`;
}

// ============ PRODUCT PROMPT ============

/**
 * Generate a product image prompt — clean studio photography with varied setups
 */
export function generateProductPrompt(
  topic: string,
  options?: { entropy?: number },
): string {
  const entropy = options?.entropy ?? 0;
  const seed = hashString(topic, entropy);

  const PRODUCT_STYLES = [
    'Canon EOS R5, 100mm f/2.8 macro, f/8, ISO 100. True-to-life colors, neutral tones.',
    'Nikon Z8, 105mm f/2.8, f/11, ISO 64. Accurate rendition, clean neutral palette.',
    'Sony A7RV, 90mm f/2.8 macro, f/8, ISO 100. Natural color science, matte finish.',
    'Hasselblad X2D, 120mm f/3.5 macro, f/8, ISO 64. Medium format detail, creamy tones.',
  ];
  const techStyle = pickFromPool(PRODUCT_STYLES, seed, 10);
  const setup = pickFromPool(PRODUCT_SETUPS, seed, 3);
  const tireHint = getTireLineHint(topic);

  return `Product photography of ${topic} automotive tyre.${tireHint ? ` ${tireHint.mood}.` : ''}

Setup: Professional studio, ${setup.backdrop}. ${setup.pose}.
Lighting: ${setup.lighting}. Soft, controlled, no hot spots.
Focus: Sharp detail on tread grooves, sipes, and shoulder blocks.

${techStyle}
Clean commercial product photography, understated premium feel.
Realistic black rubber — true-to-life tones, low contrast, matte.
${INLINE_AVOID}`;
}

// ============ LIFESTYLE PROMPT ============

/**
 * Generate a lifestyle image prompt — authentic documentary style
 */
export function generateLifestylePrompt(
  topic: string,
  season?: string,
  options?: { entropy?: number },
): string {
  const seasonContext = season && LIFESTYLE_SEASON_CONTEXTS[season]
    ? LIFESTYLE_SEASON_CONTEXTS[season]
    : 'everyday driving, relatable daily situations';

  const colorMood = season && SEASON_COLOR_MOODS[season]
    ? SEASON_COLOR_MOODS[season]
    : 'Neutral color temperature, balanced tones';

  const entropy = options?.entropy ?? 0;
  const seed = hashString(topic + (season || ''), entropy);
  const style = pickPhotographyStyle(seed, 12);
  const lifestyleScene = pickFromPool(LIFESTYLE_SCENES, seed, 5);

  return `Lifestyle photography: ${lifestyleScene}. ${seasonContext}.

Authentic candid moment, not posed or promotional.
People (30-50 years old) in natural poses, genuine expressions.
Everyday family car or crossover, well-kept condition.

${style.prompt}
${colorMood}. Natural available light, soft and flattering.
Warm but restrained mood, positive, relatable.
${INLINE_AVOID}`;
}

// ============ UNIFIED ENTRY POINT ============

/**
 * Generate prompt by image type.
 *
 * Pass `entropy` in options to get variety on regeneration.
 * When entropy is 0 (default), results are deterministic per topic.
 * Use `entropy: Date.now() % 100000` for fresh results each time.
 */
export function generatePromptByType(
  type: ImageType,
  topic: string,
  options?: { season?: string; context?: string; articleType?: string; entropy?: number }
): string {
  const entropy = options?.entropy;
  switch (type) {
    case 'hero':
      return generateHeroPrompt(topic, { season: options?.season, articleType: options?.articleType, entropy });
    case 'content':
      return generateContentPrompt(topic, options?.context, { entropy });
    case 'product':
      return generateProductPrompt(topic, { entropy });
    case 'lifestyle':
      return generateLifestylePrompt(topic, options?.season, { entropy });
    default:
      return generateContentPrompt(topic, options?.context, { entropy });
  }
}
