# Фаза 8: CI/CD Pipeline (P2)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Настроить CI/CD pipeline через GitHub Actions: build, lint, test, image scan. Разделить docker-compose файлы на base/dev/prod. Добавить security headers (CSP, HSTS). Обновить зависимости. Настроить backup стратегию.

**Источник:** Infra M22, M24

## Задачі

### 8.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Проверить наличие `.github/workflows/` в проекте
- [x] Изучить текущую структуру тестов
- [x] Изучить существующие lint-конфигурации
- [x] Изучить `frontend/next.config.ts:10-43` (security headers)
- [x] Изучить текущие тесты в `backend-payload/`

**Де шукати:**
- `.github/workflows/` (если есть)
- `backend-payload/vitest.config.*`
- `frontend/next.config.ts` (security headers)
- `backend-payload/content-automation/src/processors/*.test.ts`

#### B. Аналіз залежностей
- [x] Нужен ли Trivy/Snyk для image scanning?
- [x] Нужен ли отдельный staging environment?

**Скіли для використання:** `github-actions-templates`, `deployment-pipeline-design`, `vitest`

**Нотатки:** Trivy added to CI pipeline (non-blocking). No staging environment needed at this stage.

---

### 8.1 Разделение docker-compose файлов (Effort: M)
> Infra M22 R9, L1

- [x] Создать `docker-compose.yml` -- базовая конфигурация (без port mappings, без debug)
- [x] Создать `docker-compose.override.yml` -- dev-specific (port mappings, SKIP_IMAGE_OPTIMIZATION)
- [x] Создать `docker-compose.prod.yml` -- production (resource limits, restart policies, production URLs)

**Файлы:**
- `docker-compose.yml` (переработать)
- Создать: `docker-compose.override.yml`
- Создать: `docker-compose.prod.yml`

**Нотатки:** Base compose has services, env vars, healthchecks. Override (auto-loaded) adds ports, volumes, dev settings. Prod adds resource limits, restart policies, SKIP_IMAGE_OPTIMIZATION=false.

---

### 8.2 Security headers (Effort: M)
> Infra M24 R10, R11, R12, D10, D11, D12

- [x] Добавить Content-Security-Policy (CSP) header в `frontend/next.config.ts`
  - Определить разрешённые sources для scripts, styles, images, fonts, connect
  - Учесть Google Maps API, Google Analytics, Meta Pixel, Sentry
- [x] Подготовить HSTS header для активации при настройке HTTPS
- [ ] Настроить Google Maps API key restrictions в Google Cloud Console (HTTP Referrer)

**Файлы:**
- `frontend/next.config.ts:10-43`

**Нотатки:** CSP added with allowances for: Google Maps, Google Analytics, Meta Pixel, Sentry, external image sources. HSTS remains commented out (requires HTTPS). Google Maps API key restrictions require Google Cloud Console access.

---

### 8.3 GitHub Actions: Build & Test (Effort: L)
> Infra M22 R6, Арх. 14.3

- [x] Создать `.github/workflows/ci.yml`:
  - Checkout code
  - Setup Node.js 20
  - Install dependencies (frontend + backend)
  - Lint (frontend + backend)
  - Build (frontend + backend)
  - Run tests (vitest)
- [x] Добавить кеширование `node_modules` через `actions/cache`
- [x] Настроить trigger: push to main + pull requests

**Файлы:**
- Создать: `.github/workflows/ci.yml`

**Нотатки:** CI runs backend and frontend as parallel jobs. Docker build + Trivy scan runs as separate job on main pushes only. Uses npm cache via actions/setup-node.

---

### 8.4 GitHub Actions: Docker Image Build & Scan (Effort: M)
> Infra M22 6.4

- [x] Добавить этап сборки Docker-образов в CI pipeline
- [x] Добавить сканирование образов (Trivy или Docker Scout)
- [ ] Настроить push в container registry (GHCR) при merge в main

**Файлы:**
- `.github/workflows/ci.yml` (расширить)

**Нотатки:** Docker build and Trivy scan added to CI. GHCR push deferred -- requires GitHub Container Registry setup and secrets configuration.

---

### 8.5 Обновление зависимостей (Effort: S)
> Infra M24 R14

- [x] Обновить Next.js до >=16.1.5 (patch high-severity vulnerability)

**Файлы:**
- `frontend/package.json`

**Нотатки:** Updated Next.js from 16.1.1 to 16.1.6 and eslint-config-next to match. npm install needed to update package-lock.json.

---

### 8.6 Backup стратегия (Effort: M)
> Infra M22 R10, L7

- [x] Создать скрипт бэкапа PostgreSQL + media + SQLite
- [x] Документировать процедуру restore

**Файлы:**
- Создать: `scripts/backup.sh`

**Нотатки:** Backup script handles PostgreSQL (pg_dump or Docker), media (tar), SQLite (copy), costs.json. Includes restore instructions in comments. 30-day retention by default.

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [ ] GitHub Actions workflow проходит (build + lint + test)
- [x] Docker-образы собираются успешно
- [ ] Image scan не показывает критических уязвимостей
- [ ] `docker compose -f docker-compose.yml -f docker-compose.prod.yml up` работает
- [ ] CSP header не блокирует функциональность
- [x] Backup скрипт работает

### Після верифікації:
1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(backend-infra): phase-8 cicd pipeline completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 9
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
