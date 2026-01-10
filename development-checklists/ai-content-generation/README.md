# AI Content Generation для карток шин

## Ціль
Створити систему напівавтоматичної генерації SEO-оптимізованого контенту для карток моделей шин та статей блогу з використанням multiple AI providers (LLM + Image Generation), з можливістю превью та схвалення перед публікацією.

## Критерії успіху
- [ ] Multi-provider архітектура для LLM (Claude, GPT-4, DeepSeek, Gemini, тощо)
- [ ] Генерація зображень для статей (DALL-E, Stability, Flux)
- [ ] Скрапер збирає описи з prokoleso.ua та інших джерел
- [ ] AI генерує якісний рерайт з урахуванням SEO
- [ ] Адмінка дозволяє переглянути та відредагувати контент перед публікацією
- [ ] Сторінка шини відображає повний опис, FAQ, переваги
- [ ] Контент генерується українською мовою
- [ ] Cost tracking та fallback між провайдерами

## Фази роботи

| # | Назва | Опис | Залежності |
|---|-------|------|------------|
| 1 | **Scraper Enhancement** | Розширення скрапера для збору повних описів | - |
| 2 | **Provider Architecture** | Multi-provider система для LLM та Images | - |
| 3 | **Content Generation** | Генерація SEO-контенту та зображень | Фази 1, 2 |
| 4 | **Backend API** | API endpoints для генерації та публікації | Фаза 3 |
| 5 | **Admin UI** | Сторінка в адмінці для генерації з превью | Фаза 4 |
| 6 | **Frontend Display** | Відображення контенту на сайті | Фаза 4 |
| 7 | **Integration & Testing** | Тестування та фіналізація | Фази 5, 6 |

## Архітектура рішення

```
                    ┌─────────────────────────────────────────┐
                    │            Provider Registry            │
                    ├─────────────────────────────────────────┤
                    │  LLM Providers    │  Image Providers    │
                    │  ───────────────  │  ─────────────────  │
                    │  • Anthropic      │  • OpenAI DALL-E    │
                    │  • OpenAI         │  • Stability AI     │
                    │  • DeepSeek       │  • Replicate/Flux   │
                    │  • Google Gemini  │  • Leonardo.AI      │
                    │  • Groq           │                     │
                    │  • OpenRouter     │                     │
                    │  • Ollama         │                     │
                    └─────────────────────────────────────────┘
                                       │
    ┌──────────────────────────────────┼──────────────────────────────────┐
    │                                  │                                  │
    ▼                                  ▼                                  ▼
┌───────────┐                  ┌───────────────┐                  ┌───────────────┐
│  Scraper  │ ─────────────▶   │   Content     │ ─────────────▶   │    Image      │
│           │   Raw Data       │   Generator   │   Text Content   │   Generator   │
│ prokoleso │                  │               │                  │               │
│ bridgestone│                 │ • Description │                  │ • Article     │
│ tyrereviews│                 │ • SEO         │                  │ • Product     │
└───────────┘                  │ • FAQ         │                  │ • Lifestyle   │
                               │ • Article     │                  └───────────────┘
                               └───────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
            ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
            │   Admin     │    │    API      │    │   Payload   │
            │   Preview   │ ──▶│  Endpoints  │ ──▶│    CMS      │
            │   & Edit    │    │             │    │             │
            └─────────────┘    └─────────────┘    └─────────────┘
```

## Провайдери

### LLM Providers

| Провайдер | Моделі | Use Case | Ціна (1M tokens) |
|-----------|--------|----------|------------------|
| **Anthropic** | Claude Sonnet 4, Haiku | Основна генерація контенту | $3-15 |
| **OpenAI** | GPT-4o, o1, o3-mini | Tool use, reasoning | $2.50-15 |
| **DeepSeek** | V3, R1 | Дешева генерація, reasoning | $0.14-2.19 |
| **Google** | Gemini 2.0 Flash | Швидкі задачі, безкоштовний tier | $0.075 |
| **Groq** | Llama 3.3 70B | Найшвидший інференс | $0.59 |
| **OpenRouter** | 200+ моделей | Універсальний fallback | Varies |
| **Ollama** | Llama, Mistral | Локальна розробка | Free |

### Image Providers

