import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',

  // 允许特定域名的跨域请求 (Next.js 15+ 新特性)
  experimental: {
    allowedDevOrigins: ['office.mrerhuang.com', 'localhost:3000'],
  },

  async rewrites() {
    // 在Docker环境中，服务器端重写使用容器名
    // 在本地开发中使用localhost
    const isDocker = process.env.DOCKER_ENV === 'true';
    const backendUrl = isDocker ? 'http://backend:8000' : 'http://localhost:8000';

    console.log(`[Next.js Rewrites] Docker mode: ${isDocker}, Backend URL: ${backendUrl}`);

    return [
      {
        source: '/api/:path*', // Matches any path starting with /api/
        destination: `${backendUrl}/api/:path*`, // Proxies to the backend service
      },
    ];
  },
};

export default nextConfig;
