import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server output for the Docker image (Render now, Azure later).
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Room for a 2 MB CSV or Excel upload plus form overhead (src/lib/a3/excel.ts).
    serverActions: { bodySizeLimit: "3mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
