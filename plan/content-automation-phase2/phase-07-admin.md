# Phase 7: Admin & Management

## Status
- [ ] Not Started
- [ ] In Progress
- [ ] Completed

**Started:** -
**Completed:** -

## Goal

Create admin dashboard for monitoring and controlling content automation system.

## Prerequisites

- Phase 5-6 completed
- Content automation running with metrics
- Authentication system (or basic auth)

---

## Tasks

### 7.1 Create Admin Dashboard Page

- [ ] Create `frontend/src/app/admin/automation/page.tsx`
- [ ] Create dashboard layout with stats cards
- [ ] Add recent jobs list
- [ ] Add manual trigger buttons
- [ ] Add simple charts (optional)

**Files:**
- `frontend/src/app/admin/automation/page.tsx` (new)
- `frontend/src/app/admin/automation/layout.tsx` (new)
- `frontend/src/lib/api/automation.ts` (new)
- `frontend/src/components/admin/` (new directory)

**API for Dashboard:**
```typescript
// frontend/src/lib/api/automation.ts

export interface AutomationStats {
  tiresProcessed: number;
  articlesCreated: number;
  badgesAssigned: number;
  totalCost: number;
  errorCount: number;
  lastRun: string | null;
  nextRun: string;
}

export interface JobRecord {
  id: string;
  type: 'full' | 'scrape' | 'generate' | 'publish';
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  completedAt: string | null;
  itemsProcessed: number;
  errors: string[];
}

const AUTOMATION_API = process.env.NEXT_PUBLIC_AUTOMATION_API || 'http://localhost:3001';

export async function getAutomationStats(): Promise<AutomationStats> {
  const response = await fetch(`${AUTOMATION_API}/api/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function getRecentJobs(limit = 10): Promise<JobRecord[]> {
  const response = await fetch(`${AUTOMATION_API}/api/jobs?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch jobs');
  return response.json();
}

export async function triggerAutomation(type: 'full' | 'scrape' | 'generate'): Promise<void> {
  const response = await fetch(`${AUTOMATION_API}/api/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  });
  if (!response.ok) throw new Error('Failed to trigger automation');
}
```

**Dashboard Page:**
```tsx
// frontend/src/app/admin/automation/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Package,
  Trophy,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Play
} from 'lucide-react';

interface Stats {
  tiresProcessed: number;
  articlesCreated: number;
  badgesAssigned: number;
  totalCost: number;
  errorCount: number;
  lastRun: string | null;
  nextRun: string;
}

interface Job {
  id: string;
  type: string;
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  completedAt: string | null;
  itemsProcessed: number;
}

