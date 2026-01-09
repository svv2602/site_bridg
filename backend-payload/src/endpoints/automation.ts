import type { Request, Response, NextFunction } from 'express';
import { getSchedulerStatus } from '../automation/jobs/scheduler';

// GET /api/automation/status
export async function getAutomationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const status = getSchedulerStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
}

// POST /api/automation/run
export async function triggerAutomation(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.body;

    switch (type) {
      case 'full':
        // TODO: runWeeklyAutomation().catch(console.error);
        res.json({ success: true, message: 'Started full automation' });
        break;
      case 'scrape':
        // TODO: runScrapeOnly().catch(console.error);
        res.json({ success: true, message: 'Started scrape' });
        break;
      case 'generate':
        // TODO: runGenerateOnly().catch(console.error);
        res.json({ success: true, message: 'Started generation' });
        break;
      default:
        res.status(400).json({ error: 'Invalid type. Use: full, scrape, or generate' });
    }
  } catch (error) {
    next(error);
  }
}

// GET /api/automation/stats
export async function getAutomationStats(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: Get real stats from database
    const stats = {
      tiresProcessed: 0,
      articlesCreated: 0,
      badgesAssigned: 0,
      totalCost: 0,
      errorCount: 0,
      lastRun: null,
      nextRun: getSchedulerStatus().nextRun,
    };
    res.json(stats);
  } catch (error) {
    next(error);
  }
}
