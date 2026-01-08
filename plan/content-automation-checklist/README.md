# Content Automation System - Executable Checklist

## Ціль
Створити автоматизовану систему генерації контенту для сайту Bridgestone Ukraine:
- Парсинг даних з ProKoleso.ua, ADAC, Auto Bild
- Генерація описів шин та статей через LLM
- Присвоєння бейджів за результатами тестів
- Публікація в Strapi CMS

## Критерії успіху
- [ ] Scraper ProKoleso.ua працює і отримує дані
- [ ] LLM генерує унікальні описи українською
- [ ] Бейджі тестів відображаються на картках шин
- [ ] Контент автоматично публікується в Strapi
- [ ] Контрастність UI виправлена (WCAG AA)
- [ ] Telegram-бот надсилає повідомлення про новий контент

## Фази роботи
1. **Foundation + Design Fixes** - CSS fixes, Badge component, project setup
2. **Content Generation** - LLM integration, Strapi publisher
3. **Advanced Features** - Seasonal content, comparisons, FAQ
4. **Quality & Polish** - Validation, monitoring, calculator

## Джерело вимог
- `/plan/content-automation-spec.md` - повна специфікація системи

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── components/          # UI компоненти (MainHeader, ThemeToggle, TyreCard)
├── app/                 # Сторінки
│   ├── page.tsx         # Головна - патерн hero + секції
│   ├── tyre-search/     # Форми пошуку
│   ├── shyny/[slug]/    # Сторінка шини
│   └── advice/          # Статті
└── lib/
    ├── data.ts          # Типи даних та mock-дані
    └── api/             # API-шар (tyres.ts, strapi.ts)

backend/
├── content-automation/  # НОВА папка для автоматизації
│   ├── src/
│   │   ├── scrapers/    # Парсери сайтів
│   │   ├── processors/  # LLM, badges, validation
│   │   └── publishers/  # Strapi, Telegram
│   └── data/            # SQLite, cache
└── src/api/             # Strapi content types
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Правила дизайну та стилів

### Кольорова палітра (з ТЗ):

| Елемент | Класи Tailwind |
|---------|----------------|
| Badge Winner | `bg-amber-500 text-amber-950 border-amber-600` |
| Badge Recommended | `bg-green-500 text-green-950 border-green-600` |
| Badge Top3 | `bg-blue-500 text-blue-950 border-blue-600` |
| EU Label A | `bg-green-500 text-white` |
| EU Label B | `bg-lime-500 text-lime-950` |
| EU Label C | `bg-yellow-500 text-yellow-950` |
| EU Label D | `bg-orange-500 text-white` |
| EU Label E | `bg-red-500 text-white` |
| Season Summer | `bg-gradient-to-r from-orange-500 to-yellow-500` |
| Season Winter | `bg-gradient-to-r from-blue-500 to-cyan-400` |

### Contrast Fixes (Dark Theme):
```css
:root[data-theme="dark"] {
  --muted: #a1a1aa;           /* zinc-400 замість zinc-500 */
  --border: #3f3f46;          /* zinc-700 замість zinc-800 */
  --card: #1c1c1f;            /* трохи світліший */
}
```

## Правила інтеграції з CMS/API

### Strapi Content Types:
- `Tyre` - шини з badges component
- `Article` - статті з relatedTyres
- `Test` - тести (новий тип)
- `SeasonalPromo` - сезонні промо

### При додаванні нових даних:
1. Створи content type в Strapi (якщо потрібно)
2. Додай API-функції в `lib/api/strapi.ts`
3. Використовуй API-функції в компонентах

## Бізнес-правила

- ⛔ **НЕ показувати ціни** - у дилерів своя цінова політика
- CTA завжди "Знайти дилера", не "Купити"
- Бейджі старші 3 років не показувати

## API Keys (потрібні для роботи)

```env
# LLM
ANTHROPIC_API_KEY=sk-ant-...

# Image Generation
OPENAI_API_KEY=sk-...

# CMS
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=...

# Notifications
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
