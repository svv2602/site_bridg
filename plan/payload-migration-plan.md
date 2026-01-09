# Payload CMS Migration Plan

## Overview

Migration from Strapi v4 to Payload CMS v3 for Bridgestone Ukraine website.

**Goal:** Unified TypeScript backend with CMS, content automation, and admin panel in one service.

**Timeline:** 2-3 days

**Created:** 2026-01-09

---

## Current State (Strapi)

### Content Types
| Collection | Fields | Records |
|------------|--------|---------|
| Tyre | slug, name, season, vehicleTypes, sizes, euLabel, usage, badges, etc. | ~20 |
| Article | slug, title, body, tags, image, seoTitle, seoDescription | ~10 |
| Dealer | name, type, city, address, lat/lng, phone, services | ~15 |
| Technology | slug, name, description, icon | ~8 |
| VehicleFitment | make, model, year, recommendedSizes | ~50 |

### Components
| Component | Fields |
|-----------|--------|
| tyre.eu-label | wetGrip, fuelEfficiency, noiseDb, noiseClass |
| tyre.size | width, aspectRatio, diameter, loadIndex, speedIndex |
| tyre.usage | city, highway, offroad, winter |
| award.badge | type, source, year, testType, category, label |

### Separate Services
- **Strapi** (port 1337) — CMS
- **content-automation** (CLI) — scrapers, generators, publishers

---

## Target State (Payload)

```
backend-payload/
├── src/
│   ├── collections/           # Content types
│   │   ├── Tyres.ts
│   │   ├── Articles.ts
│   │   ├── Dealers.ts
│   │   ├── Technologies.ts
│   │   └── VehicleFitments.ts
│   │
│   ├── blocks/                # Reusable content blocks
│   │   └── ...
│   │
│   ├── fields/                # Shared field configs
│   │   ├── euLabel.ts
│   │   ├── tyreSize.ts
│   │   ├── usage.ts
│   │   └── badge.ts
│   │
│   ├── automation/            # Content automation (moved from separate service)
│   │   ├── scrapers/
│   │   │   ├── prokoleso.ts
│   │   │   ├── adac.ts
│   │   │   ├── autobild.ts
│   │   │   └── tyrereviews.ts
│   │   ├── processors/
│   │   │   ├── llm-generator.ts
│   │   │   ├── tire-description-generator.ts
│   │   │   ├── article-generator.ts
│   │   │   ├── faq-generator.ts
│   │   │   ├── badge-assigner.ts
│   │   │   ├── validator.ts
│   │   │   └── deduplicator.ts
│   │   ├── publishers/
│   │   │   └── telegram-bot.ts
│   │   └── jobs/
│   │       ├── weekly-automation.ts
│   │       └── scheduler.ts
│   │
│   ├── hooks/                 # Payload hooks (before/after save)
│   │   └── tyre-hooks.ts
│   │
│   ├── endpoints/             # Custom API endpoints
│   │   ├── automation.ts      # /api/automation/run
│   │   ├── seasonal.ts        # /api/seasonal
│   │   └── stats.ts           # /api/stats
│   │
│   ├── admin/                 # Admin customizations
│   │   └── components/
│   │
│   └── server.ts              # Entry point
│
├── payload.config.ts          # Main config
├── package.json
├── tsconfig.json
└── .env
```

**Single service on port 3001:**
- Admin panel: http://localhost:3001/admin
- API: http://localhost:3001/api
- Custom endpoints: http://localhost:3001/api/automation

---

## Migration Phases

### Phase 1: Project Setup (2-3 hours)

#### 1.1 Create Payload Project

```bash
cd /home/snisar/RubyProjects/site_Bridgestone

# Create new Payload project
npx create-payload-app@latest backend-payload

# Select options:
# - Template: blank
# - Database: mongodb (or postgres)
# - TypeScript: yes
```

#### 1.2 Configure Payload

