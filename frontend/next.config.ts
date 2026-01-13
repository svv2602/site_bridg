import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment

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
