import Database from 'better-sqlite3';
import path from 'path';

export interface JobStatus {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  output?: string;
  error?: string;
  command: string;
  currentStep?: number;
  totalSteps?: number;
  stepLabel?: string;
}

// In-memory cache for active (running) jobs — fast reads during polling
const activeJobs: Map<string, JobStatus> = new Map();

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  const dbPath = process.env.SQLITE_PATH
    || path.join(process.cwd(), 'content-automation', 'data', 'content-automation.db');
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS content_jobs (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'running',
      started_at TEXT NOT NULL,
      completed_at TEXT,
      output TEXT,
      error TEXT,
      command TEXT NOT NULL,
      current_step INTEGER,
      total_steps INTEGER,
      step_label TEXT
    )
  `);

  return db;
}

function jobToRow(job: JobStatus) {
  return {
    id: job.id,
    status: job.status,
    started_at: job.startedAt,
    completed_at: job.completedAt ?? null,
    output: job.output ?? null,
    error: job.error ?? null,
    command: job.command,
    current_step: job.currentStep ?? null,
    total_steps: job.totalSteps ?? null,
    step_label: job.stepLabel ?? null,
  };
}

function rowToJob(row: Record<string, unknown>): JobStatus {
  const job: JobStatus = {
    id: row.id as string,
    status: row.status as JobStatus['status'],
    startedAt: row.started_at as string,
    command: row.command as string,
  };
  if (row.completed_at) job.completedAt = row.completed_at as string;
  if (row.output) job.output = row.output as string;
  if (row.error) job.error = row.error as string;
  if (row.current_step != null) job.currentStep = row.current_step as number;
  if (row.total_steps != null) job.totalSteps = row.total_steps as number;
  if (row.step_label) job.stepLabel = row.step_label as string;
  return job;
}

export function saveJob(job: JobStatus): void {
  activeJobs.set(job.id, job);
  const database = getDb();
  const r = jobToRow(job);
  database
    .prepare(
      `INSERT INTO content_jobs (id, status, started_at, completed_at, output, error, command, current_step, total_steps, step_label)
       VALUES (@id, @status, @started_at, @completed_at, @output, @error, @command, @current_step, @total_steps, @step_label)
       ON CONFLICT(id) DO UPDATE SET
         status = @status,
         completed_at = @completed_at,
         output = @output,
         error = @error,
         current_step = @current_step,
         total_steps = @total_steps,
         step_label = @step_label`
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
         step_label = @step_label
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
