/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: []
  }
};

module.exports = nextConfig;