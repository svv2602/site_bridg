import { Pool, PoolClient } from 'pg';

// Singleton пул підключень до PostgreSQL
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    // Підтримка DATABASE_URL або socket connection
    const connectionString = process.env.DATABASE_URL;

    const config = connectionString
      ? { connectionString }
      : {
          host: '/var/run/postgresql',
          port: 5433,
          database: 'bridgestone_vehicles',
        };

    pool = new Pool({
      ...config,
      max: 20, // Максимум підключень
      idleTimeoutMillis: 30000, // Закривати неактивні через 30 сек
      connectionTimeoutMillis: 2000, // Таймаут підключення 2 сек
    });

    // Логування помилок пулу
    pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
    });
  }

  return pool;
}

/**
 * Виконання SQL запиту з автоматичним підключенням
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/**
 * Виконання одного запиту з поверненням першого рядка
 */
export async function queryOne<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * Отримання клієнта для транзакцій
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * Закриття пулу (для graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Перевірка підключення до БД
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
