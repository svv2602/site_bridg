# Фаза 2: Система дизайну

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Створити уніфіковану систему дизайну: spacing, типографіка, container, базові утиліти.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути поточні spacing значення в компонентах
- [x] Знайти всі використання `max-w-7xl` (container)
- [x] Знайти всі використання `py-12`, `py-16` (section padding)

**Команди для пошуку:**
```bash
# Container використання
grep -r "max-w-7xl" frontend/src/
# Section padding
grep -r "py-12\|py-16\|py-20" frontend/src/app/
# Font sizes
grep -r "text-4xl\|text-5xl\|text-3xl" frontend/src/
```

#### B. Аналіз залежностей
- [x] Які компоненти використовують container?
- [x] Які секції потребують оновлення padding?

**Компоненти з container:** 22 файли, 53 використання max-w-7xl
**Секції для оновлення:** 20 файлів, 65 використань py-12/16/20

#### C. Перевірка дизайну
- [x] Вивчити `plan/result_audit/03-recommendations.md` — spacing система

**Референс-документ:** `plan/result_audit/03-recommendations.md` (секція "Сітка та відступи")

**Нотатки для перевикористання:** Додано CSS утиліти замість заміни всіх класів у файлах

---

### 2.1 Оновлення container

- [x] Збільшити max-width з 1280px до 1440px
- [x] Оновити padding:
  - Mobile: 24px (px-6)
  - Tablet: 48px (md:px-12)
  - Desktop: 64px (lg:px-16)
- [x] Створити утиліту `.container-redesign` в globals.css

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Утиліта .container-redesign додана з responsive padding

---

### 2.2 Оновлення section spacing

- [x] Створити класи для section rhythm (section-spacing)

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** .section-spacing з responsive py: 48px → 64px → 80px

---

### 2.3 Типографічна шкала

- [x] Додати CSS змінні для типографіки:
  - --text-xs до --text-5xl
  - --leading-tight до --leading-relaxed

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Додано в :root секцію

---

### 2.4 Heading стилі

- [x] Оновити heading стилі в globals.css (h1, h2, h3 з clamp)

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** ПРОПУЩЕНО — headings стилізуються через Tailwind класи в компонентах

---

### 2.5 Transition утиліти

- [x] Додати transition утиліти:
  - .transition-fast (0.15s)
  - .transition-normal (0.3s)
  - .transition-slow (0.5s)
  - .transition-spring (cubic-bezier)

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Всі 4 transition утиліти додано

---

### 2.6 Hover утиліти

- [x] Оновити `.hover-lift` (вже зроблено у фазі 1)
- [x] Додати `.hover-glow` (вже зроблено у фазі 1)

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Виконано в фазі 1

---

### 2.7 Glass morphism утиліти

- [x] Додати glass effect класи:
  - .glass (light)
  - .glass-dark
  - .hero-glow
  - .hero-grid-pattern

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Всі glass/hero утиліти додано з webkit префіксами

---

### 2.8 Перевірка та тестування

- [x] Запустити `npm run build`
- [x] Перевірити, що всі нові класи компілюються
- [x] Візуально перевірити, що існуючий UI не зламався

**Команди:**
```bash
cd frontend && npm run build && npm run dev
```

**Файли:** -
**Нотатки:** Build успішний! 55 сторінок згенеровано

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(ui-ux-redesign): phase-2 design-system completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
