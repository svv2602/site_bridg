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
    CREATE TABLE IF NOT EXISTS scheduler_tasks (
      task_id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      command TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,
      cron_expression TEXT NOT NULL DEFAULT '0 3 * * 0',
      timezone TEXT NOT NULL DEFAULT 'Europe/Kyiv'
    )
  `);
  return db;
}

interface TaskConfig {
  taskId: string;
  label: string;
  command: string;
  enabled: boolean;
  cronExpression: string;
  timezone: string;
}

const DEFAULT_TASKS: TaskConfig[] = [
  {
    taskId: 'pipeline',
    label: 'Повний цикл',
    command: 'scrape && import && generate',
    enabled: false,
    cronExpression: '0 3 * * 0',
    timezone: 'Europe/Kyiv',
  },
  {
    taskId: 'articles',
    label: 'Генерація статей',
    command: 'generate-articles',
    enabled: false,
    cronExpression: '0 4 * * 1',
    timezone: 'Europe/Kyiv',
  },
  {
    taskId: 'smart-articles',
    label: 'Розумна генерація статей',
    command: 'smart-article-pipeline',
    enabled: false,
    cronExpression: '0 5 * * 3',
    timezone: 'Europe/Kyiv',
  },
];

function readAllConfigs(): TaskConfig[] {
  const db = getDb();
  try {
    // Seed defaults if missing
    const insert = db.prepare(
      `INSERT OR IGNORE INTO scheduler_tasks (task_id, label, command, enabled, cron_expression, timezone)
       VALUES (@task_id, @label, @command, @enabled, @cron_expression, @timezone)`
    );
    for (const t of DEFAULT_TASKS) {
      insert.run({
        task_id: t.taskId,
        label: t.label,
        command: t.command,
        enabled: t.enabled ? 1 : 0,
        cron_expression: t.cronExpression,
        timezone: t.timezone,
      });
    }

    const rows = db
      .prepare('SELECT task_id, label, command, enabled, cron_expression, timezone FROM scheduler_tasks')
      .all() as Array<{
        task_id: string;
        label: string;
        command: string;
        enabled: number;
        cron_expression: string;
        timezone: string;
      }>;

    return rows.map((row) => ({
      taskId: row.task_id,
      label: row.label,
      command: row.command,
      enabled: row.enabled === 1,
      cronExpression: row.cron_expression,
      timezone: row.timezone,
    }));
  } finally {
    db.close();
  }
}

function writeTaskConfig(config: TaskConfig): void {
  const db = getDb();
  try {
    db.prepare(
      `INSERT INTO scheduler_tasks (task_id, label, command, enabled, cron_expression, timezone)
       VALUES (@task_id, @label, @command, @enabled, @cron_expression, @timezone)
       ON CONFLICT(task_id) DO UPDATE SET
         enabled = @enabled,
         cron_expression = @cron_expression,
         timezone = @timezone`
    ).run({
      task_id: config.taskId,
      label: config.label,
      command: config.command,
      enabled: config.enabled ? 1 : 0,
      cron_expression: config.cronExpression,
      timezone: config.timezone,
    });
  } finally {
    db.close();
  }
}

// ---- Cron job management (multi-task) ----

const activeTasks = new Map<string, ScheduledTask>();
const taskConfigs = new Map<string, TaskConfig>();

function stopTaskCron(taskId: string): void {
  const task = activeTasks.get(taskId);
  if (task) {
    task.stop();
    activeTasks.delete(taskId);
  }
}

function startTaskCron(taskId: string): void {
  stopTaskCron(taskId);

  const config = taskConfigs.get(taskId);
  if (!config || !config.enabled) return;
  if (!cron.validate(config.cronExpression)) {
    console.error(`[Scheduler] Invalid cron expression for "${taskId}": ${config.cronExpression}`);
    return;
  }

  const callback = getTaskCallback(taskId);
  const scheduled = cron.schedule(
    config.cronExpression,
    () => {
      callback().catch((err) => {
        console.error(`[Scheduler] Unhandled error in cron callback for "${taskId}":`, err);
      });
    },
    { timezone: config.timezone },
  );

  activeTasks.set(taskId, scheduled);
  console.log(`[Scheduler] Cron started for "${taskId}": "${config.cronExpression}" (${config.timezone})`);
}

function getTaskCallback(taskId: string): () => Promise<void> {
  switch (taskId) {
    case 'pipeline':
      return runScheduledPipeline;
    case 'articles':
      return runScheduledArticles;
    case 'smart-articles':
      return runScheduledSmartArticles;
    default:
      return async () => {
        console.warn(`[Scheduler] No callback defined for task "${taskId}"`);
      };
  }
}

// ---- Pipeline runner ----

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

  const jobId = `cron-pipeline-${Date.now()}`;
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

// ---- Articles runner ----

async function runScheduledArticles(): Promise<void> {
  const automationDir = path.join(process.cwd(), 'content-automation');
  const command = 'npx tsx src/generate-articles.ts';

  const jobId = `cron-articles-${Date.now()}`;
  const job: JobStatus = {
    id: jobId,
    status: 'running',
    startedAt: new Date().toISOString(),
    command,
  };
  saveJob(job);

  console.log(`[Scheduler] Cron triggered articles job ${jobId}`);

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: automationDir,
      timeout: 600000,
      env: { ...process.env },
    });
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
    updateJob(job);
    console.log(`[Scheduler] Articles completed: ${jobId}`);
  } catch (error: unknown) {
    const err = error as { message: string; stdout?: string };
    job.status = 'failed';
    job.completedAt = new Date().toISOString();
    job.error = err.message;
    job.output = err.stdout || '';
    updateJob(job);
    console.error(`[Scheduler] Articles failed: ${err.message}`);
  }
}

// ---- Smart Articles runner ----

async function runScheduledSmartArticles(): Promise<void> {
  const automationDir = path.join(process.cwd(), 'content-automation');
  const command = 'npx tsx src/article-pipeline.ts';

  const jobId = `cron-smart-articles-${Date.now()}`;
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

  console.log(`[Scheduler] Cron triggered smart-articles job ${jobId}`);

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: automationDir,
      timeout: 900000, // 15 minutes (scan + plan + generate)
      env: { ...process.env },
    });
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
    updateJob(job);
    console.log(`[Scheduler] Smart articles completed: ${jobId}`);
  } catch (error: unknown) {
    const err = error as { message: string; stdout?: string };
    job.status = 'failed';
    job.completedAt = new Date().toISOString();
    job.error = err.message;
    job.output = err.stdout || '';
    updateJob(job);
    console.error(`[Scheduler] Smart articles failed: ${err.message}`);
  }
}

// ---- Next-run calculation ----

function getTaskNextRun(taskId: string): string | null {
  const task = activeTasks.get(taskId);
  const config = taskConfigs.get(taskId);
  if (!task || !config?.enabled) return null;

  try {
    const nextDate = task.getNextRun();
    return nextDate ? nextDate.toISOString() : null;
  } catch {
    return null;
  }
}

// ---- Public API ----

export interface TaskSchedule {
  taskId: string;
  label: string;
  enabled: boolean;
  cronExpression: string;
  nextRun: string | null;
  timezone: string;
}

export function initScheduler(): void {
  try {
    const configs = readAllConfigs();
    for (const config of configs) {
      taskConfigs.set(config.taskId, config);
      if (config.enabled) {
        startTaskCron(config.taskId);
      }
    }
    const summary = configs.map((c) => `${c.taskId}(enabled=${c.enabled})`).join(', ');
    console.log(`[Scheduler] Initialized tasks: ${summary}`);
  } catch (error) {
    console.error('[Scheduler] Failed to initialize:', error);
  }
}

export function getSchedulerStatus(): TaskSchedule[] {
  const result: TaskSchedule[] = [];
  for (const config of taskConfigs.values()) {
    result.push({
      taskId: config.taskId,
      label: config.label,
      enabled: config.enabled,
      cronExpression: config.cronExpression,
      nextRun: getTaskNextRun(config.taskId),
      timezone: config.timezone,
    });
  }
  return result;
}

export function setSchedulerConfig(update: {
  taskId: string;
  enabled?: boolean;
  cronExpression?: string;
}): { success: boolean; error?: string; tasks: TaskSchedule[] } {
  const config = taskConfigs.get(update.taskId);
  if (!config) {
    return {
      success: false,
      error: `Невідоме завдання: "${update.taskId}"`,
      tasks: getSchedulerStatus(),
    };
  }

  if (update.cronExpression !== undefined) {
    if (!cron.validate(update.cronExpression)) {
      return {
        success: false,
        error: `Невалідний cron вираз: "${update.cronExpression}"`,
        tasks: getSchedulerStatus(),
      };
    }
    config.cronExpression = update.cronExpression;
  }

  if (update.enabled !== undefined) {
    config.enabled = update.enabled;
  }

  // Persist to DB
  writeTaskConfig(config);
  taskConfigs.set(update.taskId, config);

  // Restart cron with new config
  if (config.enabled) {
    startTaskCron(update.taskId);
  } else {
    stopTaskCron(update.taskId);
  }

  return { success: true, tasks: getSchedulerStatus() };
}
