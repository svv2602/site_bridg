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
} from './src/collections';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Bridgestone Ukraine',
    },
    importMap: {
      baseDir: path.resolve(dirname),
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
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  db: postgresAdapter({
    pool: {
      host: 'localhost',
      port: 5433,
      user: 'snisar',
      password: 'bridgestone123',
      database: 'bridgestone',
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Localization ready for future
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
  // CORS for frontend
  cors: [
    'http://localhost:3000',
    'http://localhost:3010',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  // Upload config
  upload: {
    limits: {
      fileSize: 10000000, // 10MB
    },
  },
});
