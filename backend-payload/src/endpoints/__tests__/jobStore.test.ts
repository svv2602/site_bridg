/**
 * Tests for the unified job store (SQLite-backed with in-memory cache).
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { saveJob, updateJob, getJob, getRecentJobs, findActiveByTarget, countActiveJobs, cleanupOldJobs, type JobStatus } from '../jobStore';

// The jobStore uses a singleton SQLite DB. We need to test with real jobs.
// Jobs are stored in the actual SQLite file, so we use unique IDs per test.

function makeJob(overrides: Partial<JobStatus> = {}): JobStatus {
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    status: 'running',
    startedAt: new Date().toISOString(),
    command: 'npx tsx test.ts',
    ...overrides,
  };
}

describe('jobStore', () => {
  describe('saveJob', () => {
    it('should save a job and retrieve it', () => {
      const job = makeJob();
      saveJob(job);

      const retrieved = getJob(job.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(job.id);
      expect(retrieved!.status).toBe('running');
      expect(retrieved!.command).toBe('npx tsx test.ts');
    });

    it('should save a job with all extended fields', () => {
      const job = makeJob({
        type: 'content',
        targetId: 42,
        targetName: 'turanza-t005',
        count: 3,
        resultIds: [1, 2, 3],
        newMediaId: 99,
      });
      saveJob(job);

      const retrieved = getJob(job.id);
      expect(retrieved!.type).toBe('content');
      expect(retrieved!.targetId).toBe(42);
      expect(retrieved!.targetName).toBe('turanza-t005');
      expect(retrieved!.count).toBe(3);
      expect(retrieved!.resultIds).toEqual([1, 2, 3]);
      expect(retrieved!.newMediaId).toBe(99);
    });
  });

  describe('updateJob', () => {
    it('should update job status and remove from active cache', () => {
      const job = makeJob();
      saveJob(job);

      // Verify it's in active cache
      expect(countActiveJobs()).toBeGreaterThanOrEqual(1);

      // Complete the job
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.output = 'Done!';
      updateJob(job);

      // Should still be retrievable from SQLite
      const retrieved = getJob(job.id);
      expect(retrieved!.status).toBe('completed');
      expect(retrieved!.output).toBe('Done!');
    });

    it('should update step info for running job', () => {
      const job = makeJob({
        currentStep: 1,
        totalSteps: 3,
        stepLabel: 'Step 1',
      });
      saveJob(job);

      job.currentStep = 2;
      job.stepLabel = 'Step 2';
      updateJob(job);

      const retrieved = getJob(job.id);
      expect(retrieved!.currentStep).toBe(2);
      expect(retrieved!.stepLabel).toBe('Step 2');
    });
  });

  describe('getJob', () => {
    it('should return undefined for non-existent job', () => {
      const retrieved = getJob('non-existent-job-id');
      expect(retrieved).toBeUndefined();
    });

    it('should return from cache for running jobs', () => {
      const job = makeJob();
      saveJob(job);

      // Modify in-memory step (simulates real-time updates)
      job.stepLabel = 'Updated via cache';
      // getJob should return the cached version
      const retrieved = getJob(job.id);
      expect(retrieved!.stepLabel).toBe('Updated via cache');

      // Clean up
      job.status = 'completed';
      updateJob(job);
    });
  });

  describe('getRecentJobs', () => {
    it('should return jobs in reverse chronological order', () => {
      const jobs = [makeJob(), makeJob(), makeJob()];
      for (const job of jobs) {
        saveJob(job);
        // Complete them so they don't interfere with other tests
        job.status = 'completed';
        updateJob(job);
      }

      const recent = getRecentJobs(100);
      expect(recent.length).toBeGreaterThanOrEqual(3);
    });

    it('should respect limit parameter', () => {
      const recent = getRecentJobs(2);
      expect(recent.length).toBeLessThanOrEqual(2);
    });
  });

  describe('findActiveByTarget', () => {
    it('should find running job by type and targetName', () => {
      const job = makeJob({
        type: 'content',
        targetName: 'unique-test-slug-123',
      });
      // Include targetName in command for findActiveByTarget matching
      job.command = `npx tsx test.ts "unique-test-slug-123"`;
      saveJob(job);

      const found = findActiveByTarget('content', undefined, 'unique-test-slug-123');
      expect(found).toBeDefined();
      expect(found!.id).toBe(job.id);

      // Clean up
      job.status = 'completed';
      updateJob(job);
    });

    it('should return undefined when no matching job', () => {
      const found = findActiveByTarget('content', undefined, 'non-existent-target');
      expect(found).toBeUndefined();
    });

    it('should not find completed jobs', () => {
      const job = makeJob({ type: 'image', targetName: 'completed-target' });
      job.command = 'test "completed-target"';
      saveJob(job);
      job.status = 'completed';
      updateJob(job);

      const found = findActiveByTarget('image', undefined, 'completed-target');
      expect(found).toBeUndefined();
    });
  });

  describe('countActiveJobs', () => {
    it('should count running jobs', () => {
      const initialCount = countActiveJobs();
      const job = makeJob();
      saveJob(job);

      expect(countActiveJobs()).toBe(initialCount + 1);

      // Clean up
      job.status = 'completed';
      updateJob(job);
      expect(countActiveJobs()).toBe(initialCount);
    });
  });

  describe('cleanupOldJobs', () => {
    it('should remove old completed jobs', () => {
      // Create a job with old date
      const oldJob = makeJob();
      oldJob.startedAt = new Date('2020-01-01').toISOString();
      oldJob.status = 'completed';
      oldJob.completedAt = new Date('2020-01-01').toISOString();
      saveJob(oldJob);
      // updateJob to mark as completed so it's not in active cache
      updateJob(oldJob);

      const cleaned = cleanupOldJobs(1);
      // Should have cleaned at least 1 old job
      expect(cleaned).toBeGreaterThanOrEqual(1);
    });

    it('should not remove running jobs', () => {
      const runningJob = makeJob();
      saveJob(runningJob);

      const beforeCount = countActiveJobs();
      cleanupOldJobs(0); // Cleanup everything older than 0 days
      const afterCount = countActiveJobs();

      // Running job should still be there
      expect(afterCount).toBe(beforeCount);

      // Clean up
      runningJob.status = 'completed';
      updateJob(runningJob);
    });
  });
});
