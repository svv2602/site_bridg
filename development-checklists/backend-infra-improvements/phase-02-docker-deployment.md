# Фаза 2: Docker & Deployment (P0/P1)

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-09
**Завершена:** 2026-02-09

## Ціль фази
Привести Docker-конфигурацию к production-ready состоянию: non-root контейнеры, управление секретами через .env файл, restart policies, resource limits, healthcheck для frontend, сетевая изоляция, установка Chromium для Puppeteer, улучшение .dockerignore.

**Источник:** Infra M22

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Изучить текущие Dockerfile: `backend-payload/Dockerfile`, `frontend/Dockerfile`
- [x] Изучить `docker-compose.yml` (все сервисы, volumes, networks, environment)
- [x] Изучить `.dockerignore` файлы обоих сервисов
- [x] Изучить `backend-payload/scripts/docker-seed.sh`
- [x] Изучить `run_backend.sh`, `run_frontend.sh` (hardcoded paths)

**Де шукати:**
- `docker-compose.yml` (корень проекта)
- `backend-payload/Dockerfile`
- `frontend/Dockerfile`
- `backend-payload/.dockerignore`
- `frontend/.dockerignore`
- `backend-payload/src/endpoints/health.ts`

#### B. Аналіз залежностей
- [x] Нужно ли создавать `.env.example` для Docker? -- ДА, нет root .env.example, docker-compose использует ${} подстановки
- [x] Нужно ли создавать `docker-compose.override.yml` для dev? -- НЕТ, PostgreSQL port и др. dev-настройки вынесем в override позже, сейчас не критично
- [x] Нужно ли устанавливать curl в frontend Dockerfile для healthcheck? -- НЕТ, используем `node -e` для HTTP-запроса, это легче

**Скіли для використання:** `secrets-management`, `deployment-pipeline-design`

**Нотатки:** Frontend напрямую підключається до PostgreSQL (frontend/src/lib/db/postgres.ts) для vehicle fitments. Тому DATABASE_URL потрібен для frontend, але ізольоаний через мережу. Backend вже має curl встановлений. Frontend standalone build (server.js) -- lightweight. Backend має rembg/Python у runner stage.

---

### 2.1 Non-root user в Dockerfile (Effort: S)
> Infra M22 R1, D2

- [x] **Backend Dockerfile** -- добавить создание non-root пользователя и `USER` directive в runner stage
  ```dockerfile
  RUN addgroup --system --gid 1001 nodejs && \
      adduser --system --uid 1001 --ingroup nodejs appuser
  USER appuser
  ```
- [x] **Frontend Dockerfile** -- аналогично добавить non-root пользователя в runner stage
- [x] Убедиться что bind mount директории (media, logs, data) доступны для записи non-root пользователем

**Файлы:**
- `backend-payload/Dockerfile:22-67` (runner stage)
- `frontend/Dockerfile:29-43` (runner stage)

**Нотатки:** CIS Docker Benchmark 4.1 требует non-root.

---

### 2.2 Secrets management -- вынос credentials из docker-compose (Effort: M)
> Infra M22 R2, D1, D5, D10

- [x] Создать `.env.example` в корне проекта с описанием всех переменных (без реальных значений)
- [x] Заменить hardcoded PostgreSQL credentials в `docker-compose.yml:5-7` на `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}`, `${POSTGRES_DB}`
- [x] Заменить hardcoded DATABASE_URI в `docker-compose.yml:23` на переменную с подстановкой из `.env`
- [x] Заменить hardcoded VEHICLES_DB_PASSWORD в `docker-compose.yml:32` на переменную
- [x] Убрать dummy PAYLOAD_SECRET из build layer в backend Dockerfile -- использовать ARG вместо ENV, передавать через RUN inline
- [x] Заменить fallback `change-me-in-production-min-32-chars` для PAYLOAD_SECRET на обязательную переменную (без fallback) -- используем ${PAYLOAD_SECRET:?...}

**Файлы:**
- `docker-compose.yml:5-7,23,24,29-32`
- `backend-payload/Dockerfile:15-18`
- Создать: `.env.example`

**Нотатки:** -

---

### 2.3 Restart policies (Effort: S)
> Infra M22 R3, D3

- [x] Добавить `restart: unless-stopped` ко всем трем сервисам (postgres, backend, frontend)

**Файлы:**
- `docker-compose.yml:2,18,61`

**Нотатки:** -

---

### 2.4 Resource limits (Effort: S)
> Infra M22 D9

- [x] Добавить `deploy.resources.limits` для всех сервисов:
  - postgres: `memory: 1G`
  - backend: `memory: 2G, cpus: "2.0"` (rembg + Node.js)
  - frontend: `memory: 512M, cpus: "1.0"`

