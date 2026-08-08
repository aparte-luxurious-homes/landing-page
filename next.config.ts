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
