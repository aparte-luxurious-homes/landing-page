import { permanentRedirect, notFound } from "next/navigation";

import { getProperty } from "@/lib/links/api";

/**
 * Aparte Link checkout — aparte.ng/{slug}/book.
 *
 * Was a second, parallel booking form. The property page it hung off now
 * redirects into the main site, so this one follows: guests book through the
 * booking sidebar on the real property page, which is the flow that gets
 * exercised, fixed and tested every day.
 *
 * Keeping two checkouts alive meant two places for a payment bug to live, and
 * only one of them was ever looked at.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LinkBookRedirect({ params }: PageProps) {
  const { slug } = await params;
  const property = await getProperty(slug).catch(() => null);

  if (!property?.id) notFound();

  permanentRedirect(`/property-details/${property.id}`);
}
