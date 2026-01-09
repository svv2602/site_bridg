import 'dotenv/config';
import express, { Request, Response } from 'express';
import { getPayload, Payload } from 'payload';
import { initScheduler } from './automation/jobs/scheduler';
import config from '../payload.config';

const app = express();
const PORT = process.env.PORT || 3001;

// Parse JSON bodies
app.use(express.json());

let payload: Payload;

const start = async () => {
  // Initialize Payload
  payload = await getPayload({ config });

  // ===== REST API Routes using Payload Local API =====

  // Tyres API
  app.get('/api/tyres', async (req: Request, res: Response) => {
    try {
      const { page = '1', limit = '10', season, vehicleType } = req.query;
      const where: Record<string, unknown> = {};

      if (season) where.season = { equals: season };
      if (vehicleType) where.vehicleTypes = { contains: vehicleType };

      const result = await payload.find({
        collection: 'tyres',
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        where,
      });

      res.json({
        data: result.docs,
        meta: {
          pagination: {
            page: result.page,
            pageSize: result.limit,
            pageCount: result.totalPages,
            total: result.totalDocs,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching tyres:', error);
      res.status(500).json({ error: 'Failed to fetch tyres' });
    }
  });

  app.get('/api/tyres/:slug', async (req: Request, res: Response) => {
    try {
      const result = await payload.find({
        collection: 'tyres',
        where: { slug: { equals: req.params.slug } },
        limit: 1,
      });

      if (result.docs.length === 0) {
        res.status(404).json({ error: 'Tyre not found' });
        return;
      }

      res.json({ data: result.docs[0] });
    } catch (error) {
      console.error('Error fetching tyre:', error);
      res.status(500).json({ error: 'Failed to fetch tyre' });
    }
  });

  // Articles API
  app.get('/api/articles', async (req: Request, res: Response) => {
    try {
      const { page = '1', limit = '10' } = req.query;

      const result = await payload.find({
        collection: 'articles',
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sort: '-publishedAt',
      });

      res.json({
        data: result.docs,
        meta: {
          pagination: {
            page: result.page,
            pageSize: result.limit,
            pageCount: result.totalPages,
            total: result.totalDocs,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  });

  app.get('/api/articles/:slug', async (req: Request, res: Response) => {
    try {
      const result = await payload.find({
        collection: 'articles',
        where: { slug: { equals: req.params.slug } },
        limit: 1,
      });

      if (result.docs.length === 0) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      res.json({ data: result.docs[0] });
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  });

  // Dealers API
  app.get('/api/dealers', async (req: Request, res: Response) => {
    try {
      const { city, type, limit = '100' } = req.query;
      const where: Record<string, unknown> = {};

      if (city) where.city = { equals: city };
      if (type) where.type = { equals: type };

      const result = await payload.find({
        collection: 'dealers',
        limit: parseInt(limit as string),
        where,
      });

      res.json({
        data: result.docs,
        meta: {
          pagination: {
            total: result.totalDocs,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching dealers:', error);
      res.status(500).json({ error: 'Failed to fetch dealers' });
    }
  });

  // Technologies API
  app.get('/api/technologies', async (req: Request, res: Response) => {
    try {
      const result = await payload.find({
        collection: 'technologies',
        limit: 100,
      });

      res.json({
        data: result.docs,
        meta: {
          pagination: {
            total: result.totalDocs,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching technologies:', error);
      res.status(500).json({ error: 'Failed to fetch technologies' });
    }
  });

  app.get('/api/technologies/:slug', async (req: Request, res: Response) => {
    try {
      const result = await payload.find({
        collection: 'technologies',
        where: { slug: { equals: req.params.slug } },
        limit: 1,
      });

      if (result.docs.length === 0) {
        res.status(404).json({ error: 'Technology not found' });
        return;
      }

      res.json({ data: result.docs[0] });
    } catch (error) {
      console.error('Error fetching technology:', error);
      res.status(500).json({ error: 'Failed to fetch technology' });
    }
  });

  // Vehicle Fitments API
  app.get('/api/vehicle-fitments', async (req: Request, res: Response) => {
    try {
      const { make, model, year } = req.query;
      const where: Record<string, unknown> = {};

      if (make) where.make = { equals: make };
      if (model) where.model = { equals: model };
      if (year) where.year = { equals: parseInt(year as string) };

      const result = await payload.find({
        collection: 'vehicle-fitments',
        where,
        limit: 100,
      });

      res.json({
        data: result.docs,
        meta: {
          pagination: {
            total: result.totalDocs,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching vehicle fitments:', error);
      res.status(500).json({ error: 'Failed to fetch vehicle fitments' });
    }
  });

  // Get unique makes
  app.get('/api/vehicle-fitments/makes', async (req: Request, res: Response) => {
    try {
      const result = await payload.find({
        collection: 'vehicle-fitments',
        limit: 1000,
      });

      const makes = [...new Set(result.docs.map((doc: { make: string }) => doc.make))].sort();
      res.json({ data: makes });
    } catch (error) {
      console.error('Error fetching makes:', error);
      res.status(500).json({ error: 'Failed to fetch makes' });
    }
  });

  // Get models for a make
  app.get('/api/vehicle-fitments/models', async (req: Request, res: Response) => {
    try {
      const { make } = req.query;

      const result = await payload.find({
        collection: 'vehicle-fitments',
        where: make ? { make: { equals: make } } : {},
        limit: 1000,
      });

      const models = [...new Set(result.docs.map((doc: { model: string }) => doc.model))].sort();
      res.json({ data: models });
    } catch (error) {
      console.error('Error fetching models:', error);
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  });

  // ===== Custom Automation API Routes =====

  app.get('/api/automation/status', (req: Request, res: Response) => {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(3, 0, 0, 0);

    res.json({
      status: 'running',
      nextRun: nextSunday.toISOString(),
      timezone: 'Europe/Kyiv',
    });
  });

  app.post('/api/automation/run', (req: Request, res: Response) => {
    const { type } = req.body;
    res.json({ success: true, message: `Started ${type || 'full'} automation` });
  });

  app.get('/api/automation/stats', (req: Request, res: Response) => {
    res.json({
      tiresProcessed: 0,
      articlesCreated: 0,
      badgesAssigned: 0,
      totalCost: 0,
      errorCount: 0,
      lastRun: null,
    });
  });

  // Seasonal content API
  app.get('/api/seasonal', (req: Request, res: Response) => {
    const month = new Date().getMonth() + 1;

    let season: 'spring' | 'autumn' | 'default' = 'default';
    if (month >= 3 && month <= 4) season = 'spring';
    if (month >= 10 && month <= 11) season = 'autumn';

    const seasonConfig = {
      spring: {
        heroTitle: 'Час переходити на літні шини',
        heroSubtitle: 'Температура стабільно вище +7°C — оптимальний час для заміни',
        featuredSeason: 'summer',
        gradient: 'from-orange-500 to-yellow-500',
        ctaText: 'Переглянути літні шини',
        ctaLink: '/passenger-tyres?season=summer',
      },
      autumn: {
        heroTitle: 'Готуйтесь до зими завчасно',
        heroSubtitle: 'Перші заморозки вже близько — оберіть надійні зимові шини',
        featuredSeason: 'winter',
        gradient: 'from-blue-500 to-cyan-400',
        ctaText: 'Переглянути зимові шини',
        ctaLink: '/passenger-tyres?season=winter',
      },
      default: {
        heroTitle: 'Шини Bridgestone',
        heroSubtitle: 'Офіційний представник в Україні',
        featuredSeason: null,
        gradient: 'from-zinc-800 to-zinc-900',
        ctaText: 'Переглянути каталог',
        ctaLink: '/passenger-tyres',
      },
    };

    res.json(seasonConfig[season]);
  });

  // Redirect root to Admin panel
  app.get('/', (_, res) => {
    res.redirect('/admin');
  });

  // Note: Payload Admin UI is not available in standalone Express mode
  // For admin access, use Next.js integration or Payload's built-in server
  app.get('/admin', (_, res) => {
    res.send(`
      <html>
        <head><title>Bridgestone CMS</title></head>
        <body style="font-family: system-ui; padding: 40px; max-width: 600px; margin: 0 auto;">
          <h1>🚧 Admin Panel</h1>
          <p>Payload Admin UI requires Next.js integration.</p>
          <p>For now, use the REST API directly:</p>
          <ul>
            <li><a href="/api/tyres">/api/tyres</a> - List tyres</li>
            <li><a href="/api/articles">/api/articles</a> - List articles</li>
            <li><a href="/api/dealers">/api/dealers</a> - List dealers</li>
            <li><a href="/api/technologies">/api/technologies</a> - List technologies</li>
            <li><a href="/api/vehicle-fitments">/api/vehicle-fitments</a> - Vehicle fitments</li>
            <li><a href="/api/seasonal">/api/seasonal</a> - Seasonal content</li>
            <li><a href="/api/automation/status">/api/automation/status</a> - Automation status</li>
          </ul>
        </body>
      </html>
    `);
  });

  // Initialize scheduler for cron jobs
  initScheduler();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🔧 Automation API: http://localhost:${PORT}/api/automation/status\n`);
  });
};

start().catch(console.error);
