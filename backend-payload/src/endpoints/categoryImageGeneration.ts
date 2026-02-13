/**
 * Category Page Hero Image Generation Endpoints
 *
 * POST /api/category-image/:pageId  — start hero image generation for a category page
 * GET  /api/category-image/status/:jobId — poll job status
 */

import type { Endpoint } from 'payload';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { saveJob, updateJob, getJob, findActiveByTarget, countActiveJobs, type JobStatus } from './jobStore';
import { requireRoleForEndpoint } from '../lib/rbac';

const execAsync = promisify(exec);

/**
 * POST /api/category-image/:pageId
 *
 * Generate hero image for a category page using AI.
 * Body (all optional):
 *   - topic: string — topic for prompt generation (auto-detected if omitted)
 *   - season: string — summer | winter | allseason (auto-detected if omitted)
 *   - prompt: string — full custom prompt (overrides topic/season)
 */
export const generateCategoryImageEndpoint: Endpoint = {
  path: '/category-image/:pageId',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const forbidden = requireRoleForEndpoint(req.user, 'editor');
    if (forbidden) return forbidden;

    const pageId = parseInt((req.routeParams?.pageId as string) || '0', 10);
    if (!pageId) {
      return Response.json({ error: 'Page ID is required' }, { status: 400 });
    }

    // Verify page exists
    try {
      await req.payload.findByID({ collection: 'category-pages', id: pageId });
    } catch {
      return Response.json({ error: 'Category page not found' }, { status: 404 });
    }

    // Concurrency check
    const existingJob = findActiveByTarget('image', pageId, `cat-hero-${pageId}`);
    if (existingJob) {
      return Response.json({
        message: 'Hero image generation already running for this page',
        jobId: existingJob.id,
        checkStatus: `/api/category-image/status/${existingJob.id}`,
      });
    }

    if (countActiveJobs() >= 5) {
      return Response.json(
        { error: 'Too many concurrent jobs. Please wait and try again.' },
        { status: 429 },
      );
    }

    // Parse optional body
    let body: { topic?: string; season?: string; prompt?: string } = {};
    try {
      body = await req.json?.() || {};
    } catch {
      // No body or invalid JSON
    }

    // Create job
    const jobId = `cat-hero-${Date.now()}`;
    const job: JobStatus = {
      id: jobId,
      type: 'image',
      status: 'running',
      startedAt: new Date().toISOString(),
      command: `generate-category-hero --pageId=${pageId}`,
      targetId: pageId,
    };
    saveJob(job);

    req.payload.logger.info(`Starting category hero generation: ${jobId} for page ${pageId}`);

    // Build CLI command
    const projectDir = process.cwd();
    const automationDir = path.join(projectDir, 'content-automation');

    let command = `npx tsx src/generate-category-hero.ts --pageId=${pageId}`;
    if (body.topic) {
      command += ` --topic="${body.topic.replace(/"/g, '\\"')}"`;
    }
    if (body.season) {
      command += ` --season=${body.season}`;
    }
    if (body.prompt) {
      command += ` --prompt="${body.prompt.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
    }

    // Run in background
    execAsync(command, {
      cwd: automationDir,
      timeout: 300000, // 5 minutes
      env: { ...process.env },
    })
      .then(({ stdout, stderr }) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();

        // Parse JSON result from stdout
        try {
          const result = JSON.parse(stdout.trim());
          if (result.mediaId) {
            job.newMediaId = result.mediaId;
          }
        } catch {
          // stdout may contain non-JSON output
        }

        job.output = (stderr + '\n' + stdout).slice(0, 2000);
        updateJob(job);
        req.payload.logger.info(`Category hero generation completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message || String(error);
        updateJob(job);
        req.payload.logger.error(`Category hero generation failed: ${jobId} - ${job.error}`);
      });

    return Response.json({
      message: 'Category hero image generation started',
      jobId,
      checkStatus: `/api/category-image/status/${jobId}`,
    });
  },
};

/**
 * GET /api/category-image/status/:jobId
 *
 * Poll status of a category hero image generation job.
 */
export const categoryImageStatusEndpoint: Endpoint = {
  path: '/category-image/status/:jobId',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = req.routeParams?.jobId as string;
    if (!jobId) {
      return Response.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const job = getJob(jobId);
    if (!job) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    return Response.json(job);
  },
};
