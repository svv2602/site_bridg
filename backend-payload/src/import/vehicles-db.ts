import { Pool, PoolClient } from 'pg';

// Singleton пул підключень до PostgreSQL для бази автомобілів
let pool: Pool | null = null;

/**
 * Отримання конфігурації БД з environment variables
 * Всі credentials повинні бути в .env файлі
 */
function getDbConfig() {
  const host = process.env.VEHICLES_DB_HOST || 'localhost';
  const port = parseInt(process.env.VEHICLES_DB_PORT || '5433');
  const database = process.env.VEHICLES_DB_NAME || 'bridgestone_vehicles';
  const user = process.env.VEHICLES_DB_USER;
  const password = process.env.VEHICLES_DB_PASSWORD;

  // Validation: credentials required in production
  if (process.env.NODE_ENV === 'production' && (!user || !password)) {
    throw new Error(
      'VEHICLES_DB_USER and VEHICLES_DB_PASSWORD environment variables are required in production'
    );
  }

  return { host, port, database, user, password };
}

export function getVehiclesPool(): Pool {
  if (!pool) {
    const config = getDbConfig();
    pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
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
  const config = getDbConfig();
  const tempPool = new Pool({
    host: config.host,
    port: config.port,
    database: 'postgres',
    user: config.user,
    password: config.password,
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
