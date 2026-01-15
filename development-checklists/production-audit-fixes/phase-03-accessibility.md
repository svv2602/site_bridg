# Фаза 3: Accessibility Fixes

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Покращити доступність сайту відповідно до WCAG AA: skip navigation, touch targets, form labels для користувачів з обмеженими можливостями.

---

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити структуру layout.tsx
- [ ] Знайти всі form inputs
- [ ] Знайти дрібні interactive елементи (icons, links)
- [ ] Перевірити існуючі aria-labels

**Команди для пошуку:**
```bash
# Layout структура
head -100 frontend/src/app/layout.tsx

# Form inputs
grep -rn "<input\|<select\|<textarea" frontend/src/components/

# aria-label usage
grep -rn "aria-label" frontend/src/

# sr-only class usage
grep -rn "sr-only" frontend/src/
```

#### B. Ідентифікація проблемних елементів
- [ ] Список form inputs без labels (3 знайдено)
- [ ] Список малих touch targets (54 елементи)
- [ ] Місце для skip-link в DOM

**Inputs без labels:** -
**Малі touch targets:** social icons, small buttons
**Skip-link location:** Першим елементом в body

#### C. Планування виправлень
- [ ] Визначити стиль skip-link (sr-only + focus visible)
- [ ] Визначити мінімальний touch target size (44x44px)

**Skip-link стиль:** `sr-only focus:not-sr-only focus:absolute ...`
**Touch target approach:** padding або min-width/min-height

**Нотатки для перевикористання:** -

---

### 3.1 Додати Skip Navigation Link

**Проблема:** Відсутній "Skip to main content" link для keyboard users (WCAG 2.4.1).

**Підзадачі:**
- [ ] Додати skip-link компонент в layout.tsx
- [ ] Переконатися що #main id існує на main елементі
- [ ] Стилізувати: прихований за замовчуванням, видимий при focus
- [ ] Протестувати keyboard navigation (Tab)

**Файли:** `frontend/src/app/layout.tsx`

**Код:**
```tsx
// На початку body, після <html> та <body> tags
<a
  href="#main"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
>
  Перейти до основного вмісту
</a>

// Додати id="main" до main елементу
<main id="main" className="...">
```

**Тестування:**
1. Відкрити сайт
2. Натиснути Tab
3. Перший focus має бути на skip-link
4. Enter має scroll до main content

**Нотатки:** -

---

### 3.2 Виправити Touch Target Sizes

**Проблема:** 54 interactive елементи менші за 44x44px (WCAG 2.5.5).

**Підзадачі:**
- [ ] Ідентифікувати найпроблемніші елементи (social icons, small buttons)
- [ ] Додати padding для збільшення touch area
- [ ] Використати `min-w-11 min-h-11` (44px) для критичних елементів
- [ ] Перевірити що visual appearance не змінився суттєво

**Типові проблемні елементи:**
1. Social media icons в footer
2. Маленькі icon buttons (close, menu toggle)
3. Pagination links

**Рішення для icon buttons:**
```tsx
// До
<button className="p-1">
  <Icon className="w-4 h-4" />
</button>

// Після - touch target 44x44
<button className="p-3 min-w-11 min-h-11 flex items-center justify-center">
  <Icon className="w-4 h-4" />
</button>
```

**Рішення для inline links:**
```tsx
// Додати padding без візуальної зміни
<a className="inline-flex items-center py-2 -my-2">
  Link text
</a>
```

**Файли для перевірки:**
- `frontend/src/components/Footer.tsx`
- `frontend/src/components/MainHeader.tsx`
- Components з icon buttons

**Нотатки:** -

---

### 3.3 Додати Labels для Form Inputs

**Проблема:** 3 з 4 form inputs не мають proper labels (WCAG 1.3.1, 4.1.2).

**Підзадачі:**
- [ ] Знайти всі unlabeled inputs
- [ ] Додати aria-label або пов'язати з label element
- [ ] Перевірити screen reader compatibility

**Файли для перевірки:**
- `frontend/src/app/tyre-search/` - search form
- `frontend/src/components/` - newsletter, contact forms

**Рішення 1 - aria-label:**
```tsx
<input
  type="email"
  aria-label="Електронна пошта для підписки"
  placeholder="Ваш email"
/>
```

**Рішення 2 - пов'язаний label:**
```tsx
<label htmlFor="email" className="sr-only">
  Електронна пошта
</label>
<input
  id="email"
  type="email"
  placeholder="Ваш email"
/>
```

**Рішення 3 - для select:**
```tsx
<label htmlFor="tyre-width" className="sr-only">
  Ширина шини
</label>
<select id="tyre-width" aria-label="Виберіть ширину шини">
  ...
</select>
```

**Нотатки:** Надавати перевагу aria-label для простоти

---

### 3.4 Перевірити Focus Indicators

**Проблема:** Переконатися що всі interactive елементи мають видимий focus state.

**Підзадачі:**
- [ ] Протестувати keyboard navigation через весь сайт
- [ ] Перевірити що focus ring видимий на всіх кнопках
- [ ] Перевірити focus на links та form elements
- [ ] Виправити елементи з невидимим focus

**Тестування:**
1. Відкрити homepage
2. Натискати Tab послідовно
3. Кожен focused елемент має бути візуально помітним

**Default focus classes (якщо потрібно додати):**
```css
/* В globals.css або tailwind */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

**Нотатки:** -

---

### 3.5 Перевірка Accessibility

**Підзадачі:**
- [ ] Протестувати skip-link з keyboard
- [ ] Протестувати touch targets на mobile
- [ ] Протестувати form inputs з screen reader (optional)
- [ ] Запустити Lighthouse accessibility audit

**Команди перевірки:**
```bash
# Перевірити aria-labels
curl -s http://localhost:3010 | grep -c "aria-label"

# Перевірити skip-link
curl -s http://localhost:3010 | grep "Перейти до основного"

# Перевірити id="main"
curl -s http://localhost:3010 | grep 'id="main"'
```

**Lighthouse accessibility score target:** >90

**Результати тестування:** -

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
   git commit -m "checklist(production-audit): phase-3 accessibility fixes completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 4
   - Загальний прогрес: 20/24 (83%)
   - Додай запис в історію
6. Відкрий `phase-04-final-optimizations.md` та продовж роботу
