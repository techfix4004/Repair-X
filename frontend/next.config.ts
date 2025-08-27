import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [], // Add packages if you use any server-side modules
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily disable TypeScript errors during build
  },
  // (Add further production-ready config here as needed)
};

export default nextConfig;
