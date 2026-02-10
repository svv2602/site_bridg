/**
 * Shared Image Prompt Templates
 *
 * Single source of truth for image generation prompts used across:
 * - article-images.ts (content automation)
 * - imageRegeneration.ts (admin endpoint)
 * - regenerate-image.ts (CLI tool)
 */

export type ImageType = 'hero' | 'content' | 'product' | 'lifestyle';

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

/**
 * Generate a hero image prompt
 */
export function generateHeroPrompt(topic: string, season?: string): string {
  const weather = season && HERO_SEASON_CONTEXTS[season]
    ? HERO_SEASON_CONTEXTS[season]
    : 'professional studio lighting, neutral backdrop';

  return `Award-winning automotive photography, ultra high resolution 8K, ${topic}.

Scene: ${weather}. Modern premium SUV or luxury sedan (Mercedes, BMW, Audi style)
photographed at dynamic 3/4 front angle. Vehicle positioned on scenic road with
emphasis on wheel and tire visibility.

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
  options?: { season?: string; context?: string }
): string {
  switch (type) {
    case 'hero':
      return generateHeroPrompt(topic, options?.season);
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
