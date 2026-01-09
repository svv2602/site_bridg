# Phase 8: Technical Debt

## Status
- [ ] Not Started
- [ ] In Progress
- [ ] Completed

**Started:** -
**Completed:** -

## Goal

Clean up technical debt: regenerate types, add tests, update documentation.

## Prerequisites

- Phase 5-7 completed
- System stable and working

---

## Tasks

### 8.1 Regenerate TypeScript Types from Strapi

- [ ] Run Strapi type generation
- [ ] Update frontend types to match
- [ ] Fix any type errors
- [ ] Verify all API calls typed correctly

**Steps:**

1. **Start Strapi** (if not running):
   ```bash
   cd backend
   npm run develop
   ```

2. **Generate types** using Strapi CLI or manually:
   ```bash
   # Option 1: If using strapi-plugin-types
   npm run strapi ts:generate-types

   # Option 2: Manual export
   # Go to Strapi Admin → Settings → API Tokens
   # Use the schema to create types
   ```

3. **Update frontend types** in `frontend/src/lib/data.ts`:
   ```typescript
   // Ensure these match Strapi schema:

   interface TyreModel {
     id: string;
     slug: string;
     name: string;
     shortDescription: string;
     fullDescription?: string;
     imageUrl: string;
     season: 'summer' | 'winter' | 'allseason';
     vehicleTypes: ('passenger' | 'suv' | 'van' | 'sport')[];
     sizes: TyreSize[];
     euLabel: EuLabel;
     usage?: Usage;
     technologies?: Technology[];
     // New fields from Phase 1-4:
     badges?: TyreBadge[];
     keyBenefits?: string[];
     seoTitle?: string;
     seoDescription?: string;
     // New fields from Phase 5:
     faqs?: FAQ[];
     testResults?: TestResult[];
   }

   interface TyreBadge {
     type: 'winner' | 'recommended' | 'top3' | 'best_category' | 'eco';
     source: 'adac' | 'autobild' | 'tyrereviews' | 'tcs' | 'eu_label';
     year: number;
     testType: 'summer' | 'winter' | 'allseason';
     category?: string;
     label: string;
   }

   interface FAQ {
     question: string;
     answer: string;
   }

   interface TestResult {
     id: string;
     source: 'adac' | 'autobild' | 'tyrereviews' | 'tcs';
     testType: 'summer' | 'winter' | 'allseason';
     year: number;
     testedSize: string;
     position: number;
     totalTested: number;
     rating: string;
     ratingNumeric: number;
     articleSlug?: string;
     sourceUrl?: string;
   }
   ```

4. **Run type check**:
   ```bash
   cd frontend
   npm run build  # Will show type errors
   ```

**Files to update:**
- `frontend/src/lib/data.ts`
- `frontend/src/lib/api/strapi.ts`
- `backend/types/generated/` (if exists)

**Verification:**
- [ ] Types match Strapi schema
- [ ] `npm run build` passes without type errors
- [ ] API responses properly typed

---

### 8.2 Add Unit Tests for Content Automation

- [ ] Setup test framework (Jest/Vitest)
- [ ] Add tests for validators
- [ ] Add tests for badge assigner
- [ ] Add tests for deduplicator
- [ ] Add tests for LLM response parser

**Setup:**
```bash
cd backend/content-automation
npm install -D vitest @vitest/coverage-v8
```

**Update package.json:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Create vitest.config.ts:**
```typescript
// backend/content-automation/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules', 'src/**/*.d.ts']
    }
  }
});
```

**Example tests:**

