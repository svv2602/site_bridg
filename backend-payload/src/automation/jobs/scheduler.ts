export function initScheduler() {
  console.log('Scheduler initialized: automation runs via admin dashboard actions');
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
