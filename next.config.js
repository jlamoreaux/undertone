/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: [],
  },

  // Turbopack is used by default with --turbopack flag
  // No webpack configuration needed since we're using Turbopack
  experimental: {
    // Turbopack specific config can go here if needed
  },

  // Server Actions are enabled by default in Next.js 15
  // experimental: {} // No longer needed for serverActions

  // Enable source maps in production
  productionBrowserSourceMaps: true,

  // Configure page extensions
  pageExtensions: ["tsx", "ts", "jsx", "js"],

  // Configure headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Configure rewrites for API routes if needed
  async rewrites() {
    return [
      // Example rewrite:
      // {
      //   source: "/api/:path*",
      //   destination: "https://your-api-url.com/:path*",
      // },
    ];
  },
};

module.exports = nextConfig;
