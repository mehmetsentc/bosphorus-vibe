/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  experimental: {
    // Tree-shake large packages — reduces JS bundle sent to browser
    optimizePackageImports: ["framer-motion", "firebase/app", "firebase/firestore", "firebase/storage", "firebase/auth"],

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
    deviceSizes: [390, 430, 768, 1080, 1200],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 604800, // 7 days
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  async headers() {
    return [
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
