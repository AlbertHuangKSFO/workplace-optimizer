import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Matches any path starting with /api/
        destination: 'http://backend:8000/api/:path*', // Proxies to the backend service
      },
    ];
  },
};

export default nextConfig;
