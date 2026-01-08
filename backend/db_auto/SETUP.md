# Налаштування бази даних автомобілів

## Передумови

- PostgreSQL 14+ встановлений та запущений
- Node.js 18+
- npm або yarn

## Крок 1: Створення бази даних

```bash
# Підключіться до PostgreSQL
sudo -u postgres psql

# Створіть базу даних
CREATE DATABASE bridgestone_vehicles;

# Створіть користувача (опціонально)
CREATE USER bridgestone WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bridgestone_vehicles TO bridgestone;

# Вийдіть
\q
```

## Крок 2: Створення схеми

```bash
cd db_auto
psql -d bridgestone_vehicles -f schema.sql
```

Або з користувачем:
```bash
psql -U bridgestone -d bridgestone_vehicles -f schema.sql
```

## Крок 3: Імпорт даних

```bash
# Встановіть залежності для скрипта імпорту
npm install pg

# Встановіть змінну оточення
export DATABASE_URL="postgresql://bridgestone:your_password@localhost:5432/bridgestone_vehicles"

# Запустіть імпорт
node import-to-postgres.js
```

Очікуваний результат:
```
🚗 Імпорт бази даних автомобілів Bridgestone Ukraine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Імпорт марок автомобілів...
   ✓ Імпортовано 227 марок
📦 Імпорт моделей автомобілів...
   ✓ Імпортовано 5902 моделей
📦 Імпорт комплектацій автомобілів...
   ✓ Імпортовано 304924 комплектацій
📦 Імпорт розмірів шин...
   ✓ Імпортовано 1,198,772 розмірів шин
📦 Імпорт розмірів дисків...
   ✓ Імпортовано 1,144,266 розмірів дисків
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Імпорт завершено успішно за 45.3 секунд
```

## Крок 4: Налаштування Next.js

Додайте змінну оточення в `frontend/.env.local`:

```env
DATABASE_URL=postgresql://bridgestone:your_password@localhost:5432/bridgestone_vehicles
```

## Крок 5: Встановлення залежностей frontend

```bash
cd frontend
npm install
```

## Крок 6: Запуск

```bash
npm run dev
```

Перейдіть на http://localhost:3000/tyre-search та оберіть режим "За авто".

---

## Перевірка даних

```bash
psql -d bridgestone_vehicles
```

```sql
-- Кількість записів
SELECT 'brands' AS table_name, COUNT(*) FROM car_brands
UNION ALL
SELECT 'models', COUNT(*) FROM car_models
UNION ALL
SELECT 'kits', COUNT(*) FROM car_kits
UNION ALL
SELECT 'tyre_sizes', COUNT(*) FROM car_kit_tyre_sizes
UNION ALL
SELECT 'disk_sizes', COUNT(*) FROM car_kit_disk_sizes;

-- Приклад пошуку
SELECT * FROM v_car_kits_full
WHERE brand_name = 'Volkswagen' AND model_name = 'Golf' AND year = 2020
LIMIT 5;

-- Розміри шин для комплектації
SELECT format_tyre_size(width, height, diameter) AS size, size_type, axle
FROM car_kit_tyre_sizes
WHERE kit_id = (SELECT id FROM car_kits WHERE model_id = 100 AND year = 2020 LIMIT 1);
```

---

## Можливі проблеми

### Помилка підключення

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Рішення:** Переконайтеся, що PostgreSQL запущений:
```bash
sudo systemctl start postgresql
```

### Помилка прав доступу

```
Error: permission denied for table car_brands
```

**Рішення:** Надайте права:
```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO bridgestone;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO bridgestone;
```

### Помилка типів ENUM

```
Error: type "tyre_size_type" already exists
```

**Рішення:** Видаліть типи перед повторним створенням:
```sql
DROP TYPE IF EXISTS tyre_size_type CASCADE;
DROP TYPE IF EXISTS axle_type CASCADE;
```

---

## Продакшн

Для продакшн рекомендуємо:

1. **Використовуйте connection pooling** (PgBouncer)
2. **Налаштуйте індекси** під ваші запити
3. **Моніторинг** повільних запитів
4. **Бекапи** регулярні

Приклад конфігурації для Railway/Vercel:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```
