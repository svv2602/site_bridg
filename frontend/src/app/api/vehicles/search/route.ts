import { NextResponse } from 'next/server';
import { searchVehicleTyres } from '@/lib/api/vehicles';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Кешувати 1 годину

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kitId = searchParams.get('kitId');

    if (!kitId) {
      return NextResponse.json(
        { data: null, error: 'kitId є обов\'язковим параметром' },
        { status: 400 }
      );
    }

    const kitIdNum = parseInt(kitId, 10);
    if (isNaN(kitIdNum)) {
      return NextResponse.json(
        { data: null, error: 'kitId має бути числом' },
        { status: 400 }
      );
    }

    const result = await searchVehicleTyres(kitIdNum);

    if (!result) {
      return NextResponse.json(
        { data: null, error: 'Комплектацію не знайдено' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error searching vehicle tyres:', error);
    return NextResponse.json(
      { data: null, error: 'Помилка пошуку шин' },
      { status: 500 }
    );
  }
}
