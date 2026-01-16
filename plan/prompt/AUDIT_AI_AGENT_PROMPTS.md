# AI Agent Audit Prompts

Набор  промптов для проведения аудита AI-агентами (Claude Code, Cursor, etc.)

## Общие требования

### Предусловия
- Docker Compose запущен: `docker compose ps` показывает все сервисы Up
- Frontend: http://localhost:3010
- Backend (Payload CMS): http://localhost:3001
- Admin Panel: http://localhost:3001/admin
- Automation Dashboard: http://localhost:3010/admin/automation

### Формат отчётов
- Сохранять в: `plan/result_audit/step_cloude/`
- Формат имени: `{TYPE}_AUDIT.md` (например: `FUNCTIONAL_AUDIT.md`)
- Структура: Executive Summary → Issues Found → Recommendations → Appendix

### Severity уровни
- **CRITICAL** — блокер релиза, требует немедленного исправления
- **HIGH** — серьёзная проблема, исправить до релиза
- **MEDIUM** — важно, но не блокирует
- **LOW** — улучшение, можно отложить

---

## 1. Functional / QA Audit

```
Роль: QA-инженер
Задача: Провести функциональный аудит сайта Bridgestone Ukraine

## Инструменты
- Bash: curl для HTTP запросов
- Read: просмотр конфигов и кода
- Grep: поиск паттернов ошибок

## Пошаговый план

### Шаг 1: Проверить статус сервисов
```bash
docker compose ps
docker compose logs --tail=50 frontend
docker compose logs --tail=50 backend
```

### Шаг 2: Проверить публичные страницы (200 OK)
```bash
# Главные страницы
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/shyny
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/dealers
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/advice
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/pro-nas
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/kontakty
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/polityka-konfidentsiynosti
```

### Шаг 3: Проверить динамические страницы
```bash
# Проверить что страницы с контентом работают
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/shyny/turanza-t005
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/advice/yak-obraty-shyny
```

### Шаг 4: Проверить Admin Dashboard (401 без auth)
```bash
# Должен вернуть 401 Unauthorized без credentials
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/admin/automation
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/admin/automation/api/stats

# С credentials должен работать (200)
curl -s -o /dev/null -w "%{http_code}" -u admin:bridgestone2026 http://localhost:3010/admin/automation
```

### Шаг 5: Проверить Payload CMS API эндпоинты
```bash
# Публичные API
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/tyres
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/dealers
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/articles
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/technologies
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/vehicle-fitments
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/media

# Проверить что данные возвращаются
curl -s http://localhost:3001/api/tyres | head -c 200
```

### Шаг 6: Проверить Payload Admin Panel
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/admin
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/admin/login
```

### Шаг 7: Проверить 404 обработку
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/nonexistent-page-12345
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/nonexistent
```

### Шаг 8: Проверить логи на ошибки
```bash
docker compose logs --tail=100 frontend 2>&1 | grep -i "error\|exception\|failed"
docker compose logs --tail=100 backend 2>&1 | grep -i "error\|exception\|failed"
```

### Шаг 9: Проверить Content Automation
```bash
# Проверить что automation CLI доступен
cd backend-payload && npm run automation -- --help 2>&1 | head -20
```

## Чек-лист
- [ ] Все сервисы Up и healthy
- [ ] Публичные страницы возвращают 200
- [ ] Динамические страницы /shyny/[slug] работают
- [ ] Payload CMS API эндпоинты работают
- [ ] Payload Admin Panel доступен
- [ ] Admin Dashboard защищён Basic Auth
- [ ] 404 страницы обрабатываются корректно
- [ ] Нет критических ошибок в логах
- [ ] Content Automation CLI работает

## Формат отчёта
Сохранить в: `plan/result_audit/step_cloude/FUNCTIONAL_AUDIT.md`
```

---

## 2. Performance / Speed Audit

```
Роль: Performance-инженер
Задача: Провести аудит производительности

## Инструменты
- Read: анализ конфигов и кода
- Grep: поиск проблемных паттернов
- Bash: проверка bundle size

## Пошаговый план

### Шаг 1: Анализ Bundle Size
```bash
# Проверить размер билда
cd frontend
npm run build 2>&1 | tail -50

# Или посмотреть существующий .next
ls -la frontend/.next/static/chunks/ 2>/dev/null | head -20
du -sh frontend/.next/ 2>/dev/null
```

### Шаг 2: Проверить конфигурацию Next.js
Прочитать: `frontend/next.config.ts`
Проверить:
- swcMinify: true
- productionBrowserSourceMaps: false
- images optimization
- experimental features

### Шаг 3: Найти проблемные паттерны
```bash
# Большие импорты
grep -r "import \* as" frontend/src --include="*.tsx" --include="*.ts" | head -20

