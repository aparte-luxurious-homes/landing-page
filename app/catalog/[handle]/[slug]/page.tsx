import { permanentRedirect, notFound } from "next/navigation";

import { getPropertyInCatalogContext } from "@/lib/links/api";

/**
 * Property viewed through someone's catalog link — aparte.ng/@{handle}/{slug}.
 *
 * Redirects to the real property page, same as the plain /{slug} route. The
 * separate Aparte Link property UI is gone: one property page, one design, one
 * booking flow to keep correct.
 *
 * The sharer's referral code rides along as `rs`, which is what the beacon used
 * to seed into the session here. Attribution therefore survives the hop —
 * dropping it would break referral credit on precisely the traffic a shared
 * catalog exists to generate.
 */

interface PageProps {
  params: Promise<{ handle: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPropertyRedirect({ params, searchParams }: PageProps) {
  const { handle, slug } = await params;
  const property = await getPropertyInCatalogContext(handle, slug).catch(() => null);

  if (!property?.id) notFound();

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
  }
  // Preserve whoever shared it, unless the link already carries its own source.
  if (!qs.has("rs")) qs.set("rs", `@${handle}`);

  permanentRedirect(`/property-details/${property.id}?${qs.toString()}`);
}
