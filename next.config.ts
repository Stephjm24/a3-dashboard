import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Next.js streams page data in small inline scripts, so script-src needs
// 'unsafe-inline' unless every page is rendered per request with a nonce
// (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md).
// Everything else is limited to this site: no external scripts, frames,
// plugins or form targets.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Browsers only act on this over HTTPS, so it is harmless on http://localhost.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  // Invite links carry a sign-in token in the address: never send it to another site.
  { key: "Referrer-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Do not advertise the framework in an X-Powered-By header.
  poweredByHeader: false,
  // Keep source code out of the browser in production builds (the default, stated on purpose).
  productionBrowserSourceMaps: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
