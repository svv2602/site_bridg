import { Pool, PoolClient } from 'pg';

// Singleton пул підключень до PostgreSQL для бази автомобілів
let pool: Pool | null = null;

export function getVehiclesPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.VEHICLES_DB_HOST || 'localhost',
      port: parseInt(process.env.VEHICLES_DB_PORT || '5433'),
      database: process.env.VEHICLES_DB_NAME || 'bridgestone_vehicles',
      user: process.env.VEHICLES_DB_USER || 'snisar',
      password: process.env.VEHICLES_DB_PASSWORD || 'bridgestone123',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Vehicles DB pool error:', err);
    });
  }

  return pool;
}

/**
 * Виконання SQL запиту
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getVehiclesPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/**
 * Виконання SQL без повернення результату
 */
export async function execute(text: string, params?: unknown[]): Promise<void> {
  const pool = getVehiclesPool();
  await pool.query(text, params);
}

/**
 * Отримання клієнта для транзакцій
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getVehiclesPool();
  return pool.connect();
}

/**
 * Закриття пулу
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

/**
 * Створення бази даних якщо не існує
 */
export async function ensureDatabase(): Promise<void> {
  const tempPool = new Pool({
    host: process.env.VEHICLES_DB_HOST || 'localhost',
    port: parseInt(process.env.VEHICLES_DB_PORT || '5433'),
    database: 'postgres',
    user: process.env.VEHICLES_DB_USER || 'snisar',
    password: process.env.VEHICLES_DB_PASSWORD || 'bridgestone123',
  });

  try {
    const dbName = process.env.VEHICLES_DB_NAME || 'bridgestone_vehicles';
    const result = await tempPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      await tempPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created`);
    }
  } finally {
    await tempPool.end();
  }
}