# Синхронные динамические импорты
grep -r "require(" frontend/src --include="*.tsx" --include="*.ts" | head -20

# useEffect без deps
grep -rn "useEffect(() =>" frontend/src --include="*.tsx" | head -20
```

### Шаг 4: Проверить lazy loading
```bash
# Поиск динамических импортов
grep -r "dynamic(" frontend/src --include="*.tsx" | wc -l

# Поиск React.lazy
grep -r "React.lazy" frontend/src --include="*.tsx" | wc -l
```

### Шаг 5: Проверить кэширование API
Прочитать: `frontend/src/lib/api/payload.ts`
Проверить:
- Cache-Control headers
- revalidate settings в fetch
- ISR/SSG конфигурация

### Шаг 6: Анализ изображений
```bash
# Найти большие изображения
find frontend/public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \) -size +100k 2>/dev/null

# Проверить использование next/image
grep -rn "next/image" frontend/src --include="*.tsx" | wc -l
grep -rn "<img " frontend/src --include="*.tsx" | head -10
```

### Шаг 7: Проверить fonts optimization
```bash
grep -rn "next/font" frontend/src --include="*.tsx" --include="*.ts" | head -10
```

## Чек-лист
- [ ] Bundle size < 500KB (First Load JS)
- [ ] Используется code splitting
- [ ] Изображения через next/image
- [ ] Нет синхронных больших импортов
- [ ] API кэширование настроено
- [ ] Используется динамический импорт для тяжёлых компонентов
- [ ] Fonts оптимизированы через next/font

## Формат отчёта
Сохранить в: `plan/result_audit/step_cloude/PERFORMANCE_AUDIT.md`
```

---

## 3. Accessibility (A11y) Audit

```
Роль: Accessibility-специалист
Задача: Провести аудит доступности

## Инструменты
- Read: анализ компонентов
- Grep: поиск a11y проблем

## Пошаговый план

### Шаг 1: Проверить семантику HTML
Прочитать ключевые layout файлы:
- `frontend/src/app/layout.tsx`
- `frontend/src/components/layout/`

Проверить:
- Использование <main>, <nav>, <header>, <footer>
- lang="uk" атрибут на <html>
- Правильная иерархия заголовков

### Шаг 2: Найти проблемы с изображениями
```bash
# Изображения без alt
grep -rn "<img" frontend/src --include="*.tsx" | grep -v "alt=" | head -20

# Image компоненты без alt
grep -rn "<Image" frontend/src --include="*.tsx" | grep -v "alt=" | head -20
```

### Шаг 3: Проверить интерактивные элементы
```bash
# onClick на div без role
grep -rn "onClick=" frontend/src --include="*.tsx" | grep "<div" | grep -v "role=" | head -20

# Кнопки без aria-label (для icon-only buttons)
grep -rn "<Button" frontend/src --include="*.tsx" | grep -v "aria-label\|children" | head -10
```

### Шаг 4: Проверить формы
```bash
# Input без label или aria-label
grep -rn "<input\|<Input" frontend/src --include="*.tsx" | grep -v "aria-label\|id=" | head -20
```

### Шаг 5: Проверить focus states
Прочитать: `frontend/src/app/globals.css`
Проверить:
- focus-visible стили
- outline для интерактивных элементов

### Шаг 6: Проверить контрастность (stone palette)
Прочитать:
- `frontend/tailwind.config.ts`
- `frontend/src/app/globals.css`
- `frontend/docs/standards/COLOR_SYSTEM.md`

Проверить:
- Текст на фоне имеет контраст >= 4.5:1
- Используется stone-* палитра

### Шаг 7: Проверить skip links
```bash
grep -rn "skip" frontend/src --include="*.tsx" | head -10
```

### Шаг 8: Проверить aria-labels на украинском
```bash
grep -rn "aria-label=" frontend/src --include="*.tsx" | head -20
```

## Чек-лист
- [ ] Используется семантический HTML
- [ ] lang="uk" на <html>
- [ ] Все изображения имеют alt (на украинском)
- [ ] Интерактивные элементы доступны с клавиатуры
- [ ] Формы имеют связанные labels
- [ ] Focus states видимы
- [ ] Контрастность соответствует WCAG AA
- [ ] Есть skip-to-content link
- [ ] aria-labels на украинском

## Формат отчёта
Сохранить в: `plan/result_audit/step_cloude/ACCESSIBILITY_AUDIT.md`
```

---

## 4. SEO Audit