```typescript
// backend-payload/payload.config.ts
import { buildConfig } from 'payload';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
// OR: import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { uploadthingStorage } from '@payloadcms/storage-uploadthing';
import path from 'path';

import { Tyres } from './src/collections/Tyres';
import { Articles } from './src/collections/Articles';
import { Dealers } from './src/collections/Dealers';
import { Technologies } from './src/collections/Technologies';
import { VehicleFitments } from './src/collections/VehicleFitments';
import { Users } from './src/collections/Users';
import { Media } from './src/collections/Media';

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Bridgestone Ukraine',
    },
  },
  collections: [
    Users,
    Media,
    Tyres,
    Articles,
    Dealers,
    Technologies,
    VehicleFitments,
  ],
  editor: lexicalEditor(),
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || 'mongodb://localhost/bridgestone',
  }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  // Localization (for future multi-language)
  localization: {
    locales: ['uk'],
    defaultLocale: 'uk',
  },
});
```

#### 1.3 Install Dependencies

```bash
cd backend-payload
npm install @anthropic-ai/sdk puppeteer node-cron
npm install -D @types/node-cron
```

---

### Phase 2: Collections Migration (3-4 hours)

#### 2.1 Tyres Collection

```typescript
// backend-payload/src/collections/Tyres.ts
import { CollectionConfig } from 'payload';
import { euLabelField } from '../fields/euLabel';
import { tyreSizeField } from '../fields/tyreSize';
import { usageField } from '../fields/usage';
import { badgeField } from '../fields/badge';

export const Tyres: CollectionConfig = {
  slug: 'tyres',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'season', 'isNew', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'season',
      type: 'select',
      required: true,
      options: [
        { label: 'Літня', value: 'summer' },
        { label: 'Зимова', value: 'winter' },
        { label: 'Всесезонна', value: 'allseason' },
      ],
    },
    {
      name: 'vehicleTypes',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'Легкові', value: 'passenger' },
        { label: 'SUV', value: 'suv' },
        { label: 'Van', value: 'van' },
        { label: 'Sport', value: 'sport' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isNew',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '50%' },
        },
        {
          name: 'isPopular',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 350,
    },
    {
      name: 'fullDescription',
      type: 'richText',
    },
    // EU Label (group)
    euLabelField,
    // Sizes (array)
    {
      name: 'sizes',
      type: 'array',
      fields: tyreSizeField,
    },
    // Usage (group)
    usageField,
    // Badges (array)
    {
      name: 'badges',
      type: 'array',
      fields: badgeField,
      admin: {
        description: 'Test awards and badges',
      },
    },
    // Technologies (relationship)
    {
      name: 'technologies',
      type: 'relationship',
      relationTo: 'technologies',
      hasMany: true,
    },
    // SEO
    {
      name: 'keyBenefits',
      type: 'array',
      fields: [{ name: 'benefit', type: 'text' }],
    },
    {
      name: 'seoTitle',
      type: 'text',
      maxLength: 70,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      maxLength: 170,
      admin: {
        position: 'sidebar',
      },
    },
    // FAQs (for Phase 5)
    {
      name: 'faqs',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    // Test Results (for Phase 5)
    {
      name: 'testResults',
      type: 'array',
      fields: [
        { name: 'source', type: 'select', options: ['adac', 'autobild', 'tyrereviews', 'tcs'] },
        { name: 'testType', type: 'select', options: ['summer', 'winter', 'allseason'] },
        { name: 'year', type: 'number' },
        { name: 'testedSize', type: 'text' },
        { name: 'position', type: 'number' },
        { name: 'totalTested', type: 'number' },
        { name: 'rating', type: 'text' },
        { name: 'ratingNumeric', type: 'number' },
        { name: 'articleSlug', type: 'text' },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      // Auto-generate slug from name
      ({ data }) => {
        if (data.name && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        }
        return data;
      },
    ],
  },
};
```

#### 2.2 Shared Fields