```typescript
// backend/content-automation/src/processors/validator.test.ts
import { describe, it, expect } from 'vitest';
import { validateTireContent, ValidationResult } from './validator';

describe('validateTireContent', () => {
  it('should pass valid content', () => {
    const content = {
      shortDescription: 'Преміальна літня шина з відмінним зчепленням на мокрій дорозі та низьким рівнем шуму.',
      fullDescription: 'Bridgestone Turanza 6 - це преміальна літня шина...' + 'х'.repeat(500),
      keyBenefits: ['Відмінне зчеплення', 'Низький шум', 'Економія палива'],
      seoTitle: 'Bridgestone Turanza 6 - літні шини | Характеристики',
      seoDescription: 'Літня шина Bridgestone Turanza 6 з рейтингом EU Label A/A. Преміальне зчеплення та комфорт.'
    };

    const result = validateTireContent(content);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail on missing required fields', () => {
    const content = {
      shortDescription: '',
      fullDescription: '',
      keyBenefits: [],
      seoTitle: '',
      seoDescription: ''
    };

    const result = validateTireContent(content);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should warn on too long SEO title', () => {
    const content = {
      shortDescription: 'Преміальна літня шина з відмінним зчепленням.',
      fullDescription: 'Опис '.repeat(100),
      keyBenefits: ['Benefit 1', 'Benefit 2'],
      seoTitle: 'Це дуже довгий SEO заголовок який перевищує рекомендовані 60 символів і має бути скорочений',
      seoDescription: 'Нормальний опис.'
    };

    const result = validateTireContent(content);
    expect(result.warnings).toContain(expect.stringContaining('seoTitle'));
  });

  it('should detect non-Ukrainian content', () => {
    const content = {
      shortDescription: 'This is English text without any Ukrainian.',
      fullDescription: 'More English content here.',
      keyBenefits: ['English benefit'],
      seoTitle: 'English title',
      seoDescription: 'English description'
    };

    const result = validateTireContent(content);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(expect.stringContaining('Ukrainian'));
  });
});
```

```typescript
// backend/content-automation/src/processors/badge-assigner.test.ts
import { describe, it, expect } from 'vitest';
import { assignBadges, filterActiveBadges } from './badge-assigner';

describe('assignBadges', () => {
  it('should assign winner badge for position 1', () => {
    const testResult = {
      source: 'adac',
      testType: 'summer',
      year: 2025,
      position: 1,
      rating: '1.8',
      ratingNumeric: 1.8
    };

    const badges = assignBadges(testResult);
    expect(badges).toContainEqual(expect.objectContaining({
      type: 'winner',
      priority: 1
    }));
  });

  it('should assign recommended badge for rating <= 2.0', () => {
    const testResult = {
      source: 'adac',
      testType: 'winter',
      year: 2025,
      position: 3,
      rating: '2.0',
      ratingNumeric: 2.0
    };

    const badges = assignBadges(testResult);
    expect(badges).toContainEqual(expect.objectContaining({
      type: 'recommended'
    }));
  });
});

describe('filterActiveBadges', () => {
  it('should filter out badges older than 3 years', () => {
    const currentYear = new Date().getFullYear();
    const badges = [
      { type: 'winner', year: currentYear, priority: 1 },
      { type: 'winner', year: currentYear - 4, priority: 1 }
    ];

    const active = filterActiveBadges(badges);
    expect(active).toHaveLength(1);
    expect(active[0].year).toBe(currentYear);
  });
});
```

**Run tests:**
```bash
npm test
npm run test:coverage
```

**Verification:**
- [ ] Test framework configured
- [ ] Validator tests pass
- [ ] Badge assigner tests pass
- [ ] Coverage > 50%

---

### 8.3 Update CLAUDE.md with Automation Info

- [ ] Add Content Automation section
- [ ] Document CLI commands
- [ ] Document configuration
- [ ] Add troubleshooting tips

**Add to CLAUDE.md:**
```markdown
## Content Automation

### Overview

Automated content generation system in `/backend/content-automation/`:
- Scrapes tire data from ProKoleso, ADAC, AutoBild
- Generates descriptions using Claude API
- Assigns test badges automatically
- Publishes to Strapi CMS
- Sends Telegram notifications

### Commands

```bash
cd backend/content-automation

# Full weekly automation
npm run start

# Individual operations
npx tsx src/scheduler.ts scrape      # Scrape sources
npx tsx src/scheduler.ts generate    # Generate content
npx tsx src/scheduler.ts publish     # Publish to Strapi
npx tsx src/scheduler.ts run-full    # All steps

# Telegram test
npx tsx src/scheduler.ts test-telegram
```

### Configuration

Required environment variables (`.env`):
```env
ANTHROPIC_API_KEY=sk-ant-...     # Claude API
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=...
TELEGRAM_BOT_TOKEN=...           # Optional
TELEGRAM_CHAT_ID=...             # Optional
OPENAI_API_KEY=...               # Optional, for images
```

### Architecture

```
scrapers/ → processors/ → publishers/
    ↓           ↓            ↓
