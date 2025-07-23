import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ PENTING: Config untuk serve static files
  images: {
    unoptimized: true,
    domains: ["localhost", "radjaautocar.com"], // ganti dengan domain Anda
  },

  // ✅ Serve uploads folder
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/uploads/:path*",
      },
    ];
  },

  // ✅ Headers untuk static files
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
