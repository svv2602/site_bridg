import { NextResponse } from 'next/server';
import { getCarModels, searchModels } from '@/lib/api/vehicles';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Кешувати 24 години

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const search = searchParams.get('search');

    if (!brandId) {
      return NextResponse.json(
        { data: [], error: 'brandId є обов\'язковим параметром' },
        { status: 400 }
      );
    }

    const brandIdNum = parseInt(brandId, 10);
    if (isNaN(brandIdNum)) {
      return NextResponse.json(
        { data: [], error: 'brandId має бути числом' },
        { status: 400 }
      );
    }

    let models;
    if (search && search.length >= 2) {
      models = await searchModels(brandIdNum, search);
    } else {
      models = await getCarModels(brandIdNum);
    }

    return NextResponse.json({ data: models });
  } catch (error) {
    console.error('Error fetching car models:', error);
    return NextResponse.json(
      { data: [], error: 'Помилка завантаження моделей' },
      { status: 500 }
    );
  }
}
