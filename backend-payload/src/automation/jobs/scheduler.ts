import cron, { type ScheduledTask } from 'node-cron';
import Database from 'better-sqlite3';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { saveJob, updateJob, type JobStatus } from '../../endpoints/jobStore';

const execAsync = promisify(exec);

// ---- SQLite config persistence ----

function getDbPath(): string {
  return process.env.SQLITE_PATH
    || path.join(process.cwd(), 'content-automation', 'data', 'content-automation.db');
}

function getDb(): Database.Database {
  const db = new Database(getDbPath());
  db.exec(`
    CREATE TABLE IF NOT EXISTS scheduler_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER NOT NULL DEFAULT 0,
      cron_expression TEXT NOT NULL DEFAULT '0 3 * * 0',
      timezone TEXT NOT NULL DEFAULT 'Europe/Kyiv'
    )
  `);
  return db;
}

interface SchedulerConfig {
  enabled: boolean;
  cronExpression: string;
  timezone: string;
}

function readConfig(): SchedulerConfig {
  const db = getDb();
  try {
    const row = db
      .prepare('SELECT enabled, cron_expression, timezone FROM scheduler_config WHERE id = 1')
      .get() as { enabled: number; cron_expression: string; timezone: string } | undefined;

    if (!row) {
      // Insert default row
      db.prepare(
        `INSERT OR IGNORE INTO scheduler_config (id, enabled, cron_expression, timezone) VALUES (1, 0, '0 3 * * 0', 'Europe/Kyiv')`
      ).run();
      return { enabled: false, cronExpression: '0 3 * * 0', timezone: 'Europe/Kyiv' };
    }

    return {
      enabled: row.enabled === 1,
      cronExpression: row.cron_expression,
      timezone: row.timezone,
    };
  } finally {
    db.close();
  }
}

function writeConfig(config: SchedulerConfig): void {
  const db = getDb();
  try {
    db.prepare(
      `INSERT INTO scheduler_config (id, enabled, cron_expression, timezone)
       VALUES (1, @enabled, @cron_expression, @timezone)
       ON CONFLICT(id) DO UPDATE SET
         enabled = @enabled,
         cron_expression = @cron_expression,
         timezone = @timezone`
    ).run({
      enabled: config.enabled ? 1 : 0,
      cron_expression: config.cronExpression,
      timezone: config.timezone,
    });
  } finally {
    db.close();
  }
}

// ---- Cron job management ----

let activeTask: ScheduledTask | null = null;
let currentConfig: SchedulerConfig = {
  enabled: false,
  cronExpression: '0 3 * * 0',
  timezone: 'Europe/Kyiv',
};

function stopCron(): void {
  if (activeTask) {
    activeTask.stop();
    activeTask = null;
  }
}

function startCron(): void {
  stopCron();

  if (!currentConfig.enabled) return;
  if (!cron.validate(currentConfig.cronExpression)) {
    console.error(`[Scheduler] Invalid cron expression: ${currentConfig.cronExpression}`);
    return;
  }

  activeTask = cron.schedule(
    currentConfig.cronExpression,
    () => {
      runScheduledPipeline().catch((err) => {
        console.error('[Scheduler] Unhandled error in cron callback:', err);
      });
    },
    {
      timezone: currentConfig.timezone,
    }
  );

  console.log(`[Scheduler] Cron started: "${currentConfig.cronExpression}" (${currentConfig.timezone})`);
}

async function runScheduledPipeline(): Promise<void> {
  const automationDir = path.join(process.cwd(), 'content-automation');

  const scrapeCmd = 'npx tsx src/scrapers/prokoleso.ts';
  const importCmd = 'npx tsx src/import-tyres.ts';
  const generateCmd = 'npx tsx src/index.ts --generate';
  const fullCommand = `${scrapeCmd} && ${importCmd} && ${generateCmd}`;

  const steps = [
    { cmd: scrapeCmd, label: 'Скрапінг', step: 1 },
    { cmd: importCmd, label: 'Імпорт', step: 2 },
    { cmd: generateCmd, label: 'Генерація', step: 3 },
  ];

  const jobId = `cron-${Date.now()}`;
  const job: JobStatus = {
    id: jobId,
    status: 'running',
    startedAt: new Date().toISOString(),
    command: fullCommand,
    currentStep: 1,
    totalSteps: 3,
    stepLabel: steps[0].label,
  };
  saveJob(job);

  console.log(`[Scheduler] Cron triggered pipeline job ${jobId}`);

  let allOutput = '';
  for (const { cmd, label, step } of steps) {
    job.currentStep = step;
    job.stepLabel = label;
    updateJob(job);
    try {
      const { stdout, stderr } = await execAsync(cmd, {
        cwd: automationDir,
        timeout: 600000, // 10 min per step
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
      console.error(`[Scheduler] Pipeline failed at step "${label}": ${err.message}`);
      return;
    }
  }

  job.status = 'completed';
  job.completedAt = new Date().toISOString();
  job.output = allOutput;
  updateJob(job);
  console.log(`[Scheduler] Pipeline completed: ${jobId}`);
}

// ---- Next-run calculation ----

function getNextRun(): string | null {
  if (!activeTask || !currentConfig.enabled) {
    return null;
  }

  try {
    const nextDate = activeTask.getNextRun();
    return nextDate ? nextDate.toISOString() : null;
  } catch {
    return null;
  }
}

// ---- Public API ----

export interface SchedulerStatus {
  status: 'running' | 'idle';
  enabled: boolean;
  cronExpression: string;
  nextRun: string | null;
  timezone: string;
}

export function initScheduler(): void {
  try {
    currentConfig = readConfig();
    if (currentConfig.enabled) {
      startCron();
    }
    console.log(`[Scheduler] Initialized (enabled=${currentConfig.enabled}, cron="${currentConfig.cronExpression}")`);
  } catch (error) {
    console.error('[Scheduler] Failed to initialize:', error);
  }
}

export function getSchedulerStatus(): SchedulerStatus {
  return {
    status: activeTask ? 'running' : 'idle',
    enabled: currentConfig.enabled,
    cronExpression: currentConfig.cronExpression,
    nextRun: getNextRun(),
    timezone: currentConfig.timezone,
  };
}

export function setSchedulerConfig(update: {
  enabled?: boolean;
  cronExpression?: string;
}): { success: boolean; error?: string; status: SchedulerStatus } {
  if (update.cronExpression !== undefined) {
    if (!cron.validate(update.cronExpression)) {
      return {
        success: false,
        error: `Невалідний cron вираз: "${update.cronExpression}"`,
        status: getSchedulerStatus(),
      };
    }
    currentConfig.cronExpression = update.cronExpression;
  }

  if (update.enabled !== undefined) {
    currentConfig.enabled = update.enabled;
  }

  // Persist to DB
  writeConfig(currentConfig);

  // Restart cron with new config
  if (currentConfig.enabled) {
    startCron();
  } else {
    stopCron();
  }

  return { success: true, status: getSchedulerStatus() };
}
