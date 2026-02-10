import { NextResponse } from 'next/server';
import { searchVehicleTyres } from '@/lib/api/vehicles';
import { createRateLimiter } from '@/lib/rate-limit';

// Rate limiter: max 30 requests per minute per IP
const vehicleSearchLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60 * 1000 });

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Rate limiting: max 30 requests per minute per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    if (!vehicleSearchLimiter.check(ip)) {
      return NextResponse.json(
        { data: null, error: 'Забагато запитів. Спробуйте через хвилину.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const kitId = searchParams.get('kitId');
    const season = searchParams.get('season') || undefined;

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

    const result = await searchVehicleTyres(kitIdNum, season);

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
