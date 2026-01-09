import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    tiresProcessed: 0,
    articlesCreated: 0,
    badgesAssigned: 0,
    totalCost: 0,
    errorCount: 0,
    lastRun: null,
  })
}
