import { ImageResponse } from "next/og";

import { SITE_DESCRIPTION, SITE_DEFAULT_TITLE } from "@/lib/seo/config";

/**
 * Default Open Graph card, generated at request time with next/og.
 *
 * Every route that doesn't declare its own og:image (home, about, help, FAQ,
 * legal pages, search) falls back to this. It replaces the missing
 * /og-default.png binary the old config pointed at. A generated card can't go
 * stale or get lost in a deploy, and rebranding is a constants change.
 *
 * Property and catalog pages are unaffected: their generateMetadata sets
 * explicit API-sourced images, which take precedence over this file.
 */

export const runtime = "edge";

export const alt = SITE_DEFAULT_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #01515f 0%, #028090 55%, #05a3b5 100%)",
          color: "#ffffff",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255,255,255,0.14)",
              border: "2px solid rgba(255,255,255,0.35)",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ marginLeft: 24, fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
            Aparte
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -1.5,
              maxWidth: 980,
            }}
          >
            What you booked is what you get.
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              lineHeight: 1.4,
              maxWidth: 900,
              color: "rgba(255,255,255,0.88)",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            fontFamily: "Helvetica, Arial, sans-serif",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          <div>aparte.ng</div>
          <div>Verified listings · Instant booking · NGN pricing</div>
        </div>
      </div>
    ),
    size
  );
}
