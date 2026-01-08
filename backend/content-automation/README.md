# Content Automation System

Automated content generation and publishing system for Bridgestone Ukraine website.

## Features

- **Tire Content Generation**: Automatically generate product descriptions using Claude AI
- **Test Results Scraping**: Scrape ADAC, AutoBild, and TyreReviews for test results
- **Badge Assignment**: Automatically assign test winner badges to tires
- **Strapi Publishing**: Publish generated content to Strapi CMS
- **Telegram Notifications**: Send notifications about new content and errors
- **FAQ Generation**: Generate FAQ content with Schema.org markup
- **Comparison Pages**: Generate tire comparison content
- **Content Validation**: Validate content quality before publishing

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run full automation
npm run start
```

## CLI Commands

```bash
# Full weekly automation
npx tsx src/scheduler.ts run-full

# Scrape only
npx tsx src/scheduler.ts scrape

# Generate content only
npx tsx src/scheduler.ts generate

# Publish to Strapi only
npx tsx src/scheduler.ts publish

# Test Telegram notification
npx tsx src/scheduler.ts test-telegram
```

## Configuration

### Environment Variables

Create a `.env` file with the following:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...       # Claude API key

# Strapi
STRAPI_URL=http://localhost:1337   # Strapi server URL
STRAPI_API_TOKEN=your-token        # Strapi API token

# Telegram (optional)
TELEGRAM_BOT_TOKEN=123456:ABC...   # Bot token from @BotFather
TELEGRAM_CHAT_ID=-100123456789     # Chat/channel ID

# Database
SQLITE_PATH=./data/content-automation.db
```

## Architecture

```
src/
├── config/
│   ├── env.ts          # Environment configuration
│   ├── prompts.ts      # LLM prompt templates
│   └── seasonal.ts     # Seasonal content config
├── scrapers/
│   ├── prokoleso.ts    # ProKoleso tire scraper
│   ├── adac.ts         # ADAC test results
│   ├── autobild.ts     # AutoBild test results
│   └── tyrereviews.ts  # TyreReviews aggregator
├── processors/
│   ├── llm-generator.ts          # Claude API client
│   ├── tire-description-generator.ts  # Tire content
│   ├── faq-generator.ts          # FAQ content
│   ├── article-generator.ts      # Article content
│   ├── comparison-generator.ts   # Comparison content
│   ├── badge-assigner.ts         # Badge logic
│   ├── validator.ts              # Content validation
│   ├── deduplicator.ts           # Duplicate detection
│   └── seasonal-content.ts       # Seasonal hero
├── publishers/
│   ├── strapi-client.ts # Strapi REST API client
│   └── telegram-bot.ts  # Telegram notifications
├── utils/
│   ├── logger.ts        # Structured logging
│   ├── metrics.ts       # Metrics collection
│   └── retry.ts         # Retry with backoff
├── db/
│   ├── schema.sql       # SQLite schema
│   └── test-results.ts  # Test results storage
└── scheduler.ts         # Cron scheduler & CLI
```

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Scrapers   │────▶│ Processors  │────▶│ Publishers  │
│             │     │             │     │             │
│ - ProKoleso │     │ - LLM Gen   │     │ - Strapi    │
│ - ADAC      │     │ - Validator │     │ - Telegram  │
│ - AutoBild  │     │ - Badges    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
        │                  │                   │
        ▼                  ▼                   ▼
   ┌─────────────────────────────────────────────────┐
   │               SQLite Database                   │
   │  - Scraped tires   - Test results              │
   │  - Content hashes  - Metrics                   │
   └─────────────────────────────────────────────────┘
```

## Content Types

### Tire Content

Generated fields:
- `shortDescription` (100-300 chars) - Brief product summary
- `fullDescription` (500-2000 chars) - Detailed description
- `keyBenefits` (3-5 items) - Bullet point features
- `seoTitle` (max 60 chars) - SEO page title
- `seoDescription` (max 160 chars) - SEO meta description

### Test Badges

Types: `winner`, `recommended`, `top3`, `best_category`, `eco`
Sources: `adac`, `autobild`, `tyrereviews`, `tcs`, `eu_label`

### FAQ

5 standard questions generated per tire:
1. Vehicle compatibility
2. Seasonal usage
3. Expected lifespan
4. Storage recommendations
5. Comparison with predecessor

## Validation Rules

| Field | Min | Max | Required |
|-------|-----|-----|----------|
| shortDescription | 80 | 350 | Yes |
| fullDescription | 400 | 2500 | Yes |
| keyBenefits | 2 items | 6 items | Yes |
| seoTitle | 20 | 70 | Yes |
| seoDescription | 80 | 180 | Yes |

Additional checks:
- Ukrainian language detection (min 60% Cyrillic)
- Content hash deduplication
- Strapi ID linking

## Error Handling

- **Retry with exponential backoff**: Up to 3 retries with 1s → 4s → 16s delays
- **Circuit breaker**: Opens after 5 failures, resets after 60s
- **Graceful degradation**: Continues processing other items on individual failures
- **Telegram alerts**: Immediate notification on critical errors

## Monitoring

Metrics tracked:
- Tires scraped/generated/published
- Articles generated
- LLM tokens used
- Cost (USD)
- Execution time
- Error count

View metrics:
```bash
sqlite3 data/content-automation.db "SELECT * FROM metrics ORDER BY date DESC LIMIT 7"
```

## Troubleshooting

### LLM returns invalid JSON
- Check prompt templates in `config/prompts.ts`
- Ensure system prompt emphasizes JSON output
- Enable debug logging to see raw responses

### Strapi publish fails
- Verify API token has write permissions
- Check content type fields match schema
- Ensure Strapi is running: `curl http://localhost:1337/api/tyres`

### Telegram not sending
- Verify bot token with: `curl https://api.telegram.org/bot<TOKEN>/getMe`
- Check chat ID is correct (use `@userinfobot` to get ID)
- For channels, prefix ID with `-100`

### Scraping blocked
- Add delays between requests (1-2s minimum)
- Rotate User-Agent if needed
- Consider using proxy for production

## License

Internal use only - Bridgestone Ukraine
