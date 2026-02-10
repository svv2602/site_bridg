# Покращення промптів та пайплайну генерації контенту (шини + статті)

## Ціль
Усунути проблеми в промптах та пайплайні AI-генерації контенту для сторінок моделей шин та статей блогу: конфлікти форматів, відсутній інтерлінкінг, мертвий код, неконсистентність полів, відсутня SEO-оптимізація. Підвищити SEO-якість генерованого контенту.

## Критерії успіху
- [ ] Конфлікт Markdown vs HTML у промпті description усунено — єдиний формат
- [ ] Інтерлінкінг передається в промпт description і працює в згенерованих текстах
- [ ] `vehicleTypes` та `brand` передаються у всі генератори з raw content
- [ ] `seoKeywords` або видалено, або використовується (немає мертвого коду)
- [ ] `seoTitle` має консистентний формат із суфіксом сайту
- [ ] FAQ містить хоча б 1 модельно-специфічне запитання
- [ ] `SEO_FORMATTING_RULES` видалено з FAQ system prompt
- [ ] `highlights` / `keyBenefits` неконсистентність усунена
- [ ] Інтерлінкінг працює у статтях блогу (relatedItems передаються в промпт)
- [ ] Формат контенту статей уніфіковано (HTML або Lexical, без Markdown конфлікту)
- [ ] seoTitle та seoDescription для статей генеруються окремо від title/excerpt
- [ ] Brand-specific system prompt використовується для brand-specific статей
- [ ] Subtitle генерується для статей
- [ ] Featured image інтегровано в article pipeline
- [ ] Всі тести проходять після змін
- [ ] Backend та frontend збираються без нових помилок

## Фази роботи

### Шини (фази 1-6)
1. **Markdown vs HTML конфлікт** — привести формат fullDescription до єдиного стандарту
2. **Інтерлінкінг у description** — передавати relatedItems у промпт та пайплайн
3. **Передача vehicleTypes/brand** — виправити втрату даних у generateFullTyreContent
4. **seoTitle суфікс та seoKeywords** — формат title, усунути мертвий код keywords
5. **FAQ покращення** — модельно-специфічні питання, прибрати зайві HTML-правила
6. **Консистентність highlights/keyBenefits** — єдине ім'я поля у всьому пайплайні

### Статті блогу (фази 7-12)
7. **Інтерлінкінг у статтях** — передати зібрані relatedItems у промпт генерації
8. **Формат контенту статей** — уніфікувати Markdown/HTML/Lexical конфлікт
9. **SEO-генерація для статей** — окремі seoTitle/seoDescription, видалити мертвий seoKeywords
10. **Brand-specific prompt для статей** — використовувати getSystemPromptsForBrand()
11. **Генерація subtitle** — додати підзаголовок у промпт та публікацію
12. **Інтеграція зображень** — підключити article-images.ts до pipeline

## Джерело вимог
Аудит промптів генерації контенту шин та статей (сесія 2026-02-10). Аналіз файлів:

### Шини:
- `backend-payload/content-automation/src/processors/content/tire-description.ts`
- `backend-payload/content-automation/src/processors/content/tire-seo.ts`
- `backend-payload/content-automation/src/processors/content/tire-faq.ts`
- `backend-payload/content-automation/src/processors/content/index.ts`
- `backend-payload/content-automation/src/prompts/index.ts`
- `backend-payload/content-automation/src/prompts/tire-description.md`
- `backend-payload/content-automation/src/prompts/tire-seo.md`
- `backend-payload/content-automation/src/prompts/tire-faq.md`
- `backend-payload/content-automation/src/publishers/payload-client.ts`
- `frontend/src/app/shyny/[slug]/page.tsx`

### Статті:
- `backend-payload/content-automation/src/processors/content/article-generator.ts`
- `backend-payload/content-automation/src/article-pipeline.ts`
- `backend-payload/content-automation/src/prompts/index.ts` (getArticlePrompt, SYSTEM_PROMPTS.article)
- `backend-payload/src/collections/Articles.ts`
- `frontend/src/app/blog/[slug]/page.tsx`

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** — перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** — вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** — використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
backend-payload/content-automation/src/
├── processors/content/   # Генератори (description, seo, faq, article-generator)
├── prompts/              # Промпт-шаблони (.md) та індекс (.ts)
├── providers/            # LLM провайдери (fallback-llm)
├── publishers/           # Публікація в CMS (payload-client)
├── types/                # Типи (content.ts — Brand, RawTyreContent, GeneratedArticle)
├── db/                   # SQLite (article-queue, test-results)
├── article-pipeline.ts   # Smart article pipeline оркестратор
└── utils/                # Утиліти (markdown-to-lexical, sanitize, storage)

frontend/src/
├── app/shyny/[slug]/     # Сторінка моделі шини
├── app/blog/[slug]/      # Сторінка статті блогу
└── lib/
    ├── api/payload.ts    # API клієнт (шини)
    ├── api/articles.ts   # API клієнт (статті)
    └── schema.ts         # Schema.org генератори
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Правила для роботи з промптами
1. **Не змінюй імена полів у Payload CMS** — `heroTitle`, `heroSubtitle` і т.д. залишаються як є в БД
2. **Промпт = system + user** — system prompt у `prompts/index.ts`, user prompt будується у `buildPrompt()`
3. **Валідація обов'язкова** — кожен генератор має `validate*()` функцію з лімітами
4. **JSON output** — всі генератори повертають JSON, парсинг через regex `/{[\s\S]*}/`
5. **Fallback LLM** — всі виклики через `fallbackLlm.forTask()`, не напряму до API

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
