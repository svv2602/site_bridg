# Фаза 1: Database & Infrastructure

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-16
**Завершена:** 2026-01-16

## Ціль фази
Ініціалізувати базу даних та налаштувати Docker networking так, щоб всі сервіси працювали коректно.

## Пріоритет
**P0 (BLOCKER)** - без цього нічого не працює

---

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз поточного стану
- [x] Перевірити статус Docker containers
- [x] Перевірити логи backend на помилки
- [x] Перевірити PostgreSQL connectivity

**Команди для перевірки:**
```bash
# Статус контейнерів
docker compose ps

# Логи backend
docker compose logs --tail=50 backend

# Перевірка PostgreSQL
docker compose exec postgres pg_isready -U bridgestone
```

#### B. Аналіз конфігурації
- [x] Перевірити docker-compose.yml networking
- [x] Перевірити NEXT_PUBLIC_PAYLOAD_URL в frontend
- [x] Перевірити DATABASE_URI в backend

**Файли для перевірки:**
- `docker-compose.yml`
- `frontend/.env.local` або `frontend/.env`
- `backend-payload/.env`

---

### 1.1 Ініціалізація бази даних (P0)

**Проблема:** `relation "tyres" does not exist` - таблиці Payload CMS не створені

- [x] Зупинити Docker containers (не потрібно було)
- [x] Видалити volume postgres_data (не потрібно було)
- [x] Запустити containers знову (вже працювали)
- [x] Виконати seed для ініціалізації БД
- [x] Перевірити що API /api/tyres повертає 200

**Команди:**
```bash
# Варіант 1: Seed в існуючу БД
cd backend-payload
npm run seed

# Варіант 2: Чистий старт (якщо seed не допомагає)
docker compose down -v  # Видалить volumes!
docker compose up -d
cd backend-payload && npm run seed

# Перевірка
curl -s http://localhost:3001/api/tyres | head -c 200
```

**Файли:** `backend-payload/scripts/seed.ts`
**Очікуваний результат:** API повертає JSON з даними шин

---

### 1.2 Docker Network Connectivity (P0)

**Проблема:** Frontend не може з'єднатися з backend в Docker (127.0.0.1:3001 замість backend:3001)

- [x] Перевірити docker-compose.yml network configuration
- [x] Перевірити environment variables в frontend service
- [x] Оновити NEXT_PUBLIC_PAYLOAD_URL для Docker environment (вже правильно)
- [x] Перевірити що frontend може fetch з backend

**Перевірка конфігурації:**
```bash
# Перевірити як frontend бачить backend
docker compose exec frontend printenv | grep PAYLOAD

# Перевірити network
docker network inspect site_bridgestone_default
```

**Файли:**
- `docker-compose.yml`
- `frontend/Dockerfile` (якщо є build-time env)

**Рішення:**
1. В docker-compose.yml frontend повинен мати:
   ```yaml
   environment:
     - NEXT_PUBLIC_PAYLOAD_URL=http://backend:3001
   ```
2. АБО використовувати server-side fetch без NEXT_PUBLIC_

---

### 1.3 Перевірка Payload Admin Panel (P0)

**Проблема:** Після ініціалізації БД перевірити що Admin Panel працює

- [x] Відкрити http://localhost:3001/admin
- [x] Залогінитися (admin@bridgestone.ua / admin123)
- [x] Перевірити що колекції відображаються
- [x] Перевірити що можна створити/редагувати записи

**Очікуваний результат:** Admin Panel повністю функціональний

---

### 1.4 Верифікація всіх API endpoints (P0)

- [x] GET /api/tyres - повертає 200 з даними
- [x] GET /api/dealers - повертає 200 з даними
- [x] GET /api/articles - повертає 200 з даними
- [x] GET /api/technologies - повертає 200 з даними
- [x] GET /api/vehicle-fitments - повертає 200 з даними
- [x] GET /api/media - повертає 200

**Команди перевірки:**
```bash
endpoints=("tyres" "dealers" "articles" "technologies" "vehicle-fitments" "media")
for ep in "${endpoints[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/$ep)
  echo "$ep: $code"
done
```

**Очікуваний результат:** Всі endpoints повертають 200

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(audit-fixes): phase-1 database-infrastructure completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