```typescript
// backend-payload/src/fields/euLabel.ts
import { Field } from 'payload';

export const euLabelField: Field = {
  name: 'euLabel',
  type: 'group',
  fields: [
    {
      name: 'wetGrip',
      type: 'select',
      options: ['A', 'B', 'C', 'D', 'E'],
    },
    {
      name: 'fuelEfficiency',
      type: 'select',
      options: ['A', 'B', 'C', 'D', 'E'],
    },
    {
      name: 'noiseDb',
      type: 'number',
      min: 60,
      max: 80,
    },
    {
      name: 'noiseClass',
      type: 'select',
      options: ['A', 'B', 'C'],
    },
  ],
};

// backend-payload/src/fields/tyreSize.ts
export const tyreSizeField: Field[] = [
  { name: 'width', type: 'number', required: true },
  { name: 'aspectRatio', type: 'number', required: true },
  { name: 'diameter', type: 'number', required: true },
  { name: 'loadIndex', type: 'text' },
  { name: 'speedIndex', type: 'text' },
];

// backend-payload/src/fields/badge.ts
export const badgeField: Field[] = [
  {
    name: 'type',
    type: 'select',
    required: true,
    options: ['winner', 'recommended', 'top3', 'best_category', 'eco'],
  },
  {
    name: 'source',
    type: 'select',
    required: true,
    options: ['adac', 'autobild', 'tyrereviews', 'tcs', 'eu_label'],
  },
  { name: 'year', type: 'number', required: true },
  {
    name: 'testType',
    type: 'select',
    options: ['summer', 'winter', 'allseason'],
  },
  { name: 'category', type: 'text' },
  { name: 'label', type: 'text', required: true },
];
```

#### 2.3 Articles Collection

```typescript
// backend-payload/src/collections/Articles.ts
import { CollectionConfig } from 'payload';

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'previewText',
      type: 'textarea',
      required: true,
      maxLength: 300,
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'readingTimeMinutes',
      type: 'number',
      min: 1,
      max: 60,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
    },
    {
      name: 'relatedTyres',
      type: 'relationship',
      relationTo: 'tyres',
      hasMany: true,
    },
    // SEO
    {
      name: 'seoTitle',
      type: 'text',
      maxLength: 70,
      admin: { position: 'sidebar' },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      maxLength: 170,
      admin: { position: 'sidebar' },
    },
  ],
};
```

#### 2.4 Other Collections

```typescript
// backend-payload/src/collections/Dealers.ts
import { CollectionConfig } from 'payload';

export const Dealers: CollectionConfig = {
  slug: 'dealers',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Офіційний', value: 'official' },
        { label: 'Партнер', value: 'partner' },
        { label: 'Сервіс', value: 'service' },
      ],
    },
    { name: 'city', type: 'text', required: true },
    { name: 'address', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'latitude', type: 'number', admin: { width: '50%' } },
        { name: 'longitude', type: 'number', admin: { width: '50%' } },
      ],
    },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'website', type: 'text' },
    { name: 'workingHours', type: 'text' },
    {
      name: 'services',
      type: 'select',
      hasMany: true,
      options: [
        'tire-fitting',
        'alignment',
        'balancing',
        'storage',
        'repair',
      ],
    },
  ],
};

// backend-payload/src/collections/Technologies.ts
export const Technologies: CollectionConfig = {
  slug: 'technologies',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'icon', type: 'text' },
    {
      name: 'tyres',
      type: 'relationship',
      relationTo: 'tyres',
      hasMany: true,
    },
  ],
};

// backend-payload/src/collections/VehicleFitments.ts
export const VehicleFitments: CollectionConfig = {
  slug: 'vehicle-fitments',
  admin: {
    useAsTitle: 'model',
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'make', type: 'text', required: true },
    { name: 'model', type: 'text', required: true },
    { name: 'yearFrom', type: 'number' },
    { name: 'yearTo', type: 'number' },
    {
      name: 'recommendedSizes',
      type: 'array',
      fields: [
        { name: 'width', type: 'number' },
        { name: 'aspectRatio', type: 'number' },
        { name: 'diameter', type: 'number' },
      ],
    },
  ],
};
```

