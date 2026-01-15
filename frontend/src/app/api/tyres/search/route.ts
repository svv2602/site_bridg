import { NextResponse } from 'next/server';
import { searchTyresBySize } from '@/lib/api/tyres';

/**
 * GET /api/tyres/search
 * Пошук шин Bridgestone за розміром
 * Query params:
 *   - width: ширина (обов'язково)
 *   - height: висота профілю (обов'язково)
 *   - diameter: діаметр (обов'язково)
 *   - season: сезон (опційно: summer, winter, allseason)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    const diameter = searchParams.get('diameter');
    const season = searchParams.get('season') as 'summer' | 'winter' | 'allseason' | null;

    if (!width || !height || !diameter) {
      return NextResponse.json(
        { error: 'Вкажіть width, height та diameter' },
        { status: 400 }
      );
    }

    const w = parseInt(width);
    const h = parseInt(height);
    const d = parseInt(diameter);

    // Пошук через Strapi API (з fallback на mock дані)
    const matchingTyres = await searchTyresBySize({
      width: w,
      aspectRatio: h,
      diameter: d,
      season: season || undefined,
    });

    return NextResponse.json({
      data: {
        searchedSize: `${w}/${h} R${d}`,
        totalFound: matchingTyres.length,
        tyres: matchingTyres,
      }
    });

  } catch (error) {
    console.error('Error searching tyres:', error);
    return NextResponse.json(
      { error: 'Помилка пошуку шин' },
      { status: 500 }
    );
  }
}
