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
  ProviderSettings,
  TaskRouting,
  Reviews,
} from './src/collections';
import {
  removeBackgroundsEndpoint,
  removeBackgroundsStatusEndpoint,
} from './src/endpoints/removeBackgrounds';
import {
  contentGenerateEndpoint,
  contentJobStatusEndpoint,
  contentScrapeEndpoint,
  contentImportEndpoint,
  contentJobsListEndpoint,
  contentRegenerateEndpoint,
  contentPublishEndpoint,
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
  generateReviewsEndpoint,
  generateReviewsStatusEndpoint,
  reviewStatsEndpoint,
} from './src/endpoints/reviewGeneration';
import {
  healthEndpoint,
  readinessEndpoint,
  livenessEndpoint,
} from './src/endpoints/health';

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
    ProviderSettings,
    TaskRouting,
    Reviews,
  ],
  endpoints: [
    removeBackgroundsEndpoint,
    removeBackgroundsStatusEndpoint,
    contentGenerateEndpoint,
    contentJobStatusEndpoint,
    contentScrapeEndpoint,
    contentImportEndpoint,
    contentJobsListEndpoint,
    contentRegenerateEndpoint,
    contentPublishEndpoint,
    providersSeedEndpoint,
    providersStatusEndpoint,
    providersToggleEndpoint,
    providersUpdateModelEndpoint,
    taskRoutingUpdateEndpoint,
    generatePromptEndpoint,
    regenerateImageStatusEndpoint,
    regenerateImageEndpoint,
    generateReviewsEndpoint,
    generateReviewsStatusEndpoint,
    reviewStatsEndpoint,
    // Health checks
    healthEndpoint,
    readinessEndpoint,
    livenessEndpoint,
  ],
  editor: lexicalEditor(),
  // Secret must be set via PAYLOAD_SECRET env variable (min 32 chars in production)
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-not-for-production',
  db: postgresAdapter({
    pool: {
      // DATABASE_URI must be set via environment variable in production
      connectionString: process.env.DATABASE_URI || 'postgresql://bridgestone:bridgestone@localhost:5433/bridgestone',
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
});