#### 2.5 Media & Users

```typescript
// backend-payload/src/collections/Media.ts
import { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300 },
      { name: 'card', width: 768, height: 576 },
      { name: 'hero', width: 1920, height: 1080 },
    ],
    mimeTypes: ['image/*'],
  },
  fields: [
    { name: 'alt', type: 'text' },
  ],
  access: {
    read: () => true,
  },
};

// backend-payload/src/collections/Users.ts
import { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'editor'],
      defaultValue: 'editor',
    },
  ],
};
```

---

### Phase 3: Content Automation Integration (2-3 hours)

#### 3.1 Move Automation Code

```bash
# Copy automation code to Payload project
cp -r backend/content-automation/src/scrapers backend-payload/src/automation/
cp -r backend/content-automation/src/processors backend-payload/src/automation/
cp -r backend/content-automation/src/publishers backend-payload/src/automation/
cp -r backend/content-automation/src/config backend-payload/src/automation/
cp -r backend/content-automation/src/utils backend-payload/src/automation/
```

#### 3.2 Update Publishers to Use Payload API

```typescript
// backend-payload/src/automation/publishers/payload-client.ts
import payload from 'payload';

export async function publishTyre(content: GeneratedTireContent) {
  // Check if exists
  const existing = await payload.find({
    collection: 'tyres',
    where: { slug: { equals: content.slug } },
  });

  if (existing.docs.length > 0) {
    // Update
    return payload.update({
      collection: 'tyres',
      id: existing.docs[0].id,
      data: content,
    });
  }

  // Create
  return payload.create({
    collection: 'tyres',
    data: content,
  });
}

export async function publishArticle(article: GeneratedArticle) {
  const existing = await payload.find({
    collection: 'articles',
    where: { slug: { equals: article.slug } },
  });

  if (existing.docs.length > 0) {
    return payload.update({
      collection: 'articles',
      id: existing.docs[0].id,
      data: article,
    });
  }

  return payload.create({
    collection: 'articles',
    data: article,
  });
}
```

#### 3.3 Setup Cron Jobs

```typescript
// backend-payload/src/automation/jobs/scheduler.ts
import cron from 'node-cron';
import { runWeeklyAutomation } from './weekly-automation';
import { notify } from '../publishers/telegram-bot';

export function initScheduler() {
  // Weekly automation: Sunday at 03:00
  cron.schedule('0 3 * * 0', async () => {
    console.log('Starting weekly automation...');
    try {
      await notify({ type: 'info', message: '🕐 Починаю щотижневу автоматизацію...' });
      await runWeeklyAutomation();
    } catch (error) {
      console.error('Automation failed:', error);
      await notify({ type: 'error', message: `❌ Помилка: ${error}` });
    }
  }, {
    timezone: 'Europe/Kyiv'
  });

  console.log('Scheduler initialized: Weekly automation at Sunday 03:00 Kyiv time');
}
```

#### 3.4 Custom Endpoints

```typescript
// backend-payload/src/endpoints/automation.ts
import { Endpoint } from 'payload';
import { runWeeklyAutomation, runScrapeOnly } from '../automation/jobs/weekly-automation';

export const automationEndpoints: Endpoint[] = [
  {
    path: '/automation/run',
    method: 'post',
    handler: async (req, res) => {
      const { type } = req.body;

      try {
        switch (type) {
          case 'full':
            runWeeklyAutomation().catch(console.error);
            break;
          case 'scrape':
            runScrapeOnly().catch(console.error);
            break;
          default:
            return res.status(400).json({ error: 'Invalid type' });
        }
        res.json({ success: true, message: `Started ${type}` });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    },
  },
  {
    path: '/automation/stats',
    method: 'get',
    handler: async (req, res) => {
      // Return automation stats
      res.json({
        tiresProcessed: 12,
        articlesCreated: 5,
        lastRun: new Date().toISOString(),
      });
    },
  },
];

// Add to payload.config.ts:
// endpoints: automationEndpoints,
```

