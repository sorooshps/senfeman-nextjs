/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      // اگر از دامنه دیگر استفاده می‌کنید
      {
        protocol: 'https',
        hostname: 'your-domain.com',
        pathname: '/**',
      },
    ],
    // یا به صورت ساده‌تر (برای development):
    unoptimized: true, // اگر می‌خواهید optimization غیرفعال شود
  },
};

module.exports = nextConfig;