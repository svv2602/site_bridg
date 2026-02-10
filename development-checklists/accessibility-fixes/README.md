# Accessibility Audit Fixes

## Ціль
Усунути всі проблеми доступності (WCAG 2.1 Level A та AA), виявлені під час аудиту сайту Bridgestone Ukraine: виправити клавіатурну навігацію в MegaMenu та мобільному меню, привести FAQ-акордеон до WAI-ARIA Accordion pattern, виправити heading hierarchy, додати dialog-семантику до CookiesBanner, покращити tabs pattern та focus outline.

## Критерії успіху
- [ ] MegaMenu: focus trap, ArrowUp/ArrowDown навігація, автофокус при відкритті
- [ ] Мобільне меню: Escape закриває, focus trap, автофокус
- [ ] FAQ-акордеон: панелі рендеряться через hidden, role="region", aria-labelledby
- [ ] Heading hierarchy коректна на всіх сторінках (H1 > H2 > H3)
- [ ] CookiesBanner має role="dialog" та aria-label
- [ ] SizesByDiameter tabs: tabIndex управління, ArrowLeft/ArrowRight навігація
- [ ] Focus outline >= 2px з достатнім контрастом (мінімум 3:1)

## Фази роботи
1. [P1 — MegaMenu та мобільне меню] - Focus trap, Escape, клавіатурна навігація (WCAG 2.1.1 Level A)
2. [P2 — FAQ Accordion ARIA Pattern] - WAI-ARIA Accordion pattern для FAQSection
3. [P2 — Heading Hierarchy] - Виправити ієрархію заголовків H1-H2-H3
4. [P2 — CookiesBanner Dialog] - Додати dialog-семантику
5. [P3 — SizesByDiameter tabs та Focus Outline] - Tabs pattern та покращення focus outline

## Джерело вимог
- `/home/snisar/RubyProjects/site_Bridgestone/plan/prompt/AUDIT_AI_AGENT/report/ACCESSIBILITY_AUDIT.md`
- `/home/snisar/RubyProjects/site_Bridgestone/plan/prompt/AUDIT_AI_AGENT/report/RELEASE_READINESS_REPORT.md`

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── components/
│   ├── MegaMenu.tsx           # Mega-меню з ARIA-атрибутами
│   ├── MainHeader.tsx         # Мобільне бургер-меню
│   ├── FAQSection.tsx         # FAQ-акордеон
│   ├── CookiesBanner.tsx      # Банер cookies
│   ├── SizesByDiameter.tsx    # Таби розмірів по діаметру
│   ├── QuickSearchForm.tsx    # РЕФЕРЕНС: зразкова реалізація tablist/tab/tabpanel
│   └── AnimatedMain.tsx       # Анімації з prefers-reduced-motion
├── app/
│   ├── page.tsx               # Головна — перевірити heading hierarchy
│   ├── contacts/page.tsx      # Контакти — перевірити heading hierarchy
│   └── globals.css            # Глобальні стилі, :focus-visible
└── lib/
    └── utils.ts               # Утиліти
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Ключові ARIA-патерни проекту

### Зразкова реалізація (QuickSearchForm.tsx):
- `role="tablist"` на контейнері табів
- `role="tab"` + `aria-selected` + `tabIndex={0/-1}` на кнопках табів
- `role="tabpanel"` + `aria-labelledby` на панелях
- ArrowLeft/ArrowRight клавіатурна навігація
- `aria-controls` зв'язує таб з панеллю

### WAI-ARIA Menu Pattern (для MegaMenu):
- `role="menu"` на контейнері
- `role="menuitem"` на елементах
- ArrowUp/ArrowDown навігація
- Escape закриває та повертає фокус на trigger

### WAI-ARIA Accordion Pattern (для FAQ):
- Trigger: `aria-expanded`, `aria-controls`
- Panel: `role="region"`, `aria-labelledby`, `hidden` (замість unmount)

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
