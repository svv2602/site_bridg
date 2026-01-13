# Фаза 2: Токен-система

## Статус
- [x] Не начата
- [x] В процессе
- [x] Завершена

**Начата:** 2026-01-13
**Завершена:** 2026-01-13

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
- [x] Изучить `:root` секцию в globals.css
- [x] Изучить `.dark` секцию в globals.css
- [x] Найти все использования прямых hex в globals.css
- [x] Определить недостающие токены по аудиту

**Результаты анализа:**
- `--graphite-hover: #2A2F34` - УЖЕ СУЩЕСТВУЕТ ✅
- `--silver-muted: #BFC3C7` - УЖЕ СУЩЕСТВУЕТ ✅
- `.dark` секция называется `:root[data-theme="dark"]`
- Прямые hex используются в hero-* классах (допустимо для гарантии контраста)

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
- [x] Список токенов для header
- [x] Список токенов для text-label/caption
- [x] Токен silver-muted - УЖЕ СУЩЕСТВУЕТ

**Новые токены (план):**
```css
/* Header токены - хедер всегда темный */
--header-bg: var(--stone-950);        /* #0c0a09 */
--header-text: #ffffff;
--header-border: rgba(255,255,255,0.1);

/* Text токены */
--text-label: var(--stone-700);       /* Light: #44403c */
--text-caption: var(--stone-500);     /* Light: #78716c */
/* Dark: использовать --text-secondary (#8B8F94) и --text-muted (#6F7378) */

/* Disabled состояния */
--disabled-bg: var(--stone-200);      /* Light */
--disabled-text: var(--stone-400);    /* Light */
/* Dark: --disabled-bg: var(--graphite); --disabled-text: var(--text-muted) */
```

**Цель:** Спланировать все новые токены ПЕРЕД внесением изменений.

---

### 2.1 Добавить header-токены в :root (Light)
- [x] `--header-bg` для светлого хедера (если применимо)
- [x] `--header-text` для текста хедера
- [x] `--header-border` для бордера хедера
- [x] Документировать в комментарии

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** Хедер остается темным в обеих темах (--stone-950)

---

### 2.2 Добавить header-токены в .dark
- [x] Настроить `--header-bg` для Dark (если отличается)
- [x] Настроить `--header-text` для Dark
- [x] Настроить `--header-border` для Dark

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** Использует --black-base, --text-primary, --border-dark

---

### 2.3 Добавить text-label и text-caption токены
- [x] `--text-label` - для лейблов форм (более контрастный чем muted)
- [x] `--text-caption` - для мелких подписей
- [x] Настроить для Light темы (darker than muted)
- [x] Настроить для Dark темы

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** Light: --stone-700/--stone-500, Dark: --text-secondary/--text-muted

---

### 2.4 Добавить silver-muted токен
- [x] `--silver-muted` для вторичных CTA в Dark теме
- [x] Менее яркий чем --silver-accent
- [x] Добавить в :root и .dark

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** УЖЕ СУЩЕСТВОВАЛ: --silver-muted: #BFC3C7

---

### 2.5 Добавить disabled-состояния как токены
- [x] `--disabled-bg` - фон disabled элементов
- [x] `--disabled-text` - текст disabled элементов
- [x] Настроить для Light и Dark
- [x] Обновить btn-* классы для использования токенов

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** Добавлены токены и в @theme inline для Tailwind

---

### 2.6 Добавить graphite-hover если отсутствует
- [x] Проверить наличие `--graphite-hover`
- [x] Если нет - добавить (lighter than --graphite)
- [x] Убедиться что значение достаточно контрастное

**Файлы:** `frontend/src/app/globals.css`
**Нотатки:** УЖЕ СУЩЕСТВОВАЛ: --graphite-hover: #2A2F34

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
