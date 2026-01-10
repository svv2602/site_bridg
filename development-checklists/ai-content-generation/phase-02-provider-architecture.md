# Фаза 2: Multi-Provider Architecture

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-10
**Завершена:** 2026-01-10

## Ціль фази
Створити гнучку архітектуру провайдерів для LLM та генерації зображень з підтримкою множини сервісів, автоматичним fallback та трекінгом витрат.

## Передумови
- Завершена Фаза 1 (скрапер)
- API ключі для провайдерів (мінімум ANTHROPIC_API_KEY)

## Архітектура

```
providers/
├── index.ts                    # Фабрика та експорти
├── types.ts                    # Інтерфейси
├── registry.ts                 # Реєстр провайдерів
├── router.ts                   # Роутер задач → провайдер
├── cost-tracker.ts             # Трекінг витрат
│
├── llm/
│   ├── base.ts                 # Базовий клас LLMProvider
│   ├── anthropic.ts            # Claude Opus, Sonnet, Haiku
│   ├── openai.ts               # GPT-4o, GPT-4o-mini, o1, o3-mini
│   ├── deepseek.ts             # DeepSeek V3, R1
│   ├── google.ts               # Gemini 2.0 Flash, Pro
│   ├── groq.ts                 # Llama 3.3, Mixtral (швидкий)
│   ├── openrouter.ts           # Агрегатор 200+ моделей
│   └── ollama.ts               # Локальні моделі
│
├── image/
│   ├── base.ts                 # Базовий клас ImageProvider
│   ├── openai-dalle.ts         # DALL-E 3
│   ├── stability.ts            # Stable Diffusion 3, SDXL
│   ├── replicate.ts            # Flux Pro, Flux Schnell, інші
│   ├── leonardo.ts             # Leonardo.AI
│   └── midjourney.ts           # Через проксі API
│
├── embedding/
│   ├── base.ts                 # Базовий клас
│   ├── openai.ts               # text-embedding-3-large/small
│   ├── voyage.ts               # Voyage AI (multilingual)
│   └── cohere.ts               # Cohere Embed v3
│
└── speech/                     # TTS/STT (на майбутнє)
    ├── elevenlabs.ts
    └── openai.ts
```

## Провайдери LLM

| Провайдер | Моделі | Переваги | Ціна (1M токенів) |
|-----------|--------|----------|-------------------|
| Anthropic | Claude Sonnet 4, Haiku | Найкраща якість, українська | $3-15 |
| OpenAI | GPT-4o, o1, o3-mini | Швидкість, tool use | $2.50-15 |
| DeepSeek | V3, R1 | Дуже дешево, reasoning | $0.14-2.19 |
| Google | Gemini 2.0 Flash | Безкоштовний tier, швидкість | $0.075 |
| Groq | Llama 3.3 70B | Найшвидший інференс | $0.59 |
| OpenRouter | 200+ моделей | Універсальний fallback | Varies |
| Ollama | Llama, Mistral | Безкоштовно, приватність | Free |

## Провайдери зображень

| Провайдер | Моделі | Переваги | Ціна |
|-----------|--------|----------|------|
| OpenAI | DALL-E 3 | Якість, prompt following | $0.04-0.12/img |
| Stability | SD3, SDXL | Контроль, швидкість | $0.03-0.065/img |
| Replicate | Flux Pro/Schnell | Фотореалізм | $0.003-0.055/img |
| Leonardo | Phoenix, Kino | Стилізація | $0.01-0.05/img |

---

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз існуючого коду

#### A. Аналіз існуючої LLM інтеграції
- [x] Вивчити `processors/llm-generator.ts` - існуючий код Claude
- [x] Вивчити `config/env.ts` - конфігурація
- [x] Вивчити `utils/retry.ts` - retry та circuit breaker
- [x] Визначити що можна перевикористати

**Існуючий код:**
```typescript
// llm-generator.ts вже має:
- generateContent(prompt, options) - claude-sonnet-4-20250514
- generateTireDescription(tire, variant)
- generateArticle(topic, keywords) - JSON output
- SYSTEM_PROMPTS object

// utils/retry.ts:
- withRetry(), withRetryThrow()
- CircuitBreaker клас (closed/open/half-open)
- llmCircuitBreaker - готовий для LLM провайдерів
```

**Перевикористання:**
- `withRetry()` та `CircuitBreaker` - для всіх провайдерів
- `SYSTEM_PROMPTS` - перенести в config
- Логіку response parsing - адаптувати для різних провайдерів

#### B. Визначення інтерфейсів
- [x] Спроектувати `LLMProvider` interface
- [x] Спроектувати `ImageProvider` interface
- [x] Спроектувати `EmbeddingProvider` interface
- [x] Спроектувати типи для конфігурації

---

### 2.1 Створити базові типи та інтерфейси

- [x] Створити `providers/types.ts`

