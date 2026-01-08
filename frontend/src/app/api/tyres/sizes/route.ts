import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

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
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const width = searchParams.get('width');
    const height = searchParams.get('height');

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

      if (width) {
        sql += ` AND width = $1`;
        params.push(parseInt(width));
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

      if (width) {
        sql += ` AND width = $${paramIdx++}`;
        params.push(parseInt(width));
      }
      if (height) {
        sql += ` AND height = $${paramIdx++}`;
        params.push(parseInt(height));
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
