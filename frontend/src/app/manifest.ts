import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bridgestone Україна',
    short_name: 'Bridgestone',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#e30613',
    icons: [
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
