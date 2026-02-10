# Фаза 12: Інтеграція генерації зображень у article pipeline

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Інтегрувати `article-images.ts` у smart article pipeline. Зображення генеруються після тексту, завантажуються в Media, та прив'язуються до статті. Контролюється через setting `image_generation_enabled`.

## Задачі

### 12.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Прочитати `article-images.ts` — як генеруються зображення
- [x] Прочитати `article-pipeline.ts:363-387` — `publishArticleToCMS()`
- [x] Прочитати `payload-client.ts:65-76` — `ArticleData` (має `image?: number`)
- [x] Прочитати `Articles.ts:83-86` — CMS поле `image`
- [x] Прочитати `blog/[slug]/page.tsx:167-180` — відображення featured image
- [x] Перевірити `payload-client.ts` — метод `uploadImageFromUrl()`

#### B. Обрати підхід
- [x] Варіант A: Інтегрувати `article-images.ts` у pipeline після генерації тексту ← ОБРАНО

**Обране рішення:** Варіант A

---

### 12.1 Інтегрувати генерацію зображення в pipeline
- [x] Вивчити API `article-images.ts` — `generateHeroImage(topic, season)`
- [x] У `processQueue()` після `generateArticle()` — додати крок генерації зображення
- [x] Обробити помилку генерації зображення gracefully (не блокувати публікацію)
- [x] Завантажити згенероване зображення в Payload Media через `uploadImageFromUrl()`

**Файли:** `backend-payload/content-automation/src/article-pipeline.ts`

---

### 12.2 Передати image ID при публікації
- [x] У `publishArticleToCMS()` — додати `image: mediaId` якщо зображення згенероване
- [x] Передати Media ID як number (Payload relationship)

**Файли:** `backend-payload/content-automation/src/article-pipeline.ts`

---

### 12.3 Додати setting для контролю
- [x] У `article-queue.ts` settings — `image_generation_enabled` вже існує (default false)
- [x] У `processQueue()` — перевіряти setting перед генерацією зображення

**Файли:** `backend-payload/content-automation/src/db/article-queue.ts`
**Нотатки:** Setting вже був у defaults — додатково створювати не потрібно

---

### 12.4 Перевірка та тестування
- [x] Перевірити що image ID правильно зв'язаний зі статтею
- [x] Перевірити що без setting зображення не генерується
- [x] Запустити тести

**Нотатки:** Всі 377 тестів пройшли.

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x] ✅
2. Зміни статус фази: [x] Завершена ✅
3. Заповни дату "Завершена: 2026-02-10" ✅
4. Виконай коміт ✅
5. Онови PROGRESS.md ✅
