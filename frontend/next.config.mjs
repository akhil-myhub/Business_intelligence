const isProd = process.env.NODE_ENV === 'production';

// Prod CSP. 'unsafe-inline' for script/style is required by Next's inline bootstrap and styled output
// unless you adopt nonces; everything else is locked to same-origin (fonts are self-hosted via next/font,
// the 3D environment lighting is generated locally, map data is served from /geo).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-src https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ...(isProd
    ? [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Content-Security-Policy', value: csp }
      ]
    : [])
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { qualities: [75, 95] }, // 95 is used for the hero artwork
  compress: true,
  productionBrowserSourceMaps: false,
  output: 'standalone', // minimal self-contained server for containers
  distDir: process.env.NEXT_DIST_DIR || '.next', // lets CI/verification builds avoid clobbering a running dev server
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Map data and images are versioned by filename on deploy; cache hard, revalidate in the background.
      { source: '/geo/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
      { source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] }
    ];
  }
};

export default nextConfig;
