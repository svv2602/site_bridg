import type { Endpoint } from 'payload';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Store for background job status
interface JobStatus {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  mediaId?: number;
  newMediaId?: number;
  error?: string;
}

const imageJobs: Map<string, JobStatus> = new Map();

/**
 * POST /api/media/regenerate/:id
 *
 * Regenerate image using AI and replace existing media.
 * Body:
 *   - prompt: Custom prompt (optional, uses generationPrompt from media if not provided)
 *   - type: Image type (hero, content, product, lifestyle)
 *   - season: Season for hero/lifestyle (summer, winter, allseason)
 *   - size: Image size (1024x1024, 1792x1024, 1024x1792)
 *   - topic: Topic for default prompt generation
 */
export const regenerateImageEndpoint: Endpoint = {
  path: '/image-regeneration/:id',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mediaId = parseInt((req.routeParams?.id as string) || '0', 10);
    if (!mediaId) {
      return Response.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Get existing media
    const existingMedia = await req.payload.findByID({
      collection: 'media',
      id: mediaId,
    });

    if (!existingMedia) {
      return Response.json({ error: 'Media not found' }, { status: 404 });
    }

    // Parse request body
    let body: {
      prompt?: string;
      type?: string;
      season?: string;
      size?: string;
      topic?: string;
    } = {};

    try {
      body = await req.json?.() || {};
    } catch {
      // No body or invalid JSON
    }

    const prompt = body.prompt || (existingMedia.generationPrompt as string);
    const type = body.type || (existingMedia.generationType as string) || 'content';
    const season = body.season || (existingMedia.generationSeason as string);
    const size = body.size || (existingMedia.generationSize as string) || '1024x1024';
    const topic = body.topic || 'automotive tires';

    if (!prompt) {
      return Response.json({
        error: 'Prompt is required. Either provide prompt in body or save generationPrompt in media first.'
      }, { status: 400 });
    }

    // Create job
    const jobId = `img-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      mediaId,
    };
    imageJobs.set(jobId, job);

    req.payload.logger.info(`Starting image regeneration: ${jobId} for media ${mediaId}`);

    // Build command for regenerate-image.ts
    const projectDir = process.cwd();
    const automationDir = path.join(projectDir, 'content-automation');

    // Escape prompt for shell
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, ' ');

    let command = `npx tsx src/regenerate-image.ts --id=${mediaId} --prompt="${escapedPrompt}"`;
    if (type) command += ` --type=${type}`;
    if (season) command += ` --season=${season}`;
    if (size) command += ` --size=${size}`;

    // Run in background
    execAsync(command, {
      cwd: automationDir,
      timeout: 300000, // 5 minutes
      env: { ...process.env },
    })
      .then(async ({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();

        // Try to extract new media ID from output
        const newIdMatch = stdout.match(/Uploaded new media ID: (\d+)/);
        if (newIdMatch) {
          job.newMediaId = parseInt(newIdMatch[1], 10);
        }

        // Update media with generation metadata
        try {
          const updateId = job.newMediaId || mediaId;
          await req.payload.update({
            collection: 'media',
            id: updateId,
            data: {
              generationPrompt: prompt,
              generationType: type as 'hero' | 'content' | 'product' | 'lifestyle',
              generationSeason: (season || null) as 'summer' | 'winter' | 'allseason' | null,
              generationSize: size as '1024x1024' | '1792x1024' | '1024x1792',
            },
          });
        } catch (err) {
          req.payload.logger.error(`Failed to update generation metadata: ${err}`);
        }

        req.payload.logger.info(`Image regeneration completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message || String(error);
        req.payload.logger.error(`Image regeneration failed: ${jobId} - ${job.error}`);
      });

    return Response.json({
      message: 'Image regeneration started',
      jobId,
      checkStatus: `/api/media/regenerate-status/${jobId}`,
    });
  },
};

/**
 * GET /api/media/regenerate/status/:jobId
 *
 * Get status of image regeneration job.
 */
export const regenerateImageStatusEndpoint: Endpoint = {
  path: '/image-regeneration/status/:jobId',
  method: 'get',
  handler: async (req) => {
    const jobId = req.routeParams?.jobId as string;
    if (!jobId) {
      return Response.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const job = imageJobs.get(jobId);
    if (!job) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    return Response.json(job);
  },
};

/**
 * GET /api/media/regenerate/prompt
 *
 * Generate default prompt based on type, season, and topic.
 * Query params:
 *   - type: Image type (hero, content, product, lifestyle)
 *   - season: Season (summer, winter, allseason)
 *   - topic: Topic for the prompt
 */
export const generatePromptEndpoint: Endpoint = {
  path: '/image-regeneration/prompt',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const type = url.searchParams.get('type') || 'content';
    const season = url.searchParams.get('season') || undefined;
    const topic = url.searchParams.get('topic') || 'automotive tires';

    const prompt = generateDefaultPrompt(type, topic, season);

    return Response.json({ prompt, type, season, topic });
  },
};

/**
 * Generate default prompt based on type and season
 */
function generateDefaultPrompt(type: string, topic: string, season?: string): string {
  const seasonContexts: Record<string, Record<string, string>> = {
    hero: {
      summer: `golden hour sunlight, warm summer day, dry clean asphalt highway,
clear blue sky with soft clouds, vibrant green landscape in background,
warm orange and gold color grading, lens flare effects`,
      winter: `fresh snow on road, winter morning atmosphere, cold blue and white tones,
frost on trees, overcast sky with soft diffused light,
breath-visible cold air, tire tracks in snow showing grip`,
      allseason: `dramatic weather transition, partly cloudy sky with sun breaking through,
wet road reflecting light, versatile conditions,
dynamic atmospheric lighting, moody cinematic feel`,
    },
    lifestyle: {
      summer: `family summer road trip adventure, scenic coastal or mountain highway,
bright sunny day, happy relaxed atmosphere, adventure and freedom feeling,
warm golden tones, vacation mood, luggage on roof rack`,
      winter: `cozy winter family journey, snow-covered landscape,
safe confident driving in winter conditions, warm interior glow from vehicle,
holiday travel feeling, ski equipment visible, breath in cold air`,
      allseason: `versatile everyday driving, suburban family neighborhood,
mix of weather conditions showing adaptability, practical daily life,
school run, grocery shopping, weekend activities`,
    },
  };

  const prompts: Record<string, (t: string, s?: string) => string> = {
    hero: (t, s) => {
      const weather = s && seasonContexts.hero[s]
        ? seasonContexts.hero[s]
        : 'professional studio lighting, neutral backdrop';

      return `Award-winning automotive photography, ultra high resolution 8K, ${t}.

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
    },

    content: (t) => `Professional editorial photography for automotive blog article about ${t}.

Context: tire and automotive safety theme.

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
publication-ready quality, clean background, professional composition.`,

    product: (t) => `Ultra high-resolution product photography of ${t} automotive tire.

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
studio quality, emphasize quality and engineering precision.`,

    lifestyle: (t, s) => {
      const scene = s && seasonContexts.lifestyle[s]
        ? seasonContexts.lifestyle[s]
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
    },
  };

  const promptFn = prompts[type] || prompts.content;
  return promptFn(topic, season);
}
