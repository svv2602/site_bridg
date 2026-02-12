/**
 * Shared Image Prompt Templates
 *
 * Single source of truth for image generation prompts used across:
 * - article-images.ts (content automation)
 * - imageRegeneration.ts (admin endpoint)
 * - regenerate-image.ts (CLI tool)
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
 * Negative prompt to avoid common AI image artifacts
 */
export const NEGATIVE_PROMPT = `blurry, low quality, distorted, deformed, disfigured, bad anatomy,
watermark, text, logo, signature, cropped, out of frame, worst quality, low resolution,
jpeg artifacts, pixelated, noise, grain, overexposed, underexposed, oversaturated,
cartoon, anime, illustration, 3d render, cgi, artificial looking, plastic looking,
duplicate, clone, extra limbs, missing parts, floating objects, unnatural proportions`;

/**
 * Season context descriptions for hero images
 */
export const HERO_SEASON_CONTEXTS: Record<string, string> = {
  summer: `golden hour sunlight, warm summer day, dry clean asphalt highway,
clear blue sky with soft clouds, vibrant green landscape in background,
warm orange and gold color grading, lens flare effects`,
  winter: `fresh snow on road, winter morning atmosphere, cold blue and white tones,
frost on trees, overcast sky with soft diffused light,
breath-visible cold air, tire tracks in snow showing grip`,
  allseason: `dramatic weather transition, partly cloudy sky with sun breaking through,
wet road reflecting light, versatile conditions,
dynamic atmospheric lighting, moody cinematic feel`,
};

/**
 * Season context descriptions for lifestyle images
 */
