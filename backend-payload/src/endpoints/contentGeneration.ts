import type { Endpoint } from 'payload';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { saveJob, updateJob, getJob, getRecentJobs, findActiveByTarget, countActiveJobs, type JobStatus } from './jobStore';
import { tryAcquireLock, releaseLock, LOCK_IDS } from '../lib/distributed-lock';
import { auditLog } from '../lib/audit-log';
import { createRateLimiter, checkRateLimit } from '../lib/rate-limiter';
import { requireRoleForEndpoint } from '../lib/rbac';

const execAsync = promisify(exec);

/**
 * Rate limiter for AI generation endpoints.
 * 10 requests per IP per hour to prevent abuse of expensive AI calls.
 */
const automationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
});

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

    // RBAC: automation endpoints require admin role
    const forbidden = requireRoleForEndpoint(req.user, 'admin');
    if (forbidden) return forbidden;

    // Rate limiting: 10 requests per IP per hour
    const rateLimited = checkRateLimit(automationRateLimiter, req);
    if (rateLimited) return rateLimited;

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
    saveJob(job);

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
        updateJob(job);
        req.payload.logger.info(`Content generation completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message;
        job.output = error.stdout || '';
        updateJob(job);
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
    const job = getJob(jobId);

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

    // RBAC: automation endpoints require admin role
    const forbidden = requireRoleForEndpoint(req.user, 'admin');
    if (forbidden) return forbidden;

    const url = new URL(req.url || '', 'http://localhost');
    const force = url.searchParams.get('force') === 'true';

    const automationDir = path.join(process.cwd(), 'content-automation');
    const command = `npx tsx src/scrapers/prokoleso.ts${force ? ' --force' : ''}`;

    const jobId = `scrape-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
    };
    saveJob(job);

    execAsync(command, {
      cwd: automationDir,
      timeout: 300000, // 5 minutes
    })
      .then(({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.output = stdout;
        updateJob(job);
        req.payload.logger.info(`Scraping completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message;
        updateJob(job);
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

    // RBAC: automation endpoints require admin role
    const forbidden = requireRoleForEndpoint(req.user, 'admin');
    if (forbidden) return forbidden;

    const automationDir = path.join(process.cwd(), 'content-automation');
    const command = 'npx tsx src/import-tyres.ts';

    const jobId = `import-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
    };
    saveJob(job);

    execAsync(command, {
      cwd: automationDir,
      timeout: 300000,
    })
      .then(({ stdout }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.output = stdout;
        updateJob(job);
        req.payload.logger.info(`Import completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message;
        updateJob(job);
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
 * POST /api/content/pipeline
 *
 * Run full pipeline: scrape → import → generate
 * Query params:
 *   - force: Pass --force to scraper (optional, default false)
 */
export const contentFullPipelineEndpoint: Endpoint = {
  path: '/content/pipeline',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: automation endpoints require admin role
    const forbidden = requireRoleForEndpoint(req.user, 'admin');
    if (forbidden) return forbidden;

    // Rate limiting: 10 requests per IP per hour
    const rateLimited = checkRateLimit(automationRateLimiter, req);
    if (rateLimited) return rateLimited;

    // Distributed lock: prevent concurrent pipeline runs
    const lock = await tryAcquireLock(req.payload, LOCK_IDS.PIPELINE);
    if (!lock.acquired) {
      return Response.json(
        { error: 'Pipeline is already running. Please wait for it to complete.' },
        { status: 409 },
      );
    }

    const url = new URL(req.url || '', 'http://localhost');
    const force = url.searchParams.get('force') === 'true';

    const automationDir = path.join(process.cwd(), 'content-automation');

    const scrapeCmd = `npx tsx src/scrapers/prokoleso.ts${force ? ' --force' : ''}`;
    const importCmd = 'npx tsx src/import-tyres.ts';
    const generateCmd = 'npx tsx src/index.ts --generate';
    const command = `${scrapeCmd} && ${importCmd} && ${generateCmd}`;

    const steps = [
      { cmd: scrapeCmd, label: 'Скрапінг', step: 1 },
      { cmd: importCmd, label: 'Імпорт', step: 2 },
      { cmd: generateCmd, label: 'Генерація', step: 3 },
    ];

    const jobId = `pipeline-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
      currentStep: 1,
      totalSteps: 3,
      stepLabel: steps[0].label,
    };
    saveJob(job);

    // Audit log
    const userEmail = (req.user as { email?: string }).email;
    auditLog(req.payload, {
      action: 'automation_run',
      actor: userEmail,
      target: 'pipeline',
      details: { jobId, force },
    }).catch(() => {});

    (async () => {
      try {
        let allOutput = '';
        for (const { cmd, label, step } of steps) {
          job.currentStep = step;
          job.stepLabel = label;
          updateJob(job);
          try {
            const { stdout, stderr } = await execAsync(cmd, {
              cwd: automationDir,
              timeout: 600000, // 10 minutes per step
              env: { ...process.env },
            });
            allOutput += stdout + (stderr ? `\nSTDERR:\n${stderr}` : '') + '\n';
          } catch (error: unknown) {
            const err = error as { message: string; stdout?: string };
            job.status = 'failed';
            job.completedAt = new Date().toISOString();
            job.error = `Крок "${label}" не вдався: ${err.message}`;
            job.output = allOutput + (err.stdout || '');
            updateJob(job);
            req.payload.logger.error(`Full pipeline failed at step "${label}": ${err.message}`);
            return;
          }
        }
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.output = allOutput;
        updateJob(job);
        req.payload.logger.info(`Full pipeline completed: ${jobId}`);
      } finally {
        // Always release the lock when pipeline finishes
        await releaseLock(req.payload, LOCK_IDS.PIPELINE);
      }
    })();

    return Response.json({
      message: 'Full pipeline started (scrape → import → generate)',
      jobId,
      command,
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
    return Response.json({ jobs: getRecentJobs(20) });
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

    // RBAC: content regeneration requires editor or admin role
    const forbidden = requireRoleForEndpoint(req.user, 'editor');
    if (forbidden) return forbidden;

    const slug = req.routeParams?.slug as string;
    if (!slug) {
      return Response.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Concurrency check: prevent duplicate jobs for the same slug
    const existing = findActiveByTarget('content', undefined, slug);
    if (existing) {
      return Response.json({
        message: 'Content regeneration already running for this slug',
        jobId: existing.id,
        checkStatus: `/api/content/status/${existing.id}`,
      });
    }

    // Rate limit: max 5 concurrent AI jobs
    if (countActiveJobs() >= 5) {
      return Response.json(
        { error: 'Too many concurrent jobs. Please wait and try again.' },
        { status: 429 }
      );
    }

    const automationDir = path.join(process.cwd(), 'content-automation');

    // Command to regenerate specific tyre
    const command = `npx tsx src/regenerate-tyre.ts "${slug}"`;

    const jobId = `regen-${slug}-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      type: 'content',
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
      targetName: slug,
    };
    saveJob(job);

    execAsync(command, {
      cwd: automationDir,
      timeout: 120000, // 2 minutes
      env: { ...process.env },
    })
      .then(({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
        updateJob(job);
        req.payload.logger.info(`Content regeneration completed for ${slug}: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message;
        job.output = error.stdout || '';
        updateJob(job);
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
 * POST /api/content/smart-pipeline
 *
 * Run the smart article pipeline: scan sources → plan → generate → publish/review
 */
export const contentSmartPipelineEndpoint: Endpoint = {
  path: '/content/smart-pipeline',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: automation endpoints require admin role
    const forbidden = requireRoleForEndpoint(req.user, 'admin');
    if (forbidden) return forbidden;

    // Rate limiting: 10 requests per IP per hour
    const rateLimited = checkRateLimit(automationRateLimiter, req);
    if (rateLimited) return rateLimited;

    // Distributed lock: prevent concurrent smart pipeline runs
    const lock = await tryAcquireLock(req.payload, LOCK_IDS.SMART_ARTICLES);
    if (!lock.acquired) {
      return Response.json(
        { error: 'Smart article pipeline is already running. Please wait for it to complete.' },
        { status: 409 },
      );
    }

    const automationDir = path.join(process.cwd(), 'content-automation');
    const command = 'npx tsx src/article-pipeline.ts';

    const jobId = `smart-pipeline-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
      currentStep: 1,
      totalSteps: 3,
      stepLabel: 'Сканування джерел',
    };
    saveJob(job);

    // Audit log
    const userEmail = (req.user as { email?: string }).email;
    auditLog(req.payload, {
      action: 'automation_run',
      actor: userEmail,
      target: 'smart-pipeline',
      details: { jobId },
    }).catch(() => {});

    execAsync(command, {
      cwd: automationDir,
      timeout: 900000, // 15 minutes
      env: { ...process.env },
    })
      .then(({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
        updateJob(job);
        req.payload.logger.info(`Smart pipeline completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message;
        job.output = error.stdout || '';
        updateJob(job);
        req.payload.logger.error(`Smart pipeline failed: ${error.message}`);
      })
      .finally(() => {
        // Release distributed lock when done
        releaseLock(req.payload, LOCK_IDS.SMART_ARTICLES).catch(() => {});
      });

    return Response.json({
      message: 'Smart article pipeline started (scan → plan → generate)',
      jobId,
      command,
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

    // RBAC: automation endpoints require admin role
    const forbidden = requireRoleForEndpoint(req.user, 'admin');
    if (forbidden) return forbidden;

    // Rate limiting: 10 requests per IP per hour
    const rateLimited = checkRateLimit(automationRateLimiter, req);
    if (rateLimited) return rateLimited;

    const automationDir = path.join(process.cwd(), 'content-automation');
    const command = 'npx tsx src/scheduler.ts publish';

    const jobId = `publish-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
    };
    saveJob(job);

    execAsync(command, {
      cwd: automationDir,
      timeout: 300000, // 5 minutes
      env: { ...process.env },
    })
      .then(({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
        updateJob(job);
        req.payload.logger.info(`Content publish completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message;
        job.output = error.stdout || '';
        updateJob(job);
        req.payload.logger.error(`Content publish failed: ${error.message}`);
      });

    return Response.json({
      message: 'Publish started',
      jobId,
      checkStatus: `/api/content/job/${jobId}`,
    });
  },
};
