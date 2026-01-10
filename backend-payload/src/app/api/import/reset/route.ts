import { NextResponse } from 'next/server';
import { resetTables, isImportRunning } from '../../../../import/importer';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Перевіряємо чи не йде імпорт
    if (isImportRunning()) {
      return NextResponse.json(
        { error: 'Cannot reset while import is in progress' },
        { status: 409 }
      );
    }

    await resetTables();

    return NextResponse.json({
      success: true,
      message: 'Tables reset successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset tables' },
      { status: 500 }
    );
  }
}
