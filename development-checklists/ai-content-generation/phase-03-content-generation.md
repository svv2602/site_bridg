# Фаза 3: Content Generation System

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Створити систему генерації SEO-контенту для шин та статей блогу, використовуючи multi-provider архітектуру з Фази 2.

## Передумови
- Завершена Фаза 1 (скрапер збирає raw-дані)
- Завершена Фаза 2 (архітектура провайдерів)

## Архітектура

```
processors/
├── content/
│   ├── tire-description.ts       # Генерація описів шин
│   ├── tire-seo.ts               # SEO мета-теги для шин
│   ├── tire-faq.ts               # FAQ секції
│   ├── tire-comparison.ts        # Порівняння моделей
│   │
│   ├── article-generator.ts      # Генерація статей
│   ├── article-images.ts         # Зображення для статей
│   ├── article-seo.ts            # SEO для статей
│   │
│   └── index.ts                  # Експорти
│
├── prompts/
│   ├── tire-description.md       # Промпт для описів
│   ├── tire-seo.md               # Промпт для SEO
│   ├── tire-faq.md               # Промпт для FAQ
│   ├── article-generator.md      # Промпт для статей
│   └── image-prompts.md          # Промпти для зображень
│
└── utils/
    ├── markdown-to-lexical.ts    # Конвертація в Payload формат
    ├── content-validator.ts      # Валідація контенту
    └── image-processor.ts        # Обробка зображень
```

---

## Задачі

### 3.0 Аналіз та планування

#### A. Аналіз колекції Tyres в Payload
- [ ] Переглянути поля колекції `Tyres` (`src/collections/Tyres.ts`)
- [ ] Визначити формат Lexical для richtext полів
- [ ] Визначити структуру даних для keyBenefits, faqs

#### B. Аналіз існуючих процесорів
- [ ] Вивчити `processors/tire-description-generator.ts`
- [ ] Вивчити `processors/faq-generator.ts`
- [ ] Вивчити `processors/article-generator.ts`
- [ ] Визначити що рефакторити, що створити нове

---

### 3.1 Створити систему промптів

#### Структура промптів
- [ ] Створити `prompts/tire-description.md`
- [ ] Створити `prompts/tire-seo.md`
- [ ] Створити `prompts/tire-faq.md`
- [ ] Створити `prompts/article-generator.md`
- [ ] Створити `prompts/image-prompts.md`

**Структура промпту (приклад):**
```markdown
# tire-description.md

## Role
Ти - SEO-копірайтер для офіційного сайту Bridgestone Україна.

## Task
Створи унікальний SEO-оптимізований опис шини на основі наданих матеріалів.

## Input Format
- Назва моделі: {model_name}
- Сезон: {season}
- Raw опис з джерел: {raw_description}
- Характеристики: {specifications}
- Переваги: {advantages}

## Output Format (JSON)
{
  "shortDescription": "150-200 символів для картки товару",
  "fullDescription": "Markdown, 800-1200 слів, H2/H3 заголовки",
  "highlights": ["3-5 ключових переваг для буллетів"]
}

## Requirements
- Унікальний рерайт (не копіювання)
- Українська мова, професійний стиль
- SEO ключові слова: {keywords}
- Структура: вступ → особливості → для кого → висновок
- Уникати: ціни, порівняння з конкурентами, кліше

## Examples
[Приклади хорошого контенту]
```

---

### 3.2 Створити типи для генерованого контенту

- [ ] Створити/оновити `types/content.ts`

**Файли:** `backend-payload/content-automation/src/types/content.ts`

**Типи:**
```typescript
// Raw дані від скрапера
export interface RawTyreContent {
  source: 'prokoleso' | 'bridgestone' | 'tyrereviews';
  modelSlug: string;
  modelName: string;
  fullDescription?: string;
  features?: string[];
  advantages?: string[];
  specifications?: Record<string, string>;
  scrapedAt: string;
  sourceUrl: string;
}

// Згенерований контент для шини
export interface GeneratedTyreContent {
  modelSlug: string;

  // Основний контент
  shortDescription: string;           // 150-200 chars
  fullDescription: string;            // Markdown, 800-1200 words
  fullDescriptionLexical?: object;    // Lexical JSON для Payload

  // SEO
  seoTitle: string;                   // до 60 chars
  seoDescription: string;             // до 160 chars
  seoKeywords: string[];

  // Структурований контент
  keyBenefits: { benefit: string; icon?: string }[];
  faqs: { question: string; answer: string }[];

  // Мета-інформація
  metadata: {
    generatedAt: string;
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    cost: number;
    sources: string[];                 // URLs джерел
  };
}

// Згенерована стаття
export interface GeneratedArticle {
  slug: string;

  // Контент
  title: string;
  excerpt: string;                     // 150-200 chars
  content: string;                     // Markdown
  contentLexical?: object;             // Lexical JSON

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];

  // Зображення
  heroImage?: GeneratedImage;
  contentImages?: GeneratedImage[];

  // Категоризація
  tags: string[];
  relatedTyres?: string[];             // slugs

  // Мета
  metadata: {
    generatedAt: string;
    provider: string;
    model: string;
    totalCost: number;
  };
}

// Згенероване зображення
export interface GeneratedImage {
  prompt: string;
  revisedPrompt?: string;
  url: string;
  localPath?: string;

  provider: string;
  model: string;
  size: { width: number; height: number };
  cost: number;

  alt: string;                         // Alt текст для SEO
  caption?: string;
}
```

