import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
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
} from './src/endpoints/contentGeneration';
import {
  providersSeedEndpoint,
  providersStatusEndpoint,
  providersToggleEndpoint,
  providersUpdateModelEndpoint,
  taskRoutingUpdateEndpoint,
} from './src/endpoints/providerManagement';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
  ],
  endpoints: [
    removeBackgroundsEndpoint,
    removeBackgroundsStatusEndpoint,
    contentGenerateEndpoint,
    contentJobStatusEndpoint,
    contentScrapeEndpoint,
    contentImportEndpoint,
    contentJobsListEndpoint,
    providersSeedEndpoint,
    providersStatusEndpoint,
    providersToggleEndpoint,
    providersUpdateModelEndpoint,
    taskRoutingUpdateEndpoint,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || 'postgresql://snisar:bridgestone123@localhost:5433/bridgestone',
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
  cors: [
    'http://localhost:3000',
    'http://localhost:3010',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  upload: {
    limits: {
      fileSize: 10000000,
    },
  },
});