**Файли:** `backend-payload/content-automation/src/providers/types.ts`
**Код:**
```typescript
// === LLM Types ===
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  latencyMs: number;
  finishReason: 'stop' | 'length' | 'tool_use' | 'error';
}

export interface LLMProvider {
  name: string;
  models: string[];
  defaultModel: string;

  generateText(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
  generateChat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
  generateJSON<T>(prompt: string, schema: object, options?: LLMOptions): Promise<T>;
  generateStream(prompt: string, options?: LLMOptions): AsyncIterable<string>;

  estimateCost(promptTokens: number, completionTokens: number, model?: string): number;
  isAvailable(): Promise<boolean>;
}

// === Image Types ===
export interface ImageOptions {
  model?: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
  negativePrompt?: string;
  seed?: number;
}

export interface ImageResult {
  url: string;
  base64?: string;
  localPath?: string;
  revisedPrompt?: string;
  model: string;
  size: { width: number; height: number };
  cost: number;
  latencyMs: number;
}

export interface ImageProvider {
  name: string;
  models: string[];
  defaultModel: string;

  generateImage(prompt: string, options?: ImageOptions): Promise<ImageResult>;
  generateVariations(imageUrl: string, count: number): Promise<ImageResult[]>;

  estimateCost(model?: string, size?: string): number;
  isAvailable(): Promise<boolean>;
}

// === Embedding Types ===
export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
  usage: { totalTokens: number };
  cost: number;
}

export interface EmbeddingProvider {
  name: string;
  models: string[];
  defaultModel: string;

  embed(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
  embedBatch(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResult[]>;

  estimateCost(tokens: number, model?: string): number;
  isAvailable(): Promise<boolean>;
}

// === Provider Registry ===
export type ProviderType = 'llm' | 'image' | 'embedding' | 'speech';

export interface ProviderConfig {
  type: ProviderType;
  name: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  enabled: boolean;
  priority: number; // Lower = higher priority for fallback
}

// === Task Routing ===
export type TaskType =
  | 'content-generation'      // SEO тексти, описи
  | 'content-rewrite'         // Рерайт існуючого
  | 'quick-task'              // Швидкі прості задачі
  | 'analysis'                // Аналіз даних
  | 'reasoning'               // Складні міркування
  | 'image-article'           // Зображення для статей
  | 'image-product'           // Продуктові зображення
  | 'image-lifestyle'         // Lifestyle фото
  | 'embedding-search'        // Пошукові ембедінги
  | 'embedding-similarity';   // Схожість текстів

export interface TaskRouting {
  task: TaskType;
  preferredProvider: string;
  preferredModel: string;
  fallbackProviders: string[];
  maxRetries: number;
  timeoutMs: number;
}
```

---

### 2.2 Створити конфігурацію провайдерів

