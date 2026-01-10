import { NextResponse } from 'next/server';
import { getProgress, getDbStats } from '../../../../import/importer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const progress = getProgress();
    const dbStats = await getDbStats();

    return NextResponse.json({
      progress,
      dbStats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get status' },
      { status: 500 }
    );
  }
}
