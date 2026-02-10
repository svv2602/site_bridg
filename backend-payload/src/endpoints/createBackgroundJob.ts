/**
 * Background Job Factory
 *
 * Reduces boilerplate for endpoints that follow the common pattern:
 *   1. Auth check (req.user)
 *   2. RBAC role check
 *   3. Rate limit check (optional)
 *   4. Concurrency check (optional)
 *   5. Create job in jobStore
 *   6. Run async work in background
 *   7. Update job on completion/failure
 *   8. Return response with jobId
 *
 * Usage:
 * ```ts
 * const myEndpoint: Endpoint = {
 *   path: '/my-path',
 *   method: 'post',
 *   handler: createBackgroundJobHandler({
 *     type: 'review',
 *     jobPrefix: 'review',
 *     parseInput: (req) => ({ tyreId: parseInt(req.routeParams?.tyreId as string) }),
 *     execute: async (input, ctx) => { ... return { output: '...' } },
 *     minRole: 'editor',
 *   }),
 * };
 * ```
 */

import type { Endpoint, PayloadRequest } from 'payload';
import type { Payload } from 'payload';
import {
  saveJob,
  updateJob,
  findActiveByTarget,
  countActiveJobs,
  type JobStatus,
} from './jobStore';
import { requireRoleForEndpoint, type UserRole } from '../lib/rbac';
import { checkRateLimit, type RateLimiter } from '../lib/rate-limiter';
import { apiResponse, apiError } from './api-response';

/** Result returned by the execute function */
export interface JobResult {
  /** Human-readable output text (truncated to 2000 chars if longer) */
  output?: string;
  /** IDs of resources created by the job */
  resultIds?: number[];
  /** ID of new media created (for image jobs) */
  newMediaId?: number;
  /** Additional data to include in the immediate response */
  responseExtra?: Record<string, unknown>;
}

/** Context provided to the execute function */
export interface JobExecutionContext {
  /** Payload CMS instance */
  payload: Payload;
  /** The original request (for accessing payload methods within async callback) */
  req: PayloadRequest;
  /** Unique job ID */
  jobId: string;
  /** The job object — can be mutated to update step progress */
  job: JobStatus;
}

/** Configuration for creating a background job endpoint handler */
export interface BackgroundJobConfig<TInput> {
  /**
   * Job type identifier (used for concurrency checks and job store).
   * Must match one of JobStatus['type'] values or a custom string.
   */
  type: JobStatus['type'];

  /**
   * Prefix for auto-generated job IDs (e.g. 'review' -> 'review-1234567890')
   */
  jobPrefix: string;

  /**
   * Parse and validate input from the request.
   * Should throw an Error with a user-friendly message on invalid input.
   * The error message will be returned as a 400 response.
   */
  parseInput: (req: PayloadRequest) => TInput | Promise<TInput>;

  /**
   * The actual async work to perform.
   * This runs in the background after the response is sent.
   */
  execute: (input: TInput, ctx: JobExecutionContext) => Promise<JobResult>;

  /**
   * Build a command string for the job record.
   * Used for display in admin UI and concurrency matching.
   */
  buildCommand: (input: TInput) => string;

  /**
   * Minimum role required to use this endpoint.
   * Defaults to 'admin' if not specified.
   */
  minRole?: UserRole;

  /**
   * Optional rate limiter instance.
   * If provided, requests will be checked against it.
   */
  rateLimiter?: RateLimiter;

  /**
   * Max concurrent AI jobs (checked via countActiveJobs).
   * Set to 0 or omit to disable this check.
   * Defaults to 5.
   */
  maxConcurrentJobs?: number;

  /**
   * Optional: check for duplicate jobs targeting the same resource.
   * Return { targetId, targetName } to enable concurrency check.
   * If a running job is found for the same target, returns 200 with existing jobId.
   */
  concurrencyKey?: (input: TInput) => { targetId?: number; targetName?: string } | undefined;

  /**
   * Optional: build the checkStatus URL for the response.
   * Defaults to `/api/content/job/{jobId}`.
   */
  statusPath?: (jobId: string) => string;

