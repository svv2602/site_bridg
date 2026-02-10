/**
 * Tests for the Background Job Factory (createBackgroundJobHandler).
 *
 * These tests verify:
 * - Auth checking (401 for unauthenticated requests)
 * - RBAC role checking (403 for unauthorized roles)
 * - Rate limiting (429 when limit exceeded)
 * - Input parsing and validation (400 for invalid input)
 * - Concurrency checking (returns existing job when duplicate)
 * - Global concurrency limit (429 when too many concurrent jobs)
 * - Job creation and async execution
 * - Job success/failure status updates
 * - Response format consistency
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBackgroundJobHandler, type BackgroundJobConfig, type JobResult } from '../createBackgroundJob';
import * as jobStore from '../jobStore';
import { createRateLimiter } from '../../lib/rate-limiter';

// Mock jobStore to avoid SQLite side effects.
// We track calls manually to avoid reference/timing issues.
let saveJobCalls: jobStore.JobStatus[] = [];
let updateJobCalls: jobStore.JobStatus[] = [];
let mockFindActiveByTarget: typeof jobStore.findActiveByTarget = () => undefined;
let mockCountActiveJobs: typeof jobStore.countActiveJobs = () => 0;

vi.mock('../jobStore', () => ({
  saveJob: (job: jobStore.JobStatus) => {
    // Deep-clone to capture state at call time (avoid mutation)
    saveJobCalls.push(JSON.parse(JSON.stringify(job)));
  },
  updateJob: (job: jobStore.JobStatus) => {
    updateJobCalls.push(JSON.parse(JSON.stringify(job)));
  },
  findActiveByTarget: (...args: Parameters<typeof jobStore.findActiveByTarget>) =>
    mockFindActiveByTarget(...args),
  countActiveJobs: () => mockCountActiveJobs(),
}));

/** Flush microtask queue so fire-and-forget .then()/.catch() handlers execute */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 50));
}

/** Create a minimal mock PayloadRequest */
function mockRequest(overrides: {
  user?: unknown;
  routeParams?: Record<string, unknown>;
  url?: string;
  headers?: Record<string, string>;
  jsonBody?: unknown;
} = {}): any {
  const headers = new Headers(overrides.headers || {});
  return {
    user: overrides.user ?? null,
    routeParams: overrides.routeParams ?? {},
    url: overrides.url ?? 'http://localhost:3001/api/test',
    headers,
    json: overrides.jsonBody !== undefined
      ? vi.fn().mockResolvedValue(overrides.jsonBody)
      : vi.fn().mockRejectedValue(new Error('No body')),
    payload: {
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
    },
  };
}

/** Default simple config for testing */
function makeConfig(
  overrides: Partial<BackgroundJobConfig<{ value: string }>> = {},
): BackgroundJobConfig<{ value: string }> {
  return {
    type: 'content',
    jobPrefix: 'test',
    parseInput: () => ({ value: 'hello' }),
    execute: vi.fn().mockResolvedValue({ output: 'done' } as JobResult),
    buildCommand: (input) => `test --value=${input.value}`,
    minRole: 'admin',
    ...overrides,
  };
}

