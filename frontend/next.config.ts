import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [], // Add packages if you use any server-side modules
  // (Add further production-ready config here as needed)
};

export default nextConfig;
