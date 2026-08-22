import type { NextConfig } from "next";

/**
 * Aparte landing page — Next.js App Router.
 *
 * Aparte Link catalog pages are published as `aparte.ng/@handle`, but Next
 * cannot have an "@" folder segment, so the public shape is rewritten onto
 * internal /catalog/* routes. The URL the visitor (and the QR code) sees keeps
 * the @.
 *
 * Property pages live at the root as `/[slug]`. Static segments always win in
 * Next's matcher, so /about, /help, /login etc. are unaffected — and the
 * backend's reserved-slug list (services/links/reserved.py) blocks anyone from
 * claiming those words as a property slug in the first place.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * Aparte Link catalog pages are published as aparte.ng/@handle, but Next
   * cannot have an "@" folder segment, so the public shape is rewritten onto
   * internal /catalog/* routes. The URL the visitor — and any printed QR
   * code — sees keeps the @.
   */
  async rewrites() {
    return [
      { source: "/@:handle", destination: "/catalog/:handle" },
      { source: "/@:handle/:slug", destination: "/catalog/:handle/:slug" },
    ];
  },

  async redirects() {
    return [
      // Legacy path kept for old links/bookmarks (was a client <Navigate>).
      {
        source: "/apartment/:id",
        destination: "/property-details/:id",
        permanent: true,
      },
    ];
  },

  /**
   * Security headers the live-site audit flagged as absent. CSP is left out
   * deliberately — the payment SDKs (Monnify/Paystack inline JS), GTM/GA and
   * the maps embeds need a full asset inventory before a policy can ship
   * without breaking checkout. HSTS preload is also omitted: submitting to
   * the preload list is a hard-to-reverse commitment to make separately.
   */
  async headers() {
    return [
      /**
       * Staging must never be indexed. Two hosts are matched: the stable
       * stg.aparte.ng alias and Vercel's per-deployment *.vercel.app preview
       * URLs, which are publicly reachable and get discovered through shared
       * links even though nothing links to them.
       *
       * This is a `has: host` rule rather than an env check on purpose: a
       * preview build and a production build are the same artifact here, so
       * keying on the request host is what actually distinguishes them. It
       * also means production can never accidentally inherit the noindex.
       *
       * X-Robots-Tag beats a robots.txt Disallow for this job. Disallow stops
       * a crawl but not indexing, so a staging URL someone shared can still
       * surface as a bare result; noindex removes it from the index outright.
       */
      ...["stg.aparte.ng", "(?<sub>.*)\.vercel\.app"].map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      })),
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.builder.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  eslint: {
    // Lint is run separately; a lint error shouldn't block a deploy mid-migration.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