describe('createBackgroundJobHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveJobCalls = [];
    updateJobCalls = [];
    mockFindActiveByTarget = () => undefined;
    mockCountActiveJobs = () => 0;
  });

  describe('authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      const handler = createBackgroundJobHandler(makeConfig());
      const req = mockRequest({ user: null });

      const response = await handler(req);
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('should proceed when user is authenticated', async () => {
      const handler = createBackgroundJobHandler(makeConfig());
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      expect(response.status).not.toBe(401);
    });
  });

  describe('RBAC', () => {
    it('should return 403 when user lacks required role', async () => {
      const handler = createBackgroundJobHandler(makeConfig({ minRole: 'admin' }));
      const req = mockRequest({ user: { role: 'editor' } });

      const response = await handler(req);
      expect(response.status).toBe(403);
    });

    it('should allow admin for admin-required endpoint', async () => {
      const handler = createBackgroundJobHandler(makeConfig({ minRole: 'admin' }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      expect(response.status).not.toBe(403);
    });

    it('should allow admin for editor-required endpoint', async () => {
      const handler = createBackgroundJobHandler(makeConfig({ minRole: 'editor' }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      expect(response.status).not.toBe(403);
    });

    it('should allow editor for editor-required endpoint', async () => {
      const handler = createBackgroundJobHandler(makeConfig({ minRole: 'editor' }));
      const req = mockRequest({ user: { role: 'editor' } });

      const response = await handler(req);
      expect(response.status).not.toBe(403);
    });

    it('should default to admin role when minRole not specified', async () => {
      const handler = createBackgroundJobHandler(makeConfig({ minRole: undefined }));
      const req = mockRequest({ user: { role: 'editor' } });

      const response = await handler(req);
      expect(response.status).toBe(403);
    });
  });

  describe('rate limiting', () => {
    it('should return 429 when rate limit exceeded', async () => {
      const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 1 });

      const handler = createBackgroundJobHandler(makeConfig({ rateLimiter: limiter }));

      // First request should pass
      const req1 = mockRequest({
        user: { role: 'admin' },
        headers: { 'x-forwarded-for': '1.2.3.4' },
      });
      const response1 = await handler(req1);
      expect(response1.status).not.toBe(429);

      // Second request should be rate limited
      const req2 = mockRequest({
        user: { role: 'admin' },
        headers: { 'x-forwarded-for': '1.2.3.4' },
      });
      const response2 = await handler(req2);
      expect(response2.status).toBe(429);

      limiter.destroy();
    });

    it('should not rate limit when no limiter is configured', async () => {
      const handler = createBackgroundJobHandler(makeConfig());
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      expect(response.status).not.toBe(429);
    });
  });

  describe('input parsing', () => {
    it('should return 400 when parseInput throws', async () => {
      const handler = createBackgroundJobHandler(makeConfig({
        parseInput: () => { throw new Error('Tyre ID is required'); },
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('Tyre ID is required');
    });

    it('should return 400 when async parseInput throws', async () => {
      const handler = createBackgroundJobHandler(makeConfig({
        parseInput: async () => { throw new Error('Not found'); },
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('Not found');
    });
  });

  describe('concurrency', () => {
    it('should return existing job when duplicate detected', async () => {
      const existingJob: jobStore.JobStatus = {
        id: 'existing-123',
        status: 'running',
        startedAt: new Date().toISOString(),
        command: 'test',
      };
      mockFindActiveByTarget = () => existingJob;

      const handler = createBackgroundJobHandler(makeConfig({
        concurrencyKey: () => ({ targetId: 42 }),
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      const body = await response.json();

      expect(body.data.jobId).toBe('existing-123');
      expect(body.data.message).toContain('already running');
    });

    it('should proceed when no duplicate found', async () => {
      mockFindActiveByTarget = () => undefined;

      const handler = createBackgroundJobHandler(makeConfig({
        concurrencyKey: () => ({ targetId: 42 }),
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      const body = await response.json();

      // Should have started a new job
      expect(body.data.jobId).toMatch(/^test-\d+$/);
    });

    it('should return 429 when max concurrent jobs reached', async () => {
      mockCountActiveJobs = () => 5;

      const handler = createBackgroundJobHandler(makeConfig({ maxConcurrentJobs: 5 }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      expect(response.status).toBe(429);

      const body = await response.json();
      expect(body.error).toContain('Too many concurrent jobs');
    });

    it('should skip concurrency limit when maxConcurrentJobs is 0', async () => {
      mockCountActiveJobs = () => 100;

      const handler = createBackgroundJobHandler(makeConfig({ maxConcurrentJobs: 0 }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      expect(response.status).not.toBe(429);
    });
  });

  describe('job creation', () => {
    it('should save job to jobStore with running status', async () => {
      const handler = createBackgroundJobHandler(makeConfig());
      const req = mockRequest({ user: { role: 'admin' } });

      await handler(req);

      expect(saveJobCalls.length).toBe(1);
      const savedJob = saveJobCalls[0];
      expect(savedJob.id).toMatch(/^test-\d+$/);
      expect(savedJob.type).toBe('content');
      expect(savedJob.status).toBe('running');
      expect(savedJob.command).toBe('test --value=hello');
    });

    it('should include buildJobExtras in saved job', async () => {
      const handler = createBackgroundJobHandler(makeConfig({
        buildJobExtras: () => ({
          targetId: 42,
          targetName: 'my-tyre',
          count: 3,
        }),
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      await handler(req);

      expect(saveJobCalls.length).toBe(1);
      const savedJob = saveJobCalls[0];
      expect(savedJob.targetId).toBe(42);
      expect(savedJob.targetName).toBe('my-tyre');
      expect(savedJob.count).toBe(3);
    });
  });

  describe('response format', () => {
    it('should return jobId in response data', async () => {
      const handler = createBackgroundJobHandler(makeConfig());
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      const body = await response.json();

      expect(body.data.jobId).toMatch(/^test-\d+$/);
      expect(body.meta.jobId).toMatch(/^test-\d+$/);
      expect(body.meta.timestamp).toBeDefined();
    });

    it('should include checkStatus URL in response', async () => {
      const handler = createBackgroundJobHandler(makeConfig({
        statusPath: (jobId) => `/api/my-status/${jobId}`,
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      const body = await response.json();

      expect(body.data.checkStatus).toMatch(/^\/api\/my-status\/test-\d+$/);
    });

    it('should use default status path when not specified', async () => {
      const handler = createBackgroundJobHandler(makeConfig({ statusPath: undefined }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      const body = await response.json();

      expect(body.data.checkStatus).toMatch(/^\/api\/content\/job\/test-\d+$/);
    });

    it('should include custom response message', async () => {
      const handler = createBackgroundJobHandler(makeConfig({
        responseMessage: 'Custom job started',
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      const body = await response.json();

      expect(body.data.message).toBe('Custom job started');
    });

    it('should include targetId and targetName from job extras', async () => {
      const handler = createBackgroundJobHandler(makeConfig({
        buildJobExtras: () => ({
          targetId: 42,
          targetName: 'my-tyre',
        }),
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      const body = await response.json();

      expect(body.data.targetId).toBe(42);
      expect(body.data.targetName).toBe('my-tyre');
    });
  });

  describe('async execution', () => {
    it('should call execute with parsed input and context', async () => {
      const executeFn = vi.fn().mockResolvedValue({ output: 'done' });
      const handler = createBackgroundJobHandler(makeConfig({
        execute: executeFn,
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      await handler(req);
      await flushPromises();

      expect(executeFn).toHaveBeenCalledTimes(1);

      const [input, ctx] = executeFn.mock.calls[0];
      expect(input).toEqual({ value: 'hello' });
      expect(ctx.payload).toBeDefined();
      expect(ctx.jobId).toMatch(/^test-\d+$/);
      expect(ctx.job).toBeDefined();
    });

    it('should update job to completed on success', async () => {
      const executeFn = vi.fn().mockResolvedValue({
        output: 'Success output',
        resultIds: [1, 2, 3],
      });

      const handler = createBackgroundJobHandler(makeConfig({
        execute: executeFn,
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      await handler(req);
      await flushPromises();

      expect(updateJobCalls.length).toBeGreaterThanOrEqual(1);

      const updatedJob = updateJobCalls[updateJobCalls.length - 1];
      expect(updatedJob.status).toBe('completed');
      expect(updatedJob.completedAt).toBeDefined();
      expect(updatedJob.output).toBe('Success output');
      expect(updatedJob.resultIds).toEqual([1, 2, 3]);
    });

    it('should update job to failed on error', async () => {
      const executeFn = vi.fn().mockRejectedValue(new Error('Something broke'));

      const handler = createBackgroundJobHandler(makeConfig({
        execute: executeFn,
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      await handler(req);
      await flushPromises();

      expect(updateJobCalls.length).toBeGreaterThanOrEqual(1);

      const updatedJob = updateJobCalls[updateJobCalls.length - 1];
      expect(updatedJob.status).toBe('failed');
      expect(updatedJob.completedAt).toBeDefined();
      expect(updatedJob.error).toBe('Something broke');
    });

    it('should truncate output to 2000 characters', async () => {
      const longOutput = 'x'.repeat(3000);
      const executeFn = vi.fn().mockResolvedValue({ output: longOutput });

      const handler = createBackgroundJobHandler(makeConfig({
        execute: executeFn,
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      await handler(req);
      await flushPromises();

      expect(updateJobCalls.length).toBeGreaterThanOrEqual(1);

      const updatedJob = updateJobCalls[updateJobCalls.length - 1];
      expect(updatedJob.output!.length).toBe(2000);
    });

    it('should set newMediaId from execute result', async () => {
      const executeFn = vi.fn().mockResolvedValue({
        output: 'done',
        newMediaId: 99,
      });

      const handler = createBackgroundJobHandler(makeConfig({
        execute: executeFn,
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      await handler(req);
      await flushPromises();

      expect(updateJobCalls.length).toBeGreaterThanOrEqual(1);

      const updatedJob = updateJobCalls[updateJobCalls.length - 1];
      expect(updatedJob.newMediaId).toBe(99);
    });
  });

  describe('edge cases', () => {
    it('should handle non-Error thrown values', async () => {
      const executeFn = vi.fn().mockRejectedValue('string error');

      const handler = createBackgroundJobHandler(makeConfig({
        execute: executeFn,
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      await handler(req);
      await flushPromises();

      expect(updateJobCalls.length).toBeGreaterThanOrEqual(1);

      const updatedJob = updateJobCalls[updateJobCalls.length - 1];
      expect(updatedJob.status).toBe('failed');
      expect(updatedJob.error).toBe('string error');
    });

    it('should handle concurrencyKey returning undefined', async () => {
      mockFindActiveByTarget = () => undefined;

      const handler = createBackgroundJobHandler(makeConfig({
        concurrencyKey: () => undefined,
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      const response = await handler(req);
      const body = await response.json();

      // Should proceed normally (no concurrency check when key is undefined)
      expect(body.data.jobId).toMatch(/^test-\d+$/);
      // Job should have been created
      expect(saveJobCalls.length).toBe(1);
    });

    it('should handle execute returning empty result', async () => {
      const executeFn = vi.fn().mockResolvedValue({});

      const handler = createBackgroundJobHandler(makeConfig({
        execute: executeFn,
      }));
      const req = mockRequest({ user: { role: 'admin' } });

      await handler(req);
      await flushPromises();

      expect(updateJobCalls.length).toBeGreaterThanOrEqual(1);

      const updatedJob = updateJobCalls[updateJobCalls.length - 1];
      expect(updatedJob.status).toBe('completed');
    });
  });
});
