import { NextResponse } from 'next/server';
import { getCarKits } from '@/lib/api/vehicles';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Кешувати 1 годину

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    const year = searchParams.get('year');

    if (!modelId || !year) {
      return NextResponse.json(
        { data: [], error: 'modelId та year є обов\'язковими параметрами' },
        { status: 400 }
      );
    }

    const modelIdNum = parseInt(modelId, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(modelIdNum) || isNaN(yearNum)) {
      return NextResponse.json(
        { data: [], error: 'modelId та year мають бути числами' },
        { status: 400 }
      );
    }

    const kits = await getCarKits(modelIdNum, yearNum);

    return NextResponse.json({ data: kits });
  } catch (error) {
    console.error('Error fetching car kits:', error);
    return NextResponse.json(
      { data: [], error: 'Помилка завантаження комплектацій' },
      { status: 500 }
    );
  }
}
