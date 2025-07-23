import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Abaikan TypeScript error saat build
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Abaikan ESLint error saat build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