| Провайдер | Моделі | Use Case | Ціна |
|-----------|--------|----------|------|
| **OpenAI** | DALL-E 3 | Якісні ілюстрації | $0.04-0.12/img |
| **Stability** | SD3, SDXL | Швидка генерація | $0.03-0.065/img |
| **Replicate** | Flux Pro/Schnell | Фотореалізм | $0.003-0.055/img |
| **Leonardo** | Phoenix, Kino | Стилізація | $0.01-0.05/img |

## Структура файлів

```
backend-payload/content-automation/
├── src/
│   ├── providers/                    # NEW: Multi-provider system
│   │   ├── types.ts                  # Інтерфейси
│   │   ├── registry.ts               # Реєстр провайдерів
│   │   ├── router.ts                 # Роутинг задач
│   │   ├── cost-tracker.ts           # Трекінг витрат
│   │   │
│   │   ├── llm/
│   │   │   ├── base.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── openai.ts
│   │   │   ├── deepseek.ts
│   │   │   ├── google.ts
│   │   │   ├── groq.ts
│   │   │   ├── openrouter.ts
│   │   │   └── ollama.ts
│   │   │
│   │   ├── image/
│   │   │   ├── base.ts
│   │   │   ├── openai-dalle.ts
│   │   │   ├── stability.ts
│   │   │   ├── replicate.ts
│   │   │   └── leonardo.ts
│   │   │
│   │   └── embedding/
│   │       ├── openai.ts
│   │       └── voyage.ts
│   │
│   ├── scrapers/
│   │   ├── prokoleso.ts              # Existing, enhance
│   │   └── tyre-content.ts           # NEW: Content scraper
│   │
│   ├── processors/
│   │   ├── content/                  # NEW: Content generators
│   │   │   ├── tire-description.ts
│   │   │   ├── tire-seo.ts
│   │   │   ├── tire-faq.ts
│   │   │   ├── article-generator.ts
│   │   │   └── article-images.ts
│   │   │
│   │   ├── llm-generator.ts          # Existing, refactor
│   │   └── ...
│   │
│   ├── config/
│   │   ├── providers.ts              # NEW: Provider config
│   │   ├── models.ts                 # NEW: Model catalog
│   │   ├── pricing.ts                # NEW: Pricing data
│   │   ├── env.ts                    # Update with new keys
│   │   └── prompts/                  # NEW: Prompt templates
│   │       ├── tire-description.md
│   │       ├── article-generator.md
│   │       └── image-prompts.md
│   │
│   ├── types/
│   │   └── content.ts                # NEW: Content types
│   │
│   └── utils/
│       ├── markdown-to-lexical.ts    # NEW: MD → Lexical
│       └── content-validator.ts      # NEW: Validation
│
backend-payload/src/app/api/
└── content-generation/               # NEW: API endpoints
    ├── generate/route.ts
    ├── preview/[modelSlug]/route.ts
    ├── publish/route.ts
    └── status/[modelSlug]/route.ts

frontend/src/
├── app/admin/content-generation/     # NEW: Admin UI
│   └── page.tsx
└── components/
    ├── TyreDescription.tsx           # NEW: Rich-text render
    └── admin/ContentPreview.tsx      # NEW: Preview component
```

## Змінні оточення

```bash
# LLM Providers
ANTHROPIC_API_KEY=sk-ant-...          # Required
OPENAI_API_KEY=sk-...                  # Recommended
DEEPSEEK_API_KEY=sk-...                # Optional, дешевий
GOOGLE_AI_API_KEY=...                  # Optional
GROQ_API_KEY=gsk_...                   # Optional, швидкий
OPENROUTER_API_KEY=sk-or-...           # Optional, fallback
OLLAMA_BASE_URL=http://localhost:11434 # Optional, local

# Image Providers
STABILITY_API_KEY=sk-...               # Optional
REPLICATE_API_TOKEN=r8_...             # Optional
LEONARDO_API_KEY=...                   # Optional

# Embedding Providers
VOYAGE_API_KEY=pa-...                  # Optional
COHERE_API_KEY=...                     # Optional

# Cost Limits
DAILY_COST_LIMIT_USD=10
MONTHLY_COST_LIMIT_USD=100
```

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Існуючий код для перевикористання:
```
backend-payload/content-automation/src/
├── processors/llm-generator.ts       # Claude integration
├── processors/faq-generator.ts       # FAQ generation
├── processors/article-generator.ts   # Article generation
├── utils/logger.ts                   # Structured logging
├── utils/retry.ts                    # Retry + Circuit Breaker
└── config/env.ts                     # Environment config
```

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
