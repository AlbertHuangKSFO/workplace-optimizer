import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',

  async rewrites() {
    // 在Docker环境中使用容器名，在本地开发中使用localhost
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    return [
      {
        source: '/api/:path*', // Matches any path starting with /api/
        destination: `${backendUrl}/api/:path*`, // Proxies to the backend service
      },
    ];
  },
};

export default nextConfig;
