const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  compiler: isProd
    ? { removeConsole: { exclude: ["error", "warn"] } }
    : undefined,

  experimental: {
    // Client router cache — faster back/forward and prefetched navigations (Pro CDN friendly)
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
    // Tree-shake large packages — reduces JS bundle sent to browser
    optimizePackageImports: [
      "framer-motion",
      "firebase/app",
      "firebase/firestore",
      "firebase/storage",
      "firebase/auth",
      "@vercel/analytics",
      "@vercel/speed-insights",
    ],

    serverComponentsExternalPackages: [
      "firebase-admin",
      "firebase",
      "@google-cloud/firestore",
      "google-gax",
      "@grpc/grpc-js",
      "@grpc/proto-loader",
      "protobufjs",
    ],
    turbo: {
      resolveAlias: {
        fs: "./src/lib/empty-module.js",
        net: "./src/lib/empty-module.js",
        tls: "./src/lib/empty-module.js",
        child_process: "./src/lib/empty-module.js",
      },
    },
  },

  images: {
    // AVIF is ~50% smaller than WebP, ~80% smaller than JPEG — big bandwidth saving
    formats: ["image/avif", "image/webp"],
    // Vercel Pro: more generous image optimization limits
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 604800, // 7 days — matches Vercel Pro image cache
    dangerouslyAllowSVG: false,
    deviceSizes: [390, 430, 640, 768, 1080, 1200, 1920],
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  async headers() {
    const longCache = "public, max-age=31536000, immutable";
    return [
      {
        source: "/icon-:size(192|512).png",
        headers: [{ key: "Cache-Control", value: longCache }],
      },
      {
        source: "/apple-icon.png",
        headers: [{ key: "Cache-Control", value: longCache }],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
