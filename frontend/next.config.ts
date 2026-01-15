import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment

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
      {
        source: '/advice',
        destination: '/blog',
        permanent: true, // 301 redirect
      },
      {
        source: '/advice/:slug',
        destination: '/blog/:slug',
        permanent: true, // 301 redirect
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
    // Skip image optimization for localhost in development
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
