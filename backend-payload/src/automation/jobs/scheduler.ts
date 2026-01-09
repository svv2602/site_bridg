import cron from 'node-cron';
// import { runWeeklyAutomation } from './weekly-automation';
// import { notify } from '../publishers/telegram-bot';

export function initScheduler() {
  console.log('🕐 Initializing scheduler...');

  // Weekly automation: Sunday at 03:00
  cron.schedule('0 3 * * 0', async () => {
    console.log('Starting weekly automation...');
    try {
      // TODO: Uncomment when automation is fully integrated
      // await notify({ type: 'info', message: '🕐 Починаю щотижневу автоматизацію...' });
      // await runWeeklyAutomation();
      console.log('Weekly automation completed');
    } catch (error) {
      console.error('Automation failed:', error);
      // await notify({ type: 'error', message: `❌ Помилка: ${error}` });
    }
  }, {
    timezone: 'Europe/Kyiv'
  });

  console.log('✅ Scheduler initialized: Weekly automation at Sunday 03:00 Kyiv time');
}

export function getSchedulerStatus() {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(3, 0, 0, 0);

  return {
    status: 'running',
    nextRun: nextSunday.toISOString(),
    timezone: 'Europe/Kyiv'
  };
}
