import { ImageResponse } from "next/og";

import { API_BASE } from "@/lib/links/api";
import type { PublicCatalog } from "@/lib/links/types";

/**
 * The card a host's page unfurls as when its link is dropped into WhatsApp,
 * which is where most of these links are dropped.
 *
 * Composed at request time: avatar, name, what and where they let, and up
 * to three of their listing photos. Before this the og:image was the raw
 * avatar URL, which WhatsApp cropped into a stretched face at 1200×630 —
 * or nothing at all when the host had no photo. Any failure falls back to
 * the site's generic card rather than a broken image.
 */

export const runtime = "edge";
export const alt = "Host on Aparte";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEAL = "#028090";
const INK = "#0d1b1e";

/**
 * Fonts for the card: Fraunces for the name (the page's display face) and
 * Inter for everything else. Satori renders only fonts it is handed, and
 * only TTF/OTF/WOFF, so the CSS is requested with a legacy user agent, which
 * makes Google Fonts answer with TTF URLs. A font that fails to load is
 * simply left out — the card renders in whatever is available rather than
 * failing.
 */
const LEGACY_UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
      { headers: { "User-Agent": LEGACY_UA }, next: { revalidate: 86400 } }
    ).then((r) => (r.ok ? r.text() : ""));
    const url = css.match(/src: url\((https:[^)]+\.ttf)\)/)?.[1];
    if (!url) return null;
    const font = await fetch(url, { next: { revalidate: 86400 } });
    return font.ok ? font.arrayBuffer() : null;
  } catch {
    return null;
  }
}

async function loadFonts() {
  const [fraunces, inter] = await Promise.all([
    loadGoogleFont("Fraunces", 600),
    loadGoogleFont("Inter", 500),
  ]);
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 500 | 600 | 700; style: "normal" }[] = [];
  if (fraunces) fonts.push({ name: "Fraunces", data: fraunces, weight: 600, style: "normal" });
  if (inter) fonts.push({ name: "Inter", data: inter, weight: 500, style: "normal" });
  return fonts;
}

function Check() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** "Lekki, Abuja and Ajah". */
function joinPlaces(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

async function loadCatalog(handle: string): Promise<PublicCatalog | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/public/catalogs/${encodeURIComponent(handle)}?per_page=1`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    return (await res.json()).data as PublicCatalog;
  } catch {
    return null;
  }
}

function Fallback() {
  return (
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
      <div style={{ fontSize: 44, fontWeight: 700 }}>Aparte</div>
      <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.15, maxWidth: 900 }}>
        Verified short-lets. What you booked is what you get.
      </div>
      <div style={{ fontSize: 26, fontFamily: "Helvetica, Arial, sans-serif" }}>aparte.ng</div>
    </div>
  );
}

export default async function OpenGraphImage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [catalog, fonts] = await Promise.all([loadCatalog(handle), loadFonts()]);
  if (!catalog) return new ImageResponse(<Fallback />, { ...size, fonts });

  const count = catalog.stats.properties_listed;
  const places = catalog.cities.slice(0, 3).map((c) => c.name);
  const line = `${count} verified short-let${count === 1 ? "" : "s"}${
    places.length ? ` in ${joinPlaces(places)}` : ""
  }`;
  const photos = (catalog.cover_image ? [catalog.cover_image, ...catalog.cover_mosaic] : catalog.cover_mosaic)
    .filter((u, i, all) => all.indexOf(u) === i)
    .slice(0, 3);
  const initials = catalog.display_name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          color: INK,
          fontFamily: "Inter, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Left: who they are */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: photos.length ? 720 : 1200,
            padding: "64px 56px 56px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 128,
                height: 128,
                borderRadius: 64,
                overflow: "hidden",
                background: "#e6f1f3",
                border: `4px solid ${TEAL}`,
                color: TEAL,
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: 52,
                fontWeight: 600,
              }}
            >
              {catalog.profile_image ? (
                <img
                  src={catalog.profile_image}
                  alt=""
                  width={128}
                  height={128}
                  style={{ objectFit: "cover", width: 128, height: 128 }}
                />
              ) : (
                initials || "A"
              )}
            </div>
            {catalog.is_verified && (
              <div
                style={{
                  display: "flex",
                  marginLeft: 24,
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "#e6f1f3",
                  color: TEAL,
                  fontSize: 24,
                  fontWeight: 700,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Check />
                Verified host
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: 64,
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: -1,
              }}
            >
              {catalog.display_name}
            </div>
            <div style={{ marginTop: 20, fontSize: 30, lineHeight: 1.35, color: "#3f4f52", fontWeight: 500 }}>
              {line}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24,
              color: "#3f4f52",
            }}
          >
            <div style={{ display: "flex", color: TEAL, fontWeight: 700 }}>aparte.ng/@{catalog.handle}</div>
            <div>Payment held until check-in</div>
          </div>
        </div>

        {/* Right: what they let */}
        {photos.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 480,
              height: 630,
              gap: 6,
              background: "#01515f",
            }}
          >
            {photos.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                style={{
                  width: 480,
                  height: photos.length === 1 ? 630 : photos.length === 2 ? 312 : 206,
                  objectFit: "cover",
                }}
              />
            ))}
          </div>
        )}
      </div>
    ),
    { ...size, fonts }
  );
}
