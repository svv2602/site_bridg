# Фаза 4: Публичные компоненты

## Статус
- [ ] Не начата
- [ ] В процессе
- [ ] Завершена

**Начата:** -
**Завершена:** -

## Цель фазы
Мигрировать публичные компоненты на семантические токены.
После этой фазы:
- MainHeader использует header-токены
- Hover-состояния навигации явно различимы
- Нет прямых hex в компонентах для нейтральных цветов
- Все zinc-* заменены на stone/graphite/semantic

## Задачи

### 4.0 ОБЯЗАТЕЛЬНО: Анализ и планирование

#### A. Инвентаризация проблемных мест
- [ ] Найти все zinc в публичных компонентах
- [ ] Найти все stone-900/800 в компонентах
- [ ] Найти прямые hex (#0c0a09, #1c1917, etc.)

**Команды для анализа:**
```bash
# zinc в компонентах
grep -rn "zinc" frontend/src/components/
# stone-900/800 (возможные замены на токены)
grep -rn "stone-900\|stone-800" frontend/src/components/
# Прямые hex
grep -rn "#[0-9a-fA-F]\{6\}" frontend/src/components/
# MainHeader детально
grep -n "bg-\|text-\|border-\|hover:" frontend/src/components/MainHeader.tsx
```

#### B. Приоритизация файлов
- [ ] MainHeader.tsx - критический (хедер на всех страницах)
- [ ] Другие компоненты с zinc
- [ ] Hero-секции на страницах

**Порядок миграции:**
1. MainHeader.tsx
2. (другие файлы по результатам поиска)

**Цель:** Понять полный объем работы ПЕРЕД редактированием.

---

### 4.1 Миграция MainHeader.tsx
- [ ] Заменить bg-stone-900 на var(--header-bg) или токен
- [ ] Заменить hover:bg-stone-800 на hover:bg-[var(--graphite-hover)]
- [ ] Улучшить hover-состояния навигации (добавить изменение цвета текста)
- [ ] Проверить в Light режиме
- [ ] Проверить в Dark режиме

**Файлы:** `frontend/src/components/MainHeader.tsx`

**Текущие классы:**
```
bg-stone-900
hover:bg-stone-800
text-stone-*
```

**Замены:**
| Было | Стало |
|------|-------|
| bg-stone-900 | bg-[var(--header-bg)] |
| hover:bg-stone-800 | hover:bg-[var(--graphite-hover)] |
| text-stone-300 | text-[var(--header-text)] |

---

### 4.2 Исправить hover-состояния навигации
- [ ] Добавить transition для плавности
- [ ] Добавить изменение цвета текста при hover
- [ ] Или добавить underline-анимацию
- [ ] Проверить что hover четко различим

**Файлы:** `frontend/src/components/MainHeader.tsx`
**Паттерн hover:**
```tsx
// Вместо просто hover:bg-stone-800
className="transition-colors hover:bg-[var(--graphite-hover)] hover:text-white"
// Или с underline
className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all hover:after:w-full"
```

---

### 4.3 Миграция других компонентов с zinc
- [ ] Обработать список из 4.0.A
- [ ] Применить стандартную карту замен
- [ ] Проверить визуально

**Файлы:** (определить в 4.0)
**Нотатки:** -

---

### 4.4 Удаление прямых hex из компонентов
- [ ] Найти все прямые hex в компонентах
- [ ] Заменить на токены или Tailwind-классы
- [ ] Проверить что цвета не изменились визуально

**Файлы:** (определить в 4.0)
**Замены:**
| Hex | Токен |
|-----|-------|
| #0c0a09 | var(--black-base) |
| #1c1917 | var(--stone-900) или var(--graphite) |

---

### 4.5 Финальный grep-тест
- [ ] `grep -rn "zinc" frontend/src/components/` - должен быть пустым
- [ ] `grep -rn "#0c0a09\|#1c1917" frontend/src/components/` - должен быть пустым
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
   git add frontend/src/components/
   git commit -m "checklist(color-system): phase-4 public-components completed"
   ```
5. Обнови PROGRESS.md:
   - Текущая фаза: 5
   - Добавь запись в историю
6. Открой следующую фазу и продолжи работу
