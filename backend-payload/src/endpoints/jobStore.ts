import Database from 'better-sqlite3';
import path from 'path';

export interface JobStatus {
  id: string;
  type?: 'content' | 'review' | 'image';
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  output?: string;
  error?: string;
  command: string;
  currentStep?: number;
  totalSteps?: number;
  stepLabel?: string;
  // Extended fields for unified job tracking
  targetId?: number;
  targetName?: string;
  count?: number;
  resultIds?: number[];
  newMediaId?: number;
}

// In-memory cache for active (running) jobs -- fast reads during polling
const activeJobs: Map<string, JobStatus> = new Map();

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  const dbPath = process.env.SQLITE_PATH
    || path.join(process.cwd(), 'content-automation', 'data', 'content-automation.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS content_jobs (
      id TEXT PRIMARY KEY,
      type TEXT,
      status TEXT NOT NULL DEFAULT 'running',
      started_at TEXT NOT NULL,
      completed_at TEXT,
      output TEXT,
      error TEXT,
      command TEXT NOT NULL,
      current_step INTEGER,
      total_steps INTEGER,
      step_label TEXT,
      target_id INTEGER,
      target_name TEXT,
      count INTEGER,
      result_ids TEXT,
      new_media_id INTEGER
    )
  `);

  // Add columns if missing (safe migration for existing DBs)
  const cols = db.pragma('table_info(content_jobs)') as Array<{ name: string }>;
  const colNames = new Set(cols.map((c) => c.name));
  const migrations: Array<[string, string]> = [
    ['type', 'TEXT'],
    ['target_id', 'INTEGER'],
    ['target_name', 'TEXT'],
    ['count', 'INTEGER'],
    ['result_ids', 'TEXT'],
    ['new_media_id', 'INTEGER'],
  ];
  for (const [col, colType] of migrations) {
    if (!colNames.has(col)) {
      db.exec(`ALTER TABLE content_jobs ADD COLUMN ${col} ${colType}`);
    }
  }

  return db;
}

function jobToRow(job: JobStatus) {
  return {
    id: job.id,
    type: job.type ?? null,
    status: job.status,
    started_at: job.startedAt,
    completed_at: job.completedAt ?? null,
    output: job.output ?? null,
    error: job.error ?? null,
    command: job.command,
    current_step: job.currentStep ?? null,
    total_steps: job.totalSteps ?? null,
    step_label: job.stepLabel ?? null,
    target_id: job.targetId ?? null,
    target_name: job.targetName ?? null,
    count: job.count ?? null,
    result_ids: job.resultIds ? JSON.stringify(job.resultIds) : null,
    new_media_id: job.newMediaId ?? null,
  };
}

function rowToJob(row: Record<string, unknown>): JobStatus {
  const job: JobStatus = {
    id: row.id as string,
    status: row.status as JobStatus['status'],
    startedAt: row.started_at as string,
    command: row.command as string,
  };
  if (row.type) job.type = row.type as JobStatus['type'];
  if (row.completed_at) job.completedAt = row.completed_at as string;
  if (row.output) job.output = row.output as string;
  if (row.error) job.error = row.error as string;
  if (row.current_step != null) job.currentStep = row.current_step as number;
  if (row.total_steps != null) job.totalSteps = row.total_steps as number;
  if (row.step_label) job.stepLabel = row.step_label as string;
  if (row.target_id != null) job.targetId = row.target_id as number;
  if (row.target_name) job.targetName = row.target_name as string;
  if (row.count != null) job.count = row.count as number;
  if (row.result_ids) {
    try { job.resultIds = JSON.parse(row.result_ids as string); } catch { /* ignore */ }
  }
  if (row.new_media_id != null) job.newMediaId = row.new_media_id as number;
  return job;
}

export function saveJob(job: JobStatus): void {
  activeJobs.set(job.id, job);
  const database = getDb();
  const r = jobToRow(job);
  database
    .prepare(
      `INSERT INTO content_jobs (id, type, status, started_at, completed_at, output, error, command, current_step, total_steps, step_label, target_id, target_name, count, result_ids, new_media_id)
       VALUES (@id, @type, @status, @started_at, @completed_at, @output, @error, @command, @current_step, @total_steps, @step_label, @target_id, @target_name, @count, @result_ids, @new_media_id)
       ON CONFLICT(id) DO UPDATE SET
         status = @status,
         completed_at = @completed_at,
         output = @output,
         error = @error,
         current_step = @current_step,
         total_steps = @total_steps,
         step_label = @step_label,
         target_id = @target_id,
         target_name = @target_name,
         count = @count,
         result_ids = @result_ids,
         new_media_id = @new_media_id`
    )
    .run(r);
}

export function updateJob(job: JobStatus): void {
  // Update in-memory cache
  if (job.status === 'running') {
    activeJobs.set(job.id, job);
  } else {
    activeJobs.delete(job.id);
  }

  const database = getDb();
  const r = jobToRow(job);
  database
    .prepare(
      `UPDATE content_jobs SET
         status = @status,
         completed_at = @completed_at,
         output = @output,
         error = @error,
         current_step = @current_step,
         total_steps = @total_steps,
         step_label = @step_label,
         target_id = @target_id,
         target_name = @target_name,
         count = @count,
         result_ids = @result_ids,
         new_media_id = @new_media_id
       WHERE id = @id`
    )
    .run(r);
}

export function getJob(id: string): JobStatus | undefined {
  // Check in-memory cache first (for running jobs with latest step info)
  const cached = activeJobs.get(id);
  if (cached) return cached;

  const database = getDb();
  const row = database
    .prepare('SELECT * FROM content_jobs WHERE id = ?')
    .get(id) as Record<string, unknown> | undefined;

  return row ? rowToJob(row) : undefined;
}

export function getRecentJobs(limit: number = 20): JobStatus[] {
  const database = getDb();
  const rows = database
    .prepare('SELECT * FROM content_jobs ORDER BY started_at DESC LIMIT ?')
    .all(limit) as Array<Record<string, unknown>>;

  const persisted = rows.map(rowToJob);

  // Merge with active in-memory jobs (they may have newer step info)
  return persisted.map((job) => activeJobs.get(job.id) ?? job);
}

/**
 * Find an active (running) job for a specific target.
 * Used for concurrency control -- prevent duplicate jobs for the same tyre/media/slug.
 */
export function findActiveByTarget(type: string, targetId?: number, targetName?: string): JobStatus | undefined {
  for (const job of activeJobs.values()) {
    if (job.status !== 'running') continue;
    if (job.type !== type) continue;
    if (targetId && job.targetId === targetId) return job;
    if (targetName && job.command?.includes(targetName)) return job;
  }
  return undefined;
}

/**
 * Count all currently active (running) jobs.
 * Used for global rate limiting.
 */
export function countActiveJobs(): number {
  return activeJobs.size;
}

/**
 * Remove old completed/failed jobs from the database.
 * Called on scheduler init to prevent unbounded growth.
 */
export function cleanupOldJobs(olderThanDays: number = 30): number {
  const database = getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  const cutoffIso = cutoff.toISOString();

  const result = database
    .prepare('DELETE FROM content_jobs WHERE status != ? AND started_at < ?')
    .run('running', cutoffIso);

  return result.changes;
}
