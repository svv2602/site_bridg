import { NextResponse } from 'next/server';
import { getTyreSizes } from '@/lib/api/vehicles';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Кешувати 1 годину

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kitId = searchParams.get('kitId');

    if (!kitId) {
      return NextResponse.json(
        { data: { oem: [], tuning: [] }, error: 'kitId є обов\'язковим параметром' },
        { status: 400 }
      );
    }

    const kitIdNum = parseInt(kitId, 10);
    if (isNaN(kitIdNum)) {
      return NextResponse.json(
        { data: { oem: [], tuning: [] }, error: 'kitId має бути числом' },
        { status: 400 }
      );
    }

    const tyreSizes = await getTyreSizes(kitIdNum);

    return NextResponse.json({ data: tyreSizes });
  } catch (error) {
    console.error('Error fetching tyre sizes:', error);
    return NextResponse.json(
      { data: { oem: [], tuning: [] }, error: 'Помилка завантаження розмірів шин' },
      { status: 500 }
    );
  }
}
