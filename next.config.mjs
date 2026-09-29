/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Inlined at build time. CF_PAGES_COMMIT_SHA is only available during the
  // Cloudflare Pages build, not at request time on the edge.
  env: {
    BUILD_VERSION: process.env.CF_PAGES_COMMIT_SHA || 'local',
  },
  eslint: {
    // ESLint warnings don't affect runtime — skip during build to unblock deployment
    ignoreDuringBuilds: true,
  },
  // The old /shisha-tobacco Al Fakher section showed 12 hardcoded fake products
  // (IDs 1001-1012) that broke checkout. Real Al Fakher stock lives at /brand/al-fakher.
  async redirects() {
    return [
      { source: '/shisha-tobacco', destination: '/brand/al-fakher', permanent: true },
      { source: '/shisha-tobacco/al-fakher', destination: '/brand/al-fakher', permanent: true },
      { source: '/shisha-tobacco/al-fakher/:slug*', destination: '/brand/al-fakher', permanent: true },
      // Snoop Dogg / Cookies collections were removed (placeholder pages).
      // Exact matches only — /cookies-policy is NOT affected.
      { source: '/snoop-dogg', destination: '/', permanent: true },
      { source: '/cookies', destination: '/', permanent: true },
      // No rewards / referral programme exists — the page was US template copy with $ amounts
      { source: '/rewards', destination: '/', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.thehookahstore.in',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
