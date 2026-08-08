import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { organizationSchema } from "@/lib/seo/schema";
import { toJsonLd } from "@/lib/seo/jsonLd";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  THEME_COLOR,
} from "@/lib/seo/config";
import Providers from "./providers";

import "@/index.css";
import "@/App.css";
import "react-toastify/dist/ReactToastify.css";

const DEFAULT_TITLE =
  "Aparte — Luxury Short-Stay Apartments & Homes in Nigeria";

/**
 * Site-wide defaults, ported from the old index.html <head>.
 *
 * These now render server-side for every route, so the react-helmet-async
 * `data-rh` replace-on-hydrate trick is no longer needed — pages override
 * per-route values via their own `metadata` / `generateMetadata`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  manifest: "/site.webmanifest",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: DEFAULT_OG_IMAGE }],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Registered-entity structured data in the server HTML, so AI answer
            engines and social unfurlers that don't execute JS still see the
            legal entity. Same @id as the client-side node, so consumers merge
            rather than seeing a duplicate organisation. */}
        <script
          type="application/ld+json"
          // Content is hardcoded brand constants, and toJsonLd neutralises
          // </script> breakout regardless of upstream content.
          dangerouslySetInnerHTML={{ __html: toJsonLd(organizationSchema()) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>

        {/*
          Swiper's custom elements are used by carousels across several
          routes, so it stays global — but lazily, unlike the blocking
          <script> it replaced in index.html.

          The Monnify and Paystack SDKs are NOT here: they now load only on
          routes that can take a payment (see components/PaymentScripts).
          Loading them globally cost every route, including /terms, and made
          Paystack's inline.js complain about the missing checkout form.
        */}
        <Script
          src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-element-bundle.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
