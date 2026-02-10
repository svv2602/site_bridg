import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { createRateLimiter } from '@/lib/rate-limit';

// Rate limiter: max 30 requests per minute per IP
const sizesLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60 * 1000 });

interface UniqueSize {
  width: number;
  height: number;
  diameter: number;
  count: number;
}

/**
 * GET /api/tyres/sizes
 * Отримати унікальні розміри шин з бази автомобілів
 * Query params:
 *   - type: 'width' | 'height' | 'diameter' | 'all' (default: 'all')
 *   - width: filter by width (for height/diameter)
 *   - height: filter by height (for diameter)
 */
/** Parse a numeric query param, returning null if missing or NaN */
function parseIntParam(value: string | null): number | null {
  if (value === null) return null;
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? null : num;
}

const VALID_TYPES = new Set(['width', 'height', 'diameter', 'all']);

export async function GET(request: Request) {
  try {
    // Rate limiting: max 30 requests per minute per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    if (!sizesLimiter.check(ip)) {
      return NextResponse.json(
        { error: 'Забагато запитів. Спробуйте через хвилину.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const widthRaw = searchParams.get('width');
    const heightRaw = searchParams.get('height');

    // Validate type parameter
    if (!VALID_TYPES.has(type)) {
      return NextResponse.json(
        { error: 'Невірний параметр type. Допустимі значення: width, height, diameter, all' },
        { status: 400 }
      );
    }

    // Parse and validate numeric params
    const width = parseIntParam(widthRaw);
    const height = parseIntParam(heightRaw);

    if (widthRaw !== null && width === null) {
      return NextResponse.json(
        { error: 'Параметр width повинен бути числом' },
        { status: 400 }
      );
    }

    if (heightRaw !== null && height === null) {
      return NextResponse.json(
        { error: 'Параметр height повинен бути числом' },
        { status: 400 }
      );
    }

    if (type === 'width') {
      // Унікальні ширини
      const rows = await query<{ width: number; count: string }>(`
        SELECT DISTINCT width, COUNT(*) as count
        FROM car_kit_tyre_sizes
        WHERE width >= 135 AND width <= 335
        GROUP BY width
        ORDER BY width
      `);

      return NextResponse.json({
        data: rows.map(r => ({ value: Math.round(r.width), count: parseInt(r.count) }))
      });
    }

    if (type === 'height') {
      // Унікальні висоти профілю (для вибраної ширини)
      let sql = `
        SELECT DISTINCT height, COUNT(*) as count
        FROM car_kit_tyre_sizes
        WHERE height >= 25 AND height <= 85
      `;
      const params: number[] = [];

      if (width !== null) {
        sql += ` AND width = $1`;
        params.push(width);
      }

      sql += ` GROUP BY height ORDER BY height`;

      const rows = await query<{ height: number; count: string }>(sql, params);

      return NextResponse.json({
        data: rows.map(r => ({ value: Math.round(r.height), count: parseInt(r.count) }))
      });
    }

    if (type === 'diameter') {
      // Унікальні діаметри (для вибраної ширини та висоти)
      let sql = `
        SELECT DISTINCT diameter, COUNT(*) as count
        FROM car_kit_tyre_sizes
        WHERE diameter >= 12 AND diameter <= 24
      `;
      const params: number[] = [];
      let paramIdx = 1;

      if (width !== null) {
        sql += ` AND width = $${paramIdx++}`;
        params.push(width);
      }
      if (height !== null) {
        sql += ` AND height = $${paramIdx++}`;
        params.push(height);
      }

      sql += ` GROUP BY diameter ORDER BY diameter`;

      const rows = await query<{ diameter: number; count: string }>(sql, params);

      return NextResponse.json({
        data: rows.map(r => ({ value: Math.round(r.diameter), count: parseInt(r.count) }))
      });
    }

    // type === 'all' - повертаємо всі унікальні комбінації (топ 100)
    const rows = await query<UniqueSize>(`
      SELECT width, height, diameter, COUNT(*) as count
      FROM car_kit_tyre_sizes
      GROUP BY width, height, diameter
      ORDER BY count DESC
      LIMIT 100
    `);

    return NextResponse.json({
      data: rows.map(r => ({
        width: Math.round(r.width),
        height: Math.round(r.height),
        diameter: Math.round(r.diameter),
        count: r.count
      }))
    });

  } catch (error) {
    console.error('Error fetching tyre sizes:', error);
    return NextResponse.json(
      { error: 'Помилка завантаження розмірів' },
      { status: 500 }
    );
  }
}
