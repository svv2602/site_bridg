# Фаза 5: P2 SEO — Metadata та Schema.org

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-10
**Завершена:** 2026-01-10

## Ціль фази
Покращити SEO на всіх сторінках:
- Додати metadata для сторінок без неї
- Додати Schema.org розмітку
- Перевірити Open Graph теги

---

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз поточного стану SEO
- [x] Перевірити які сторінки мають metadata
- [x] Перевірити які сторінки мають Schema.org
- [x] Вивчити приклад з shyny/[slug] (найкращий)

#### B. Поточний стан (після виконання)

| Сторінка | Metadata | Schema.org | OpenGraph |
|----------|----------|------------|-----------|
| /shyny/[slug] | OK | OK | OK |
| /advice/[slug] | OK | OK | OK |
| /porivnyaty/[slug] | OK | OK | OK |
| /advice | OK | — | OK ✅ |
| /technology | OK | OK ✅ | OK ✅ |
| /contacts | OK ✅ | OK ✅ | OK ✅ |
| /about | OK ✅ | OK ✅ | OK ✅ |
| / (головна) | OK ✅ | OK ✅ | OK ✅ |

---

### 5.1 /advice — додати OpenGraph

- [x] Вже Server Component
- [x] Вже має `export const metadata`
- [x] Додано OpenGraph теги

**Файл:** `frontend/src/app/advice/page.tsx`

---

### 5.2 /technology — додати OpenGraph та Schema.org

- [x] Додано OpenGraph теги в metadata
- [x] Додано Schema.org ItemList для технологій

**Файл:** `frontend/src/app/technology/page.tsx`

---

### 5.3 /contacts — додати metadata та Schema.org

- [x] Створено layout.tsx з metadata та Schema.org
- [x] Додано title, description, OpenGraph
- [x] Додано Schema.org ContactPage з Organization

**Файли:** `frontend/src/app/contacts/layout.tsx`

---

### 5.4 /about — додати metadata та Schema.org

- [x] Створено layout.tsx з metadata та Schema.org
- [x] Додано title, description, OpenGraph
- [x] Додано Schema.org AboutPage з Organization

**Файли:** `frontend/src/app/about/layout.tsx`

---

### 5.5 Головна сторінка — Schema.org Organization

- [x] Додано OpenGraph теги до root metadata
- [x] Додано Schema.org Organization
- [x] Додано Schema.org WebSite з SearchAction

**Файли:** `frontend/src/app/layout.tsx`

---

### 5.6 /dealers — перевірити Schema.org

- [x] Вже має Schema.org LocalBusiness (перевірено)
- [x] Має layout.tsx з metadata (перевірено)

---

## При завершенні фази

1. [x] Переконайся, що всі задачі відмічені [x]
2. [x] Зміни статус фази: Завершена
3. [x] Заповни дату "Завершена: 2026-01-10"
4. [ ] Виконай коміт
5. [ ] Онови PROGRESS.md
6. [ ] Відкрий `phase-06-p3-improvements.md` та продовж роботу
