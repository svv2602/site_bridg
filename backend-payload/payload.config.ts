import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  Users,
  Media,
  Tyres,
  Articles,
  Dealers,
  Technologies,
  VehicleFitments,
  ContactSubmissions,
  SeasonalContent,
  HolidayBanners,
  ProviderSettings,
  TaskRouting,
  Reviews,
  CategoryPages,
  Notifications,
} from './src/collections';
import AuditLog from './src/collections/AuditLog';
import { SiteSettings } from './src/globals';
import {
  removeBackgroundsEndpoint,
  removeBackgroundsStatusEndpoint,
  removeBackgroundsBatchEndpoint,
  removeBackgroundsBatchStatusEndpoint,
} from './src/endpoints/removeBackgrounds';
import {
  contentGenerateEndpoint,
  contentJobStatusEndpoint,
  contentScrapeEndpoint,
  contentImportEndpoint,
  contentJobsListEndpoint,
  contentRegenerateEndpoint,
  contentPublishEndpoint,
  contentFullPipelineEndpoint,
  contentSmartPipelineEndpoint,
  contentGenerateArticleEndpoint,
} from './src/endpoints/contentGeneration';
import {
  providersSeedEndpoint,
  providersStatusEndpoint,
  providersToggleEndpoint,
  providersUpdateModelEndpoint,
  taskRoutingUpdateEndpoint,
} from './src/endpoints/providerManagement';
import {
  regenerateImageEndpoint,
  regenerateImageStatusEndpoint,
  generatePromptEndpoint,
} from './src/endpoints/imageRegeneration';
import {
  batchHeroesEndpoint,
  batchHeroesListEndpoint,
} from './src/endpoints/heroImageRegeneration';
import {
  generateReviewsEndpoint,
  generateReviewsStatusEndpoint,
  reviewStatsEndpoint,
  generateReviewsBatchEndpoint,
  generateReviewsBatchStatusEndpoint,
  reviewBulkStatsEndpoint,
} from './src/endpoints/reviewGeneration';
import {
  automationStatsEndpoint,
  automationStatusEndpoint,
  automationSchedulerEndpoint,
  automationSourcesEndpoint,
  automationSourcesUpdateEndpoint,
  automationQueueEndpoint,
  automationQueueUpdateEndpoint,
  automationArticleSettingsEndpoint,
  automationArticleSettingsUpdateEndpoint,
} from './src/endpoints/automation';
import {
  healthEndpoint,
  readinessEndpoint,
  livenessEndpoint,
} from './src/endpoints/health';
import {
  notificationCountEndpoint,
  notificationMarkReadEndpoint,
  notificationMarkAllReadEndpoint,
} from './src/endpoints/notifications';
import { initScheduler } from './src/scheduler';
import { initSentry } from './src/lib/sentry';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Security: Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32) {
    throw new Error('PAYLOAD_SECRET must be at least 32 characters in production');
  }
  if (!process.env.DATABASE_URI) {
    throw new Error('DATABASE_URI environment variable is required in production');
  }
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Bridgestone Ukraine',
      description: 'Система управління контентом Bridgestone Україна',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['/src/components/Dashboard'],
      beforeNavLinks: ['/src/components/DashboardNavLink#DashboardNavLink'],
      actions: ['/src/components/NotificationBell#NotificationBell'],
    },
    theme: 'dark',
    avatar: 'gravatar',
    dateFormat: 'dd.MM.yyyy HH:mm',
    suppressHydrationWarning: true,
  },
  collections: [
    Users,
    Media,
    Tyres,
    Articles,
    Dealers,
    Technologies,
    VehicleFitments,
    ContactSubmissions,
    SeasonalContent,
    HolidayBanners,
    ProviderSettings,
    TaskRouting,
    Reviews,
    CategoryPages,
    AuditLog,
    Notifications,
  ],
  globals: [SiteSettings],
  endpoints: [
    removeBackgroundsEndpoint,
    removeBackgroundsStatusEndpoint,
    removeBackgroundsBatchEndpoint,
    removeBackgroundsBatchStatusEndpoint,
    contentGenerateEndpoint,
    contentJobStatusEndpoint,
    contentScrapeEndpoint,
    contentImportEndpoint,
    contentJobsListEndpoint,
    contentRegenerateEndpoint,
    contentPublishEndpoint,
    contentFullPipelineEndpoint,
    contentSmartPipelineEndpoint,
    contentGenerateArticleEndpoint,
    providersSeedEndpoint,
    providersStatusEndpoint,
    providersToggleEndpoint,
    providersUpdateModelEndpoint,
    taskRoutingUpdateEndpoint,
    generatePromptEndpoint,
    // batch-heroes must be before :id route to avoid /image-regeneration/:id capturing "batch-heroes"
    batchHeroesEndpoint,
    batchHeroesListEndpoint,
    regenerateImageStatusEndpoint,
    regenerateImageEndpoint,
    generateReviewsBatchEndpoint,
    generateReviewsBatchStatusEndpoint,
    reviewBulkStatsEndpoint,
    generateReviewsEndpoint,
    generateReviewsStatusEndpoint,
    reviewStatsEndpoint,
    // Automation metrics & scheduler
    automationStatsEndpoint,
    automationStatusEndpoint,
    automationSchedulerEndpoint,
    // Smart article pipeline
    automationSourcesEndpoint,
    automationSourcesUpdateEndpoint,
    automationQueueEndpoint,
    automationQueueUpdateEndpoint,
    automationArticleSettingsEndpoint,
    automationArticleSettingsUpdateEndpoint,
    // Notifications
    notificationCountEndpoint,
    notificationMarkReadEndpoint,
    notificationMarkAllReadEndpoint,
    // Health checks
    healthEndpoint,
    readinessEndpoint,
    livenessEndpoint,
  ],
  editor: lexicalEditor(),
  // Secret must be set via PAYLOAD_SECRET env variable (min 32 chars in production)
  // In production, the guard at line 80 ensures PAYLOAD_SECRET is set and ≥32 chars
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-change-me-in-production-min-32-chars',
  db: postgresAdapter({
    pool: {
      // DATABASE_URI must be set via environment variable in production
      connectionString: process.env.DATABASE_URI || 'postgresql://bridgestone:bridgestone@localhost:5434/bridgestone',
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [
      {
        code: 'uk',
        label: 'Українська',
      },
    ],
    defaultLocale: 'uk',
    fallback: true,
  },
  // CORS: In production, only allow configured origins
  cors: [
    // Development origins (excluded in production if FRONTEND_URL is set)
    ...(process.env.NODE_ENV !== 'production' || !process.env.FRONTEND_URL
      ? ['http://localhost:3000', 'http://localhost:3010']
      : []),
    // Production frontend URL
    process.env.FRONTEND_URL || '',
    // Payload server URL (for admin panel)
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  upload: {
    limits: {
      fileSize: 10000000,
    },
    useTempFiles: true,
  },
  // Security: Cookie settings for production
  cookiePrefix: 'bridgestone',
  csrf: [], // Empty array enables CSRF protection for all origins
  sharp,
  onInit: async () => {
    initSentry();
    initScheduler();
  },
});
