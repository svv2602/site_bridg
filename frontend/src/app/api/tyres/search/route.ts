import { NextResponse } from 'next/server';
import { searchTyresBySize } from '@/lib/api/tyres';
import { createRateLimiter } from '@/lib/rate-limit';

// Rate limiter: max 30 search requests per minute per IP
const searchLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60 * 1000 });

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
    // Rate limiting: max 30 requests per minute per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    if (!searchLimiter.check(ip)) {
      return NextResponse.json(
        { error: 'Забагато запитів. Спробуйте через хвилину.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    const diameter = searchParams.get('diameter');
    const seasonRaw = searchParams.get('season');

    if (!width || !height || !diameter) {
      return NextResponse.json(
        { error: 'Вкажіть width, height та diameter' },
        { status: 400 }
      );
    }

    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    const d = parseInt(diameter, 10);

    if (Number.isNaN(w) || Number.isNaN(h) || Number.isNaN(d)) {
      return NextResponse.json(
        { error: 'Параметри width, height та diameter повинні бути числами' },
        { status: 400 }
      );
    }

    // Validate season enum
    const VALID_SEASONS = ['summer', 'winter', 'allseason'] as const;
    type Season = typeof VALID_SEASONS[number];
    let season: Season | undefined;

    if (seasonRaw) {
      if (!VALID_SEASONS.includes(seasonRaw as Season)) {
        return NextResponse.json(
          { error: 'Невірне значення season. Допустимі: summer, winter, allseason' },
          { status: 400 }
        );
      }
      season = seasonRaw as Season;
    }

    // Пошук через Payload API (з fallback на mock дані)
    const matchingTyres = await searchTyresBySize({
      width: w,
      aspectRatio: h,
      diameter: d,
      season,
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
