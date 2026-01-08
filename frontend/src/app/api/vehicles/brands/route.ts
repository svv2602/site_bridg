import { NextResponse } from 'next/server';
import { getCarBrands, searchBrands } from '@/lib/api/vehicles';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Кешувати 24 години

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let brands;
    if (search && search.length >= 2) {
      brands = await searchBrands(search);
    } else {
      brands = await getCarBrands();
    }

    return NextResponse.json({ data: brands });
  } catch (error) {
    console.error('Error fetching car brands:', error);
    return NextResponse.json(
      { data: [], error: 'Помилка завантаження марок автомобілів' },
      { status: 500 }
    );
  }
}