---

### 3.3 Реалізувати генератор описів шин

- [ ] Створити `processors/content/tire-description.ts`
- [ ] Інтеграція з provider system
- [ ] Обробка raw даних від скрапера
- [ ] Генерація shortDescription та fullDescription
- [ ] Валідація довжини та структури

**API:**
```typescript
async function generateTyreDescription(
  rawContent: RawTyreContent[],
  options?: {
    provider?: string;
    model?: string;
    regenerate?: boolean;
  }
): Promise<GeneratedTyreContent>
```

---

### 3.4 Реалізувати генератор SEO контенту

- [ ] Створити `processors/content/tire-seo.ts`
- [ ] Генерація seoTitle, seoDescription
- [ ] Генерація keywords на основі контенту
- [ ] Валідація довжини для Google

---

### 3.5 Реалізувати генератор FAQ

- [ ] Створити `processors/content/tire-faq.ts`
- [ ] Генерація 3-5 релевантних FAQ
- [ ] Формат для Schema.org FAQPage
- [ ] Оптимізація для featured snippets

---

### 3.6 Реалізувати генератор статей

- [ ] Створити `processors/content/article-generator.ts`
- [ ] Генерація на основі теми/ключових слів
- [ ] Структурування: вступ, секції, висновок
- [ ] Інтеграція згадок про шини Bridgestone

**Типи статей:**
- Сезонні поради (зимові/літні шини)
- Як вибрати шини
- Технології Bridgestone
- Тестові огляди
- Поради з догляду

---

### 3.7 Реалізувати генератор зображень для статей

- [ ] Створити `processors/content/article-images.ts`
- [ ] Генерація hero image для статті
- [ ] Генерація зображень для секцій
- [ ] Промпти з брендингом Bridgestone
- [ ] Збереження локально + upload до Payload Media

**Приклади промптів:**
```typescript
const IMAGE_PROMPTS = {
  tireOnRoad: 'Professional photo of Bridgestone tire on {road_type}, {weather} conditions, cinematic lighting',
  carWithTires: '{car_type} with new tires, {season} setting, automotive photography',
  tireCloseup: 'Close-up of tire tread pattern, studio lighting, high detail',
  lifestyle: 'Family road trip, {season}, safety concept, warm tones',
};
```

---

### 3.8 Створити утиліту Markdown → Lexical

- [ ] Створити `utils/markdown-to-lexical.ts`
- [ ] Парсинг Markdown (заголовки, списки, параграфи, bold/italic)
- [ ] Конвертація в Lexical JSON структуру
- [ ] Підтримка зображень в контенті
- [ ] Тестування сумісності з Payload richtext

---

### 3.9 Створити валідатор контенту

- [ ] Створити `utils/content-validator.ts`
- [ ] Валідація довжини (SEO вимоги)
- [ ] Перевірка на плагіат/унікальність (опціонально)
- [ ] Перевірка структури (заголовки, списки)
- [ ] Перевірка мови (українська)

---

### 3.10 Створити pipeline для повної генерації

- [ ] Створити `processors/content/index.ts`
- [ ] Об'єднати всі генератори в pipeline
- [ ] Підтримка часткової генерації (тільки опис, тільки SEO)
- [ ] Збереження проміжних результатів
- [ ] Retry логіка при помилках

**API:**
```typescript
// Повна генерація для шини
const content = await generateFullTyreContent(modelSlug, {
  regenerateDescription: true,
  regenerateSEO: false,
  regenerateFAQ: true,
});

// Генерація статті з зображеннями
const article = await generateArticle({
  topic: 'Як вибрати зимові шини',
  keywords: ['зимові шини', 'вибір', 'безпека'],
  generateImages: true,
  imageCount: 3,
});
```

---

### 3.11 Тестування

- [ ] Unit тести генераторів
- [ ] Integration тести з реальними API
- [ ] Тестування якості контенту (manual review)
- [ ] Перевірка Lexical формату в Payload
- [ ] Benchmark витрат на генерацію

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази на "Завершена"
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(content-automation): content generation system with SEO and images"
   ```
4. Онови PROGRESS.md
5. Перейди до Фази 4 (Backend API)