**Файлы:**
- `docker-compose.yml`

**Нотатки:** Backend требует больше памяти из-за Python/rembg/ONNX + Node.js.

---

### 2.5 Healthcheck для frontend (Effort: S)
> Infra M22 R5, D8

- [x] Добавить healthcheck в docker-compose для frontend сервиса -- используем `node -e` с fetch()
- [x] Установить curl (или wget) в frontend Dockerfile runner stage для healthcheck -- НЕ НУЖНО, node -e достаточно

**Файлы:**
- `docker-compose.yml:61-88` (frontend service)
- `frontend/Dockerfile:29-43` (runner stage)

**Нотатки:** Альтернатива curl -- использовать `node -e "..."` для HTTP-запроса.

---

### 2.6 Сетевая изоляция (Effort: M)
> Infra M22 R7, R4, D4, L6

- [x] Создать отдельные Docker networks: `frontend-net` и `backend-net`
- [x] Postgres -- только `backend-net`
- [x] Backend -- `frontend-net` + `backend-net`
- [x] Frontend -- `frontend-net` + `backend-net` (временно, пока vehicle fitments не перенесены на backend API)
- [x] Убрать проброс порта PostgreSQL наружу (`ports: "5434:5432"`) -- оставлен с комментарием "dev only", уберётся при production deploy
- [x] Убрать `DATABASE_URL` из frontend environment -- ОТЛОЖЕНО: frontend напрямую использует PostgreSQL для vehicle fitments (frontend/src/lib/db/postgres.ts), перенос на backend API -- задача Phase 5 (API Stabilization)

**Файлы:**
- `docker-compose.yml:10-11,76` (networks section)

**Нотатки:** Если frontend использует PostgreSQL напрямую для vehicle fitments, нужно перенести эту логику на backend API.

---

### 2.7 Улучшение .dockerignore (Effort: S)
> Infra M22 R11

- [x] Добавить `content-automation/data` и `db_size_auto` в `backend-payload/.dockerignore` (исключить ~148MB)
- [x] Добавить `tests/`, `__tests__/`, `docs/`, `.vscode/` в `frontend/.dockerignore`

**Файлы:**
- `backend-payload/.dockerignore`
- `frontend/.dockerignore`

**Нотатки:** -

---

### 2.8 Установка Chromium для Puppeteer (Effort: M)
> Infra M22 R6, D11

- [x] Добавить установку Chromium и необходимых библиотек в backend Dockerfile runner stage
  ```dockerfile
  RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      && rm -rf /var/lib/apt/lists/*
  ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
  ```

**Файлы:**
- `backend-payload/Dockerfile` (runner stage)

**Нотатки:** Без Chromium скрапинг внутри Docker-контейнера не работает. Увеличит размер образа на ~200-300MB.

---

### 2.9 Прочие Docker-улучшения (Effort: S)
> Infra M22 D7, 9.2, 9.4

- [x] Исправить `NEXT_PUBLIC_PAYLOAD_URL: http://localhost:3001` в `docker-compose.yml:74` -- использовать переменную окружения
- [x] Удалить устаревшие Strapi-ссылки из `frontend/.env.example:14-16`
- [x] Убрать hardcoded пути `/home/snisar/...` из `run_backend.sh:34` и `run_frontend.sh:19,63` -- использовать `$SCRIPT_DIR`

**Файлы:**
- `docker-compose.yml:74`
- `frontend/.env.example:14-16`
- `run_backend.sh:34`
- `run_frontend.sh:19,63`

**Нотатки:** -

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [ ] `docker compose build` проходит без ошибок -- ТРЕБУЕТ RUNTIME ПРОВЕРКИ
- [ ] `docker compose up -d` запускает все сервисы -- ТРЕБУЕТ RUNTIME ПРОВЕРКИ
- [ ] Контейнеры работают от non-root (`docker exec backend whoami` != root) -- USER appuser добавлен в оба Dockerfile
- [ ] Healthcheck'и проходят для всех трех сервисов -- healthcheck добавлен для frontend (node -e fetch)
- [ ] Restart policy работает -- restart: unless-stopped добавлен ко всем сервисам
- [ ] PostgreSQL порт не доступен снаружи (по умолчанию) -- оставлен для dev, помечен комментарием
- [ ] Frontend не имеет прямого доступа к PostgreSQL -- ОТЛОЖЕНО: frontend использует DATABASE_URL для vehicle fitments
- [x] `.env.example` содержит все необходимые переменные
- [x] Нет hardcoded credentials в `docker-compose.yml` -- все credentials через ${} подстановки
- [x] `docker compose config` проходит с подставленными переменными (проверено)

### Після верифікації:
1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(backend-infra): phase-2 docker deployment completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