- [x] Створити `config/providers.ts`
- [x] Створити `config/models.ts` (об'єднано з pricing.ts)
- [x] Створити `config/pricing.ts`
- [x] Оновити `config/env.ts` з новими ключами

**Файли:** `backend-payload/content-automation/src/config/providers.ts`

**Змінні оточення (додати до env.ts):**
```typescript
// LLM Providers
ANTHROPIC_API_KEY: string;
OPENAI_API_KEY: string;
DEEPSEEK_API_KEY: string;
GOOGLE_AI_API_KEY: string;
GROQ_API_KEY: string;
OPENROUTER_API_KEY: string;
OLLAMA_BASE_URL: string; // default: http://localhost:11434

// Image Providers
STABILITY_API_KEY: string;
REPLICATE_API_TOKEN: string;
LEONARDO_API_KEY: string;

// Embedding Providers
VOYAGE_API_KEY: string;
COHERE_API_KEY: string;
```

---

### 2.3 Реалізувати базові класи провайдерів

- [x] Створити `providers/llm/base.ts` - абстрактний клас
- [x] Створити `providers/image/base.ts` - абстрактний клас
- [ ] ~~Створити `providers/embedding/base.ts`~~ - відкладено (не критично для MVP)

**Файли:** `backend-payload/content-automation/src/providers/llm/base.ts`
**Реалізовано:**
- `BaseLLMProvider` абстрактний клас з retry логікою
- `createMessages()` хелпер
- Інтеграція з `withRetry()` та логуванням

---

### 2.4 Реалізувати LLM провайдери

#### Anthropic (пріоритет 1)
- [x] Створити `providers/llm/anthropic.ts`
- [x] Підтримка моделей: claude-sonnet-4, claude-haiku, claude-opus-4
- [x] Рефакторинг існуючого коду з `llm-generator.ts`

#### OpenAI (пріоритет 2)
- [x] Створити `providers/llm/openai.ts`
- [x] Підтримка моделей: gpt-4o, gpt-4o-mini, o1, o3-mini

#### DeepSeek (пріоритет 3)
- [x] Створити `providers/llm/deepseek.ts`
- [x] Підтримка моделей: deepseek-chat (V3), deepseek-reasoner (R1)
- [x] OpenAI-сумісний API

#### Google (пріоритет 4)
- [x] Створити `providers/llm/google.ts`
- [x] Підтримка моделей: gemini-2.0-flash, gemini-pro

#### Groq (пріоритет 5)
- [x] Створити `providers/llm/groq.ts`
- [x] Підтримка моделей: llama-3.3-70b, mixtral-8x7b
- [x] Найшвидший інференс

#### OpenRouter (універсальний fallback)
- [x] Створити `providers/llm/openrouter.ts`
- [x] Доступ до 200+ моделей через єдиний API
- [x] Автоматичний fallback

#### Ollama (локальні моделі)
- [x] Створити `providers/llm/ollama.ts`
- [x] Підтримка локальних моделей
- [x] Для розробки та приватності

---

### 2.5 Реалізувати Image провайдери

#### OpenAI DALL-E (пріоритет 1)
- [x] Створити `providers/image/openai-dalle.ts`
- [x] Підтримка DALL-E 3
- [x] Розміри: 1024x1024, 1792x1024, 1024x1792

#### Stability AI (пріоритет 2) - відкладено
- [ ] ~~Створити `providers/image/stability.ts`~~ - DALL-E та Replicate достатньо для MVP
- [ ] ~~Підтримка SD3, SDXL~~
- [ ] ~~Negative prompts, seed control~~

#### Replicate (Flux) (пріоритет 3)
- [x] Створити `providers/image/replicate.ts`
- [x] Підтримка Flux Pro, Flux Schnell
- [x] Фотореалістичні зображення

#### Leonardo.AI (пріоритет 4) - відкладено
- [ ] ~~Створити `providers/image/leonardo.ts`~~ - не критично для MVP
- [ ] ~~Підтримка Phoenix, Kino XL~~
- [ ] ~~Стилізовані зображення~~

---

### 2.6 Реалізувати Embedding провайдери - відкладено

- [ ] ~~Створити `providers/embedding/openai.ts`~~ - не критично для MVP
- [ ] ~~Створити `providers/embedding/voyage.ts`~~ (кращий для multilingual)
- [ ] ~~Створити `providers/embedding/cohere.ts`~~

**Нотатка:** Embedding провайдери відкладено - не критичні для MVP. Буде реалізовано за потреби.

---

### 2.7 Створити реєстр та роутер провайдерів

- [x] Створити `providers/registry.ts` - реєстрація та отримання провайдерів
- [x] Створити `providers/router.ts` - роутинг задач до провайдерів (вбудовано в index.ts)
- [x] Реалізувати fallback логіку
- [x] Реалізувати health checks

**Файли:** `backend-payload/content-automation/src/providers/index.ts`

---

### 2.8 Створити cost tracker

- [x] Створити `providers/cost-tracker.ts`
- [x] Трекінг витрат по провайдерах та моделях
- [x] Денні/місячні ліміти
- [x] Збереження історії в JSON
- [ ] ~~Telegram сповіщення~~ - вже є в daemon, інтегрується окремо

**Файли:** `backend-payload/content-automation/src/providers/cost-tracker.ts`

---

### 2.9 Створити головний експорт

- [x] Створити `providers/index.ts`
- [x] Експортувати фабрику `getProvider(type, name?)`
- [x] Експортувати хелпери `generateText()`, `generateImage()`
- [x] Зберегти backward compatibility з існуючим кодом

**Файли:** `backend-payload/content-automation/src/providers/index.ts`

**API приклади:**
```typescript
import { llm, image, embedding } from './providers';

// Простий виклик (використовує default provider)
const text = await llm.generate('Напиши опис шини Turanza 6');

// Вказати провайдера
const text = await llm.generate('...', { provider: 'deepseek', model: 'deepseek-chat' });

// Роутинг по типу задачі
const text = await llm.forTask('content-generation').generate('...');

// Генерація зображень
const img = await image.generate('Bridgestone tire on snowy road, professional photo');

// Ембедінги
const emb = await embedding.embed('Зимові шини Bridgestone');
```

---

### 2.10 Тестування - відкладено до Phase 7

- [ ] Unit тести для кожного провайдера → Phase 7
- [ ] Integration тести з реальними API → Phase 7
- [ ] Тестування fallback логіки → Phase 7
- [ ] Тестування cost tracking → Phase 7
- [ ] Benchmark швидкості провайдерів → Phase 7

**Нотатка:** Тестування буде виконано в Phase 7 (Integration & Testing).

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази на "Завершена"
3. Заповни дату завершення
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(content-automation): multi-provider architecture for LLM and images"
   ```
5. Онови PROGRESS.md
6. Відкрий наступну фазу