---

### Phase 4: Frontend API Update (2-3 hours)

#### 4.1 Update Strapi Client to Payload

```typescript
// frontend/src/lib/api/payload.ts
const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';

export async function getPayloadTyres(params?: {
  season?: string;
  vehicleType?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.season) {
    searchParams.set('where[season][equals]', params.season);
  }
  if (params?.vehicleType) {
    searchParams.set('where[vehicleTypes][contains]', params.vehicleType);
  }
  if (params?.limit) {
    searchParams.set('limit', String(params.limit));
  }

  const response = await fetch(
    `${PAYLOAD_URL}/api/tyres?${searchParams}`,
    { next: { revalidate: 60 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch tyres');
  }

  const data = await response.json();
  return data.docs;
}

export async function getPayloadTyreBySlug(slug: string) {
  const response = await fetch(
    `${PAYLOAD_URL}/api/tyres?where[slug][equals]=${slug}`,
    { next: { revalidate: 60 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch tyre');
  }

  const data = await response.json();
  return data.docs[0] || null;
}

export async function getPayloadArticles(limit = 10) {
  const response = await fetch(
    `${PAYLOAD_URL}/api/articles?limit=${limit}&sort=-createdAt`,
    { next: { revalidate: 60 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  const data = await response.json();
  return data.docs;
}

export async function getPayloadDealers(city?: string) {
  const params = city ? `?where[city][equals]=${city}` : '';
  const response = await fetch(
    `${PAYLOAD_URL}/api/dealers${params}`,
    { next: { revalidate: 300 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch dealers');
  }

  const data = await response.json();
  return data.docs;
}
```

#### 4.2 Update Environment Variables

```env
# frontend/.env.local
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3001

# Remove Strapi variables
# NEXT_PUBLIC_STRAPI_URL=...
# STRAPI_API_TOKEN=...
```

#### 4.3 Update API Imports

```bash
# Find and replace in frontend
grep -rl "strapi" frontend/src/lib/api/ | xargs sed -i 's/strapi/payload/g'
grep -rl "getStrapiTyres" frontend/src/ | xargs sed -i 's/getStrapiTyres/getPayloadTyres/g'
```

---

### Phase 5: Data Migration (1-2 hours)

#### 5.1 Create Migration Script

```typescript
// scripts/migrate-strapi-to-payload.ts
import fetch from 'node-fetch';

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const PAYLOAD_URL = 'http://localhost:3001';

async function fetchStrapi(endpoint: string) {
  const response = await fetch(`${STRAPI_URL}/api/${endpoint}?populate=*`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });
  return response.json();
}

async function createPayload(collection: string, data: any) {
  const response = await fetch(`${PAYLOAD_URL}/api/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function migrateTyres() {
  console.log('Migrating tyres...');
  const { data } = await fetchStrapi('tyres');

  for (const tyre of data) {
    const attrs = tyre.attributes;
    await createPayload('tyres', {
      slug: attrs.slug,
      name: attrs.name,
      season: attrs.season,
      vehicleTypes: attrs.vehicleTypes,
      isNew: attrs.isNew,
      isPopular: attrs.isPopular,
      shortDescription: attrs.shortDescription,
      fullDescription: attrs.fullDescription,
      euLabel: attrs.euLabel,
      sizes: attrs.sizes,
      usage: attrs.usage,
      badges: attrs.badges,
      keyBenefits: attrs.keyBenefits,
      seoTitle: attrs.seoTitle,
      seoDescription: attrs.seoDescription,
    });
    console.log(`  ✓ ${attrs.name}`);
  }
}