export const LIFESTYLE_SEASON_CONTEXTS: Record<string, string> = {
  summer: `family summer road trip adventure, scenic coastal or mountain highway,
bright sunny day, happy relaxed atmosphere, adventure and freedom feeling,
warm golden tones, vacation mood, luggage on roof rack`,
  winter: `cozy winter family journey, snow-covered landscape,
safe confident driving in winter conditions, warm interior glow from vehicle,
holiday travel feeling, ski equipment visible, breath in cold air`,
  allseason: `versatile everyday driving, suburban family neighborhood,
mix of weather conditions showing adaptability, practical daily life,
school run, grocery shopping, weekend activities`,
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

// ============ HERO IMAGE DIVERSITY ============

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

const VEHICLES = [
  'modern premium SUV (BMW X5, Audi Q7 style)',
  'luxury sports sedan (Mercedes AMG, BMW M style)',
  'compact crossover (Volkswagen Tiguan, Toyota RAV4 style)',
  'elegant wagon (Volvo V60, Audi A6 Avant style)',
  'performance coupe (Porsche 911, BMW M4 style)',
  'family minivan (Volkswagen Multivan, Mercedes V-Class style)',
];

const CAMERA_ANGLES = [
  'dynamic 3/4 front angle showing wheel detail',
  'low wide-angle from tire level looking up',
  'sweeping side profile with motion blur background',
  'dramatic rear 3/4 angle with brake lights visible',
  'overhead drone perspective following the vehicle',
];

const TIMES_OF_DAY = [
  'golden hour sunset with long warm shadows',
  'blue hour twilight with city lights beginning to glow',
  'bright midday sun with crisp sharp shadows',
  'overcast soft light with even illumination',
  'early morning mist with diffused ethereal light',
];

const LOCATIONS = [
  'winding mountain pass with panoramic valley views',
  'coastal highway with ocean cliffs in background',
  'modern city boulevard with glass architecture',
  'tree-lined country road through autumn forest',
  'alpine switchback road with snow-capped peaks',
  'suburban neighborhood street with green lawns',
];

/** Scene templates per article type — 4 variants each with placeholders */
const HERO_SCENE_TEMPLATES: Record<HeroArticleType, string[]> = {
  'test-summary': [
    '{vehicle} cornering hard on professional test track, {weather}, {angle}, {timeOfDay}, tire marks on asphalt showing grip performance, timing equipment visible at trackside',
    '{vehicle} braking on wet test surface, {weather}, {angle}, {timeOfDay}, water spray from tires, measurement pylons in background, professional test environment',
    '{vehicle} on split-surface test track (dry and wet halves), {weather}, {angle}, {timeOfDay}, overhead scoreboard, professional automotive testing atmosphere',
    '{vehicle} accelerating out of a cone slalom course, {weather}, {angle}, {timeOfDay}, scattered orange cones, tire squealing dynamics captured in motion',
  ],
  comparison: [
    'Two vehicles side by side — {vehicle} on the left and a different sedan on the right — on split-lit road, {weather}, {angle}, {timeOfDay}, dramatic comparison lighting',
    '{vehicle} driving on road that transitions from dry to wet surface, {weather}, {angle}, {timeOfDay}, split-surface composition showing versatility',
    '{vehicle} and another SUV parked facing each other on {location}, {weather}, {angle}, {timeOfDay}, versus composition, editorial comparison style',
    'Close-up of two different tire treads side by side on wet asphalt, {weather}, {angle}, {timeOfDay}, water channels visible, detail-oriented comparison shot',
  ],
  'seasonal-guide': [
    '{vehicle} driving through dramatic seasonal weather on {location}, {weather}, {angle}, {timeOfDay}, weather is the hero of the composition',
    '{vehicle} with visible tire tracks on seasonal road surface, {weather}, {angle}, {timeOfDay}, {location}, atmospheric weather dominates the frame',
    '{vehicle} parked at seasonal gear changeover point, {weather}, {angle}, {timeOfDay}, seasonal equipment visible, practical preparation mood',
    'Wide landscape shot with {vehicle} small in frame on {location}, {weather}, {angle}, {timeOfDay}, epic seasonal atmosphere, nature dominates',
  ],
  'model-review': [
    '{vehicle} with shallow depth of field focused on tire and rim detail, {weather}, {angle}, {timeOfDay}, {location}, product showcase feel',
    'Close-up environmental portrait of {vehicle} emphasizing sidewall and tread, {weather}, {angle}, {timeOfDay}, studio-quality lighting in outdoor setting',
    '{vehicle} positioned at {location}, {weather}, {angle}, {timeOfDay}, dramatic rim lighting highlighting tire profile, premium brand aesthetic',
    'Detail shot of {vehicle} wheel and tire with road texture visible, {weather}, {angle}, {timeOfDay}, macro-quality environmental product photography',
  ],
  technology: [
    '{vehicle} on modern urban road at {timeOfDay}, {weather}, {angle}, futuristic teal and silver color grading, rim lighting on wheels, innovation aesthetic',
    '{vehicle} driving through {location} with high-tech HUD overlay feel, {weather}, {angle}, {timeOfDay}, sleek engineering atmosphere, dark premium tones',
    'Night shot of {vehicle} with neon reflections on wet road, {weather}, {angle}, {timeOfDay}, futuristic city background, technology-forward mood',
    '{vehicle} on rain-soaked highway with headlight reflections, {weather}, {angle}, {timeOfDay}, high-tech driving assistance feel, modern engineering showcase',
  ],
  tips: [
    '{vehicle} in everyday parking lot setting, {weather}, {angle}, {timeOfDay}, driver checking tire pressure, practical relatable scene',
    '{vehicle} parked in suburban driveway with maintenance tools nearby, {weather}, {angle}, {timeOfDay}, DIY tire care atmosphere, approachable everyday mood',
    '{vehicle} at gas station or tire service center, {weather}, {angle}, {timeOfDay}, practical automotive maintenance setting, helpful informative feel',
    '{vehicle} on residential street near school zone, {weather}, {angle}, {timeOfDay}, safe everyday driving context, family-oriented practical scene',
  ],
};

/**
 * Generate a hero image prompt with diverse compositions.
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
    : 'professional studio lighting, neutral backdrop';

  // Deterministic seed from topic
  const seed = hashString(topic);

  // Pick composition elements
  const vehicle = pickFromPool(VEHICLES, seed, 0);
  const angle = pickFromPool(CAMERA_ANGLES, seed, 1);
  const timeOfDay = pickFromPool(TIMES_OF_DAY, seed, 2);
  const location = pickFromPool(LOCATIONS, seed, 3);

  // Pick scene template
  const type = articleType || 'seasonal-guide';
  const templates = HERO_SCENE_TEMPLATES[type] || HERO_SCENE_TEMPLATES['seasonal-guide'];
  const template = pickFromPool(templates, seed, 4);

  // Fill placeholders
  const scene = template
    .replace(/\{vehicle\}/g, vehicle)
    .replace(/\{angle\}/g, angle)
    .replace(/\{timeOfDay\}/g, timeOfDay)
    .replace(/\{location\}/g, location)
    .replace(/\{weather\}/g, weather);

  return `Award-winning automotive photography, ultra high resolution 8K, ${topic}.

Scene: ${scene}.

Technical details: Shot with Sony A7R V, 85mm f/1.4 lens, shallow depth of field
with sharp focus on vehicle and tires. Professional color grading, high dynamic range.
Cinematic widescreen composition following rule of thirds.

Style: Editorial automotive magazine quality, photorealistic, hyperdetailed.
Lighting: Natural environmental lighting with professional fill, rim lighting on vehicle.
Colors: Rich, vibrant but natural color palette, professional post-processing.

Requirements: Photorealistic only, no CGI, no text, no logos, no watermarks,
clean uncluttered composition, premium luxury feel.`;
}

/**
 * Generate a content image prompt
 */
export function generateContentPrompt(topic: string, context?: string): string {
  return `Professional editorial photography for automotive blog article about ${topic}.

Context: ${context || 'tire and automotive safety theme'}.

Scene composition: Clean, well-organized frame with clear focal point.
Environmental context showing real-world automotive situations.
People interacting naturally with vehicles when appropriate.

Technical specs: High resolution photograph, 24-70mm lens perspective,
balanced exposure, professional white balance, sharp details throughout.

Style: Modern editorial magazine aesthetic, authentic documentary feel,
relatable to everyday drivers, warm and approachable mood.

Lighting: Natural daylight or professional studio setup, soft shadows,
even illumination, no harsh contrasts.

Requirements: Photorealistic, no text overlays, no watermarks,
publication-ready quality, clean background, professional composition.`;
}

/**
 * Generate a product image prompt
 */
export function generateProductPrompt(topic: string): string {
  return `Ultra high-resolution product photography of ${topic} automotive tire.

Setup: Professional product photography studio, infinity curve backdrop in
gradient dark gray to black. Single tire displayed at slight angle (15-20 degrees)
to showcase both tread pattern and sidewall branding.

Lighting: Three-point professional lighting setup:
- Key light: Large softbox 45 degrees from front
- Fill light: Reflector panel opposite key light
- Rim/accent light: Strip softbox behind for edge definition

Focus: Razor-sharp detail on tread pattern grooves, sipes, and shoulder blocks.
Visible sidewall markings and size specifications in crisp detail.

Technical: Shot with medium format camera, 100mm macro lens, f/8-f/11 for
maximum depth of field, focus stacking for complete sharpness.

Style: Clean commercial product photography, premium brand aesthetic,
suitable for e-commerce and marketing materials.

Post-processing: Professional retouching, enhanced contrast on rubber texture,
clean background, color-accurate representation of black rubber.

Requirements: Hyperrealistic, no text additions, no watermarks,
studio quality, emphasize quality and engineering precision.`;
}

/**
 * Generate a lifestyle image prompt
 */
export function generateLifestylePrompt(topic: string, season?: string): string {
  const scene = season && LIFESTYLE_SEASON_CONTEXTS[season]
    ? LIFESTYLE_SEASON_CONTEXTS[season]
    : 'everyday driving moments, relatable situations';

  return `Authentic lifestyle automotive photography capturing ${scene}.

Story: Real moments of people enjoying safe, confident driving.
Families, couples, or individuals in genuine automotive situations.
Subtle emphasis on tire/vehicle reliability without being promotional.

Subjects: Diverse, relatable people (age 30-50) in natural poses,
authentic expressions of comfort and confidence while driving.

Vehicle: Modern family SUV or crossover, clean but not showroom-perfect,
realistic everyday use condition.

Environment: ${scene}. Authentic locations, real backgrounds,
environmental context that tells a story.

Technical: Editorial style photography, 35-50mm lens,
natural depth of field, candid documentary approach.

Lighting: Natural available light, golden hour preferred,
soft flattering illumination on subjects, environmental fill.

Mood: Warm, positive, aspirational but achievable, family-oriented,
safety and reliability themes subtly conveyed.

Requirements: Photorealistic, authentic feel, no staged look,
no text, no watermarks, magazine editorial quality.`;
}

/**
 * Generate prompt by image type -- unified entry point
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
