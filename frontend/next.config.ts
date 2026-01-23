import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment
  outputFileTracingRoot: path.join(__dirname), // Silence multiple lockfiles warning

  // Security and cache headers
  async headers() {
    return [
      {
        // Security headers for all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          // HSTS - УВІМКНУТИ ТІЛЬКИ НА PRODUCTION З HTTPS
          // Розкоментувати на production після налаштування SSL:
          // {
          //   key: 'Strict-Transport-Security',
          //   value: 'max-age=31536000; includeSubDomains; preload',
          // },
        ],
      },
      {
        // Static images - cache for 1 year (immutable)
        source: '/:path*.(svg|jpg|jpeg|png|webp|avif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Fonts - cache for 1 year
        source: '/:path*.(woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // JS/CSS chunks - cache for 1 year (hashed filenames)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects from old URLs to new ones (SEO-friendly 301)
  async redirects() {
    return [
      // Legacy blog URL redirects
      {
        source: '/advice',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/advice/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      // Ukrainian URL aliases (for users typing Ukrainian URLs)
      {
        source: '/pro-nas',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/kontakty',
        destination: '/contacts',
        permanent: true,
      },
      {
        source: '/polityka-konfidentsiynosti',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/umovy-vykorystannya',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/porady',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/porady/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/dilery',
        destination: '/dealers',
        permanent: true,
      },
      {
        source: '/vidhuky',
        destination: '/reviews',
        permanent: true,
      },
      {
        source: '/tekhnolohiyi',
        destination: '/technology',
        permanent: true,
      },
    ];
  },

  images: {
    // Enable AVIF (best compression) + WebP as fallback
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/media/**',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '3001',
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: 's7d1.scene7.com',
        pathname: '/is/image/**',
      },
      {
        protocol: 'https',
        hostname: 'prokoleso.ua',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'images.simpletire.com',
        pathname: '/images/**',
      },
    ],
    // Skip image optimization in Docker (localhost resolves to private IP)
    // In production with proper domain, set this to false
    unoptimized: process.env.NODE_ENV === 'development' || process.env.SKIP_IMAGE_OPTIMIZATION === 'true',
  },
};

// Wrap with Sentry (only if DSN is configured)
export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in production with auth token
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps to Sentry for better stack traces
  widenClientFileUpload: true,

  // Source maps config - hide from end users but upload to Sentry
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Disable logger instrumentation (reduces bundle size)
  disableLogger: true,

  // Automatically instrument Next.js data fetching
  automaticVercelMonitors: true,
});