ProKoleso    LLM Gen      Strapi
ADAC         Validator    Telegram
AutoBild     Badges
```

### Admin Dashboard

Available at `/admin/automation` (requires authentication).
Features: stats, recent jobs, manual triggers.

### Telegram Bot Commands

- `/run` - Start full automation
- `/scrape` - Scrape only
- `/status` - Last run status
- `/stats` - Weekly statistics
```

**Verification:**
- [ ] CLAUDE.md updated
- [ ] Commands documented
- [ ] Configuration listed

---

### 8.4 Add Integration Tests

- [ ] Create test for full pipeline (mock LLM)
- [ ] Create test for Strapi publishing
- [ ] Create test for scraper (mock HTTP)
- [ ] Add CI workflow (optional)

**Integration test example:**
```typescript
// backend/content-automation/src/integration.test.ts
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { runWeeklyAutomation } from './scheduler';

// Mock external services
vi.mock('./processors/llm-generator', () => ({
  generateContent: vi.fn().mockResolvedValue({
    shortDescription: 'Тестовий опис шини.',
    fullDescription: 'Повний опис шини для тестування.',
    keyBenefits: ['Перевага 1', 'Перевага 2'],
    seoTitle: 'Тестова шина',
    seoDescription: 'Опис для SEO'
  })
}));

vi.mock('./publishers/strapi-client', () => ({
  publishTyre: vi.fn().mockResolvedValue({ id: 1 }),
  publishArticle: vi.fn().mockResolvedValue({ id: 1 })
}));

vi.mock('./publishers/telegram-bot', () => ({
  notify: vi.fn().mockResolvedValue(undefined)
}));

describe('Integration: Weekly Automation', () => {
  it('should complete full pipeline without errors', async () => {
    // This test verifies the pipeline runs without throwing
    await expect(runWeeklyAutomation()).resolves.not.toThrow();
  });
});
```

**GitHub Actions workflow (optional):**
```yaml
# .github/workflows/test-automation.yml
name: Test Content Automation

on:
  push:
    paths:
      - 'backend/content-automation/**'
  pull_request:
    paths:
      - 'backend/content-automation/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: backend/content-automation
        run: npm ci

      - name: Run tests
        working-directory: backend/content-automation
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: backend/content-automation/coverage
```

**Verification:**
- [ ] Integration tests pass
- [ ] Mocks work correctly
- [ ] CI workflow runs (if added)

---

## Completion Checklist

Before marking this phase complete:

1. [ ] All 4 tasks completed
2. [ ] Types regenerated and validated
3. [ ] Unit tests pass with good coverage
4. [ ] CLAUDE.md updated
5. [ ] Integration tests pass
6. [ ] Final commit:
   ```bash
   git add .
   git commit -m "chore: technical debt cleanup

   - Regenerate TypeScript types
   - Add unit and integration tests
   - Update CLAUDE.md documentation
   - Add test coverage reporting"
   ```
7. [ ] Update PROGRESS.md - mark all complete!

---

## Project Completion

After Phase 8, the Content Automation System is fully complete:

### Delivered Features

**Backend:**
- ProKoleso, ADAC, AutoBild, TyreReviews scrapers
- Claude AI content generation
- DALL-E 3 image generation
- Badge assignment system
- Content validation & deduplication
- Strapi CMS publishing
- Telegram notifications & commands
- Cron scheduler
- API for admin dashboard

**Frontend:**
- Badge, EuLabelBadge, TechnologyIcon components
- FAQ section with Schema.org
- Seasonal hero
- Test results section
- Comparison pages
- Fuel calculator
- Admin dashboard

**Infrastructure:**
- PM2 configuration
- Structured logging
- Metrics collection
- Error recovery with retry

### Maintenance

1. **Weekly**: Check Telegram for automation reports
2. **Monthly**: Review generated content quality
3. **Quarterly**: Update LLM prompts if needed
4. **As needed**: Update scrapers if source sites change
