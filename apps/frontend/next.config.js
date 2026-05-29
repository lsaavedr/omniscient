/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@production-orders/types'],
  output: 'standalone',
};

module.exports = nextConfig;
