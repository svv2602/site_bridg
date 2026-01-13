# Фаза 3: Миграция админки

## Статус
- [ ] Не начата
- [ ] В процессе
- [ ] Завершена

**Начата:** -
**Завершена:** -

## Цель фазы
Перевести админ-панель с `zinc-*` классов на семантические токены.
После этой фазы:
- Админка использует те же токены что публичная часть
- Нет `bg-zinc-*`, `text-zinc-*`, `border-zinc-*` в админке
- Dark режим в админке соответствует общей системе

## Задачи

### 3.0 ОБЯЗАТЕЛЬНО: Анализ и планирование

#### A. Инвентаризация zinc-классов в админке
- [ ] Найти все zinc-классы в admin/layout.tsx
- [ ] Найти все zinc-классы в admin/automation/page.tsx
- [ ] Найти все zinc-классы в admin/vehicles-import/page.tsx
- [ ] Найти zinc в других файлах админки

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
- [ ] bg-zinc-50 → bg-background
- [ ] bg-zinc-100 → bg-stone-100 или bg-muted
- [ ] bg-zinc-800/900 → bg-card или bg-[var(--graphite)]
- [ ] text-zinc-500/600 → text-muted-foreground
- [ ] border-zinc-* → border-border

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
- [ ] Заменить bg-zinc-* на семантические токены
- [ ] Заменить text-zinc-* на text-muted-foreground и т.д.
- [ ] Заменить border-zinc-* на border-border
- [ ] Проверить dark: варианты
- [ ] Визуально проверить в браузере

**Файлы:** `frontend/src/app/admin/layout.tsx`
**Замены сделаны:** -

---

### 3.2 Миграция admin/automation/page.tsx
- [ ] Заменить bg-zinc-* на семантические токены
- [ ] Заменить text-zinc-* на text-muted-foreground
- [ ] Заменить border-zinc-*
- [ ] Проверить карточки статистики
- [ ] Проверить таблицу jobs

**Файлы:** `frontend/src/app/admin/automation/page.tsx`
**Замены сделаны:** -

---

### 3.3 Миграция admin/vehicles-import/page.tsx
- [ ] Заменить bg-zinc-* на семантические токены
- [ ] Заменить text-zinc-*
- [ ] Заменить border-zinc-*
- [ ] Проверить форму импорта
- [ ] Проверить таблицу результатов

**Файлы:** `frontend/src/app/admin/vehicles-import/page.tsx`
**Замены сделаны:** -

---

### 3.4 Миграция других файлов админки
- [ ] Проверить наличие других файлов с zinc
- [ ] Применить карту замен
- [ ] Проверить визуально

**Файлы:** (определить в 3.0)
**Нотатки:** -

---

### 3.5 Проверка консистентности
- [ ] Открыть админку в Light режиме
- [ ] Открыть админку в Dark режиме
- [ ] Проверить читаемость текста
- [ ] Проверить различимость карточек от фона
- [ ] Проверить hover-состояния

**Скриншоты:** -
**Проблемы:** -

---

### 3.6 Финальный grep-тест
- [ ] Выполнить `grep -rn "zinc" frontend/src/app/admin/`
- [ ] Результат должен быть пустым
- [ ] Если есть остатки - устранить

**Результат grep:** -

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
