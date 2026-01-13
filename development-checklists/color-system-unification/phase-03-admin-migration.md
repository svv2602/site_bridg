# Фаза 3: Миграция админки

## Статус
- [x] Не начата
- [x] В процессе
- [x] Завершена

**Начата:** 2026-01-13
**Завершена:** 2026-01-13

## Цель фазы
Перевести админ-панель с `zinc-*` классов на семантические токены.
После этой фазы:
- Админка использует те же токены что публичная часть
- Нет `bg-zinc-*`, `text-zinc-*`, `border-zinc-*` в админке
- Dark режим в админке соответствует общей системе

## Задачи

### 3.0 ОБЯЗАТЕЛЬНО: Анализ и планирование

#### A. Инвентаризация zinc-классов в админке
- [x] Найти все zinc-классы в admin/layout.tsx - 6 мест
- [x] Найти все zinc-классы в admin/automation/page.tsx - 8 мест
- [x] Найти все zinc-классы в admin/vehicles-import/page.tsx - 10 мест
- [x] Найти zinc в других файлах админки - admin/content-generation/page.tsx - 10 мест

**Команды для анализа:**
```bash
# zinc в админке
grep -rn "zinc" frontend/src/app/admin/
# Список файлов админки
find frontend/src/app/admin -name "*.tsx" -o -name "*.ts"
# Детально по файлам
grep -n "zinc" frontend/src/app/admin/layout.tsx
grep -n "zinc" frontend/src/app/admin/automation/page.tsx
grep -n "zinc" frontend/src/app/admin/vehicles-import/page.tsx
```

#### B. Составление карты замен
- [x] bg-zinc-50 → bg-background или bg-muted
- [x] bg-zinc-100 → bg-muted
- [x] bg-zinc-800/900 → bg-card
- [x] text-zinc-500/600 → text-muted-foreground
- [x] border-zinc-* → border-border

**Карта замен:**
| Было | Стало |
|------|-------|
| bg-zinc-50 | bg-background |
| bg-zinc-100 | bg-muted |
| bg-zinc-800 | bg-card (dark) |
| bg-zinc-900 | bg-background (dark) |
| text-zinc-400 | text-muted-foreground |
| text-zinc-500 | text-muted-foreground |
| border-zinc-200 | border-border |
| border-zinc-700 | border-border (dark) |

**Цель:** Иметь полную карту замен ПЕРЕД редактированием.

---

### 3.1 Миграция admin/layout.tsx
- [x] Заменить bg-zinc-* на семантические токены
- [x] Заменить text-zinc-* на text-muted-foreground и т.д.
- [x] Заменить border-zinc-* на border-border
- [x] Проверить dark: варианты
- [x] Визуально проверить в браузере

**Файлы:** `frontend/src/app/admin/layout.tsx`
**Замены сделаны:** bg-zinc-50/900→bg-background, bg-zinc-800→bg-card, hover:bg-zinc-100/700→hover:bg-muted/card-hover

---

### 3.2 Миграция admin/automation/page.tsx
- [x] Заменить bg-zinc-* на семантические токены
- [x] Заменить text-zinc-* на text-muted-foreground
- [x] Заменить border-zinc-*
- [x] Проверить карточки статистики
- [x] Проверить таблицу jobs

**Файлы:** `frontend/src/app/admin/automation/page.tsx`
**Замены сделаны:** dark:bg-zinc-800→dark:bg-card, bg-zinc-50/900→bg-muted/background

---

### 3.3 Миграция admin/vehicles-import/page.tsx
- [x] Заменить bg-zinc-* на семантические токены
- [x] Заменить text-zinc-*
- [x] Заменить border-zinc-*
- [x] Проверить форму импорта
- [x] Проверить таблицу результатов

**Файлы:** `frontend/src/app/admin/vehicles-import/page.tsx`
**Замены сделаны:** Все zinc→семантические токены

---

### 3.4 Миграция других файлов админки
- [x] Проверить наличие других файлов с zinc
- [x] Применить карту замен
- [x] Проверить визуально

**Файлы:** `frontend/src/app/admin/content-generation/page.tsx`
**Нотатки:** Заменено 10 мест с zinc на семантические токены

---

### 3.5 Проверка консистентности
- [x] Открыть админку в Light режиме
- [x] Открыть админку в Dark режиме
- [x] Проверить читаемость текста
- [x] Проверить различимость карточек от фона
- [x] Проверить hover-состояния

**Скриншоты:** -
**Проблемы:** Нет

---

### 3.6 Финальный grep-тест
- [x] Выполнить `grep -rn "zinc" frontend/src/app/admin/`
- [x] Результат должен быть пустым
- [x] Если есть остатки - устранить

**Результат grep:** No matches found ✅

---

## При завершении фазы

Выполни следующие действия:

1. Убедись, что все задачи отмечены [x]
2. Измени статус фазы:
   - [x] Завершена
3. Заполни дату "Завершена: YYYY-MM-DD"
4. Выполни коммит:
   ```bash
   git add frontend/src/app/admin/
   git commit -m "checklist(color-system): phase-3 admin-migration completed"
   ```
5. Обнови PROGRESS.md:
   - Текущая фаза: 4
   - Добавь запись в историю
6. Открой следующую фазу и продолжи работу
