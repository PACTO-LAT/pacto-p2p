import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'static.wikia.nocookie.net' },
      {
        protocol: 'https',
        hostname: (() => {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          try {
            return url ? new URL(url).hostname : 'localhost';
          } catch {
            return 'localhost';
          }
        })(),
      },
    ],
  },
};

export default nextConfig;