async function migrateArticles() {
  console.log('Migrating articles...');
  const { data } = await fetchStrapi('articles');

  for (const article of data) {
    const attrs = article.attributes;
    await createPayload('articles', {
      slug: attrs.slug,
      title: attrs.title,
      subtitle: attrs.subtitle,
      previewText: attrs.previewText,
      body: attrs.body,
      readingTimeMinutes: attrs.readingTimeMinutes,
      tags: attrs.tags?.map((t: string) => ({ tag: t })),
      seoTitle: attrs.seoTitle,
      seoDescription: attrs.seoDescription,
    });
    console.log(`  ✓ ${attrs.title}`);
  }
}

async function migrateDealers() {
  console.log('Migrating dealers...');
  const { data } = await fetchStrapi('dealers');

  for (const dealer of data) {
    const attrs = dealer.attributes;
    await createPayload('dealers', {
      name: attrs.name,
      type: attrs.type,
      city: attrs.city,
      address: attrs.address,
      latitude: attrs.latitude,
      longitude: attrs.longitude,
      phone: attrs.phone,
      email: attrs.email,
      website: attrs.website,
      workingHours: attrs.workingHours,
      services: attrs.services,
    });
    console.log(`  ✓ ${attrs.name}`);
  }
}

async function main() {
  console.log('Starting migration...\n');

  await migrateTyres();
  await migrateArticles();
  await migrateDealers();
  // Add other collections...

  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
```

#### 5.2 Run Migration

```bash
# 1. Start both services
cd backend && npm run develop &       # Strapi on 1337
cd backend-payload && npm run dev &   # Payload on 3001

# 2. Create first admin user in Payload
open http://localhost:3001/admin

# 3. Run migration
npx tsx scripts/migrate-strapi-to-payload.ts
```

---

### Phase 6: Testing & Cleanup (2-3 hours)

#### 6.1 Test Checklist

- [ ] Payload admin panel works
- [ ] All collections visible and editable
- [ ] API endpoints return correct data
- [ ] Frontend loads data from Payload
- [ ] Content automation works with Payload
- [ ] Cron job scheduled
- [ ] Telegram notifications work

#### 6.2 Update Scripts

```json
// package.json (root)
{
  "scripts": {
    "dev:backend": "cd backend-payload && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
  }
}
```

#### 6.3 Update run scripts

```bash
# Update run_backend.sh
# Change from Strapi to Payload
```

#### 6.4 Cleanup

```bash
# After successful migration:
# 1. Archive old Strapi backend
mv backend backend-strapi-archived

# 2. Rename new backend
mv backend-payload backend

# 3. Remove content-automation (now part of backend)
rm -rf backend-strapi-archived/content-automation

# 4. Update .gitignore
```

---

## Summary

| Phase | Tasks | Time |
|-------|-------|------|
| 1. Project Setup | Create Payload, configure | 2-3 hours |
| 2. Collections | Migrate schemas | 3-4 hours |
| 3. Automation | Integrate content-automation | 2-3 hours |
| 4. Frontend | Update API layer | 2-3 hours |
| 5. Data Migration | Move content | 1-2 hours |
| 6. Testing | Verify, cleanup | 2-3 hours |
| **Total** | | **~2 days** |

---

## Benefits After Migration

1. **One service** instead of two (Strapi + content-automation)
2. **One language** (TypeScript everywhere)
3. **Better admin panel** with custom components
4. **Hooks & endpoints** for custom logic
5. **Built-in versioning** for content
6. **Better TypeScript types** auto-generated
7. **Easier deployment** (one process)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Data loss | Backup Strapi DB before migration |
| Downtime | Do migration in dev, deploy when ready |
| Learning curve | Payload docs are excellent |
| Missing features | Payload is feature-rich, likely covered |

---

## Next Steps

1. Approve this plan
2. Backup current Strapi data
3. Start Phase 1: Create Payload project
4. Proceed through phases
5. Test thoroughly
6. Deploy

Ready to start?
