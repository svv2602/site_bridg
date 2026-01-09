# Фаза 4: Admin Dashboard

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Створити admin dashboard для моніторингу та керування content automation системою.

## Передумови
- Backend API endpoints вже існують (`/api/automation/stats`, `/api/automation/run`)
- Phase 3 завершена (Telegram + Cron)

---

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути існуючі API endpoints в backend-payload
- [ ] Вивчити патерни сторінок в frontend
- [ ] Перевірити чи є middleware в Next.js

**Команди для пошуку:**
```bash
# Backend API routes
ls backend-payload/src/app/api/automation/

# Existing API implementation
cat backend-payload/src/app/api/automation/stats/route.ts

# Frontend pages structure
ls frontend/src/app/
```

#### B. Аналіз залежностей
- [ ] Чи потрібен окремий API route в frontend для proxy?
- [ ] Який метод аутентифікації використати?

**Варіанти аутентифікації:**
1. Basic HTTP Auth (найпростіший)
2. Payload CMS auth (якщо є сесія)
3. NextAuth.js (enterprise)

**Рекомендація:** Basic HTTP Auth через middleware

#### C. Перевірка дизайну
- [ ] Dashboard layout з stats cards
- [ ] Таблиця recent jobs
- [ ] Кнопки для manual triggers

**Референс:** Material Dashboard, Vercel Dashboard

---

### 4.1 Створити Admin Layout та Middleware

- [ ] Створити `frontend/src/app/admin/layout.tsx`
- [ ] Створити або оновити `frontend/src/middleware.ts` для auth
- [ ] Додати environment variables для credentials

**Файли:**
- `frontend/src/app/admin/layout.tsx`
- `frontend/src/middleware.ts`
- `frontend/.env.local`

**middleware.ts:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' }
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'bridgestone2026';

  if (username !== validUsername || password !== validPassword) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
};
```

**.env.local:**
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

---

### 4.2 Створити Dashboard Page

- [ ] Створити `frontend/src/app/admin/automation/page.tsx`
- [ ] Додати stats cards (tyres, articles, badges, cost, errors)
- [ ] Додати schedule info (last run, next run)
- [ ] Додати action buttons (Full cycle, Scrape only, Generate only)

**Файли:** `frontend/src/app/admin/automation/page.tsx`

**Stats Cards:**
```tsx
const stats = [
  { icon: Package, label: 'Шин оброблено', value: 12, color: 'blue' },
  { icon: FileText, label: 'Статей створено', value: 5, color: 'green' },
  { icon: Trophy, label: 'Badges додано', value: 8, color: 'amber' },
  { icon: DollarSign, label: 'Витрати', value: '$8.50', color: 'purple' },
  { icon: AlertCircle, label: 'Помилок', value: 0, color: 'gray' },
];
```

**Action Buttons:**
- "Повний цикл" → POST /api/automation/run { type: 'full' }
- "Тільки скрапінг" → POST /api/automation/run { type: 'scrape' }
- "Тільки генерація" → POST /api/automation/run { type: 'generate' }

---

### 4.3 Створити Jobs Table

- [ ] Додати таблицю recent jobs в dashboard
- [ ] Показувати: тип, статус, час, кількість оброблених
- [ ] Додати status badges (success/failed/running)

**Файли:** `frontend/src/app/admin/automation/page.tsx`

**Job Interface:**
```typescript
interface Job {
  id: string;
  type: 'full' | 'scrape' | 'generate' | 'publish';
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  completedAt: string | null;
  itemsProcessed: number;
  errors: string[];
}
```

**Status Badge colors:**
- success: `bg-green-100 text-green-800`
- failed: `bg-red-100 text-red-800`
- running: `bg-blue-100 text-blue-800`

---

### 4.4 Підключити до Backend API

- [ ] Створити `frontend/src/lib/api/automation.ts` для API клієнта
- [ ] Реалізувати getAutomationStats()
- [ ] Реалізувати getRecentJobs()
- [ ] Реалізувати triggerAutomation()
- [ ] Інтегрувати з dashboard page

**Файли:** `frontend/src/lib/api/automation.ts`

**API Client:**
```typescript
const AUTOMATION_API = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';

export async function getAutomationStats(): Promise<AutomationStats> {
  const response = await fetch(`${AUTOMATION_API}/api/automation/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function triggerAutomation(type: 'full' | 'scrape' | 'generate'): Promise<void> {
  const response = await fetch(`${AUTOMATION_API}/api/automation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  });
  if (!response.ok) throw new Error('Failed to trigger');
}
```

---

## Верифікація

- [ ] /admin/automation доступний тільки з аутентифікацією
- [ ] Stats cards показують дані
- [ ] Jobs table рендериться
- [ ] Action buttons trigger API calls
- [ ] Refresh button оновлює дані
- [ ] Responsive design працює

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(admin): add automation dashboard

   - Add admin dashboard at /admin/automation
   - Add Basic HTTP Auth middleware
   - Add stats cards, jobs table, action buttons
   - Add automation API client"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 5
   - Загальний прогрес: 18/24
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
