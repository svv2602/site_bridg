import type { Endpoint } from 'payload';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

// Store for background job status
interface JobStatus {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  output?: string;
  error?: string;
  command: string;
}

const jobs: Map<string, JobStatus> = new Map();

/**
 * POST /api/content/generate
 *
 * Run content generation for tyres.
 * Query params:
 *   - model: Generate for specific model slug (optional)
 *   - scrape: Also run scraper first (optional, default false)
 */
export const contentGenerateEndpoint: Endpoint = {
  path: '/content/generate',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url || '', 'http://localhost');
    const modelSlug = url.searchParams.get('model');
    const runScrape = url.searchParams.get('scrape') === 'true';

    const projectDir = process.cwd();
    const automationDir = path.join(projectDir, 'content-automation');

    // Build command
    let command = 'npx tsx src/index.ts';
    if (runScrape) {
      command += ' --scrape';
    }
    command += ' --generate';
    if (modelSlug) {
      command += ` --model=${modelSlug}`;
    }

    // Create job
    const jobId = `gen-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
    };
    jobs.set(jobId, job);

    // Run in background
    execAsync(command, {
      cwd: automationDir,
      timeout: 600000, // 10 minutes
      env: { ...process.env },
    })
      .then(({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
        req.payload.logger.info(`Content generation completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message;
        job.output = error.stdout || '';
        req.payload.logger.error(`Content generation failed: ${error.message}`);
      });

    return Response.json({
      message: 'Content generation started',
      jobId,
      command,
      checkStatus: `/api/content/job/${jobId}`,
    });
  },
};

/**
 * GET /api/content/job/:id
 *
 * Get status of a content generation job
 */
export const contentJobStatusEndpoint: Endpoint = {
  path: '/content/job/:id',
  method: 'get',
  handler: async (req) => {
    const jobId = req.routeParams?.id as string;
    const job = jobs.get(jobId);

    if (!job) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    return Response.json(job);
  },
};

/**
 * POST /api/content/scrape
 *
 * Run scraper to collect tyre data from sources
 */
export const contentScrapeEndpoint: Endpoint = {
  path: '/content/scrape',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const automationDir = path.join(process.cwd(), 'content-automation');
    const command = 'npx tsx src/scrapers/prokoleso.ts';

    const jobId = `scrape-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
    };
    jobs.set(jobId, job);

    execAsync(command, {
      cwd: automationDir,
      timeout: 300000, // 5 minutes
    })
      .then(({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.output = stdout;
        req.payload.logger.info(`Scraping completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message;
        req.payload.logger.error(`Scraping failed: ${error.message}`);
      });

    return Response.json({
      message: 'Scraping started',
      jobId,
      checkStatus: `/api/content/job/${jobId}`,
    });
  },
};

/**
 * POST /api/content/import
 *
 * Import scraped tyres to database
 */
export const contentImportEndpoint: Endpoint = {
  path: '/content/import',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const automationDir = path.join(process.cwd(), 'content-automation');
    const command = 'npx tsx src/import-tyres.ts';

    const jobId = `import-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
    };
    jobs.set(jobId, job);

    execAsync(command, {
      cwd: automationDir,
      timeout: 300000,
    })
      .then(({ stdout }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.output = stdout;
        req.payload.logger.info(`Import completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message;
        req.payload.logger.error(`Import failed: ${error.message}`);
      });

    return Response.json({
      message: 'Import started',
      jobId,
      checkStatus: `/api/content/job/${jobId}`,
    });
  },
};

/**
 * GET /api/content/jobs
 *
 * List recent jobs
 */
export const contentJobsListEndpoint: Endpoint = {
  path: '/content/jobs',
  method: 'get',
  handler: async () => {
    const recentJobs = Array.from(jobs.values())
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 20);

    return Response.json({ jobs: recentJobs });
  },
};

/**
 * POST /api/content/regenerate/:slug
 *
 * Regenerate AI content for a specific tyre and publish to CMS
 */
export const contentRegenerateEndpoint: Endpoint = {
  path: '/content/regenerate/:slug',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slug = req.routeParams?.slug as string;
    if (!slug) {
      return Response.json({ error: 'Slug is required' }, { status: 400 });
    }

    const automationDir = path.join(process.cwd(), 'content-automation');

    // Command to regenerate specific tyre
    const command = `npx tsx src/regenerate-tyre.ts "${slug}"`;

    const jobId = `regen-${slug}-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
    };
    jobs.set(jobId, job);

    execAsync(command, {
      cwd: automationDir,
      timeout: 120000, // 2 minutes
      env: { ...process.env },
    })
      .then(({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
        req.payload.logger.info(`Content regeneration completed for ${slug}: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message;
        job.output = error.stdout || '';
        req.payload.logger.error(`Content regeneration failed for ${slug}: ${error.message}`);
      });

    return Response.json({
      message: `Regeneration started for tyre: ${slug}`,
      jobId,
      checkStatus: `/api/content/job/${jobId}`,
    });
  },
};

/**
 * POST /api/content/publish
 *
 * Publish generated content to Payload CMS
 */
export const contentPublishEndpoint: Endpoint = {
  path: '/content/publish',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const automationDir = path.join(process.cwd(), 'content-automation');
    const command = 'npx tsx src/scheduler.ts publish';

    const jobId = `publish-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
    };
    jobs.set(jobId, job);

    execAsync(command, {
      cwd: automationDir,
      timeout: 300000, // 5 minutes
      env: { ...process.env },
    })
      .then(({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
        req.payload.logger.info(`Content publish completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message;
        job.output = error.stdout || '';
        req.payload.logger.error(`Content publish failed: ${error.message}`);
      });

    return Response.json({
      message: 'Publish started',
      jobId,
      checkStatus: `/api/content/job/${jobId}`,
    });
  },
};
