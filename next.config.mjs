/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['your-domain.com']
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['@radix-ui/react-icons'],
    serverActions: {
      bodySizeLimit: '10mb',
      timeout: 60000, // 60秒に統一
    }
  },
  serverExternalPackages: ['@anthropic-ai/sdk', 'bullmq'],
  typescript: {
    ignoreBuildErrors: true
  },
  serverRuntimeConfig: {
    maxDuration: 60  // 60秒（整合性を保つ）
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ]
      }
    ];
  }
};

export default nextConfig;