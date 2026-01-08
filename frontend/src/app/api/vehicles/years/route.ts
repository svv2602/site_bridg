import { NextResponse } from 'next/server';
import { getModelYears } from '@/lib/api/vehicles';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Кешувати 1 годину

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json(
        { data: [], error: 'modelId є обов\'язковим параметром' },
        { status: 400 }
      );
    }

    const modelIdNum = parseInt(modelId, 10);
    if (isNaN(modelIdNum)) {
      return NextResponse.json(
        { data: [], error: 'modelId має бути числом' },
        { status: 400 }
      );
    }

    const years = await getModelYears(modelIdNum);

    return NextResponse.json({ data: years });
  } catch (error) {
    console.error('Error fetching model years:', error);
    return NextResponse.json(
      { data: [], error: 'Помилка завантаження років випуску' },
      { status: 500 }
    );
  }
}
