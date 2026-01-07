# Фаза 3: API інтеграція

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Підключити frontend до CMS API, замінити mock дані на реальні.

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз API

#### A. Існуючий API шар
- [ ] Переглянути `frontend/src/lib/api/tyres.ts`
- [ ] Переглянути `frontend/src/lib/api/dealers.ts`
- [ ] Переглянути `frontend/src/lib/api/articles.ts`

**Функції для заміни:**
- `getTyreModels()` → fetch from CMS
- `getTyreModelBySlug(slug)` → fetch from CMS
- `searchTyresBySize(params)` → fetch with filters
- `getDealers()` → fetch from CMS
- `getArticles()` → fetch from CMS
- `getArticleBySlug(slug)` → fetch from CMS

---

### 3.1 Налаштування API клієнта
- [ ] Створити `frontend/src/lib/cms.ts` для базових fetch функцій
- [ ] Додати env змінну `NEXT_PUBLIC_CMS_URL`
- [ ] Додати обробку помилок

**Файли:** `frontend/src/lib/cms.ts`, `frontend/.env.local`
**Нотатки:** -

---

### 3.2 Оновити tyres.ts
- [ ] Замінити mock на fetch до CMS
- [ ] Зберегти сигнатури функцій (backward compatible)
- [ ] Додати error handling
- [ ] Протестувати пошук за розміром
- [ ] Протестувати пошук за авто

**Файли:** `frontend/src/lib/api/tyres.ts`
**Нотатки:** -

---

### 3.3 Оновити dealers.ts
- [ ] Замінити mock на fetch до CMS
- [ ] Перевірити фільтрацію

**Файли:** `frontend/src/lib/api/dealers.ts`
**Нотатки:** -

---

### 3.4 Оновити articles.ts
- [ ] Замінити mock на fetch до CMS
- [ ] Перевірити отримання повного тексту статті

**Файли:** `frontend/src/lib/api/articles.ts`
**Нотатки:** -

---

### 3.5 Тестування всіх сторінок
- [ ] Головна сторінка — категорії, популярні шини
- [ ] Каталог — список шин з фільтрами
- [ ] Картка шини — всі дані відображаються
- [ ] Пошук — результати з CMS
- [ ] Дилери — список з CMS
- [ ] Статті — список та окрема стаття
- [ ] Технології — список з прив'язкою до шин

**Нотатки:** -

---

## При завершенні фази

1. Убедись, що всі задачі відмічені [x]
2. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(cms): phase-3 API integration completed"
   ```
3. Онови PROGRESS.md
4. Відкрий phase-04-roles.md