```
Роль: SEO-инженер
Задача: Провести технический SEO-аудит

## Инструменты
- Bash: curl для проверки headers и контента
- Read: анализ метаданных
- Grep: поиск SEO элементов

## Пошаговый план

### Шаг 1: Проверить meta-теги на главной
```bash
curl -s http://localhost:3010/ | grep -E "<title>|<meta" | head -20
```

### Шаг 2: Проверить robots.txt
```bash
curl -s http://localhost:3010/robots.txt
```

### Шаг 3: Проверить sitemap
```bash
curl -s http://localhost:3010/sitemap.xml | head -50
```

### Шаг 4: Проверить canonical URLs
```bash
curl -s http://localhost:3010/ | grep -i "canonical"
curl -s http://localhost:3010/shyny | grep -i "canonical"
```

### Шаг 5: Проверить Open Graph теги
```bash
curl -s http://localhost:3010/ | grep -E 'og:|twitter:' | head -20
```

### Шаг 6: Проверить структурированные данные
```bash
curl -s http://localhost:3010/ | grep -E 'application/ld\+json' -A 30
```

### Шаг 7: Проверить заголовки страниц
```bash
curl -s http://localhost:3010/ | grep -E "<h1|<h2" | head -10
curl -s http://localhost:3010/shyny | grep -E "<h1|<h2" | head -10
curl -s http://localhost:3010/dealers | grep -E "<h1|<h2" | head -10
```

### Шаг 8: Проверить metadata конфигурацию
Прочитать:
- `frontend/src/app/layout.tsx` (metadata export)
- `frontend/src/app/*/page.tsx` (per-page metadata)

### Шаг 9: Проверить alt тексты изображений (украинский)
```bash
curl -s http://localhost:3010/ | grep -E '<img[^>]*alt=' | head -10
```

### Шаг 10: Проверить hreflang (для будущей мультиязычности)
```bash
curl -s http://localhost:3010/ | grep -i "hreflang"
```

### Шаг 11: Проверить page speed indicators
```bash
# Проверить Server-Timing header
curl -sI http://localhost:3010/ | grep -i "server-timing\|x-response-time"
```

## Чек-лист
- [ ] Уникальные title на украинском на каждой странице
- [ ] Meta description на всех страницах (украинский)
- [ ] Правильный robots.txt
- [ ] Sitemap.xml генерируется
- [ ] Canonical URLs настроены
- [ ] Open Graph теги для соцсетей
- [ ] Schema.org разметка (Product для шин, LocalBusiness для дилерів)
- [ ] Один H1 на страницу
- [ ] Alt тексты на украинском
- [ ] hreflang готов для мультиязычности

## Формат отчёта
Сохранить в: `plan/result_audit/step_cloude/SEO_AUDIT.md`
```

---

## 5. UI/UX Consistency Audit

```
Роль: UI/UX дизайнер
Задача: Провести аудит консистентності інтерфейсу

## Инструменты
- Read: анализ компонентов и стилей
- Grep: поиск несоответствий

## Пошаговый план

### Шаг 1: Проверить UI Standards
Прочитать ключевые файлы стандартов:
- `frontend/docs/standards/INDEX.md`
- `frontend/docs/standards/COLOR_SYSTEM.md`
- `frontend/docs/standards/BUTTON_STANDARDS.md`
- `frontend/docs/standards/CARD_STYLING.md`
- `frontend/docs/standards/DARK_MODE.md`

### Шаг 2: Проверить stone-* палитру (НЕ zinc/gray)
```bash
# НЕ должно быть zinc-* или gray-*
grep -rn "zinc-\|gray-" frontend/src --include="*.tsx" | head -30

# Должен быть stone-*
grep -rn "stone-" frontend/src --include="*.tsx" | wc -l
```

### Шаг 3: Найти hardcoded цвета
```bash
# Цвета вне системы
grep -rn "#[0-9a-fA-F]\{3,6\}" frontend/src --include="*.tsx" | grep -v "tailwind\|config" | head -30

# RGB/HSL вне переменных
grep -rn "rgb(\|hsl(\|rgba(" frontend/src --include="*.tsx" | head -20
```

### Шаг 4: Проверить badges (explicit colors)
```bash
# Badges должны использовать явные stone-* цвета, не bg-muted
grep -rn "bg-muted\|text-muted-foreground" frontend/src --include="*.tsx" | head -20
```

### Шаг 5: Проверить кнопки
Прочитать: `frontend/src/components/ui/button.tsx`

```bash
# Кнопки без variant
grep -rn "<Button" frontend/src --include="*.tsx" | grep -v "variant=" | head -20
```

### Шаг 6: Проверить dark mode
```bash
# Элементы без dark: варианта
grep -rn "bg-white\|bg-stone-50\|text-stone-900" frontend/src --include="*.tsx" | grep -v "dark:" | head -20

# hero-adaptive и hero-dark классы
grep -rn "hero-adaptive\|hero-dark" frontend/src --include="*.tsx" | head -10
```

### Шаг 7: Проверить карточки
```bash
# Cards с hover:-translate-y-1 должны иметь pt-2 на контейнере
grep -rn "hover:-translate-y-1" frontend/src --include="*.tsx" | head -20

# h-full для equal heights
grep -rn "h-full" frontend/src --include="*.tsx" | wc -l
```

### Шаг 8: Проверить responsive
```bash
# Элементы с фиксированной шириной
grep -rn 'w-\[' frontend/src --include="*.tsx" | head -20

# Проверить использование responsive breakpoints
grep -rn "sm:\|md:\|lg:\|xl:" frontend/src --include="*.tsx" | wc -l
```

### Шаг 9: Проверить состояния элементов
```bash
# Hover states
grep -rn "hover:" frontend/src --include="*.tsx" | wc -l

# Disabled states
grep -rn "disabled:" frontend/src --include="*.tsx" | wc -l
```

### Шаг 10: Проверить типографику
```bash
# Inconsistent font sizes
grep -rn "text-\[" frontend/src --include="*.tsx" | head -20
```

## Чек-лист
- [ ] Все цвета из stone-* палитры (не zinc/gray)
- [ ] Badges с explicit colors (не bg-muted)
- [ ] Кнопки используют variants
- [ ] hero-adaptive/hero-dark для hero секций
- [ ] Поддержка light/dark тем
- [ ] Cards с hover-translate имеют pt-2
- [ ] Responsive на всех breakpoints
- [ ] Hover/focus/disabled states
- [ ] Консистентная типографика

## Формат отчёта
Сохранить в: `plan/result_audit/step_cloude/UI_UX_AUDIT.md`
```

---

## 6. Security (Basic) Audit

```
Роль: Security-інженер
Задача: Провести базовий аудит безпеки

## Инструменты
- Bash: curl для проверки headers
- Read: анализ конфигов
- Grep: поиск уязвимостей

## Пошаговый план

### Шаг 1: Проверить Security Headers
```bash
curl -I http://localhost:3010/ 2>/dev/null | grep -iE "x-frame|x-content|x-xss|strict-transport|content-security|referrer"
curl -I http://localhost:3001/api/tyres 2>/dev/null | grep -iE "x-frame|x-content|x-xss|strict-transport|content-security|referrer"
```

### Шаг 2: Проверить CORS
```bash
# OPTIONS запрос
curl -X OPTIONS http://localhost:3001/api/tyres \
  -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -I 2>/dev/null | grep -i "access-control"
```

### Шаг 3: Найти потенциальные XSS
```bash
# dangerouslySetInnerHTML
grep -rn "dangerouslySetInnerHTML" frontend/src --include="*.tsx" | head -20

# Проверить использование sanitize
grep -rn "sanitize\|DOMPurify" frontend/src --include="*.tsx" | head -10
```

### Шаг 4: Проверить API ключи и секреты
```bash
# Поиск утечек в коде
grep -rn "sk-ant-\|api_key\|apiKey\|secret\|password" frontend/src backend-payload/src --include="*.ts" --include="*.tsx" | grep -v "test\|mock\|example\|.env" | head -20

# Проверить .env файлы в gitignore
cat .gitignore | grep -E "\.env"
```

### Шаг 5: Проверить Admin Auth
```bash
# Admin automation без auth должен вернуть 401
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/admin/automation

# Payload admin требует login
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/admin
```

### Шаг 6: Проверить environment variables
Прочитать:
- `backend-payload/.env.example`
- `frontend/.env.example`

```bash
# Проверить что .env не в репо
ls -la backend-payload/.env 2>&1
ls -la frontend/.env.local 2>&1
```

### Шаг 7: Проверить Payload security config
Прочитать: `backend-payload/payload.config.ts`
Проверить:
- csrf protection
- cookiePrefix
- secure cookie settings

### Шаг 8: Проверить rate limiting (если есть)
```bash
grep -rn "rate\|limit\|throttle" backend-payload/src --include="*.ts" | head -20
```

### Шаг 9: Проверить валидацию входных данных
Прочитать несколько collections в: `backend-payload/src/collections/`
Убедиться, что используется Payload field validation.

### Шаг 10: Проверить Content Automation security
Прочитать:
- `backend-payload/content-automation/src/config/`
- API keys handling

## Чек-лист
- [ ] Security headers настроены
- [ ] CORS ограничен доверенными доменами
- [ ] Нет dangerouslySetInnerHTML без санитизации
- [ ] Нет API ключей в коде (только .env)
- [ ] Admin endpoints защищены
- [ ] .env файлы в .gitignore
- [ ] Payload CSRF protection включен
- [ ] Входные данные валидируются
- [ ] Content Automation не экспонирует секреты

## Формат отчёта
Сохранить в: `plan/result_audit/step_cloude/SECURITY_AUDIT.md`
```

---

## 7. Analytics / Monitoring Audit

```
Роль: Product Analyst
Задача: Провести аудит аналітики та моніторингу

## Инструменты
- Read: анализ конфигов
- Grep: поиск событий

## Пошаговый план

### Шаг 1: Проверить Sentry интеграцию
Прочитать:
- `frontend/sentry.client.config.ts` или `frontend/instrumentation-client.ts`
- `frontend/sentry.server.config.ts` или `frontend/instrumentation.ts`

```bash
grep -rn "Sentry\|sentry" frontend/src --include="*.ts" --include="*.tsx" | head -20
```

### Шаг 2: Проверить аналитику
```bash
# Google Analytics, etc.
grep -rn "gtag\|analytics\|GA_\|GTM_" frontend/src --include="*.ts" --include="*.tsx" | head -20
```

### Шаг 3: Проверить Content Automation мониторинг
Прочитать:
- `backend-payload/content-automation/src/publishers/telegram.ts`
- Telegram notifications config

```bash
grep -rn "telegram\|notify\|alert" backend-payload/content-automation --include="*.ts" | head -20
```

### Шаг 4: Проверить логирование на backend
```bash
grep -rn "console.log\|console.error\|logger" backend-payload/src --include="*.ts" | head -30
```

### Шаг 5: Проверить health checks
```bash
# Payload health
curl -s http://localhost:3001/api/health 2>/dev/null || echo "No /api/health"

# Frontend status
curl -s http://localhost:3010/ -o /dev/null -w "%{http_code}"
```

### Шаг 6: Проверить error boundaries
```bash
grep -rn "ErrorBoundary\|error-boundary" frontend/src --include="*.tsx" | head -10
```

### Шаг 7: Проверить Automation Dashboard metrics
Прочитать:
- `frontend/src/app/admin/automation/`

```bash
# Dashboard API
curl -s -u admin:bridgestone2026 http://localhost:3010/admin/automation/api/stats 2>/dev/null | head -c 500
```

### Шаг 8: Проверить cron jobs monitoring
Прочитать: `backend-payload/content-automation/src/daemon/`
```bash
grep -rn "cron\|schedule" backend-payload/content-automation --include="*.ts" | head -20
```

## Чек-лист
- [ ] Sentry настроен для frontend
- [ ] Аналитика интегрирована (GA или аналог)
- [ ] Telegram notifications для Content Automation
- [ ] Backend логирование настроено
- [ ] Health endpoints работают
- [ ] Error boundaries на frontend
- [ ] Automation Dashboard показывает статистику
- [ ] Cron jobs мониторятся

## Формат отчёта
Сохранить в: `plan/result_audit/step_cloude/ANALYTICS_MONITORING_AUDIT.md`
```

---

## 8. Docker Runtime Audit

```
Роль: DevOps-інженер
Задача: Перевірити production-ready стан застосунку в Docker

## Зачем нужен этот аудит
Аудиты 1-7 частично проверяют код статически. Этот аудит проверяет:
- Реальный production build в контейнере
- Environment variables
- Bundle size в runtime
- SSR/Hydration ошибки
- Конфигурацию production режима

## Инструменты
- Bash: docker compose exec, curl
- Read: анализ конфигов

## Пошаговый план

### Шаг 1: Проверить статус и health контейнеров
```bash
docker compose ps
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
```

### Шаг 2: Проверить production mode
```bash
# Frontend NODE_ENV
docker compose exec frontend printenv | grep -E "NODE_ENV|NEXT_PUBLIC"

# Backend ENV
docker compose exec backend printenv | grep -E "NODE_ENV|PAYLOAD"
```
Ожидаемо: NODE_ENV=production

### Шаг 3: Проверить build артефакты
```bash
# Проверить что build существует
docker compose exec frontend ls -la .next/ | head -10

# BUILD_ID
docker compose exec frontend cat .next/BUILD_ID 2>/dev/null || echo "No BUILD_ID"

# Размер chunks
docker compose exec frontend du -sh .next/static/chunks/ 2>/dev/null
docker compose exec frontend ls -la .next/static/chunks/*.js 2>/dev/null | head -20
```

### Шаг 4: Проверить реальный bundle size (HTML response)
```bash
# Получить размер главной страницы
curl -s http://localhost:3010/ | wc -c

# Проверить какие JS chunks загружаются
curl -s http://localhost:3010/ | grep -oE '_next/static/[^"]+\.js' | head -20
```

### Шаг 5: Проверить SSR рендеринг
```bash
# Проверить что страница рендерится на сервере (не пустой HTML)
curl -s http://localhost:3010/ | grep -E "<main|<h1|<title" | head -5

# Проверить наличие hydration errors в HTML
curl -s http://localhost:3010/ | grep -i "hydration\|error\|warning" | head -10
```

### Шаг 6: Проверить логи контейнеров на ошибки
```bash
# Frontend errors
docker compose logs --tail=100 frontend 2>&1 | grep -iE "error|exception|failed|warn" | tail -20

# Backend errors
docker compose logs --tail=100 backend 2>&1 | grep -iE "error|exception|failed" | tail -20

# Проверить restart count
docker compose ps --format "table {{.Name}}\t{{.Status}}" | grep -E "Restarting|unhealthy"
```

### Шаг 7: Проверить production security settings
```bash
# Security headers в runtime
curl -s -I http://localhost:3010/ | grep -iE "x-frame|x-content|strict-transport|content-security"

# CORS в runtime
curl -s -I -X OPTIONS http://localhost:3001/api/tyres \
  -H "Origin: http://localhost:3010" | grep -i "access-control"
```

### Шаг 8: Проверить внешние зависимости
```bash
# Database connection
docker compose exec backend npx payload-cli 2>&1 | head -10

# PostgreSQL
docker compose exec db pg_isready -U postgres 2>&1
```

### Шаг 9: Проверить memory/CPU usage
```bash
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### Шаг 10: Проверить volumes и persistence
```bash
# Проверить mounted volumes
docker compose config --volumes

# Проверить что данные персистятся
docker volume ls | grep -E "postgres\|payload"
```

## Чек-лист
- [ ] Все контейнеры Up и healthy
- [ ] NODE_ENV=production в frontend и backend
- [ ] Build артефакты существуют
- [ ] SSR рендерит контент (не пустой HTML)
- [ ] Нет hydration errors
- [ ] Нет критических ошибок в логах
- [ ] Security headers присутствуют
- [ ] PostgreSQL подключен
- [ ] Memory usage в норме (<80%)
- [ ] Нет Restarting контейнеров
- [ ] Volumes для persistence настроены

## Формат отчёта
Сохранить в: `plan/result_audit/step_cloude/DOCKER_RUNTIME_AUDIT.md`
```

---

## 9. Content Automation Audit

```
Роль: Content Engineer
Задача: Провести аудит системи автоматизації контенту

## Инструменты
- Bash: запуск automation команд
- Read: анализ конфигов и кода
- Grep: поиск паттернов

## Пошаговый план

### Шаг 1: Проверить структуру Content Automation
```bash
ls -la backend-payload/content-automation/
ls -la backend-payload/content-automation/src/
```

### Шаг 2: Проверить конфигурацию
Прочитать:
- `backend-payload/content-automation/src/config/`
- Environment variables для ANTHROPIC_API_KEY, TELEGRAM_*

### Шаг 3: Проверить scrapers
Прочитать:
- `backend-payload/content-automation/src/scrapers/`

```bash
# Проверить scrapers работают
cd backend-payload && npm run automation:scrape -- --dry-run 2>&1 | head -30
```

### Шаг 4: Проверить AI processors
Прочитать:
- `backend-payload/content-automation/src/processors/`

```bash
# Проверить что Claude API настроен
grep -rn "ANTHROPIC\|claude" backend-payload/content-automation --include="*.ts" | head -20
```

### Шаг 5: Проверить publishers
Прочитать:
- `backend-payload/content-automation/src/publishers/`

```bash
# CMS publisher
grep -rn "payload\|/api/" backend-payload/content-automation/src/publishers --include="*.ts" | head -20
```

### Шаг 6: Проверить Telegram integration
```bash
grep -rn "TELEGRAM\|sendMessage" backend-payload/content-automation --include="*.ts" | head -20
```

### Шаг 7: Проверить daemon mode
Прочитать:
- `backend-payload/content-automation/src/daemon/`

```bash
# Cron jobs
grep -rn "cron\|schedule\|interval" backend-payload/content-automation --include="*.ts" | head -20
```

### Шаг 8: Проверить error handling
```bash
grep -rn "try\|catch\|throw\|Error" backend-payload/content-automation/src --include="*.ts" | head -30
```

### Шаг 9: Проверить тесты
```bash
ls -la backend-payload/content-automation/src/__tests__/ 2>/dev/null || echo "No tests dir"
cd backend-payload && npm run test 2>&1 | tail -20
```

### Шаг 10: Проверить CLI help
```bash
cd backend-payload && npm run automation -- --help 2>&1
```

## Чек-лист
- [ ] Структура scrapers/processors/publishers понятна
- [ ] Конфигурация через environment variables
- [ ] Scrapers обрабатывают ошибки сети
- [ ] AI processors используют Claude API правильно
- [ ] Publishers валидируют данные перед отправкой
- [ ] Telegram notifications настроены
- [ ] Daemon mode с cron работает
- [ ] Error handling во всех компонентах
- [ ] Есть тесты
- [ ] CLI документирован

## Формат отчёта
Сохранить в: `plan/result_audit/step_cloude/CONTENT_AUTOMATION_AUDIT.md`
```

---

## 10. META-PROMPT (Lead Engineer)

```
Роль: Lead Engineer
Задача: Агрегувати результати всіх аудитів і скласти план релізу

## Входные данные
Прочитать все отчёты из: `plan/result_audit/step_cloude/`
- FUNCTIONAL_AUDIT.md
- PERFORMANCE_AUDIT.md
- ACCESSIBILITY_AUDIT.md
- SEO_AUDIT.md
- UI_UX_AUDIT.md
- SECURITY_AUDIT.md
- ANALYTICS_MONITORING_AUDIT.md
- DOCKER_RUNTIME_AUDIT.md
- CONTENT_AUTOMATION_AUDIT.md

## Пошаговый план

### Шаг 1: Собрать все CRITICAL и HIGH issues
Из каждого отчёта выписать проблемы с severity CRITICAL и HIGH.

### Шаг 2: Определить блокеры релиза
Критерии блокера:
- Security уязвимости (XSS, утечки ключей)
- Критические баги функциональности
- Неработающие основные сценарии
- Падающий production build

### Шаг 3: Сгруппировать проблемы
По областям:
1. Security
2. Functionality
3. Performance
4. Accessibility
5. UI/UX
6. SEO
7. Monitoring
8. Content Automation

### Шаг 4: Расставить приоритеты
```
P0 (блокер): Виправити до релізу
P1 (критично): Виправити в перший тиждень після релізу
P2 (важливо): Виправити протягом місяця
P3 (покращення): Backlog
```

### Шаг 5: Составить план релиза
Формат:
```markdown
## Release Readiness Report

### Blockers (P0) - Must fix before release
1. [SECURITY] Issue description
2. [FUNCTIONAL] Issue description

### Critical (P1) - Fix within first week
1. ...

### Important (P2) - Fix within month
1. ...

### Backlog (P3) - Nice to have
1. ...

### Release Recommendation
[ ] READY for production
[ ] BLOCKED - requires fixes
[ ] CONDITIONAL - can release with known issues
```

## Формат отчёта
Сохранить в: `plan/result_audit/step_cloude/RELEASE_READINESS_REPORT.md`
```

---

## Параллельный запуск агентов (рекомендуется)

Аудиты 1-9 **независимы** друг от друга и могут выполняться параллельно.
Только META-PROMPT (10) зависит от результатов всех остальных.

```
┌─────────────────────────────────────────────────────────────┐
│                    ПАРАЛЛЕЛЬНА ФАЗА                         │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Functional│ │Performan.│ │  A11y    │ │   SEO    │       │
│  │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│       │            │            │            │              │
│  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐       │
│  │  UI/UX   │ │ Security │ │Analytics │ │  Docker  │       │
│  │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│       │            │            │            │              │
│       │       ┌────┴─────┐     │            │              │
│       │       │ Content  │     │            │              │
│       │       │Automation│     │            │              │
│       │       └────┬─────┘     │            │              │
│       │            │            │            │              │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                  ФІНАЛЬНА ФАЗА (після всіх)                 │
│                                                             │
│              ┌─────────────────────────┐                    │
│              │   META-PROMPT Agent     │                    │
│              │   (Lead Engineer)       │                    │
│              └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Промпты для параллельного запуска

Запустить **9 агентов параллельно** с этими промптами:

**Agent 1 - Functional:**
```
Проведи функціональний аудит за інструкцією з plan/prompt/AUDIT_AI_AGENT_PROMPTS.md (секція 1).
Docker працює: frontend :3010, backend :3001.
Збережи звіт у plan/result_audit/step_cloude/FUNCTIONAL_AUDIT.md
```

**Agent 2 - Performance:**
```
Проведи аудит продуктивності за інструкцією з plan/prompt/AUDIT_AI_AGENT_PROMPTS.md (секція 2).
Збережи звіт у plan/result_audit/step_cloude/PERFORMANCE_AUDIT.md
```

**Agent 3 - Accessibility:**
```
Проведи аудит доступності за інструкцією з plan/prompt/AUDIT_AI_AGENT_PROMPTS.md (секція 3).
Збережи звіт у plan/result_audit/step_cloude/ACCESSIBILITY_AUDIT.md
```

**Agent 4 - SEO:**
```
Проведи SEO-аудит за інструкцією з plan/prompt/AUDIT_AI_AGENT_PROMPTS.md (секція 4).
Docker працює: frontend :3010.
Збережи звіт у plan/result_audit/step_cloude/SEO_AUDIT.md
```

**Agent 5 - UI/UX:**
```
Проведи аудит UI/UX консистентності за інструкцією з plan/prompt/AUDIT_AI_AGENT_PROMPTS.md (секція 5).
Перевір stone-* палітру, hero-adaptive класи, стандарти з frontend/docs/standards/.
Збережи звіт у plan/result_audit/step_cloude/UI_UX_AUDIT.md
```

**Agent 6 - Security:**
```
Проведи аудит безпеки за інструкцією з plan/prompt/AUDIT_AI_AGENT_PROMPTS.md (секція 6).
Docker працює: frontend :3010, backend :3001.
Збережи звіт у plan/result_audit/step_cloude/SECURITY_AUDIT.md
```

**Agent 7 - Analytics:**
```
Проведи аудит аналітики та моніторингу за інструкцією з plan/prompt/AUDIT_AI_AGENT_PROMPTS.md (секція 7).
Docker працює: backend :3001.
Збережи звіт у plan/result_audit/step_cloude/ANALYTICS_MONITORING_AUDIT.md
```

**Agent 8 - Docker Runtime:**
```
Проведи Docker Runtime аудит за інструкцією з plan/prompt/AUDIT_AI_AGENT_PROMPTS.md (секція 8).
Docker Compose запущений. Перевір:
- Production mode (NODE_ENV)
- Build артефакти та bundle size в контейнері
- SSR рендеринг та hydration
- Логи на помилки
- Memory/CPU usage
- PostgreSQL connectivity
Збережи звіт у plan/result_audit/step_cloude/DOCKER_RUNTIME_AUDIT.md
```

**Agent 9 - Content Automation:**
```
Проведи аудит Content Automation системи за інструкцією з plan/prompt/AUDIT_AI_AGENT_PROMPTS.md (секція 9).
Перевір scrapers, AI processors, publishers, Telegram integration, daemon mode.
Збережи звіт у plan/result_audit/step_cloude/CONTENT_AUTOMATION_AUDIT.md
```

### После завершения всех агентов

**Agent 10 - META (запускать последним):**
```
Ти Lead Engineer. Прочитай всі звіти з plan/result_audit/step_cloude/ і виконай META-PROMPT з plan/prompt/AUDIT_AI_AGENT_PROMPTS.md (секція 10).
Створи підсумковий RELEASE_READINESS_REPORT.md з пріоритизацією P0-P3.
```

---

## Последовательный запуск (один агент)

Для запуска всех аудитов одним агентом:

```
Виконай повний аудит проєкту перед релізом.

1. Проведи кожен з 9 аудитів по порядку:
   - Functional
   - Performance
   - Accessibility
   - SEO
   - UI/UX
   - Security
   - Analytics/Monitoring
   - Docker Runtime
   - Content Automation

2. Для кожного аудиту:
   - Дотримуйся покрокового плану з AUDIT_AI_AGENT_PROMPTS.md
   - Зберігай звіт у plan/result_audit/step_cloude/
   - Використовуй формат з Executive Summary та чек-листом

3. Після всіх аудитів:
   - Виконай META-PROMPT
   - Створи RELEASE_READINESS_REPORT.md

Оточення: Docker Compose запущений, frontend на :3010, backend на :3001
```

---

## Примечания

### Когда обновлять промпты
- После добавления новых страниц/роутов
- После изменения структуры проекта
- После добавления новых коллекций в Payload CMS
- После изменения Content Automation pipeline
- После изменения security конфигурации

### Особенности проекта Bridgestone
- Украинский язык UI (lang="uk")
- stone-* цветовая палитра (НЕ zinc/gray)
- hero-adaptive/hero-dark классы для hero секций
- Content Automation с Claude AI и Telegram
- Payload CMS v3 как backend
- Basic HTTP Auth для Admin Dashboard

### Ограничения AI-аудита
- Не может проверить визуальные баги (нужен скриншот-тестинг или Playwright)
- Не может проверить реальную производительность (нужен Lighthouse)
- Не заменяет penetration testing для security
- Не может полноценно тестировать Payload Admin без credentials