  /**
   * Optional: customize the initial job status fields.
   */
  buildJobExtras?: (input: TInput) => Partial<JobStatus>;

  /**
   * Optional: message for the immediate response.
   * Defaults to '{type} job started'.
   */
  responseMessage?: string;
}

/**
 * Create a Payload endpoint handler that runs work in the background.
 *
 * Handles auth, RBAC, rate limiting, concurrency, job creation, and
 * consistent response formatting — so the endpoint only needs to
 * define input parsing and the actual work.
 */
export function createBackgroundJobHandler<TInput>(
  config: BackgroundJobConfig<TInput>,
): Endpoint['handler'] {
  const {
    type,
    jobPrefix,
    parseInput,
    execute,
    buildCommand,
    minRole = 'admin',
    rateLimiter,
    maxConcurrentJobs = 5,
    concurrencyKey,
    statusPath,
    buildJobExtras,
    responseMessage,
  } = config;

  return async (req: PayloadRequest): Promise<Response> => {
    // 1. Auth check
    if (!req.user) {
      return apiError('Unauthorized', 401);
    }

    // 2. RBAC check
    const forbidden = requireRoleForEndpoint(req.user, minRole);
    if (forbidden) return forbidden;

    // 3. Rate limit check
    if (rateLimiter) {
      const rateLimited = checkRateLimit(rateLimiter, req as unknown as Request);
      if (rateLimited) return rateLimited;
    }

    // 4. Parse and validate input
    let input: TInput;
    try {
      input = await parseInput(req);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return apiError(message, 400);
    }

    // 5. Concurrency check: prevent duplicate jobs for the same target
    if (concurrencyKey) {
      const key = concurrencyKey(input);
      if (key) {
        const existing = findActiveByTarget(type ?? '', key.targetId, key.targetName);
        if (existing) {
          const checkStatus = statusPath
            ? statusPath(existing.id)
            : `/api/content/job/${existing.id}`;
          return apiResponse({
            message: `Job already running for this target`,
            jobId: existing.id,
            checkStatus,
          });
        }
      }
    }

    // 6. Global concurrency limit
    if (maxConcurrentJobs > 0 && countActiveJobs() >= maxConcurrentJobs) {
      return apiError('Too many concurrent jobs. Please wait and try again.', 429);
    }

    // 7. Create job
    const jobId = `${jobPrefix}-${Date.now()}`;
    const command = buildCommand(input);
    const extras = buildJobExtras ? buildJobExtras(input) : {};

    const job: JobStatus = {
      id: jobId,
      type,
      status: 'running',
      startedAt: new Date().toISOString(),
      command,
      ...extras,
    };
    saveJob(job);

    req.payload.logger.info(`Starting ${type ?? jobPrefix} job: ${jobId}`);

    // 8. Run async work in background
    const ctx: JobExecutionContext = {
      payload: req.payload,
      req,
      jobId,
      job,
    };

    execute(input, ctx)
      .then((result) => {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        if (result.output) {
          job.output = result.output.slice(0, 2000);
        }
        if (result.resultIds) {
          job.resultIds = result.resultIds;
        }
        if (result.newMediaId) {
          job.newMediaId = result.newMediaId;
        }
        updateJob(job);
        req.payload.logger.info(`${type ?? jobPrefix} job completed: ${jobId}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error instanceof Error ? error.message : String(error);
        updateJob(job);
        req.payload.logger.error(`${type ?? jobPrefix} job failed: ${jobId} - ${job.error}`);
      });

    // 9. Return immediate response
    const checkStatus = statusPath
      ? statusPath(jobId)
      : `/api/content/job/${jobId}`;

    return apiResponse(
      {
        message: responseMessage ?? `${type ?? jobPrefix} job started`,
        jobId,
        checkStatus,
        ...(extras.targetId ? { targetId: extras.targetId } : {}),
        ...(extras.targetName ? { targetName: extras.targetName } : {}),
      },
      { jobId },
    );
  };
}
