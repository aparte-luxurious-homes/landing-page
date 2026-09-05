import { permanentRedirect, notFound } from "next/navigation";

import { getProperty } from "@/lib/links/api";

/**
 * Aparte Link property page — aparte.ng/{slug}.
 *
 * This used to render its own booking page: a second property UI, with its own
 * layout, its own card styles and its own checkout, sitting outside the rest
 * of the site. Two designs for one thing is twice the surface to keep correct,
 * and it showed — a shared link dropped you somewhere that did not look or
 * behave like Aparte.
 *
 * It now redirects to the real property page. The slug keeps working, so every
 * link already shared on WhatsApp, in a bio or printed on a QR code still
 * resolves; it just lands somewhere that has the full UI, the live booking
 * sidebar and the reviews.
 *
 * Link previews survive the hop: /property-details/[id] produces its own
 * server-side title, description, OG tags and LodgingBusiness JSON-LD, so an
 * unfurler following the redirect gets richer metadata than this page had. That
 * was the one thing worth checking before collapsing the two, since the preview
 * is most of what a shared link is for.
 *
 * 308, not 302: the destination is permanent and search engines should
 * consolidate onto it rather than keep indexing both.
 *
 * Still a root-level catch-all, and static segments still win in Next's
 * matcher, so /about, /help and /login are unaffected.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LinkPropertyRedirect({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const property = await getProperty(slug).catch(() => null);

  if (!property?.id) notFound();

  // Carry the query string through. `rs` is the referral-source marker that
  // QR codes and shared links append, and dropping it here would silently
  // break attribution on exactly the traffic these links exist to bring in.
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
  }
  const query = qs.toString();

  permanentRedirect(`/property-details/${property.id}${query ? `?${query}` : ""}`);
}
