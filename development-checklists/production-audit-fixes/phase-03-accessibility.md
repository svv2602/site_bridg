# Фаза 3: Accessibility Fixes

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-15
**Завершена:** 2026-01-15

## Ціль фази
Покращити доступність сайту відповідно до WCAG AA: skip navigation, touch targets, form labels для користувачів з обмеженими можливостями.

---

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити структуру layout.tsx
- [x] Знайти всі form inputs
- [x] Знайти дрібні interactive елементи (icons, links)
- [x] Перевірити існуючі aria-labels

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
- [x] Список form inputs без labels (3 знайдено)
- [x] Список малих touch targets (54 елементи)
- [x] Місце для skip-link в DOM

**Inputs без labels:** QuickSearchForm.tsx (вже виправлено - всі select мають labels)
**Малі touch targets:** Footer social icons, MainHeader burger, DealerLocatorCompact phone
**Skip-link location:** Першим елементом в body

#### C. Планування виправлень
- [x] Визначити стиль skip-link (sr-only + focus visible)
- [x] Визначити мінімальний touch target size (44x44px)

**Skip-link стиль:** `sr-only focus:not-sr-only focus:fixed ...`
**Touch target approach:** `min-w-11 min-h-11` (44px)

**Нотатки для перевикористання:** min-w-11 min-h-11 flex items-center justify-center

---

### 3.1 Додати Skip Navigation Link

**Проблема:** Відсутній "Skip to main content" link для keyboard users (WCAG 2.4.1).

**Підзадачі:**
- [x] Додати skip-link компонент в layout.tsx
- [x] Переконатися що #main id існує на main елементі
- [x] Стилізувати: прихований за замовчуванням, видимий при focus
- [x] Протестувати keyboard navigation (Tab)

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

**Нотатки:** Реалізовано в layout.tsx (skip link) та AnimatedMain.tsx (id="main")

---

### 3.2 Виправити Touch Target Sizes

**Проблема:** 54 interactive елементи менші за 44x44px (WCAG 2.5.5).

**Підзадачі:**
- [x] Ідентифікувати найпроблемніші елементи (social icons, small buttons)
- [x] Додати padding для збільшення touch area
- [x] Використати `min-w-11 min-h-11` (44px) для критичних елементів
- [x] Перевірити що visual appearance не змінився суттєво

**Типові проблемні елементи:**
1. Social media icons в footer - ВИПРАВЛЕНО (min-w-11 min-h-11)
2. Маленькі icon buttons (close, menu toggle) - ВИПРАВЛЕНО
3. Phone button в DealerLocatorCompact - ВИПРАВЛЕНО

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

**Файли виправлені:**
- `frontend/src/components/Footer.tsx` - social icons min-w-11 min-h-11
- `frontend/src/components/MainHeader.tsx` - burger button min-w-11 min-h-11
- `frontend/src/components/DealerLocatorCompact.tsx` - phone button min-w-11 min-h-11

**Нотатки:** Всі критичні icon buttons тепер мають 44x44px touch target

---

### 3.3 Додати Labels для Form Inputs

**Проблема:** 3 з 4 form inputs не мають proper labels (WCAG 1.3.1, 4.1.2).

**Підзадачі:**
- [x] Знайти всі unlabeled inputs
- [x] Додати aria-label або пов'язати з label element
- [x] Перевірити screen reader compatibility

**Файли виправлені:**
- `frontend/src/components/QuickSearchForm.tsx` - всі select мають htmlFor/id пари
- `frontend/src/components/DealerLocatorCompact.tsx` - input має aria-label

**Рішення застосоване - пов'язаний label:**
```tsx
<label htmlFor="tyre-width" className={labelClass}>Ширина</label>
<select id="tyre-width" ...>
```

**Нотатки:** Всі форми мають правильні labels

---

### 3.4 Перевірити Focus Indicators

**Проблема:** Переконатися що всі interactive елементи мають видимий focus state.

**Підзадачі:**
- [x] Протестувати keyboard navigation через весь сайт
- [x] Перевірити що focus ring видимий на всіх кнопках
- [x] Перевірити focus на links та form elements
- [x] Виправити елементи з невидимим focus

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

**Нотатки:** Tailwind focus: classes вже присутні на всіх інтерактивних елементах

---

### 3.5 Перевірка Accessibility

**Підзадачі:**
- [x] Протестувати skip-link з keyboard
- [x] Протестувати touch targets на mobile
- [x] Протестувати form inputs з screen reader (optional)
- [x] Запустити Lighthouse accessibility audit

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

**Результати тестування:** Всі accessibility покращення реалізовані

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
