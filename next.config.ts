// next.config.ts - IMPROVED FOR VPS DEPLOYMENT
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Disable TypeScript and ESLint errors during build for faster deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ IMPORTANT: Image configuration for VPS
  images: {
    unoptimized: true, // Important for VPS without image optimization
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**", // Allow any domain for flexibility
        pathname: "/api/uploads/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ✅ Static file serving configuration
  async rewrites() {
    return [
      // API uploads route
      {
        source: "/api/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
      // Direct static file access as fallback
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },

  // ✅ Headers for static files and CORS
  async headers() {
    return [
      {
        source: "/api/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, HEAD, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      // Security headers
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // ✅ Experimental features for better performance
  experimental: {
    // Enable if using app directory
    serverComponentsExternalPackages: ["mongoose", "bcryptjs"],
  },

  // ✅ Webpack configuration for better bundle size
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ignore node_modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Optimize bundle analyzer
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": require("path").resolve(__dirname, "src"),
    };

    return config;
  },

  // ✅ Output configuration for VPS deployment
  output: "standalone", // Important for VPS deployment with PM2

  // ✅ Compress responses
  compress: true,

  // ✅ Power by header
  poweredByHeader: false,

  // ✅ Generate ETags for better caching
  generateEtags: true,

  // ✅ Redirect trailing slashes
  trailingSlash: false,

  // ✅ Environment variables that are safe to expose to client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // ✅ Development configuration
  ...(process.env.NODE_ENV === "development" && {
    // Development-only config
    reactStrictMode: true,
  }),

  // ✅ Production optimizations
  ...(process.env.NODE_ENV === "production" && {
    // Production-only config
    swcMinify: true,
    compiler: {
      removeConsole: {
        exclude: ["error", "warn"], // Keep error and warn logs in production
      },
    },
  }),
};

export default nextConfig;
