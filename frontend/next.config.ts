import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1337',
        pathname: '/uploads/**',
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
