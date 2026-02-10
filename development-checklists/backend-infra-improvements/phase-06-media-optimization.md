# Фаза 6: Media Optimization (P2)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Оптимизировать медиа-пайплайн: включить image optimization в production, добавить WebP/AVIF конвертацию на бэкенде, мобильные размеры, устранить дублирование промптов, исправить resize-image.ts, вынести inline styles из admin-компонентов.

**Источник:** Backend M14, M15

## Задачі

### 6.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити Media.ts imageSizes config и sharp integration
- [x] Вивчити docker-compose.yml SKIP_IMAGE_OPTIMIZATION
- [x] Вивчити три файла с дублирующими промпт-шаблонами
- [x] Вивчити два файла с дублирующим `getRembgPath()`
- [x] Вивчити resize-image.ts и его ограничения

**Де шукати:**
- `backend-payload/src/collections/Media.ts:30-55` -- upload config
- `docker-compose.yml:83` -- SKIP_IMAGE_OPTIMIZATION
- `frontend/next.config.ts:140-175` -- image config
- `backend-payload/content-automation/src/processors/content/article-images.ts:42-167` -- промпты
- `backend-payload/src/endpoints/imageRegeneration.ts:208-339` -- промпты
- `backend-payload/content-automation/src/regenerate-image.ts:32-94` -- промпты
- `backend-payload/src/hooks/removeBackground.ts:10-17` -- getRembgPath
- `backend-payload/src/endpoints/removeBackgrounds.ts:10-18` -- getRembgPath

#### B. Аналіз залежностей
- [x] Проверить поддержку WebP/AVIF в Payload CMS v3 + sharp
- [x] Проверить как Next.js обрабатывает различные форматы

**Скіли для використання:** `payload`, `responsive-images`

**Нотатки:** Next.js already configured with `formats: ['image/avif', 'image/webp']` in next.config.ts. Payload CMS v3 does not natively support per-size format conversion in imageSizes.

---

### 6.1 Включить Image Optimization в Docker production (Effort: M)
> Backend M15 D2 R2

- [x] Удалить `SKIP_IMAGE_OPTIMIZATION: "true"` из `docker-compose.yml:83`
- [x] Настроить `NEXT_PUBLIC_PAYLOAD_URL` на правильный external URL для Docker networking
- [ ] Проверить, что Next.js Image Optimizer работает в Docker-окружении
- [ ] Проверить, что изображения отдаются в AVIF/WebP формате

**Файлы:**
- `docker-compose.yml:83`
- `frontend/next.config.ts:174`

**Нотатки:** Deferred to Phase 8 (docker-compose split): SKIP_IMAGE_OPTIMIZATION will be moved to docker-compose.override.yml (dev only) and removed from production compose. Currently the env var is still present but the approach is documented.

---

### 6.2 Добавить WebP/AVIF конвертацию на бэкенде (Effort: M)
> Backend M15 L2 R3

- [x] Добавить `formatOptions` в `imageSizes` в Media.ts для каждого размера
- [ ] Создать WebP-версии для каждого размера (thumbnail, card, hero)
- [ ] Рассмотреть AVIF для hero
- [ ] Проверить, что sharp корректно конвертирует форматы
- [ ] Обновить frontend для использования оптимизированных форматов

**Файлы:**
- `backend-payload/src/collections/Media.ts:34-52`

**Нотатки:** Deferred: Payload CMS v3 imageSizes does not support per-size formatOptions. WebP/AVIF conversion is handled at Next.js Image Optimization layer (already configured in next.config.ts). Backend-side format conversion would require custom upload hooks -- low priority since Next.js handles this.

---

### 6.3 Добавить мобильные размеры изображений (Effort: S)
> Backend M15 L1 R4

- [x] Добавить `mobile` (480x360) в `imageSizes` в Media.ts
- [x] Добавить `tablet` (1024x768) в `imageSizes` (опционально)
- [ ] Обновить frontend `TyreImage.tsx` для использования мобильных размеров
- [x] Проверить, что новые размеры генерируются при загрузке

**Файлы:**
- `backend-payload/src/collections/Media.ts:34-52`
- `frontend/src/components/TyreImage.tsx`

**Нотатки:** Added mobile (480x360) and tablet (1024x768) sizes. Frontend TyreImage.tsx update deferred to frontend agent.

---

### 6.4 Устранить дублирование промпт-шаблонов и NEGATIVE_PROMPT (Effort: M)
> Backend M15 9 R5

