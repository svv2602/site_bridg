import { NextResponse } from 'next/server'

export async function GET() {
  const now = new Date()
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7
  const nextSunday = new Date(now)
  nextSunday.setDate(now.getDate() + daysUntilSunday)
  nextSunday.setHours(3, 0, 0, 0)

  return NextResponse.json({
    status: 'running',
    nextRun: nextSunday.toISOString(),
    timezone: 'Europe/Kyiv',
  })
}
