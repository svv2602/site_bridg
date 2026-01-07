# Фаза 1: Вибір та налаштування CMS

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Обрати CMS, розгорнути локально, базове налаштування.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз вимог
- [ ] Переглянути типи даних в `frontend/src/lib/data.ts`
- [ ] Підрахувати кількість content types (шини, дилери, статті, технології, fitments)
- [ ] Визначити складність зв'язків між моделями

**Кількість content types:** 5-6
**Складні зв'язки:** Tyre ↔ Technology (many-to-many), Tyre ↔ TyreSize (one-to-many)

#### B. Вибір CMS
- [ ] Оцінити варіанти (Strapi, Payload, Sanity, Directus)
- [ ] Прийняти рішення

**Обрана CMS:** -
**Причина вибору:** -

**Нотатки:** -

---

### 1.1 Ініціалізація CMS проекту
- [ ] Створити папку `backend/` або `cms/`
- [ ] Ініціалізувати CMS проект
- [ ] Запустити локально

**Команди для Strapi:**
```bash
npx create-strapi-app@latest backend --quickstart
```

**Команди для Payload:**
```bash
npx create-payload-app@latest
```

**Файли:** `backend/` або `cms/`
**Нотатки:** -

---

### 1.2 Базове налаштування
- [ ] Налаштувати database (SQLite для dev, PostgreSQL для prod)
- [ ] Створити admin користувача
- [ ] Перевірити доступ до адмін-панелі

**URL адмін-панелі:** http://localhost:1337/admin (Strapi)
**Нотатки:** -

---

### 1.3 Env змінні
- [ ] Створити `.env` для backend
- [ ] Додати в `.gitignore` секрети
- [ ] Створити `.env.example`

**Файли:** `backend/.env`, `backend/.env.example`
**Нотатки:** -

---

## При завершенні фази

1. Убедись, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(cms): phase-1 CMS setup completed"
   ```
4. Онови PROGRESS.md
5. Відкрий phase-02-content-types.md
