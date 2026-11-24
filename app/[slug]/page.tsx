import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import { BlogArticlePage, generateArticleMetadata } from "@/components/blog/BlogArticlePage";
import { getProperty } from "@/lib/links/api";

/**
 * aparte.ng/{slug} — shared by two kinds of page:
 *
 * 1. Aparte Link property slugs (checked FIRST). Every link already shared
 *    on WhatsApp, in a bio or printed on a QR code must keep resolving, so a
 *    property always wins if a blog article happens to use the same slug.
 * 2. Blog articles (src/components/blog/BlogArticlePage.tsx). Anything that
 *    is not a property is looked up as an article, and a slug that is
 *    neither is a real 404.
 *
 * Static segments still win in Next's matcher, so /about, /help, /login and
 * /blog are unaffected — which also means an article whose slug equals one of
 * those top-level routes cannot be reached at the root.
 *
 * Property links used to render their own booking page here: a second
 * property UI that did not look or behave like Aparte. They now redirect to
 * the real property page, /property-details/[id], which produces its own
 * server-side title, OG tags and LodgingBusiness JSON-LD, so an unfurler
 * following the redirect gets richer metadata than this page had.
 *
 * 308, not 302: the destination is permanent and search engines should
 * consolidate onto it rather than keep indexing both.
 */

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Redirect to the property page if `slug` is an Aparte Link property.
 * Returns normally otherwise. Called from generateMetadata too, so the
 * redirect is a real 308 rather than a meta refresh after a streamed 200.
 */
async function redirectIfProperty(
  slug: string,
  searchParams: PageProps["searchParams"],
): Promise<void> {
  // A failed lookup is treated as "not a property" so the article can still
  // render; an API outage then 404s at worst, same as before.
  const property = await getProperty(slug).catch(() => null);
  if (!property?.id) return;

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

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await redirectIfProperty(slug, searchParams);
  return generateArticleMetadata(slug);
}

export default async function SlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  await redirectIfProperty(slug, searchParams);
  return <BlogArticlePage slug={slug} />;
}