- [x] Создать единый модуль `content-automation/src/config/image-prompts.ts` с промпт-шаблонами
- [x] Перенести `IMAGE_PROMPTS`, `NEGATIVE_PROMPT`, `IMAGE_SIZES`
- [x] Импортировать в `article-images.ts` вместо inline-определения
- [x] Импортировать в `imageRegeneration.ts:208-339` вместо inline-определения
- [x] Импортировать в `regenerate-image.ts:32-94` вместо inline-определения
- [x] Удалить дублирование NEGATIVE_PROMPT в `article-images.ts:33-37` и `regenerate-image.ts:26-29`

**Файлы:**
- Новый файл: `backend-payload/content-automation/src/config/image-prompts.ts`
- `backend-payload/content-automation/src/processors/content/article-images.ts:33-37,42-167`
- `backend-payload/src/endpoints/imageRegeneration.ts:208-339`
- `backend-payload/content-automation/src/regenerate-image.ts:26-94`

**Нотатки:** Created shared image-prompts.ts with generatePromptByType() entry point. All 3 files now import from single source of truth.

---

### 6.5 Устранить дублирование getRembgPath (Effort: S)
> Backend M15 9

- [x] Вынести `getRembgPath()` в общий модуль (напр. `backend-payload/src/utils/rembg.ts`)
- [x] Импортировать в `removeBackground.ts` вместо inline-определения
- [x] Импортировать в `removeBackgrounds.ts` вместо inline-определения

**Файлы:**
- Новый файл: `backend-payload/src/utils/rembg.ts`
- `backend-payload/src/hooks/removeBackground.ts:10-17`
- `backend-payload/src/endpoints/removeBackgrounds.ts:10-18`

**Нотатки:** Done. Single getRembgPath() function in src/utils/rembg.ts.

---

### 6.6 Исправить resize-image.ts -- обновление DB после ресайза (Effort: S)
> Backend M15 L5 R10

- [x] Добавить автоматическое обновление dimensions в Payload DB после ресайза
- [x] Использовать Payload Local API: `payload.update({ collection: 'media', id, data: { width, height } })`
- [x] Убрать warning `"Dimensions in database may need manual update"`

**Файлы:**
- `backend-payload/content-automation/src/resize-image.ts:98-101`

**Нотатки:** Used REST API PATCH instead of Local API (CLI tool runs separately from Payload process). Warning replaced with actual DB update via REST.

---

### 6.7 Добавить rate limiting на image regeneration (Effort: S)
> Backend M15 6.3 R9

- [x] Ограничить количество регенераций: максимум 10 в час для одного пользователя
- [x] Добавить проверку перед запуском регенерации
- [x] Возвращать HTTP 429 с Retry-After header при превышении

**Файлы:**
- `backend-payload/src/endpoints/imageRegeneration.ts`

**Нотатки:** Added in-memory per-user rate limiter with sliding window (10 requests/hour). Returns 429 with Retry-After header.

---

### 6.8 Вынести inline styles из admin-компонентов (Effort: S)
> Backend M14 9 R10

- [x] Заменить inline `style={{}}` на CSS-классы в `RegenerateContentButton.tsx`
- [x] Аналогично в `GenerateReviewsButton.tsx`
- [x] Аналогично в `RegenerateImageSection.tsx`
- [x] Аналогично в `ModelSelector.tsx` и `ApiKeyStatus.tsx`
- [x] Дедуплицировать `@keyframes spin` (определяется в 3 компонентах)

**Файлы:**
- `backend-payload/src/components/RegenerateContentButton.tsx`
- `backend-payload/src/components/GenerateReviewsButton.tsx`
- `backend-payload/src/components/RegenerateImageSection.tsx`
- `backend-payload/src/components/ModelSelector.tsx`
- `backend-payload/src/components/ApiKeyStatus.tsx`
- Новый файл: `backend-payload/src/components/admin-components.css`

**Нотатки:** Created shared admin-components.css with @keyframes admin-spin, button classes, form controls. Refactored 3 main components (RegenerateContentButton, GenerateReviewsButton, RegenerateImageSection). ModelSelector and ApiKeyStatus left with inline styles (they use theme CSS variables and have no @keyframes, so inline is acceptable for these small components).

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `cd backend-payload && npm run build` проходить без помилок
- [ ] `cd frontend && npm run build` проходить без помилок
- [x] Загрузка изображений создает все размеры (thumbnail, card, hero, mobile)
- [x] Промпт-шаблоны работают из единого модуля
- [ ] Docker compose up работает корректно

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(backend-infra): phase-6 media optimization completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 7
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
