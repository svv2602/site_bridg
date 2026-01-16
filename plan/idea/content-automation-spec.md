# Content Automation System - Technical Specification

## Project: Bridgestone Ukraine Content Pipeline

**Version:** 1.0
**Date:** 2026-01-08
**Status:** ✅ Final
**Author:** Claude AI + Human Review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Data Sources](#2-data-sources)
3. [Content Types & Generation Rules](#3-content-types--generation-rules)
4. [System Architecture](#4-system-architecture)
5. [Implementation Details](#5-implementation-details)
6. [Content Deduplication & Linking](#6-content-deduplication--linking)
7. [Quality Assurance](#7-quality-assurance)
8. [Cost Estimation](#8-cost-estimation)
9. [Risks & Mitigations](#9-risks--mitigations)
10. [Implementation Phases](#10-implementation-phases)
11. [Success Metrics](#11-success-metrics)
12. [API Keys Required](#12-api-keys-required)
13. [Additional Features (P1 & P2)](#13-additional-features-p1--p2)
14. [UI/UX Design Improvements](#14-uiux-design-improvements)
15. [Implementation Checklist](#15-implementation-checklist)
16. [Appendices](#appendix-a-sample-generated-content)

---

## 1. Executive Summary

Automated content generation system for Bridgestone Ukraine website that:
- Monitors external sources for new tire models and test results
- Generates unique Ukrainian content using LLM
- Creates/finds appropriate images
- Publishes to Strapi CMS

**Key Parameters:**
- Automation level: Full automatic (with quality checks)
- Budget: $50-100/month for AI services
- Update frequency: Weekly
- Content types: Tire descriptions, articles/reviews, SEO content

**Business Rules:**
- ⛔ **NO PRICES** — сайт не показывает цены на шины. У дилеров своя ценовая политика.
- Вместо цен показываем: характеристики, тесты, бейджи, EU Label
- CTA ведёт на "Знайти дилера" (не "Купити")

---

## 2. Data Sources

### 2.1 Primary Sources

| Source | URL | Content Type | Access Method |
|--------|-----|--------------|---------------|
| ProKoleso.ua | prokoleso.ua/shiny/bridgestone/ | Tire catalog, sizes, models | Web scraping |
| TyreReviews | tyrereviews.com/Tyre/Bridgestone | Test aggregation | Web scraping |
| ADAC Tests | adac.de/rund-ums-fahrzeug/tests/ | Official test results | Web scraping |
| Auto Bild | autobild.de/reifentests/ | German tire tests | Web scraping |
| Bridgestone Press | press.bridgestone-emea.com | Official news, awards | RSS/Scraping |

### 2.2 Image Sources

| Source | Type | Usage |
|--------|------|-------|
| SimpleTire CDN | Product photos | Tire model images (already integrated) |
| ProKoleso.ua | Product photos | Backup source |
| DALL-E 3 API | AI Generated | Article hero images, infographics |
| Unsplash API | Stock photos | Background images (free) |

### 2.3 Reference Data

| Source | Purpose |
|--------|---------|
| EU Tire Label Database | Official EU ratings |
| Bridgestone Global | Technology descriptions |

---

## 3. Content Types & Generation Rules

### 3.1 Tire Descriptions

**Trigger:** New model detected on prokoleso.ua

**Output:**
```yaml
shortDescription:  # 2-3 sentences, 150-200 chars
  - Unique text (not copy from source)
  - Key benefit + target use case
  - Ukrainian language

fullDescription:   # 300-500 words
  - Intro paragraph
  - Key technologies section
  - Usage scenarios
  - EU Label explanation
  - Conclusion

seoTitle:          # 50-60 chars
seoDescription:    # 150-160 chars
```

**LLM Prompt Template:**
```
Role: Professional automotive copywriter for Ukrainian market

Task: Create unique product description for Bridgestone tire

Input Data:
- Model: {name}
- Season: {season}
- Vehicle types: {vehicleTypes}
- Technologies: {technologies}
- EU Label: Wet grip {wetGrip}, Fuel {fuelEfficiency}, Noise {noiseDb}dB
- Sizes available: {sizesCount}
- Test results: {testResults}

Source description (for reference, DO NOT copy):
{sourceDescription}

Output format:
1. shortDescription (UA): [2-3 sentences]
2. fullDescription (UA): [300-500 words, markdown]
3. keyBenefits: [4-5 bullet points]
4. seoTitle (UA): [50-60 chars]
5. seoDescription (UA): [150-160 chars]

Requirements:
- 100% unique text
- Ukrainian language
- Technical accuracy
- Mention test results if available
- Focus on benefits, not features
```

### 3.2 Articles / Reviews

**Types:**

| Article Type | Trigger | Length | Frequency |
|--------------|---------|--------|-----------|
| Model review | New tire model | 800-1200 words | Per model |
| Test summary | ADAC/AutoBild test | 600-800 words | Per test |
| Comparison | 2+ models same category | 1000-1500 words | Monthly |
| Seasonal guide | Season change | 800-1000 words | 2x/year |
| Technology deep-dive | New technology | 600-800 words | As needed |

**Article Structure:**
```markdown
# {Title}

## Introduction
[Hook + what reader will learn]

## {Main Section 1}
[Content with data/facts]

## {Main Section 2}
[Content with data/facts]

## Conclusion
[Summary + CTA]

---
Tags: [auto-generated]
Reading time: [calculated]
```

**LLM Prompt for Test Summary:**
```
Role: Automotive journalist writing for Ukrainian audience

Task: Create article about tire test results

Test Data:
- Source: {testSource} (ADAC/AutoBild/TyreReviews)
- Test type: {testType} (summer/winter/all-season)
- Year: {year}
- Bridgestone models tested: {models}
- Results: {results}
- Key findings: {findings}

Article requirements:
- Title: Catchy, includes "Bridgestone" and year
- Length: 600-800 words
- Language: Ukrainian
- Include:
  - Brief test methodology
  - Bridgestone results (highlight wins)
  - Comparison with competitors (neutral tone)
  - Recommendation for Ukrainian drivers
- DO NOT invent data not in source
- Link to source for full results

Output: Markdown article
```

### 3.3 SEO Content

**Auto-generated for each tire:**
```yaml
seoTitle: "Bridgestone {Model} - {season} шини | Розміри та характеристики"
seoDescription: "{Season} шина Bridgestone {Model} з технологією {tech}. {sizeCount} розмірів від {minSize} до {maxSize}. Рейтинг EU: {wetGrip}/{fuel}/{noise}."
altText: "Шина Bridgestone {Model} - {season} модель для {vehicleType}"
```

**Category pages:**
```yaml
# /passenger-tyres
title: "Легкові шини Bridgestone Україна | {year}"
description: "Каталог {count} моделей легкових шин Bridgestone: літні, зимові, всесезонні. Офіційний представник в Україні."
```

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONTENT AUTOMATION SYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   SCRAPERS   │───▶│  PROCESSOR   │───▶│   PUBLISHER  │       │
│  │              │    │              │    │              │       │
│  │ - ProKoleso  │    │ - Differ     │    │ - Strapi API │       │
│  │ - TyreReview │    │ - LLM Gen    │    │ - Image CDN  │       │
│  │ - ADAC       │    │ - Validator  │    │ - Notifier   │       │
│  │ - AutoBild   │    │              │    │              │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                │
│         └───────────────────┼───────────────────┘                │
│                             ▼                                    │
│                    ┌──────────────┐                              │
│                    │   STORAGE    │                              │
│                    │              │                              │
│                    │ - SQLite DB  │                              │
│                    │ - JSON cache │                              │
│                    │ - Logs       │                              │
│                    └──────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Directory Structure

```
backend/
├── content-automation/
│   ├── src/
│   │   ├── scrapers/
│   │   │   ├── prokoleso.ts       # ProKoleso.ua scraper
│   │   │   ├── tyrereviews.ts     # TyreReviews scraper
│   │   │   ├── adac.ts            # ADAC test scraper
│   │   │   └── autobild.ts        # Auto Bild scraper
│   │   │
│   │   ├── processors/
│   │   │   ├── differ.ts          # Detect new/changed content
│   │   │   ├── llm-generator.ts   # Claude API integration
│   │   │   ├── image-handler.ts   # Image sourcing/generation
│   │   │   └── validator.ts       # Content quality checks
│   │   │
│   │   ├── publishers/
│   │   │   ├── strapi-client.ts   # Strapi CMS API
│   │   │   └── notifier.ts        # Telegram/Email alerts
│   │   │
│   │   ├── config/
│   │   │   ├── sources.ts         # Source URLs config
│   │   │   ├── prompts.ts         # LLM prompts
│   │   │   └── schedule.ts        # Cron schedule
│   │   │
│   │   └── index.ts               # Main entry point
│   │
│   ├── data/
│   │   ├── cache/                 # Scraped data cache
│   │   ├── generated/             # Generated content
│   │   └── content.db             # SQLite database
│   │
│   ├── logs/
│   │   └── automation.log
│   │
│   ├── package.json
│   └── tsconfig.json
```

### 4.3 Database Schema

```sql
-- Tracked tire models
CREATE TABLE tire_models (
    id INTEGER PRIMARY KEY,
    slug TEXT UNIQUE,
    name TEXT,
    source_url TEXT,
    source_hash TEXT,          -- MD5 of source content
    strapi_id INTEGER,         -- ID in Strapi CMS
    last_scraped DATETIME,
    last_generated DATETIME,
    status TEXT DEFAULT 'new'  -- new, generated, published, error
);

-- Generated content
CREATE TABLE generated_content (
    id INTEGER PRIMARY KEY,
    tire_model_id INTEGER,
    content_type TEXT,         -- description, article, seo
    content_json TEXT,         -- JSON with all generated fields
    llm_model TEXT,            -- claude-sonnet-4-20250514
    tokens_used INTEGER,
    cost_usd REAL,
    created_at DATETIME,
    published_at DATETIME,
    FOREIGN KEY (tire_model_id) REFERENCES tire_models(id)
);

-- Test results
CREATE TABLE test_results (
    id INTEGER PRIMARY KEY,
    source TEXT,               -- adac, autobild, tyrereviews
    test_type TEXT,            -- summer, winter, allseason
    year INTEGER,
    tire_model_id INTEGER,
    rating TEXT,
    details_json TEXT,
    article_generated BOOLEAN DEFAULT 0,
    scraped_at DATETIME,
    FOREIGN KEY (tire_model_id) REFERENCES tire_models(id)
);

-- Execution log
CREATE TABLE execution_log (
    id INTEGER PRIMARY KEY,
    task TEXT,
    status TEXT,
    details TEXT,
    executed_at DATETIME
);
```

---

## 5. Implementation Details

### 5.1 Scraper: ProKoleso.ua

```typescript
// scrapers/prokoleso.ts
import puppeteer from 'puppeteer';

interface ScrapedTire {
  name: string;
  slug: string;
  season: 'summer' | 'winter' | 'allseason';
  sizes: Array<{
    width: number;
    aspectRatio: number;
    diameter: number;
    // price removed - dealers have own pricing policy
    country: string;
  }>;
  description: string;
  imageUrl: string;
  sourceUrl: string;
}

export async function scrapeProkoleso(): Promise<ScrapedTire[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to Bridgestone catalog
  await page.goto('https://prokoleso.ua/shiny/bridgestone/', {
    waitUntil: 'networkidle2'
  });

  // Extract tire models
  const tires = await page.evaluate(() => {
    // ... extraction logic
  });

  await browser.close();
  return tires;
}
```

### 5.2 LLM Generator

```typescript
// processors/llm-generator.ts
import Anthropic from '@anthropic-ai/sdk';
import { PROMPTS } from '../config/prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

interface GeneratedContent {
  shortDescription: string;
  fullDescription: string;
  keyBenefits: string[];
  seoTitle: string;
  seoDescription: string;
  tokensUsed: number;
  cost: number;
}

export async function generateTireDescription(
  tireData: TireData,
  testResults?: TestResult[]
): Promise<GeneratedContent> {

  const prompt = PROMPTS.tireDescription
    .replace('{name}', tireData.name)
    .replace('{season}', tireData.season)
    .replace('{technologies}', tireData.technologies.join(', '))
    // ... other replacements

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  // Parse structured response
  const content = parseGeneratedContent(response.content[0].text);

  // Calculate cost (Sonnet: $3/1M input, $15/1M output)
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost = (inputTokens * 0.003 + outputTokens * 0.015) / 1000;

  return {
    ...content,
    tokensUsed: inputTokens + outputTokens,
    cost
  };
}
```

### 5.3 Image Handler

```typescript
// processors/image-handler.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Strategy 1: Find existing product image
export async function findProductImage(tireName: string): Promise<string | null> {
  // 1. Check SimpleTire CDN
  const simpletireUrl = await checkSimpleTire(tireName);
  if (simpletireUrl) return simpletireUrl;

  // 2. Check ProKoleso
  const proKolesoUrl = await checkProKoleso(tireName);
  if (proKolesoUrl) return proKolesoUrl;

  return null;
}

// Strategy 2: Generate article image with DALL-E
export async function generateArticleImage(
  articleTitle: string,
  articleType: 'review' | 'comparison' | 'guide'
): Promise<string> {

  const prompts = {
    review: `Professional product photography of a car tire on clean white background, studio lighting, high detail, commercial photography style, no text or logos`,
    comparison: `Split view showing multiple car tires side by side, professional studio setup, comparison layout, clean background, commercial style`,
    guide: `Infographic style illustration about car tires and safety, modern flat design, blue and gray color scheme, professional, no text`
  };

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: prompts[articleType],
    size: '1792x1024',
    quality: 'standard',
    n: 1
  });

  // Download and upload to our CDN
  const imageUrl = response.data[0].url;
  return await uploadToStrapi(imageUrl, `article-${Date.now()}.png`);
}
```

### 5.4 Strapi Publisher

```typescript
// publishers/strapi-client.ts

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

export async function publishTyre(content: GeneratedContent, imageUrl: string) {
  const response = await fetch(`${STRAPI_URL}/api/tyres`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_TOKEN}`
    },
    body: JSON.stringify({
      data: {
        name: content.name,
        slug: content.slug,
        shortDescription: content.shortDescription,
        fullDescription: content.fullDescription,
        seoTitle: content.seoTitle,
        seoDescription: content.seoDescription,
        season: content.season,
        vehicleTypes: content.vehicleTypes,
        // ... other fields
        publishedAt: new Date().toISOString() // Auto-publish
      }
    })
  });

  return response.json();
}

export async function publishArticle(article: GeneratedArticle) {
  // Similar to publishTyre
}
```

### 5.5 Scheduler

```typescript
// index.ts
import cron from 'node-cron';
import { scrapeProkoleso } from './scrapers/prokoleso';
import { scrapeTestResults } from './scrapers/tests';
import { processNewTires, processNewTests } from './processors';
import { notify } from './publishers/notifier';

// Run every Sunday at 3:00 AM
cron.schedule('0 3 * * 0', async () => {
  console.log('Starting weekly content automation...');

  try {
    // 1. Scrape sources
    const tires = await scrapeProkoleso();
    const tests = await scrapeTestResults();

    // 2. Find new content
    const newTires = await findNewTires(tires);
    const newTests = await findNewTests(tests);

    // 3. Generate content
    const generatedTires = await processNewTires(newTires);
    const generatedArticles = await processNewTests(newTests);

    // 4. Publish
    const publishedTires = await publishAll(generatedTires);
    const publishedArticles = await publishAll(generatedArticles);

    // 5. Notify
    await notify({
      type: 'success',
      tires: publishedTires.length,
      articles: publishedArticles.length
    });

  } catch (error) {
    await notify({ type: 'error', error: error.message });
  }
});
```

---

## 6. Content Deduplication & Linking

### 6.1 Problem Statement

Один тест (например, ADAC Winterreifen 2024) может упоминать несколько моделей Bridgestone. Нужно:
- Не создавать дублирующие статьи о том же тесте
- Связывать шины с релевантными статьями
- Обновлять существующие статьи при появлении новых данных

### 6.2 Unique Test Identifier

Каждый тест получает уникальный ID на основе:

```typescript
// Генерация уникального ID теста
function generateTestId(test: TestData): string {
  const components = [
    test.source,        // 'adac', 'autobild', 'tyrereviews'
    test.type,          // 'summer', 'winter', 'allseason'
    test.year,          // 2024, 2025
    test.size || 'all', // '205/55R16' или 'all'
    test.category       // 'suv', 'passenger', 'performance'
  ];
  return components.join('-').toLowerCase();
  // Пример: "adac-winter-2024-205/55r16-passenger"
}
```

### 6.3 Database Schema for Linking

```sql
-- Тесты (один тест = одна запись)
CREATE TABLE tests (
    id INTEGER PRIMARY KEY,
    test_uid TEXT UNIQUE,          -- "adac-winter-2024-205/55r16-passenger"
    source TEXT,                   -- adac, autobild
    test_type TEXT,                -- summer, winter, allseason
    year INTEGER,
    size TEXT,                     -- tested tire size
    category TEXT,                 -- passenger, suv, performance
    source_url TEXT,
    scraped_at DATETIME,
    updated_at DATETIME
);

-- Результаты тестов для конкретных шин
CREATE TABLE test_results (
    id INTEGER PRIMARY KEY,
    test_id INTEGER,               -- FK to tests
    tire_model_id INTEGER,         -- FK to tire_models
    position INTEGER,              -- 1st, 2nd, 3rd...
    rating TEXT,                   -- "1.9", "Good", "Recommended"
    rating_numeric REAL,           -- 1.9 (для сортировки)
    strengths TEXT,                -- JSON array
    weaknesses TEXT,               -- JSON array
    verdict TEXT,                  -- краткий вердикт
    FOREIGN KEY (test_id) REFERENCES tests(id),
    FOREIGN KEY (tire_model_id) REFERENCES tire_models(id),
    UNIQUE(test_id, tire_model_id) -- одна шина = один результат в тесте
);

-- Статьи
CREATE TABLE articles (
    id INTEGER PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT,
    article_type TEXT,             -- test_summary, model_review, comparison
    test_id INTEGER,               -- FK to tests (если статья о тесте)
    strapi_id INTEGER,
    created_at DATETIME,
    published_at DATETIME,
    FOREIGN KEY (test_id) REFERENCES tests(id)
);

-- Связь шин со статьями (many-to-many)
CREATE TABLE tire_article_links (
    tire_model_id INTEGER,
    article_id INTEGER,
    link_type TEXT,                -- 'main_subject', 'mentioned', 'compared'
    PRIMARY KEY (tire_model_id, article_id),
    FOREIGN KEY (tire_model_id) REFERENCES tire_models(id),
    FOREIGN KEY (article_id) REFERENCES articles(id)
);
```

### 6.4 Deduplication Logic

```typescript
// processors/deduplicator.ts

interface DeduplicationResult {
  action: 'create' | 'update' | 'skip' | 'link_only';
  existingArticleId?: number;
  reason: string;
}

export async function checkTestDeduplication(
  test: ScrapedTest
): Promise<DeduplicationResult> {

  const testUid = generateTestId(test);

  // 1. Проверяем, есть ли уже такой тест в базе
  const existingTest = await db.query(
    'SELECT id FROM tests WHERE test_uid = ?',
    [testUid]
  );

  if (!existingTest) {
    // Новый тест - создаём статью
    return { action: 'create', reason: 'New test discovered' };
  }

  // 2. Проверяем, есть ли статья для этого теста
  const existingArticle = await db.query(
    'SELECT id, strapi_id FROM articles WHERE test_id = ?',
    [existingTest.id]
  );

  if (!existingArticle) {
    // Тест есть, но статьи нет - создаём
    return { action: 'create', reason: 'Test exists but no article' };
  }

  // 3. Проверяем, обновились ли данные теста
  const testHash = hashTestData(test);
  const storedHash = await db.query(
    'SELECT data_hash FROM tests WHERE id = ?',
    [existingTest.id]
  );

  if (testHash !== storedHash) {
    // Данные изменились - обновляем статью
    return {
      action: 'update',
      existingArticleId: existingArticle.strapi_id,
      reason: 'Test data updated'
    };
  }

  // 4. Всё актуально - только обновляем связи с шинами
  return {
    action: 'link_only',
    existingArticleId: existingArticle.strapi_id,
    reason: 'Article exists and up-to-date'
  };
}
```

### 6.5 Linking Tires to Articles

```typescript
// При обработке шины - находим релевантные статьи

export async function findRelatedArticles(
  tireSlug: string
): Promise<RelatedArticle[]> {

  // 1. Прямые связи (шина упоминается в статье)
  const directLinks = await db.query(`
    SELECT a.*, tal.link_type
    FROM articles a
    JOIN tire_article_links tal ON a.id = tal.article_id
    JOIN tire_models tm ON tm.id = tal.tire_model_id
    WHERE tm.slug = ?
    ORDER BY a.published_at DESC
  `, [tireSlug]);

  // 2. Связи через тесты
  const testLinks = await db.query(`
    SELECT a.*, tr.rating, tr.position
    FROM articles a
    JOIN tests t ON a.test_id = t.id
    JOIN test_results tr ON tr.test_id = t.id
    JOIN tire_models tm ON tm.id = tr.tire_model_id
    WHERE tm.slug = ?
    ORDER BY t.year DESC, tr.position ASC
  `, [tireSlug]);

  return [...directLinks, ...testLinks];
}
```

### 6.6 Display on Tire Page

На странице шины показываем связанные статьи:

```typescript
// В Strapi добавляем relation поле
// Tyre -> relatedArticles (many-to-many)

// На фронтенде:
interface TyrePageProps {
  tyre: TyreModel;
  relatedArticles: Article[];
  testResults: TestResult[];
}

// Пример отображения:
//
// ## Turanza 6 в тестах
//
// | Тест | Рік | Оцінка | Позиція |
// |------|-----|--------|---------|
// | [ADAC Sommerreifen 2024](/advice/adac-summer-2024) | 2024 | 2.6 | 5 з 16 |
// | [Auto Bild All Season 2024](/advice/autobild-allseason-2024) | 2024 | Gut | 3 з 12 |
```

### 6.7 Article Types & Triggers

| Тип статьи | Триггер | Дедупликация |
|------------|---------|--------------|
| **test_summary** | Новый тест | По test_uid |
| **model_review** | Новая модель шины | По tire_slug |
| **comparison** | 2+ модели в одной категории | По набору tire_slugs |
| **seasonal_guide** | Смена сезона (март, октябрь) | По сезону + году |

### 6.8 Update vs Create Decision Tree

```
Новый тест обнаружен
        │
        ▼
┌───────────────────┐
│ test_uid існує?   │
└───────────────────┘
        │
   ┌────┴────┐
   │ НІ     │ ТАК
   ▼         ▼
CREATE    ┌───────────────────┐
TEST &    │ Стаття існує?     │
ARTICLE   └───────────────────┘
                  │
             ┌────┴────┐
             │ НІ     │ ТАК
             ▼         ▼
          CREATE    ┌───────────────────┐
          ARTICLE   │ Дані змінились?   │
                    └───────────────────┘
                            │
                       ┌────┴────┐
                       │ НІ     │ ТАК
                       ▼         ▼
                    SKIP      UPDATE
                    (link     ARTICLE
                    only)
```

### 6.9 Test Badges & Awards System

#### Badge Types

| Badge | Критерий | Иконка | Приоритет |
|-------|----------|--------|-----------|
| **Test Winner** | 1 место в тесте | 🏆 | 1 (высший) |
| **Recommended** | Оценка ≤2.0 или "Empfehlenswert" | ✓ | 2 |
| **Top 3** | Позиция 1-3 в тесте | 🥇🥈🥉 | 3 |
| **Best in Category** | Лучший в категории (wet, dry, snow) | ⭐ | 4 |
| **Eco Champion** | Лучшая топливная эффективность | 🌿 | 5 |

#### Badge Assignment Logic

```typescript
// processors/badge-assigner.ts

interface Badge {
  type: 'winner' | 'recommended' | 'top3' | 'best_category' | 'eco';
  source: string;           // 'adac', 'autobild'
  year: number;
  testType: string;         // 'summer', 'winter'
  category?: string;        // 'wet_braking', 'snow_handling'
  label: string;            // Display text
  priority: number;         // For sorting (lower = more important)
}

export function assignBadges(testResult: TestResult): Badge[] {
  const badges: Badge[] = [];

  // 1. Test Winner
  if (testResult.position === 1) {
    badges.push({
      type: 'winner',
      source: testResult.source,
      year: testResult.year,
      testType: testResult.testType,
      label: `Переможець ${testResult.source.toUpperCase()} ${testResult.year}`,
      priority: 1
    });
  }

  // 2. Recommended (ADAC: ≤2.0, AutoBild: "gut" or better)
  const isRecommended =
    (testResult.source === 'adac' && testResult.ratingNumeric <= 2.0) ||
    (testResult.source === 'autobild' && ['vorbildlich', 'gut'].includes(testResult.rating));

  if (isRecommended && testResult.position !== 1) {
    badges.push({
      type: 'recommended',
      source: testResult.source,
      year: testResult.year,
      testType: testResult.testType,
      label: `Рекомендовано ${testResult.source.toUpperCase()}`,
      priority: 2
    });
  }

  // 3. Top 3 (if not winner)
  if (testResult.position >= 2 && testResult.position <= 3) {
    const medals = { 2: '🥈', 3: '🥉' };
    badges.push({
      type: 'top3',
      source: testResult.source,
      year: testResult.year,
      testType: testResult.testType,
      label: `${medals[testResult.position]} Топ-3 ${testResult.source.toUpperCase()}`,
      priority: 3
    });
  }

  // 4. Best in specific category
  if (testResult.categoryWins?.length > 0) {
    for (const category of testResult.categoryWins) {
      badges.push({
        type: 'best_category',
        source: testResult.source,
        year: testResult.year,
        testType: testResult.testType,
        category: category.name,
        label: categoryLabels[category.name], // "Найкраще гальмування на мокрому"
        priority: 4
      });
    }
  }

  return badges.sort((a, b) => a.priority - b.priority);
}

// Category labels mapping
const categoryLabels: Record<string, string> = {
  'wet_braking': 'Найкраще гальмування на мокрому',
  'dry_handling': 'Найкраща керованість на сухому',
  'snow_traction': 'Найкраще зчеплення на снігу',
  'aquaplaning': 'Найкращий захист від аквапланування',
  'fuel_efficiency': 'Найекономічніша',
  'noise': 'Найтихіша',
  'wear': 'Найдовший ресурс'
};
```

#### Database Schema for Badges

```sql
CREATE TABLE tire_badges (
    id INTEGER PRIMARY KEY,
    tire_model_id INTEGER,
    badge_type TEXT,           -- winner, recommended, top3, best_category
    source TEXT,               -- adac, autobild
    year INTEGER,
    test_type TEXT,            -- summer, winter, allseason
    category TEXT,             -- wet_braking, snow_handling (nullable)
    label_ua TEXT,             -- Ukrainian label for display
    priority INTEGER,
    test_result_id INTEGER,    -- FK to test_results
    created_at DATETIME,
    FOREIGN KEY (tire_model_id) REFERENCES tire_models(id),
    FOREIGN KEY (test_result_id) REFERENCES test_results(id)
);

-- Index for quick badge lookup
CREATE INDEX idx_tire_badges_model ON tire_badges(tire_model_id);
```

#### Strapi Component: Badge

```javascript
// backend/src/components/award/badge.json
{
  "collectionName": "components_award_badges",
  "info": {
    "displayName": "Badge",
    "icon": "trophy"
  },
  "attributes": {
    "type": {
      "type": "enumeration",
      "enum": ["winner", "recommended", "top3", "best_category", "eco"]
    },
    "source": {
      "type": "enumeration",
      "enum": ["adac", "autobild", "tyrereviews", "tcs"]
    },
    "year": { "type": "integer" },
    "testType": {
      "type": "enumeration",
      "enum": ["summer", "winter", "allseason"]
    },
    "category": { "type": "string" },
    "label": { "type": "string" }
  }
}

// Update Tyre content type
// backend/src/api/tyre/content-types/tyre/schema.json
{
  "attributes": {
    // ... existing ...
    "badges": {
      "type": "component",
      "repeatable": true,
      "component": "award.badge"
    }
  }
}
```

#### Frontend Display

**1. Badge Component:**

```tsx
// components/TestBadge.tsx

interface TestBadgeProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
}

const badgeStyles = {
  winner: {
    bg: 'bg-amber-500',
    icon: '🏆',
    border: 'border-amber-600'
  },
  recommended: {
    bg: 'bg-green-500',
    icon: '✓',
    border: 'border-green-600'
  },
  top3: {
    bg: 'bg-blue-500',
    icon: '', // uses medal emoji from label
    border: 'border-blue-600'
  },
  best_category: {
    bg: 'bg-purple-500',
    icon: '⭐',
    border: 'border-purple-600'
  }
};

export function TestBadge({ badge, size = 'md' }: TestBadgeProps) {
  const style = badgeStyles[badge.type];

  return (
    <div className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full
      ${style.bg} text-white text-${size === 'sm' ? 'xs' : 'sm'}
      border ${style.border}
    `}>
      {style.icon && <span>{style.icon}</span>}
      <span>{badge.label}</span>
    </div>
  );
}
```

**2. On Tire Card (catalog):**

```tsx
// components/TyreCard.tsx

export function TyreCard({ tyre }: { tyre: TyreModel }) {
  // Show only top badge on card
  const topBadge = tyre.badges?.[0];

  return (
    <div className="relative ...">
      {/* Badge in corner */}
      {topBadge && (
        <div className="absolute top-2 right-2">
          <TestBadge badge={topBadge} size="sm" />
        </div>
      )}

      {/* Rest of card */}
      <Image src={tyre.imageUrl} ... />
      <h3>{tyre.name}</h3>
      ...
    </div>
  );
}
```

**3. On Tire Detail Page:**

```tsx
// app/shyny/[slug]/page.tsx

export default function TyrePage({ tyre }) {
  return (
    <div>
      {/* Hero section with all badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tyre.badges?.map((badge, i) => (
          <TestBadge key={i} badge={badge} size="md" />
        ))}
      </div>

      {/* Detailed test results section */}
      {tyre.testResults?.length > 0 && (
        <section className="mt-8">
          <h2>Результати незалежних тестів</h2>
          <div className="grid gap-4">
            {tyre.testResults.map(result => (
              <TestResultCard key={result.id} result={result} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

**4. Test Result Card:**

```tsx
// components/TestResultCard.tsx

export function TestResultCard({ result }: { result: TestResult }) {
  const sourceLogos = {
    adac: '/images/logos/adac.svg',
    autobild: '/images/logos/autobild.svg'
  };

  return (
    <div className="border rounded-lg p-4 flex items-center gap-4">
      {/* Source logo */}
      <Image
        src={sourceLogos[result.source]}
        alt={result.source}
        width={60}
        height={40}
      />

      {/* Test info */}
      <div className="flex-1">
        <div className="font-semibold">
          {result.testType === 'winter' ? 'Зимові шини' : 'Літні шини'} {result.year}
        </div>
        <div className="text-sm text-muted-foreground">
          Розмір: {result.testedSize}
        </div>
      </div>

      {/* Rating */}
      <div className="text-center">
        <div className="text-2xl font-bold">
          {result.position}<sup className="text-sm">/{result.totalTested}</sup>
        </div>
        <div className="text-sm">місце</div>
      </div>

      {/* Rating badge */}
      <div className={`
        px-3 py-1 rounded
        ${result.ratingNumeric <= 2.0 ? 'bg-green-100 text-green-800' : 'bg-gray-100'}
      `}>
        {result.rating}
      </div>

      {/* Link to article */}
      <Link href={`/advice/${result.articleSlug}`}>
        Детальніше →
      </Link>
    </div>
  );
}
```

#### Visual Examples

**Tire Card with Badge:**
```
┌─────────────────────────────┐
│  [Tire Image]    🏆 Winner  │
│                   ADAC 2024 │
│                             │
│  Blizzak LM005              │
│  Зимова шина                │
│  🏆 ADAC 2024               │
└─────────────────────────────┘
```

**Tire Page Badges Section:**
```
┌─────────────────────────────────────────────────────────────┐
│  Bridgestone Blizzak LM005                                  │
│                                                             │
│  🏆 Переможець ADAC 2024  ⭐ Найкраще гальмування на мокрому│
│  ✓ Рекомендовано Auto Bild                                  │
│                                                             │
│  [Image]                    Преміальна зимова шина...       │
└─────────────────────────────────────────────────────────────┘
```

**Test Results Section:**
```
## Результати незалежних тестів

┌──────────────────────────────────────────────────────────────┐
│ [ADAC logo]  Зимові шини 2024    1/15   ██████████ 2.0 Gut  │
│              Розмір: 205/55 R16  місце                      │
│                                              Детальніше →   │
├──────────────────────────────────────────────────────────────┤
│ [AutoBild]   Winter Test 2025    3/11   ████████░░ 1.8      │
│              Розмір: 225/45 R17  місце                      │
│                                              Детальніше →   │
└──────────────────────────────────────────────────────────────┘
```

#### Badge Expiration Rules

| Правило | Действие |
|---------|----------|
| Тест старше 3 лет | Не показывать badge |
| Новый тест того же типа | Заменить старый badge |
| Модель снята с производства | Архивировать badges |

```typescript
// Фильтрация актуальных badges
function getActiveBadges(badges: Badge[]): Badge[] {
  const currentYear = new Date().getFullYear();
  const maxAge = 3; // years

  return badges
    .filter(b => currentYear - b.year <= maxAge)
    .sort((a, b) => {
      // Sort by: priority, then year (newer first)
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.year - a.year;
    });
}
```

### 6.10 Strapi Schema Update

```javascript
// backend/src/api/article/content-types/article/schema.json
{
  "attributes": {
    // ... existing fields ...

    "relatedTest": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::test.test"  // New content type
    },

    "relatedTyres": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::tyre.tyre"
    }
  }
}

// Новий content type: Test
// backend/src/api/test/content-types/test/schema.json
{
  "kind": "collectionType",
  "collectionName": "tests",
  "attributes": {
    "testUid": { "type": "uid" },
    "source": {
      "type": "enumeration",
      "enum": ["adac", "autobild", "tyrereviews", "tcs", "oamtc"]
    },
    "testType": {
      "type": "enumeration",
      "enum": ["summer", "winter", "allseason"]
    },
    "year": { "type": "integer" },
    "testedSize": { "type": "string" },
    "sourceUrl": { "type": "string" },
    "results": {
      "type": "component",
      "repeatable": true,
      "component": "test.result"
    }
  }
}
```

---

## 7. Quality Assurance

### 7.1 Content Validation

```typescript
// processors/validator.ts

export function validateTireContent(content: GeneratedContent): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!content.shortDescription) errors.push('Missing shortDescription');
  if (!content.fullDescription) errors.push('Missing fullDescription');

  // Length checks
  if (content.shortDescription.length < 100)
    warnings.push('shortDescription too short');
  if (content.shortDescription.length > 300)
    errors.push('shortDescription too long');
  if (content.fullDescription.length < 500)
    warnings.push('fullDescription too short');

  // Language check (must be Ukrainian)
  if (!containsUkrainian(content.shortDescription))
    errors.push('Content not in Ukrainian');

  // SEO checks
  if (content.seoTitle.length > 60)
    warnings.push('seoTitle exceeds 60 chars');
  if (content.seoDescription.length > 160)
    warnings.push('seoDescription exceeds 160 chars');

  // Uniqueness check (compare with existing content)
  const similarity = await checkSimilarity(content);
  if (similarity > 0.8)
    errors.push('Content too similar to existing');

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
```

### 6.2 Duplicate Detection

```typescript
// Check for duplicate content before publishing
export async function checkDuplicate(content: string): Promise<boolean> {
  // 1. Hash comparison
  const hash = md5(normalizeText(content));
  const existing = await db.query(
    'SELECT id FROM generated_content WHERE content_hash = ?',
    [hash]
  );
  if (existing.length > 0) return true;

  // 2. Similarity check using embeddings (optional)
  // Can use OpenAI embeddings API for semantic similarity

  return false;
}
```

### 6.3 Monitoring Dashboard

Track in SQLite:
- Content generated per week
- Tokens used / cost
- Error rate
- Publish success rate

Telegram notifications:
- Weekly summary
- Errors immediately
- New content published

---

## 7. Cost Estimation

### 7.1 LLM Costs (Claude Sonnet)

| Content Type | Tokens/item | Items/month | Cost/month |
|--------------|-------------|-------------|------------|
| Tire description | ~2000 | 5 | ~$0.15 |
| Article (800 words) | ~3000 | 4 | ~$0.18 |
| SEO content | ~500 | 10 | ~$0.05 |
| **Total LLM** | | | **~$5-10** |

### 7.2 Image Generation (DALL-E 3)

| Image Type | Size | Cost/image | Images/month | Cost/month |
|------------|------|------------|--------------|------------|
| Article hero | 1792x1024 | $0.12 | 4 | $0.48 |
| Infographic | 1024x1024 | $0.08 | 2 | $0.16 |
| **Total Images** | | | | **~$1-5** |

### 7.3 Infrastructure

| Service | Cost/month |
|---------|------------|
| Hosting (existing VPS) | $0 |
| SQLite (local) | $0 |
| **Total Infrastructure** | **$0** |

### 7.4 Total Monthly Cost

| Category | Low | High |
|----------|-----|------|
| LLM (Claude) | $5 | $15 |
| Images (DALL-E) | $1 | $5 |
| Scraping (proxies if needed) | $0 | $10 |
| **Monthly Total** | **$6** | **$30** |

**Well within $50-100 budget** with room for:
- Higher volume
- Better models (Claude Opus for complex articles)
- More images

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Source site structure change | Scraper breaks | Modular scrapers, monitoring alerts |
| LLM generates incorrect data | Bad content published | Validation layer, fact-checking prompts |
| Rate limiting | Scraping blocked | Respectful delays, proxy rotation |
| Content too similar | SEO penalty | Uniqueness validation, diverse prompts |
| Image copyright issues | Legal risk | Only use generated/licensed images |

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Setup project structure
- [ ] Implement ProKoleso scraper
- [ ] Basic LLM integration
- [ ] SQLite database
- [ ] Manual trigger (CLI)

### Phase 2: Content Generation (Week 3-4)
- [ ] Tire description generator
- [ ] Article generator
- [ ] Image handler
- [ ] Strapi publisher

### Phase 3: Automation (Week 5-6)
- [ ] Test result scrapers (ADAC, AutoBild)
- [ ] Cron scheduling
- [ ] Telegram notifications
- [ ] Error handling

### Phase 4: Quality & Monitoring (Week 7-8)
- [ ] Content validation
- [ ] Duplicate detection
- [ ] Cost tracking
- [ ] Dashboard/reporting

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| New tire descriptions/month | 5+ |
| New articles/month | 4+ |
| Content uniqueness | >95% |
| Cost per article | <$2 |
| Error rate | <5% |
| Time saved vs manual | 80%+ |

---

## 11. API Keys Required

```env
# .env file for content-automation

# LLM
ANTHROPIC_API_KEY=sk-ant-...

# Image Generation
OPENAI_API_KEY=sk-...

# CMS
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=...

# Notifications (optional)
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

---

## 12. Next Steps

1. **Approve this specification**
2. **Setup API keys** (Anthropic, OpenAI)
3. **Start Phase 1 implementation**
4. **Test with 2-3 tire models**
5. **Review generated content quality**
6. **Proceed to automation**

---

## Appendix A: Sample Generated Content

### A.1 Tire Description Example

**Input:**
- Model: Bridgestone Blizzak LM005
- Season: Winter
- EU Label: A/B/71dB
- Test: ADAC 2024 - Rating 2.2

**Generated Output:**

```markdown
## Short Description
Bridgestone Blizzak LM005 - преміальна зимова шина з найвищим рейтингом зчеплення на мокрій дорозі (A). Ідеальний вибір для українських зим з частими відлигами та мокрим снігом.

## Full Description
Bridgestone Blizzak LM005 представляє нове покоління зимових шин, розроблених
для європейських кліматичних умов. Шина отримала найвищий можливий рейтинг
EU Label за зчеплення на мокрій дорозі (A), що підтверджує її виняткову
ефективність у складних зимових умовах.

### Технології
- **NanoPro-Tech** - інноваційна гумова суміш зберігає еластичність при
  температурах до -30°C
- **3D сипа** - тривимірні ламелі забезпечують стабільне зчеплення на снігу
- **Asymmetric Pattern** - асиметричний рисунок оптимізований для різних
  типів покриття

### Результати тестів
За результатами незалежного тесту ADAC 2024, Blizzak LM005 отримав оцінку 2.2
(Добре), увійшовши до трійки найкращих зимових шин сезону. Особливо високо
експерти оцінили гальмування на мокрому покритті та керованість на снігу.

### Для кого підходить
Шина рекомендована для водіїв, які цінують безпеку та комфорт у зимовий
період. Оптимальна для міста та траси в умовах українських зим з частою
зміною погоди.

## SEO
**Title:** Bridgestone Blizzak LM005 - зимові шини | Рейтинг A мокре зчеплення
**Description:** Зимова шина Bridgestone Blizzak LM005 з рейтингом ADAC 2.2. EU Label: A/B/71dB. Найкраще зчеплення на мокрій дорозі серед зимових шин.
```

---

## Appendix B: Article Template

### B.1 Test Summary Article

```markdown
# Bridgestone Blizzak 6 - переможець тесту Auto Bild 2025

Зимові шини Bridgestone Blizzak 6 отримали найвищу оцінку "зразковий" (1.3)
у престижному тесті Auto Bild sportscars 2025, випередивши 10 конкурентів.

## Про тест

Auto Bild sportscars провів випробування 11 зимових шин розміру 235/50 R19
на автомобілі Audi Q3 Sportback 45 TFSI quattro. Тестували на сухому та
мокрому асфальті, снігу та льоду.

## Результати Bridgestone

| Категорія | Оцінка | Примітка |
|-----------|--------|----------|
| Сніг | 1.2 | Найкраще зчеплення |
| Мокре гальмування | 54.0 м | Перше місце |
| Мокра керованість | 76.01 км/год | Найвища швидкість |
| Загальна | 1.3 | Переможець |

## Висновок для українських водіїв

Blizzak 6 - оптимальний вибір для тих, хто шукає преміальні зимові шини
з підтвердженою ефективністю. Технологія ENLITEN забезпечує легшу
конструкцію та кращу паливну ефективність без втрати безпеки.

**Доступні розміри:** від 195/65 R15 до 285/45 R20

---
*Джерело: Auto Bild sportscars, січень 2025*
```

---

---

## 13. Additional Features (P1 & P2)

### 13.1 Seasonal Auto-Content (P1)

**Триггеры:**
- Март (температура >7°C) → акцент на літні шини
- Жовтень (температура <7°C) → акцент на зимові шини

**Автоматические действия:**

```typescript
// config/seasonal.ts

interface SeasonalConfig {
  month: number;
  season: 'summer' | 'winter';
  heroTitle: string;
  heroSubtitle: string;
  featuredCategory: string;
  articleSlugs: string[];
}

const seasonalTriggers: SeasonalConfig[] = [
  {
    month: 3, // Березень
    season: 'summer',
    heroTitle: 'Час переходити на літні шини',
    heroSubtitle: 'Температура стабільно вище +7°C — оптимальний час для заміни',
    featuredCategory: 'summer',
    articleSlugs: ['koly-minyaty-na-litni', 'top-litni-shyny-2025']
  },
  {
    month: 10, // Жовтень
    season: 'winter',
    heroTitle: 'Готуйтесь до зими завчасно',
    heroSubtitle: 'Перші заморозки вже близько — оберіть надійні зимові шини',
    featuredCategory: 'winter',
    articleSlugs: ['koly-minyaty-na-zymovi', 'test-zymovyh-shyn-2025']
  }
];
```

**Контент:**

| Сезон | Hero Banner | Featured | Статті |
|-------|-------------|----------|--------|
| Весна (березень) | "Час на літні!" | Turanza 6, Potenza Sport | Коли міняти на літні |
| Осінь (жовтень) | "Готуйтесь до зими!" | Blizzak LM005, Blizzak 6 | Тест зимових ADAC |

**Реалізація в Strapi:**

```javascript
// Новий content type: SeasonalPromo
{
  "attributes": {
    "season": { "type": "enumeration", "enum": ["spring", "autumn"] },
    "activeFrom": { "type": "date" },
    "activeTo": { "type": "date" },
    "heroTitle": { "type": "string" },
    "heroSubtitle": { "type": "text" },
    "heroImage": { "type": "media" },
    "featuredTyres": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::tyre.tyre"
    },
    "featuredArticles": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::article.article"
    }
  }
}
```

---

### 13.2 Comparison Pages (P1)

**URL структура:**
```
/porivnyaty/blizzak-lm005-vs-continental-wintercontact
/porivnyaty/turanza-6-vs-potenza-sport
/porivnyaty?models=blizzak-lm005,turanza-6,potenza-sport
```

**Автогенерація:**

```typescript
// Триггер: 2+ моделі в одній категорії
interface ComparisonPage {
  slug: string;
  title: string;
  tyres: TyreModel[];
  comparisonTable: ComparisonRow[];
  verdict: string;
  generatedAt: Date;
}

interface ComparisonRow {
  attribute: string;
  values: { tyreSlug: string; value: string; winner?: boolean }[];
}

// LLM генерує verdict
const verdictPrompt = `
Порівняй шини ${tyres.map(t => t.name).join(' та ')}.

Характеристики:
${comparisonTable}

Напиши короткий висновок (3-4 речення) українською:
- Для кого підходить кожна модель
- Головна перевага кожної
- Рекомендація залежно від сценарію використання
`;
```

**Приклад таблиці порівняння:**

| Характеристика | Blizzak LM005 | Turanza 6 |
|----------------|---------------|-----------|
| Сезон | ❄️ Зима | ☀️ Літо |
| Мокре зчеплення | A 🏆 | A |
| Паливна ефективність | C | B 🏆 |
| Шум | 71 dB | 69 dB 🏆 |
| Тест ADAC | 2.2 🏆 | 2.6 |
| Для кого | Міські поїздки взимку | Траса та місто влітку |

**SEO цінність:**
- Long-tail keywords: "blizzak vs continental", "яку зимову шину обрати"
- Структуровані дані: Product comparison schema

---

### 13.3 FAQ Generator (P2)

**Автоматична генерація FAQ для кожної шини:**

```typescript
// processors/faq-generator.ts

interface FAQ {
  question: string;
  answer: string;
}

const faqPrompt = `
Згенеруй 5 FAQ для шини Bridgestone ${tireName} українською мовою.

Дані про шину:
- Сезон: ${season}
- Типи авто: ${vehicleTypes}
- Розміри: ${sizes.length} варіантів
- EU Label: ${euLabel}
- Технології: ${technologies}

Обов'язкові питання:
1. Для яких автомобілів підходить ця шина?
2. Чи можна використовувати цю шину [взимку/влітку]?
3. Який приблизний термін служби?
4. Як правильно зберігати шини?
5. Чим ця модель відрізняється від [попередника/конкурента]?

Формат відповіді: JSON array [{question, answer}]
Відповіді: 2-3 речення, конкретно, без "води"
`;
```

**Schema.org для FAQ:**

```typescript
// lib/schema.ts
export function generateFAQSchema(faqs: FAQ[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
```

---

### 13.4 Telegram Bot for Team (P2)

**Функціонал:**

```typescript
// publishers/telegram-bot.ts

interface TelegramNotification {
  type: 'new_content' | 'error' | 'weekly_summary';
  content: string;
  buttons?: TelegramButton[];
}

// Приклад повідомлення
const newContentMessage = `
🆕 *Новий контент згенеровано*

📦 *Шина:* Bridgestone Potenza Sport
📝 *Опис:* 487 слів
🏆 *Badges:* Winner ADAC 2025, Best Wet Grip

💰 *Вартість генерації:* $0.08

🔗 [Переглянути в Strapi](${strapiUrl})
`;

// Кнопки
const buttons = [
  { text: '✅ Опублікувати', callback: 'publish_123' },
  { text: '✏️ Редагувати', callback: 'edit_123' },
  { text: '❌ Видалити', callback: 'delete_123' }
];
```

**Weekly Summary:**

```
📊 *Тижневий звіт автоматизації*
📅 01.01.2025 - 07.01.2025

📦 Нові шини: 3
📝 Нові статті: 2
🏆 Badges додано: 5

💰 Витрати: $2.45
⏱ Зекономлено часу: ~8 годин

*Деталі:*
• Blizzak 6 — опис + 2 badges
• Turanza 6 — опис + 1 badge
• Стаття "ADAC Winter 2025" — 856 слів
```

---

### 13.5 Fuel Economy Calculator (P2)

**Інтерактивний віджет:**

```tsx
// components/FuelCalculator.tsx

interface FuelCalculatorProps {
  currentLabel: 'A' | 'B' | 'C' | 'D' | 'E';
  comparedLabel: 'A' | 'B' | 'C' | 'D' | 'E';
}

// EU Label fuel efficiency difference (L/100km)
const fuelDifference: Record<string, number> = {
  'A-B': 0.1,
  'A-C': 0.25,
  'A-D': 0.4,
  'A-E': 0.55,
  'B-C': 0.15,
  // ...
};

export function FuelCalculator() {
  const [annualKm, setAnnualKm] = useState(15000);
  const [fuelPrice, setFuelPrice] = useState(55); // UAH per liter

  const savings = useMemo(() => {
    const diff = fuelDifference[`${currentLabel}-${comparedLabel}`] || 0;
    const liters = (annualKm / 100) * diff;
    const money = liters * fuelPrice;
    return { liters, money };
  }, [annualKm, fuelPrice, currentLabel, comparedLabel]);

  return (
    <div className="calculator">
      <h3>Калькулятор економії палива</h3>

      <input
        type="range"
        min={5000}
        max={50000}
        value={annualKm}
        onChange={(e) => setAnnualKm(Number(e.target.value))}
      />
      <p>Річний пробіг: {annualKm.toLocaleString()} км</p>

      <div className="result">
        <p>💧 Економія: <strong>{savings.liters.toFixed(0)} л</strong> на рік</p>
        <p>💰 Це <strong>{savings.money.toFixed(0)} ₴</strong> щороку!</p>
      </div>
    </div>
  );
}
```

---

## 14. UI/UX Design Improvements

### 14.1 Current Issues

**Проблема контрастності:**

| Елемент | Поточний | Проблема |
|---------|----------|----------|
| `text-muted-foreground` | `#9ca3af` на `#18181b` | Контраст 4.2:1 (мінімум для AA) |
| `text-zinc-300` | `#d4d4d8` на `#27272a` | OK (7.8:1) |
| `text-zinc-700` | `#3f3f46` на `#f4f4f5` | OK (8.9:1) |
| Hero text `zinc-300` | На `zinc-900` gradient | Може бути <4.5:1 |

**Монохромність:**
- Сайт переважно чорно-сірий
- Бренд Bridgestone red (#e30613) майже не використовується поза header
- Іконки всі одного кольору

### 14.2 Color Accent Strategy

**Сезонні кольори (вже є частково):**

```css
/* Існуючі градієнти в коді */
.summer { background: linear-gradient(to-br, #f97316, #eab308); } /* orange → yellow */
.winter { background: linear-gradient(to-br, #3b82f6, #22d3ee); } /* blue → cyan */
.allseason { background: linear-gradient(to-br, #6b7280, #d1d5db); } /* gray */
```

**Додаткові акценти:**

```css
:root {
  /* Test badges */
  --badge-winner: #f59e0b;      /* amber-500 */
  --badge-recommended: #22c55e; /* green-500 */
  --badge-top3: #3b82f6;        /* blue-500 */
  --badge-category: #a855f7;    /* purple-500 */

  /* EU Label colors */
  --eu-label-a: #22c55e;  /* green */
  --eu-label-b: #84cc16;  /* lime */
  --eu-label-c: #eab308;  /* yellow */
  --eu-label-d: #f97316;  /* orange */
  --eu-label-e: #ef4444;  /* red */

  /* Technology icons */
  --tech-safety: #3b82f6;     /* blue */
  --tech-eco: #22c55e;        /* green */
  --tech-comfort: #8b5cf6;    /* violet */
  --tech-performance: #ef4444; /* red */
}
```

### 14.3 Contrast Fixes

**Dark theme improvements:**

```css
:root[data-theme="dark"] {
  /* Підвищення контрасту muted тексту */
  --muted: #a1a1aa;           /* zinc-400 замість zinc-500 */
  --muted-foreground: #a1a1aa;

  /* Світліший border для кращої видимості */
  --border: #3f3f46;          /* zinc-700 замість zinc-800 */

  /* Card background трохи світліший */
  --card: #1c1c1f;            /* між zinc-900 і zinc-800 */
}
```

**Hero section fix:**

```tsx
// Замість text-zinc-300 на gradient background
// Використовувати text-zinc-100 або text-white

// Before (проблема)
<p className="text-zinc-300">...</p>

// After (краще)
<p className="text-zinc-100">...</p>
// або з тінню для гарантованої читабельності
<p className="text-zinc-100 drop-shadow-sm">...</p>
```

### 14.4 Badge & Icon Design System

**Test Badges:**

```tsx
// components/ui/Badge.tsx

const badgeVariants = {
  winner: 'bg-amber-500 text-amber-950 border-amber-600',
  recommended: 'bg-green-500 text-green-950 border-green-600',
  top3: 'bg-blue-500 text-blue-950 border-blue-600',
  category: 'bg-purple-500 text-purple-950 border-purple-600',
  eco: 'bg-emerald-500 text-emerald-950 border-emerald-600',
  // Сезони
  summer: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white',
  winter: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white',
  allseason: 'bg-gradient-to-r from-gray-500 to-gray-400 text-white',
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1
      rounded-full text-sm font-semibold
      border shadow-sm
      ${badgeVariants[variant]}
    `}>
      {children}
    </span>
  );
}
```

**EU Label Colors:**

```tsx
// components/EuLabelBadge.tsx

const euLabelColors = {
  A: 'bg-green-500 text-white',
  B: 'bg-lime-500 text-lime-950',
  C: 'bg-yellow-500 text-yellow-950',
  D: 'bg-orange-500 text-white',
  E: 'bg-red-500 text-white',
};

export function EuLabelBadge({ type, value }: { type: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{type}:</span>
      <span className={`
        w-8 h-8 rounded-lg flex items-center justify-center
        font-bold text-lg ${euLabelColors[value]}
      `}>
        {value}
      </span>
    </div>
  );
}
```

**Technology Icons with Colors:**

```tsx
// components/TechnologyIcon.tsx

const techIcons = {
  'enliten': { icon: Leaf, color: 'text-green-500', bg: 'bg-green-500/10' },
  'run-flat': { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  'noise-reduction': { icon: Volume2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  'wet-grip': { icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  'winter-compound': { icon: Snowflake, color: 'text-blue-400', bg: 'bg-blue-400/10' },
};

export function TechnologyIcon({ tech }: { tech: string }) {
  const config = techIcons[tech];
  if (!config) return null;

  const Icon = config.icon;
  return (
    <div className={`p-2 rounded-lg ${config.bg}`}>
      <Icon className={`h-5 w-5 ${config.color}`} />
    </div>
  );
}
```

### 14.5 Visual Examples

**Before (монохромний):**
```
┌─────────────────────────────────────┐
│ ⚫ Blizzak LM005                     │
│ Зимова шина                          │
│ ⚫ EU: A/B/71                        │
│ ⚫ ADAC 2024                         │
└─────────────────────────────────────┘
```

**After (з кольоровими акцентами):**
```
┌─────────────────────────────────────┐
│ ❄️ Blizzak LM005          🏆 Winner │
│ Зимова шина                 ADAC'24 │
│                                     │
│ 🟢A  🟡B  71dB                      │
│ ────────────────────────────────────│
│ 🔵 Run-Flat  🟢 ENLITEN  🟣 Quiet  │
└─────────────────────────────────────┘
```

**Tire Card with seasonal gradient:**
```
┌─────────────────────────────────────┐
│ ┌───────────┐                       │
│ │   [IMG]   │  Turanza 6            │
│ │           │  ☀️ Літня             │
│ │           │                       │
│ └───────────┘  🟢A 🟢A 69dB         │
│                                     │
│ ✅ Рекомендовано ADAC               │
│ ⭐ Найкраще гальмування             │
│                                     │
│ [Детальніше]  [Знайти дилера]      │
└─────────────────────────────────────┘
```

### 14.6 Implementation Priority

| Зміна | Складність | Вплив | Пріоритет |
|-------|------------|-------|-----------|
| Contrast fixes (CSS variables) | Низька | Високий | 🔴 P0 |
| Badge component | Низька | Високий | 🔴 P1 |
| EU Label colors | Низька | Середній | 🟡 P2 |
| Technology icons | Середня | Середній | 🟡 P2 |
| Seasonal gradients | Низька | Низький | 🟢 P3 |

---

## 15. Implementation Checklist

### Phase 1: Foundation + Design Fixes
- [ ] Fix contrast issues in globals.css
- [ ] Create Badge component with variants
- [ ] Setup content-automation project structure
- [ ] Implement ProKoleso scraper
- [ ] Basic LLM integration (Claude API)

### Phase 2: Content Generation
- [ ] Tire description generator
- [ ] EU Label color badges
- [ ] Technology icons
- [ ] Test badge assignment logic
- [ ] Strapi publisher

### Phase 3: Advanced Features
- [ ] Seasonal auto-content
- [ ] Comparison pages generator
- [ ] FAQ generator
- [ ] Telegram bot notifications

### Phase 4: Quality & Polish
- [ ] Fuel calculator widget
- [ ] Content validation
- [ ] A/B testing descriptions
- [ ] Performance monitoring

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-01-08 | Claude AI | Initial draft |
| 0.2 | 2026-01-08 | Claude AI | Added deduplication & badges |
| 0.3 | 2026-01-08 | Claude AI | Removed pricing, added P1/P2 features |
| 1.0 | 2026-01-08 | Claude AI | Final version with UI/UX improvements |

---

## Summary

### What This System Does

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT AUTOMATION PIPELINE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SOURCES                  PROCESSING              OUTPUT        │
│   ───────                  ──────────              ──────        │
│                                                                  │
│   ProKoleso.ua ──┐                            ┌── Tire Descriptions
│   ADAC Tests ────┼──► Scraper ──► LLM ──► ───┼── Articles        │
│   Auto Bild ─────┤         │      │          ├── FAQ             │
│   TyreReviews ───┘         │      │          ├── SEO Content     │
│                            ▼      ▼          └── Test Badges     │
│                        Deduplication                             │
│                            │                                     │
│                            ▼                                     │
│                      ┌──────────┐                                │
│                      │  Strapi  │ ──► bridgestone.ua             │
│                      │   CMS    │                                │
│                      └──────────┘                                │
│                            │                                     │
│                            ▼                                     │
│                    Telegram Notifications                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| LLM Provider | Claude API (Sonnet) | Best Ukrainian language support |
| Image Generation | DALL-E 3 | Official API, good quality |
| Product Images | SimpleTire CDN | Already integrated |
| Automation Level | Full auto | Saves time, budget allows |
| Pricing Display | ⛔ None | Dealers have own pricing |
| Update Frequency | Weekly | Balance of freshness vs cost |

### Budget Summary

| Item | Monthly Cost |
|------|--------------|
| Claude API | $5-15 |
| DALL-E 3 | $1-5 |
| Infrastructure | $0 (existing) |
| **Total** | **$6-30** |

### Implementation Timeline

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Foundation + Design Fixes | 2 weeks |
| 2 | Content Generation | 2 weeks |
| 3 | Advanced Features (P1/P2) | 2 weeks |
| 4 | Quality & Polish | 2 weeks |

---

## Next Steps

1. **Approve this specification** ✅
2. **Setup API keys** (Anthropic, OpenAI)
3. **Fix contrast issues** in `globals.css` (P0)
4. **Create Badge component** (P1)
5. **Start Phase 1** — ProKoleso scraper + LLM integration

---

**Document End**

*Generated with Claude Code*
