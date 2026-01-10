import { NextResponse } from 'next/server';
import { runImport, isImportRunning, getProgress } from '../../../../import/importer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Перевіряємо чи не йде вже імпорт
    if (isImportRunning()) {
      return NextResponse.json(
        { error: 'Import already in progress', progress: getProgress() },
        { status: 409 }
      );
    }

    // Отримуємо параметри з body
    let minYear = 2005;
    try {
      const body = await request.json();
      if (body.minYear) {
        minYear = parseInt(body.minYear);
      }
    } catch {
      // Body is optional
    }

    // Запускаємо імпорт у фоні
    runImport({ minYear }).catch((err) => {
      console.error('Import failed:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Import started',
      minYear,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start import' },
      { status: 500 }
    );
  }
}
