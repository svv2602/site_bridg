# Фаза 2: Токен-система

## Статус
- [ ] Не начата
- [ ] В процессе
- [ ] Завершена

**Начата:** -
**Завершена:** -

## Цель фазы
Расширить систему токенов в `globals.css` для полной поддержки обеих тем.
После этой фазы будут добавлены:
- Токены для header (bg, text, border)
- Токены для muted-текста (label, caption)
- Токены для disabled-состояний
- Токен silver-muted для вторичных CTA в Dark

## Задачи

### 2.0 ОБЯЗАТЕЛЬНО: Анализ и планирование

#### A. Анализ существующих токенов
- [ ] Изучить `:root` секцию в globals.css
- [ ] Изучить `.dark` секцию в globals.css
- [ ] Найти все использования прямых hex в globals.css
- [ ] Определить недостающие токены по аудиту

**Команды для анализа:**
```bash
# Root токены
grep -A 100 ":root {" frontend/src/app/globals.css | head -100
# Dark токены
grep -A 100 "\.dark {" frontend/src/app/globals.css | head -100
# Прямые hex в btn-* классах
grep -n "#[0-9a-fA-F]" frontend/src/app/globals.css
```

#### B. Планирование новых токенов
- [ ] Список токенов для header
- [ ] Список токенов для text-label/caption
- [ ] Токен silver-muted

**Новые токены:**
```css
/* Header токены (Light/Dark) */
--header-bg: ?
--header-text: ?
--header-border: ?

/* Text токены */
--text-label: ?
--text-caption: ?

/* Secondary CTA */
--silver-muted: ?
```

**Цель:** Спланировать все новые токены ПЕРЕД внесением изменений.

---

### 2.1 Добавить header-токены в :root (Light)
- [ ] `--header-bg` для светлого хедера (если применимо)
- [ ] `--header-text` для текста хедера
- [ ] `--header-border` для бордера хедера
- [ ] Документировать в комментарии

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** Возможно, хедер остается темным в обеих темах - тогда токен один

---

### 2.2 Добавить header-токены в .dark
- [ ] Настроить `--header-bg` для Dark (если отличается)
- [ ] Настроить `--header-text` для Dark
- [ ] Настроить `--header-border` для Dark

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** -

---

### 2.3 Добавить text-label и text-caption токены
- [ ] `--text-label` - для лейблов форм (более контрастный чем muted)
- [ ] `--text-caption` - для мелких подписей
- [ ] Настроить для Light темы (darker than muted)
- [ ] Настроить для Dark темы

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** Решает проблему §2.3 аудита - контраст muted на теплых фонах

---

### 2.4 Добавить silver-muted токен
- [ ] `--silver-muted` для вторичных CTA в Dark теме
- [ ] Менее яркий чем --silver-accent
- [ ] Добавить в :root и .dark

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** Решает проблему §3.2 аудита - перегрузка серебром

---

### 2.5 Добавить disabled-состояния как токены
- [ ] `--disabled-bg` - фон disabled элементов
- [ ] `--disabled-text` - текст disabled элементов
- [ ] Настроить для Light и Dark
- [ ] Обновить btn-* классы для использования токенов

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** Решает проблему §1.3 аудита - консистентное disabled

---

### 2.6 Добавить graphite-hover если отсутствует
- [ ] Проверить наличие `--graphite-hover`
- [ ] Если нет - добавить (lighter than --graphite)
- [ ] Убедиться что значение достаточно контрастное

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** Решает проблему §3.3 аудита - неразличимые hover

---

## При завершении фазы

Выполни следующие действия:

1. Убедись, что все задачи отмечены [x]
2. Измени статус фазы:
   - [x] Завершена
3. Заполни дату "Завершена: YYYY-MM-DD"
4. Выполни коммит:
   ```bash
   git add frontend/src/app/globals.css
   git commit -m "checklist(color-system): phase-2 token-system completed"
   ```
5. Обнови PROGRESS.md:
   - Текущая фаза: 3
   - Добавь запись в историю
6. Открой следующую фазу и продолжи работу