export default function AutomationDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // In production, fetch from API
      // For now, use mock data
      setStats({
        tiresProcessed: 12,
        articlesCreated: 5,
        badgesAssigned: 8,
        totalCost: 8.50,
        errorCount: 0,
        lastRun: '2026-01-08T03:00:00Z',
        nextRun: '2026-01-15T03:00:00Z'
      });

      setJobs([
        {
          id: '1',
          type: 'full',
          status: 'success',
          startedAt: '2026-01-08T03:00:00Z',
          completedAt: '2026-01-08T03:15:00Z',
          itemsProcessed: 15
        },
        {
          id: '2',
          type: 'scrape',
          status: 'success',
          startedAt: '2026-01-07T14:30:00Z',
          completedAt: '2026-01-07T14:32:00Z',
          itemsProcessed: 3
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTrigger(type: 'full' | 'scrape' | 'generate') {
    setTriggering(true);
    try {
      // await triggerAutomation(type);
      alert(`Запущено: ${type}`);
    } catch (error) {
      alert('Помилка запуску');
    } finally {
      setTriggering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Content Automation</h1>
        <button
          onClick={() => fetchData()}
          className="p-2 rounded-lg hover:bg-muted"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard
          icon={<Package className="h-6 w-6" />}
          label="Шин оброблено"
          value={stats?.tiresProcessed || 0}
          color="blue"
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label="Статей створено"
          value={stats?.articlesCreated || 0}
          color="green"
        />
        <StatCard
          icon={<Trophy className="h-6 w-6" />}
          label="Badges додано"
          value={stats?.badgesAssigned || 0}
          color="amber"
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6" />}
          label="Витрати"
          value={`$${stats?.totalCost.toFixed(2) || '0.00'}`}
          color="purple"
        />
        <StatCard
          icon={<AlertCircle className="h-6 w-6" />}
          label="Помилок"
          value={stats?.errorCount || 0}
          color={stats?.errorCount ? 'red' : 'gray'}
        />
      </div>

      {/* Schedule Info */}
      <div className="bg-card border border-border rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Останній запуск</div>
            <div className="font-medium">
              {stats?.lastRun ? new Date(stats.lastRun).toLocaleString('uk-UA') : 'Ніколи'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Наступний запуск</div>
            <div className="font-medium">
              {stats?.nextRun ? new Date(stats.nextRun).toLocaleString('uk-UA') : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => handleTrigger('full')}
          disabled={triggering}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          Повний цикл
        </button>
        <button
          onClick={() => handleTrigger('scrape')}
          disabled={triggering}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
        >
          Тільки скрапінг
        </button>
        <button
          onClick={() => handleTrigger('generate')}
          disabled={triggering}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
        >
          Тільки генерація
        </button>
      </div>

      {/* Recent Jobs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Останні запуски</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Тип</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Статус</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Час</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Оброблено</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-border">
                  <td className="px-4 py-3 text-sm">{job.type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(job.startedAt).toLocaleString('uk-UA')}
                  </td>
                  <td className="px-4 py-3 text-sm">{job.itemsProcessed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    amber: 'bg-amber-500/10 text-amber-500',
    purple: 'bg-purple-500/10 text-purple-500',
    red: 'bg-red-500/10 text-red-500',
    gray: 'bg-zinc-500/10 text-zinc-500'
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    running: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  };

  const labels: Record<string, string> = {
    success: 'Успішно',
    failed: 'Помилка',
    running: 'Виконується'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
```

**Verification:**
- [ ] Dashboard page renders
- [ ] Stats cards show data
- [ ] Jobs list displays
- [ ] Trigger buttons work

---

### 7.2 Add Authentication to Admin Pages

- [ ] Choose auth method (Basic Auth / Strapi session / NextAuth)
- [ ] Create middleware for `/admin/*` routes
- [ ] Add login page if needed
- [ ] Protect API routes

**Option A: Basic HTTP Auth (simplest)**

```typescript
// frontend/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"'
      }
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  // Check credentials (use env vars in production)
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'bridgestone2026';

  if (username !== validUsername || password !== validPassword) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"'
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
};
```

**Option B: Strapi Session Check**

```typescript
// frontend/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Check for Strapi JWT in cookie
  const token = request.cookies.get('strapi_jwt')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Optionally verify token with Strapi
  try {
    const response = await fetch(`${process.env.STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}
```

**Add to .env.local:**
```env
# Admin credentials (for Basic Auth)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

**Verification:**
- [ ] Admin pages require authentication
- [ ] Invalid credentials rejected
- [ ] Valid credentials grant access
- [ ] Session persists appropriately

---

### 7.3 Create Backend API for Dashboard

- [ ] Add Express server or API routes to content-automation
- [ ] Create `/api/stats` endpoint
- [ ] Create `/api/jobs` endpoint
- [ ] Create `/api/trigger` endpoint
- [ ] Add CORS for frontend access

**Files:**
- `backend/content-automation/src/api/server.ts` (new)
- `backend/content-automation/src/api/routes.ts` (new)

**Simple Express API:**
```typescript
// backend/content-automation/src/api/server.ts
import express from 'express';
import cors from 'cors';
import { getMetricsSummary, getRecentJobs } from '../utils/metrics';
import { runWeeklyAutomation, runScrapeOnly } from '../scheduler';
import { logger } from '../utils/logger';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getMetricsSummary(30);
    res.json(stats);
  } catch (error) {
    logger.error('Stats API error', { error });
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Jobs endpoint
app.get('/api/jobs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const jobs = await getRecentJobs(limit);
    res.json(jobs);
  } catch (error) {
    logger.error('Jobs API error', { error });
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Trigger endpoint
app.post('/api/trigger', async (req, res) => {
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

    res.json({ success: true, message: `Started ${type} automation` });
  } catch (error) {
    logger.error('Trigger API error', { error });
    res.status(500).json({ error: 'Failed to trigger' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export function startApiServer(): void {
  app.listen(PORT, () => {
    logger.info(`API server running on port ${PORT}`);
  });
}
```

**Install dependencies:**
```bash
npm install express cors
npm install -D @types/express @types/cors
```

**Verification:**
- [ ] API server starts
- [ ] `/api/stats` returns data
- [ ] `/api/jobs` returns jobs list
- [ ] `/api/trigger` starts automation

---

## Completion Checklist

Before marking this phase complete:

1. [ ] All 3 tasks completed
2. [ ] Dashboard displays stats and jobs
3. [ ] Authentication works
4. [ ] API endpoints respond correctly
5. [ ] Manual triggers work from dashboard
6. [ ] Commit changes:
   ```bash
   git add .
   git commit -m "feat(admin): add automation dashboard

   - Add admin dashboard at /admin/automation
   - Add authentication middleware
   - Add backend API for stats and triggers"
   ```
7. [ ] Update PROGRESS.md
